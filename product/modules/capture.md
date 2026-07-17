# Module: Capture

> Module 1 of 5. Spec follows `product/modules/TEMPLATE.md`. Terminology from `product/brief.md` §6 (canonical glossary). Objects defined in `product/object-model.md` §§3–5 (Capture, Channel, Household) — this spec adds behavior, never redefines schema. Screens referenced by stable IDs from `product/flows.md`.

## 1. Purpose

Capture exists to get every scary item into Molehill with near-zero user behavior, because the validated pain (`research/pain-points.md`, Cluster 4: Life Admin Avoidance & the ADHD Tax) is avoidance of *dealing*, not of paper — "Open the envelope you have to deal with the contents. Don't open the envelope nothing to deal with." Capture is the decoupling mechanism: the human's only sustained job is pointing a camera (or nothing at all, once automatic channels are connected), and the AI does the dealing downstream in Triage. Per Product Law #1 and the crown's key correction, **Snap is a convenience, never the sole trigger**: email forward-in, USPS Informed Delivery, the Mailroom virtual address, and partner Handoff all ship in month one, so the loop can start and restart with zero sustained user behavior. "Working" means: a six-week pile enters the system in under a minute of pointing; mail keeps flowing in while the user is dark; nothing captured is ever lost — not to a crash, not to airplane mode, not to the paywall, not to a lapse; and the capture act itself stays emotionally cheap enough to survive the "camera becomes the envelope" risk (brief §10.1, kill-test in Product Law #9).

This module contains **zero AI**. That is a design law, not an implementation detail (brief §9): the snap must never lag, fail, or wait on a model, because capture is the one behavior we ask the user to sustain.

## 2. User goals

- **I want to get the whole pile off my counter in one go, without opening anything,** so that the dread object is out of my life in under a minute.
- **I want mail to reach Molehill even when I'm not touching the app,** so that going dark for five weeks doesn't mean five weeks of unwatched deadlines.
- **I want to forward a scary email in two seconds and be done,** so that the inbox dread gets the same treatment as the paper dread.
- **I want my partner to be able to hand things to the agent instead of to me,** so that the agent carries the nag, never my spouse. (Sam's voice: "I want to give Molehill the school forms so I stop being the messenger.")
- **I want to know the snap worked and then hear nothing until there's something real,** so that capture never turns into a second inbox to manage.
- **I want my document photos handled like the sensitive things they are,** so that snapping a tax notice doesn't feel like uploading my life to the cloud. (Product Law #4.)
- **I want to dump a folder of scans from my desk,** so that the backlog living in my Downloads folder gets amnesty too.

## 3. Objects

Capture owns three objects (brief §5). Full schemas, field lists, and retention rows live in `product/object-model.md` §§3–5 and are not repeated; this table records ownership and what Capture adds behaviorally.

| Object | Ownership | What this module does with it |
|---|---|---|
| **Capture** (`cap_`) | **Owned by Capture** — source of truth | One raw ingestion event before triage. Created by every channel. Capture writes `kind`, `media_refs`, `source_meta`, `consent_retain_image`, `captured_by_user_id`, and drives status through `queued → uploading → received`; hands off at `received → triaging` to the Triage module, which owns the `triaging → triaged/failed` transitions. Capture owns `discarded` and all media-purge jobs. |
| **Channel** (`chn_`) | **Owned by Capture** — source of truth | A configured ingestion pathway: `snap`, `email_forward`, `informed_delivery`, `mailroom`, `handoff`. Capture owns the full lifecycle (`created → verifying → active → paused/erroring/disconnected → deleted`), address provisioning and burning, verification flows, and edge buffering. |
| **Household** (`hh_`) | **Owned by Capture** — source of truth | The consented dyad/group that makes Handoff work. Capture owns invites, membership, the `handoff` channel per member, the failover-enabled flag (consumed by Watchtower), and Invariant I-20 (household privacy) enforcement at the API layer. |
| Item (`itm_`) | Triage | Capture never creates Items. It creates Captures; Triage yields 0..n Items per Capture. Capture reads back Item counts to render "→ 2 items found" tiles on M-03/W-11. |
| Account (`acc_`) | Platform | Capture reads `item_quota_month` / `items_used_this_cycle` to render free-tier quota state. **Quota gates triage, never capture** (see §5, "Quota behavior"). Capture never increments the counter — Item creation does (Triage). |
| User (`usr_`) | Platform | Capture writes `last_capture_at` (drives lapse detection and billing auto-pause qualification) and reads `household_role` for Handoff provenance. |
| Notification (`ntf_`) | Watchtower | Capture never sends notifications directly. It emits events (`capture.triaged`, `channel.erroring`) that the deterministic scheduler may turn into at most a `channel_error` Notification (cap-respecting) — never a per-capture push. |

## 4. Lifecycle

### 4.1 Capture

Canonical state machine (object model §3): `queued → uploading → received → triaging → triaged | discarded | failed`.

| Stage | Who drives it | What the user sees |
|---|---|---|
| `queued` | Device (Snap/Handoff/bulk) or edge (email, USPS, Mailroom) | M-03 tile: "queued — uploads when online" if offline, else brief spinner. Automatic channels: nothing (silent by design). |
| `uploading` | Background upload worker (mobile: `URLSession` background session / Android `WorkManager`; web: resumable upload) | Per-tile progress on M-03 / per-row progress on W-11. |
| `received` | Server: media persisted to the encrypted processing bucket, or registered on-device for on-device mode | Tile flips to "reading…" the moment Triage picks it up. |
| `triaging → triaged` | **Triage module** (async, never blocks camera) | Tile resolves: "→ 2 items found" with tap-through to M-11. Zero-Item results say "blank page — nothing here" or "duplicate of one you already snapped." |
| `failed` | Triage after 3 retries | Degraded-AI framing, never blame: "Reading room is backed up; your snaps are safe and queued." Capture is preserved and auto re-queued. |
| `discarded` | User deletes an un-triaged capture from M-03 | Undo toast, 24h undo window, then media purge. |

**Retention (Product Law #4 / Invariant I-16 — load-bearing, verbatim from the object model):**
- **Mobile Snap:** original image stays **on-device** in the app sandbox. The server-side extraction copy is hard-deleted within **24 hours of `triaged`**. Confirmation (M-12) renders source regions against the on-device original.
- **Server-side channels** (email, Mailroom, Informed Delivery, web bulk upload): media held encrypted only until every consequential Extraction on its Items is confirmed or the Item archives — hard cap **30 days** — then hard-deleted, unless `consent_retain_image = true` for that specific document (per-document toggle on M-03/W-11, default **off**).
- Never used for model training. No exceptions. `media_refs` keys wiped at purge.
- On-device originals are additionally purged from the sandbox 90 days after their Item resolves, or immediately when the user discards/deletes — the phone is not an archive either, unless per-document consent says keep.

**What the user sees at each retention stage:** while media exists, source-region crops render normally in M-12/W-04; after purge, the region renders "source image deleted per your privacy settings" with confirmed text standing alone (it was human-verified; it remains trustworthy without the image).

### 4.2 Channel

Canonical state machine (object model §4): `created → verifying → active → paused | erroring → active | disconnected → deleted`.

Per-kind lifecycle specifics:

| Kind | Provisioned | Verification | Erroring causes | Disconnect behavior |
|---|---|---|---|---|
| `snap` | Auto at onboarding | None (camera permission is a device state, not channel state) | n/a (never errors — offline is a feature) | Cannot be disconnected; it's the app |
| `handoff` | Auto at onboarding; activates when Household goes active | None | n/a | Disables when Household archives; existing Items keep provenance |
| `email_forward` | Instantly at M-08: address minted as `pile-{4-char base32}@in.molehill.com` (e.g., `pile-x7f2@in.molehill.com`), collision-checked, never guessable-sequential | Verified sender list seeded with the account's sign-up email; additional sender addresses verified by a one-click confirmation email | Mail bounce (our MX down — pages on-call), sender-verification backlog | Address is **burned** — never reissued to any account, ever. Mail to a burned address gets a one-time bounce: "This Molehill address is closed. Nothing was read or stored." |
| `informed_delivery` | User initiates connect at M-08/W-10 | Two supported mechanisms, in preference order: **(a) account link** — user authenticates to USPS through our hosted link flow; we store only the link token in `external_ref` (never USPS credentials); **(b) digest routing fallback** — where account link is unavailable, the connect wizard walks the user through pointing their Informed Delivery daily-digest email at a dedicated per-user ingest address (`usps-{4-char}@in.molehill.com`); digest emails are parsed deterministically (they are templated HTML with one exterior image per mail piece). M-08 partial state covers the up-to-a-day USPS verification lag: "verifying — works within a day." | Token expiry, USPS digest format change (parser versioned; unknown format → `erroring`, raw digest held ≤ 7 days for reparse after parser update), USPS account password change | Token revoked server-side; ingest address burned |
| `mailroom` | Opt-in from M-08/W-10; address provisioned via our CMRA vendor as a real street address + PMB suite number | **USPS Form 1583 with online notarization** (identity verification is federal law for commercial mail receiving). The wizard embeds the vendor's notarization flow (~10 minutes, one government ID). Channel sits in `verifying` until the 1583 clears; then the address is live and shown with a copy button and a "who to give it to" starter list (DMV, city parking authority, IRS address-change form link). | Vendor outage, undeliverable piece, storage-limit warnings | Vendor account closed; USPS change-of-address guidance shown; physical mail arriving after disconnect is returned to sender by the vendor per CMRA rules |

**Mailroom operating policy (opinionated defaults, set at connect):**
- Default handling = **"open and scan everything"** (recommended, pre-selected). The alternative "ask me per piece" exists for the cautious but is explicitly discouraged in copy, because per-piece approval reintroduces the dealing: *"Recommended: we open and scan everything. Asking you piece-by-piece puts the envelope back in your hands — the thing we're here to take off them."*
- Exterior scan on arrival (always, automatic) → Capture kind `mailroom_scan` with exterior image; interior scan same business day under "open everything," creating a second page-set on the same Capture.
- Physical retention: vendor shreds 30 days after interior scan unless the user requests physical forwarding (flat vendor postage pass-through). **Checks, gift cards, and payment cards are never scanned-and-shredded:** the vendor flags them, Molehill notifies ("A check arrived at your Mailroom — want it forwarded?"), and forwarding is the only offered action. Molehill never deposits, holds, or moves money (Product Law #10).
- Mailroom is a paid add-on at a **flat +$8/month** (hard vendor-cost pass-through, disclosed on the M-08 card and W-10; fair-use 40 pieces/month, overage never billed silently — the channel pauses intake to forwarding-only and says so). Pricing mechanics and billing state live in the Ledger module; Capture owns the disclosure copy.

**Pause behavior (all server channels):** ingestion buffered at the edge for 7 days, then bounced with a polite auto-reply: "This Molehill inbox is paused. Nothing was read or stored. It reopens when {user} resumes it."

### 4.3 Household

Canonical state machine (object model §5): `created → inviting → active → archived`.

- Created when the account upgrades to the `household` plan (M-17/W-08). Max 4 members at launch; invites expire in 14 days ("expires in 14 days" shown on the pending row).
- A member's acceptance auto-creates their `handoff` channel and their own `snap` channel (members can snap into the shared account; provenance via `captured_by_user_id`).
- `failover_enabled` (default off) is set here, consumed by Watchtower's ladder (`partner_failover` ping at T-24h on deadline-critical Deadlines).
- Archived on plan downgrade or when all members but the owner leave: Handoff channel disables, existing Items keep provenance, archived Households hard-delete after 90 days.
- **Invariant I-20 is enforced in this module's API layer:** a member's read access to an Item they didn't capture returns status-line only ("1 item in custody, deadline watched") unless the confirming user explicitly shared it. Molehill never becomes the partner's surveillance tool.

## 5. Actions

### User-initiated

| # | Action | Trigger / screen | Preconditions | Effect | Feedback | Undo |
|---|---|---|---|---|---|---|
| A1 | **Snap** | Shutter on M-02 | Camera permission (else A15 fallback) | Photo written to app sandbox; Capture `queued` (kind `snap`); `last_capture_at` updated. Shutter-to-saved budget: **< 200 ms**; shutter re-armed immediately | Shutter click + batch counter chip increments ("3"). **No verdict, no extraction, no dollar figure appears in the camera** — see §7.8 | Discard from M-03 (24h undo) |
| A2 | **Pile mode (burst)** | "Pile mode" toggle on M-02; default-on when entered from M-10 | Same | Continuous capture: shutter repeats as fast as focus allows; no review between shots; auto-crop to document bounds (deterministic edge detection, on-device, no ML service call — a standard CV rectangle detector); multi-page grouping deferred to Triage | Live counter ("9 snapped"); haptic tick per shot | Per-capture discard in M-03 |
| A3 | **Import from library** | M-02 secondary | Photos permission | Selected images become Captures (kind `snap`); EXIF timestamps preserved in `source_meta` | Tiles appear in M-03 | Same as A1 |
| A4 | **Review queue / open result** | M-03 | ≥1 Capture | Read-only status; tap triaged tile → M-11 | Per-tile status | n/a |
| A5 | **Discard capture** | M-03 tile overflow | Capture not yet `triaged` | `→ discarded`; media purge after 24h undo window | Undo toast (10 s) + 24h recovery row | 24h undo |
| A6 | **Retake** | M-03 blur-flagged tile | — | Opens M-02 pre-linked; new Capture supersedes (old one auto-discards on new triaged result) | "Retake" chip on tile | Old capture recoverable 24h |
| A7 | **Toggle "keep source image"** | M-03 tile / W-11 row / M-20 list | Per document | Sets `consent_retain_image` (default off). Turning **off** later hard-deletes retained media within 24h | Toggle + one-line explanation: "Off: the image is deleted once you've confirmed the numbers. Your confirmed data stays." | Re-toggle only while media still exists |
| A8 | **Copy forward-in address** | M-08 card / W-10 | Channel exists | Clipboard copy | "Copied. Forward anything scary — attachments and all." | n/a |
| A9 | **Connect a channel** | M-08 / W-10 cards | Account active | Channel `created → verifying` per §4.2 | Per-card verifying spinner; per-kind completion copy (§6) | Disconnect any time |
| A10 | **Pause / resume channel** | W-10 | Channel active/paused | `active ↔ paused`; edge buffering per §4.2 | Card state change + what-happens-to-mail explainer | Resume flushes ≤7-day buffer |
| A11 | **Disconnect channel** | W-10 | Typed confirm for `mailroom` (physical-mail consequences) | `→ disconnected`; address burned; hard delete in 30 days | Consequence-first confirm: "Mail sent here after today is returned to sender. Nothing already captured is lost." | None (addresses never reissue) |
| A12 | **Invite household member** | M-17 / W-08 | Household plan | Invite email; pending row (expires 14 days) | "Invite sent. It expires in 14 days if unclaimed." | Revoke invite |
| A13 | **Handoff (snap or say)** | M-17 → M-02 with handoff flag | Household member | Capture kind `handoff`, `captured_by_user_id` = member; optional note field ("the forms are due Friday") → `source_meta.note`. **Note-only handoff is legal:** `media_refs` empty, the note text is the entire payload; Triage builds the Item from text | "Handed to Molehill. {Owner} gets it as a Move — you're out of the loop now." | Member can discard own un-triaged handoff |
| A14 | **Bulk upload** | W-11 dropzone | Web session | Each file → Capture kind `bulk_upload`. Accepted: JPEG/PNG/HEIC/WEBP/TIFF/PDF, ≤ 25 MB/file, ≤ 50 files/batch, multi-page PDFs kept as one Capture (`page_count` set) | Per-file progress → "N items found"; unsupported rows flagged, batch never all-or-nothing | Remove file pre-processing; discard post |
| A15 | **Camera-permission fallback** | M-02 error state | Permission denied | Inline path to OS settings + library-import fallback (A3) | "Molehill can't see the camera. Fix it in Settings — or import from your photos, which works right now." | n/a |

### System-initiated

| # | Action | Trigger | Effect |
|---|---|---|---|
| S1 | **Background upload + retry** | Connectivity regained / app background wake | Queued Captures upload oldest-first; exponential backoff (30 s → 1 h cap); never expires — a queued Capture uploads even weeks later |
| S2 | **Edge email accept** | Inbound mail to `pile-*@in.molehill.com` | SPF/DKIM/DMARC evaluated; sender on the verified list → Capture `received` (body rendered to PDF + attachments as pages); raw email deleted at the edge immediately after Capture creation (object model §4 retention). Unknown sender → S3. Accept budget: < 2 s |
| S3 | **Unknown-sender hold** | Email from unverified sender | Held unprocessed at edge, max 7 days; one verification email to the account owner: "Someone forwarded mail to your Molehill address from {sender}. Yours? One tap to accept — otherwise it's deleted in 7 days, unread." Accept → sender optionally added to verified list; ignore → deletion, nothing stored |
| S4 | **Informed Delivery ingest** | USPS digest arrival / daily link poll (07:00 local) | Each mail-piece exterior image → Capture kind `informed_delivery`; `source_meta` carries USPS piece ID + expected-delivery date. Exterior-only Captures are flagged `exterior_only: true` for Triage (sender-level signal, no contents) |
| S5 | **Mailroom scan ingest** | Vendor webhook | Exterior scan → Capture `received` (kind `mailroom_scan`); interior scan appended to the same Capture same business day under "open everything" |
| S6 | **Exact-duplicate drop** | `sha256` match against account's last 90 days at `received` | New Capture auto-`discarded` with reason `duplicate`; M-03/W-11 shows "already have this one" — silent for automatic channels |
| S7 | **Near-duplicate hint** | Perceptual hash (pHash, Hamming ≤ 8) or ID-piece heuristic (Informed Delivery exterior followed ≤ 10 days by a physical scan with matching sender block) | Capture proceeds but carries `probable_duplicate_of` hint in `source_meta`; **Triage** decides whether to merge into an existing Item (linking, not data loss) |
| S8 | **Blur flag** | On-device Laplacian-variance check at save (deterministic, no ML) | Below threshold → quality flag on the M-03 tile: "too blurry to read — retake, or leave it and I'll try anyway." **Never blocks the shutter** (M-02 partial state) |
| S9 | **Media purge jobs** | Clocked (hourly) | Enforce every retention row in §4.1: 24h post-triage snap copies, 30-day server-channel cap, discard purges, consent revocations |
| S10 | **Channel health check** | Clocked (daily) + webhook failures | `active → erroring` on 3 consecutive failures; emits `channel.erroring`; scheduler sends at most one cap-respecting `channel_error` Notification (object model §4) |
| S11 | **`last_capture_at` write** | Any Capture created with `captured_by_user_id` set | Feeds lapse detection and billing auto-pause qualification (BillingState `last_qualifying_activity_at`) |
| S12 | **Edge rate limiting** | Abuse guard | Forward-in: 200 emails/day/account, then defer (4xx) with retry-after; bulk upload: 500 files/day/account; Snap: unlimited, always |

### Quota behavior (free tier — binding)

Capture is **never** gated by the 5-Items/month free quota. Every channel accepts and safely stores Captures regardless of quota state; what the quota gates is *triage* (Item creation, owned by Triage/Ledger). When quota is exhausted, M-03/W-11 tiles hold at a calm state: **"Captured and safe. It'll be read when your month rolls over on the 12th — or now, if you upgrade."** Capture is never lost to the paywall (flows.md M-18 partial state). Legal-floor override: if a quota-held Capture later triages into an Eyes On class, it triages immediately regardless of quota — the legal-mail floor (Product Law #2) outranks the quota.

## 6. States

Screen states for M-02 (Snap Camera), M-03 (Snap Queue), M-08 (Onboarding Channels), M-10 (First Pile), M-17 (Household), W-10 (Channels), W-11 (Bulk Capture Upload) are specified in `product/flows.md` and are law; not repeated here. This section adds the module-level state rules and copy that those tables reference.

**Module-wide state law:**
- **offline** is a first-class success state for Snap, not an error: capture proceeds identically, tiles read "queued — uploads when online," and the camera never displays a connectivity warning while the shutter works.
- **degraded-AI** never touches this module's function: M-02 is *identical to ideal* ("capture has no AI dependency, ever" — flows.md), M-03/W-11 tiles hold at "safe and queued — reading room is catching up," with **no countdown pressure and no apology theater**.
- **error** states always state the data-loss guarantee explicitly: every capture-path error message ends with the fact that the capture is safe (see §10 for the full table).

**Component-level states (capture tile, used on M-03 and W-11):**

| Tile state | Visual | Copy |
|---|---|---|
| queued (online) | thumbnail + spinner | — |
| queued (offline) | thumbnail + cloud-off badge | "uploads when online" |
| uploading | progress ring | — |
| reading | pulse | "reading…" |
| triaged, N items | check + count | "→ 2 items found" |
| triaged, zero-item | neutral dash | "blank page — nothing here" / "duplicate of one you already snapped" |
| quota-held | pause badge | "captured and safe — reads when your month rolls over" |
| blurry | soft flag | "too blurry to read — retake, or leave it and I'll try anyway" |
| failed (pipeline) | queue badge | "safe and queued — reading room is catching up" |
| upload failed | retry badge | "upload hiccup — retrying. The original's on your phone; nothing's lost." |

**Channel card states (M-08 / W-10):** unconnected · verifying (per-kind copy: USPS "verifying — works within a day"; Mailroom "identity check in review — usually same day") · active (green, last-received timestamp: "last mail: Tuesday") · paused ("mail is buffered 7 days, then politely bounced") · erroring (repair CTA, §10) · disconnected (burned-address note).

**Tone rule for every state string in this module:** the accountant who says "here's what we can still recover," never the parent who asks why you waited. Concretely: no exclamation points, no "oops!", no urgency at capture time, no count of how long something sat, and every recovery path stated as a fact, not a plea.

## 7. Workflows

Numbered flows; screens from `product/flows.md`. F-01 (first-run onboarding + first pile) and F-06 (Household Handoff) are specified there and are law; C-flows below are Capture-internal detail and additions.

### C-01 Week-1 mail-pile onboarding (the first-session experience, expanding F-01 steps 4–10)

The week-1 job is to convert the six-week pile in one session and land the handover feeling — *"that's my problem now"* — without ever making the user open, sort, or even face the contents. Kill-test telemetry (Product Law #9: week-1 capture rate) starts at step 1.

1. **M-10** opens with one coaching card, three lines max: **"Grab the pile. Don't open anything. Just point."** Below it, smaller: "Closed envelopes are fine — the windows and return addresses carry plenty." Primary CTA starts M-02 in pile mode. Secondary: "I don't have a pile" → skip to M-01 with channels active (no shame, no follow-up question).
2. **M-02, pile mode:** burst shutter, live counter ("9 snapped"), haptic tick per shot. No preview review between shots. The user physically moves envelopes from pile to a "done" stack — the kinesthetic loop is the product moment; target under 5 seconds per piece.
3. Counter finishes; M-10 shows the handover line: **"That's my problem now. I'll have verdicts within the hour — first look tomorrow at 9am, or peek now."** The default path is *leave* — first-session success is measured by captures, not by confirmations. "Peek now" → M-03.
4. Async, Triage resolves tiles. If the user peeked: the "7 of these 11 require nothing from you" batch-accept moment (F-01 step 7) happens in Triage's surfaces; Capture's job ended at the tiles.
5. **The physical pile disposition card** (shown once, on M-03 after the first pile fully triages): "Keep the paper in one spot for two weeks while we confirm the numbers — a shoebox is fine. After that, anything marked done can go." Opinionated: we do NOT tell users to discard paper at capture time; confirmation (M-12) may need the original if a snap is unreadable, and the legal floor means some documents should physically persist.
6. Week-1 instrumentation (deterministic counters, no content): pile size (captures in first session), time-to-first-capture, session completion, day-2 and day-7 re-capture events, channel connections at M-08. These four numbers are the pre-registered kill-test inputs.

### C-02 Email forward-in (happy path + unknown sender)

1. U forwards a dreaded email (e.g., "FINAL NOTICE" from a utility) to `pile-x7f2@in.molehill.com`.
2. Edge validates SPF/DKIM/DMARC; sender is U's verified address → Capture `received` in < 2 s: body rendered to PDF, attachments appended as pages, headers into `source_meta`. Raw email deleted at the edge.
3. One quiet acknowledgment **by email reply only** (never a push — capture must not generate notification load): "Got it. I'll read it and it'll show up with a verdict — nothing else needed from you." Reply-to is a black hole address, stated in the footer.
4. Unknown-sender path: U's mother forwards a notice from her own address → S3 hold → owner gets the verification email → one tap accepts and offers "always accept from mom@…?" → Capture proceeds. Ignored 7 days → deleted unread, sender told nothing.
5. Spoof path: SPF/DKIM hard-fail → silently dropped at the edge (no Capture, no bounce — bounces confirm live addresses to spammers). Soft-fail → S3 hold flow.

### C-03 USPS Informed Delivery connect + daily ingestion

1. **M-08/W-10** card → connect wizard: try account link (mechanism (a), §4.2); if unavailable, wizard falls back to digest routing (mechanism (b)) with a copy-paste address and screenshots of the USPS settings page. Partial state honesty: "verifying — works within a day."
2. First digest arrives → Channel `verifying → active`; card shows "Connected. Your mail now reaches me before it reaches you."
3. Daily at USPS digest time, S4 creates one `informed_delivery` Capture per mail piece (exterior grayscale image, `exterior_only: true`).
4. Downstream (Triage's job, noted for the seam): exterior-only Captures get sender-level triage; when the matching physical piece later arrives via Snap or Mailroom (S7 heuristic), Triage merges rather than duplicates. If the user is dark and an exterior matches a known dollar pattern (e.g., the parking authority's envelope), the scheduler can go outbound (`outbound_dollar_event`, F-05 step 4) — the crown graft: the agent travels to the user.
5. Token expiry → `erroring` → repair CTA on W-10 + one cap-respecting `channel_error` notification: "Your USPS connection lapsed. Two taps to reconnect — mail from the gap still gets read when the paper arrives."

### C-04 Mailroom setup + steady state

1. **M-08/W-10** → Mailroom card, price and promise upfront: "+$8/month, flat. A real street address. Mail sent there gets opened, scanned, and read by Molehill — you never touch it."
2. Wizard: choose handling default (open-everything recommended, per §4.2) → embedded Form 1583 online notarization (~10 min, one government ID; copy sets the expectation: "One-time federal identity check — it's the law for any service that opens your mail. Ten minutes, once.") → address provisioned on clearance.
3. Completion screen shows the address + copy button + the starter list: "Give this address to the senders that scare you most. Common first moves: the DMV, your city's parking authority, the IRS change-of-address form (linked)."
4. Steady state: S5 ingests exterior + interior scans; pieces flagged as checks/cards trigger the forwarding-only flow (§4.2); physical shred at day 30 after interior scan.
5. Vendor outage → `erroring` with honest scope: "Mailroom scans are delayed on the vendor's side. Mail is safe and held; nothing is shredded while scanning is down."

### C-05 Partner Handoff (capture half of F-06)

1. Sam: **M-17** → Handoff → **M-02** with handoff flag; snaps the school forms; note field: "due Friday."
2. Or note-only: Sam types the note without snapping (A13) — "the forms are on the fridge, due Friday" is a complete Handoff.
3. Capture records `captured_by_user_id = Sam`; the note seeds `source_meta.note`; Sam's confirmation: **"Handed to Molehill. Maya gets it as a Move — you're out of the loop now."**
4. Sam's later visibility is status-line only (I-20): "Handled ✓" — never the content of Maya's other Items.

### C-06 Bulk capture (web upload)

1. **W-11**: drag a folder — 30 PDFs of scanned statements, 12 phone photos.
2. Per-file validation (type/size); unsupported rows flagged inline, batch continues (never all-or-nothing).
3. Resumable uploads; per-file tile states per §6; duplicates dropped with the "already have this one" note (S6).
4. Per-document consent toggle available per row (default off). Results list populates as Triage completes: "42 files → 38 items found · 3 duplicates · 1 blank."

### C-07 Offline capture → sync

1. Airplane mode, M-02: shutter works identically; tiles queue with the cloud-off badge.
2. Connectivity returns (even days later): S1 uploads oldest-first in the background — no app open required (background session).
3. If the app was killed mid-queue, the on-device originals and queue manifest survive in the sandbox; next launch resumes silently.
4. Failure guarantee stated wherever relevant: the on-device original is the source of truth; a Snap can always be re-uploaded and is never lost to a network state.

### C-08 The "camera becomes the envelope" mitigations (brief §10.1 — binding design behaviors)

The clinical attack: once Molehill makes contents unavoidable, pointing the camera may inherit the dread that opening the envelope used to carry. Every mitigation below is a testable design behavior in this module, instrumented against the week-4 re-capture kill metric (Product Law #9).

1. **The camera never confronts.** M-02 displays no verdicts, no dollars, no extraction previews, no "3 items need attention" — nothing but viewfinder, shutter, counter. The moment of capture is kept semantically empty by law; the dealing happens later, elsewhere, on the agent's side of the desk. (This is why capture has zero AI: not just latency — *meaning* at capture time is what re-attaches the dread.)
2. **Closed envelopes are first-class.** All copy ("Envelopes can stay closed"), the pile-mode design, and Triage's envelope-window/exterior heuristics assume unopened mail. The user never receives feedback that an opened document would have triaged better.
3. **Verdict delivery is decoupled in time.** Default first-look is *tomorrow at 9am* (M-10 handover line), not an immediate reveal. Snapping tonight never means facing verdicts tonight. "Peek now" exists but is never pushed.
4. **No capture-triggered notifications.** A Snap generates zero pushes. The only post-capture contact is the standing 9am One Move. The camera cannot become a slot machine for bad news.
5. **Re-capture friction stays at zero.** The FAB is center-tab from every screen; camera warm-up < 300 ms; no interstitials, ever, between intent and shutter — including after weeks of absence (Pile Amnesty applies to the camera too: no "welcome back" screen stands between the user and the shutter).
6. **The automatic channels are the hedge, not the fallback.** M-08 offers all four before the first snap is ever requested, and every channel-nudge in Settings frames them as load-bearing: "Mail can find me even when you'd rather not point a camera at it." If the kill test fires (week-4 re-capture collapses), automatic ingestion becomes the primary product (Product Law #9) — and this module is already built for that inversion.
7. **Instrumentation (deterministic, content-free):** per-user snap latency trend (time from app-open to first shutter — rising latency is the dread signature), week-4 re-capture rate, ratio of automatic-channel to Snap captures over time. These feed the falsifiability dashboard, not per-user nudging — we never message a user about their own avoidance pattern.

## 8. AI behavior

**None. This module contains zero AI, by law** (brief §9: "Deliberately not AI: capture flow"; thesis: "Zero AI at capture time — the snap must never lag, fail, or wait on a model, because capture is the one behavior we ask the user to sustain").

Explicit list of features in this module that deliberately do NOT use AI, and why:

| Feature | Why deterministic |
|---|---|
| Shutter, photo queue, offline storage | Latency and reliability are the product; a model call is a failure mode we refuse to own at capture time |
| Document-bounds auto-crop (A2) | Classical CV rectangle detection, on-device; good enough, never blocks |
| Blur detection (S8) | Laplacian variance threshold; cheap, explainable, never blocks the shutter |
| Duplicate detection (S6/S7) | sha256 + pHash + date/sender heuristics; a false "duplicate" verdict from a model could silently eat a real document — unacceptable |
| Email spam/spoof gate (S2/S3/S5 in §5) | SPF/DKIM/DMARC + verified-sender allowlist. A model judging "is this email legit" is a security decision we keep boring |
| USPS digest parsing (S4) | Templated HTML; versioned deterministic parser. Unknown format → hold and page, never guess |
| Channel health, retries, rate limits, purge jobs | Clockwork (Product Law #7 / Invariant I-19) |
| All capture-path copy | Static strings from this spec; no generative copy anywhere in the capture flow |

**Seam contract with Triage (the module boundary):** Capture's output is a `received` Capture with media refs and deterministic metadata (`exterior_only`, `probable_duplicate_of`, `source_meta.note`, quality flags). Triage owns everything from `triaging` onward. No AI output ever flows backward into a Capture record.

**Fallback when the model is unavailable (degraded-AI):** this module is unaffected — capture, queuing, channel ingestion, and media handling all continue. Tiles hold at "safe and queued — reading room is catching up." The degraded-AI state is *displayed* here but *caused* elsewhere.

**Tone rules (for the static copy this module owns):** accountant, not parent. Never reference elapsed time as judgment, never quantify what capture-lateness cost (Invariant I-8's spirit applies to copy here too), always end error copy with the safety guarantee.

## 9. Scale

Assumptions: average US household receives ~10–12 mail pieces/week; 40% of active users connect Informed Delivery by month 3; 10% take Mailroom; first-session pile averages 12 captures; steady-state Snap ~8/month/user.

| Metric | 1 user | 1,000 users | 100,000 users |
|---|---|---|---|
| Captures/month (all channels) | ~60 (mostly Informed Delivery exteriors) | ~45k | ~4.5M |
| Snap captures/month | ~8 | ~8k | ~800k |
| Informed Delivery captures/month | ~45 (if connected) | ~18k | ~1.8M |
| Mailroom scans/month | ~10 (if opted in) | ~1k | ~100k |
| Email forwards/month | ~4 | ~4k | ~400k |
| Channels (rows) | ≤ 5 | ~3k | ~300k |
| Transient media in processing bucket (steady state, given 24h/30-day purges) | ~50 MB | ~40 GB | ~4 TB |
| Edge email QPS (p99) | — | < 1 | ~10 |

- **Hot paths:** shutter-to-saved (< 200 ms, on-device, no network); camera warm-up (< 300 ms, flows.md M-02); edge email accept (< 2 s); Mailroom webhook ingest (< 5 s). None involve a model.
- **Ingestion is bursty by wall clock:** Informed Delivery digests land in a morning window (S4 staggers polling per-user over 06:00–08:00 local); bulk uploads spike evenings/weekends. Triage consumption is queue-buffered; Capture's write path must absorb the burst (it's an object write + media PUT — trivially horizontal).
- **Pagination/virtualization:** M-03 virtualizes beyond 50 tiles; W-11 beyond 100 rows; W-10 ingestion history paginates at 50 events.
- **Cost drivers:** **zero AI calls in this module.** Real costs: transient object storage (self-limiting via purge jobs — privacy law is also the cost control); Mailroom vendor fees (~$6–7/user/month hard cost, covered by the +$8 flat add-on); inbound email processing (fractions of a cent); USPS ingestion (free — parsing email/linked digests); egress for source-region crops (small, cached).
- **Rate limits:** per §5 S12 (forward-in 200/day, bulk 500 files/day, Snap unlimited). Per-IP limits at the edge for the inbound MX are standard infra.
- **Caching:** last-known tile states cached on-device for instant M-03 render; channel card statuses cached with 60 s TTL on W-10; source images are never CDN-cached (privacy law) — signed, short-lived (15 min) URLs only.

## 10. Errors

Ranked by likelihood × harm. Every row carries an explicit data-loss guarantee; the module-wide guarantee is **a Capture, once taken or received, is never lost** — the failure modes below are delays, never losses, and the copy always says so.

| Rank | Failure | Detection | User-facing message (verbatim) | Recovery path | Data-loss guarantee |
|---|---|---|---|---|---|
| 1 | Blurry/unreadable snap | S8 on-device check; Triage low-confidence downstream | "Too blurry to read — retake, or leave it and I'll try anyway." | Retake (A6) links old→new; or Triage flags fields "couldn't read this — please type it" (M-12 handles) | Original kept on-device; nothing discarded without user action |
| 2 | Upload failure (network flap, server 5xx) | S1 retry loop | "Upload hiccup — retrying. The original's on your phone; nothing's lost." | Automatic backoff retries, indefinitely; manual retry button on tile | On-device original is source of truth |
| 3 | USPS token/routing breaks | S10 health check (no digest for 3 consecutive expected days) | "Your USPS connection lapsed. Two taps to reconnect — mail from the gap still gets read when the paper arrives." | Repair CTA → re-link wizard | Nothing was held by us to lose; physical mail still arrives and can be snapped/Mailroomed |
| 4 | Free-tier quota exhausted | Deterministic counter | "Captured and safe. It'll be read when your month rolls over on the 12th — or now, if you upgrade." | Wait for cycle roll or upgrade (M-18); Eyes On override per §5 | Captures stored full-fidelity while held; retention clock for quota-held server media starts at *triage*, not receipt |
| 5 | Unknown-sender email | S3 | (to owner) "Someone forwarded mail to your Molehill address from {sender}. Yours? One tap to accept — otherwise it's deleted in 7 days, unread." | One-tap accept + optional allowlist add | Held unprocessed; auto-delete is the *designed* outcome for strangers, stated plainly |
| 6 | Camera permission denied | OS callback | "Molehill can't see the camera. Fix it in Settings — or import from your photos, which works right now." | Deep link to OS settings; library import fallback | n/a (nothing captured yet) |
| 7 | Mailroom vendor outage/delay | S10 + vendor status webhook | "Mailroom scans are delayed on the vendor's side. Mail is safe and held; nothing is shredded while scanning is down." | Auto-recover on vendor restore; shred clock pauses during outage | Physical mail held by vendor; shred timers suspended |
| 8 | Triage pipeline down (degraded-AI) | Pipeline health signal | "Reading room is backed up; your snaps are safe and queued." | Auto re-queue on recovery (Capture `failed → triaging`) | Captures + media preserved through the outage; retention clocks don't start until triaged |
| 9 | Device storage full | OS write failure at A1 | "Your phone's storage is full — Molehill needs a little room to save the photo. Nothing else is affected." | OS storage settings link; capture blocked only while storage is full | Cannot save → cannot lose; user is told before the shutter fires again |
| 10 | Duplicate flood / abuse on forward-in | S6 + S12 | (silent to user; sender gets deferrals) | Rate limit deferral; address burn available as last resort with user consent | Legitimate mail deferred, not dropped (4xx retry semantics) |
| 11 | Lost/replaced phone before confirmation | New device login; on-device originals absent | On affected M-12 fields: "The source photo lived on your old phone. Type the value from the paper — or re-snap it." | Re-snap (supersedes) or direct typed entry (still active transcription) | Server extraction copies may already be purged (24h rule) — the *paper* is the recovery path; confirmed values are never lost |
| 12 | Inbound MX outage | Infra monitoring (pages on-call) | (none live; on recovery, senders' MTAs retry per SMTP) | Standard SMTP retry semantics cover ≤ 72h outages; postmortem owed if any bounce occurred | Sending servers hold mail during outage — deferral, not loss; a hard bounce is a P1 incident |
| 13 | Address minting collision / enumeration probing | Edge telemetry | (none) | Addresses are random base32, collision-checked; probes hit non-existent addresses → silent drop | No user data exposed; burned addresses never reissue |

## 11. Permissions

| Actor | Can | Cannot |
|---|---|---|
| Account owner (Maya) | Everything in §5; sees all Captures and channel configs on the account; manages all consents | See Mailroom vendor internals beyond scan events |
| Household member (Sam) | Snap and Handoff into the account; discard **own** un-triaged captures; see full content of Items **he captured** (I-20); see status-lines for everything else ("1 item in custody, deadline watched"); receive `partner_failover` pings only if failover is enabled | View other members' Capture media or Item contents; configure/disconnect channels he doesn't own; toggle another member's consents; see the owner's notification or billing state. **The agent carries the nag — the partner never gets a surveillance dashboard** |
| Coach share | Does not exist at launch (no coach role in the object model; any future addition requires a BUILD_LOG entry and its own spec) | — |
| Support/admin | See Capture *metadata* (timestamps, channel kind, status, failure_reason) for debugging with a support ticket | **View document media, ever.** The processing bucket has no human-readable access path; support tooling renders metadata only. This is enforced by IAM policy, not convention |
| Mailroom vendor | Physically open and scan mail per the user's signed 1583 authorization and chosen handling default | Retain digital copies past hand-off to Molehill (contractual zero-retention on the vendor side, mirrored from Product Law #4); disclose or forward mail except at user request |
| USPS / email senders | n/a (one-way sources) | Nothing is ever sent back to a sender except protocol-level bounces/deferrals and the burned-address notice |

**Privacy notes:** document images are the most sensitive objects in the product (financial, legal, medical-EOB) and get the strictest handling in the system — §4.1 retention, per-document consent default-off, no training ever, no CDN caching, signed 15-minute URLs, on-device originals for Snap. Household privacy is Invariant I-20 and is enforced server-side in this module's API layer, not in the client. Email `source_meta` may contain third-party PII (sender addresses); it follows the Item's retention and is included in export/delete (F-10).

## 12. Dependencies

**Modules (downstream/upstream seams):**
- **Triage** — consumes `received` Captures; owns `triaging → triaged/failed`; reports Item counts back for tiles; honors `exterior_only`, `probable_duplicate_of`, and `source_meta.note` hints. Capture's SLO to Triage: metadata-complete Captures with retrievable media.
- **Watchtower** — consumes `channel.erroring` events (→ at most one cap-respecting `channel_error` Notification) and the Household `failover_enabled` flag; sends the `outbound_dollar_event` contact when Informed Delivery sees a dollar pattern while the user is dark (F-05).
- **Ledger** — Mailroom add-on billing; quota state read for §5 quota behavior; `last_qualifying_activity_at` fed by S11.

**External services:**
- USPS Informed Delivery (account link where available; templated digest email fallback — parser versioned, format changes page the on-call).
- CMRA virtual-mailbox vendor: address provisioning, Form 1583 online-notarization flow, scan webhooks, shred/forward operations, contractual digital zero-retention. Single-vendor at launch; the Channel `external_ref` abstraction keeps the vendor swappable.
- Inbound email infrastructure (managed inbound MX, e.g., SES/Postmark inbound): SPF/DKIM/DMARC evaluation, ≤ 2 s accept, immediate raw-mail deletion post-Capture.
- Online notarization provider (embedded in the Mailroom wizard; vendor-supplied or e.g. Proof/Notarize).
- Object storage with encryption at rest + lifecycle rules mirroring §4.1 purges (belt and suspenders: purge jobs are authoritative, lifecycle rules are the backstop).

**Device capabilities:**
- Camera (iOS AVFoundation; warm-up < 300 ms budget), photo library read, haptics (pile-mode tick).
- Background transfer (iOS `URLSession` background sessions; Android `WorkManager`) — required for C-07's "uploads even if the app never reopens."
- Push notifications: NOT used by this module (capture generates zero pushes — C-08.4); channel errors route through Watchtower's scheduler.
- Clipboard (address copy), local sandbox storage (on-device originals + offline queue manifest).
- No location, no calendar, no contacts access anywhere in this module.

**Platform differences (brief §8: mobile is the capture-and-confirm surface; web is the power surface):**
- **Mobile:** M-02 camera + pile mode, M-03 queue, M-08 channel onboarding, M-10 first pile, M-17 Handoff quick-capture. On-device originals exist only on mobile.
- **Web:** W-10 full channel management (connect/repair/pause/disconnect/history — the surface of record for channels), W-11 bulk upload (no camera; drag-and-drop only). Web has no offline capture mode (W-11 offline state: "uploads need a connection").
- **Both:** consent toggles, quota-held states, duplicate notices render identically; all enforcement (I-20, retention, quota) is server-side, never client-only.
