# Phases Document

## Product
TradeMatch (working title) — phased roadmap

## Date
September 11, 2026

## Purpose
`prd.md` defines the MVP. `architecture.md` defines the system. `rules.md` defines how code gets written. This document sequences the work beyond week-by-week tasks — what phase you're in, what has to be true to move to the next one, and what deliberately waits until later. Each phase has an exit gate: don't move forward until it's met, even if it's tempting to keep building.

---

## Phase 0 — Validation (before writing code)

**Goal:** Confirm the problem is real and worth building for, before investing build time.

**Activities:**
- Talk to 10–15 real tradespeople in the target trade/country about how they currently find jobs and what frustrates them
- Talk to 3–5 staffing agencies about how they currently source candidates and whether pre-qualified leads would be valuable
- Confirm certification/licensing requirements for the chosen trade/country are knowable and documentable

**Exit gate:** At least 8 of 10 tradespeople describe the CV/certification/job-search problem unprompted, and at least 2 agencies say they'd look at candidate leads if offered. If this doesn't hold, reconsider trade/country choice before building — this is the cheapest point to change direction.

## Phase 1 — MVP Build (Weeks 1–8)

**Goal:** Ship a working app for one trade, one country, per `prd.md` Section 10.

**Deliverables:**
- Profile/CV builder
- Certification checklist
- Rules-based job matching
- Interview prep flashcards
- PDF export
- 20–30 manually sourced job postings live in Firestore

**Exit gate:** 50+ completed profiles, 60%+ completion rate on the profile flow, and at least one staffing agency actively reviewing candidate data. (Matches the success metrics already defined in `prd.md` Section 2 — this phase doesn't end just because 8 weeks passed, it ends when the metrics are hit.)

## Phase 2 — Early Iteration (Weeks 9–14, approx.)

**Goal:** Fix what's actually broken, based on real usage, before adding anything new.

**Activities:**
- Interview the 50+ pilot users: where did they get stuck, what did they ignore, what did they ask for that isn't there
- Fix drop-off points in onboarding/profile flow
- Refresh job postings (they go stale — see `architecture.md` Section 11 risk note)
- Formalize the first paying (or committed-to-pay) relationship with a staffing agency

**Explicitly avoid in this phase:** adding a second trade or country, building an admin dashboard, or starting ML-based matching. All three are tempting but premature until Phase 1's numbers are solid and repeatable.

**Exit gate:** At least one agency is paying (or has a signed intent to pay) for leads, and profile completion rate has measurably improved from Phase 1's baseline.

## Phase 3 — Monetization Rollout

**Goal:** Turn the one validated agency relationship into a repeatable revenue model.

**Activities:**
- Formalize pricing (per-lead fee vs. monthly access — test which the agencies actually prefer)
- Build the minimum admin tooling needed to deliver leads without manual export (could still be a simple internal view, not a full dashboard yet)
- Expand outreach to more agencies in the same trade/country, using the first relationship as a reference

**Exit gate:** 3+ paying agency relationships, revenue is predictable enough to estimate month-over-month, and the manual overhead of running the pilot (Section "What NOT to Do" in `rules.md`) is becoming a real bottleneck — that bottleneck is the signal to invest in Phase 4 infrastructure, not a guess.

## Phase 4 — Scale Infrastructure

**Goal:** Remove the manual bottlenecks that Phase 3 revealed, per `architecture.md` Section 7.

**Activities:**
- Build the agency-facing admin dashboard (likely a small Next.js app) so postings and leads don't require manual handling
- Move job-matching logic server-side (Cloud Functions) if posting volume has outgrown client-side scoring
- Introduce basic verification for certifications if agencies are asking for it (photo upload + manual review, per the open question in `architecture.md`)

**Exit gate:** Manual operational work per new agency or new posting has dropped significantly, and the system can handle growth in postings/users without you personally being the bottleneck.

## Phase 5 — Expansion

**Goal:** Replicate the validated model into new trades and/or countries.

**Activities:**
- Add a second trade in the same country first (cheaper than a second country — reuses country-specific knowledge like licensing bodies and language)
- Only after that's working, consider a second country
- Revisit the data model generalization noted in `architecture.md` Section 7 — `trade`/`country` are already modeled as strings, so this is primarily a data population and matching-logic question, not a rewrite

**Exit gate:** N/A — this phase is ongoing, but each new trade/country should be evaluated against the same Phase 0 validation gate before real investment, not assumed to work just because the first one did.

## Phase Summary Table

| Phase | Focus | Ends when |
|---|---|---|
| 0 | Validation | Real demand confirmed from both sides (workers + agencies) |
| 1 | MVP build | Success metrics from `prd.md` are hit |
| 2 | Iteration | Completion rate improves; first committed agency relationship |
| 3 | Monetization | 3+ paying agencies, predictable revenue |
| 4 | Scale infrastructure | Manual bottlenecks removed |
| 5 | Expansion | Ongoing — gated per new trade/country by Phase 0 logic |

## Guiding Principle

Each phase exists to answer one question before spending more time or money: is this still worth building further? If a phase's exit gate isn't met, the right move is usually to fix or rethink that phase — not to start the next one anyway and hope it resolves itself.
