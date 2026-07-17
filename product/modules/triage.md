# Module: Triage

> Module 2 of 5 (`product/brief.md` §5). The AI reading room: identify each Item, extract deadline/dollars/consequence with source regions, deliver a Verdict, gate everything consequential through human confirmation. Owns **Item, Extraction, Verdict** (`product/object-model.md` §6–8). Screen IDs reference `product/flows.md`. Terminology is the brief's glossary, used exactly.

## 1. Purpose

Triage exists because the avoidance attaches to the **dealing**, not the paper (`research/pain-points.md` Cluster 4; the TotallyADD envelope quote). Capture gets the scary thing into the system with near-zero behavior; Triage is the part that opens it, reads it, and answers the only three questions the user cannot make themselves answer: *what is this, what does it cost, and do I have to do anything?* "Working" means: within the hour of a pile Snap, every Capture has resolved into Items with a Verdict — **Nothing Needed** for the junk (the "7 of these 11 require nothing from you" product moment), **One Move** for the actionable, **Eyes On** for everything government/tax/court/legal/insurance-EOB/debt-collection — and every money- or deadline-bearing number is anchored to a highlighted source region and confirmed by the user's own typing before anything downstream may act on it (Product Law #2, #3, #7). Triage is also where trust is won or lost: one hallucinated deadline that costs a doubled fine ends the relationship, so this module is engineered fail-closed at every uncertainty.

## 2. User goals

- I want Molehill to read the pile I snapped so that I never have to open the envelopes myself.
- I want to be told plainly which items require nothing from me, so that the pile stops being a wall of undifferentiated dread.
- I want the real dollars and dates at stake, shown next to the exact spot on the document they came from, so that I can trust the number without trusting a black box.
- I want government, tax, court, legal, insurance, and debt-collection mail to always reach my own eyes, so that the one letter that can hurt me is never silently dismissed.
- I want confirming the numbers to take about 90 seconds and feel like relief, not homework.
- I want honesty when the AI can't read something (handwriting, another language, a blurry shot) so that I'm never acting on a guess.
- I want a duplicate snap or a second notice about the same ticket to fold into one Item, so that I'm never asked to deal with the same thing twice.

## 3. Objects

| Object | Ownership | Role in this module |
|---|---|---|
| **Item** | **Triage (source of truth)** | One document/email/handoff after reading. Fields, lifecycle: object-model §6. Triage creates it, writes `sender_name`, `doc_kind`, `legal_class`, `title`, and (post-confirmation, deterministically) `dollars_at_stake`. |
| **Extraction** | **Triage (source of truth)** | One field + source region + confidence; the atom of trust. Object-model §7. `value_confirmed` is written only by human input; AI-immutable afterward (I-1). |
| **Verdict** | **Triage (source of truth)** | Exactly three classes: `nothing_needed` \| `one_move` \| `eyes_on`. Object-model §8. Legal-floor Items get `eyes_on` stamped `proposed_by = floor_rule`; the model is never consulted on class for them (I-4). |
| Capture | Capture module | Read-only input (media refs, `source_meta`); Triage drives its `received → triaging → triaged/failed` transitions and yields 0..n Items per Capture. |
| Watch / Deadline | Watchtower | Created **by the confirmation transaction** through Watchtower's service API from confirmed Extractions only (I-2, I-3). Triage never writes them from raw model output. |
| Move | Moves | Triage signals "Item confirmed actionable" → Moves begins drafting. A Move can never reach `ready` on unconfirmed numbers (I-10). |
| Account | Platform | Read for the free-tier quota gate (`items_used_this_cycle`); Triage increments it on Item materialization. |
| Notification | Watchtower | Triage emits events (`eyes_on_arrival`, `successor_notice`, `reading_room_degraded_floor_hit`); Watchtower's deterministic scheduler decides send/cap/quiet-hours. Triage never sends anything itself. |
| Sender Registry | Triage (new, internal) | Curated, versioned, deterministic table: sender patterns (domains, return addresses, name regexes, franking marks) → `legal_class`. Registry may only **escalate** toward the legal floor, never downgrade. No PII, no user data; shipped as data, hot-reloadable. |

> **Object-model extension (requires `BUILD_LOG.md` entry):** Item gains a nullable `triage_meta jsonb` — `{language, handwriting: bool, pages_expected, pages_present, missing_pages: int[], scam_suspect: bool, duplicate_of_item_id, envelope_only: bool, model_version}`. Advisory annotations only; nothing downstream keys decisions off it except UI copy and the dedup linker.

## 4. Lifecycle

Full state machines live in object-model §6–8 and are law. This section maps states to what the user sees.

**Item** — `reading → needs_confirmation → verdict_nothing_needed | in_custody | move_ready → resolved → archived → deleted → purged`

