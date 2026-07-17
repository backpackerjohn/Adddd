# Domain & Name Check (guardrail 1: check availability, don't buy — nothing was purchased)

**Date:** 2026-07-16 · **Method:** local DNS resolution (`getent hosts` — NXDOMAIN = likely available) corroborated by WebSearch for active businesses. *Labeled inference:* a domain can be registered yet have no DNS records, so NXDOMAIN is strong-but-not-proof of availability; a registrar lookup is required before purchase. Direct WHOIS/RDAP was blocked by this session's network policy (BUILD_LOG R1a).

## Finding 1 — the contest name "Recoup" collides with live companies

The crown named the winner **Recoup**. Domain/name checking found this is not just a taken domain but an **active naming collision in an overlapping category**:

- **recoup.com** — "Recoup | Get Refunds on Fees, Subscriptions and Expenses… recovers bank fees, subscription costs, and unwanted expenses—automatically" <https://recoup.com/>
- **recoup.ai** — "Recoup | Reclaim Your Hard-Earned Money" <https://www.recoup.ai/>
- Plus recoup.org (UK plastics recycling), recoup.io, recoup.app, recoup.money, getrecoup.com, tryrecoup.com, recoupapp.com, userecoup.com, recouphq.com, recoup.so, recoup.fyi — **all resolve** (registered).

A fee-recovery software product cannot launch as "Recoup" against recoup.com doing fee recovery. **Decision (BUILD_LOG D4): rename.**

## Finding 2 — the rename: Molehill

**Molehill** — from "making a mountain out of a molehill": the product's whole job is turning the mail-pile mountain back into a molehill. Non-clinical, warm, memorable, and self-explanatory to the shame mechanic.

- WebSearch found **no active app/fintech/ADHD product named Molehill**.
- DNS results: molehill.com, molehill.app — taken (no same-category business found; unusable anyway without the .com risk). **molehill.money — NXDOMAIN (likely available)**; **getmolehill.com — NXDOMAIN (likely available)**.
- Also available per DNS: onemoveaday.com and scaryenvelope.com — strong marketing/campaign domains that literally state the product.

**Recommendation:** primary domain `molehill.money` (category-true TLD), redirect `getmolehill.com`; register `onemoveaday.com` + `scaryenvelope.com` as campaign domains. Estimated cost <$150/yr total. **None were purchased** per guardrail 1.

## Full DNS log

| Domain | Result |
|--------|--------|
| recoup.com / .ai / .io / .app / .money / .so / .fyi / .help | resolves (taken) |
| getrecoup.com, tryrecoup.com, recoupapp.com, userecoup.com, recouphq.com, getrecoup.app, recoupmail.com | resolves (taken) |
| joinrecoup.com | NXDOMAIN (but name collision makes it moot) |
| heyrecoup.com, recoup.day, wearerecoup.com | NXDOMAIN (moot) |
| dealt.com/.app, getdealt.com, unpile.com/.app, pilezero.com, molehill.com/.app | resolves (taken) |
| **molehill.money** | **NXDOMAIN — likely available** |
| **getmolehill.com** | **NXDOMAIN — likely available** |
| **onemoveaday.com** | **NXDOMAIN — likely available** |
| **scaryenvelope.com** | **NXDOMAIN — likely available** |
