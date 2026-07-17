# Tiimo — Teardown

*Adjacent competitor. Visual daily planner for neurodivergent users — the strongest brand in the "ADHD planning layer," and the clearest demonstration of why that layer inherits the abandonment curve Molehill is designed to escape.*

*Evidence note: direct page fetching is blocked in this session; all quotes are verbatim from WebSearch result excerpts with their URLs. Paraphrased findings are labeled as such. Details that could not be verified are marked "unverified."*

---

## What it is

**Positioning.** "Visual Planner for Every Neurotype" (<https://www.tiimoapp.com/>). Copenhagen-based; began in 2015 as a research project on neurodivergent teens by founders Melissa Würtz Azari and Helene Lassen Nørlem (Azari is described as "a dyslexic ADHDer and service designer"), then evolved into a planner for ADHD/autism (<https://twit.tv/posts/tech/how-tiimo-makes-task-and-time-management-easier-neurodiverse-users>, <https://www.aol.com/news/tried-apples-app-more-tool-101107150.html>). Raised ~$4.7–4.8M (Aug 2024 round per PitchBook via TWiT; company announcement at <https://www.tiimoapp.com/resource-hub/tiimo-raises-4-8m-neurodivergent-planner>). **Won Apple's iPhone App of the Year at the 2025 App Store Awards** (<https://www.tiimoapp.com/resource-hub/tiimo-winner-2025-app-store-awards>, <https://daringfireball.net/2025/12/2025_app_store_award_winners>) — this is now the category-defining ADHD app in the public eye.

**Target user.** ADHD, autism, "anyone who needs flexible structure." Marketing emphasizes "built by and for neurodivergent people" and tools "rooted in executive functioning research" (<https://www.tiimoapp.com/>).

**Platform.** iOS-first (app + watch + widgets/Live Activities), Android (rebuilt from scratch, relaunched — <https://www.tiimoapp.com/resource-hub/tiimo-android-relaunch>), and a web app that is Pro-only ("the web app doesn't let you do anything without a paid account," per review reporting at <https://yourappland.com/tiimo-app-review/>).

**Pricing** (as reported 2026, from review sources; exact current price unverified against the live store): **$54/year or $12/month** ($144/yr if paid monthly), with a 7-day trial that **only applies to the yearly subscription** (<https://aiinsightsnews.net/tiimo/>, <https://yourappland.com/tiimo-app-review/>). Free tier: basic visual planner, focus timer, "anytime activities," limited AI chats, 1 profile, mobile-only (<https://www.tiimoapp.com/resource-hub/why-tiimo-went-freemium>, <https://www.tiimoapp.com/faq>). Pro adds calendar integration (Google/iCal), multi-device sync, up to five shared profiles, unlimited AI, deep personalization (paraphrase of FAQ/product pages via search).

---

## Core loop & UX walkthrough

**The core object is the day-as-timeline.** The user (or the AI Co-Planner) places tasks and routines on a visual timeline rendered with color-coding and customizable icons — "3,000+ colors and custom icons" (<https://www.tiimoapp.com/product>). Time is made concrete: a countdown/visual timer runs against the current block, a "greying effect" fades past items for "gentle visual hierarchy" (paraphrase, <https://www.tiimoapp.com/product/visual-planning>). This is the app's genuine invention: it converts abstract time into a physical object you can look at.

**Onboarding / planning input.** Tasks, routines (repeating blocks), and icons are configured manually or via the **AI Co-Planner** (late 2025): "Just speak or type what's on your mind and it breaks things down, adds time estimates and helps you build a plan" (paraphrase, <https://www.tiimoapp.com/resource-hub/ai-co-planner-design>). Some users report the setup itself is the problem — see complaints below.

**Main surfaces.**
- *Timeline (Today)* — the visual schedule with the running timer.
- *Focus timer* — per-task countdown, "a calming countdown to guide your time" (<https://www.tiimoapp.com/product>); ambient "focus tunes" in development for Android (<https://www.tiimoapp.com/resource-hub/tiimo-android-relaunch>).
- *AI Co-Planner chat* — task breakdown + duration estimates; users repurpose it as pseudo-body-doubling ("a digital anchor," per <https://aiinsightsnews.net/tiimo/>).
- *Widgets & Live Activities* — the strategically important surface. Home-screen and lock-screen widgets show the current plan, next task, checklist, and Focus timer "without opening the app"; interactive widgets let users add/start/pause tasks and tick checklist items from the home screen (<https://www.tiimoapp.com/product/widgets-live-activities>, <https://www.tiimoapp.com/resource-hub/discover-interactive-widgets-ios>, <https://www.tiimoapp.com/faq/widgets>).

**Notifications.** Transition reminders ("gently reminds you what's coming next," per comparison reporting at <https://yourappland.com/tiimo-vs-structured-comparison/>). In practice this is the most complained-about subsystem: routines "start automatically in the background with no notifications," Live Activity timers "disappear after 1 minute when the screen goes dark," random logouts silently kill notifications "sometimes not noticed for days" (paraphrases of user reviews aggregated at <https://justuseapp.com/en/app/1480220328/tiimo-visual-daily-planner/reviews>).

**The widget strategy is the real retention play.** Tiimo understood that an ADHD planner cannot rely on the user opening the app — so it pushes the plan out to the lock screen, watch face, and Live Activities, making the plan ambient. This is the closest a planning app can get to "the tool travels to the user." But note the limit: the *content* of those widgets is still 100% user-authored. The widget shows you your plan; it cannot know about the envelope on the counter.

---

## Retention & monetization mechanics

**Model.** Freemium subscription, no ads, no data sale. Tiimo has published its reasoning: the freemium model funds "fair pay for their team, many of whom are neurodivergent," and the free tier is positioned as "real value rather than a limited demo" (paraphrase, <https://www.tiimoapp.com/resource-hub/why-tiimo-went-freemium>). That's an honest, values-forward framing — and it earns real goodwill.

**Friction points and gray patterns (specific):**
1. **Trial gated to the annual plan.** The 7-day trial "only applies to the yearly subscription" (<https://aiinsightsnews.net/tiimo/>) — so a forgotten trial converts into a ~$54 annual charge, not a $12 monthly one. For a product whose buyers are self-selected forgetful people, this is monetizing the exact deficit the app treats.
2. **Cancellation opacity.** Trustpilot reviews report a user who "tried to unsubscribe after signing up for a free 7-day trial" and found it "impossible... tried through Apple and the website, contacted the team," which took "10 days to respond saying they couldn't find the account, and the reviewer was charged anyway"; another says "the app doesn't show anything about how to cancel" (paraphrases of reviews at <https://www.trustpilot.com/review/tiimoapp.com> / <https://www.trustpilot.com/review/tiimo.dk>). Per the FAQ, charges are "generally nonrefundable" with no partial-period refunds (paraphrase, <https://www.tiimoapp.com/faq>).
3. **Web app fully paywalled** while marketing leads with "web app and mobile access" (<https://yourappland.com/tiimo-app-review/>).
4. **Community asks for non-subscription options** — "One payment plz" and "Lifetime subscription" are long-standing user feedback threads (<https://tiimo.nolt.io/1156>, <https://tiimo.nolt.io/127>) — unaddressed as of the sources found.

**Retention mechanics proper.** Tiimo deliberately avoids punitive streaks and "doesn't punish you if your plan changes" (<https://yourappland.com/tiimo-vs-structured-comparison/>). But it has no lapse-detection, no re-entry ritual, no self-silencing, and no external trigger. Retention rests entirely on the user continuing to author plans — the exact behavior that decays (see below).

---

## What users — especially ADHD users — say

**Praise (verbatim):**

> "Tiimo I love you- you've pretty much changed my life!!" — App Store review, five stars, from a user who "didn't think they could be organized" and completed 94 tasks that week (<https://apps.apple.com/us/app/tiimo-ai-planner-to-do/id1480220328>)

> "I struggle with adhd and have tried multiple apps to help me focus. This has been the only one that has actually helped!" — App Store review (<https://apps.apple.com/us/app/tiimo-ai-planner-to-do/id1480220328>)

> "This has kept me the most productive I've been in years. Worth every penny." — App Store review (<https://apps.apple.com/us/app/tiimo-ai-planner-to-do/id1480220328>)

Tiimo maintains its own reviews page claiming an "ADHD-Friendly Planner Loved by 6,600+ Users" (<https://www.tiimoapp.com/reviews>).

**Complaints (paraphrases of user reviews, each with source):**

- *The routine feature backfires emotionally.* Reviewers note "people with ADHD have difficulty knowing how long items take to complete, and they feel defeated when scheduled tasks run ahead" (review roundup, <https://aiinsightsnews.net/tiimo/>). The plan itself becomes the judge.
- *A long-form quit story exists and is instructive:* "Why I Stopped Using Tiimo" — the blogger's verdict is that Tiimo "delivers exactly what it promises, and it still didn't work"; inputting events is "too complex," customization is "so endless that it takes too much time to input even something basic," and not following the routine exactly "began to weigh heavy on their mind" (<https://write-mind.blog/2023/04/21/why-i-stopped-using-tiimo/>).
- *Reliability of the one load-bearing subsystem (notifications/timers):* routines starting silently in the background; Live Activity timers disappearing after 1 minute with the screen dark; a paying annual subscriber "having to resort to setting individual alarms on their phone instead"; random logouts that silently stop notifications "sometimes not noticed for days"; routines duplicating tasks and shifting times when added to a day (<https://justuseapp.com/en/app/1480220328/tiimo-visual-daily-planner/reviews>).
- *Update churn:* "one step forward and two steps back" — new updates introduce new bugs as old ones are fixed (review pattern reported at <https://aiinsightsnews.net/tiimo/>).
- *Pricing:* "the paid tier feels expensive for what it offers"; the most common reasons users seek alternatives are "the subscription cost (Tiimo is not cheap)," the limited reminder system, and platform gaps (<https://yourappland.com/tiimo-app-review/>, <https://keptmind.com/blog/tiimo-alternatives-2026>). Structured undercuts it at "$9.99 per year vs. Tiimo's $54 per year—same core concept at roughly one-fifth the price" (comparison reporting, <https://yourappland.com/tiimo-vs-structured-comparison/>).
- *Support and cancellation:* Trustpilot reports of "difficulty unsubscribing, data issues, missing features on some platforms, and outright bugs that made the app 'not do what it promised'" (<https://www.trustpilot.com/review/tiimo.dk>, via <https://yourappland.com/tiimo-app-review/>).

---

## Where it wins

1. **Making time visible.** The visual timeline + circular countdown genuinely converts abstract time into a scannable object — the best-in-class answer to Cluster 3 (time blindness) at the *display* layer, and Tiimo explicitly content-markets against "waiting mode" (Cluster 6) with its timers (<https://www.tiimoapp.com/timers>).
2. **Ambient presence via widgets.** Lock-screen widgets, watch, and interactive Live Activities put the plan where the eyes already are, without requiring an app-open. This is the strongest widget strategy in the category and the correct instinct: reduce the behavior needed to stay in the loop.
3. **Authentic neurodivergent brand + Apple's crown.** Founder credibility, research-backed framing, no ads, published values. App of the Year 2025 gives it default-choice status: any ADHD user searching for help finds Tiimo first.
4. **Non-punitive by design.** No streaks, no red overdue cascade, flexible plans — it consciously avoids the shame mechanics that kill other planners.
5. **Honest freemium rationale, publicly argued** (<https://www.tiimoapp.com/resource-hub/why-tiimo-went-freemium>) — a trust asset most competitors don't have.

---

## Where it fails the ADHD user

Mapped to `research/pain-points.md`:

1. **It inherits the abandonment curve because the fuel is user-authored plans (Cluster 2 — every coping tool stops working).** Tiimo's loop starts with the user planning and continues only while the user keeps planning. The median 70%-in-100-days abandonment finding (JMIR 2024, n=525,824) applies with full force: when the user lapses, the timeline goes empty, the widgets go stale, and nothing external restarts the loop. The best first-person account says it plainly: Tiimo "delivers exactly what it promises, and it still didn't work" (<https://write-mind.blog/2023/04/21/why-i-stopped-using-tiimo/>). The planner cannot survive the death of the planning habit — and the planning habit is what ADHD kills. Domain sources on planner abandonment converge on the same mechanism: "an app may feel supportive when tasks are manageable, but when reminders pile up it can feel like being yelled at" (paraphrase, <https://www.prospering-mc.com/pmcblog/why-planners-dont-work-when-your-nervous-system-doesnt-trust-the-plan>), and the two-week collapse is "practically universal" (<https://itsadhdfriendly.com/adhd-planners/>).
2. **Setup is homework (Cluster 1 — initiation; Cluster 2 — setup-heavy systems collapse).** "Color-coding options and icon options and repetition options and routine options and it quickly becomes too much" (<https://write-mind.blog/2023/04/21/why-i-stopped-using-tiimo/>). The 3,000-color customization that markets well is executive-function expenditure at the exact moment the user has none.
3. **The schedule becomes a shame surface (Cluster 2 — shame spiral).** Users "feel defeated when scheduled tasks run ahead" (<https://aiinsightsnews.net/tiimo/>). A visualized plan you're behind on is a visualized failure. Tiimo removed streaks but kept the deeper judge: the plan itself.
4. **Notification reliability is broken exactly where trust is required (Cluster 6 — waiting mode's root cause is distrust of one's own alarms).** Silent routine starts, vanishing Live Activities, logout-killed notifications (<https://justuseapp.com/en/app/1480220328/tiimo-visual-daily-planner/reviews>). A time-guardian that sometimes silently fails is worse than none — the user must keep self-monitoring, which is the deficit the app exists to remove. There is no equivalent of a Receipt ("deadlines watched / never silently missed").
5. **It never touches the dollars (Cluster 4 — ADHD tax).** Tiimo can schedule "pay parking ticket," but only if the user opens the envelope, reads the ticket, estimates the task, and types it in — the entire avoidance chain must already be defeated before Tiimo can help. No capture of external reality, no extraction, no execution, no recovery. The planning layer sits *above* the pile of unopened mail and cannot see it.
6. **Monetization punishes forgetting (Cluster 2 — billing that monetizes ADHD forgetfulness).** Annual-only trial conversion + reported cancellation difficulty + nonrefundable policy (<https://www.trustpilot.com/review/tiimoapp.com>, <https://www.tiimoapp.com/faq>) is a small-scale version of the pattern the community resents most.

---

## What Recoup (Molehill) steals / avoids / must beat

**Steal:**
- **The widget/Live Activity playbook, repointed at Watches.** Tiimo proved ADHD users will engage with a lock-screen surface they never have to open. Molehill's version: a lock-screen Watchtower widget — "3 deadlines in custody, next: parking ticket, 6 days, $45→$90" — dollars and custody status, not a self-authored schedule. Ambient presence with zero authoring (product law §7.1: ingestion, not user behavior, feeds it).
- **Time-made-visible for deadlines.** Tiimo's greying timeline and countdown-ring grammar is the right way to render *deadline runway* on an Item. Steal the visual language; apply it to externally-sourced dates that survived active-transcription confirmation (law §7.3, §7.7) — never to a user-estimated task schedule.
- **Values-forward monetization publishing.** Tiimo's "why we're freemium" post earns trust. Molehill should publish the same genre — "why billing auto-pauses when you don't use us" — and make the contrast explicit (law §7.5).
- **Authentic neurodivergent voice.** Founder-community credibility is a real moat; Molehill's RSD-safe copy tone (law §7.6) should sound like Tiimo's brand voice, not like a fintech.

**Avoid:**
- **Any surface whose emptiness indicts the user.** Tiimo's empty timeline after a lapse is a shame mirror. Molehill's Pile Amnesty (one screen, one Move, current dollars — never a backlog) is the designed answer; never ship a view that renders a lapse as visible debt.
- **Customization as engagement.** 3,000 colors is setup homework. Molehill's capture must stay one-gesture (Snap) with zero configuration; personalization budget goes to the Playbooks, not the UI.
- **Annual-only trials, hidden cancellation, nonrefundable fine print.** Tiimo's Trustpilot record shows how fast this burns an ADHD-brand halo. Molehill: one-tap cancel, no retention flow, auto-pause billing (law §7.5) — and market that difference loudly.
- **Shipping AI features on top of an unreliable notification core.** Tiimo added an AI Co-Planner while paying users set phone alarms as backup. Molehill's deterministic scheduler + notification ladder + Receipts (law §7.7) must be provably boring-reliable before anything else ships.

**Must beat — the single thing:**
**Surviving the lapse.** Tiimo dies when the user stops planning; nothing external restarts it, and the JMIR abandonment curve is its ceiling. Molehill must demonstrate — with week-4 re-capture and reactivations-per-scary-envelope as the metrics (law §7.8) — that the loop restarts *without* the user: mail keeps arriving, Informed Delivery and forward-in keep ingesting, the agent goes outbound with dollars at stake, and day-101 re-entry lands on one Move, not a graveyard. Tiimo is a better mirror for time; Molehill must be the thing that acts when the user cannot look in the mirror at all.

---

*Sources: all URLs inline above. Primary: tiimoapp.com product/FAQ/resource-hub pages, apps.apple.com reviews, justuseapp.com review aggregation, trustpilot.com (tiimo.dk / tiimoapp.com), write-mind.blog quit essay, yourappland.com and aiinsightsnews.net reviews, keptmind.com alternatives roundup, daringfireball.net and aol.com App-of-the-Year coverage, tiimo.nolt.io public feedback board.*
