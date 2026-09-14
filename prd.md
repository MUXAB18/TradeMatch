# Product Requirements Document

## Product Name
TradeMatch (working title) — AI-assisted job copilot for skilled trades workers

## Author / Owner
[Your name]

## Date
September 11, 2026

## Status
Draft — MVP scoping

---

## 1. Problem Statement

Skilled trades and non-desk workers (electricians, technicians, drivers, HVAC installers, nurses, etc.) represent a massive global workforce, but almost every job-search and career tool on the market is built for white-collar, desk-based users. Trades workers face specific, unaddressed friction:

- No simple way to build a professional CV that highlights certifications and hands-on experience correctly.
- Difficulty tracking which licenses/certifications are required for a given country or region, and which ones they're missing.
- Job boards are cluttered, not localized, and not built for multilingual or low-literacy users.
- Interview prep content online is almost entirely aimed at office jobs.

This creates a gap: qualified tradespeople struggle to present themselves professionally and connect with real openings, while staffing agencies struggle to find pre-qualified candidates efficiently.

## 2. Goals

**Primary goal:** Validate that a focused, single-trade, single-country MVP can get real trades workers to build profiles and get staffing agencies to want the resulting candidate data.

**Success metrics for MVP (8-week window):**
- 50+ completed user profiles in the target trade/country
- 3–5 staffing agencies contacted; at least 1 expresses willingness to pay for leads
- 60%+ of users who start the profile flow complete it
- Qualitative: users report the certification checklist as useful (measured via informal feedback)

## 3. Target Users

**Primary persona — "Amir, the Electrician"**
- 24–45 years old, based in a Gulf country or South Asia
- Has practical experience and some certifications, but no polished CV
- Uses a smartphone as primary/only computing device
- Limited English proficiency in some cases; comfortable with simple UI, not long text forms
- Actively looking for better-paying or more stable work

**Secondary persona — "Sana, the Recruiter"**
- Works at a staffing/recruitment agency placing tradespeople
- Currently sources candidates through informal networks, WhatsApp groups, and manual vetting
- Wants pre-qualified, verified candidate profiles to reduce screening time

## 4. Scope

### MVP scope (in scope)
- One trade (e.g., electricians)
- One country/region (e.g., UAE or another Gulf market)
- Structured profile/CV builder
- Certification/license checklist for that trade + country
- Static list of real job postings (manually sourced) with basic rules-based matching
- Interview prep flashcards (static content)
- PDF export of profile/CV

### Explicitly out of scope for MVP
- Multiple trades or countries
- Machine-learning-based matching
- In-app messaging between candidates and employers
- Payments/subscriptions inside the app
- Native push notification infrastructure beyond Expo defaults
- Employer-facing dashboard (agencies receive leads manually at MVP stage)

## 5. Features (MVP)

### 5.1 Onboarding & Profile Builder
- Simple multi-step form: name, contact info, trade, years of experience, skills, availability, location
- Progress indicator so users know how much is left
- Save-as-you-go (no losing progress if app is closed)

**Acceptance criteria:**
- User can complete a profile in under 5 minutes
- Data persists in Firestore tied to authenticated user
- Profile can be edited after initial creation

### 5.2 Certification / License Checklist
- Hardcoded list of certifications/licenses required for the chosen trade + country
- User marks which they have; missing ones are visually flagged
- Short explanation of why each certification matters

**Acceptance criteria:**
- Checklist reflects accurate, real requirements for the launch trade/country
- Visual distinction between "have," "missing," and "in progress"

### 5.3 CV / Profile PDF Export
- One-tap export of the profile into a clean, readable PDF
- Includes trade, experience, certifications, and contact info

**Acceptance criteria:**
- PDF generates in under 5 seconds
- Formatting is readable on both mobile and print

### 5.4 Job Matching (rules-based)
- Manually sourced job postings (20–30 to start) stored in Firestore
- Matching logic based on skills, location, and availability (no ML)
- User sees a ranked list of relevant postings

**Acceptance criteria:**
- Matches update when profile data changes
- At least 70% of surfaced postings are relevant to the user's trade/location (manual QA check)

### 5.5 Interview Prep Flashcards
- Static, curated question/answer flashcards specific to the launch trade
- Swipeable card UI

**Acceptance criteria:**
- Minimum 15 flashcards live at MVP launch
- Content reviewed for accuracy by someone with trade knowledge

## 6. User Stories

- As a tradesperson, I want to build a professional profile quickly so I can apply to jobs without needing design or writing skills.
- As a tradesperson, I want to see which certifications I'm missing so I know what to pursue next.
- As a tradesperson, I want to practice likely interview questions so I feel prepared.
- As a recruiter, I want access to pre-qualified candidate profiles so I spend less time screening unqualified applicants.

## 7. Technical Requirements

- **Frontend:** React Native + Expo (cross-platform, OTA updates, no native build complexity for MVP)
- **Backend:** Firebase (Authentication, Firestore, Hosting) — free tier sufficient at MVP scale
- **PDF generation:** client-side library (e.g., `react-native-html-to-pdf` or Expo-compatible equivalent)
- **Data storage:** Firestore collections for `users`, `jobPostings`, `certifications`
- **Notifications:** Expo push notifications (optional for MVP, can be deferred)
- **Hosting/distribution:** Expo Go for testing; TestFlight/Play Store internal testing track for pilot users

## 8. Non-Functional Requirements

- App must function usably on low-end Android devices (common in target market)
- Must support offline profile editing with sync-on-reconnect (stretch goal, not blocking MVP)
- UI must be simple enough for users with limited digital literacy — minimal text input, large tap targets
- Should support at least one local language alongside English by end of MVP phase (stretch goal)

## 9. Monetization Strategy

- **MVP phase:** no in-app monetization; focus entirely on validating supply (candidates) and demand (agencies)
- **Post-MVP:** B2B model — staffing agencies and training providers pay per qualified lead or via monthly access to a candidate pool
- End users remain free, since willingness/ability to pay is low in this segment and free access drives adoption

## 10. Timeline (8-Week MVP)

| Week | Milestone |
|------|-----------|
| 1 | Scope to one trade/country; project + Firebase setup |
| 2 | Profile/CV builder |
| 3 | Certification checklist |
| 4 | Basic job matching |
| 5 | Interview prep module |
| 6 | Onboard 20–50 real users |
| 7–8 | Outreach to 3–5 staffing agencies; gather feedback |

## 11. Risks & Assumptions

**Assumptions:**
- There is sufficient job posting volume in the chosen trade/country to make matching meaningful
- Target users have smartphone + basic internet access
- At least one staffing agency will engage in conversation without existing relationship

**Risks:**
- Manually sourced job postings may go stale quickly and require ongoing maintenance
- Low digital literacy in target segment could suppress completion rates — mitigate with a very short, simple onboarding flow
- Certification/licensing requirements may be inconsistently documented publicly and need manual verification
- Agencies may be slow to adopt a new, unproven lead source — mitigate by offering first leads free to build trust

## 12. Open Questions

- Which specific trade and country should be the MVP launch target?
- Should the app collect any verification (e.g., certificate photo upload) at MVP stage, or defer to post-MVP?
- What's the minimum viable set of local languages to support at launch?
