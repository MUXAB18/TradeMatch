# AI Architecture Document

## Product
TradeMatch (working title) — AI/LLM layer

## Date
September 11, 2026

## Purpose
`architecture.md` deliberately kept the MVP free of AI/ML — matching is rules-based, certification data is hardcoded, and no LLM calls happen anywhere in Phase 1. This document defines how AI gets layered in *after* MVP validation, per `phases.md`, without disrupting what's already working. Nothing here is required for Phase 1 — treat it as the plan for Phase 3+.

---

## 1. Why AI Was Deferred (and why it's coming back)

`rules.md` explicitly warns against adding complexity ahead of validated need. Rules-based matching and static content were the right call for a $0, 8-week MVP. But three things become true once the app has real users and paying agencies:

- Users need help *writing* their profile, not just filling in fields (many struggle with self-presentation in a second language)
- Interview prep content that's identical for every user in a trade becomes less useful as the user base grows and diversifies
- Static job matching plateaus in quality once posting volume grows past what simple skill-overlap scoring can handle well

AI addresses these, but only once Phase 1/2 metrics (per `phases.md`) prove the core product works without it.

## 2. AI Use Cases (in priority order)

### 2.1 Profile/CV Writing Assistant (Phase 3 candidate)
**Problem:** users know their skills but struggle to phrase them professionally.
**Solution:** user enters rough notes ("I fix AC units, 5 years, worked on big buildings"); LLM rewrites into a clean, professional CV bullet point in the user's language.
**Why this first:** highest impact on the metric that matters most right now — profile completion quality — and lowest risk (output is reviewed/edited by the user before saving, so mistakes are cheap).

### 2.2 Multilingual Support (Phase 3–4 candidate)
**Problem:** MVP launches in one language; expansion (`phases.md` Phase 5) requires content in multiple languages.
**Solution:** LLM-based translation layer for interview prep content and certification descriptions, with human spot-checking rather than full manual translation for every new market.

### 2.3 Personalized Interview Prep (Phase 4 candidate)
**Problem:** static flashcards (MVP) don't adapt to a user's specific experience level or the specific job they're applying to.
**Solution:** LLM generates additional practice questions tailored to a user's profile + a specific job posting, on top of the static baseline set (which stays as a free fallback).

### 2.4 Smarter Job Matching (Phase 4 candidate)
**Problem:** rules-based skill-overlap scoring (MVP) misses semantic matches — e.g., "AC repair" vs "HVAC maintenance."
**Solution:** embeddings-based similarity search layered on top of, not replacing, the existing rules-based filters (trade/country/location stay as hard filters; embeddings improve ranking within that filtered set).

### 2.5 Certification Q&A Chatbot (Phase 4–5 candidate)
**Problem:** users have follow-up questions about certification requirements that a static checklist can't answer.
**Solution:** a scoped chatbot that answers only from the app's own certification data (retrieval-augmented, not open-ended) — reduces hallucination risk and keeps answers grounded in verified requirements.

## 3. System Design

**Key principle: no LLM API calls happen directly from the React Native client.** API keys cannot be safely embedded in a mobile app bundle — they'd be extractable. All AI features route through a server-side layer.

```
┌─────────────────────────────┐
│   React Native App (Expo)   │
└──────────────┬──────────────┘
               │ HTTPS call (user's Firebase auth token attached)
               ▼
┌─────────────────────────────┐
│   Firebase Cloud Functions   │
│  - validates auth token      │
│  - rate-limits per user      │
│  - builds prompt              │
│  - calls LLM API              │
│  - logs usage for cost mgmt  │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   LLM API (server-side key)  │
└─────────────────────────────┘
```

This adds one new architectural piece to `architecture.md`'s serverless design: **Cloud Functions become the AI gateway.** Everything else (Firestore schema, client structure) stays as already defined.

## 4. Model & Cost Strategy

- **Default model:** a smaller/cheaper model for high-volume, low-complexity tasks (CV bullet rewriting, translation) to keep per-user cost low.
- **Escalate selectively:** only use a larger, more capable model for tasks where quality clearly matters more than cost (e.g., the certification chatbot, where wrong answers about legal requirements are costly to user trust).
- **Cache aggressively:** translations and commonly-generated content (e.g., interview questions for a popular job title) should be cached in Firestore after first generation, not regenerated per user.
- **Rate limit per user:** Cloud Functions enforce a daily cap on AI-feature usage per user to prevent runaway cost from a single account (accidental loop, abuse, etc.)
- **Monitor cost per feature separately** — don't let one expensive feature's cost hide inside an aggregate "AI spend" number; track CV assistant vs. chatbot vs. matching separately so a cost spike is traceable.

## 5. Data Privacy for AI Calls

- Only send the minimum data needed for the specific task — e.g., the CV assistant sees the user's rough notes, not their phone number or full profile.
- No user PII (phone number, exact address) is included in prompts sent to the LLM API unless the specific feature requires it and that's been explicitly reviewed.
- Cached/generated content (Section 4) is stored without any PII attached, so cached translations or question sets can be reused safely across users.

## 6. Fallback Behavior

Every AI feature must degrade gracefully, since these are enhancements on top of an app that already works without them:

- **CV assistant unavailable:** user's raw typed input is still saved as-is; assistant is an optional "improve this" button, not a blocking step.
- **Chatbot unavailable:** static certification checklist (MVP feature) remains fully functional independent of chatbot uptime.
- **Smarter matching unavailable:** falls back to the existing rules-based scoring from `architecture.md` Section 4.3 — embeddings are an enhancement layer, not a replacement.

This mirrors `rules.md` Section 6 (no silent failures) — if an AI feature fails, the user sees the non-AI version of that feature working normally, not an error blocking their task.

## 7. Prompt Design Principles

- Keep prompts narrow and task-specific — a CV-rewriting prompt should only rewrite, not also try to validate certifications or answer unrelated questions.
- For the chatbot (Section 2.5), constrain responses to the app's own certification data via retrieval rather than letting the model answer from general knowledge — reduces the risk of confidently wrong legal/licensing information.
- Always show AI-generated content as editable and clearly attributed as a suggestion ("Suggested rewrite — edit as needed"), never auto-saved without user review, especially for anything as consequential as a CV.

## 8. Phasing (ties to `phases.md`)

| Feature | Earliest phase | Rationale |
|---|---|---|
| CV writing assistant | Phase 3 | Highest impact on core metric (profile quality), lowest risk |
| Multilingual translation | Phase 3–4 | Needed once expansion (Phase 5) is being planned |
| Personalized interview prep | Phase 4 | Nice-to-have once base product is proven, not before |
| Smarter matching (embeddings) | Phase 4 | Only worth it once posting volume outgrows simple scoring |
| Certification chatbot | Phase 4–5 | Highest complexity/risk (legal-adjacent answers), needs the most groundwork first |

**Do not pull any of these into Phase 1 or Phase 2.** `rules.md` and `phases.md` are both explicit that infrastructure gets added when a bottleneck is real, not in anticipation of one — the same logic applies to AI features here.

## 9. Open Questions

- Which LLM provider/model becomes the default once this phase starts — does it need to match whatever's already in use elsewhere, or is this a fresh evaluation?
- For the certification chatbot: who owns fact-checking the underlying certification data it retrieves from, given wrong answers carry real consequences for users pursuing licensing?
- Should AI feature usage (Section 4) be capped per free user indefinitely, or does it become a future paid-tier lever for end users specifically (a departure from the "users stay free" decision in `memory.md` Section 2 — worth flagging if it ever comes up)?
