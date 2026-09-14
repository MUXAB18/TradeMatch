# Design Document

## Product
TradeMatch (working title) — UX/UI design

## Date
September 11, 2026

## Purpose
`prd.md` defines what to build, `architecture.md` defines the system, `rules.md` defines coding conventions, `phases.md` defines the roadmap. This document defines how it should look, feel, and flow — the design decisions that should hold steady while phases 1–5 get built out.

---

## 1. Design Principles

1. **Fewer taps over more features.** Every screen should ask: what's the minimum a tired person on a phone can do here? Cut anything that isn't load-bearing.
2. **Show progress, not blank forms.** Users are filling in profile data in short bursts — always show how far along they are and let them stop and resume without penalty.
3. **Status over decoration.** Certification "have/missing" states, match quality, and profile completeness should be the loudest visual elements on screen — not branding flourishes.
4. **Legible before beautiful.** Given the device and literacy range of the target users (see Section 2), clarity always wins over visual cleverness.

## 2. Target User Design Constraints

- **Devices:** low-end Android phones are common — avoid heavy animations, large images, or effects that lag on older hardware.
- **Connectivity:** may be inconsistent — every screen needs a clear loading state and a clear offline/error state, never a silent spinner.
- **Literacy/language:** some users are more comfortable with icons and short labels than dense text; avoid paragraphs where a short phrase + icon will do.
- **Language direction:** if the launch country uses Arabic (e.g., Gulf region per `prd.md`'s placeholder), the app needs right-to-left (RTL) layout support from the start — retrofitting RTL later is expensive. Confirm this once the actual launch country is chosen.

## 3. Visual System

### Color Palette
Apple-inspired "Modern" palette. Extended beyond the original 4-color set with
Apple's own system green and red, since the app requires distinct success/warning
colors for certification have/missing states and match quality — these two weren't
in the original 4 colors, so they're added from the same design family rather than
introducing an unrelated color.

| Role | Color | Use |
|---|---|---|
| Primary | Apple Blue (#007AFF) | Primary buttons, active nav state, headers |
| Secondary | Apple Orange (#FF9500) | Highlights, in-progress states, CTAs that need attention |
| Success | Apple Green (#34C759) | "Have" certifications, completed profile sections |
| Warning/Missing | Apple Red (#FF3B30) | Missing certifications, incomplete required fields |
| Neutral background | Off-white (#F5F5F7) | Screen backgrounds |
| Text primary | Near-black (#1D1D1F) | Body text |
| Text secondary | Mid-gray (#AAAAAA) | Helper text, timestamps, secondary labels, disabled states |

Avoid relying on color alone to communicate status — pair every color-coded state with an icon or label (e.g., a checkmark plus "Have" text, not just a green dot), since color perception and literacy both vary across users.

### Typography
- **Plus Jakarta Sans** (variable font, Google Fonts / open license) — chosen for a premium, modern feel without the load-time cost of a full custom font family; a single variable-font file (~30–40kb) covers all weights used in the app.
- Fallback to system font (San Francisco / Roboto) if the custom font fails to load, so the app never blocks on a font request — see `polish-prompts.md` Prompt 24 for the loading/fallback implementation.
- If Arabic/RTL support is added later (still open per `memory.md`), pair this with a dedicated Arabic font (e.g. IBM Plex Sans Arabic or Noto Sans Arabic) — Plus Jakarta Sans does not include Arabic glyphs.
- Minimum body text size: 16px — do not go smaller for this user base.
- Headers: 22–26px, bold (Plus Jakarta Sans's bold/extrabold weights read well at this size), generous spacing from body text below.
- Line height: 1.4–1.5x for readability on small screens.

### Spacing & Layout
- Base spacing unit: 8px (all margins/padding in multiples of 8)
- Minimum tap target: 44x44pt (per `rules.md` Section 11)
- Single-column layouts throughout — no multi-column forms, which are harder to scan on small screens and don't adapt well to RTL

## 4. Information Architecture / Navigation

Bottom tab navigation, 4 tabs (matches `architecture.md`'s `/(tabs)` route group):

```
[ Home ]  [ Profile ]  [ Jobs ]  [ Prep ]
```

- **Home:** completion status summary + quick links (finish profile, view matches, missing certs)
- **Profile:** the CV/profile builder and PDF export
- **Jobs:** matched job postings list
- **Prep:** interview flashcards

Onboarding (auth + initial profile creation) sits outside the tab structure as a linear, one-way flow — users can't accidentally navigate away mid-signup.

## 5. Screen-by-Screen

### 5.1 Onboarding
- Screen 1: phone number entry, large single input, one button ("Send code")
- Screen 2: OTP entry, auto-advances on 6th digit, no separate "submit" tap needed
- Screen 3: trade selection (single choice, large tappable cards, not a dropdown)
- Screen 4: country/location (auto-detect with confirm, not manual typing where avoidable)

**Design intent:** minimize typing everywhere possible — selection and auto-detection over free text.

### 5.2 Profile Builder
- Multi-step, one question group per screen (not one long scroll form)
- Persistent progress bar at top
- "Save & exit" always available — never force completion in one sitting
- Skills entry: tappable tag selection from a trade-specific preset list, plus an "other" free-text option — reduces typing and keeps data consistent for matching

### 5.3 Certification Checklist
- List view, each row: certification name, short "why it matters" line, toggle for have/missing
- Missing items visually grouped at top (most actionable first), have items collapse below
- Tapping a missing cert can (future phase) link to how/where to obtain it — MVP just states the requirement clearly

### 5.4 Job Matching
- Card-based list, each card: job title, match score (visual, e.g., a simple bar or percentage), key requirements, location distance
- Tapping a card expands full details — no separate navigation needed for a quick read
- Empty state (no matches yet): explain why (e.g., "add more skills to see matches") rather than showing a blank list

### 5.5 Interview Prep
- Swipeable card stack, question on front, tap/swipe to reveal answer
- Simple progress indicator (e.g., "6 of 15") so it feels like a completable set, not endless scrolling

### 5.6 PDF Export
- Single button on Profile screen: "Export CV"
- Shows a brief preview before generating, so users aren't surprised by the output
- Uses OS share sheet after generation — no custom in-app sharing UI needed

## 6. Component Library (MVP set)

- **Primary button:** filled, primary color, full-width on mobile forms
- **Secondary button:** outlined, used for "skip"/"save & exit" style actions
- **Status chip:** small pill showing have/missing/in-progress, paired with icon + text (never color alone)
- **Progress bar:** thin, top-of-screen, used in onboarding and profile builder
- **Card:** used for job postings and trade selection — consistent padding/radius across both contexts
- **Empty state:** icon + short explanatory text + a single clear action, used any time a list has nothing to show

## 7. States to Design For (every screen)

- Loading (skeleton or simple spinner, never a blank white screen)
- Empty (explain why, offer a next action)
- Error/offline (plain-language message, retry action — never a raw error code)
- Success/confirmation (brief, non-blocking — a toast, not a full-screen modal, for routine actions like "profile saved")

## 8. Accessibility

- All interactive elements have accessible labels for screen readers (`accessibilityLabel` in React Native)
- Color contrast meets WCAG AA minimum, especially for status colors against the background
- No information conveyed by color alone (see Section 3)
- Text scales with system font-size settings rather than being hardcoded to a fixed size

## 9. Open Design Questions

- Once the launch country is confirmed, is RTL layout needed at MVP, or can it be deferred to Phase 5 expansion in `phases.md`?
- Should trade-specific iconography (e.g., an electrician icon vs. a plumber icon) be custom-illustrated, or is a existing icon set (e.g., Lucide, which is already available per the component library) sufficient for MVP?
- Does the target user base skew toward needing larger default text sizes than the 16px baseline set here?
