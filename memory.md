# Memory

## Product
TradeMatch (working title) — project memory / running context

## Date
September 11, 2026

## Purpose
This file is the quick-reference layer on top of `prd.md`, `architecture.md`, `rules.md`, `phases.md`, and `design.md`. If you (or an AI assistant) are picking this project back up after time away, read this file first — it tells you what's already decided, what's still open, and what not to re-litigate.

---

## 1. One-Line Summary

TradeMatch is a React Native + Expo app that helps skilled trades workers (starting with one trade, one country) build a professional profile, track required certifications, find matching jobs, and prep for interviews — with revenue coming from staffing agencies paying for qualified candidate leads, not from end users.

## 2. Decisions Already Locked In (don't re-litigate)

- **Platform:** React Native + Expo, not Flutter or native — chosen for solo-dev speed and free-tier hosting/build tooling.
- **Backend:** Firebase (Auth + Firestore), no custom server at MVP stage — serverless keeps cost at $0 during validation.
- **Scope:** one trade, one country only for MVP — resisting multi-trade/multi-country is a repeated theme across `prd.md`, `rules.md`, and `phases.md` because it's the most likely way this stalls.
- **Monetization:** B2B — staffing agencies pay for leads. End users stay free permanently, not just at MVP, because willingness/ability to pay in this segment is low.
- **Matching:** rules-based (skills + location + certs), not ML, until posting volume actually justifies it.
- **Data model:** `users`, `certifications`, `jobPostings`, `interviewPrep` Firestore collections — defined in `architecture.md` Section 3. Any new field gets added there first, before code.
- **Design system:** Apple-inspired palette (blue #007AFF / orange #FF9500 / green #34C759 / red #FF3B30), Plus Jakarta Sans typeface, 16px minimum text, single-column layouts, status shown via icon+text (not color alone) — full detail in `design.md`.

## 3. Current Status

- Documentation phase — `prd.md`, `architecture.md`, `rules.md`, `phases.md`, `design.md` are all written.
- No code written yet.
- Currently in **Phase 0 (Validation)** per `phases.md` — user/agency conversations have not yet been confirmed as done.

## 4. Open Questions (consolidated from all docs)

These are repeated across multiple docs because they block real decisions downstream. Resolve these before or during Phase 1:

1. **Which specific trade and country?** This is the single biggest open item — it's a placeholder ("electricians, Gulf region") everywhere right now. Every other doc's specifics (certification data, RTL layout, job posting sourcing) depend on this.
2. **RTL layout:** needed at MVP if the country is Arabic-speaking — cheap now, expensive to retrofit later (`design.md` Section 9).
3. **Certification verification:** should "have" status require photo upload + manual review, or is self-reported trust enough for MVP? Affects data model, week 3 build scope, and agency trust (`architecture.md` Section 8, `design.md` Section 9).
4. **SMS/OTP delivery:** does Firebase's default phone-auth SMS work reliably in the target country, or is a local SMS gateway needed? (`architecture.md` Section 7)
5. **Text size baseline:** is 16px actually sufficient for the target user base, or should the default be larger? (`design.md` Section 9)

## 5. What Success Looks Like at Each Stage

(Full detail in `phases.md` — summarized here for quick recall)

- **Phase 0 exit:** 8/10 target users independently describe the problem; 2+ agencies interested in leads
- **Phase 1 (MVP) exit:** 50+ completed profiles, 60%+ completion rate, 1+ agency actively reviewing candidates
- **Phase 2 exit:** improved completion rate, first committed-to-pay agency
- **Phase 3 exit:** 3+ paying agencies, predictable revenue

## 6. Document Map

| File | Answers |
|---|---|
| `prd.md` | What are we building and why? What's in/out of scope? |
| `architecture.md` | How is it technically structured? What's the data model? |
| `rules.md` | How should code be written? What conventions apply? |
| `phases.md` | What order do we build/validate things in? What's the exit gate per phase? |
| `design.md` | How should it look and flow? What's the visual system? |
| `memory.md` (this file) | What's already decided? What's still open? Where do I start if I'm picking this back up? |

## 7. Instruction for Future Sessions

When resuming work on this project: read this file first, resolve any open question from Section 4 that's now blocking the immediate task, and update this file's "Current Status" and "Open Questions" sections as decisions get made — this file should always reflect the current state, not the state from when it was written.
