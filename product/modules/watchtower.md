# Module: Watchtower

> Module 4 of 5 (`product/brief.md` §5). Deadline custody: the deterministic scheduler, the custody-handoff ritual, the notification ladder, self-silencing, and reliability Receipts. Owns **Watch, Deadline, Notification, Receipt** (`product/object-model.md` §13–16). Screen IDs reference `product/flows.md`. Terminology is the brief's glossary, used exactly.
>
> **The defining constraint:** everything in this module is deliberately non-AI (brief §9, Product Law #7). AI writes words elsewhere; Watchtower pulls every trigger. No date, dollar figure, send time, recipient, or suppression decision in this module ever passes through a generative step. The AI/no-AI boundary is drawn precisely in §8.

## 1. Purpose

Watchtower exists because the ADHD tax is mostly a *timing* tax: the fine that doubles, the return window that closes, the response date that quietly becomes a bench warrant (`research/pain-points.md` Cluster 4; Science Advances 6× default risk). Capture and Triage get the scary thing read; Moves drafts the fix; Watchtower is the part that **holds the vigilance so the user doesn't have to** — and proves, boringly and forever, that it held it. "Working" means three things: (1) after the custody ritual ("This envelope is mine now — watching 3 deadlines"), every confirmed Deadline runs its full, pre-promised ladder with zero silent misses — the Receipt counter reads "412 deadlines watched · 0 silently missed" and both numbers are provably true (I-17); (2) the user hears from Molehill at most once a day, at 9am, and when the notifications stop landing Molehill says so out loud and shuts up (self-silence), instead of training reflex-swiping — while deadline-critical and Eyes On items always get through (I-5, I-7, I-18); (3) a user who has gone completely dark still hears "your ticket doubles Friday: $85 → $170" by SMS or a short call before the money is lost (the Callie graft, crown decision) — the agent travels to the user. Watchtower is also the module that keeps working when everything intelligent is down: it is 100% deterministic clockwork, so degraded-AI is a non-event here.

## 2. User goals

- I want to hand a deadline to Molehill once and then genuinely stop holding it in my head, so that the background dread turns off.
- I want to know exactly what Molehill will send me and when — promised in advance — so that an escalation feels like the plan working, not an ambush.
- I want at most one notification a day, so that Molehill never becomes another channel I've gone blind to.
- I want Molehill to notice when I'm ignoring it and go quiet on its own, so that I never have to feel guilty about muting it.
- I want the things that can really hurt me — court dates, tax letters, doubling fines — to get through anyway, even when I've gone dark, so that silence is never dangerous.
- I want my partner pinged exactly once, only if I've set that up, so that the agent carries the nag and Sam never has to.
- I want a plain running count of deadlines watched and never silently missed, so that trust is a number I can check, not a vibe.
- I want a missed deadline handled like an accountant would — "here's what we can still recover" — never quantified as a loss and never framed as my failure.

## 3. Objects

| Object | Ownership | Role in this module |
|---|---|---|
| **Watch** | **Watchtower (source of truth)** | Active custody on one Item; `custody_phrase`, `is_deadline_critical`. Created via the confirmation transaction (proposed) and activated by the M-13 ritual. Object-model §13. |
| **Deadline** | **Watchtower (source of truth)** | One dated obligation under custody; `due_at`, `amount_at_stake`, `escalation_amount`, frozen `ladder_plan`. Always references a `confirmed`/`corrected` Extraction (I-3). Object-model §14. |
| **Notification** | **Watchtower (source of truth)** | One outbound contact, any kind, any channel — Watchtower is the **single send pipe for the entire product**. Other modules emit events; only Watchtower's scheduler materializes and sends. Object-model §15. |
| **Receipt** | **Watchtower (source of truth)** | Append-only trust ledger; one entry per terminal Deadline, written in the same transaction (I-17). Object-model §16. |
| User | Platform | Read: `timezone`, `quiet_hours`, `framing_pref`, `notify_state`, `ignored_streak`, `escalation_contact_user_id`, `phone`. Watchtower is the only writer of `notify_state` and `ignored_streak`. |
| Household | Capture | Read: `failover_enabled` — gates the partner-failover ping. |
| Move | Moves | Read: `ready` Moves ranked by `dollars_at_stake` for the 9:00 pick; Watchtower writes `offered_on` when it surfaces one. Move execution/`met` attestation feeds Deadline transitions. |
| Item | Triage | Read: `is_legal_floor`, `dollars_at_stake`, title/sender for notification copy merge. |
| Outcome | Moves | Read: `relay_state` — a `denial_relay` Notification may only be scheduled once `relay_state = relayed` (I-9). |
| BillingState | Ledger | Ledger's pause job emits an event; Watchtower sends the `billing_pause_notice` (cap-exempt, quiet-hours-respecting — F-08). |
| Template Corpus | Watchtower (internal) | Versioned, shipped-as-data copy templates for every Notification kind × framing × channel, with typed merge slots. CI-linted for I-8 (no quantified missed loss), banned vocabulary, and slot type-safety. No runtime generation — see §8. |
| Delivery log | Watchtower (internal) | Per-Notification attempt records `{channel, provider, provider_msg_id, status, at}` stored as `delivery_attempts jsonb` on Notification. Powers I-17 reconciliation and E-1 detection. **Object-model extension — requires a `BUILD_LOG.md` entry.** |

## 4. Lifecycle

Full state machines are object-model §13–16 and are law. This section maps states to what the user sees and adds the deterministic timing rules an engineer needs.

**Watch** — `proposed → active → completed | released`

| State | User sees |
|---|---|
| `proposed` | M-13 ritual card: custody phrase, the Deadline list (dates + dollars, all human-confirmed seconds ago), this Watch's promised ladder rendered verbatim, critical badge if legal-floor. Nothing is being watched yet and the card says so: "Custody starts when you hand it over." |
| `active` | M-04/W-06 row with custody phrase, live countdown to next Deadline (client-ticked from confirmed dates — works offline), critical badge. M-01 custody one-liner ("Watching 4 deadlines"). |
| `completed` | Row moves to Receipt history: "Watched · met." Counter increments. |
| `released` | "Released — you took this one back." Recorded in the Receipt as `released_by_user`, never as a miss. Critical Watches require typed confirmation to release (I-5). |

**Deadline** — `scheduled → approaching → critical → met | missed_documented | cancelled`

Timing rules (binding, deterministic):
- **Date-only parse rule:** a confirmed date with no time resolves to `due_at` = 23:59:59 in `User.timezone` on that date. `escalation` kind ("doubles Friday") resolves to 23:59:59 on the **day before** `escalation_date` — the last moment the lower amount is payable.
- **T-anchors** are computed from `due_at`: `approaching` at T-7d, `critical` at T-72h, all via clocked jobs (per-minute tick, §9). At T-72h the parent Item's unexecuted Move becomes deadline-critical and bypasses the one-move cap (object-model §14).
- **Ladder freeze:** `ladder_plan` is materialized at Watch activation from the hard-coded template — `[T-7d ladder_nudge, T-72h ladder_escalation, T-24h partner_failover if configured] → documented silence` — and never edited afterward, by anyone or anything. Steps already in the past at activation are skipped (a Deadline confirmed at T-5d gets only the T-72h and T-24h steps). **Short-fuse rule:** if fewer than 24h remain at activation and the Deadline is critical, exactly one `ladder_escalation` is scheduled at now + 2h (skipped if the Move executes first). If `due_at` is already past at confirmation, no ladder exists; the Item goes straight to the recovery path (Moves re-drafts the post-deadline variant — never loss-framed, Product Law #6).
- **Timezone/DST:** `scheduled_for` is stored UTC but re-derived against `User.timezone` at each tick; a timezone change or DST transition re-materializes all pending Notifications so "9am" and "quiet hours" always mean current local wall-clock. A `due_at` from a confirmed date-only value re-derives too.

| State | User sees |
|---|---|
| `scheduled` / `approaching` | Countdown on M-04/W-06 ("12 days", then "6 days"); W-06 calendar dot. |
| `critical` | Red-free critical badge ("72h") — urgency is stated in time and dollars, never in alarm color theatrics; M-01 stacks critical Eyes On items above the Move card. |
| `met` | "Met — Jan 21, three days early." Receipt written in the same transaction. |
| `missed_documented` | Only reachable after the full promised ladder ran (else it is E-1, an incident). Copy never quantifies the loss (I-8): "The Friday window closed. Here's what we can still recover — the late-waiver draft is ready." Receipt records `missed_documented` with `ladder_completed = true`. |
| `cancelled` | Superseded date re-confirmed (F-T5 in Triage) → old Deadline cancels and the new one materializes **in one transaction — custody never gaps**; or custody released. |

**Notification** — `scheduled → sent → opened/acted | ignored | suppressed | cancelled`

| State | Rules |
|---|---|
| `scheduled` | Materialized only by the deterministic scheduler (9:00 pick, ladder plan, event relays). `scheduled_for` respects quiet hours: anything landing inside the user's quiet window (default 21:00–08:00 local) defers to quiet-end, **except the T-24h step of a deadline-critical ladder, which sends regardless** (I-7). SMS and calls additionally clamp to 08:00–21:00 recipient-local irrespective of preferences (TCPA/telecom hygiene). |
| `sent` | At-least-once dispatch with idempotency key `(notification_id, channel)`; the I-7 unique partial index on `(user_id, date) WHERE counts_toward_cap` makes a second cap-counting send on one day a constraint violation, not a bug report. |
| `ignored` | 24h post-send with no interaction. Increments `User.ignored_streak` for cap-counting kinds only. |
| `suppressed` | `notify_state = self_silenced` and `counts_toward_cap = true`. Deadline-critical ladder and Eyes On arrivals are never suppressed (I-5, Product Law #2). Suppressed Notifications still appear in the in-app feed — silence is about interruptions, not information. |
| `cancelled` | Move executed / Deadline met before send — the scheduler cancels pending ladder steps in the same transaction as the transition. |

**Receipt** — single-state append-only (`written`). Written by the deterministic terminal-transition job, same transaction, never by AI, never by hand. Counters (`deadlines_watched`, `never_silently_missed`) are computed client- and server-side and must agree; divergence pages on-call (I-17). On Item purge the `deadline_id` nulls and the counters survive — the trust math outlives the privacy delete.

## 5. Actions

### User-initiated

| Action | Trigger / Screen | Preconditions | Effect | Feedback | Undo |
|---|---|---|---|---|---|
| Complete custody ritual ("It's yours") | M-13 | Watch `proposed`; every consequential Extraction confirmed (I-3 — the transcription is the gate, the ritual is the ceremony) | Watch `active`; Deadlines `scheduled`; ladder Notifications materialized; Receipt counter live | "This envelope is mine now — watching 2 deadlines." Row appears on M-04 | Release custody (below) |
| Decline custody ("I'll handle it myself") | M-13 | Watch `proposed` | Watch never activates; recorded as released-not-missed; Item stays `move_ready` if actionable | "All yours. It's in your Items if you change your mind." Never judged | Re-open Item → ritual re-offered |
| Release custody | M-04 / M-11 / W-06 | Watch `active`; **typed confirmation ("release") if `is_deadline_critical`** (I-5) | Watch `released`; Deadlines `cancelled`; pending Notifications cancelled; Receipt `released_by_user` | "Released — you took this one back. The Receipt notes it as released, not missed." | Re-confirm the Item's dates → new Watch |
| View a Watch's ladder plan | M-04 row / W-06 "what I promised" | — | Renders the frozen `ladder_plan` verbatim with concrete dates | "Jan 17 nudge · Jan 21 escalation · Jan 23 ping to Sam · then I document" | n/a |
| "Keep them coming" | M-19 / the self-silence push | `notify_state = self_silenced` | `notify_state = normal`, `ignored_streak = 0` | "Back on. One a day at 9, max." | Ignore 3 more |
| "Good, thanks" (accept silence) | M-19 | same | State unchanged; notice acknowledged | "Quiet mode. Critical deadlines still get through; everything's in the app." | "Keep them coming" any time |
| Adjust quiet hours | M-09 (onboarding) / M-21 / W-09 | — | `quiet_hours` updated; pending Notifications re-materialize | Preview line: "Nothing between 22:00 and 08:00 except a critical last-24h escalation" | Re-adjust |
| Framing toggle | M-21 / W-09 | loss framing requires explicit opt-in (logged event, Product Law #6) | `framing_pref` set; template variant selection changes | Gain default: "$85 still recoverable until Friday." Loss opt-in: "$85 becomes $170 Friday" | Toggle back |
| Channel prefs per kind | M-21 / W-09 | SMS requires verified phone (inline verify) | Notification `channel` routing updated | Saved; floors shown non-editable (1/day cap, critical exemption, no missed-loss figures) | Re-edit |
| Outbound dark-user SMS opt-in/out | M-09 contract / M-21 toggle | verified phone; consent event logged | Enables/disables `outbound_dollar_event` SMS | "If you go quiet and money is about to move, I'll text once." | Toggle; **STOP by SMS always honored instantly** |
| Outbound call opt-in | M-21 (off by default) | phone verified; explicit consent logged | Enables the fixed-script call fallback (§7 F-W5) | "Only for critical deadlines, only if texts bounce, at most one call." | Toggle off; "stop calling" honored from the call itself |
| Send test notification | M-21 | — | One `custody_confirm`-kind test push/SMS (cap-exempt) | "Test sent — that's what 9am feels like." | n/a |
| Open / act on a Notification | any | — | `response` recorded; `ignored_streak` → 0 | destination screen | n/a |
| Configure partner failover | M-17 / W-08 | Household `active`; both parties confirm (the contact must accept being pinged) | `failover_enabled = true`; `escalation_contact_user_id` set | Ladder plans on critical Watches now show the ping step with the contact's name | Either party can turn it off |

### System-initiated (all deterministic; every trigger is a clocked job over confirmed data — I-19)

| Action | Trigger | Effect |
|---|---|---|
| **9:00 daily pick** | Per-minute tick hits 09:00 `User.timezone` | Selects the day's single cap-counting Notification by fixed priority (§7 F-W2); writes `Move.offered_on`; I-7 index guarantees at-most-one |
| Ladder step send | `scheduled_for` reached | Sends the frozen step; deadline-critical steps ignore cap and self-silence; T-24h critical ignores quiet hours |
| Ladder step cancel | Move executed / Deadline `met` / custody released | Pending steps `cancelled` in-transaction |
| Cap arbitration deferral | Two cap-counting candidates on one day | Loser defers to next 9:00 (a deferred `ladder_nudge` becomes T-6, still ahead of T-72h); a deferral that would cross T-72h promotes the step's priority (§7 F-W2) |
| Self-silence trip | `ignored_streak` reaches 3 | Exactly one `self_silence_notice` (cap-exempt): "These aren't landing — I'll wait for your next snap. Your 3 watched deadlines stay watched; anything critical still gets through." `notify_state = self_silenced` (I-18) |
| Self-silence reset | Any Capture, ingestion-triggered confirmation, or app open | `notify_state = normal`, `ignored_streak = 0` — hard-coded, no model input |
| Partner-failover ping | T-24h on a critical Deadline; `failover_enabled`; contact accepted; **and** the user has neither executed the Move nor opened the Item since the T-72h step | One `partner_failover` to the contact — one ping, never a stream; content rules in §11 |
| **Outbound dollar event** (Callie graft) | Ingestion (Triage exterior mode / successor notice) learns of a dollar event **and** user is dark: `lapsed`, or `self_silenced`, or no `last_open_at` for 14d — and the event is deadline-bearing with ≥ 48h of recoverable runway | One `outbound_dollar_event` SMS (or call fallback, F-W5); max one per Item per week; requires opt-in |
| Eyes On arrival relay | Triage emits `eyes_on_arrival` | Cap-exempt, quiet-hours-respecting notification within 10 min of verdict (F-03): "A court notice arrived. I've read it — you should see it. 2 minutes." |
| Denial relay | Outcome `relay_state = relayed` (I-9) | Schedules the neutralized `denial_relay` (respects cap and quiet hours; body already composed and locked by Moves — Watchtower only times and sends it) |
| Billing pause notice | Ledger pause event (F-08) | Cap-exempt `billing_pause_notice`: "You didn't use Molehill this month, so we didn't charge you. Your 3 deadlines stay watched." |
| Weekly money summary | Sunday 09:00 local | Rides the daily cap slot as that day's one notification (priority table); push variant: "This week: $85 averted, $35 recovered. Meter: $312 since March." |
| `missed_documented` transition | `due_at` passes; Move unexecuted; full ladder verifiably ran | Deadline terminal; Receipt written (`ladder_completed = true`); recovery re-draft event to Moves; **no notification quantifies the loss** (I-8) |
| Receipt write | Any Deadline terminal transition | Same-transaction append; counter cache invalidated |
| Ladder reconciliation | Hourly job | Compares every past-due `ladder_plan` step against the delivery log; any promised-but-unsent step → P1 page (I-17, E-1) |
| Re-materialization | `User.timezone` change, DST transition, quiet-hours edit | All pending `scheduled_for` recomputed deterministically |

## 6. States

Watchtower's surfaces are M-04 (Watch), M-13 (Custody Handoff), M-19 (Self-silence Notice), M-21 (Notification Settings), W-06 (Watch web), plus the M-09 Notification Contract at onboarding. Per-screen state tables in `product/flows.md` are law; below is what Watchtower contributes.

| State | Behavior and copy |
|---|---|
| **empty** | M-04: "Nothing under watch yet. Snap the pile and hand it over." + Receipt counter honestly at "0 watched · 0 silently missed" (zeros are shown, not hidden — the counter exists before it flatters). W-06: "No deadlines under watch" + capture prompts. |
| **loading** | Receipt header renders instantly from cache; custody list skeleton after. Countdowns never skeleton — they tick from cached confirmed dates immediately. |
| **ideal** | Ranked custody list (by dollars-at-stake, never age — I-13), live countdowns, ladder-plan viewer, Receipt header. W-06 adds the month calendar and the full Receipt ledger table (every terminal deadline, disposition, `ladder_completed`). |
| **partial** | A Watch pending confirmation: "Custody starts after you confirm the date" → M-12. A Deadline whose source Extraction is being re-confirmed (supersede flow): "New numbers need your eyes — the old watch holds until you confirm." |
| **error** | "Showing last synced state — watching continues server-side." The reassurance is true by architecture: the scheduler is server-authoritative; the client is a viewport. No destructive action (release) offered while stale. |
| **offline** | Cached countdowns keep ticking on the client clock; sync badge. Custody activation (M-13) queues; the countdown math starts from confirmed dates regardless of when sync lands — activation time never shifts a deadline. |
| **degraded-AI** | **Fully functional, by law.** Brief §9 and Product Law #7 make this module 100% deterministic; every countdown, ladder step, Receipt write, suppression rule, and outbound SMS works identically with the AI pipeline down. M-04 shows no degraded banner because nothing here degrades. |
| **self-silenced** (module-specific) | M-19 in-app mirror of the one push. M-01 shows a one-line quiet chip ("Notifications paused — anything critical still gets through"), never a guilt banner. M-21 shows silence status + reset. |
| **dark-user outbound** (module-specific) | No screen — the user isn't in the app. The product surface is one SMS: "Molehill: your ticket doubles Friday — $85 → $170. The fix is one tap: {link}. Reply STOP to end texts." The link lands on M-01 in amnesty form (I-14): one Move, current Meter, no backlog. |

## 7. Workflows

Master cross-module flows: F-02 (daily One Move), F-03 (Eyes On ladder), F-05 (lapse → self-silence → reactivation), F-06 step 7 (partner failover), F-08 (pause notice). Watchtower-internal flows:

**F-W1 — Custody + full ladder for a doubling fine (the flagship path)**
1. Triage confirmation completes on the parking ticket (F-04): two confirmed Extractions — `deadline_date` Jan 24 / $85, `escalation_date` Feb 7 / $170. The confirmation transaction calls Watchtower's service API: Watch `proposed`, two Deadlines staged (I-2, I-3).
2. **M-13** renders: "This envelope is mine now — watching 2 deadlines. · Jan 24 — $85 due. · Feb 7 — it doubles to $170. Here's exactly what I'll send: a nudge Jan 17, an escalation Jan 21, a ping to Sam Jan 23 if you've gone quiet. Then I document what happened and we recover what we can." One tap: **"It's yours."**
3. Watch `active`; ladder Notifications materialize from the frozen plan; Receipt counter live; M-04 row appears with the countdown.
4. Jan 17, 09:00 (`ladder_nudge`, wins the day's cap slot): "Seven days on the Austin ticket — $85 stays $85 until the 24th. The contest letter is ready when you are."
5. Jan 21, 09:00 (`ladder_escalation`, T-72h; the Move is now deadline-critical and bypasses the one-move cap): "Three days left on the Austin ticket. After Friday it's $170 instead of $85. The letter is written — two taps."
6. Happy path: user sends the Move (F-02) → pending ladder steps `cancelled`, Deadline `met`, Receipt written ("met — 3 days early"), M-04 counter ticks. Done.
7. Dark path: no action by Jan 23 → `partner_failover` fires (if configured, F-W4); Jan 24 23:59 passes → **F-W6**.

**F-W2 — The 9:00 pick (daily arbitration, deterministic)**
1. Per-minute tick: users whose local time is 09:00 are sharded into the pick job.
2. Candidate set for the user-day, fixed priority: **(1)** non-critical `ladder_escalation` due today, **(2)** `ladder_nudge` due today, **(3)** `daily_move` (highest `dollars_at_stake` ready Move, F-02), **(4)** `weekly_money_summary` (Sundays), **(5)** `channel_error`. Critical-ladder steps, Eyes On arrivals, `self_silence_notice`, `custody_confirm`, and `billing_pause_notice` are cap-exempt and outside this arbitration entirely.
3. If a ladder step and the daily Move reference the same Item (the common case — the biggest deadline usually is the biggest Move), they merge into one Notification carrying both refs; ladder copy wins.
4. Exactly one winner sends (I-7 unique index is the backstop). Losers defer to the next 9:00; a deferral that would cross the step's own T-72h boundary promotes it to priority 1 tomorrow. `channel_error` waits max 7 days then routes via email instead.
5. If `notify_state = self_silenced`: cap-counting winner is `suppressed` (still visible in-app); cap-exempt kinds send normally.
6. No candidates → nothing sends. M-01 empty state: "Nothing needs a move today. 4 deadlines under watch." Silence is a feature, never padded.

**F-W3 — Self-silence and reset** — master flow F-05; Watchtower specifics:
1. Streak counts only cap-counting kinds; `ignored` = 24h post-send without open/act. Streak 3 → the one `self_silence_notice` (cap-exempt), `notify_state = self_silenced`. The notice itself never counts toward any streak.
2. While silenced: daily picks are `suppressed`; critical ladders, Eyes On arrivals, and `outbound_dollar_event` (which exists precisely for silenced/dark users) are unaffected.
3. Reset is behavioral, not conversational: any Snap, Capture-triggered confirmation, or app open → `normal`, streak 0 — the exact rule promised at M-09 ("Three ignores and I go quiet until your next snap"). No model input, no partial states, no negotiation (I-18).

**F-W4 — Partner-failover ping** — master flow F-06 step 7; Watchtower specifics:
1. Preconditions, all deterministic: Deadline `is_deadline_critical`; T-24h reached; `Household.failover_enabled`; `escalation_contact_user_id` set **and that user accepted the role**; primary user has neither executed the Move nor opened the Item since the T-72h step fired.
2. Exactly one ping per Deadline, ever — it is a step in the frozen ladder, not a channel. Copy respects I-20 (see §11 for both variants). Example, item the partner captured: "The school forms you handed me are due tomorrow, and my nudges to Maya aren't landing. This is the one ping I promised — nothing is needed from you."
3. The ping is logged on the Watch's ladder viewer for the primary user to see afterward — no secret contact, ever: "Jan 23: pinged Sam, as promised."

**F-W5 — Outbound SMS / call for dark users (the Callie graft)**
1. Trigger (deterministic conjunction): ingestion learns of a dollar event (Triage exterior-mode floor hit or successor notice, F-T6/F-T5) → the event's Item has a confirmed-or-provisional deadline with ≥ 48h runway and dollars attached → user is dark (`lapsed`, or `self_silenced`, or no open in 14 days) → SMS opt-in is on.
2. One SMS, clamped to 08:00–21:00 recipient-local: "Molehill: your ticket doubles Friday — $85 → $170. The fix is one tap: {link}. Reply STOP to end texts." Gain math only; **never a quantified already-missed loss** (I-8 lints the SMS templates too). Max one `outbound_dollar_event` per Item per week; max two per user per week across Items.
3. The link opens M-01 in amnesty form (I-14): one Move, current Meter total, zero backlog. Tapping it resets self-silence (it's an open). Reactivation-per-envelope-event metric increments (Product Law #8).
4. **Call fallback** (separate opt-in, off by default): fires only if the SMS hard-bounces or goes unanswered 48h **and** the Deadline is critical **and** ≥ 24h of runway remains. One call, fixed pre-rendered TTS script — zero generative audio: "This is Molehill, the deadline-watching service you set up. A deadline you asked me to watch arrives this Friday, and my texts haven't reached you. Everything you need is in the app. No action is needed on this call. To stop calls like this, say stop or press 9. Goodbye." Voicemail gets the identical script. **No dollar amounts, no sender names, no document details by voice or voicemail** — the phone channel is presumed shared (§11).
5. STOP (SMS) or press-9/"stop" (call) revokes that channel instantly, is confirmed once ("Done — no more texts. Deadline watching continues in the app."), and is logged as a consent event. Revocation never releases custody: the ladder continues on push/in-app/email.

**F-W6 — Miss, documented (never silent, never quantified)**
1. `due_at` passes with the Move unexecuted. The transition job verifies the full promised ladder ran against the delivery log; if any step is missing, this is **not** a `missed_documented` — it is incident E-1, and the Receipt cannot be written until reconciliation runs (I-17).
2. Deadline → `missed_documented`; Receipt appends `{disposition: missed_documented, ladder_completed: true}`; the counter's honesty is preserved: watched, escalated, not silently missed.
3. Event to Moves: re-draft the post-deadline recovery variant (waiver → late-fee waiver; contest → late contest). The next notification about this Item is the recovery offer, framed forward: "The Friday window on the Austin ticket closed. Here's what we can still recover — late waivers land more often than you'd think. The draft is ready." No figure for what the miss cost, anywhere, ever (Product Law #6, I-8).
4. The ladder viewer shows the honest history: "Nudged Jan 17 · escalated Jan 21 · pinged Sam Jan 23 · documented Jan 25." The accountant's file, not the parent's sigh.

**F-W7 — The onboarding Notification Contract (M-09)** — Watchtower owns this promise and its verbatim rendering:
1. The contract, shown once and restated in M-21 forever: **"One notification a day at 9am, max. Deadline-critical: one escalation at 72 hours, one partner ping if you set one, then documented silence. Three ignores and I go quiet until your next snap."**
2. Quiet-hours picker (default 21:00–08:00), framing choice (gain default; loss-framed countdowns behind explicit opt-in), push permission request, dark-user SMS opt-in with phone verify.
3. Push declined → no guilt; the fallback plan is stated plainly: "No pushes, then. The one-a-day shows in the app, critical escalations come by SMS if you verify a number, or email." The contract's floors (cap, critical exemption, no missed-loss figures) are non-editable everywhere — they render as fixed text, not toggles.

## 8. AI behavior

**What the AI does in this module at runtime: nothing.** This is the product's hardest boundary (brief §9; Product Law #7; crown graft from temporal: "AI writes words but a deterministic scheduler pulls every trigger"). Every Watchtower behavior — the 9:00 pick, ladder timing, cap arbitration, suppression, self-silence, partner failover, outbound SMS/call, Deadline transitions, Receipt writes — is clocked jobs and fixed rules over human-confirmed data (I-19). There is no model call in any Watchtower code path, no "smart send-time optimization," no bandit over notification copy, no LLM-composed message body at send time. An LLM deciding when to nag is how you habituate users out of the product (thesis, "Deliberately non-AI features") — so it never decides.

**AI's two permitted, bounded touchpoints — both upstream of runtime:**
1. **Template authoring, offline.** The Template Corpus (every kind × framing × channel) may be drafted with AI assistance during development, but templates ship as versioned static data after human review and the CI lint gate: banned vocabulary ("finally", "again", "you missed", "overdue", exclamation marks in escalation/denial copy), no quantified missed loss in any post-deadline or reactivation template (I-8), typed merge slots only. At runtime, rendering is a deterministic merge of confirmed values into locked slots — string substitution, not generation. A template change is a code deploy with review, never a runtime event.
2. **Upstream bodies.** The `denial_relay` body is composed by Moves' neutralization step (AI, governed by that module's spec) and locked before Watchtower ever sees it; Watchtower schedules and sends it only after `relay_state = relayed` (I-9) and contributes zero words. Likewise Eyes On arrival copy quotes Triage's already-written plain-language line. Watchtower is a pipe with a clock, not an author.

**Inputs the scheduler reads:** confirmed Extraction values (via Deadlines — I-3), Move rank and status, User timing prefs, Household failover config, delivery logs, the Template Corpus. **It may never read:** raw model output, unconfirmed Extractions (no Notification ever contains an unconfirmed number — enforced by the merge layer accepting only `value_confirmed`-derived fields), document images, other accounts' anything.

**What must NEVER happen (each is a lint/CI/runtime guard, not a convention):** a generative step producing or altering a send time, recipient, dollar figure, or date (I-19 runtime guard: the send pipe rejects any body whose merge slots don't hash-match template + confirmed values); a notification quantifying an already-missed loss (I-8 template lint + runtime merge-field guard); loss framing without the logged opt-in (Product Law #6); a second cap-counting send in a day (I-7 unique index); suppression of a deadline-critical or Eyes On notification (I-5 — the suppression check runs only on `counts_toward_cap = true` rows); model input into self-silence (I-18 — the policy is 40 lines of code with no dependencies).

**Fallback when the model is unavailable:** not applicable — and that is the point. Watchtower is the module that makes degraded-AI safe product-wide: while Triage's reading room is down, every countdown, ladder, Receipt, and outbound SMS runs identically. The one interaction with a degraded pipeline: Triage's deterministic Sender Registry floor-hit event ("IRS letter arrived, unread") is relayed by Watchtower like any Eyes On arrival, cap-exempt, with Triage's honest can't-read-yet copy.

**Deliberately NOT AI (the full list, with reasons):**
- **Deadline math, countdowns, escalation projections ($85 → $170 Friday):** dates that cost money must never pass through a generative step twice (thesis; Product Law #7).
- **The 9:00 scheduler and cap arbitration:** the one-a-day promise is a contract; contracts are enforced by constraints, not inferred by models (I-7).
- **The ladder and its freeze:** promised in advance at onboarding, so it must be replayable and auditable — hard-coded template, frozen per-Deadline (crown graft from ignition: "hard-coded and promised in advance… never model-discretionary").
- **Self-silence:** an LLM guessing user intent from silence is exactly the discretionary nagging this rule exists to kill (I-18).
- **Partner failover:** contacting a third party is a consent boundary; consent boundaries get if-statements, not judgment calls.
- **Outbound SMS/call triggering and the call script:** regulatory surface (TCPA) + shared-phone privacy — fixed scripts, fixed conditions, recorded consent.
- **Receipts:** the trust counter must be boringly correct; it is a SUM over append-only rows (I-17).
- **Quiet hours, timezone/DST handling:** wall-clock arithmetic. Nothing to generate.

## 9. Scale

| Metric | 1 user | 1,000 users | 100,000 users |
|---|---|---|---|
| Active Watches | 3–8 | ~5k | ~500k (index `(account_id, status)`; M-04 list is dozens of rows, no pagination needed; W-06 Receipt ledger paginates at 50) |
| Deadlines (cumulative yr 1) | ~60–150 | ~120k | ~12M; Receipts ≈ 1:1 (append-only, partition by account hash) |
| Notifications/day | ≤ 1 cap-counting + occasional cap-exempt ≈ 1.3 avg | ~1.3k | ~130k sends/day; Notification log ~50M rows/yr before the 12-month rollup (object-model §15 retention) |
| Outbound SMS | rare (dark periods only) | ~10–30/day | ~1–3k/day ≈ $10–25/day at ~$0.008/segment; calls ~1–2% of that. Cost noise next to AI COGS — the graft is cheap |

**Hot paths:** the 9:00 fan-out is the module's thundering herd — 9am US Eastern at 100k users ≈ 30–40k picks in one minute. Design: candidates are pre-materialized at 08:00 local (the pick job at 9:00 only arbitrates and dispatches), sends are queued and smoothed across 09:00:00–09:02:00 (the contract says 9am, not 09:00:00.000), sharded by `user_id` hash across workers. The per-minute tick scans a `(scheduled_for)` partial index on pending Notifications — O(due now), not O(all). Receipt counters are cached per account, invalidated on write, and re-derivable by SUM at any time; the client computes them independently from synced entries and disagreement is telemetry (I-17).

**Cost drivers:** push is ~free; SMS/voice per table above; email via bulk provider. Zero AI calls, zero per-send model cost — this module's COGS rounds to infrastructure. **Rate limits:** provider-side APNs/FCM batching; SMS throughput per A2P 10DLC registration (throttle: outbound events are never time-critical to the minute — a 10-minute smear is invisible at 48h runway); the per-user caps (1/day cap-counting; 2 outbound SMS/week) are product law doing double duty as rate limits.

**SLOs (binding):** 9:00 pick delivered 09:00–09:05 local p99; ladder step delivered within 5 min of `scheduled_for` p99; T-24h critical step within 60s p99; Eyes On arrival relay ≤ 10 min after verdict (matches Triage's SLO); reconciliation job lag < 1h (it is the E-1 tripwire); Receipt write is same-transaction, so its SLO is the transition's. Scheduler tick, send-queue depth, and reconciliation lag live on the falsifiability dashboard (crown graft from evergreen).

## 10. Errors

Ranked by likelihood × harm. Data-loss guarantee everywhere: **Deadlines, Watches, and Receipts are never lost or silently altered** — the scheduler is server-authoritative, transitions are transactional, Receipts are append-only.

| # | Failure | Detection | User-facing message | Recovery | Data loss |
|---|---|---|---|---|---|
| E-1 | **A promised ladder step never sends** (the catastrophic one — it falsifies the Receipt) | Hourly reconciliation: every past-due `ladder_plan` step must match a delivery-log entry; mismatch → P1 page; the Deadline **cannot** reach `missed_documented` until resolved (I-17: silently-missed must provably be zero) | If caught pre-due: the step sends late with honest copy: "This nudge is later than I promised — my fault, not yours. 2 days left on the Austin ticket, $85." If caught post-due: the Receipt records `ladder_completed = false` as a product incident, the user is told plainly ("I missed an escalation I promised you. The Receipt shows it. Here's the recovery draft."), and the incident count is public on the Receipt surface | Job replay + root-cause before the incident closes; affected users' next recovery Move is prioritized | none — the miss is documented, never laundered |
| E-2 | Push token dead / push disabled — sends "succeed" into a void | APNs/FCM feedback + no `opened` across 5 consecutive sends while app opens continue (proves the user is active but unreachable) | One email (cap-exempt, once): "Your phone isn't showing my notifications. One tap to re-enable — or I'll use email." M-21 shows a repair badge | Channel fallback ladder: push → SMS (if verified) → email → in-app only; critical ladder steps always multi-send push+SMS when push health is unknown | none |
| E-3 | Double-send of a cap-counting notification | I-7 unique partial index makes the second insert fail; dispatcher idempotency key `(notification_id, channel)` stops provider-level dupes | none (prevented); if a provider retry slips through: no correction message (a "sorry for the duplicate" is itself a second notification) | Constraint + idempotent dispatch; provider dupe rate on dashboard | none |
| E-4 | Wrong-time send (timezone change, DST, clock skew) | Re-materialization on tz change is transactional; NTP-disciplined workers; sanity guard: a send whose recomputed local time falls in quiet hours (and isn't T-24h-critical) is re-deferred at dispatch, not sent | Worst case: a 9am note arrives at 8am after a flight. No apology notification; the next day self-corrects | Tick recomputes local wall-clock at dispatch time (not just at scheduling) — the guard is at the last gate | none |
| E-5 | SMS undeliverable / carrier filtering (A2P) | Provider delivery receipts; hard bounce or `filtered` status | none by SMS (it's down); critical path falls back per E-2 ladder; M-21 badge: "Texts to your number aren't going through — carrier issue. Push and email still work." | Registered A2P 10DLC campaign, static sender number, template pre-registration; bounce → re-verify number flow | none |
| E-6 | Partner ping leaks content (privacy defect, I-20) | Structural: the `partner_failover` template for non-captured Items has **no content merge slots** — sender, dollars, and doc kind cannot be rendered because the template can't express them; CI lint verifies both variants | n/a (prevented by construction) | Any new template variant re-passes the I-20 lint; runtime merge guard rejects disallowed fields | n/a |
| E-7 | Quiet-hours breach (non-critical send at 2am) | Dispatch-gate recheck (E-4 guard); telemetry on local-hour-of-send distribution | none for the one-off; repeated breaches page | Deferral at the last gate; template/scheduling fix | none |
| E-8 | Self-silence fails open (nudges continue) or fails closed (critical suppressed) | Property tests on the 40-line policy; suppression decisions logged with rule inputs; a suppressed row with `counts_toward_cap = false` is a P1 assert | Fails-open worst case: extra nudges until hotfix (bad, not dangerous). Fails-closed is the dangerous one — the assert + I-5 check run at dispatch, independent of the policy code | Two independent checks (policy + dispatch-gate) so both must fail | none |
| E-9 | Push/SMS provider outage | Provider health checks; queue depth alarm | Sends queue and drain on recovery; a critical T-24h step that cannot deliver on any channel within 60 min pages on-call for manual outreach — a human calls before Molehill lets a court date pass unwarned | Multi-channel fallback first, human last resort; outage window annotated in delivery log so reconciliation doesn't false-alarm | none |
| E-10 | Recycled phone number — SMS reaches a stranger | Carrier-lookup on verify and re-check on first send after 90 days idle; STOP from an unrecognized pattern flags review | Messages are already minimal-disclosure ("Molehill: your ticket doubles Friday…" contains no name, sender, or account detail; the link requires auth) | Number re-verification challenge after long idle before any outbound event; STOP honored instantly | none; disclosure bounded by template design |

## 11. Permissions

| Actor | Can |
|---|---|
| Account user (primary) | Full view of own Watches, Deadlines, Notifications, ladder plans and history, Receipt ledger; all §5 actions; sees every partner ping that was sent about them ("Jan 23: pinged Sam, as promised") — no secret contact exists. |
| Household member (non-capturer) | Status-line custody only ("1 item in custody, deadline watched" — I-20). Never sees another member's Notifications, ladder history, or Receipt detail beyond account-level counters. |
| Escalation contact (partner) | Receives at most one `partner_failover` per Deadline. Content rule (structural, E-6): for Items the contact captured (Handoff), the ping may name the item ("the school forms you handed me"); for anything else, the template has no content slots — "A deadline Maya asked me to watch hits tomorrow, and I haven't been able to reach her. That's all I can say — the details are hers. This is the one ping I promised." The contact can decline the role at any time; declining disables future pings and notifies the primary neutrally. |
| Support | Metadata only: notification kinds, timestamps, delivery statuses, ladder-plan step states, Receipt dispositions. **Never bodies** — bodies contain document-derived values (amounts, dates, senders). Time-boxed per-ticket body access only by explicit user grant from within the app, logged and shown to the user afterward (same regime as Triage §11). |
| On-call / ops | Reconciliation dashboards, queue metrics, I-17 pager. Receipt rows are append-only at the DB layer (no UPDATE/DELETE grants); an incorrect Receipt is corrected by a documented incident entry, never an edit. |
| SMS/voice/push providers | Receive rendered bodies at send time under DPA; the outbound-SMS and call templates are minimal-disclosure by design (no names, no senders, no account details — E-10). No provider ever receives document images or unconfirmed values. |

Sensitive-data notes: Notifications about `insurance_eob` or any legal-floor Item name the kind, never the details ("An insurance statement arrived" — Triage §11 rule, enforced here at the template layer). The voice channel is treated as always-shared: fixed scripts carry zero document detail (F-W5). Analytics from this module is aggregate-only: send/open/ignore rates, streak distributions, ladder completion rates — never bodies, never per-item content.

## 12. Dependencies

**Upstream (hard):** Triage — the confirmation transaction creates Watches/Deadlines through Watchtower's service API from confirmed Extractions only (I-2, I-3); Triage events (`eyes_on_arrival`, successor supersede, degraded floor-hit) feed the relay pipe. Moves — Move `ready` rank feeds the 9:00 pick; Move execution/attestation drives `met`; Outcome `relay_state` gates `denial_relay` (I-9). Ledger — pause events for `billing_pause_notice`; Meter totals for the weekly summary merge. Capture — Snap/open events reset self-silence; exterior-mode captures power the dark-user outbound trigger.

**Downstream:** Moves — `missed_documented` emits the recovery re-draft event; T-72h emits the deadline-critical flag that lifts the one-move cap. Ledger — nothing: Watchtower never writes MeterEntries (I-6). Every module — Watchtower is the single send pipe; no other module may contact the user.

**Platform:** the deterministic job runner (per-minute tick, hourly reconciliation, daily 08:00 pre-materialization), the event bus, IANA tzdata (pinned version, updated via deploy), NTP-disciplined workers, the I-7/I-17 database constraints.

**External services:** APNs + FCM (push); one SMS provider with a registered A2P 10DLC campaign (static sender number, pre-registered templates, delivery receipts); one programmable-voice provider for the fixed-script call (pre-rendered audio assets, not runtime TTS synthesis of dynamic content); transactional email provider. All under DPAs; none receive document images. **Deliberately absent:** no calendar integration (Molehill holds custody itself — exporting deadlines to the user's calendar would re-transfer the vigilance the ritual just took), no third-party "notification intelligence" or send-time-optimization service (Product Law #7), no analytics SDK inside the send path.

**Device capabilities:** push-notification permission (requested at M-09 with the contract, declinable without guilt — fallbacks in F-W7); SMS requires only a verified number, no device capability. No location, contacts, or calendar access anywhere in this module.

**Platform differences:** mobile is the primary notification surface (push; M-04/M-13/M-19/M-21). Web has no reliable push: W-06 is the audit surface (calendar, full Receipt ledger, ladder-plan viewer, export/print) and web-session users are reached by email/SMS per prefs; the in-app feed is identical on both. The cap, the ladder, quiet hours, self-silence, and every floor are enforced in the scheduler and API layer, never the client — a jailbroken client can render anything it wants and still cannot make Molehill send a second notification (same enforcement posture as I-14).
