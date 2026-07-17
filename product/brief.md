# Molehill — Shared Product Brief (Single Source of Truth)

> **Naming note (v1.1):** the contest crowned this product as **"Recoup"** (`contest/winner.md` — kept unchanged as the historical record). The domain/name check then found recoup.com and recoup.ai are live companies doing fee/subscription recovery — an active same-category collision (`ops/domain-check.md`). The product is therefore renamed **Molehill** ("making the mountain back into a molehill"): same thesis, same product law, new name. Everywhere below and downstream, Molehill = the contest's Recoup.

*Every downstream document, spec, wireframe, and prompt uses the terminology, module list, and constraints defined here. Later agents may extend but never silently reinvent. Changes require an entry in `BUILD_LOG.md`.*

**Version:** 1.1 · **Status:** Locked after contest (`contest/winner.md`) · **Binding conditions from the crown decision are law and are folded in below.**

---

## 1. One-liner

Snap a photo of the scary envelope — Molehill reads it, tells you the real dollars at stake, and does 90% of the fixing. It turns the ADHD tax into a running refund.

## 2. The winning problem

**Cluster 4: Life Admin Avoidance & the ADHD Tax** — unpaid bills, unopened mail, zombie subscriptions, unmade returns, doubling fines (`research/pain-points.md`, skeptic verdict 0.8 — the strongest in the dataset; objective anchor: ADHD adults' credit-default risk peaks ~6× the general population by age 40, Swedish registry data, N=11.55M, <https://www.science.org/doi/10.1126/sciadv.aba1551>).

**Cluster 2 (as design constraint): every coping tool stops working** — median 70% abandonment within 100 days (JMIR 2024, n=525,824, <https://www.jmir.org/2024/1/e56897>). Molehill is designed so returning at day 101 works as well as day 2.

Core behavioral insight (verified quote): *"Open the envelope you have to deal with the contents. Don't open the envelope nothing to deal with."* (<https://totallyadd.com/forums/forums/topic/why-dont-we-open-envelopes/>). The avoidance attaches to the **dealing**, not the paper. Molehill decouples them: the human's only sustained job is capture; the AI does the dealing.

## 3. Target user

- **Maya, 34** — primary persona. Marketing manager, ~$75k, diagnosed at 31 (the post-2020 surge cohort of women 23–49 whose new-diagnosis rate nearly doubled, <https://www.epicresearch.org/articles/number-of-adhd-patients-rising-especially-among-women/>). Has the money, not the dealing. Six-week mail pile, three zombie subscriptions, a doubling parking ticket, a $140 return riding in the trunk, and a shame loop.
- **Sam** — secondary persona: Maya's partner. Currently the reluctant nag. In Molehill's household tier, Sam hands items to the agent so *the agent carries the nag, never the spouse*.

## 4. Product thesis (post-contest, conditions folded in)

Molehill is an **AI admin harm-reduction service**. It is externally triggered (mail keeps arriving whether or not you open the app), episodic (one move a day, not a daily habit to maintain), denominated in real dollars (the one reward that doesn't habituate), and engineered so that **lapsing is safe**: billing auto-pauses, piles get amnesty, and automatic ingestion channels keep watching when the user goes dark.

The crown's key correction of the original thesis: **camera capture is a convenience, never the sole trigger.** The loop must start and restart with zero sustained user behavior (USPS Informed Delivery, email forward-in, Molehill Mailroom virtual address, partner handoff). When ingestion learns of a dollar event, Molehill goes outbound — the agent travels to the user; the user never has to travel to the tool.

## 5. Module architecture (locked — 5 core modules)

| # | Module | One-line purpose | Owns objects |
|---|--------|------------------|--------------|
| 1 | **Capture** | Get every scary item into the system with near-zero user behavior: Snap, email forward-in, USPS Informed Delivery, Mailroom (virtual address), partner Handoff | Capture, Channel, Household |
| 2 | **Triage** | The AI reading room: identify each Item, extract deadline/dollars/consequence with source regions, deliver a Verdict, gate through human confirmation | Item, Extraction, Verdict |
| 3 | **Moves** | Pre-executed recovery actions: drafted waiver letters, payment-plan requests, cancellations, contest letters, return checklists, call scripts; the per-creditor Playbook corpus (the moat) | Move, Draft, Playbook, Outcome |
| 4 | **Watchtower** | Deadline custody: deterministic scheduler, the custody-handoff ritual, notification ladder, self-silencing, reliability Receipts | Watch, Deadline, Notification, Receipt |
| 5 | **Ledger** | The Tax Meter: dollars averted/recovered, break-even honesty, billing states incl. auto-pause | MeterEntry, BillingState |

Cross-module flows are specified in `product/flows.md`; the object model in `product/object-model.md`.

## 6. Terminology glossary (canonical — use these words everywhere)

| Term | Meaning |
|------|---------|
| **Item** | One captured document/email/handoff after triage. Never called "task" or "todo". |
| **Snap** | Camera capture of paper (opened or unopened). |
| **Mailroom** | Molehill's virtual-address + Informed Delivery ingestion. |
| **Handoff** | A household member giving an item to the agent ("the forms are due Friday"). |
| **Verdict** | Triage outcome. Exactly three classes: **Nothing Needed** (junk/FYI — commercial mail only), **One Move** (actionable, Molehill pre-executes), **Eyes On** (legal floor: government, tax, court, legal, insurance-EOB, debt-collection — always surfaced to human eyes, never auto-verdicted). |
| **Move** | One pre-executed action offered to the user. "One Move a Day" is the default cadence. |
| **Watch** | Active deadline custody on an Item ("This envelope is mine now — watching 3 deadlines"). |
| **Receipt** | The boring trust counter: deadlines watched / deadlines never silently missed. Locally computed, deterministic. |
| **Tax Meter** | Running ledger of dollars averted + recovered. Plain arithmetic, no AI. |
| **Pile Amnesty** | Re-entry rule: after any lapse, the user sees exactly one screen — one Move, current dollars — never a backlog or an "overdue" count. |
| **Self-silence** | After 3 ignored notifications, Molehill says so out loud ("These aren't landing — I'll wait for your next snap") and stops. Deadline-critical Watches are exempt. |

## 7. Product law (binding, from crown conditions — none may be relaxed by any later spec)

1. **Automatic ingestion in month one**: Informed Delivery, forward-in email, Mailroom option, and Handoff ship alongside Snap.
2. **Legal-mail floor**: "Nothing Needed" verdicts restricted to commercial/marketing mail. Gov/tax/court/legal/EOB/debt-collection always get human eyes; exempt from the one-move cap and self-silence.
3. **Anti-complacency confirmation**: money/deadline-bearing extractions are confirmed by **active transcription** (user types the date/amount read from the highlighted source region), never a passive approve tap.
4. **Privacy as product law**: zero-retention or on-device for document images; no training on user documents; per-document consent; published deletion policy. The "documents rot on counters anyway" rationale is struck.
5. **Revenue coupled to recovery**: flat $9/mo subscription **plus** a per-executed-recovery flat-fee option (never a % of savings); auto-pause billing when unused; one-tap cancel, no retention flow; free tier (5 items/mo) that never auto-converts.
6. **RSD-safe framing**: denials relayed neutrally under the agent's identity ("the issuer said no this time; second asks succeed ~40%"); default framing is recoverable dollars (gain); loss-framed countdowns opt-in; no notification ever quantifies an already-missed loss.
7. **Deterministic triggers**: AI writes words; a deterministic scheduler pulls every trigger. No date or dollar figure passes through a generative step after human confirmation.
8. **North-star metrics**: dollars recovered per user-year, reactivations per scary-envelope event, week-4 re-capture rate. Week-6 engagement is explicitly NOT a KPI.
9. **Pre-scale kill test**: 20-user mail-pile pilot; measure week-1 capture and week-4 re-capture; pre-registered failure threshold → automatic-ingestion-first pivot.
10. **Scope prohibitions**: never move money, never hold payment credentials, no credit-repair or clinical claims, no medication features. Positioned as an adjunct scaffold, not a standalone fix.

## 8. Navigation (locked)

**Mobile (iOS-first)** — 4 tabs + center action:
`Today` (the one Move + amnesty re-entry) · `Snap` (center FAB, camera-first) · `Watch` (custody list + receipts) · `Ledger` (Tax Meter). Settings via profile glyph on Today.

**Web app** — left sidebar:
`Today` · `Inbox` (all Items: search, filter, bulk select, archive, recovery/undo) · `Watch` · `Ledger` · `Household` · `Settings`. Web is the power surface: bulk capture upload, item history, data export/delete. Mobile is the capture-and-confirm surface.

## 9. AI usage split (summary — full spec in `product/ai-spec.md`)

**AI (load-bearing):** document identification, field extraction with source regions, ignorability verdict (within legal floor), consequence explanation in plain language, recovery-draft composition against the specific creditor, denial-reply neutralization, playbook generalization.
**Deliberately not AI:** capture flow, deadline math and countdowns, the 9am scheduler, the notification ladder and self-silence rule, the Tax Meter arithmetic, Receipts, send/pay gates, billing states.

## 10. Riskiest assumptions (tracked; kill test in §7.9)

1. Photographing a closed envelope stays emotionally cheap after Molehill makes contents unavoidable ("the camera becomes the envelope" risk — clinical attack).
2. Steady-state recoverable events are frequent enough post-honeymoon (retention attack: backlog jackpot is one-time).
3. Flat visible pricing beats invisible skims at acquisition time (Cushion died with 200k paying users — market attack).
4. Extraction+confirmation is fast enough to feel like relief, not homework.

## 11. Evidence anchor set (full ledger: `research/evidence-ledger.md`)

The ten load-bearing citations for this product are listed in `contest/theses/adhd-tax.md` §Evidence and were re-verified by the contest skeptics (`contest/attacks.md`). Key set: Science Advances 6× default risk; Monzo 49%-vs-18% missed payments + £1,600/yr (self-report, labeled); ADDitude bankruptcy-at-23 quote; TotallyADD envelope quote; US News returns-in-car quote; JMIR 70%/100-day abandonment; Duolingo KDD 2020 self-silencing precedent; Epic Research diagnosis surge; CDC 15.5M US adults; Cushion shutdown post-mortem.
