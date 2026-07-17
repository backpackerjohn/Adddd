# Finch (Self-Care Pet) — Teardown

*Adjacent competitor. Not an admin/money tool — the retention benchmark for the entire ADHD-adjacent app world, and the most instructive study of what a "forgiving" daily loop can and cannot do for this user. Naming note: per `product/brief.md` v1.1, the contest's "Recoup" is now **Molehill**; this doc uses Molehill for product-law references.*

*Evidence honesty note: page fetching is blocked in this session; all quotes are verbatim from WebSearch result excerpts with their URLs, consistent with the standard in `research/pain-points.md`. Where a detail could not be verified verbatim, it is labeled as paraphrase or unverified.*

---

## What it is

**Positioning.** A self-care/habit app built around a virtual pet bird ("birb") that grows as you complete wellbeing tasks — breathing exercises, journaling, mood check-ins, micro-goals ("get a cup of water"). You care for yourself; the bird thrives. Founded May 2021, bootstrapped, reportedly ~$30M ARR without VC money (<https://blog.sparrowapps.io/p/finch-how-a-self-care-app-hit-30m-arr-without-vc-money>).

**Target user.** Broad mental-wellness audience skewing heavily anxious/depressed/neurodivergent; it is the app most often named by ADHD users as "the one tracker that didn't shame me" (<https://calmevo.com/best-habit-tracking-app-for-adhd/>, <https://www.audhdflourishing.com/post/finch-adhd-self-care-app>). It is Maya's phone's most likely incumbent.

**Platform.** iOS + Android, with home-screen widgets as a first-class retention surface (<https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl>).

**Scale & retention (the reason it's in this folder).** Estimated ~10M MAU; D1/D7 retention of 54%/37% — reported as *better than Duolingo* (51%/35%) (<https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl>). Sensor Tower-derived figures: ~400k iOS downloads/month at ~$2M monthly revenue, ~300k Android at ~$900k (same source; treat as estimates).

**Pricing.** Free tier is unusually generous (journaling, mood tracking, core exercises, no ads). Finch Plus: **$9.99/mo, $69.99/yr** per Finch's own help center (<https://help.finchcare.com/hc/en-us/articles/38755205001869-Finch-Plus-Pricing>); third-party trackers report regional/platform variation, with reviewers noting Android sometimes costs *more* than iOS for the same product (<https://recurdash.com/subscription-pricing/finch>, <https://habitbox.app/blog/finch-app-review>). Exact current in-store prices: unverified beyond the help-center page.

---

## Core loop & UX walkthrough

**Onboarding (widely praised, studied by growth analysts).** You hatch a bird *before* creating an account or giving any personal info: pick a color, pronouns, name, and a starting trait; the bird asks you a short question; a quick walkthrough follows (<https://help.finchcare.com/hc/en-us/articles/37779580853005-Creating-Your-Birb>, <https://www.retention.blog/p/life-of-a-birb>). Retention.Blog's analysis: investment in the pet is built before any signup friction, and gamified currencies are earned during onboarding itself. New users start with pre-seeded starter goals so the first session already produces rewards (<https://help.finchcare.com/hc/en-us/articles/42149821015693-New-User-Guide>).

**Daily loop.** Completing goals gives the bird energy; at full energy the bird departs on an **adventure through "Finchie Forest" that takes ~8 hours to return** — a deliberate appointment mechanic that manufactures a reason to reopen the app later the same day (<https://www.retention.blog/p/life-of-a-birb>, <https://help.finchcare.com/hc/en-us/articles/37779979512845-Going-on-an-Adventure>). Adventures yield Rainbow Stones (cosmetic currency); a daily free-stones tap exists in the shop (<https://finch.fandom.com/wiki/Rainbow_Stones>).

**Streaks — the famous "forgiving" version.** A streak counts on mere app-open, not task completion. Users self-select intensity from four tiers — Baby steps, Normal, Intermediate, On fire (<https://help.finchcare.com/hc/en-us/articles/37780736136205-Understanding-Streaks>, <https://finch.fandom.com/wiki/Streaks>). Broken streaks are repairable with Rainbow Stones or a "Streak Repair Saver" earned every 3 adventures, capped at 2 banked repairs (<https://finch.fandom.com/wiki/Streaks>). Crucially, **the bird never dies or degrades** no matter how long you're gone; it simply waits (<https://calmevo.com/finch-app-review/>, <https://www.internetmatters.org/advice/apps-and-platforms/wellbeing/finch/>).

**Ambient surface.** The widget shows the pet living its life on your home screen — dynamic states, visible progress, event hooks — "presence" as a retention philosophy; Deconstructor of Fun credits widgets as a critical driver of Finch's repeat use (<https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl>).

**Social layer.** "Tree Town" friends, Good Vibes (pre-canned supportive animations), gifts, and opt-in goal-sharing Accountability Buddies — warm and non-competitive by design, no leaderboards (<https://help.finchcare.com/hc/en-us/articles/37943772406413-Accountability-Buddies>, <https://finch.fandom.com/wiki/Tree_Towns>).

**Notifications.** Reminders are user-configured per goal; the appointment mechanic (adventure return) does much of the re-engagement work that push would otherwise do. (Detailed notification-ladder documentation: unverified.)

---

## Retention & monetization mechanics

**What actually retains people (stacked, mutually reinforcing):**
1. **Nurturance transfer** — self-care is reframed as pet care; skipping a task means (mildly) letting a creature down. Multiple reviewers flag this as "both clever and concerning": it "leverages our nurturing instincts and our discomfort with neglect" (paraphrase of critique coverage, <https://vocal.media/critique/the-criousity-of-the-finch-app>).
2. **Appointment mechanic** — the 8-hour adventure forces a same-day second session (<https://www.retention.blog/p/life-of-a-birb>).
3. **Widget presence** — the pet is on the home screen whether or not you open the app (<https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl>).
4. **Open-counts-as-streak + self-chosen intensity + repair items** — lapse-tolerance engineered into the streak itself (<https://help.finchcare.com/hc/en-us/articles/37780736136205-Understanding-Streaks>).
5. **Warm social** — a friend may check your tree; low-stakes obligation (<https://help.finchcare.com/hc/en-us/articles/37943772406413-Accountability-Buddies>).

**Monetization.** Freemium; Plus unlocks extra goal types, journeys, quizzes, insights, and a larger cosmetic shop (<https://pcxio.com/how-much-does-a-finch-app-subscription-cost-full-2026-price-guide/>). The free tier is genuinely usable — widely cited as why word-of-mouth is so strong.

**Dark-pattern-adjacent findings (specific):**
- **Trial-to-annual conversion complaints.** Trustpilot reviews of finchcare.com describe taking a 7-day free trial and being charged the full yearly price without the promised reminder notification, then getting no reply from support; others describe discovering an unexplained Plus charge on a card statement (<https://www.trustpilot.com/review/finchcare.com>). A Google Play support thread: a user "meant to cancel my subscription... and it took 63 dollars" (<https://support.google.com/googleplay/thread/397649970/i-need-i-refund-for-finch-i-meant-to-cancel-my-subscription-for-it-and-it-took-63-dollars?hl=en>). For an app whose audience self-describes as forgetful, billing that depends on remembering a trial end-date monetizes the disorder — exactly the pattern `pain-points.md` Cluster 2 calls "subscription pricing that monetizes ADHD forgetfulness."
- **Platform price opacity.** Reviewers report a real iOS-vs-Android price gap for the same subscription (<https://habitbox.app/blog/finch-app-review>, <https://recurdash.com/subscription-pricing/finch>). Magnitude varies by source and is unverified.
- **Softest-touch guilt engine.** Not a dark pattern in the billing sense, but the core loop converts user affection into an obligation. Even Finch's admirers concede it: the pet-care frame is load-bearing precisely because neglect feels bad.

---

## What users — especially ADHD users — say

**Praise (verbatim):**

> "I have ADHD, OCD, and an anxiety disorder. So you could say that some days keeping myself taken care of can be difficult. This app has not only helped me with my daily tasks like taking medication or making my bed, but also extra goals and tasks I set for myself!" — App Store review, <https://apps.apple.com/us/app/finch-self-care-pet/id1528595748>

> "With Finch, i not only feel reinforced that I care about myself, I also feel cared for by my finch, and I feel that by taking care of myself, im also taking care of him." — App Store review (ADHD user), <https://apps.apple.com/us/app/finch-self-care-pet/id1528595748>

> "NO guilt if I miss them, and I like that it lets my bird go on an adventure every day." — AuDHD blogger, 8-month user, <https://www.audhdflourishing.com/post/finch-adhd-self-care-app>

> "Missing days doesn't kill your streak or hurt your party—your bird simply waits. For ADHD users who've abandoned every other tracker after a bad week, that forgiveness is transformative." — <https://calmevo.com/best-habit-tracking-app-for-adhd/>

**Complaints (verbatim where available):**

> "If you're going to feel guilty for forgetting about your birb...well..." — the same 8-month AuDHD advocate, acknowledging the failure mode inside a positive review, <https://www.audhdflourishing.com/post/finch-adhd-self-care-app>

> The same reviewer: "I do sometimes forget about it and then come back to it." — <https://www.audhdflourishing.com/post/finch-adhd-self-care-app>

- The most common long-term complaint in review roundups: the gamification becomes a chore — the pet mechanic that delights in week one "can start to feel like one more thing to tend in month three" (<https://habitbox.app/blog/finch-app-review>).
- Guilt persists despite the non-punitive design: reviewers report that after missing a day or two, opening the app triggers a flash of guilt and the app "starts to feel like one more place where you are behind" (paraphrase; <https://www.aidorable.ai/blog/finch-self-care-pet-app>, <https://www.selfpause.com/resources/finch>).
- Interface density: many menus — journeys, goals, tags, energy, quests, shop — new users find it crowded and slow; marking tasks takes multiple taps through messages and animations (<https://habitbox.app/blog/finch-app-review>, <https://snaptroid.co.uk/finch-app-review/>, <https://ixd.prattsi.org/2026/02/design-critique-finch-self-care-pet-ios-app/>).
- Billing complaints as above (<https://www.trustpilot.com/review/finchcare.com>).

---

## Where it wins

1. **Best-in-class D1/D7 for a wellness app (54%/37%), beating Duolingo** — proof that lapse-tolerance and retention are not opposites (<https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl>).
2. **It solved streak shame better than anyone.** Open-counts, self-chosen intensity tiers, repair items, and an immortal pet — the `pain-points.md` Cluster 2 skeptic explicitly cited Finch as the counterexample to "no mainstream tool forgives lapses."
3. **Onboarding that builds attachment before asking for anything.** Hatch first, sign up later (<https://www.retention.blog/p/life-of-a-birb>).
4. **Emotional reward that works for ADHD brains at day 1.** The bird's affection is an immediate, variable, social-ish reward — far stickier than a checkmark.
5. **Widgets as ambient presence** — the app reaches the user without a notification (<https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl>).
6. **A free tier good enough to evangelize**, funding $30M ARR through goodwill rather than paywalls (<https://blog.sparrowapps.io/p/finch-how-a-self-care-app-hit-30m-arr-without-vc-money>).

## Where it fails the ADHD user

Mapped to `research/pain-points.md` clusters:

1. **Cluster 2 (every coping tool stops working) — mitigated, not solved.** Finch flattens the *shame* cliff but not the *novelty* cliff: even its friendliest reviewers "sometimes forget about it," and the canonical month-three complaint is that the pet becomes "one more thing to tend" (<https://habitbox.app/blog/finch-app-review>). D7 of 37% is spectacular *and* still means ~2 in 3 users are gone within a week. The lesson of Finch's week-3 abandonment: **any loop fueled by the user's daily initiative decays, no matter how kind it is** — forgiveness slows abandonment; it cannot generate a reason to return. Finch has no external trigger; when the user goes dark, nothing in their life re-summons the app except residual affection for the bird.
2. **The guilt it removed from streaks reappears as care-guilt.** Tying motivation to a creature's wellbeing means a lapse is experienced as *neglecting someone* — reviewers report the guilt flash on return despite the immortal-bird design (<https://www.aidorable.ai/blog/finch-self-care-pet-app>). For the RSD-prone user this is a softer wall of awful, but still a wall: the app itself becomes "one more place where you are behind."
3. **Cluster 4 (life admin / ADHD tax) — zero coverage of consequences.** Finch can hold a goal that says "open the mail," and it will celebrate you for tapping it — but nothing verifies the envelope got opened, nothing reads it, nothing knows a parking ticket doubles Friday, and no dollar is ever recovered. The reward is synthetic (stones, outfits), and synthetic rewards habituate (Cluster 2's core finding); the ticket's late fee compounds whether or not the birb is happy.
4. **Engagement-denominated value.** Finch's value *is* the daily interaction; skip the app and you received nothing that day — yet Plus bills annually regardless. Contrast with billing complaints above: users pay for months they never opened it (<https://www.trustpilot.com/review/finchcare.com>).
5. **UI density taxes the executive function it's meant to spare** — multiple currencies, quests, journeys, micronutrient-level menus; multi-tap task completion (<https://snaptroid.co.uk/finch-app-review/>).
6. **Cluster 1 (initiation) — celebration without ignition.** Finch rewards completion but cannot start the frozen user; the bird waits exactly as patiently as the unopened envelope does.

## What Recoup/Molehill steals / avoids / must beat

**Steal:**
- **Value-before-signup onboarding.** Finch hatches the bird before asking for an email. Molehill's equivalent: the first Snap produces a Verdict with dollars-at-stake *before* account creation. Attachment through demonstrated value, not through form-filling.
- **"Your bird simply waits" → Pile Amnesty, but stronger.** Finch proved lapse-safe re-entry is a retention weapon, not a retention sacrifice (D1/D7 beats Duolingo). Molehill's Pile Amnesty (one screen, one Move, no backlog count) is Finch's immortal bird made structural — and Molehill can go further because *the agent worked during the absence* (Watchtower held custody), so returning at day 101 shows accrued value, not a patient pet.
- **Self-chosen intensity tiers.** Finch's Baby steps/Normal/Intermediate/On fire streak selector respects fluctuating capacity. Molehill's One-Move-a-Day default with user-adjustable cadence is the same move; keep it.
- **Widget presence as an outbound surface.** Finch's widget is its pet; Molehill's widget should be the **Tax Meter** — dollars watched/recovered on the home screen, an external-fact display rather than a creature needing tending. Presence without dependency.
- **Warm, non-competitive social.** Tree Town's "Good Vibes, no leaderboards" maps to the Household tier's design goal: Sam hands items to the agent; the agent carries the nag, never the spouse. No comparison mechanics, ever.
- **Generous free tier funding word-of-mouth.** Finch's $30M-ARR-on-goodwill validates Molehill's free 5-items/month tier that never auto-converts (product law #5).

**Avoid:**
- **Any mechanic the user must feed.** Finch's month-three failure ("one more thing to tend") is definitional: a pet, a streak, an energy bar — anything with a hunger state — eventually joins the pile of neglected obligations. Molehill must never ship an object whose state degrades from user inaction. The Watch is the anti-pet: *Molehill* tends *it*.
- **Care-guilt as fuel.** Do not anthropomorphize the agent into something that can be let down. The agent's tone on return is a doorman's, not a puppy's: "While you were out: 2 deadlines held, $85 recoverable." RSD-safe framing (product law #6) forbids the guilt flash Finch's users report.
- **Streaks in any costume.** Even Finch's forgiving streak needs repair hammers and banked savers — meta-work about the meter instead of the life. Molehill's Receipts count *the agent's* reliability (deadlines never silently missed), never the user's consistency.
- **Trial-to-annual billing surprises.** Finch's worst Trustpilot pattern (forgotten trial → $63-80 annual charge, unresponsive support) is the exact ADHD-tax behavior Molehill exists to fight. Product law #5 (auto-pause when unused, one-tap cancel, no retention flow) is the categorical opposite; treat any drift toward Finch-style billing as a red-team finding.
- **Gamification bloat.** No currencies, quests, journeys, or cosmetic shops. Molehill's only two numbers are real: dollars and deadlines.

**Must beat — the single thing:**
- **Finch retains through affection; Molehill must retain through consequence.** Finch's D7 of 37% is the ceiling for loops powered by user-initiated daily engagement — and it still decays, because the loop dies the moment the user stops showing up, and Finch has no external event to restart it. Molehill's structural advantage is that **mail keeps arriving**: ingestion (Informed Delivery, forward-in, Mailroom, Handoff — product law #1) means the trigger is the world, not the user's willpower. The bar Finch sets: make the *lapse* as safe as an immortal bird AND make the *return* worth more than a happy one — measured in dollars recovered per user-year and week-4 re-capture, explicitly not week-6 engagement (product law #8). If a Molehill user who disappears for six weeks comes back to find the agent held three deadlines and drafted a $140 recovery, Molehill has done what Finch structurally cannot: created value during the absence.
