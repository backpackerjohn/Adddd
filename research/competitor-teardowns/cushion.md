# Cushion — Teardown (Post-Mortem)

*Category: **direct** competitor — and dead. Cushion (cushion.ai, San Francisco, 2016–2025) was the purest prior attempt at Molehill's core promise: AI finds the dollars you're bleeding and goes and gets them back. It onboarded 1M+ consumers, converted 200k+ to paying, recovered a claimed $15M in fees, raised $21.6M — and still wound down at the end of 2024. This is the single most important cautionary tale for Molehill's business model, and it is explicitly named as riskiest assumption #3 in `product/brief.md` §10. Research method: WebSearch only (page fetching blocked); quotes are verbatim from search-result excerpts with URLs; anything not pinned to a source is labeled unverified.*

*(Naming note: the contest crowned this product "Recoup"; the brief renames it **Molehill**. Same product law. This doc uses Molehill.)*

---

## What it is (was) — positioning, target user, platform, pricing

**Positioning.** "Cushion offered a consumer app that sucked in the transaction history from its users' bank accounts, determined what fees had been assessed and then conducted negotiations on their behalf to get a refund" (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>). The AI negotiator was marketed as a bot ("Fee Fighter") that "disputes fees via secure email or by chatting online with your banking and credit card institutions," with "tailored responses based on your status with the bank, your banking or purchase history, and how recently you received a refund or fee waiver" (<https://moneydoneright.com/passive-income/cash-back-and-rewards/apps-and-sites/cushion-ai-review/>). Later repositioned as "AI-powered spending intelligence": bill tracking, on-time payments, subscription management, BNPL loan monitoring (<https://www.prnewswire.com/news-releases/lendingclub-acquires-ai-powered-spending-intelligence-platform-302441764.html>).

**Target user.** Fee-prone US consumers — overdrafters, NSF-fee payers, credit-card late-fee payers. Never explicitly ADHD-positioned, but demographically this is the ADHD-tax population: the people paying the fees Cushion hunted are disproportionately the missed-payment cohort documented in Cluster 4 (`research/pain-points.md`).

**Platform.** iOS/Android app + web, bank connection via Plaid, read-only: "The platform uses Plaid, a third-party service that provides read-only access to financial accounts, so while Cushion AI can read your financial information, they cannot move funds on your behalf" (<https://plaid.com/customer-stories/cushion/>, <https://findmoreai.com/en/ai-tools/cushion-ai>). (Note: Molehill's "never move money" law is the same architecture choice — Cushion proves it is buildable and marketable.)

**Pricing (it changed repeatedly — that churn is itself a finding).**
- **Fee-negotiation era:** three subscription tiers, "$36 per year with one negotiation per month," a $48/yr middle tier ("daily fee scanning, up to three negotiations per month"), and "$96 per year, with daily fee scanning, unlimited negotiations, negotiation updates, and priority support" (<https://thecollegeinvestor.com/34459/cushion-review/>, <https://www.frugalforless.com/cushion-ai-review/>). On top of the subscription, a success skim: "when the bot successfully negotiates a refund, Cushion AI keeps 25% of the refund," and "some users reported that at certain points Cushion has taken 39% of every successful fee negotiation" (<https://moneydoneright.com/passive-income/cash-back-and-rewards/apps-and-sites/cushion-ai-review/>). So: subscription **plus** percentage skim — the exact hybrid Molehill's product law §7.5 forbids (flat per-recovery fee, never a %).
- **Final era:** "Effective October 15, 2024, Cushion is no longer offering credit-building or virtual card services. Additionally, Cushion no longer offers the Fee Negotiation feature… It now starts at $4.95 per month, and offers features like budgeting and bill tracking" (<https://www.finder.com/cushion>). Ten weeks later the company was gone.

**Funding & fate.** "Founded in late 2016, San Francisco-based Cushion had raised a total of $21.6 million from investors such as Afore Capital, Flourish Ventures, Vestigo Ventures, Better Tomorrow Ventures, and 500 Global"; last raise was a $12M Series A in May 2022 at an $82.4M post-money valuation (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>). Wind-down announced end of 2024, reported January 30, 2025. Epilogue: on April 29, 2025 "LendingClub Corporation acquired intellectual property of Cushion AI, Inc." plus "select talent"; founder Paul Kesserwani became "Senior Director of Product, leading Digital Engagement at LendingClub" (<https://www.prnewswire.com/news-releases/lendingclub-acquires-ai-powered-spending-intelligence-platform-302441764.html>, <https://ir.lendingclub.com/news/news-details/2025/LendingClub-Acquires-AI-Powered-Spending-Intelligence-Platform/>). The tech was worth acquiring; the business was not worth continuing.

---

## Core loop & UX walkthrough (as documented in sources)

**Onboarding.** "The sign-up process is straightforward and requires users to create an account and link their financial institutions… After signing up, users need to connect their bank accounts and BNPL services to Cushion.ai, which enables the app to pull transaction data and organize bills" (<https://findmoreai.com/en/ai-tools/cushion-ai>). One connection event, then passive monitoring — no daily user behavior required.

**Main loop (fee-negotiation era).** (1) Bot scans linked accounts daily for fees — "ATM fees, interest charges, overdraft fees, wire transfer fees, late fees, and withdrawal fees" (<https://moneydoneright.com/passive-income/cash-back-and-rewards/apps-and-sites/cushion-ai-review/>). (2) Fee detected → bot auto-negotiates with the bank by secure email/chat. (3) Refund lands → Cushion takes its cut. "It's completely free to have the bot scan your accounts and alert you of fees and charges" (<https://moneydoneright.com/passive-income/cash-back-and-rewards/apps-and-sites/cushion-ai-review/>). Structurally this is remarkable: **the loop is fully automatic after onboarding** — even more automatic than Molehill's capture-confirm-move loop. Cushion is proof that zero-user-behavior ingestion works mechanically (1M consumers) and proof that it is not sufficient commercially.

**Main surfaces (final era).** "Users can view all their bills, subscriptions, and BNPL payments in one centralized dashboard, and the app provides reminders for upcoming payments and insights into spending habits" (<https://findmoreai.com/en/ai-tools/cushion-ai>). The BNPL tracker was genuinely novel plumbing: a "'Plaid for BNPL' system that facilitated the connection between users' email accounts and their BNPL accounts, processing over 30 million emails and $300 million in Buy Now, Pay Later loans" (<https://techfundingnews.com/behind-cushions-bankruptcy-3-things-you-should-know-about-the-82m-fintech-startup/>) — i.e., email-inbox ingestion as a capture channel, directly analogous to Molehill's forward-in email channel. Cushion also reported virtual-card payment activity to credit bureaus via the (discontinued) Cushion Card (<https://thecollegeinvestor.com/34459/cushion-review/>, <https://cushion.ai/blog/cushion-card-credit-building-program-discontinued/>).

**Notifications.** Sources document fee alerts and payment reminders only; nothing describing escalation ladders, ignore-detection, or self-silencing. Standard fintech alert feed.

**The pivot sequence (reconstructed from sources).**
1. **2016–2022:** AI bank/credit-card fee negotiation (subscription + 25% skim).
2. **2022:** $12M Series A "for a move into bill payment, while it also launched a 'Plaid for BNPL', processing over $300 million in loans" (<https://www.finextra.com/newsarticle/45443/fintech-cushion-shuts-down>).
3. **2023–24:** Cushion Card virtual card + credit-building on bill/BNPL payments (<https://thecollegeinvestor.com/34459/cushion-review/>).
4. **Oct 15, 2024:** kills fee negotiation, credit building, and the card; retreats to $4.95/mo bill-organization app (<https://www.finder.com/cushion>).
5. **Dec 31, 2024:** winds down. One pivot "hit $3 million in ARR in 10 months, but ultimately, it was more of a feature than a sustainable product" — Kesserwani (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>). (Sources don't say which pivot; the BNPL infrastructure is the likely candidate, unverified.)

---

## Retention & monetization mechanics (incl. dark patterns)

1. **Subscription + % skim stacked.** Users paid $36–96/yr *and* surrendered 25% (reportedly up to 39% at times) of every recovered fee (<https://thecollegeinvestor.com/34459/cushion-review/>, <https://moneydoneright.com/passive-income/cash-back-and-rewards/apps-and-sites/cushion-ai-review/>). Double monetization of a single value event. The 39% report also means the skim rate moved under users' feet — the price of the product was not stable or legible.
2. **Skimming non-negotiated money.** The sharpest documented complaint: "Some customers report that the app can charge a fee for money they were not negotiating, such as money refunded into your account due to fraud" (<https://donotpay.com/learn/is-cushion-ai-legit/> — note: competitor-authored content, treat as adversarial but it matches the mechanism: a bot that detects "refund landed" and attributes it to itself). This is the Rocket-Money savings-inflation problem in a different costume: **when the meter that measures your win is owned by the party paid a percentage of it, the meter is adversarial.** Molehill's Tax Meter must be plain arithmetic, user-auditable, with no revenue linkage (product law §7.5 + "deliberately not AI" list).
3. **Success ceiling as a revenue ceiling.** Failory's post-mortem: "The company made money by taking a percentage of refunded fees—which meant that in order to grow revenue, they needed to help users recover more money. But there's a ceiling to that model, especially as banks tighten their policies and reduce refunds over time" (<https://newsletter.failory.com/p/your-bank-fees-won>). A user who gets healthier generates less revenue; a bank that gets stingier destroys the margin. Cushion's revenue was coupled to a counterparty's generosity, not to the user's willingness to pay.
4. **Pivot churn as retention killer.** Finder's summary: "a downside is that it's changed its focus multiple times, such as dropping its credit-building services and bill negotiation feature" (<https://www.finder.com/credit-building/cushion>). Users who bought fee-fighting woke up owning a budgeting app; users building credit had the rails removed mid-build. Every pivot re-taught users that the promise was provisional.
5. **No documented cancellation dark patterns.** Unlike Rocket Money, sources did not surface hard-to-cancel complaints; the BBB record is thin (a handful of complaints, notably one alleging the company ignored repeated requests to remove banking data after a fraud incident, <https://www.bbb.org/us/ca/san-francisco/profile/general-services/cushion-ai-1116-927492/complaints>). Cushion died clean-ish; it just died.

---

## What users — especially ADHD users — say

Praise (fee-negotiation era, Trustpilot — overall record: 130+ reviews, generally positive per finder.com's roundup):

> "In less than 72 hours Cushion got $340 refunded" — customer review cited from <https://www.trustpilot.com/review/cushion.ai>

> "Had a ton of insufficient funds fees and cushion got them all refunded within a week!" — <https://www.trustpilot.com/review/cushion.ai>

> "they're in your corner when it comes to fee negotiation." — <https://www.trustpilot.com/review/cushion.ai>

Complaints:

- Finder's synthesis of the early-era Reddit record: "mixed feedback where some said it worked great and others stated the customer service was unresponsive and Cushion didn't get anything refunded" (<https://www.finder.com/credit-building/cushion>).
- "Some customers report that the app can charge a fee for money they were not negotiating, such as money refunded into your account due to fraud" (<https://donotpay.com/learn/is-cushion-ai-legit/> — competitor-authored, labeled).
- BBB: a user "reported receiving fraudulent activity on their bank account after using the service and claimed that when they contacted the company multiple times… the company ignored their attempts and stopped communicating" (<https://www.bbb.org/us/ca/san-francisco/profile/general-services/cushion-ai-1116-927492/complaints>, paraphrase of complaint record).
- No refund guarantee: "Cushion does not guarantee refunds because they're at the discretion of your bank. So while some negotiations will fail, others will succeed" (<https://thecollegeinvestor.com/34459/cushion-review/>) — the deliverable was probabilistic, but the subscription was certain.

**ADHD-specific commentary: none found.** Twelve searches surfaced zero ADHD-community discussion of Cushion — no ADDitude mention, no ADHD-tax listicle placement, no forum thread (unverified absence; Reddit is only partially indexed). This is itself a finding: Cushion sat squarely on the ADHD-tax problem for eight years and never once named the person who has it. It sold "fees refunded" (a transaction) rather than "the scary thing handled" (a relief). The emotional layer — shame loop, envelope dread, RSD around calling the bank — appears nowhere in its marketing or its reviews.

---

## Where it wins (what actually worked)

1. **The aligned promise acquired users at scale.** 1M+ consumers onboarded, 200k+ paying, "$15 million in bank fee refunds" claimed (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>, <https://www.fintechweekly.com/magazine/articles/fintech-cushion-closes-while-other-fintech-companies-go-public>). A 20% free→paid conversion for "we recover your dollars" is extraordinary. Demand for delegated recovery is real and proven.
2. **Fully automatic ingestion worked.** Plaid link once → fees found forever. No habit loop to maintain, no capture behavior to sustain. Mechanical validation of Molehill's crown correction ("the loop must start and restart with zero sustained user behavior").
3. **The delegation actually delivered** for many users — $340 in 72 hours is exactly the "backlog jackpot" moment Molehill expects at onboarding.
4. **Read-only architecture was marketable.** "They cannot move funds on your behalf" was a selling point, not a limitation (<https://findmoreai.com/en/ai-tools/cushion-ai>).
5. **Email-inbox ingestion at scale worked** — 30M emails processed for BNPL tracking (<https://techfundingnews.com/behind-cushions-bankruptcy-3-things-you-should-know-about-the-82m-fintech-startup/>). Molehill's forward-in channel has an existence proof.
6. **The IP outlived the company.** LendingClub bought the tech and hired the founder — the machinery was judged valuable even after the business failed.

---

## Why it still died — the post-mortem (and where it fails the ADHD user)

**Cause 1 — its raw material was regulated and competed away.** Cushion hunted overdraft/NSF fees precisely while the CFPB's junk-fees initiative and bank competition destroyed them: "Overdraft/NSF revenue in 2023 down more than 50% versus pre-pandemic levels, saving consumers over $6 billion annually" (<https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-overdraft-nsf-revenue-in-2023-down-more-than-50-versus-pre-pandemic-levels-saving-consumers-over-6-billion-annually/>); Bank of America cut its fee $35→$10, Capital One and Ally eliminated overdraft fees outright (<https://www.americanprogress.org/article/the-cfpb-is-cleaning-up-junk-fees/>). A single-counterparty, single-fee-type recovery business is a bet that the fee survives. **Molehill's exposure is smaller but real:** its dollar events (parking fines, returns, subscription refunds, medical bills, waiver-able late fees) are spread across hundreds of counterparties and jurisdictions, not one regulated fee category — but the honeymoon-vs-steady-state risk (brief §10.2) is the same shape: what if the recoverable-event stream thins?

**Cause 2 — revenue coupled to the counterparty's yes, not the user's relief.** The % skim only monetizes when the *bank* says yes. Failory: "there's a ceiling to that model" (<https://newsletter.failory.com/p/your-bank-fees-won>). And per-event value was tiny — a $35 overdraft refund yields ~$8.75 at 25%. Kesserwani needed "tens of millions in [annual recurring revenue]" and "never hit that escape velocity" (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>). 200k paying users at $36–96/yr is roughly $7–19M gross — near the bar but with venture-scale burn, thin unit economics, and a shrinking fee pool underneath it.

**Cause 3 — it sold a transaction, not the handled feeling.** Mapped to `research/pain-points.md`:

- **Cluster 4 (ADHD tax):** Cushion covered exactly one lane — bank/card fees already incurred. It never touched the unopened envelope, the parking fine that doubles at day 14, the return riding in the trunk, the government letter. The fee is the *lagging indicator* of the avoidance; Cushion monetized the symptom after the harm, never intercepting the harm. Molehill's thesis is upstream custody (Watchtower) plus recovery (Moves) — avert *and* recover.
- **Cluster 2 (every tool stops working):** Cushion's passive model actually dodged the habituation cliff (no habit required) — but passivity cut the other way: with no visible per-user value cadence between fee events, the subscription read as dead weight in quiet months, and there was no equivalent of a Receipt/Tax Meter ritual making averted harm legible. Nothing in sources shows Cushion building trust artifacts; when it pivoted, there was no reservoir of earned trust to carry users to the new product.
- **Shame loop (Cluster 4's emotional core):** absent entirely. No RSD-safe denial handling documented — refunds were "at the discretion of your bank," and a failed negotiation was just a silent non-event that still might precede a subscription charge. For an ADHD user, an opaque "the bank said no (and we can't tell you why, and you still pay us)" is a shame trigger with no neutralizing agent identity.
- **Trust barrier:** Failory: "it also had to convince users to trust a third-party service with their financial data. That's always a tough sell" (<https://newsletter.failory.com/p/your-bank-fees-won>). Cushion demanded full bank-transaction access on day one — maximal trust before any value. Molehill's Snap starts with one photographed envelope: minimal disclosure, per-document consent, value before intimacy.

**Cause 4 — pivot thrash.** Four product identities in three years. Each pivot orphaned the previous cohort's job-to-be-done. "Some showed early signs of traction… but ultimately, it was more of a feature than a sustainable product" (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>). The terminal state — a $4.95/mo bill-organizer — was a commodity category (vs. Rocket Money, Copilot, every bank app) with none of the original moat.

**The uncomfortable summary for Molehill:** Cushion is the strongest evidence *for* the demand (1M users wanted delegated recovery) and the strongest evidence *against* assuming aligned incentives are enough. Kesserwani: "I gave Cushion everything I had for 8+ years. While the outcome wasn't what we hoped for, we built something that moved the industry forward — and I'm proud of that" (LinkedIn post as quoted in shutdown coverage, <https://www.crowdfundinsider.com/2025/02/235961-fintech-firm-cushion-shuts-down-operations/>, <https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>).

---

## What Molehill steals / avoids / must beat

**Steal:**
1. **Passive ingestion as the spine** — Plaid-once-then-forever is the mechanical template for Molehill's Informed Delivery / Mailroom / forward-in channels (product law §7.1). Cushion proved onboarding-then-passive scales to 1M users.
2. **Email-parsing infrastructure as capture** — 30M emails parsed for BNPL obligations validates forward-in email as a high-fidelity dollar-event channel.
3. **Read-only as a trust feature** — market "we can see, we can draft, we can never move your money" the way Cushion marketed Plaid read-only (Molehill law §7.10 already mandates this; Cushion shows it converts).
4. **The instant backlog jackpot** — "$340 in 72 hours" is the activation moment; Molehill's first-session pile-scan should be engineered to produce a comparable first-week dollars number on the Tax Meter.
5. **Free detection, paid execution** — free scanning/alerts with paid recovery mirrors Molehill's free tier (5 items/mo) that never auto-converts.

**Avoid:**
1. **Percentage-of-recovery pricing** — Cushion's 25%→39% skim made price illegible, incentivized meter inflation, and capped revenue at the counterparty's generosity. Molehill law §7.5 (flat fee per executed recovery, never a %) is written in Cushion's blood; never relax it.
2. **Single-fee-category dependence** — never let one counterparty type (or one regulator's target list) be the majority of recovered dollars; Molehill's playbook corpus must stay diverse (fines, returns, subscriptions, medical, utilities, waivers).
3. **Owning the adversarial meter** — never compute "dollars recovered" by inference from bank transactions Molehill is paid against. Tax Meter entries attach to user-confirmed Outcomes, plain arithmetic, auditable (brief §9: meter is deliberately not AI).
4. **Pivot identity churn** — Cushion re-taught its users four times that its promise was provisional. Molehill's brand promise ("the envelope is mine now") must survive feature changes; kill features quietly, never the promise.
5. **Silent probabilistic delivery** — "refunds at the bank's discretion" with no framing is an RSD landmine. Molehill law §7.6 (neutral denial relay + second-ask stats) exists precisely for this.
6. **Venture-scale burn against thin per-event economics** — Kesserwani needed tens-of-millions ARR to survive his cap table. Molehill's brief already contains the countermeasure: the 20-user kill test (§7.9) before scale, and unit economics honest enough to survive at boutique scale.

**Must beat (the one thing):** **survive the quiet months.** Cushion's fatal equation was: value only when a fee event occurs + revenue only as a % of that event + no trust artifact accumulating in between = a business that starved between events and a subscription that felt like dead weight. Molehill must make the *absence* of disasters legible and worth paying for — Watch custody, Receipts ("14 deadlines watched, 0 silently missed"), auto-paused billing when unused, and averted-dollars (not just recovered-dollars) on the Tax Meter. If Molehill can only monetize the fee after the harm, it is Cushion with a camera; if it monetizes custody — the ongoing "handled" state — it is a different business.

---

*Sources: TechCrunch (<https://techcrunch.com/2025/01/30/fintech-startup-cushion-shuts-down-after-8-years-and-over-20-million-in-funding/>), Banking Dive (<https://www.bankingdive.com/news/cushion-shutters-after-8-years-fintech-bnpl-loan-aggregator/739258/>), American Banker (<https://www.americanbanker.com/news/citing-scaling-challenges-fintech-cushion-shuts-down>), Crowdfund Insider (<https://www.crowdfundinsider.com/2025/02/235961-fintech-firm-cushion-shuts-down-operations/>), Finextra (<https://www.finextra.com/newsarticle/45443/fintech-cushion-shuts-down>), Tech Funding News (<https://techfundingnews.com/behind-cushions-bankruptcy-3-things-you-should-know-about-the-82m-fintech-startup/>), FinTech Weekly (<https://www.fintechweekly.com/magazine/articles/fintech-cushion-closes-while-other-fintech-companies-go-public>), Failory (<https://newsletter.failory.com/p/your-bank-fees-won>), LendingClub PR (<https://www.prnewswire.com/news-releases/lendingclub-acquires-ai-powered-spending-intelligence-platform-302441764.html>), finder.com (<https://www.finder.com/cushion>), The College Investor (<https://thecollegeinvestor.com/34459/cushion-review/>), Money Done Right (<https://moneydoneright.com/passive-income/cash-back-and-rewards/apps-and-sites/cushion-ai-review/>), Trustpilot (<https://www.trustpilot.com/review/cushion.ai>), BBB (<https://www.bbb.org/us/ca/san-francisco/profile/general-services/cushion-ai-1116-927492/complaints>), DoNotPay [competitor content] (<https://donotpay.com/learn/is-cushion-ai-legit/>), CFPB (<https://www.consumerfinance.gov/data-research/research-reports/data-spotlight-overdraft-nsf-revenue-in-2023-down-more-than-50-versus-pre-pandemic-levels-saving-consumers-over-6-billion-annually/>), Plaid customer story (<https://plaid.com/customer-stories/cushion/>).*
