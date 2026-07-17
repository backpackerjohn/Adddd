# Module: Moves

> Module 3 of 5 (`product/brief.md` §5). Pre-executed recovery actions: drafted waiver letters, payment-plan requests, cancellations, contest letters, return checklists, call scripts — plus the per-creditor Playbook corpus (the moat, crown condition #8). Owns **Move, Draft, Playbook, Outcome** (`product/object-model.md` §9–12). Screen IDs reference `product/flows.md`. Terminology is the brief's glossary, used exactly.

## 1. Purpose

Moves exists because the failure point is the recovery step, not awareness ("I filed bankruptcy at age 23, in large part because I just couldn't call and work out payment plans" — `research/pain-points.md` Cluster 4, the ADDitude quote). Triage answers *what is this and what does it cost*; Moves does the 90% the user cannot self-initiate: it composes the waiver letter, the payment-plan request, the cancellation email, the contest letter, and the return checklist against the specific creditor, and hands the user a single reviewed action per day — read, tap the send gate, done in 90 seconds. "Working" means three things: (1) every confirmed actionable Item has a Move drafted and `ready` before the next 9am scheduler run; (2) every executed Move gets an Outcome — granted, denied, or no-reply — and only Outcomes ever move the Tax Meter (I-6); (3) every Outcome, including denials, feeds the per-creditor Playbook so the next user's ask is better-aimed than the last. Denials are relayed neutrally under the agent's identity and converted into the next move, never into a wound (Product Law #6). Moves writes words; it never pulls a trigger — the deterministic scheduler offers, the human tap sends, and Molehill never pays, holds credentials, or moves money (Product Law #7, #10; I-10, I-11, I-19).

## 2. User goals

- I want the letter/email I could never make myself write to already exist, so that the only thing left is reading it and tapping send.
- I want exactly one move offered per day, so that the pile never becomes a wall of asks.
- I want to see the real dollars this move is worth before I spend 90 seconds on it, so that I know why it's today's move.
- I want nothing ever sent or paid without my explicit tap, so that I stay in control of everything with my name on it.
- I want to know what happened after I sent it — waived, denied, or silence — without chasing a reply myself.
- I want a "no" delivered to me the way an accountant would deliver it, with the next option attached, so that one denial doesn't end my willingness to ask.
- I want the ask to be as sharp as possible for *this specific creditor* — right address, right phrasing, honest odds — so that my letter isn't a form letter.
- I want the return sitting in my trunk turned into a checklist with the nearest drop-off, so that "make the return" stops being a fog and becomes four steps.

## 3. Objects

| Object | Ownership | Role in this module |
|---|---|---|
| **Move** | **Moves (source of truth)** | One pre-executed recovery action. Fields, lifecycle: object-model §9. Launch kinds: `waiver_letter`, `payment_plan_request`, `cancellation`, `payment_walkthrough` + `contest_letter` (the fine variant pair), `return_checklist`, plus `second_ask` (denial follow-up, required by F-07) and `call_script` (execution variant when a creditor only takes phone). `appeal` (formal government appeal packets) is months 2–6. |
| **Draft** | **Moves (source of truth)** | The composed words (object-model §10). Every date/amount in `body` is a merge-locked slot bound to a confirmed Extraction (`merge_values`), injected deterministically — the composer writes prose around locked slots, never numbers (I-1, Product Law #7). `tone_checked` lint is mandatory before `final`. |
| **Playbook** | **Moves (source of truth)** | Per-(creditor_key, action_kind) corpus: grant rates, response SLAs, distilled tactics. Belongs to Molehill, not any Account; zero PII, zero document text (I-15). Object-model §11. |
| **Outcome** | **Moves (source of truth)** | What actually happened: `granted` \| `partial` \| `denied` \| `no_response` \| `user_reported_done` \| `withdrawn`. The **sole** source of MeterEntries (I-6). Object-model §12. |
| Item | Triage | Read-only parent; Moves subscribes to the confirmation fan-out ("Item confirmed actionable") and to Verdict supersedes (re-draft trigger). |
| Extraction | Triage | Read-only merge sources. Only `confirmed`/`corrected` Extractions may fill a merge slot (I-1, I-10). |
| Watch / Deadline | Watchtower | Read for `is_deadline_critical` and stale detection; Moves requests one `renewal_date` Deadline via Watchtower's API after a cancellation executes (the "did the charge actually stop" check, §10 E-7) and a `response_due` timer for every executed Move's reply window. All clocks are Watchtower's (I-19). |
| Notification | Watchtower | Moves emits events (`move_ready`, `outcome_relay_ready`, `no_reply_checkin`, `stale_redraft`); Watchtower's deterministic scheduler owns every send, cap, and quiet-hours decision. Moves never sends a notification itself. |
| Capture | Capture | Creditor replies arrive as Captures (forward-in thread, Mailroom scan) and are matched to open Moves (§7 F-M4). Reply-to on every Molehill-sent email is the account's forward-in address, so replies auto-ingest. |
| MeterEntry / BillingState | Ledger | Moves' Outcome-recording job writes MeterEntries (deterministic amounts only) and emits a `billable_recovery` event when `pricing_mode ∈ {per_recovery, hybrid}` and the Outcome is `granted`/`partial` — flat fee from `fee_table`, never a % (Product Law #5). |

> **Object-model extension (requires `BUILD_LOG.md` entry):** Move gains two nullable fields — `variant_group_id` (ulid; a fine Item drafts `payment_walkthrough` and `contest_letter` as one variant pair, exactly one active at a time; M-14 "switch variant" swaps them) and `parent_move_id` (fk → Move; set on `second_ask` so the follow-up can quote the sent Draft). Move also gains `decline_count int default 0` (drives §5 auto-offer retirement). The per-kind response-wait table (§7 F-M4) ships as versioned config data, not schema.

## 4. Lifecycle

Full state machines live in object-model §9–12 and are law. This section maps states to what the user sees.

**Move** — `drafting → ready → offered → in_review → approved → executing → executed → outcome_pending → closed`, side-states `declined`, `snoozed`, `stale`.

| State | User sees |
|---|---|
| `drafting` | M-11/W-03 Move row: "drafting the letter…" No send affordance exists yet. |
| `ready` | Move row: "ready when you are." It waits for the scheduler (or a self-initiated open) — no pressure copy, no countdown unless a real Deadline supplies one. |
| `offered` | The M-01/W-01 card: "One move today: your parking ticket doubles $85 → $170 Friday." `offered_on` stamped. |
| `in_review` | M-14/W-05: the Draft with merge-locked values visually pinned to their source Extractions, Playbook line when validated ("this issuer waives 72% of first asks"), the send gate. |
| `approved → executing → executed` | Gate tap → "Sending…" → M-15: "Sent. $85 doubling averted — pending their reply." Dispatch failure is loud and honest ("not sent — nothing went out. Retry?"). |
| `outcome_pending` | M-11/M-05 partial: "waiver sent — awaiting reply (typ. 14 days)." Greyed on the Ledger, never counted (the Meter never lies). |
| `closed` | Outcome chip on the Item; MeterEntry visible in M-05/W-07 when dollars landed. |
| `declined` / `snoozed` | Neutral. "Not this one" returns it to the pool for tomorrow; snooze re-offers on the chosen day. No badge, no debt. |
| `stale` | Deadline passed while user was dark (non-critical only): Move re-drafts as the post-deadline variant. Copy is gain-framed only: "Here's what we can still recover: $85." Never a quantified missed loss (I-8). |

**Draft** — `generated → edited (0..n) → final → sent`, or `discarded`. User sees version history on W-05; `sent` Drafts are immutable records, viewable from M-15/M-16 ("view the sent letter"). Retention follows the Item (document-derived text); a `sent` Draft additionally survives while its Outcome is open because `second_ask` quotes it.

**Playbook** — `seed → learning → validated → deprecated`. Users never see `seed` or `learning` stats: below `n_attempts ≥ 5`, M-14 shows the generic honest line ("First-time late-fee waivers are routinely granted when you ask — most issuers allow one a year"), never fake precision. At `validated`, real numbers render ("Chase waives 72% of first asks · median reply 9 days"). `deprecated` playbooks stop rendering stats immediately.

**Outcome** — `pending → recorded → amended`. `pending` renders as awaiting-reply. `recorded` triggers the relay (grant or neutralized denial) and Meter math. `amended` (user disputes the recorded amount, M-16 secondary) reverses and re-issues MeterEntries — append-only, never edited in place (I-6).

**Retention:** Moves/Drafts/Outcomes purge with their Item (object-model rows). Playbook aggregates survive account deletion because they contain nothing to delete (I-15).

## 5. Actions

### User-initiated

| Action | Trigger / Screen | Preconditions | Effect | Feedback | Undo |
|---|---|---|---|---|---|
| Open today's Move | M-01/W-01 card, or the 9am push | Move `offered` | → `in_review`, M-14/W-05 | Draft + locked values + Playbook line | Back out freely; stays offered today |
| **Send gate** | M-14/W-05 primary | I-10: all consequential Extractions confirmed **and** Draft `final` **and** this explicit tap — three independent dispatcher checks | `approved → executing`; email/Lob dispatch | M-15: "Sent. $85 doubling averted — pending their reply." | None after dispatch accept — and the UI says so on the gate: "This sends the letter. There's no unsend." Pre-dispatch failure returns to gate with "nothing went out" |
| "I did it" (pay/do gate) | M-14, `user_manual` kinds | walkthrough/checklist/script shown | `executed` by attestation; Outcome path opens | "Done. I'll verify the result." | "Actually, I didn't" within 24h reverts to `ready` |
| Edit Draft | M-14 (light) / W-05 (versioned editor) | Move ≤ `in_review` | New Draft version, `authored_by = user_edit`; merge slots are **not** inline-editable — touching a locked value routes to re-transcription (M-12, I-1) | Live preview; tone lint re-runs, warnings are advisory for user text | Restore any version (W-05) |
| Switch variant | M-14/W-05 ("pay it ↔ contest it") | `variant_group_id` pair exists | Active Move swaps within the group; the other goes dormant, never deleted | "Switched to the contest letter. Paying stays available." | Switch back any time |
| Decline ("not this one") | M-01/M-14 | Move `offered` | `declined`; `decline_count += 1`; pool re-ranks for tomorrow. At `decline_count = 2` the Move retires from auto-offer (still executable from M-11/W-03; returns to auto-offer only if it turns deadline-critical) | "Okay. Tomorrow I'll bring the next one." — zero guilt vocabulary | Execute it manually any time |
| Snooze | M-01/M-14 | Move `offered` | `snoozed` until a chosen day ≤ 7 days out; that day it takes the slot with priority | "Thursday it is." | Un-snooze from M-11 |
| Self-initiated Move | M-11/W-03 "do this one now" | Move `ready` (any, not just offered) | Same gates, same flow. The one-move cadence caps what Molehill *asks*, never what the user *does* | Identical M-14 flow | n/a |
| Record outcome myself | M-11/M-16 "they replied to me directly" | Move `outcome_pending` | User picks granted/partial/denied/no change; amounts stay deterministic (§7 F-M4 rule) | "Recorded. $35 on the meter." | Amend (reversing entries) |
| Accept second-ask offer | M-16 primary | Outcome `denied`, relay done | `second_ask` Move drafts (quotes the sent Draft, adds the escalation ask) → normal M-14 flow | "Drafting the second ask — ready shortly." | Decline the offer; it stays available on M-11 for 30 days |
| Dispute recorded amount | M-16 secondary | Outcome `recorded` | Outcome `amended`; MeterEntry reversal + re-issue | "Fixed — the meter now shows $20." | Amend again |
| Mark handled outside Molehill | M-11 overflow | any open Move | Outcome `user_reported_done`, no MeterEntry unless user supplies the result via "record outcome" | "Filed. Nothing further from me on this one." | Reopen within 14 days |
| Withdraw a sent ask | M-11 overflow | `outcome_pending`, kind ∈ letters | Outcome `withdrawn` (e.g., user paid it independently); reply-matching stops | "Understood — I'll stop watching for a reply." | n/a |
| Add optional context line | M-14 pre-send ("anything they should know?") | composing letters | One user-typed sentence (e.g., "I was hospitalized in March") merged into the Draft **only** with its explicit include-toggle on; flagged `user_provided` | Preview updates | Toggle off; line never persists to Playbook (I-15) |

### System-initiated

| Action | Trigger | Effect |
|---|---|---|
| Draft composition (§8 pipeline D1–D5) | Triage confirmation fan-out signals "Item confirmed actionable"; Verdict supersede; denial → second-ask acceptance | Move `drafting` → Draft `generated` → tone lint → merge-slot verification → Move `ready`. SLO: ready ≤ 10 min after confirmation (§9) |
| **Scheduler handoff (One Move a Day)** | Watchtower's 9:00-local clocked job calls Moves' `offer_next(account, date)` — idempotent per (account, date) | Deterministic selection from the ready pool: (1) every deadline-critical ready Move is offered, cap-exempt (I-5); (2) else `snoozed`-to-today first; (3) else max `dollars_at_stake`; ties → nearest linked Deadline, then oldest `created_at`. Exactly one cap-counting `daily_move` Notification results (I-7). Moves owns the pool and the ranking; Watchtower owns the clock and the send |
| Dispatch | Send-gate tap | Email via Molehill sending domain (reply-to = account forward-in address), or postal via Lob (`postal_lob`; certified where the kind's config demands it — gym cancellations). Idempotency key (move_id, draft_version) — a double-tap can never double-send |
| Response-wait timer | Move `executed` | Watchtower `response_due` timer per kind/channel (table in F-M4). Expiry → `no_reply_checkin` event |
| Reply matching | Capture triaged as creditor correspondence | Match to open `outcome_pending` Moves by (thread-id/references header) → else (creditor_key + masked account ref + open window). Confident match → Outcome pipeline; ambiguous → user confirm: "This looks like Chase's reply about the late fee — is it?" |
| Outcome recording + Meter write | Outcome `recorded` | Deterministic job writes 1–2 MeterEntries (I-6): amounts computed **only** from confirmed Extractions (averted = `escalation_amount − amount_due`, etc.) or reply-transcribed values (F-M4 rule 4). Emits `billable_recovery` when applicable |
| Denial neutralization | Reply classified `denied` | `relay_state = pending_neutralization` → AI neutral summary → lint (I-8/I-9) → `relayed`; Watchtower sends one agent-identity notification. Raw text never pushed |
| Stale re-draft | Linked Deadline `missed_documented` (non-critical, user dark) | Move `ready → stale` → re-composed as post-deadline variant (waiver → late-fee waiver; pay-before-doubling → escalation-waiver ask). Gain-framed copy only (I-8) |
| Cancellation verification | `cancellation` Move `executed` | One `renewal_date` Deadline via Watchtower; at renewal + 3 days: "Renewal date passed — did the charge stop?" (§10 E-7) |
| Playbook update | Outcome `recorded` | Deterministic counter increments on (creditor_key, action_kind): `n_attempts`, `n_granted`…, `median_response_days`. `learning → validated` at n ≥ 5. Weekly AI generalization pass proposes `strategy_notes` updates from aggregates only, behind redaction lint + ops review (§8) |

## 6. States

Moves' surfaces are the Move card on M-01/W-01, M-14/W-05 (Move Detail / Draft Editor), M-15 (Move Sent), M-16 (Outcome/Denial), and the Move rows of M-11/W-03. Per-screen state tables in `product/flows.md` are law; below is what Moves contributes.

| State | Behavior and copy |
|---|---|
| **empty** | M-01 with no ready Move: "Nothing needs a move today. 4 deadlines under watch." Calm; no fabricated urgency, no "come back tomorrow" nag. |
| **loading** | M-14 header (dollars, kind) renders instantly from the Move row; Draft body streams from cache. The send gate never renders before the full final Draft is on screen — no blind sends. |
| **ideal** | Draft + pinned merge chips (tap a chip → its source-region thumbnail) + Playbook line (validated only) + send gate. 90-second review target. |
| **partial** | One value unconfirmed → gate disabled with the reason and the fix: "Confirm the amount first — 30 seconds" → M-12 (I-10). Outcome pending → greyed Ledger row "awaiting reply (typ. 14 days)". |
| **error** | Dispatch failure: "Not sent — nothing went out. Retry?" — the failure state is explicit; a Move is never shown as sent unless the channel accepted it. Outcome-fetch failure on M-16: cached relay text, retry. |
| **offline** | M-14 read/edit works; send gate queues **only** with explicit consent copy ("Will send when you're back online — cancel any time before then") and a cancel affordance until dispatch. `user_manual` attestations queue silently. |
| **degraded-AI** | Existing `final` Drafts are fully reviewable and sendable — sending is deterministic. Re-draft and AI-revise requests queue: "Editing help is catching up — you can edit by hand." New confirmations produce Moves in `drafting` that hold with honest copy ("The letter's queued to write — your numbers are locked in"). Denial replies: deterministic facts relay ("Their reply arrived — marked denied; summary coming"), raw text stays behind the tap, never auto-shown (I-9). |
| **awaiting-reply** (module-specific) | `outcome_pending`: M-11 shows the sent Draft, the wait clock ("day 6 of typ. 14"), and "they replied to me directly" self-record. |
| **stale** (module-specific) | Re-drafted card: "The pay-at-$85 window has passed. New plan: I've drafted an escalation-waiver ask. Recoverable: $85." Never the incurred number, never "you missed" (lint-banned vocabulary, I-8). |

## 7. Workflows

Cross-module masters: F-02 (daily One Move), F-07 (denial arrival) in `product/flows.md`. Moves-internal flows:

**F-M1 — Draft composition (every actionable Item)**
1. Trigger: Triage's confirmation fan-out (F-04 step 6) signals the Item actionable; kind selection is deterministic from `doc_kind` + Extraction set: late fee present → `waiver_letter`; unpayable `amount_due` flag from user → `payment_plan_request`; `subscription` → `cancellation`; `fine` → variant pair `payment_walkthrough` + `contest_letter`; `return` → `return_checklist`. Ambiguity → the AI proposes, the user's M-14 variant picker disposes.
2. **D1 Slot manifest (deterministic):** the merge map is built first — `{deadline_date, amount_due, escalation_amount, account_ref_masked, sender, contact_channel} → extraction_id`, all `confirmed`/`corrected` only. Missing consequential slot → Move stays `drafting`, Item flagged back to M-12. A Move can never reach `ready` on unconfirmed numbers (I-10).
3. **D2 Playbook fetch:** `creditor_key` from the deterministic normalizer (lowercase, strip legal suffixes, alias table; unknown senders → null playbook — long tail starts playbook-less). Strategy notes and channel preference (email vs certified letter vs phone-only) feed the compose call.
4. **D3 Compose (the model call, §8):** prose around locked slots, per-kind skeleton, creditor-specific tactics, accountant tone. Output slots are placeholders, never values.
5. **D4 Deterministic merge + verify:** template engine injects confirmed values into slots; a post-merge scanner proves every date/amount token in `body` maps to a slot (any free-floating number that parses as money/date and isn't slot-bound = compose failure, re-run; 3 failures → degraded hold). This is the mechanical guarantee behind Product Law #7.
6. **D5 Tone lint:** banned vocabulary ("finally", "again", "you missed", "overdue", "sorry for being…", self-blame constructions), no exclamation marks, no groveling. Pass → Draft `generated`, Move `ready`. SLO: ≤ 10 min from confirmation.

**F-M2 — The five launch Moves (kind-by-kind spec + reference copy)**

*Copy below is the launch reference corpus — `{{slots}}` are merge-locked. Tone: the accountant who says "here's what we can still recover," never the parent who asks why you waited.*

1. **`waiver_letter` (late-fee waiver)** — channel: email (postal fallback). Wait: 14d email / 21d postal.
   > Subject: Request for one-time late fee waiver — account ending {{account_ref_masked}}
   > To {{sender}}: A {{amount_due}} late fee was assessed on the account ending {{account_ref_masked}}. The underlying payment has been made. This is the first late fee on this account, and I'm requesting a one-time courtesy waiver. I've been a customer in good standing and would appreciate the adjustment. Please confirm in writing. — {{user_name}}
   Meter on grant: fee already charged → `recovered {{amount_due}}`; fee pending → `averted`.
2. **`payment_plan_request`** — channel: email/portal message (postal for collectors — but note debt-collection Items are legal-floor: Eyes On, user-driven, Molehill drafts and the user reviews with full attention; nothing about the floor is skipped). Wait: 14d.
   > Subject: Payment plan request — account ending {{account_ref_masked}}
   > To {{sender}}: I owe {{amount_due}}, due {{deadline_date}}. I want to pay this and can't do it in one payment right now. Please send the options for a payment arrangement — I can begin this month. I'd rather set this up now than miss the date. — {{user_name}}
   Meter: no entry on acceptance (nothing recovered yet); `averted` late-fee/escalation amounts only when deterministic (a confirmed `escalation_amount` existed and the plan landed before `escalation_date`).
3. **`cancellation` (subscription/membership)** — channel: email; **certified postal via Lob** where the merchant's cancellation terms require written notice (gyms — Playbook carries the requirement and the member-services address). Wait: 7d email / 14d certified.
   > Subject: Cancellation — effective immediately
   > To {{sender}}: Cancel the subscription associated with {{account_ref_masked}} / this email address, effective immediately. Do not retain me through offers; this is a final decision. Confirm the cancellation and the final billing date in writing. I don't authorize charges after that date. — {{user_name}}
   On execute: `renewal_date` verification Deadline set (§5). Meter on verified stop: `averted` = next renewal amount (confirmed Extraction).
4. **`payment_walkthrough` ↔ `contest_letter` (fine variant pair)** — the pay walkthrough is `user_manual`: numbered steps on the issuer's own payment site (Molehill never touches the payment — I-11), ending in "I did it" attestation. Meter: `averted` = `escalation_amount − amount_due` when paid before `escalation_date`. The contest letter (wait: 30d):
   > Re: Citation {{account_ref_masked}}, {{amount_due}}, due {{deadline_date}}
   > To {{sender}}: I'm contesting this citation on the following ground: [user picks from the issuer's accepted grounds — signage missing/obscured · meter or app malfunction · not the registered vehicle · already paid · other, one line]. Supporting detail: [optional user context line]. While this is under review, I request the fine be held at {{amount_due}} rather than escalating to {{escalation_amount}}, per your review policy. Please confirm receipt. — {{user_name}}
   M-14 shows the honest fork: "Pay now: certain, {{amount_due}}. Contest: this authority grants 34% of contests (n=210 asks through Molehill); if denied you pay the same {{amount_due}} as long as the review holds escalation." Court-issued fines are legal-floor: Eyes On, walkthrough-first, no auto-anything.
5. **`return_checklist`** — `user_manual`. Built from the Item (store, amount, `deadline_date` = return window) + drop-off lookup:
   > **Return: {{sender}} — {{amount_recoverable}} back. Window closes {{deadline_date}}.**
   > 1. It's in the trunk. Grab it — box optional for this retailer.
   > 2. Start the return in the {{sender}} app/site → "free drop-off" option. (Link.)
   > 3. Nearest drop-off: UPS Store, 1.2 mi, open till 7 — show the QR they give you. No printing, no box needed.
   > 4. Tap "I did it" here when it's handed over. {{amount_recoverable}} lands on your meter when the refund posts.
   Wait: refund window 14d after attestation → check-in. Meter on refund confirmed (forwarded refund email or attestation): `recovered {{amount_recoverable}}`.

`call_script` variant (any kind where Playbook says phone-only): word-for-word script with the number rendered tap-to-dial, opener ("I'm calling about a {{amount_due}} late fee on the account ending {{account_ref_masked}} — I'm requesting a one-time waiver"), branch lines for "yes/no/transfer", and the after-call outcome prompt ("How'd it go?" → granted/denied/call back). Voice-AI calls are months 2–6; at launch the human talks, Molehill scripts.

**F-M3 — One Move a Day: the scheduler handoff (master F-02)**
1. Moves maintains the ready pool per account; Watchtower's 9:00-local job calls `offer_next(account, date)` (idempotent).
2. Selection (deterministic, binding): all deadline-critical ready Moves → offered, cap-exempt, stacked above the card (I-5, I-7). Then exactly one of: snoozed-to-today > max `dollars_at_stake` > nearest Deadline > oldest.
3. The one `daily_move` push: "One move today: your parking ticket doubles $85 → $170 Friday." (Gain-framed default; loss-framed countdown only under `framing_pref = loss_optin`.)
4. Decline/snooze per §5 — neutral, re-ranked tomorrow. Nothing offered ever expires into shame; an unopened offer simply re-enters the pool (no `ignored` state on Moves — ignoring is Notification telemetry, not Move state).
5. Completing the Move does not surface a second card. M-01 goes calm ("That's the move. 4 deadlines under watch."). Self-initiated Moves from M-11/W-02 are unlimited and gate-identical — the cadence caps asks, never agency.

**F-M4 — Outcome capture (granted / denied / no-reply)**
1. **Reply path:** creditor replies to the letter → lands via forward-in/Mailroom → Capture → Triage → matched to the open Move (§5 matching). AI classifies: granted / partial / denied / needs-more-info / unrelated.
2. **Grant:** Outcome `granted` proposed. Amount rule (binding): the Meter amount is the deterministic expectation from confirmed Extractions. If the reply states the same → `recorded` automatically; relay: "The issuer waived it. $35 back on your meter."
3. **Partial / different number:** the reply's amount is a money-bearing extraction on a new Capture → active transcription applies (Product Law #3): "They came back with a partial: type the amount from their letter." User types → `partial` recorded with the transcribed amount. No AI-read number ever writes the Meter unverified.
4. **Denial:** → F-M5.
5. **No-reply:** wait timer expires (waiver 14d/21d · plan 14d · cancellation 7d/14d · contest 30d · return-refund 14d · second_ask = parent's) → one `no_reply_checkin` (cap-respecting): "It's been 14 days on the Chase waiver — no reply yet. About a third of waivers show up as a quiet statement credit. Worth a 30-second look at your latest statement: did a $35 credit land?" → "It's there" (granted, `evidence_kind = user_attestation`) / "Nothing yet" (`no_response` recorded; offers: resend nudge, `call_script`, or let it rest) / "They said no" (manual denial → F-M5).
6. **Deadline-passed-clean:** for `payment_walkthrough`/`cancellation` where the verification Deadline passes with confirmation → `evidence_kind = deadline_passed_clean`, deterministic.
7. Every `recorded` Outcome increments Playbook counters in the same job (F-M6). `no_response` counts as an attempt — silence is data.

**F-M5 — Denial handling (RSD-safe; master F-07)**
1. Denial classified → `relay_state = pending_neutralization`. The raw reply is never pushed, never auto-shown (I-9).
2. Neutralization (§8): one factual summary under the agent's identity, base rate attached (Playbook `second_ask_grant_rate` when validated; else the global figure): "Quick update on the Chase waiver — they said no this time. Second asks succeed ~40%. Want me to draft it?" Lint enforces: no "unfortunately", no exclamation, no commiseration theater, no quantified already-missed loss (I-8), always a next move attached.
3. `relay_state = relayed` → Watchtower sends it (respects cap + quiet hours; denials are never delivered 9pm–8am even if cap-exempt space exists — bad news waits for morning).
4. M-16: same neutral text; "show original reply" behind an explicit tap; second-ask offer as primary.
5. Accepted → `second_ask` Move (quotes the sent Draft via `parent_move_id`, escalates one register: supervisor/retention/executive-office address from Playbook): "I wrote on {{sent_date}} requesting a one-time waiver of the {{amount_due}} fee and received a denial. I'm asking for a second review… — {{user_name}}". Normal gates apply.
6. `n_denied` and the second-ask counters feed the Playbook — this user's "no" buys the next user a better-aimed ask. If the second ask lands: `granted` → MeterEntry → the denial retroactively becomes step one of a win. No MeterEntry for denials, ever (nothing recovered, nothing falsely averted).

**F-M6 — Playbook lifecycle (cold-start → validated → moat)**
1. **Cold-start (pre-launch curation):** seeded `seed` rows for ~50 top card issuers/banks, ~40 major subscription merchants (incl. the certified-mail gym chains), parking/toll authorities of the top 30 US metros, ~25 major retailers' return logistics, plus utility patterns. Seeds carry: correct addresses/channels, process requirements (certified mail, portal-only, citation-number-in-subject), and *externally sourced* base rates flagged `seed` — **never displayed as Molehill data**. Below n ≥ 5 real outcomes the UI shows only the honest generic line (§4).
2. **Learning:** every Outcome deterministically increments (creditor_key, action_kind) counters; `median_response_days` recomputed; `validated` at n ≥ 5 (k-threshold, I-15) → real stats render on M-14/W-05 and in denial relays.
3. **Generalization (AI, weekly):** reads aggregates + template-variant win rates + process facts distilled from creditor replies with all identifiers stripped; proposes `strategy_notes` edits ("This authority auto-holds escalation when a contest is filed online; the mail route loses 10 days"). Every write passes the redaction lint (no PII, no document text, no user context lines — I-15) **and** an ops review queue before publish. The corpus belongs to Molehill, survives account purges legally because there is nothing personal in it, and is the asset Gmail, Rocket Money, and a weekend wrapper cannot copy (crown condition #8).
4. **Deprecation:** grant rate collapses (>30-point drop over 20 attempts) or process change detected → `deprecated`, stats unrender, re-seed task opens.
5. Instrumented from user #1: every Outcome, including `no_response`, is corpus signal.

## 8. AI behavior

**What the AI does here:** recovery-draft composition against the specific creditor (prose around locked slots), kind proposal on ambiguous Items, creditor-reply classification (granted/partial/denied/needs-info/unrelated), denial-reply neutralization, second-ask composition, Playbook strategy generalization. Model/provider terms live in `product/ai-spec.md`; contractual floor here: zero-retention, no training on user documents or drafts (Product Law #4), structured-output mode for classification.

**When it triggers:** composition — async worker on confirmation fan-out, supersede, stale, or second-ask acceptance; classification/neutralization — async on reply-Capture match; generalization — weekly batch. Never at send time (dispatch is deterministic), never on the 9am path (selection is a sort), never post-`final` on a Draft the user approved (the approved bytes are what sends), never writing an Outcome amount or MeterEntry (I-6, I-19).

**Inputs it may read:** the parent Item's confirmed Extractions (values + field names), `doc_kind`/`legal_class`, the Playbook row for (creditor_key, kind), the user's optional context line (include-toggle on only), the sent Draft (for second asks), the matched reply Capture (for classification/neutralization). It may not read: other Items, other accounts' anything, images beyond the matched reply, billing state, notification history.

**Outputs it may produce:** Draft bodies with `{{slot}}` placeholders only — D4's post-merge scanner rejects any free-floating money/date token, so a hallucinated number cannot survive composition; classification JSON `{result, stated_amount_present: bool, needs_user_transcription: bool, summary_neutral}`; strategy-note proposals (lint + review gated). It never emits: a Meter amount, a send decision, a schedule time, a notification, a Verdict, or edited confirmed values (I-1, I-6, I-19; Product Law #7).

**Confidence handling:** reply classification < 0.80 → not auto-recorded; M-16 shows "Their reply arrived — I'm not certain how to read it. 30 seconds of your eyes?" with the original behind the tap and one-tap result buttons. Match-to-Move < 0.80 → user confirm before any Outcome work. Composition has no confidence path — it either passes D4/D5 deterministic verification or re-runs.

**Tone rules (binding for all Moves copy — Drafts, relays, check-ins):** the accountant, never the parent. Concretely: dollars and dates first; present tense; the creditor is addressed factually, never begged ("I'm requesting a one-time courtesy waiver", never "I'm so sorry, I know I messed up"); the user is never made to self-deprecate — hardship context is optional, factual, and user-authored; lint-banned everywhere: "finally", "again", "you missed", "overdue", "unfortunately", exclamation marks in relays, apology-for-existing constructions. Denials state fact + base rate + next move in ≤ 3 sentences.

**Adversarial input:** creditor replies are untrusted documents. Text that reads like instructions ("confirm your card number to process the waiver") is evidence, never a command — classification schema constrains output, and a reply requesting payment credentials or odd remittance flips `scam_suspect` and relays as: "Their reply asks for card details by email — that's not how {{sender}} normally processes waivers. Don't send them. Here's the official contact if you want to verify." Molehill itself never asks for or forwards credentials (I-11).

**Fallback when the model is unavailable:** §6 degraded-AI row — final Drafts send, gates work, dispatch works, timers run, Meter math runs, denial *facts* relay deterministically with the summary queued. Composition and neutralization queue with honest copy. No queued Move is dropped; nothing deterministic dims.

**Deliberately NOT AI (and why):**
- **The 9am selection and the entire scheduler handoff:** a sort over `dollars_at_stake` — an LLM deciding what to nag about is how you habituate users out of the product (brief §9).
- **Merge-slot injection and the D4 scanner:** dates and dollars in a letter with the user's name on it never pass through a generative step after confirmation (Product Law #7, I-1).
- **Send/pay gates and dispatch:** three dumb independent checks + idempotency keys (I-10); the trust line stays deliberately dumb.
- **Meter amounts and `billable_recovery` fees:** arithmetic over confirmed values; the Meter is the trust anchor and must be boringly correct (I-6).
- **Response-wait timers, stale detection, cancellation verification:** clocked jobs (I-19).
- **Playbook counters and the k-threshold:** deterministic increments; the moat's honesty is its value.
- **The tone/copy lint:** a banned-vocabulary and merge-field checker, because the gate that catches shame language can't itself improvise.

## 9. Scale

| Metric | 1 user | 1,000 users | 100,000 users |
|---|---|---|---|
| Moves created | onboarding burst 3–6 from the first pile; steady 2–6/mo | ~4k/mo | ~400k/mo (Drafts ~1.6×: edits + re-drafts + second asks) |
| Executed Moves / Outcomes | 1–4/mo | ~2.5k/mo | ~250k/mo; MeterEntries ~1.3× Outcomes |
| Model calls | ~5–10/mo (compose, classify, neutralize) | ~350/day | ~35k/day — text-only, cheap: budget $0.002–0.01 per compose, ~$3–8k/mo at 100k users, an order of magnitude under Triage's read costs |
| Playbook rows | ~150 seeded | ~2k keys, ~300 validated | ~50–150k keys (long tail), ~5–10k validated — the moat's growth curve is the company KPI (dollars recovered per user-year decomposes into grant-rate × ask-volume, both Playbook-visible) |

**Hot paths:** the 9am `offer_next` fan-out — per-account sort on an indexed `(account_id, status, dollars_at_stake DESC)` ready-pool view, sharded by timezone cohort (it is *not* a global 9am: it's 9am local, spread across 24+ offsets); dispatch queue (SMTP/Lob) with per-provider rate budgets; reply-matching lookup keyed by thread-id and (creditor_key, account, open-window).

**SLOs (binding):** Draft `ready` ≤ 10 min after confirmation fan-out (so the next 9am never offers an empty hand); send dispatch accept ≤ 60s of gate tap with loud failure otherwise; denial neutralization ≤ 30 min of reply triage (relay still respects cap/quiet-hours); `offer_next` cohort completion ≤ 5 min per timezone slot.

**Cost drivers & guards:** compose calls are bounded (one per Move + re-runs capped at 3); Lob postal ~$1–3/letter is the real COGS line — postal only where Playbook demands written notice or email bounced; per-account soft cap 20 sends/day (support-liftable) as an abuse guard. Playbook is in-memory-cached, versioned, hot-reloadable like the Sender Registry.

**Pricing hook (Product Law #5):** under `per_recovery`/`hybrid`, the launch `fee_table` is a flat **$3 per landed recovery** (`granted`/`partial` with dollars) — shown in advance on M-14 ("If this lands, it's a flat $3 — only when it lands"), never a percentage, never charged on denials, no-replies, or subscription-mode accounts.

## 10. Errors

Ranked by likelihood × harm. Data-loss guarantee: a typed edit, an attestation, or a gate decision, once made, is never lost — Drafts version, gates are idempotent, Outcomes append-only.

| # | Failure | Detection | User-facing message | Recovery | Data loss |
|---|---|---|---|---|---|
| E-1 | **Wrong number in a sent letter** (the catastrophic one) | Prevented in depth: merge slots from confirmed Extractions only (I-1), D4 free-token scanner, gate renders values pinned to source thumbnails, user reads before tapping | n/a when caught upstream; if a user reports one post-send: P1 incident, full pipeline audit | Correction letter drafted immediately, free, flagged to the creditor as Molehill's error, not the user's | none |
| E-2 | Double-send (double-tap, retry race, or re-offer after unnoticed success) | Idempotency key (move_id, draft_version) at dispatch; duplicate suppressed | Invisible — second tap lands on "Sent" state | n/a | none |
| E-3 | Reply matched to the wrong Move → wrong Outcome/Meter | Match confidence gate (< 0.80 → user confirm); creditor_key + masked-ref cross-check | "This looks like Chase's reply about the late fee — is it?" | One-tap re-assign; Outcome `amended` with reversing MeterEntries if already recorded | none |
| E-4 | Denial read as grant → false Meter credit | Amount rule (F-M4): auto-record only when reply matches the deterministic expectation; classification < 0.80 → human read; "dispute the recorded amount" always one tap on M-16 | "I read their reply as a waiver — if that's wrong, tap here and I'll fix the meter." (shown once on auto-recorded grants) | `amended` → reversal entries; classifier telemetry (aggregate) watches the false-grant rate against a ship-gate eval | none — Meter is append-only, always correctable |
| E-5 | Send dispatch failure (SMTP reject, Lob API down) | Channel ack required before `executed` | "Not sent — nothing went out. Retry?" | Retry ladder (1m/10m/1h); after 3, offers channel switch (email ↔ postal) or `user_manual` fallback ("here's the letter — their portal takes uploads") | none — Draft intact |
| E-6 | Cancellation "sent" but charges continue | Deterministic `renewal_date` verification Deadline (+3d) | "Renewal date passed — did the charge stop?" → "Still charged" | Escalation pack: resend as certified letter (Lob), dispute-the-charge walkthrough on the user's own bank site (never Molehill touching money — I-11), Playbook flags the merchant's channel as unreliable | none |
| E-7 | Email deliverability decay (sending domain spam-flagged) | Bounce/complaint-rate monitoring per domain; seed-list probes | Affected sends: "Email to this issuer is bouncing — switching this one to a mailed letter (adds ~4 days)." | Automatic postal failover for affected creditors; domain rotation is an ops runbook, never silent dropped mail | none |
| E-8 | User context line leaks into Playbook | Redaction lint on every `strategy_notes` write + ops review queue (I-15); user lines are schema-tagged and excluded at the generalization input boundary | n/a (internal) | Lint hit → write rejected, pattern reviewed | none |
| E-9 | Variant confusion: user pays the fine AND the contest letter is out | Variant group: activating one dormants the other; attestation on `payment_walkthrough` auto-withdraws the sibling | "You paid it — I've withdrawn the contest so nothing conflicting is on record." | `withdrawn` Outcome on the sibling | none |
| E-10 | No-reply check-in fatigue (silence prompts pile up) | Per-account cap: check-ins ride the daily cap (I-7), max one open check-in at a time; older ones resolve to `no_response` silently | Single combined line when several are pending: "Two letters are past their reply windows — 60 seconds to close them out?" | Batch resolution sheet on M-11 | none |
| E-11 | Stale re-draft frames a loss | I-8 lint on the stale template path (no incurred-dollar merge field exists in post-deadline templates — structurally impossible) + CI copy lint | n/a when caught; the stale card only ever states the recoverable number | Template fix; lint gate blocks ship | none |

## 11. Permissions

| Actor | Can |
|---|---|
| Account member (Item capturer) | Full: read Drafts, edit, gate, record outcomes, dispute amounts — for Moves on Items they captured. |
| Account member (non-capturer, Household) | Status-line only: "1 move sent, awaiting reply" — never Draft contents, never creditor names on money items, unless the Item was explicitly shared (I-20). A `partner_failover` ping names the deadline kind, never the Move's contents. The agent carries the nag; there is no surveillance dashboard to grant. |
| Partner via Handoff | Full access to Moves on Items they handed off (they captured them); the completion status-line ("Handled ✓") is all they see of execution detail unless shared. |
| Support | Move/Outcome metadata (ids, states, timestamps, channel, dispatch status). **Never Draft bodies, never reply contents, never user context lines.** Time-boxed (24h), per-ticket, user-granted content access from within the app; logged and shown to the user afterward. |
| Ops (Playbook review queue) | `strategy_notes` proposals and aggregates only — post-lint, so nothing personal ever reaches the queue by construction (I-15). |
| The model provider | Draft/reply text strictly under zero-retention, no-training terms (Product Law #4). |
| Creditors | Receive exactly the approved Draft bytes, under the user's name with reply-to = the account's forward-in address. Molehill's agent identity appears on relays *to the user*, and on creditor correspondence only where a "sent via Molehill on behalf of" footer is lawful and Playbook-enabled; it is never a claim of legal representation. |

Sensitive-data notes: Moves on `insurance_eob` and legal-floor Items follow Triage's rule — notifications name the kind, never the details. Analytics from this module is aggregate-only: grant rates, response times, decline/snooze rates, lint-hit counts — never Draft text, never creditor reply text.

## 12. Dependencies

**Upstream (hard):** Triage — the confirmation fan-out is Moves' only creation trigger; confirmed Extractions are the only legal merge sources (I-1, I-10). Capture — creditor replies ingest as Captures; the forward-in address doubles as every sent email's reply-to (the loop that makes Outcome capture automatic).

**Sideways (hard):** Watchtower — owns the 9am clock (`offer_next` is called, never self-scheduled), all response-wait and verification timers, and every Notification send/cap/quiet-hours decision; Moves only emits events. Deadline criticality (`is_deadline_critical`) is read from Watchtower's objects.

**Downstream (hard):** Ledger — MeterEntries written by Moves' deterministic Outcome job (I-6), `billable_recovery` events under per-recovery pricing (flat fee, Product Law #5).

**External services:** transactional email provider on a dedicated, warmed sending domain (SPF/DKIM/DMARC; deliverability monitoring per §10 E-7); **Lob** for postal + certified mail (letter PDF rendered from the `final` Draft, user's name and return address — Mailroom address when configured, else user-confirmed home address); drop-off location dataset (carrier store locations) for `return_checklist`. No payment processor, no bank connection, nothing that can move money exists in this module (Product Law #10, I-11).

**Device capabilities:** none required. Optional: coarse location *or* user-entered ZIP for return drop-off lookup (ZIP is the default; location is a per-use prompt, never background); tap-to-dial for `call_script` (plain `tel:` link, no telephony integration).

**Platform differences:** mobile (M-14) is review-and-fire — light edits, variant switch, the gate; web (W-05) is the power editor — versioned Draft history, restore, PDF download of letters, Playbook panel with full stats. Gates, merge-lock rules, the one-move cadence, and amnesty behavior are byte-identical on both platforms, enforced in the API layer, not the client, like I-14.
