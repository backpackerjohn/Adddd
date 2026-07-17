# Competitor Teardowns — Comparative Landscape Index

*Terminology note: per `product/brief.md` v1.1, the contest crowned this product as **Recoup**; the domain check forced a rename to **Molehill** (Molehill = the contest's Recoup). This index uses the brief's canonical vocabulary throughout: Item, Snap, Mailroom, Handoff, Verdict, Move, Watch, Receipt, Tax Meter, Pile Amnesty, Self-silence.*

Eight teardowns: three **direct** competitors (DoNotPay, Rocket Money, Cushion — the only products that ever touched the recovery step), one **adjacent-infrastructure** study (Monzo/Starling), and four **adjacent** ADHD-native tools (Goblin Tools, Finch, Dubbii, Tiimo). Every claim below is sourced inside the linked teardown.

---

## 1. Positioning map

| Competitor | Sees physical mail? | Executes recovery? | ADHD-aware emotional design? | Honest billing? | AI load-bearing? | Pricing |
|---|---|---|---|---|---|---|
| **DoNotPay** ([teardown](donotpay.md)) | No — pull-based; the user must arrive with the problem | Partial — letters/appeals genuinely filed in narrow flows; silent failure and vaporware elsewhere (FTC order) | No — RSD-hostile silent failures; no lapse design | **No** — BBB pattern-of-complaints alert; billing after confirmed cancellation; 1.8★ Trustpilot | Yes — and overclaimed ("robot lawyer"), the FTC's named precedent | ~$36 / 2 months (~$216/yr; sources conflict) |
| **Rocket Money** ([teardown](rocket-money.md)) | No — bank feed only; sees the fee *after* the money left | Yes — concierge cancellation + bill negotiation; hardest cases bounce back to the user | No — mass-market fintech; no amnesty, no self-silencing, alert-feed habituation | **No** — 35–60% savings skim, inflated-savings disputes, hard-to-cancel Premium, 1.89★ BBB reviews | No — detection is bank-feed plumbing; concierge is human/process | Free tier + Premium $6–12/mo + **35–60% of first-year savings** |
| **Cushion** † dead 2024 ([teardown](cushion.md)) | No — Plaid transaction feed + email BNPL parsing; fees seen post-harm | Yes — auto-negotiated bank-fee refunds (the purest prior attempt) | No — sold a transaction, never the "handled" feeling; zero ADHD positioning in 8 years | Mixed — no cancel-trap complaints, but subscription **plus** 25–39% skim, and skimmed non-negotiated refunds | Yes — the negotiation bot was the product | $36–96/yr + 25–39% of each refund (final era: $4.95/mo) |
| **Monzo / Starling** ([teardown](monzo-adhd.md)) | No — sees only money that flows through the account | No — notifies of the failed payment; never drafts the appeal | Partial — best-shipped consent-friction (gambling block) and lapse-safety, but commitment devices leak and safety tooling is paywalled | Mostly — regulated bank, disclosed tiers; conflict: profits from overdrafts it warns about | No — deterministic rails, and that passivity is the lesson | Free account; Extra £3 / Perks £7 / Max £17 per month |
| **Goblin Tools** ([teardown](goblin-tools.md)) | No — pull-only text box; no ingestion of anything | No — hands you the list and walks away | Yes — shame-free by structure: no streaks, no counters, whimsical tone | **Yes** — free forever, no ads, $0.99 apps at cost, radical privacy | Yes — AI task breakdown is the whole product | Free (web); $0.99–1.99 one-time (apps) |
| **Finch** ([teardown](finch.md)) | No — knows only what the user types in | No — celebrates tapping "open the mail"; verifies and recovers nothing | Partial — best-in-class lapse forgiveness (immortal birb), but care-guilt engine and month-three "one more thing to tend" | Mixed — generous free tier, but trial-to-annual surprise charges ($63–80) on a forgetful audience | No — gamified habit loop, no AI in the core | Free tier + Plus $9.99/mo or $69.99/yr |
| **Dubbii** ([teardown](dubbii.md)) | No — event-blind; doesn't know the ticket arrived | No — warm company *while the user does 100% of the dealing* | Yes — no error-red, diegetic nudge sounds, para-social warmth | **Yes** — refuses free trials on principle ("predatory… for ADHD"); permanent free task | No — pre-recorded video content | ~$30–40/yr (excerpts conflict); free slice forever |
| **Tiimo** ([teardown](tiimo.md)) | No — the plan is 100% user-authored; the envelope on the counter is invisible | No — schedules "pay ticket" only after the user has already defeated the avoidance chain | Partial — non-punitive by design, but the empty timeline is a shame mirror and notifications silently fail | **No** — annual-only trial conversion, cancellation opacity, nonrefundable fine print | Partial — AI Co-Planner is an input aid atop a manual planner | Free tier + $54/yr or $12/mo |
| **Molehill** (contest name: Recoup) | **Yes** — Snap, Mailroom, USPS Informed Delivery, forward-in email, Handoff (product law §7.1) | **Yes** — pre-executed Moves from per-creditor Playbooks; deterministic Watch custody; never moves money (§7.10) | **Yes by law** — RSD-safe framing, Pile Amnesty, Self-silence, Receipts (§7.6) | **Yes by law** — flat fees only, never a % of savings; auto-pause when unused; one-tap cancel; free tier never auto-converts (§7.5) | Yes, bounded — AI reads, triages, drafts; a deterministic scheduler pulls every trigger; the Tax Meter is plain arithmetic (§7.7) | $9/mo flat + flat per-executed-recovery fee; free 5 Items/mo |

† Cushion: 1M+ users, 200k paying, $21.6M raised — wound down Dec 2024. Named as riskiest assumption #3 in the brief.

---

## 2. The five lessons the whole landscape teaches

1. **Demand for delegated recovery is proven; the category lives or dies on *provable* execution.** DoNotPay (200k subscribers at $210M valuation) and Cushion (1M users, 20% free→paid conversion) prove people will pay an agent to do the dealing — and both prove that silent failure ("said successful but didn't end up doing anything," blank filings, refunds at the bank's discretion) is category-poisoning. The winning posture is auditable: Receipts, deterministic triggers, verifiable artifacts per Move. *(Cited: [donotpay.md](donotpay.md), [cushion.md](cushion.md))*

2. **Almost everyone monetizes the deficit they treat — so honest billing is an acquisition weapon, not just ethics.** The anti-subscription tool with the BBB cancellation alert (DoNotPay), the cancellation app that's hard to cancel (Rocket Money), forgotten-trial-to-annual conversion aimed at self-described forgetful people (Finch, Tiimo), even copycats farming Goblin Tools' brand with $50 forgotten-trial charges. The two beloved exceptions — Goblin Tools' free-forever stance and Dubbii's public no-free-trial principle — earn disproportionate evangelism. Molehill's §7.5 (auto-pause, one-tap cancel, never-auto-converting free tier) is the marketable opposite. *(Cited: [donotpay.md](donotpay.md), [rocket-money.md](rocket-money.md), [finch.md](finch.md), [tiimo.md](tiimo.md), [goblin-tools.md](goblin-tools.md), [dubbii.md](dubbii.md))*

3. **Percentage-of-savings pricing corrupts the meter and caps the business.** When the party computing your savings is paid a percentage of them, the meter turns adversarial: Rocket Money's inflated-savings disputes ("saved me over $700 a year when they really only saved me $4 a month") and Cushion's skim on refunds it never negotiated. And Cushion shows the ceiling: revenue coupled to the counterparty's yes starves in quiet months and dies when the fee pool shrinks (CFPB junk-fee crackdown). Hence §7.5's flat per-recovery fee and a Tax Meter that is plain, user-auditable arithmetic — never AI, never revenue-linked. *(Cited: [rocket-money.md](rocket-money.md), [cushion.md](cushion.md))*

4. **Every loop fueled by the user's own initiative decays; only external triggers survive the lapse.** Finch — the kindest, best-retaining habit app in the world (D1/D7 beats Duolingo) — still loses ~2 in 3 users within a week, because forgiveness slows abandonment but cannot generate a reason to return. Tiimo dies when the planning habit dies; Goblin Tools and Dubbii wait passively to be remembered. The one lapse-proof product is Monzo — because it sits on the rails and the salary lands there anyway. The generalization: lapse-safety comes from structure, not willpower or warmth. Molehill's version of the rails is automatic ingestion (§7.1): mail keeps arriving whether or not the user opens the app. *(Cited: [finch.md](finch.md), [tiimo.md](tiimo.md), [goblin-tools.md](goblin-tools.md), [dubbii.md](dubbii.md), [monzo-adhd.md](monzo-adhd.md))*

5. **The entire landscape is blind to the pre-transaction paper world.** Bank feeds (Rocket Money, Cushion, Monzo) autopsy money after it leaves; planners and scaffolds (Tiimo, Goblin, Dubbii, Finch) engage only after the user has already opened the envelope, formed the task, and remembered the tool. The unopened envelope — the parking fine still at $40, the return window still open, the government letter — is where the ADHD tax is actually levied (6× credit-default risk, per the brief's anchor set), and no shipped product ingests it. *(Cited: [rocket-money.md](rocket-money.md), [cushion.md](cushion.md), [monzo-adhd.md](monzo-adhd.md), [tiimo.md](tiimo.md), [goblin-tools.md](goblin-tools.md))*

---

## 3. The white space Molehill occupies — stated falsifiably

**Claim:** *As of July 2026, no shipped consumer product simultaneously (a) ingests physical mail and paper notices before they become bank transactions (via capture, virtual address, or Informed Delivery), (b) pre-executes the recovery action (waiver letter, appeal, cancellation, payment plan) rather than reminding or instructing, (c) restarts its own loop with zero sustained user behavior after a lapse, and (d) charges flat, self-pausing fees never denominated as a percentage of savings.*

Each competitor falsifies at most two of the four: Rocket Money and Cushion hit (b) and approach (c) but fail (a) and (d); DoNotPay hits (b) weakly and fails (a), (c), (d); Monzo hits (c) but fails (a) and (b); the ADHD-native tools hit (d) at best and fail (a), (b), (c).

**How this claim dies** — any of the following would falsify it, and each maps to a tracked risk in `product/brief.md` §10:
1. A named product ships all four properties (watch: Rocket Money adding mail ingestion; a DoNotPay successor with honest billing; LendingClub reviving Cushion's IP upstream of the transaction).
2. The Molehill kill test (§7.9, 20-user mail-pile pilot) shows week-4 re-capture below the pre-registered threshold — i.e., the white space exists but capture doesn't stay emotionally cheap (risk #1) or steady-state recoverable events are too thin (risk #2), meaning the space is empty because it isn't worth occupying.
3. Flat visible pricing loses to invisible skims at acquisition (risk #3) — the Cushion/Rocket evidence cuts both ways until tested.

Until falsified, the strategic sentence stands: **the bank app sees the fee after it's charged; the planner sees the task after the user types it; Molehill sees the envelope before the fine doubles — and then does the dealing.**

---

## 4. Teardown files

| File | Product | Category |
|---|---|---|
| [donotpay.md](donotpay.md) | DoNotPay | Direct — AI consumer-recovery agent (FTC-sanctioned cautionary tale) |
| [rocket-money.md](rocket-money.md) | Rocket Money (ex-Truebill) | Direct — subscription/bill incumbent, %-of-savings model |
| [cushion.md](cushion.md) | Cushion | Direct — dead; the purest prior attempt, post-mortem |
| [monzo-adhd.md](monzo-adhd.md) | Monzo (+ Starling) | Adjacent — ADHD-adopted banking rails; source of the brief's £1,600 anchor |
| [goblin-tools.md](goblin-tools.md) | Goblin Tools (Magic ToDo) | Adjacent — task breakdown, the beloved free ceiling |
| [finch.md](finch.md) | Finch | Adjacent — the retention benchmark; lapse-forgiveness study |
| [dubbii.md](dubbii.md) | Dubbii (ADHD Love) | Adjacent — body-doubling initiation scaffold |
| [tiimo.md](tiimo.md) | Tiimo | Adjacent — visual planning layer, Apple App of the Year 2025 |