| State | User sees |
|---|---|
| `reading` | M-03/W-11 tile: "reading…" then "→ 2 items found". No dollars shown yet — never show unconfirmed money as fact. |
| `needs_confirmation` | Item card flagged "needs your 90 seconds" (M-11 partial, M-01 partial, W-02 chip). Proposed values rendered visually distinct from confirmed ones: italic + "unconfirmed" chip, no Meter math, no countdowns. |
| `verdict_nothing_needed` | Resolved instantly with the rationale line ("Prescreened credit offer — requires nothing from you"). Auto-archives at 14 days. |
| `in_custody` / `move_ready` | Normal M-11/M-04 presentation; confirmed values in regular type with source-region thumbnails. |
| Retention | Per object-model §6: no "overdue" state exists anywhere (I-13); document images follow Capture retention (I-16) — see §10 E-8 for the purge-before-confirmation case. |

**Extraction** — `proposed → awaiting_confirmation → confirmed | corrected | rejected | unreadable`

| State | User sees |
|---|---|
| `proposed` / `awaiting_confirmation` | In M-12/W-04: the zoomed highlighted region + an **empty** typing pad. The AI's value is never rendered as prefill, placeholder, or autocomplete (that would reduce transcription to reading, defeating Product Law #3). Paste is disabled on these inputs. |
| `confirmed` | Green check, value now regular type everywhere; immutable to AI forever (I-1). |
| `corrected` | "You typed Jan 24, I read Jan 21 — yours wins. Double-check the highlight?" One re-look prompt, never an argument. Logged aggregate-only as model-accuracy telemetry. |
| `rejected` | "Not on the document" — field disappears from the Item; if it was the only deadline, no Watch is offered. |
| `unreadable` | "Couldn't read this — please type it from the highlight." Same pad, honest framing. |
| Re-edit | A later human edit creates a new Extraction version and re-runs active transcription; downstream Deadlines re-materialize deterministically (I-1). |

**Verdict** — `proposed → accepted | overridden → superseded`

| State | User sees |
|---|---|
| `proposed` | Verdict chip on M-03 tile / M-11 / W-02 row, with plain-language rationale. |
| `accepted` | For `nothing_needed`: batch or single accept → Item resolves. For `one_move`/`eyes_on`: acceptance is implicit in completing confirmation/custody. |
| `overridden` | One tap ("This actually needs a move" / "This really is junk") — never argued with; commercial-only gate still applies: an override **to** `nothing_needed` is possible only on `legal_class = commercial` Items; the option simply doesn't render otherwise. |
| `superseded` | A newer notice for the same obligation arrived (§7 F-T5): "New notice from Austin Parking — the ticket went from $85 to $170. Updated numbers need your eyes." |

## 5. Actions

### User-initiated

