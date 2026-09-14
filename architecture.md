# Architecture Document

## Product
TradeMatch (working title) — MVP architecture

## Date
September 11, 2026

## Status
Draft — aligned with `prd.md`

---

## 1. System Overview

TradeMatch is a mobile-first app built with React Native (Expo) on the frontend and Firebase as the backend-as-a-service layer. The MVP is intentionally serverless — no custom backend server is run; Firebase handles auth, data storage, and hosting, which keeps infrastructure cost at $0 during validation.

```
┌─────────────────────────────┐
│   React Native App (Expo)   │
│  - Profile Builder          │
│  - Certification Checklist  │
│  - Job Matching View        │
│  - Interview Prep Cards     │
│  - PDF Export               │
└──────────────┬──────────────┘
               │
               │ Firebase SDK (Auth, Firestore)
               ▼
┌─────────────────────────────┐
│         Firebase             │
│  - Authentication            │
│  - Firestore (NoSQL DB)      │
│  - Hosting (admin/static)    │
│  - Cloud Messaging (push)    │
└─────────────────────────────┘
               │
               │ manual data entry (MVP)
               ▼
┌─────────────────────────────┐
│  Job Postings + Cert Data    │
│  (manually curated, MVP)     │
└─────────────────────────────┘
```

## 2. Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Mobile framework | React Native + Expo | Cross-platform, fast iteration, OTA updates, no native build pain for a solo dev |
| Auth | Firebase Authentication | Free tier, handles phone/email auth out of the box — important since target users may prefer phone-number login over email |
| Database | Firestore | Free tier, real-time sync, simple document model fits profile/job data well |
| PDF generation | Client-side library (e.g. `expo-print` or `react-native-html-to-pdf`) | No backend needed; generates PDF from an HTML template on-device |
| Push notifications | Expo push notification service | Built into Expo, no separate service needed at MVP scale |
| Hosting/distribution | Expo Go (dev/testing) → TestFlight / Play Store internal track (pilot) | Fastest path to real devices without app store review delays during testing |

No custom backend server is needed for MVP. If the app grows past Firestore's practical limits (complex matching logic, ML-based matching, agency dashboards), a dedicated backend (Node.js/Python) can be introduced later without a full rewrite — see Section 7.

## 3. Data Model (Firestore Collections)

### `users`
```
users/{userId}
  - name: string
  - phone: string
  - email: string (optional)
  - trade: string            // e.g. "electrician"
  - country: string
  - yearsExperience: number
  - skills: array<string>
  - availability: string     // e.g. "immediate", "2-weeks-notice"
  - location: geopoint
  - certifications: array<string>  // cert IDs the user has
  - createdAt: timestamp
  - updatedAt: timestamp
```

### `certifications`
```
certifications/{certId}
  - name: string
  - trade: string
  - country: string
  - description: string
  - required: boolean
```

### `jobPostings`
```
jobPostings/{jobId}
  - title: string
  - trade: string
  - country: string
  - location: geopoint
  - requiredSkills: array<string>
  - requiredCerts: array<string>
  - postedBy: string          // manually entered source, MVP
  - postedAt: timestamp
  - active: boolean
```

### `interviewPrep`
```
interviewPrep/{cardId}
  - trade: string
  - question: string
  - answer: string
  - order: number
```

### `tradeInterest`
```
tradeInterest/{autoId}
  - userId: string
  - trade: string          // a trade not yet supported at launch
  - timestamp: number
```
Added per `polish-prompts.md` Prompt 28 — captures demand signal when a user
taps a "Coming Soon" trade during onboarding, feeding directly into the
Phase 5 expansion decision in `phases.md` (which trade to add next, backed
by real interest rather than a guess).

### `countryInterest`
```
countryInterest/{autoId}
  - userId: string
  - country: string        // a country not yet supported at launch
  - timestamp: number
```
Added per `polish-prompts.md` Prompt 29 — same purpose as `tradeInterest`,
kept as a separate collection since `phases.md`'s expansion order treats
trade expansion and country expansion as distinct decisions (add a second
trade within the same country before considering a second country).

**Indexing notes:** Firestore composite indexes will be needed for queries filtering by `trade` + `country` + `active` on `jobPostings`. Set these up as soon as matching queries are written, since Firestore will prompt for them on first failed query in development.

## 4. Core Flows

### 4.1 Onboarding & Profile Creation
1. User signs up via Google, email/password, or phone OTP (Firebase Auth — see Section 5 for the three supported methods)
2. App walks user through profile form (trade, experience, skills, availability, location)
3. On each step completion, partial data is written to Firestore (`users/{userId}`) so progress isn't lost
4. On completion, user lands on home screen showing checklist + matched jobs

