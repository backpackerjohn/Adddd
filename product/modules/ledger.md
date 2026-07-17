# Module: Ledger

> Module 5 of 5 (`product/brief.md` §5). The Tax Meter: dollars averted + recovered, break-even honesty, and every billing state including auto-pause. Owns **MeterEntry, BillingState** (`product/object-model.md` §17–18). Screen IDs reference `product/flows.md` (M-05, M-18, W-07, W-13). Terminology is the brief's glossary, used exactly. This is the module with **zero AI in it, by design** (brief §9): everything here is plain arithmetic and clocked state machines, because the Meter is the trust anchor and the invoice is the brand.

## 1. Purpose

Ledger exists because the one reward that does not habituate is real money (`research/pain-points.md` Cluster 4; Cluster 2 as design constraint), and because this category's incumbents monetize ADHD lapses — savings skims, hard-to-cancel subscriptions, zombie charges (Rocket Money's 30–60% first-year skim; DoNotPay's FTC sanction; Cushion's death). Ledger is both answers at once. The **Tax Meter** is a boringly correct, append-only ledger of dollars averted and recovered — every entry traceable to a real Outcome, every averted dollar backed by a counterfactual printed on the document itself, never a guess (I-6, §7 F-L1). **Billing** is the signature trust object: flat visible pricing, a per-executed-recovery flat-fee option that is never a percentage (Product Law #5), auto-pause when unused, one-tap cancel with zero retention flow, and a free tier that never auto-converts (I-12) — the product contractually cannot become the zombie subscription it exists to kill. The two halves meet in the **break-even honesty view**: Meter total and cost-to-date side by side, shown even when Molehill is losing — "If Molehill hasn't saved you more than it costs, the meter will say so, and cancelling takes one tap." "Working" means: (1) the Meter total equals the SUM of its entries, re-derivable at any time, and never contains a dollar that requires imagination; (2) no account is ever charged in a cycle it didn't use Molehill; (3) the break-even line renders honestly in all three positions — ahead, behind, even — with the cancel button one screen away.

## 2. User goals

- I want to see a real dollar number for what Molehill has gotten back or kept for me, so that the subscription justifies itself with arithmetic, not vibes.
- I want to trust every dollar on that meter, so that when it says $312 I can repeat that number to my partner without hedging.
- I want to know honestly whether Molehill is paying for itself, so that I'm never the person paying for an app out of guilt or forgetfulness.
- I want billing to pause itself when I disappear, so that going dark costs me nothing and coming back carries no bill-shaped shame.
- I want cancelling to be one tap with no "are you sure" gauntlet, so that staying is always a choice and never a trap.
- I want the option to pay only when a recovery actually lands, so that the price tracks the value.
- I want a free tier that stays free, so that forgetting a trial can never bill me — I've been billed by forgetting enough for one lifetime.
- I want to export the ledger, so that I can show my partner (or my accountant, or myself in a doubting moment) exactly where the number came from.

## 3. Objects

| Object | Ownership | Role in this module |
|---|---|---|
| **MeterEntry** | **Ledger (source of truth)** | One line of the Tax Meter (object-model §17). Kinds `recovered` \| `averted` \| `reversal`. Append-only, immutable, `outcome_id` NOT NULL (I-6). Written only by the deterministic Outcome-recording job (which lives in Moves; Ledger owns the schema, the validation guards, and every read). |
| **BillingState** | **Ledger (source of truth)** | Exactly one per Account (object-model §18). States `free → subscribed → auto_paused → subscribed \| cancelled → free`. Holds `pricing_mode`, `fee_table`, `cycle_anchor`, `last_qualifying_activity_at`, and only a tokenized `processor_ref` — never an instrument (Product Law #10, I-11). |
| Outcome | Moves | Read-only upstream: the sole legal source of MeterEntries (I-6). Ledger consumes the `billable_recovery` event Moves emits on `granted`/`partial` Outcomes with dollars. |
| Item / Extraction | Triage | Read-only, for entry display (title, sender) and for the counterfactual audit trail — every `averted` amount must trace to confirmed Extractions (`escalation_amount`, `amount_due`, renewal amount). |
| Account | Platform | Ledger's quota job maintains `items_used_this_cycle` and answers the quota-gate API that Triage calls before full triage on free/paused accounts (§7 F-L6). |
| Notification | Watchtower | Ledger emits events (`billing_pause_notice`, `weekly_money_summary` payloads, `resume_confirmed`, `fee_charged_receipt`); Watchtower's deterministic scheduler owns every send, cap, and quiet-hours decision. Ledger never sends anything itself. |
| Receipt | Watchtower | Read-only adjacency: W-07 links to the Receipt ledger but never re-computes it — trust counters have one owner each. |

> **Object-model extensions (each requires a `BUILD_LOG.md` entry):**
> 1. **New table `Charge`** (ulid `chg_`): `account_id` fk, `kind` enum (`subscription` \| `recovery_fee` \| `refund` \| `proration_credit`), `amount` money, `processor` enum (`stripe` \| `apple`), `processor_ref` text, `related_outcome_id` fk nullable (set on `recovery_fee`), `cycle` date, `occurred_at`. Append-only mirror of every real charge/refund, written by the processor-webhook consumer. This is the cost side of the break-even line — it must be locally derivable, not a live processor query.
> 2. **MeterEntry gains `counterfactual_basis`** enum, required when `kind = averted`: `escalation_stated` \| `renewal_stated` \| `fee_pending_stated` \| `contest_dismissed`. Machine-checkable honesty: an averted entry with no basis is rejected at write time (§8 guards).
> 3. **BillingState gains** `plan_interval` enum (`monthly` \| `annual`), `fee_charges_this_cycle` money (drives the per-recovery monthly cap), and `pause_history` jsonb[] (`{cycle, skipped_amount}` — renders W-13's pause history).
> 4. **Binding clarification of `last_qualifying_activity_at`:** qualifying activity is **user-initiated only** — app open, Snap, bulk upload, confirmation, gate tap, or a Handoff by any member. Automatic ingestion (Informed Delivery, Mailroom, unattended forward-in) does **not** qualify. Without this rule, a dark user's own mail stream would keep their billing alive — the exact zombie mechanic Molehill exists to kill.

## 4. Lifecycle

Full state machines live in object-model §17–18 and are law. This section maps states to what the user sees.

**MeterEntry** — append-only: `written`, optionally later offset by a `reversal`.

| State | User sees |
|---|---|
| `written` (`recovered`) | M-05/W-07 entry row: "Chase late-fee waiver — **$35 recovered** · Mar 12" with a tap-through to the Outcome and Item (M-16/M-11). Headline total includes it the moment it's written — and not one second before: pending Outcomes render greyed and uncounted ("waiver sent — awaiting reply, typ. 14 days"). The Meter never lies forward. |
| `written` (`averted`) | "Parking ticket held at $85 — **$85 doubling averted** · Jan 22", with the basis one tap away: "The ticket said $170 after Jan 24. You paid $85 on Jan 22. We count the difference, once." |
| `reversal` | Never hidden, never netted silently. The reversed pair renders struck-through with the correction adjacent: "Corrected: the waiver was $20, not $35. −$35 / +$20 — corrections are always visible." |

**BillingState** — `free → subscribed → auto_paused → subscribed | cancelled → free`.

| State | User sees |
|---|---|
| `free` | M-18/W-13: "Free tier — 5 items a month, forever. No card on file, nothing to forget." Quota meter ("2 of 5 this month"). Full Meter, full break-even line (cost side reads $0.00). Never auto-converts (I-12): quota exhaustion shows the paywall variant, charges nothing, ever. |
| `subscribed` | Plan + price + interval, next charge date, the three commitments block (auto-pause · one-tap cancel, no retention flow · free tier never auto-converts), **cancel button flat on the page**. |
| `auto_paused` | Banner: "Paused — you weren't charged this month." Pause history listed ("September: not charged — you didn't use Molehill"). Resume requires an explicit tap; there is no silent resume-and-charge path in the codebase (I-12). |
| `cancelled → free` | "Cancelled. Nothing further will be charged. Your data stays; the free tier is yours as long as you want it." Immediate; pro-rata refund line item appears in Charge history for annual plans. |

**Charge** — append-only rows rendered as W-13 invoice history (processor-hosted PDFs linked per row). Refunds and proration credits are their own rows, never edits.

**Retention:** MeterEntries and Charges persist until account purge — they contain amounts and refs, no document text. On Item purge, MeterEntries survive with the Item ref nulled (the Meter never un-earns — F-09 step 5). BillingState hard-deletes at account purge except the 18-month `processor_ref` tombstone for refund-dispute defense (object-model §18).

## 5. Actions

### User-initiated

| Action | Trigger / Screen | Preconditions | Effect | Feedback | Undo |
|---|---|---|---|---|---|
| Open the Ledger | M-05 tab / W-07 sidebar | — | Renders total, split, entries, break-even line | Cached total instantly; server-summed on sync (never client-guessed) | n/a |
| Trace an entry | Tap entry row | — | → Outcome (M-16) / Item (M-11/W-03); for household members, I-20 applies (§11) | Full provenance: amount, basis, evidence kind, dates | n/a |
| Dispute an entry's amount | Via M-16 "dispute the recorded amount" | Outcome `recorded` | Moves amends the Outcome → reversal + re-issue entries (I-6); any `recovery_fee` on the reversed amount auto-credits (§7 F-L7) | "Fixed — the meter now shows $20. The $3 fee was credited back." | Amend again |
| Subscribe / upgrade | M-18 / W-13 | Explicit tap; `free` or `cancelled` state | `free → subscribed`; first Charge row written on processor confirmation | "You're on Molehill Solo — $9/mo. It pauses itself if you don't use it." | Cancel any time, one tap |
| Switch pricing mode | W-13 (read-only display on M-18 for iOS-purchased subs) | `subscribed` | `pricing_mode` changes at next cycle boundary (never mid-cycle surprise) | "Starting Nov 3 you'll pay per landed recovery: flat $3, capped at $9/mo." | Switch back before the boundary |
| Switch interval | W-13 | `subscribed` | monthly ↔ annual at boundary; annual = $90/yr | Effective-date shown | Before boundary |
| **Resume from auto-pause** | M-18/W-13 banner | `auto_paused` | `→ subscribed`, cycle re-anchors today (F-08 step 5) | "Resumed. Next charge Dec 4." | Cancel any time |
| **Cancel** | M-18/W-13 — the button is flat on the page, no hunting, no flow | any paid state | `→ cancelled → free`, effective immediately; pro-rata refund on annual (Charge `refund` row) | "Cancelled. Nothing further will be charged." Zero retention screens, zero "before you go" | Re-subscribe whenever |
| Export Meter CSV | M-05 secondary (hands off to web) / W-07 | — | CSV of current date range (§7 F-L8 schema); full account export is F-10/W-14 | "Emailed you the link — it expires in 72 hours." | n/a (idempotent re-request) |
| Download invoices | W-13 | Charge rows exist | Processor-hosted PDF per Charge | Direct download | n/a |
| Change date range / view chart | W-07 | — | Re-queries entries + monthly chart | — | n/a |

### System-initiated

| Action | Trigger | Effect |
|---|---|---|
| **Meter write** | Moves' deterministic Outcome-recording job (I-6) | 1–2 MeterEntries per Outcome; Ledger's write-path guards validate: `outcome_id` present and unique per (outcome, kind), amount > 0, `averted` carries a `counterfactual_basis` and its amount reconciles against the referenced confirmed Extractions (§8). Guard failure rejects the write and pages — a wrong Meter number is a P1. |
| Reversal issue | Outcome `amended` | Negative entry referencing `reverses_id` + corrected re-issue, same transaction. |
| **Auto-pause check** | Clocked job at each account's `cycle_anchor` (I-19) | `last_qualifying_activity_at` outside the full cycle → charge **skipped** (not queued), `subscribed → auto_paused`, `pause_history` appended, one `billing_pause_notice` event to Watchtower (cap-exempt, quiet-hours-respecting): "You didn't use Molehill this month, so we didn't charge you. Your 3 deadlines stay watched." Deadline-critical Watches keep running while paused — custody is never held hostage to billing (object-model §18). No win-back emails, ever (F-08 step 3). |
| Subscription charge | Cycle boundary, `subscribed`, activity present | Processor charge → webhook → Charge row. Charge precedes nothing: entitlements never lapse mid-webhook-delay. |
| **Per-recovery fee** | `billable_recovery` event from Moves (`pricing_mode ∈ {per_recovery, hybrid}`, Outcome `granted`/`partial` with dollars) | Flat fee from `fee_table` ($3 launch), idempotency key = `outcome_id`; skipped if `fee_charges_this_cycle` has hit the cap (§7 F-L7). Charge row + `fee_charged_receipt` event: "The Chase waiver landed — $35 on your meter, $3 fee as agreed." Never on denials, no-replies, or `user_reported_done` without dollars; never a percentage (Product Law #5). |
| Fee credit on reversal | Reversed Outcome had a `recovery_fee` | Automatic `refund`/`proration_credit` Charge row, same job as the Meter reversal. |
| Quota accounting | Item receives its accepted Verdict | `one_move`/`eyes_on` Verdicts increment `items_used_this_cycle` on free/paused accounts; **Nothing Needed never counts** — being told junk is junk is free (§7 F-L6). Resets at cycle boundary. |
| Weekly money summary payload | Watchtower's weekly clock asks Ledger | Payload only when the Meter moved or a Move executed that week — no empty summaries, money not streaks: "This week: $85 averted, $35 recovered. Total since March: $312." |
| Break-even computation | Every Ledger render + weekly summary | `meter_total − charges_total`, both SQL SUMs over local rows (§7 F-L3). |
| Processor reconciliation | Daily clocked job | Cross-checks BillingState vs Stripe/Apple subscription status; drift → §10 E-4 runbook. |

## 6. States

Ledger's surfaces are M-05 (Ledger), M-18 (Billing/Paywall), W-07 (Ledger web), W-13 (Billing web). Per-screen state tables in `product/flows.md` are law; below is what Ledger contributes.

| State | Behavior and copy |
|---|---|
| **empty** | M-05/W-07 at $0: "**$0 so far.** The meter only moves on real money — first move usually lands in week one." Break-even line shows the cost honestly even at $0: "Cost so far: $9." (free tier: "Cost so far: $0.") No fake momentum, no projected savings. |
| **loading** | Cached totals render instantly (Meter total and break-even are denormalized per account, invalidated on every entry/Charge write); entry list skeletons. The number the user quotes to their partner must never flicker. |
| **ideal** | Total, averted/recovered split ("**$312 back or kept** — $147 recovered · $165 averted"), entries with trace-through, monthly chart (W-07), break-even line in its true position (§7 F-L3 copy), commitments block on billing surfaces with cancel visible. |
| **partial** | Pending Outcomes greyed and uncounted: "waiver sent — awaiting reply (typ. 14 days)." Free-tier quota hit → M-18 paywall variant: "5 of 5 free items this month — new captures are safe and stored; they'll triage when the month rolls over, or now if you upgrade. Anything that looks like government or legal mail still gets read immediately, quota or not." (Capture is never lost to the paywall; the legal floor is never gated — §7 F-L6.) |
| **error** | Totals from cache + retry; "showing last synced ledger." Billing/processor errors state the money fact first: "**Nothing was charged.** The billing service didn't respond — try again in a minute." A charge state is never shown as succeeded without the webhook. |
| **offline** | Cached ledger read-only, sync badge. No purchase, resume, or cancel attempts offline — money actions require the server's ack, and the UI says so. |
| **degraded-AI** | **Fully functional, by construction.** Every number, state, charge, and export in this module is deterministic (brief §9). The degraded-AI row for Ledger screens is identical to ideal, and this is a product claim worth keeping true forever. |
| **behind** (module-specific) | Break-even negative: rendered plainly, adjacent to the cancel path, no spin (§7 F-L3). This state is a feature, not a failure — it is the retention pitch working as designed. |
| **paused** (module-specific) | `auto_paused`: calm banner on M-01 paid-surface touches ("Billing is paused. Resume for $9/mo — or keep the free tier."), pause history on W-13. Never urgency-framed, never a countdown. |

## 7. Workflows

Cross-module masters: F-02 step 6 (Meter tick), F-08 (auto-pause and return), F-09 step 5 (Meter survives Item purge), F-10 (account export) in `product/flows.md`. Ledger-internal flows:

**F-L1 — Meter arithmetic: what counts, exactly (binding)**

Two kinds of real dollars, one law each:

1. **Recovered** — money that existed as a charge or loss and came back: a waived fee that had already been charged, a refund posted from a return, a statement credit, a dismissed fine the user had already paid. Evidence: creditor reply, posted refund, or user attestation (F-M4). Amount source: the deterministic expectation from confirmed Extractions, or the user's active transcription of the reply's stated amount (Product Law #3) — never an AI-read number.
2. **Averted** — money that never got charged, admitted to the Meter only under the **counterfactual rule**, all four clauses required:
   - **(a) Stated on paper:** the worse number must exist as a confirmed Extraction on the document itself — `escalation_amount` ("$85 → $170"), a printed late-fee schedule, a renewal price. Molehill never estimates, models, or benchmarks a counterfactual. If the document doesn't state the worse outcome, there is no averted entry — even when a worse outcome was obviously likely.
   - **(b) Delta only:** averted = stated worse outcome − what the user actually paid. Paying an $85 ticket before it doubles averts $85, not $170. Paying a bill you owed averts $0 — a paid bill is a paid bill, not savings.
   - **(c) Once, never annualized:** recurring avoidance counts one cycle. A cancelled $12.99/mo subscription averts $12.99 (the verified-stopped next renewal), never "$156/yr". The Meter counts events that happened, not futures.
   - **(d) Verified not-happened:** the worse outcome must be deterministically confirmed absent — `deadline_passed_clean` (escalation date passed with the base action attested/confirmed), a verified-stopped renewal (Moves' `renewal_date` check, E-6/E-7 in `moves.md` §10), or the creditor's written confirmation. Until then the amount renders greyed as pending, uncounted.

   `counterfactual_basis` records which clause-(a) form applied; the write-path guard recomputes the amount from the referenced Extractions and rejects mismatches (§8).

**Per-Move-kind table (consistent with `moves.md` F-M2 — that file's Meter lines and this table must never diverge):**

| Move kind → result | Entry | Amount | Basis |
|---|---|---|---|
| `waiver_letter` granted, fee already charged | recovered | fee amount | — |
| `waiver_letter` granted, fee pending | averted | fee amount | `fee_pending_stated` |
| `payment_walkthrough` done before `escalation_date` | averted | `escalation_amount − amount_due` | `escalation_stated` |
| `contest_letter` granted, fine unpaid | averted | `amount_due` (fine dismissed) | `contest_dismissed` |
| `contest_letter` granted, fine already paid | recovered | refunded amount | — |
| `cancellation` verified stopped | averted | next renewal amount, one cycle | `renewal_stated` |
| `return_checklist` refund posted | recovered | `amount_recoverable` | — |
| `payment_plan_request` accepted | **no entry** on acceptance; averted only if a confirmed `escalation_amount` existed and the plan landed before `escalation_date` | delta | `escalation_stated` |
| `second_ask` granted | as parent kind | as parent | as parent |
| Any denial / `no_response` / `withdrawn` | **no entry, ever** | — | — |

**Never on the Meter, ever:** interest that "would have" accrued, credit-score effects, collections that "might have" happened, time saved, annualized projections, the base amount of anything the user simply paid, and any number the user hasn't confirmed or transcribed. The headline may say "back or kept"; the split is always one line below, and the averted explainer is one tap away — the Meter's credibility is the product's credibility.

**F-L2 — Reversal (master: M-16 dispute → Moves amends)**
1. Outcome `amended` → in one transaction: `reversal` entry (negative, `reverses_id` set) + corrected entry (if a correct amount exists) + fee credit if a `recovery_fee` was charged on the reversed amount.
2. UI renders the pair struck-through with the correction: "Corrected: $20, not $35." History is never rewritten; the SUM is simply right again.
3. Reversals appear in exports with their refs intact — an auditor (or a skeptical partner) can replay the whole ledger.

**F-L3 — Break-even honesty view (the retention pitch)**
1. `meter_total` = SUM(MeterEntries). `cost_total` = SUM(Charge rows: subscriptions + recovery fees − refunds/credits). Both local, both deterministic, computed per render and cached.
2. Three positions, three renders — no fourth, no spin:
   - **Ahead:** "Molehill has saved you **$312** · cost you **$27**. You're ahead **$285**."
   - **Even/early:** "Saved **$0** so far · cost **$9**. The meter only moves on real money — first move usually lands in week one."
   - **Behind:** "Saved **$0** so far · cost you **$18**. If that stays upside down, cancelling takes one tap — it's right below." — and the one-tap cancel is literally on the adjacent billing surface (M-18/W-13, one navigation away on M-05/W-07 via the billing row). The accountant states the position; nobody argues with the client about staying.
3. The behind-state copy is lint-protected like all Molehill copy: no "but", no "give it time", no discount offer, no retention plea. The honesty is load-bearing — it is the single most credible sentence the product can say to this audience (thesis §Business model).
4. Free tier renders the same line with `cost_total = $0` — which is also honest: "Saved $35 · cost $0."

**F-L4 — Auto-pause cycle (master F-08)**
1. Clocked job at `cycle_anchor` per account (I-19, timezone-cohort sharded like the 9am job).
2. `last_qualifying_activity_at` within the cycle (user-initiated only — §3 clarification #4) → normal charge → Charge row.
3. No qualifying activity → charge **skipped**, `subscribed → auto_paused`, `pause_history` appended, one `billing_pause_notice` (cap-exempt): "You didn't use Molehill this month, so we didn't charge you. Your 3 deadlines stay watched."
4. While paused: no charges accrue any cycle; deadline-critical custody fully active; all data readable; new capture volume governed by free-tier quota rules (§7 F-L6) so a paused account degrades to free-tier behavior, never to a locked one.
5. Annual plans don't cycle monthly, so the mechanic adapts, same spirit: an annual account with zero qualifying activity for a full calendar month accrues a **pause credit** — one month added to the term end per silent month, shown on W-13 ("October was quiet — your renewal moved to Nov 12, 2027"). Renewal itself never fires after 2 consecutive silent months without an explicit re-confirmation tap.

**F-L5 — Resume and cancel (master F-08 steps 4–6)**
1. Resume: explicit tap on M-18/W-13 → `auto_paused → subscribed`, cycle re-anchors today, confirmation copy states the next charge date. Silent resume-and-charge does not exist as a code path (I-12).
2. Cancel: one tap, flat on the page → `cancelled → free` immediately. Annual: pro-rata `refund` Charge row (remaining full months × monthly-equivalent). Copy: "Cancelled. Nothing further will be charged. Your data stays; the free tier is yours as long as you want it." No survey, no pause-instead offer, no exit interview.
3. iOS StoreKit subscriptions: cancel tap deep-links to the OS subscription sheet **and** Molehill simultaneously marks the account `cancelled` server-side effective now (never "cancels at period end" limbo while the user thinks they're done); the reconciliation job (§5) trues up processor state. Refund requests route through the StoreKit refund API on the user's behalf.

**F-L6 — Free tier quota + the floor scan (Product Law #2 meets Product Law #5)**
1. Free (and paused) accounts: 5 Items/month. **Counting rule:** an Item counts when its accepted Verdict is `one_move` or `eyes_on`. Nothing Needed verdicts are free — the "7 of these 11 require nothing" moment must never cost quota, because being told junk is junk is half the emotional product.
2. At quota: capture never stops and is never lost (M-18 partial state). New Captures store safely; full triage holds until cycle roll or upgrade.
3. **The floor scan:** every over-quota Capture still gets a class-only pass — deterministic sender registry first, then a minimal classification call for `legal_class` only. `legal_class ≠ commercial` (including `unknown`, fail-closed per I-4) → **full triage runs regardless of quota** and the Item surfaces Eyes On, quota-exempt. The legal floor is never gated by money (Product Law #2); a court notice does not wait for a paywall. Floor-scan cost is cents and is Molehill's to eat.
4. Quota display is passive: the "4 of 5" meter lives on M-18/W-13. No push notification ever nags about quota; the paywall is a surface, not a campaign. Free tier never auto-converts (I-12) — the `free → subscribed` edge requires an explicit purchase event, verified in CI against the state machine.

**F-L7 — Per-recovery pricing (Product Law #5)**
1. **Modes** (`pricing_mode`): **subscription** — $9/mo solo · $14/mo household · $90/yr annual; unlimited items; no fees. **per_recovery** — $0/mo; unlimited items; flat **$3 per landed recovery** (Outcome `granted`/`partial` with dollars on the Meter); **capped at $9/mo solo · $14/mo household** — per-recovery can never cost more than the subscription would have, so a jackpot month (the six-week-pile burst) never produces a punishing bill. **hybrid** — $4/mo + $2 per landed recovery, same monthly total cap. Every fee is a flat dollar amount from `fee_table`; a percentage of savings is not representable in the schema and never will be (Product Law #5).
2. **Disclosure in advance:** M-14/W-05 renders the fee line before the send gate on fee-mode accounts (Moves renders, Ledger supplies): "If this lands, it's a flat $3 — only when it lands. Capped at $9 a month." No fee is ever a surprise.
3. **Charge moment:** `billable_recovery` event → idempotent charge (key = `outcome_id`) → Charge row → `fee_charged_receipt` event. Cap reached → fee skipped, receipt says so: "Fifth landed recovery this month — no fee, you hit the $9 cap."
4. Reversal → automatic fee credit (F-L2). Denials, no-replies, withdrawn, and dollar-less outcomes are never billable.
5. Fee-mode auto-pause is inherent (no recoveries → $0), and the hybrid $4 base follows F-L4's skip rule like any subscription.
6. **Platform reality:** per_recovery and hybrid are configured and billed via Stripe on web at launch (metered flat fees don't map to StoreKit subscriptions); iOS shows fee-mode state read-only with policy-compliant messaging. The iOS-purchasable product is the subscription. Revisit when App Store external-purchase rules allow parity; the pricing law itself is platform-independent.

**F-L8 — Export**
1. **Meter CSV** (M-05 hands off to web; W-07 direct): columns `entry_id, occurred_at, kind, amount, currency, counterfactual_basis, item_title, creditor, move_kind, outcome_result, evidence_kind, reverses_entry_id, item_id, outcome_id`. Date-range scoped; reversals included with refs; household members' export honors I-20 (§11).
2. **Charges CSV** (W-13): `charge_id, occurred_at, kind, amount, processor, cycle, related_outcome_id` + invoice PDF links.
3. **Break-even statement** (W-07): per-month `meter_delta, charges, running_position` — the one-page "was it worth it" artifact, built for being shown to a partner.
4. Delivery: prepared server-side, expiring signed link by email (72h), idempotent re-request — same mechanics as F-10. The full account export (W-14) includes all of the above plus everything else; Ledger's exports are the money-scoped fast path.
5. Exports contain amounts, titles, senders, and refs — never document images, never Draft text (those live under F-10's consent rules).

## 8. AI behavior

**What the AI does here: nothing at runtime.** Ledger is the deliberately-not-AI module (brief §9: "the Tax Meter arithmetic, Receipts, send/pay gates, billing states" are non-AI by law). No model call exists in any Ledger code path — not for amounts, not for copy, not for "insights." The one adjacent model touch is the floor scan's class-only call (F-L6), which is Triage's classifier invoked under Ledger's quota gate, governed by Triage's spec and I-4 fail-closed rules; Ledger consumes only its boolean.

**Why, stated once:** the Meter is the trust anchor and the retention hook — it must be exactly and boringly correct (thesis §Deliberately non-AI). A generative step anywhere near a dollar figure, a charge, or a billing transition would put the product's most-quoted number and its most-marketed promise on a stochastic footing. AI writes words elsewhere; here even the words are fixed templates with deterministic merges.

**Deterministic guards on the write path (the honesty enforcement):**
- MeterEntry writes validate: `outcome_id` present, unique per (outcome, kind), amount > 0, kind-appropriate evidence on the Outcome, and for `averted`: `counterfactual_basis` present and the amount recomputes exactly from the referenced confirmed Extractions per the F-L1 table. Any mismatch rejects the write and pages on-call — a wrong Meter number is a P1 incident, not a bug ticket.
- Charge writes validate: idempotency key, cap arithmetic, mode eligibility, and that `recovery_fee` references a `granted`/`partial` Outcome with a positive MeterEntry.
- Copy templates for all Ledger surfaces pass the standing lints: no quantified already-missed loss (I-8), no shame vocabulary, no retention-plea constructions in the behind-state or cancel flows (F-L3.3).

**Fallback when the model is unavailable:** Ledger is unaffected — this is the degraded-AI guarantee of §6 and it is testable in CI (Ledger's service has no model-client dependency to fail). The only interaction: floor scans queue with the rest of Triage; over-quota commercial items hold a little longer, legal-floor detection resumes with the pipeline, and the deterministic sender registry keeps catching known government/court senders meanwhile.

**Features in this module that deliberately do NOT use AI (the complete list — i.e., all of them):** Meter sums and splits; the counterfactual validation; reversal mechanics; break-even math and its copy selection (a three-way branch on a subtraction); quota counting; the auto-pause job; charge/refund/proration arithmetic; per-recovery fee decisions and caps; pricing-mode transitions; every billing state transition; export generation; the weekly money summary payload (template + confirmed numbers). Reason, uniformly: money and billing are where trust is won arithmetic-first, and where a single stochastic error costs more than all the intelligence AI could add.

## 9. Scale

| Metric | 1 user | 1,000 users | 100,000 users |
|---|---|---|---|
| MeterEntries | 1–5/mo (onboarding burst up to ~8 from the first pile) | ~3.2k/mo | ~325k/mo (~1.3× Outcomes, per `moves.md` §9); lifetime rows stay small — this is the cheapest table in the product |
| Charge rows | 1–2/mo | ~1.5k/mo | ~150k/mo (subs + fees + occasional refunds) |
| Auto-pause evaluations | 1/cycle | 1k/mo | 100k/mo — trivial clocked job, timezone-cohort sharded |
| Floor scans (over-quota) | 0–10/mo | low thousands/mo | ~0.5–1M/mo worst case; class-only calls at fractions of a cent — budget < $500/mo at 100k users, Molehill eats it (F-L6.3) |
| Model calls (Ledger proper) | **0** | **0** | **0** |

**Hot paths:** M-05/W-07 first paint — denormalized per-account `meter_total`, `recovered_total`, `averted_total`, `cost_total`, invalidated transactionally on every entry/Charge write, re-derivable by SUM at any time (the cache is a convenience, the SUM is the truth; a nightly job asserts cache == SUM); the cycle-boundary job fan-out (pause checks + subscription charges + quota resets in one pass per account); webhook ingestion (Stripe/Apple) with at-least-once delivery and idempotent Charge writes.

**Pagination:** entry lists paginate at 50 (W-07 virtualized); a heavy 3-year account holds ~200 entries — modest by design, because the Meter only records real events. Exports stream server-side; no export is assembled in a request cycle.

**Cost drivers:** processor fees (Stripe ~2.9% + 30¢ — on a $3 fee that's ~13%, priced into the $3; StoreKit 15–30% on subscriptions — priced into $9 economics), Lob/email costs live in Moves, floor scans as above. **Rate limits:** export requests 4/day/account (idempotent re-request returns the same link); dispute/amend actions are unthrottled — correcting the Meter must never feel gated.

**SLOs (binding):** MeterEntry visible on M-05 ≤ 5s after Outcome recorded (F-02's "Meter tick" moment); auto-pause decision executes before the charge attempt, always — the ordering is structural (same job), not temporal luck; cancel-tap → server-ack ≤ 2s with the confirmed copy; webhook → Charge row ≤ 60s.

## 10. Errors

Ranked by likelihood × harm. Data-loss guarantee: MeterEntries and Charges are append-only and re-derivable; no billing or Meter action, once acknowledged, is ever lost or silently altered. The money-fact rule for all error copy: state what was and wasn't charged, first.

| # | Failure | Detection | User-facing message | Recovery | Data loss |
|---|---|---|---|---|---|
| E-1 | **Charged during a cycle that should have auto-paused** (the brand-breaking one) | Pause check and charge live in the same job with pause evaluated first (structural); reconciliation job cross-checks `pause_history` vs Charge rows daily | "We charged you for a month you didn't use Molehill. That's our defining promise broken — the $9 is already on its way back." | Automatic full refund (no support ticket needed), P1 incident, postmortem; repeat-offense telemetry is a launch-blocking metric | none |
| E-2 | Double per-recovery fee (webhook retry, event replay) | Idempotency key = `outcome_id` at charge creation; unique constraint on Charge (`related_outcome_id`, kind) | Invisible when caught; if a duplicate lands: "You were charged twice for one recovery — refunded." | Auto-refund on constraint-violation detection | none |
| E-3 | **Averted entry overcounts** (counterfactual rule violation — e.g., full $170 instead of the $85 delta) | Write-path guard recomputes from Extractions (§8); nightly audit re-runs all averted entries against the F-L1 table | If one ships: reversal + correction, visible: "Corrected: $85 averted, not $170 — we count the difference, not the whole ticket." | Guard bug fixed as P1; the Meter's overcounting rate target is zero, audited, and reported in the falsifiability dashboard (crown graft from evergreen) | none — append-only correction |
| E-4 | Processor state drift (webhook missed; Apple/Stripe disagree with BillingState) | Daily reconciliation job; on iOS, App Store server notifications + receipt refresh | Only if user-visible: "Your billing state was out of date — corrected. Here's what was actually charged: …" | State machine trues up to processor ground truth for charges, to Molehill ground truth for entitlements (never lock a user out over a webhook); discrepancy log | none |
| E-5 | Floor scan misses a legal-floor item at quota (court notice held behind paywall) | Fail-closed design: `unknown` class → full triage (I-4); sender-registry hit → bypass; scan pipeline down → over-quota captures queue as `legal_class = unknown` = floor-treated | n/a when working — the failure mode is designed to over-triage, never under | Pipeline recovery re-scans; any confirmed miss is a P1 (Product Law #2 breach) | none — Captures always stored |
| E-6 | Fee charged on an Outcome later reversed | Same-transaction fee credit on amendment (F-L2) | "The meter was corrected, so the $3 fee came back too." | Automatic; Charge `refund` row | none |
| E-7 | Cached Meter total ≠ SUM (cache invalidation bug) | Nightly cache==SUM assertion; W-07 renders from SUM on any mismatch flag | Brief: "Recomputing your ledger…" then correct totals | Cache rebuilt from SUM; the SUM is always the truth | none |
| E-8 | Cancel tap fails mid-flight (network, processor outage) | Server-ack required for the confirmed state; no optimistic "Cancelled" render | "Cancellation didn't go through — **you have not been charged anything new.** Retrying automatically; we'll email when it's confirmed." | Server-side retry queue; cancellation is honored from tap-time regardless of processor lag (no charge between tap and ack survives reconciliation) | none |
| E-9 | Pro-rata refund miscalculation on annual cancel | Deterministic formula (remaining full months × $7.50) in tested code; refund amount shown before confirm | Refund line on W-13 with the arithmetic spelled out: "7 months remaining × $7.50 = $52.50" | Dispute path via support → manual Charge `refund` adjustment, logged | none |
| E-10 | Export link mis-delivered or leaked | Expiring signed link (72h), single-account scoped, revocable from W-14; email only to the verified account address | "Need it again? Re-request — old links die at 72 hours anyway." | Revoke-all-links button on W-14; links carry no auth beyond their scope | none |
| E-11 | Quota counter drift (double-count on Verdict re-acceptance, undercount on races) | Counter increments keyed by `item_id` (set-semantics, not additive); cycle reset job idempotent | Worst case user sees "5 of 5" one item early: "Our count was off — you have one more free item this month." | Recount from Verdict rows (the counter is a cache of a query, re-derivable like everything else here) | none |

## 11. Permissions

| Actor | Can |
|---|---|
| Account owner | Everything: full Meter with entry trace-through, all billing actions (subscribe, mode/interval switch, resume, cancel), Charges/invoices, all exports. Billing actions are **owner-only** — a household member can never change the plan or trigger a charge. |
| Household member | Sees the account Meter totals and split (the money story is shared — it's the household's recovered money) and the break-even line. Entry **trace-through follows I-20**: entries on Items the member captured open fully; entries on others' Items render as amount + date + status-line only ("Recovered $35 · item held by Maya") — never creditor names or document details on money items they didn't capture. Member-scoped Meter CSV export applies the same masking. No billing surface beyond read-only plan name. |
| Free-tier user | Full Meter, full break-even (cost $0), full export. The Ledger is the conversion surface precisely because it's fully honest before any payment exists. |
| Support | BillingState, Charge rows, pause history, MeterEntry metadata (ids, kinds, amounts, timestamps) — enough to fix any billing dispute. **Never** Item titles, creditor names, entry trace-through, or export contents. Refund issuance is a logged support action visible to the user afterward. |
| Payment processors (Stripe/Apple) | Receive amount, currency, and an opaque account ref. Never Item data, never Meter contents, never why a fee was charged beyond "Molehill recovery fee." Molehill holds only `processor_ref` tokens — no instrument ever touches our schema (Product Law #10, I-11). |
| Analytics | Aggregates only: dollars recovered per user-year (the north star, Product Law #8), averted/recovered ratios, break-even position distributions, pause/resume/cancel rates, fee-cap hit rates. Never per-entry creditor data, never individual break-even positions tied to identity in any human-readable surface. |

Sensitive-data notes: the Meter reveals financial behavior (fines, debt, waivers) by existence alone; entry rows on shared surfaces therefore default to the masked form above. `insurance_eob` and other legal-floor-derived entries follow the same rule as their Items: amounts and dates, never detail, on any surface but the capturer's own. There is no coach-share surface at launch; if one ships later it inherits the household member rules, not the owner's.

## 12. Dependencies

**Upstream (hard):** Moves — the `billable_recovery` event and the Outcome-recording job are the only writers of MeterEntries (I-6); the F-L1 per-kind table and `moves.md` F-M2's Meter lines are one contract maintained in both files. Triage — confirmed Extractions are the only legal amount sources for averted math; the quota gate and floor scan sit at Triage admission (Ledger decides, Triage enforces). Watchtower — `deadline_passed_clean` verification and all clocks: the cycle-boundary job, reconciliation schedule, and weekly summary tick are Watchtower-pattern clocked jobs (I-19); every Ledger notification event is sent by Watchtower's scheduler under its caps and quiet hours.

**Downstream:** none — Ledger is the terminal module. Nothing consumes its state except screens, exports, and the north-star metrics pipeline.

**External services:** **Stripe** (web subscriptions, per-recovery and hybrid fees, refunds, webhooks) and **Apple StoreKit** (iOS subscription purchase/cancel/refund, App Store server notifications). Both hold the instruments; Molehill holds tokens (Product Law #10). Transactional email for export links and billing receipts (same provider as Moves' sending infra, distinct sending domain to protect deliverability separation of "money letters to creditors" from "receipts to users").

**Device capabilities:** none required. No location, no calendar, no contacts. Push for billing notices arrives via Watchtower's existing channel permissions; a user with push declined gets `billing_pause_notice` and fee receipts by email (a billing notice must always land somewhere — it's a money fact).

**Platform differences:** mobile (M-05/M-18) is the glance-and-act surface — total, split, break-even, resume/cancel, quota meter; CSV export hands off to web. Web (W-07/W-13) is the surface of record — monthly chart, per-creditor recovery table, full entry table with reversals, invoice history, pause history, pricing-mode and interval switches, all exports. Per-recovery/hybrid configuration is web-only at launch (F-L7.6); iOS renders those states read-only. The arithmetic, the counterfactual rule, the auto-pause law, and the one-tap cancel are byte-identical everywhere, enforced in the API layer, not the client — like I-14, honesty is server-side.