| Action | Trigger / Screen | Preconditions | Effect | Feedback | Undo |
|---|---|---|---|---|---|
| Accept a Nothing Needed Verdict | M-03 sheet, M-11, W-02 row | `class = nothing_needed`, `legal_class = commercial` (I-4) | Verdict `accepted`; Item → `verdict_nothing_needed` → `resolved` | "Done — requires nothing from you." | Item recoverable from archive 14d+, W-12 thereafter |
| **Batch-accept Nothing Needed** | Sheet from M-03 after pile triage; W-02 bulk select | Every Item in batch is batch-eligible (ignorability ≥ 0.85, commercial) | All accepted in one tap: "Accept all 7" | "7 of these 11 required nothing. They're filed." | Per-item recovery as above |
| Override a Verdict | M-11 / W-03, one tap | any proposed/accepted Verdict | New Verdict `overridden` with `overridden_class`; Item re-routes (e.g., junk → confirmation flow) | "Got it — treating this as needing a move." | Override again |
| Active transcription (confirm) | M-12 / W-04 | Item `needs_confirmation`; consequential field pending | Typed value vs `value_ai` (normalized): match → `confirmed`; mismatch → `corrected` (typed wins) | Progress "2 of 3"; mismatch banner | Re-edit → new version + re-transcription |
| Reject a field | M-12 / W-04 | field on screen | Extraction `rejected` | "Removed — not on the document." | Re-add via "edit values" on M-11 |
| "Do this later" | M-12 / W-04 | — | Item stays `needs_confirmation`; zero penalty, zero badge | Card remains available; M-01 partial state may surface it | n/a |
| Non-consequential quick-confirm | M-11 | field with `is_consequential = false` (sender, consequence text) | `confirm_method = non_consequential_tap` | inline check | edit |
| Request re-triage | W-02 bulk, W-03, M-11 overflow | source media still retained | New pipeline run; prior Verdict `superseded`; confirmed Extractions are **never** overwritten (I-1) — only unconfirmed fields refresh | "Re-reading — a minute or two." | n/a |
| Merge captures ("these are one document") | M-03 / W-11 | ≥2 Items/captures from same session | Pages regroup; single Item re-triaged | "Combined into one document." | Split |
| Split an Item ("this is two documents") | M-11 / W-03 | multi-page Item | Pages regroup; re-triage into 2+ Items | "Split — reading them separately." | Merge |
| "Not a duplicate" | dedup notice on M-03/M-11 | Item was auto-attached as duplicate | Detaches into its own Item; dedup fingerprint marked false-positive (aggregate telemetry) | "Understood — treating it as its own item." | Re-mark duplicate |
| Add missing page | M-11 banner → M-02 | `triage_meta.missing_pages` non-empty | New Snap joins the Item; re-read of affected fields only | "Page 2 added — re-checking the numbers." | n/a |
| Answer an object prompt | M-03 tile | photo-of-object heuristic fired (§8) | "Is this a return?" → yes: Item `doc_kind = return` seeded with user's store/reason text; no: zero-Item | "I'll build the return checklist." | discard Item |
| Edit Item title | M-11 / W-03 | — | `title` human-edited (AI wrote it once, never rewrites) | inline | edit again |
| Mark "not mine" | M-11 overflow | — | Item archives with reason `not_mine` (roommate's mail etc.); excluded from Meter/quota telemetry | "Filed — not yours to deal with." | restore from archive |

### System-initiated

| Action | Trigger | Effect |
|---|---|---|
| Triage run (§8 pipeline T1–T8) | Capture reaches `received` | Capture `triaging`; 0..n Items with Extractions + proposed Verdicts; Capture `triaged` |
| Legal-floor stamp | Deterministic gate at T6 | `legal_class` set; floor Items get `eyes_on` `proposed_by = floor_rule`; `unknown` counts as floor (fail-closed, I-4) |
| Eyes On arrival event | Verdict `eyes_on` materialized | Event to Watchtower → cap-exempt notification (F-03): "A court notice arrived. I've read it — you should see it. 2 minutes." |
| Duplicate fold | T3 match | No new Item; media attached to existing Item; M-03 tile: "Already have this one — filed with the original." Never counts against quota |
| Successor-notice supersede | T3 semantic match, different amount/date | Existing Item gets new proposed Extractions + Verdict `superseded → proposed`; old Deadlines cancel only **after** the new values are confirmed (never a custody gap) |
| Quota gate | Free tier, `items_used_this_cycle = 5` | Capture holds pre-materialization (`received`), M-18 partial copy. **Exception:** deterministic Sender-Registry floor hit bypasses the quota — legal mail is never held behind a paywall (Product Law #2's spirit; safety beats monetization) |
| Confirmation fan-out | Last consequential Extraction confirmed | Single transaction: Deadlines materialize via Watchtower (I-3), Draft merge slots lock (I-1), `dollars_at_stake` denormalizes deterministically, Move may reach `ready` (I-10), custody ritual (M-13) offered if deadline-bearing |
| Retry / degrade | Pipeline error | 3 attempts (30s / 2m / 10m backoff) → Capture `failed`, auto re-queued on recovery; circuit breaker flips degraded-AI mode (§6, §10 E-3) |
| Media-purge conversion | Day-30 cap on unconfirmed server-channel media (I-16) | Item converts to paper-verify mode (§10 E-8) |

## 6. States

Triage's own surfaces are M-03 (Snap Queue), M-12/W-04 (Confirmation), the Nothing Needed batch sheet, and the triage-status portions of M-11/W-02/W-03/W-11. Per-screen state tables are in `product/flows.md` and are law; below is what Triage contributes to each state.

| State | Behavior and copy |
|---|---|
| **empty** | M-12/W-04 exist only with pending fields; W-04 empty: "Nothing awaiting confirmation." M-03 empty: "No snaps waiting. The camera's one tap away." |
| **loading** | Region crops are **pre-generated at triage time** (§9) so M-12 never waits on image ops; typing pad is interactive before the crop finishes rendering. |
| **ideal** | Tiles resolve "→ N items found"; verdict chips; ~90-second confirmation flow, one field at a time, progress "2 of 3". |
| **partial** | Mixed tiles (some triaged, some queued, one blurry: "couldn't read — retake or let it wait"); mismatch banner (typed wins); missing-page banner: "I have pages 1 and 3 of the Chase statement. Snap page 2 if it's handy — or I'll work with what's here." |
| **error** | Per-capture failure tile with retry; capture never lost (on-device original for Snaps). Confirmation save failure: typed values held locally, retry banner — nothing re-typed. |
| **offline** | Mobile Snaps: full confirmation flow works against the on-device original; syncs later. Server-channel items: "Reconnect to view the source — your typed values will wait." |
| **degraded-AI** | The module-defining state. Circuit breaker (provider outage, or error rate > 20% over 5 min) → pipeline pauses; Captures hold safely at `received`. Everything deterministic keeps working: confirmation of already-extracted fields, verdict accepts, countdowns, custody, Meter. Copy is honest and pressure-free: M-03 "Safe and queued — the reading room is catching up"; M-01 "Reading room is backed up; your snaps are safe and queued." The deterministic Sender Registry still pre-screens held captures: a floor-sender hit while degraded triggers one honest, cap-exempt notice — "A letter from the IRS arrived. I haven't been able to read it yet — the reading room is down. You may want to open this one yourself; I'll have the full read as soon as I'm back." On recovery: FIFO with registry floor hits first, then oldest; every held tile updates without user action. |
| **quota-held** (module-specific) | Free tier at 5/5: tiles read "Captured and safe — it'll be read when the month rolls over, or sooner if you upgrade." Floor-sender bypass per §5. |
| **paper-verify** (module-specific) | Source media purged before confirmation (§10 E-8): "The scan was deleted on schedule per your privacy settings. I kept my reading — due Feb 12, $85 — but check it against the paper before I act on it." Transcription proceeds against the physical document. |

## 7. Workflows

Cross-module flows F-01 (first pile), F-03 (Eyes On), F-04 (the confirmation gate), F-05 (reactivation) in `product/flows.md` are the master copies. Triage-internal flows:

**F-T1 — Async reading pipeline (every Capture)**
1. Capture reaches `received` (Capture module). Triage worker claims it → `triaging`. Ack to M-03 within 5s ("reading…").
2. **T1 Preflight (deterministic):** EXIF-strip, deskew, page detection, downscale to 2048px longest edge, blur score (variance-of-Laplacian, normalized; < 0.35 → blur flag), blank check (text coverage < 0.5% and no document contour → zero-item candidate), sha256 + perceptual hash per page.
3. **T2 Assembly (pile mode / multi-page):** captures from the same Snap session (≤ 5 min apart) are grouping candidates; PDFs keep native page order (cap 20 pages/document; beyond → read first 20 + `triage_meta` flag). The model proposes page→document grouping from page numbers, continuation cues, sender blocks; user can merge/split later (§5).
4. **T3 Dedup:** exact (sha256) → fold, no Item. Near (pHash Hamming ≤ 8, same account, 30-day lookback) → model confirms same document → fold. Semantic successor (same sender + same masked account ref + same obligation, different amount/date, 90-day lookback) → supersede path (F-T5). Everything else → new document.
5. **T4 Read (the one model call, §8):** structured JSON — sender, doc_kind, legal-class hint, language, handwriting flag, title, plain-language consequence, ignorability hint + rationale, fields with page/bbox/confidence, missing-page detection, scam-suspect flag.
6. **T5 Validate (deterministic):** strict schema; dates must parse under the document-locale hint; amounts parse to integer cents; bboxes within page bounds; cross-field sanity (`escalation_amount` > `amount_due`; `escalation_date` ≥ `deadline_date`). Validation failure = attempt failure (retry ladder).
7. **T6 Floor stamp (deterministic classifier-of-last-resort):** `legal_class` = strictest of {model hint, Sender Registry match, keyword scan of OCR text — "Internal Revenue Service", "summons", "Explanation of Benefits", the FDCPA mini-Miranda "this is an attempt to collect a debt", court/agency address patterns}. Model claims `commercial` with confidence < 0.75 → `unknown` → floor (I-4 fail-closed).
8. **T7 Verdict gate (deterministic):** see confidence table in §8. Floor → `eyes_on` by rule. Commercial junk at ≥ 0.85 → batch-eligible `nothing_needed`. 0.60–0.85 → `nothing_needed`, individual accept only ("I think this is junk — one glance to be sure"). Anything unreadable/uncertain → `eyes_on`.
9. **T8 Materialize:** quota gate → Items + Extractions + Verdicts in one transaction; region crops pre-generated; Capture → `triaged`; events emitted (Eyes On arrival, etc.). Consequential fields → Item `needs_confirmation`; pure junk → verdict flow; SLOs in §9.

**F-T2 — The junk experience ("Nothing Needed")**
1. Pile triage completes; M-03 header: "11 snapped → 7 need nothing, 3 need one move each, 1 needs your eyes."
2. Tap "7 need nothing" → sheet: each row = sender + one-line rationale ("Prescreened credit-card offer — requires nothing from you" · "Charity solicitation — give if you want; nothing is owed" · "Insurance marketing, not a bill — the word 'URGENT' is doing a lot of unpaid work").
3. "Accept all 7" → Verdicts accepted, Items resolve, no Meter theater (junk earns no dollars — the Meter never lies).
4. Any row expandable → M-11 with the source image; override is one tap. On web this is W-02 bulk select → bulk-accept.
5. Copy law for this surface: state what it is and why it's safe to ignore; never mock the sender, never editorialize about the user's pile.

**F-T3 — Handwriting / foreign language / unreadable**
1. Handwritten fields ride the normal per-field confidence gate — they usually arrive `unreadable` → direct typing from the highlight. A wholly handwritten personal note → `doc_kind = personal` → `eyes_on`, rationale: "Looks like a personal note — for your eyes, not my filing."
2. Foreign-language document, readable: extraction values verbatim from the document; `title` and consequence rendered in the user's app language with the original language named ("Water bill — in Spanish. Due Mar 3, $67.20."). The M-12 date pad reorders its segments to match the printed format (DD·MM·YYYY when the document locale says so) so the user types what they see; normalization handles the rest.
3. Overall reading confidence < 0.50 (any language, any script): fail closed → `eyes_on`, copy: "This looks like a bill in Vietnamese — I can't read it reliably, so I won't guess. Here's the best photo; want to type the key numbers in yourself?" Direct-typed fields still get full deterministic downstream (Deadlines, Moves).
4. Never: silent partial reads presented as complete, machine-translated legal text presented as authoritative.

**F-T4 — Photos of nothing**
1. Blank/blurry/no-document (floor, pocket shot, the cat): T1 flags + model confirms "no document" → explicit zero-Item result; Capture `triaged`; tile: "No document found in this one — probably a stray shot. It's here for 24 hours in case I'm wrong." Never counts against quota.
2. Photo of an object with no text (the $140 return riding in the trunk): heuristic (product-like object, no document contour) → prompt tile: "Is this something you need to return? Tell me the store and I'll build the checklist." Yes → Item `doc_kind = return`, seeded from the user's one line; no → zero-Item.
3. A blurry-but-document shot is never discarded: "Couldn't read this — retake when it's handy, or leave it; I'll try again if the reading room improves." Capture retained per normal retention.

**F-T5 — Duplicates and successor notices**
1. Same envelope snapped twice in pile mode → T3 exact/near fold; second media attaches to the Item; tile: "Already have this one — filed with the original." One Item, one confirmation, one Move. Ever.
2. Second notice, escalated ($85 → $170): semantic match → **same Item**, Verdict `superseded → proposed`, new consequential Extractions proposed. Notification event (respects cap unless floor/critical): "New notice from Austin Parking — the ticket went from $85 to $170. The updated numbers need your eyes — 60 seconds." Existing confirmed Deadlines stay live until the replacement values are confirmed, then cancel-and-rematerialize in one transaction — custody never gaps.
3. Cross-channel: a Mailroom scan arriving days after its Informed Delivery exterior (F-T6) merges by sender + window; the exterior capture becomes provenance.

**F-T6 — Envelope-exterior triage (Informed Delivery / unopened Snaps)**
1. Exterior-only input (Informed Delivery grayscale, or a Snap of a sealed envelope with only window/return-address signal): triage runs in exterior mode — outputs sender + legal-class + expectation only; no amounts, no deadlines are ever extracted from an exterior (nothing consequential exists to transcribe).
2. Registry/floor sender → provisional Item (`triage_meta.envelope_only = true`), Verdict `eyes_on`: "A letter from the county court is arriving. When it lands, snap it — or it's already in your Mailroom queue." This is what powers the outbound dollar-event SMS for dark users (F-05).
3. Commercial exterior → zero-Item with a daily digest line at most ("4 pieces today; 3 look like marketing").
4. When the contents arrive (Snap or Mailroom scan), F-T5 merges; full pipeline runs on the real document.

**F-T7 — Confirmation (active transcription)** — master flow F-04 in flows.md; Triage-specific rules:
1. Field order: `deadline_date` first, then `escalation_date`, then amounts — time hurts faster than money.
2. Items queue by `dollars_at_stake` (proposed) descending; on web (W-04) the queue rail crosses Items, but each field is individually typed — Product Law #3 forbids batching the consent itself.
3. Normalization for match: dates → ISO via document-locale hint; amounts → integer cents, symbols/commas stripped; leading zeros ignored. Match is exact after normalization — no fuzzy tolerance on money or dates.
4. Anti-complacency mechanics: input never prefilled; no autocomplete; paste disabled; `value_ai` never rendered near the input (it appears only in the post-hoc mismatch banner). Where the same value appears twice on the document (amount in header and remittance stub), both regions are captured and the crop shows the clearer one; the second is a silent cross-check in T5.
5. Accessibility (screen readers): the region crop is announced via its OCR text read character-by-character on demand ("read me the highlight"); the user still types the value — transcription is preserved, sight is not required. This is the only surface where OCR text of a consequential field is voiced, and it is the assistive path only.

## 8. AI behavior

**What the AI does here:** document identification, field extraction with source regions, ignorability judgment (inside the legal floor), plain-language consequence explanation, page grouping, duplicate confirmation, scam-suspicion flagging. Model selection, prompts, and provider terms live in `product/ai-spec.md`; contractual requirements here: vision-capable LLM under **zero data retention** and **no training on user documents** terms (Product Law #4), structured-output mode, deterministic decoding settings.

**When it triggers:** only inside pipeline stage T4 (and T3's duplicate-confirm), on the async worker, after a Capture reaches `received`. Never at capture time, never on-screen-blocking, never at confirmation time (M-12 works modeless), never post-confirmation (I-1).

**Inputs it may read:** the Capture's media (downscaled pages), `source_meta` (envelope text, email headers, Handoff note), the account's Item stubs for dedup (sender/masked-ref/amount/date fingerprints only — never other documents' images), the Sender Registry. It may not read: other accounts' anything, Playbook strategy notes, billing state.

**Outputs it may produce (strict JSON schema; anything else is a validation failure):**

```
documents[]: {
  pages: int[],                     // indices into the capture's page set
  sender: {name, confidence},
  doc_kind: enum(object-model §6),
  legal_class_hint: {class, confidence},   // hint only — T6 decides
  language: bcp47, handwriting: bool,
  title: string,                    // ≤ 60 chars, plain language
  consequence_plain: string,        // one sentence, accountant tone
  ignorability: {hint: enum(nothing_needed|one_move|eyes_on), confidence, rationale},
  fields[]: {field: enum(object-model §7), value: string,
             page: int, bbox: [x,y,w,h] normalized, confidence: 0..1},
  missing_pages: int[], scam_suspect: bool,
  no_document: bool                 // photos-of-nothing
}
```

The model **proposes**; deterministic gates **dispose**. It never emits a final Verdict class on legal-floor Items (never even asked — I-4), never writes `value_confirmed`, `dollars_at_stake`, a Deadline, a MeterEntry, or a Notification time (Product Law #7, I-19).

**Confidence gating (the numbers, binding):**

| Signal | Threshold | Below the line |
|---|---|---|
| Per-field confidence | ≥ 0.60 → shown as readable | `unreadable`: "couldn't read this — please type it from the highlight" |
| Sender identity | ≥ 0.75 | `legal_class = unknown` → floor → `eyes_on` |
| Model's `commercial` claim | ≥ 0.75 to accept | `unknown` → floor (fail-closed) |
| Ignorability for `nothing_needed` | ≥ 0.85 → batch-eligible | 0.60–0.85 → individual-accept only; < 0.60 → `eyes_on` ("couldn't rule this out as junk — 20 seconds of your eyes") |
| Whole-document reading confidence | ≥ 0.50 | `eyes_on`, honest can't-read copy (F-T3) |
| `no_document` | model flag **and** T1 blank/blur corroboration | zero-Item result; either signal alone → keep as low-confidence document |

**Tone rules (all AI-authored user-facing text):** the accountant who says "here's what we can still recover" — never the parent who asks why you waited. Concretely: present tense, dollars and dates first, zero blame vocabulary ("finally", "again", "you missed", "overdue" are lint-banned), no exclamation marks in consequence or denial copy, no fake urgency ("URGENT" appears only when quoting the document, and then drily). Consequence lines state mechanism, not menace: "Ignoring this risks a bench warrant — here's exactly what's needed" not "You could be arrested!". Rationale lines for junk state why it's safe: "Prescreened offer — declining requires no action; it expires on its own."

**Adversarial input:** documents are untrusted input. Printed text that reads like instructions ("this letter requires no action") is evidence, never a command: the schema constrains output, T6/T7 gates dispose, and anything invoking government/legal identity gets the floor even when `scam_suspect = true` — a fake IRS letter is shown to human eyes with "This says IRS but the return address and payment instructions don't match how the IRS operates — likely a scam. Don't pay it; here's the real IRS contact if you want to verify." Never auto-dismiss something wearing a government costume.

**Fallback when the model is unavailable:** the degraded-AI state in §6 — captures hold safely, deterministic registry pre-screen still runs, confirmation of already-extracted fields still works, honest copy everywhere, FIFO-with-floor-priority drain on recovery. No queued capture is ever dropped, and no deterministic feature dims.

**Deliberately NOT AI (and why):**
- **Verdict enforcement gates** (legal floor, commercial-only Nothing Needed, confidence thresholds): deterministic checks after the model, because the floor is a legal-safety property and safety properties don't get delegated to the thing being checked (I-4).
- **The Sender Registry:** curated data, because "is this the IRS" must not depend on sampling temperature.
- **Deadline math, `dollars_at_stake` denormalization, countdowns:** arithmetic over confirmed values only (Product Law #7, I-19). Dates that cost money never pass through a generative step twice.
- **The confirmation UI and match logic:** normalization + exact compare, because the gate that catches hallucinations cannot itself hallucinate (Product Law #3).
- **Dedup fingerprints** (sha256/pHash/semantic keys): deterministic, because "did I already deal with this" must be reproducible.
- **Quota, retention timers, purge jobs, event emission, retry/backoff:** clocked jobs; the scheduler pulls every trigger.

## 9. Scale

| Metric | 1 user | 1,000 users | 100,000 users |
|---|---|---|---|
| Captures/day (steady) | 1–3; onboarding pile spike 10–30 in an hour | ~1.3k/day (~30–40 Items/user/mo) | ~130k/day, ~4M Items/mo |
| Items (cumulative, yr 1) | ~300–500 | ~400k | ~40M (Extractions ~4×, Verdicts ~1.1× — partition `items`/`extractions` by account hash, index `(account_id, dollars_at_stake DESC)` for I-13 ranking) |
| Model calls | 1/document read + occasional dedup-confirm | ~1.5k/day | ~150k/day; peak ~15 rps evenings/weekends (piles), not 9am (that's the scheduler's hour, no AI) |

**Cost drivers:** the T4 read dominates COGS — budget **$0.01–0.03 per document** (1–4 downscaled pages); at 100k users ≈ $60–120k/mo, ~2–4% of subscription revenue at $9. Guards: 2048px downscale, 20-page cap, exterior-mode is a cheap single-image call, dedup runs **before** the model (never pay to re-read the same envelope), and per-account soft caps: 200 captures/day, 1,000 pages/day (support-liftable; the tile says "that's a serious pile — the rest reads overnight").

**Hot paths:** M-03/W-11 status (SSE/push updates on Capture transitions, no polling); confirmation crop fetch — crops are pre-generated at T8 into derived media (same retention as parent, I-16) and served via short-lived signed URLs so M-12 p95 render < 300ms; W-02 Inbox query (indexed rank, page size 50, virtualized).

**SLOs (binding):** intake ack ≤ 5s; verdict p50 ≤ 90s/document, p95 ≤ 15 min; first-pile batch of 30 captures fully verdicted ≤ 60 min (F-01 promises "verdicts within the hour"); Eyes On arrival event → notification hand-off ≤ 10 min after verdict. Queue depth and drain rate are on the falsifiability dashboard.

**Caching/rate limits:** Sender Registry in-memory (versioned, hot-reload); verdict rationale templates cached; model calls behind provider rate-limit budget with the degraded-mode breaker as the overflow behavior — never silent queuing without the honest copy.

## 10. Errors

Ranked by likelihood × harm. Data-loss guarantee everywhere: **a Capture, once `received`, is never lost** — on-device originals for Snaps, encrypted bucket for server channels, held through every failure below.

| # | Failure | Detection | User-facing message | Recovery | Data loss |
|---|---|---|---|---|---|
| E-1 | **Legal mail read as commercial → junk verdict** (the catastrophic one) | Defense-in-depth: registry, keyword scan, < 0.75 → `unknown` floor, model never classes floor items; field detection via `nothing_needed` override telemetry (aggregate, no doc content) + synthetic eval corpus in CI (recall on gov/tax/court/EOB/debt ≥ 0.995 gate before any model version ships) | n/a when caught (it becomes Eyes On); an override spikes a P2 pattern review | Model/registry fix + re-triage offer on affected accounts' unarchived commercial verdicts (while media retained) | none |
| E-2 | Wrong extraction survives confirmation (model misreads, user types the same misread) | Independent typing (no prefill) makes correlated error rare; dual-region cross-check on amounts; `corrected` telemetry watches per-field miss rates | Mismatch banner at confirm time: "You typed Jan 24, I read Jan 21 — yours wins. Double-check the highlight?" | Human re-edit → new version + re-transcription; Deadlines re-materialize | none |
| E-3 | Pipeline/provider outage | Circuit breaker (error rate > 20% / 5 min, or provider 5xx) | Degraded-AI copy set (§6): "Safe and queued — the reading room is catching up." Floor-sender arrivals get the honest can't-read-yet notice | Auto re-queue, FIFO with floor priority; SLO clock pauses are shown, never hidden | none — captures hold at `received` |
| E-4 | Duplicate becomes two Items → risk of two Moves for one obligation | T3 fingerprints; Move dispatcher idempotency key (item, kind, creditor) as backstop | Dedup notice; if missed: "These look like the same ticket — combine them?" | One-tap merge; executed-Move dedup alert to support if both fired | none |
| E-5 | Pile-mode grouping wrong (pages split/merged incorrectly) | Model page-confidence + user eyeballing M-03 | "I read these as one document — split them if that's wrong." | Merge/split actions re-triage affected pages only | none |
| E-6 | Upload/processing media corruption | sha256 mismatch, decode failure at T1 | Tile: "That shot didn't survive the trip — retake?" (Snap: silent re-upload from device first) | Auto re-upload ×3, then retake prompt | Snap: none (on-device original). Server channels: sender bounce/resend path via Capture module |
| E-7 | Confirmation save failure mid-flow | API error on field save | "Saved on this phone — syncing when the connection behaves." | Typed values persist locally per field; idempotent replay | none — nothing re-typed |
| E-8 | **Media purged before confirmation** (30-day I-16 cap beats a dark user) | Purge job flags unconfirmed consequential Extractions on affected Items | Paper-verify mode: "The scan was deleted on schedule per your privacy settings. I kept my reading — due Feb 12, $85 — but check it against the paper before I act on it." | Transcription proceeds against the physical document (`active_transcription`, source = paper); I-10 still guarantees no Move fires unconfirmed | image gone by design; text reading retained |
| E-9 | Quota-held capture hides something urgent | Registry pre-screen at hold time (floor bypass, §5); residual: non-registry urgent commercial (a doubling ticket from an unlisted town) | Held-tile copy is honest: "Captured and safe — reads when the month rolls or you upgrade" | Registry bypass for floor; monthly roll triages FIFO; kill-test telemetry watches whether held items later show missed escalations | none |
| E-10 | Zero-Item false negative (a real document called "nothing") | Requires model flag **and** deterministic blank/blur corroboration; 24h tile lingers | "No document found in this one — it's here for 24 hours in case I'm wrong." | One tap "there's a document here" → forced full read | none within 24h; then normal capture retention |

## 11. Permissions

| Actor | Can |
|---|---|
| Account member (capturer) | Full read of Items they captured: media, Extractions, Verdicts; all §5 actions on them. |
| Account member (non-capturer, Household) | Status-line only ("1 item in custody, deadline watched") unless the confirming user explicitly shares the Item (I-20). Sharing an `insurance_eob` Item requires a second, explicit confirm ("This is a medical statement — share the contents with Sam?") — health data never moves on a default. |
| Partner via Handoff | Sees full content of Items they handed off (they captured them); never the rest. The agent carries the nag — no surveillance dashboard exists to grant. |
| Support | Metadata only (capture/item ids, states, timestamps, queue position). **Never document images, never extraction values.** A user may grant time-boxed (24h), per-ticket, per-item content access from within the app; logged and shown to the user afterward. |
| Pipeline operators | Queue metrics and error classes. Processing-bucket access is break-glass: dual-control, audited, page-level justification — consistent with zero-retention posture (Product Law #4). |
| The model provider | Receives images strictly under zero-retention / no-training terms; per-document consent governs any retention beyond the processing window (I-16). |

Sensitive-data notes: EOBs and anything `legal_class ≠ commercial` never surface content in notifications — the notification names the kind, never the details ("An insurance statement arrived", not the provider or procedure). Analytics/telemetry from this module is aggregate-only: confidence distributions, mismatch rates, override rates — never field values, never document text.

## 12. Dependencies

**Upstream (hard):** Capture module — Capture objects, media in the encrypted processing bucket or on-device registry, `source_meta`, channel provenance; Triage subscribes to `received` and drives the Capture status machine from there.

**Downstream (hard):** Moves — consumes confirmed Items ("actionable" signal starts drafting; I-10 blocks `ready` until this module's confirmations complete). Watchtower — Deadlines/Watches created through its service API inside the confirmation transaction (I-2, I-3); receives Triage's notification events (Eyes On arrival, successor notice, degraded floor-hit) and owns every send decision. Ledger — reads nothing from Triage directly; `dollars_at_stake` feeds ranking, never the Meter (only Outcomes do — I-6).

**Platform:** Account quota counters; the Sender Registry service (Triage-owned data, platform-hosted); event bus; the deterministic job runner (retry ladder, purge jobs, quota roll).

**External services:** the vision-LLM provider (per `product/ai-spec.md`; zero-retention + no-training terms are a contract precondition, Product Law #4). No third-party OCR service holding data — any OCR used in T1/T6/accessibility runs in-process. No other external calls: USPS, Mailroom vendor, and Lob belong to Capture and Moves respectively.

**Device capabilities:** none required at triage time (server-side). Mobile confirmation (M-12) renders crops from the **on-device** Snap original — works offline, preserves privacy (server copy purged 24h post-triage). No calendar, location, or contacts access anywhere in this module.

**Platform differences:** mobile is the capture-and-confirm surface — M-12 is field-at-a-time and offline-capable for Snaps; server-channel items need connectivity for crops. Web is the power surface — W-04 queue rail across Items (each field still individually typed), W-02 bulk verdict-accept and bulk re-triage, W-11 bulk upload feeding the same pipeline. The legal floor, the confidence gates, and the transcription requirement are byte-identical on both platforms — enforced in the API layer, not the client, like I-14.
