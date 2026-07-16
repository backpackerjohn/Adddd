# Build Log

Running log of decisions, questions I would have asked (with self-answers), tool failures and reroutes, and phase gates. Newest entries at the bottom of each section. All times UTC, dated 2026-07-16 unless noted.

## Mission

Execute `ADHD app instructions. .md` end-to-end: hunt a real, evidence-backed ADHD everyday-life pain point, run a product contest between competing theses, crown a winner, and produce an implementation-ready product spec — modules, AI behavior, wireframes (web + mobile), design system, clickable prototype, red team, and a `recap.html` that a stranger can absorb in five minutes.

## Guardrails held (checked continuously)

- [ ] G1: Realistic AI features for everyday ADHD life; domain availability checked, nothing purchased
- [ ] G2: Nothing published; all artifacts stay in this repo
- [ ] G3: Nothing invented — every quote/stat/claim traces to a fetched URL; inferences labeled; unverifiable items flagged
- [ ] G4: All artifacts committed to backpackerjohn/Adddd (branch `claude/adhd-app-instructions-mr60jd`)
- [ ] G5: Never asked the user anything; all questions logged + self-answered below

## Questions I would have asked (self-answered)

| # | Question | My answer | Why |
|---|----------|-----------|-----|
| 1 | The task says "execute everything below the divider line" but the file contains no literal divider. What is in scope? | The entire file after the `# Adhd` title (lines 3–81). | The whole document is one coherent instruction set (mission, guardrails, arc, definition of done); excluding any part would break the definition of done. |
| 2 | Web app AND mobile app — build real code or specs + wireframes + prototype? | Specs, HTML wireframes, design system, and a clickable HTML prototype; no production app code. | The brief asks for an "implementation-ready product specification" and "functioning wireframes" verified by screenshots — not a shipped app. Definition of done centers on recap.html + wireframes, not compiled builds. |
| 3 | What counts as "screenshot-verified on mobile and desktop"? | Render every wireframe/prototype page in headless Chromium at 390×844 (mobile) and 1440×900 (desktop), save PNGs into design/screenshots/, and link them from recap.html. | Playwright + Chromium are preinstalled in this environment; this is the strongest local verification available without publishing anything. |

## Phase gates

| Phase | Status | Evidence |
|-------|--------|----------|
| 1. Pain-point hunt | DONE (10:04 UTC) | research/pain-points.md — 12 researchers, 64 findings, 235 sourced quotes, 12 clusters, 8 skeptic verdicts (6 survived, 2 refuted-as-compound) |
| 2. Competing teams formed | pending | contest/ |
| 3. Rival theses | pending | contest/theses/ |
| 4. Product contest | pending | contest/judging.md |
| 5. Winner crowned | pending | contest/winner.md |
| 6. Core modules defined | pending | product/modules/ |
| 7. Pages/flows/states mapped | pending | product/ |
| 8. AI brain specified | pending | product/ai-spec.md |
| 9. Web+mobile design at scale | pending | design/ |
| 10. Daily-use prototype | pending | design/prototype/ |
| 11. Red team | pending | redteam/ |
| 12. Founder blueprint packaged | pending | recap.html |

## Tool failures & reroutes

- R1 (09:09 UTC): Direct page fetching is blocked by this session's organization egress policy. Tested and confirmed 403 at the proxy for: old.reddit.com, api.pullpush.io, apps.apple.com, play.google.com, hn.algolia.com, en.wikipedia.org, additudemag.com. The proxy README explicitly forbids routing around policy denials. **Reroute:** all evidence collection uses the WebSearch tool (server-side, works normally), which returns real URLs plus content excerpts from the indexed pages. Every quote in the evidence ledger records its URL, the exact excerpt, and the verification method ("WebSearch result content, direct fetch blocked"). Cross-verification = independent skeptic agents re-searching for the same quote from different query angles. This is honestly labeled everywhere it matters (evidence ledger, recap). Guardrail 3's spirit — no invented evidence — is kept; the letter ("URL you actually fetched") is met as closely as the environment allows, and the gap is disclosed rather than papered over.
- R1a: Consequence for domain availability check (guardrail 1): WHOIS/RDAP over HTTPS is also blocked. Reroute: DNS-based check (`getent`/`dig` NXDOMAIN) if DNS resolves locally, plus WebSearch for registrar listings; labeled as inference if inconclusive.

## Decisions

- D1 (setup): Repo layout = research/, contest/, product/, design/, redteam/, ops/, with recap.html at root as the hub. Rationale: mirrors the 12-phase arc; a stranger can navigate top-down.
- D3 (contest, 10:15 UTC): First contest workflow launch had a bug — I passed a placeholder instead of the evidence payload, so the script's judging phase would have crashed on undefined data. Caught it immediately, stopped the run (task wsunz1opk), patched the script so every agent Reads `research/raw/contest-input.json` from the repo instead of receiving inline JSON, and relaunched (run wf_7ac254b4-7f3). Benefit: repo file is now the single source of truth for contest inputs.
- D2 (evidence): Maintain research/evidence-ledger.md mapping every load-bearing claim → URL → quote → verification status. Skeptic agents re-fetch URLs before the thesis is accepted. Rationale: guardrail 3 makes fabrication the biggest failure mode of a multi-agent build.
