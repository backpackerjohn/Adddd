# Goblin Tools (Magic ToDo) — Teardown

*Category: **adjacent** (task breakdown, not admin execution). Researched via WebSearch only (direct fetch blocked); all quotes verbatim from WebSearch result excerpts with URLs. Where a detail could not be pinned to a page, it is flagged, not blended. Note on source hygiene: `focushack.io` and `thawly.ai` were flagged in our own Phase-1 research (`research/pain-points.md`, Cluster 1 skeptic verdict) as probable duplicate-content AI-SEO review sites — their claims are used here only where they converge with independent sources, and are labeled.*

---

## What it is (positioning, target user, platform, pricing)

**Goblin Tools** (<https://goblin.tools/>) is "a collection of small, simple, single-task tools, mostly designed to help neurodivergent people with tasks they find overwhelming or difficult" (About page, <https://goblin.tools/About>). Built and maintained solo by **Bram De Buyser**, a Belgian AI/software/data engineer, after he saw friends with ADHD and autism struggle with organization and planning and prototyped a "Magic ToDo" demo on early ChatGPT (<https://goblin.tools/About>; interview: <https://www.youtube.com/watch?v=naCTNxdZUJA>; podcast: <https://podcasts.apple.com/us/podcast/goblin-tools-simple-solutions-for-adhd-task-avoidance/id1513039926?i=1000681540526>). It went viral on TikTok and Reddit in 2023–2024 (<https://www.tiktok.com/discover/goblin-tools>; Product Hunt launch July 25, 2023, 131 upvotes: <https://www.producthunt.com/products/goblin-tools>).

**The tool suite** (each deliberately single-purpose):

| Tool | What it does |
|---|---|
| **Magic ToDo** (flagship) | AI breaks a scary/vague task into micro-steps; a "spiciness" slider controls granularity |
| **Formalizer** | Rewrites text more professional / polite / casual / emotionally neutral — a tone translator |
| **Judge** | Reads a message and tells you how its tone comes across (RSD-adjacent use) |
| **Estimator** | Guesses how long a task will take (time-blindness aid) |
| **Compiler** | Turns a brain-dump into organized tasks/structure |
| **Chef** | Meal ideas from available ingredients / energy level |

(Sources: <https://goblin.tools/>, <https://psychelicht.com/en/goblin-tools-review-magic-todo/>, <https://www.actcommunity.ca/aid-info-resource/goblin-tools/>)

**Platform & pricing.** Web (goblin.tools) — free, no account, no usage limits. Official mobile apps: **$0.99 iOS** (<https://apps.apple.com/us/app/goblin-tools/id6449003064>), **~$1.99 Android** (<https://play.google.com/store/apps/details?id=com.goblintools>), priced only to cover server costs so the site "will stay free without ads or paywalls" (<https://goblin.tools/About>). US App Store rating ~**4.85/5 from ~2.2K ratings** (<https://worldsapps.com/reviews-goblin-tools>; App Store reviews: <https://apps.apple.com/us/app/goblin-tools/id6449003064?see-all=reviews>). Product Hunt: 5.00/5 across its (few) reviews (<https://www.producthunt.com/products/goblin-tools/reviews>).

**Privacy stance** (unusually strong): analytics have "no personally identifiable information, no IP addresses, nor any text you input"; browser-stored data stays on-device; "Goblin.tools and OpenAI do not get any information about who submitted what requests, or where from" (<https://goblin.tools/Privacy>).

---

## Core loop & UX walkthrough

**Onboarding: there is none — that IS the onboarding.** You land on goblin.tools, see a text box, type "clean the kitchen," press the wand. No signup wall, no account, no tour, no permissions, no notification opt-in. "There's no bloat, no sign-up wall, and no overengineering, just thoughtful design, rooted in empathy" (<https://psychelicht.com/en/goblin-tools-review-magic-todo/>).

**Main surface (Magic ToDo):** enter task → AI returns a checklist of sub-steps → each sub-step can itself be broken down further via the **spiciness slider** (chili-pepper icons): "Low spiciness gives you broad steps. Crank it up and you get micro-steps that even the worst task paralysis day can handle" (<https://www.focushack.io/reviews/goblin-tools-adhd-review/> — AI-SEO-flagged source, but the slider itself is documented on goblin.tools). Estimator can annotate steps with durations. Tasks live in browser-local storage; there is no cloud sync or history across devices.

**Notifications: none.** Goblin Tools never contacts you. No reminders, no emails, no push, no streaks, no re-engagement of any kind. It is a pull-only tool: "Goblin.tools is a standalone utility that does not connect to your email, calendar, or task manager, and you have to go to it and use it" (<https://mutra.app/compare/pricing/goblin-tools/> — competitor marketing page, but the fact is undisputed across sources).

**Design philosophy — deliberate minimalism:** "It does not try to become a full project management system. It does not ask users to build complex databases, templates or dashboards… For someone already overwhelmed, a complex productivity app can become another task. Goblin Tools works because it reduces friction instead of adding more structure to manage" (<https://psychelicht.com/en/goblin-tools-review-magic-todo/>). No gamification, no streaks, no overdue counters — nothing that can accumulate shame.

---

## Retention & monetization mechanics (incl. dark patterns)

**Monetization: essentially declined.** The web version is free forever with no ads; the one-time $0.99/$1.99 app purchase covers hosting so the site stays free (<https://goblin.tools/About>). There is no subscription, no premium tier, no upsell, no data monetization. Product Hunt commenters registered "huge respect" at seeing what reads as a non-profit service (<https://www.producthunt.com/products/goblin-tools>).

**Retention: none by design.** No account = no email list = no win-back campaigns. Retention is purely organic: the tool is remembered (or evangelized on TikTok) when a scary task appears. This is both its charm and its ceiling — it cannot help the user who forgot it exists (Cluster 2's core failure mode, which Goblin neither suffers from nor solves).

**Dark patterns: zero in the original — but a parasite ecosystem grew on its brand.** Because the official app is $0.99 and barely marketed, **copycat apps** with near-identical names ("Goblin Tools - ADHD Planner", etc.) sit in app stores charging subscriptions: users report being "charged $20 for an account they can't use," and one pattern where "the app makes you answer all the questions and then makes you pay for a subscription, even though there's a free trial that people with ADHD often forget to cancel on time," including a **$50 annual charge landing 7 days after a 'free trial'** (<https://justuseapp.com/en/app/6479981873/goblin-tools-adhd-planner/reviews>; <https://apps.apple.com/us/app/goblin-tools-adhd-planner/id6479981873>). That is the ADHD tax being farmed off the back of the one tool built to fight it — a market lesson in what happens when a beloved brand doesn't defend its namespace.

---

## What users — especially ADHD users — say

**Praise (verbatim):**

> "I use the Magic To Do List every single day and it has literally made every day of my life better." — App Store review (<https://apps.apple.com/us/app/goblin-tools/id6449003064?see-all=reviews>)

> "Goblin Tools is an AMAZING app for NDs, in particular autistic people and/or ADHDers" — App Store reviewer who notes they "happen to be both (as well as bipolar) and so the struggles with executive dysfunction and social interests are manifold" (<https://apps.apple.com/us/app/goblin-tools/id6449003064?see-all=reviews>)

> "everything else has been like magic for my ADHD mind" — Product Hunt review (<https://www.producthunt.com/products/goblin-tools/reviews>)

> "Instead of sitting in overwhelm and not knowing where to start, this gives me a stepping-off point. It helps me with making decisions." — user testimonial surfaced in App Store review roundups (exact page unpinned in search excerpt; treat attribution as approximate)

> "Creator of Goblin.tools is the real MVP." — TikTok, tagged #executivedysfunction (<https://www.tiktok.com/@amflow_adventures/video/7273204828443135275>)

Trustpilot users recommend it "20/10" for email anxiety or autism (<https://www.trustpilot.com/review/goblin.tools>). One App Store reviewer with "severe inattentive ADHD" called it a godsend that "breaks tasks down to the smallest task," letting them make progress cleaning their house and "feel good about themselves" (paraphrase from search excerpt of <https://apps.apple.com/us/app/goblin-tools/id6449003064?see-all=reviews>).

**Complaints and limits (verbatim where possible):**

> "Magic ToDo generates a beautiful list of steps and then... that's it. It hands you the list and walks away. For many ADHD users, the list was never the problem. The problem is staring at the list and being unable to start item #1." — <https://www.focushack.io/reviews/goblin-tools-adhd-review/> (⚠ AI-SEO-flagged source; same critique appears independently across the review cluster)

> "A phone call broken into 8 steps is still a phone call. Sending an email broken into 5 steps is still sending that email." — surfaced in search excerpts across the review cluster (exact page unpinned; consistent with <https://thawly.ai/reviews/goblin-tools>, also AI-SEO-flagged)

The Thawly review ("Brilliant But Not Enough," <https://thawly.ai/reviews/goblin-tools>) adds: no timer, no guided execution, no "show me one step at a time" mode; breakdowns are "competent but generic" — "'Clean the kitchen' will always produce roughly the same steps regardless of your specific kitchen situation, your current energy level, or whether you're experiencing mild overwhelm or full shutdown." (Its further claim that a closed tab loses your breakdown conflicts with goblin.tools' documented browser-local storage — **unverified, likely wrong**.)

App-store-level gripes are mild: occasional crashes/loading bugs, requests for saved edited tasks and custom categories (<https://apps.apple.com/us/app/goblin-tools/id6449003064?see-all=reviews>). Product Hunt asks: TickTick integration, more accurate Estimator times, multiple lists (<https://www.producthunt.com/products/goblin-tools>).

---

## Where it wins

1. **Zero-friction first value.** URL → text box → relief, in under a minute, with no account. The onboarding cost is lower than the task it helps with — the only productivity tool most ADHD users have ever tried where that's true.
2. **Trust through refusal to monetize.** Free forever, radical privacy (no PII, no IP logging, inputs unlinkable to users), $0.99 apps priced at cost. The community's evangelism (viral TikTok, "real MVP") is largely gratitude for *not being exploited* — the mirror image of the ADHD-tax-farming copycats.
3. **Tone.** Goblin-themed, whimsical, non-clinical, non-corporate. It never scolds, never counts your failures, has no streak to break and no overdue red badge — structurally incapable of triggering the shame spiral that kills other tools (Cluster 2).
4. **User agency preserved.** "AI should support agency, not replace it. Goblin Tools gives structure, but the user still decides what is realistic" (<https://psychelicht.com/en/goblin-tools-review-magic-todo/>). The spiciness slider hands the user control over how much help they get.
5. **It genuinely solved its chosen problem.** Task breakdown is now considered a *solved* category — our own Phase-1 research states "task breakdown is solved (Goblin Tools is beloved)" (`research/pain-points.md`, Cluster 1) and calls AI task-decomposition "commoditized and free via Goblin Tools" (Cluster 8).
6. **Deliberate minimalism as moat-substitute.** One person, no VC, no growth team — sustainable precisely because it refuses scope. Nothing to churn from because nothing is demanded of you.

## Where it fails the ADHD user

Tied to `research/pain-points.md` clusters:

1. **Breakdown ≠ execution (Cluster 1 — Task Initiation Paralysis).** Goblin answers "what are the steps?" and "completely ignores the 'why can't I start?' question" (<https://thawly.ai/reviews/goblin-tools>). It hands over the list and walks away. For Molehill's territory this is fatal: a perfectly decomposed "call the parking authority, request the waiver, cite the code" checklist still requires Maya to make the call — the exact step she filed bankruptcy-adjacent avoidance around ("I filed bankruptcy at age 23, in large part because I just couldn't call and work out payment plans," Cluster 4).
2. **Pull-only; the user must travel to the tool (Clusters 2 & 4).** No notifications, no watching, no ingestion. Mail keeps arriving whether or not you remember goblin.tools exists; Goblin only helps in the moment you've already (a) opened the envelope, (b) formed the task, and (c) remembered the tool. It sits *after* the avoidance wall, not before it. The brief's core insight — the avoidance attaches to the *dealing* — means Goblin's help arrives precisely at the point most ADHD users never reach.
3. **No custody, no memory, no stakes (Cluster 4).** Nothing tracks a deadline, nothing knows a fine doubles at 14 days, nothing counts dollars. Statelessness protects against shame but also means the tool can never say "this envelope is mine now." There is no equivalent of a Watch, a Receipt, or a Tax Meter.
4. **Generic output, no context (Clusters 1, 4).** Same steps for every kitchen, every creditor, every energy level; "no ability to say 'I'm in a really bad executive dysfunction episode right now, make the steps even smaller'" (review-cluster critique, e.g. <https://www.focushack.io/reviews/goblin-tools-adhd-review/>). No per-creditor playbooks, no learning.
5. **Estimator is a toy against real time blindness (Cluster 3).** It guesses durations from the task text — no observed-reality correction, no calendar hookup; users on Product Hunt already ask for more accurate times (<https://www.producthunt.com/products/goblin-tools>).
6. **The brand's success created a predator ring.** The copycat subscription apps ($50/yr after a forgotten trial) show that goodwill without brand defense gets converted into ADHD tax by third parties (<https://justuseapp.com/en/app/6479981873/goblin-tools-adhd-planner/reviews>).

## What Recoup (Molehill) steals / avoids / must beat

*(Per `product/brief.md` v1.1: "Recoup" was renamed Molehill; product law §7 references below.)*

**Steal:**
- **No-account first value.** Goblin proves ADHD users reward tools whose cost-to-first-relief approaches zero. Molehill's Snap-before-signup should feel Goblin-grade: photo → verdict with as little ceremony as goblin.tools' text box (supports the free 5-items/mo tier, law §7.5).
- **The spiciness slider pattern** — user-controlled granularity. Apply it to Verdict explanations and Move checklists: one knob, "tell me more / tell me less," instead of settings pages.
- **Anti-monetization as trust engineering.** Goblin's virality is gratitude for honest pricing and radical privacy. Molehill's flat $9 + never-%-of-savings + auto-pause billing (law §7.5) and zero-retention document handling (law §7.4) are the same play — market them the way Goblin's About page does: plainly, as a promise.
- **Shame-free by structure, not by copy.** No streaks, no overdue counts, nothing that accumulates while you're gone — Goblin's statelessness inspired Pile Amnesty; keep it (law: Pile Amnesty, self-silence).
- **Whimsical non-clinical voice.** "Goblin mode" beats "executive function deficit remediation." Molehill's molehill/mountain frame should carry the same self-deprecating warmth.

**Avoid:**
- **Statelessness as a virtue past capture.** Goblin forgets you; Molehill must never forget a deadline. Keep Goblin's amnesia for *shame state*, reject it for *custody state* (Watchtower, Receipts).
- **Handing over the list and walking away.** Never end an interaction with homework. Every Molehill surface ends in a pre-executed Move, not a checklist for the user to run.
- **Pull-only architecture.** Goblin waits to be remembered; the median coping tool is abandoned in 100 days (JMIR, Cluster 2). Molehill's automatic ingestion (law §7.1) exists precisely so day-101 still works.
- **Generic AI output.** Goblin's same-steps-for-everyone is acceptable at $0; at $9/mo it isn't. The per-creditor Playbook corpus is the answer — and the moat.
- **Leaving the brand undefended.** Register the name variants, claim the app-store namespace early, publish a "the only official apps are…" page — or copycats will charge Molehill's audience a $50 subscription for a hollow clone.
- **Pricing too low to fund execution.** Goblin's at-cost model works because it does nothing after the list. Molehill sends letters, watches deadlines, runs playbooks; don't romanticize $0.99 into an unsustainable promise.

**Must beat (the one thing):** **The gap between the list and the done.** Goblin Tools is the beloved ceiling of the "help me understand the task" category — free, kind, frictionless — and it still leaves Maya alone at the exact moment the ADHD tax is levied: the call, the letter, the deadline. Molehill wins only if capture-to-executed-Move feels as light as Goblin's text box while the *dealing* — drafting, watching, recovering dollars — happens without her. If using Molehill ever feels like being handed a (very nice) list, Goblin already does that for free.
