# Development Rules

## Product
TradeMatch (working title) — coding standards & conventions

## Date
September 11, 2026

## Purpose
This document defines the rules and conventions for building TradeMatch, so the codebase stays consistent whether you're writing it yourself, working with a contributor, or using an AI coding assistant to generate parts of it. Pair with `prd.md` (what to build) and `architecture.md` (how it's structured).

---

## 1. Project Structure

```
/app                    # Expo Router screens (file-based routing)
  /(auth)               # Auth flow screens (login, OTP)
  /(tabs)               # Main app tabs (home, profile, jobs, prep)
/components             # Reusable UI components
/hooks                  # Custom React hooks
/services                # Firebase access layer (no direct Firestore calls in components)
/constants               # Static config, theme values, trade/country data
/utils                   # Pure helper functions (matching score, formatting, etc.)
/types                   # TypeScript types/interfaces
```

**Rule:** Components never call Firestore directly. All reads/writes go through `/services` functions (e.g., `services/users.ts`, `services/jobs.ts`). This keeps data access testable and swappable later if the backend changes.

## 2. Language & Tooling

- **TypeScript required** for all new files — no plain `.js`/`.jsx`. Catching data-shape mistakes at compile time matters more here than usual, since Firestore has no schema enforcement of its own.
- **ESLint + Prettier** enforced; run on save. Use the Expo default config as a base.
- **No `any` types** except when wrapping untyped third-party libraries — wrap and type at the boundary instead of letting `any` spread through the app.

## 3. Component Rules

- Functional components with hooks only — no class components.
- One component per file; file name matches component name (`ProfileForm.tsx` exports `ProfileForm`).
- Keep components under ~150 lines; if a component grows past that, extract sub-components or move logic into a hook.
- Props are always typed with an explicit `interface`, not inline object types, so they're reusable and readable.
- No business logic inside JSX — compute values above the `return`, render below it.

## 4. State Management

- Local component state (`useState`) for UI-only state (form inputs, toggle states).
- Firestore data fetched via custom hooks (e.g., `useUserProfile()`, `useJobMatches()`) that wrap `services` calls and expose `{ data, loading, error }`.
- No global state library (Redux, Zustand, etc.) at MVP scale — Firestore + React Context (for auth state only) is enough. Revisit only if state complexity clearly outgrows this.

## 5. Firebase & Firestore Rules

- All collection/field names match exactly what's defined in `architecture.md` — no ad hoc fields added without updating that doc first.
- Every write includes `updatedAt: serverTimestamp()`; every create includes `createdAt: serverTimestamp()`.
- Firestore security rules are the source of truth for access control — the client never assumes a write will succeed without rules backing it up. Update `firestore.rules` in the same commit as any schema change.
- No sensitive data (government ID numbers, financial info) is stored at MVP stage — if a future feature requires it, that's a rules + compliance review before implementation, not after.

## 6. Error Handling

- Every Firestore call is wrapped in try/catch at the `services` layer; errors are logged and surfaced to the UI as a user-readable message, never a raw stack trace.
- Network/offline errors get a specific, friendly message ("Check your connection and try again") since the target user base may have inconsistent connectivity.
- No silent failures — if a write fails, the user sees a toast/alert, not a spinner that just stops.

## 7. Data & Privacy

- Only collect what's defined in the PRD's data model. If a new field feels useful, add it to `architecture.md` first, then implement — don't let the schema drift ahead of the docs.
- Phone numbers and profile data are considered sensitive by default — no analytics tool receives raw PII; anonymize or aggregate before sending to any third-party analytics service.

## 8. Testing

- MVP-stage minimum: unit tests for all functions in `/utils` (pure functions, easy to test, highest value per hour spent).
- `services` layer functions get at least one test with a mocked Firestore call.
- Full component/UI testing is not required pre-launch — prioritize getting real users over test coverage at this stage, but don't skip the `/utils` and `/services` layers, since bugs there are the hardest to spot manually.

## 9. Git & Commit Conventions

- Branch naming: `feature/short-description`, `fix/short-description`
- Commit messages: imperative mood, short summary line (e.g., "Add certification checklist screen"), body only if context is non-obvious
- No direct commits to `main` — even solo, use a PR-to-self workflow so `architecture.md`/`prd.md` and code changes can be reviewed together before merging
- Update `architecture.md` in the same PR as any change to data model or core flow — docs and code drift apart fast otherwise

## 10. Environment & Secrets

- Firebase config keys live in `.env`, never committed — `.env.example` shows required variable names with placeholder values
- No API keys or secrets hardcoded in any file under `/app`, `/components`, or `/services`

## 11. Performance & UX Rules

- Target devices include low-end Android phones — avoid heavy client-side computation (e.g., large in-memory sorts) on every render; memoize expensive calculations (`useMemo`) especially in the job-matching scorer.
- All tappable elements meet a minimum 44x44pt touch target — this user base is mobile-only, and small tap targets cause real drop-off.
- Text should default to larger, readable sizes — don't assume desktop-style dense UI works here.
- Support offline profile editing gracefully where possible (queue writes, sync on reconnect) — connectivity in the target market may be inconsistent. If not implemented in MVP, at minimum show a clear "you're offline" state rather than a silent failure.

## 12. What NOT to Do

- Don't introduce a custom backend server until Section 7 of `architecture.md` ("Path to Post-MVP Architecture") is actually triggered — resist the urge to build infrastructure ahead of validated need.
- Don't add multi-trade/multi-country support before the single-trade MVP has real user and agency validation — scope creep here is the most likely way this project stalls.
- Don't store any field not defined in `architecture.md`'s data model without updating that document first.
- Don't use `any` as a shortcut past a TypeScript error — fix the type.