### 4.2 Certification Checklist
1. App queries `certifications` where `trade == user.trade AND country == user.country`
2. Renders list; cross-references against `user.certifications` to show have/missing state
3. User taps to toggle "I have this" — writes back to `users/{userId}.certifications`

### 4.3 Job Matching (rules-based, MVP)
1. App queries `jobPostings` where `trade == user.trade AND country == user.country AND active == true`
2. Client-side scoring: overlap between `user.skills` and `job.requiredSkills`, plus certification match, plus location proximity (simple distance calc from geopoints)
3. Results sorted by score, rendered as a list

*Note: MVP matching runs client-side to avoid needing a backend function. If postings volume grows beyond a few hundred, move scoring to a Firebase Cloud Function to avoid pulling excess data to the client.*

### 4.4 PDF Export
1. User taps "Export CV"
2. App populates an HTML template with profile data
3. `expo-print` (or equivalent) renders HTML to PDF on-device
4. User can share/download the resulting file via the OS share sheet

### 4.5 Interview Prep
1. App queries `interviewPrep` where `trade == user.trade`, ordered by `order`
2. Renders as swipeable flashcards (question front, answer back)

## 5. Authentication & Security

- Firebase Authentication with three sign-up/login methods, all landing in the same `users/{userId}` document regardless of method chosen:
  - **Google Sign-In** — via `expo-auth-session/providers/google` (OAuth flow, works inside Expo Go, no native build required) feeding into Firebase's `signInWithCredential`
  - **Email/Password** — Firebase's native email/password provider, collecting name + email + password at signup
  - **Phone OTP** — Firebase's phone auth provider (per the original flow in `prompts.md` Prompt 3), kept as an option for users who prefer it
- Firestore security rules restrict:
  - Users can only read/write their own `users/{userId}` document
  - `jobPostings`, `certifications`, and `interviewPrep` are read-only for authenticated users; writes restricted to an admin role (managed manually via Firebase console at MVP stage)
- No sensitive financial or government-ID data is collected at MVP stage, which keeps compliance overhead low
- **Technical note on Google Sign-In:** `expo-auth-session` is the Expo-Go-compatible path. The alternative, `@react-native-google-signin/google-signin`, gives a more native-feeling button but requires EAS Build / a dev client — it won't run in plain Expo Go. Start with `expo-auth-session` to keep testing frictionless; revisit only if the native SDK's UX difference matters enough to justify the build step.

Example Firestore rule sketch:
```
match /users/{userId} {
  allow read, write: if request.auth.uid == userId;
}
match /jobPostings/{jobId} {
  allow read: if request.auth != null;
  allow write: if false; // admin-only, managed via console/back office
}
```

## 6. Third-Party Services & Cost at MVP Scale

| Service | Free tier limits (approx.) | MVP fit |
|---|---|---|
| Firebase Auth | 10k verifications/month free (phone auth has separate SMS cost after free quota) | Sufficient for 50-user pilot |
| Firestore | 50k reads / 20k writes / 20k deletes per day free | Comfortably covers MVP usage |
| Expo push notifications | Free, no cap at this scale | Sufficient |

**Cost risk to watch:** phone-number OTP SMS costs can apply beyond a small free quota — monitor this if the pilot group grows past ~50 users, since it's the one line item that isn't purely free.

## 7. Path to Post-MVP Architecture

Once the app moves past validation, the following changes are anticipated (not built now, but designed for):

- **Admin dashboard** for agencies to manage job postings directly instead of manual entry — likely a small web app (Next.js) reading/writing the same Firestore instance
- **Cloud Functions** to move matching logic server-side once postings volume grows, and to handle scheduled tasks (e.g., marking stale postings inactive)
- **ML-based matching** as a later enhancement, replacing the rules-based scorer — can be introduced as a Cloud Function without changing the client's data contract
- **Multi-trade/multi-country support** — requires generalizing the `trade`/`country` fields (already modeled as strings, so this is largely a data-population problem, not a schema rewrite)

## 8. Open Technical Questions

- Should certification data be verified (e.g., photo upload + manual review) before "have" status is trusted by agencies, and if so, where is that reviewed?
- Is phone-number OTP reliable enough in the target country, or does SMS deliverability require a specific provider (e.g., Twilio via Firebase's phone auth vs. a local SMS gateway)?
- At what user/posting volume does client-side matching become a performance problem worth moving server-side?
