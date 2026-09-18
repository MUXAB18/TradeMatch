# Web Build Prompts

## Product
TradeMatch (working title) — web app build prompts (Expo Web / React Native Web)

## Decision
Per `architecture.md` Section 2: this uses **Expo Web**, not a separate web
codebase. React Native Web translates almost everything already built in
`prompts.md` and `polish-prompts.md` directly — screens, components, hooks,
and the Firebase service layer are shared, not duplicated. This is far less
work than rebuilding the UI in Next.js/plain React, and keeps one codebase
for mobile and web going forward.

## How to Use This File
Run these in order, after the mobile app is functionally complete. Each one
assumes the previous is done. Keep `architecture.md`, `rules.md`, and
`design.md` in context, same as the other prompt files.

---

## Prompt W1 — Enable Web Support & Audit Compatibility

```
Enable web support for the existing Expo project and audit the current
screens for what breaks in a desktop browser, before any web-specific
redesign work begins.

Requirements:
- Confirm react-native-web and Expo's web dependencies are set up (Expo
  SDK 51+ includes this by default); run `npx expo start --web` to verify
- Add "web" to app.json's platforms if not already present
- Walk through every existing screen (Home, Profile, Jobs, Prep, Settings,
  Certifications, onboarding, auth) in a desktop browser and produce a
  written list of what's broken or visually wrong. Expect issues with:
  gesture-based interactions (swipe), haptics (no web equivalent),
  biometric auth, and any native-only Expo API
- Do not fix anything in this prompt — just produce an accurate list so
  the prompts below can address each issue deliberately

Acceptance criteria: the app loads and is navigable in a desktop browser,
and you have a concrete, accurate list of what needs platform-specific
handling.
```

## Prompt W2 — Platform-Specific Fallbacks for Mobile-Only APIs

```
Add Platform.OS checks (from 'react-native') so every mobile-only API used
across the app degrades gracefully on web instead of erroring or silently
doing nothing confusing.

Requirements:
- expo-haptics (Prompt 16): wrap every call in a Platform.OS !== 'web'
  check — this should be a silent no-op on desktop hardware, not an error
- expo-local-authentication (Prompt 27's biometric login): hide the
  "Log in with Face ID" option entirely on web rather than showing a
  button that can't work. WebAuthn is a real equivalent if biometric-style
  web login matters later — that's a separate feature, not part of this
  fallback pass
- expo-print (Prompt 8's CV export): use the browser's native
  print-to-PDF (window.print() with print-specific CSS) or a lightweight
  web PDF library — expo-print itself is mobile-only
- Swipe gestures (job cards in Prompt 22, flashcards in Prompt 35): keep
  swipe where the browser supports it, but the button-based alternatives
  already built alongside them (Previous/Next, tap-to-save) become the
  primary path on web, since mouse users won't discover swipe at all
- Push notifications (Prompt 17): web push uses the browser Notification
  API and a different permission flow than mobile — implement as a
  separate path, don't assume the mobile implementation just works

Acceptance criteria: no mobile-only API throws an error or silently fails
on web; each either has a working web equivalent or is cleanly hidden.
```

## Prompt W3 — Responsive Layout: Sidebar Navigation for Desktop

```
Replace the bottom tab bar with a responsive layout: bottom tabs stay on
narrow/mobile-web viewports, a persistent left sidebar appears on
desktop-width screens. Bottom tabs read as mobile-only once the viewport
is wide — this is standard web UX.

Requirements:
- Breakpoint (e.g. 768px): below it, keep the existing bottom tab bar
  exactly as built for mobile; above it, render a left sidebar with the
  same destinations (Home, Profile, Jobs, Prep, Settings) using the same
  icons already established
- Sidebar includes the app logo/wordmark at top (per logo-prompt.md), and
  highlights the active route the same way the mobile tab bar does
- Content area next to the sidebar gets a max-width on very wide screens
  (roughly 1200-1400px) rather than stretching full-width — this app's
  forms, cards, and lists were designed for mobile-width columns and will
  look sparse stretched across a large monitor
- Existing screens render inside this new layout shell without needing
  per-screen rewrites — the shell wraps them

Acceptance criteria: resizing the browser smoothly transitions between
mobile and desktop layouts at the breakpoint; desktop gets a sidebar, not
a stretched mobile layout; content stays readable at wide widths.
```

## Prompt W4 — Desktop Interaction Polish (Hover, Focus, Keyboard)

```
Add desktop-appropriate interaction states — mouse and keyboard users
expect feedback that touch-only mobile UI doesn't need.

Requirements:
- Hover states on every clickable element (buttons, cards, list rows,
  sidebar nav items) — a subtle background/border change on hover,
  using design.md's palette, distinct from the press-state animation
  already built for mobile
- Visible focus states for keyboard navigation (a clear outline or border
  on the focused element) — required for accessibility, and likely
  missing by default from mobile-first development
- Confirm the full app is navigable via Tab/Shift+Tab and Enter/Space —
  test the entire auth-through-certification-checklist flow using only a
  keyboard, no mouse
- Cursor: pointer on anything clickable, default elsewhere — small
  detail, but its absence is an immediate "not built for web" signal

Acceptance criteria: every interactive element has a visible hover and
focus state; the app is fully usable via keyboard alone; no task depends
on a touch-only gesture as its sole path on desktop.
```

## Prompt W5 — SEO, Meta Tags & Progressive Web App Setup

```
Add web-specific discoverability and installability — none of this exists
on the mobile-only build.

Requirements:
- Meta tags: title, description, Open Graph tags (og:title, og:description,
  og:image) for link-share previews, using copy pulled from prd.md's
  problem statement, not generic placeholder text
- Favicon using the app icon from logo-prompt.md's chosen mark
- PWA manifest (manifest.json): app name, icons at required sizes, theme
  color matching design.md's primary color, display mode "standalone" so
  it's installable from the browser
- A basic service worker for a graceful offline fallback page — not full
  offline functionality, that's a larger feature for later
- robots.txt and a minimal sitemap.xml only if this web build should be
  publicly indexed — skip if it's meant to sit behind auth

Acceptance criteria: sharing the app link shows a proper preview card, not
a blank one; the browser offers to install the app as a PWA; there's a
graceful offline fallback instead of a blank error page.
```

## Prompt W6 — Web Performance & Code Splitting

```
Optimize the web build's load performance — a mobile app loads its bundle
once at install; a web app's initial load time directly affects whether
users stick around.

Requirements:
- Verify Expo Router's route-based code-splitting is active for web — the
  auth flow, certification checklist, and job matching screens shouldn't
  all load in the initial bundle if the user is only on Home
- Lazy-load Lottie animations (onboarding, splash, celebrations) instead
  of bundling them into the initial page load
- Compress/resize images and icons appropriately for web delivery — mobile
  asset sizes may be larger than needed for typical web rendering
- Run a Lighthouse audit (Chrome DevTools) after these changes and address
  anything scoring below ~80 on Performance as a real target, not a
  nice-to-have

Acceptance criteria: initial load feels fast on typical broadband,
Lighthouse Performance is 80+, and heavy assets load progressively rather
than blocking initial render.
```

## Prompt W7 — Deployment

```
Deploy the web build to a hosting provider.

Requirements:
- Build the static web output: `npx expo export --platform web`
- Deploy to Vercel or Netlify (both work well with Expo's static web
  output) — connect it to the same git repo so pushes auto-deploy
- Set environment variables (Firebase config) in the hosting provider's
  dashboard, matching .env.example — never commit real keys
- Confirm Firebase Authentication's authorized domains include the new
  web deployment URL — otherwise auth, especially Google Sign-In's
  redirect flow, fails silently on the live site despite working locally
- Set up a custom domain with HTTPS if you have one (both providers
  handle HTTPS automatically)

Acceptance criteria: the web app is live at a public URL, auth works
correctly on the deployed version (not just localhost), and pushing to
main triggers an automatic redeploy.
```

## What's Intentionally Not Here

Full offline-first functionality, a separate native-feeling desktop app
(Electron/Tauri), and deep PWA features (background sync, push while the
browser is closed) are all real possibilities later, but premature before
the web version even has real users — same discipline as `phases.md` applies
here: build the working version first, add depth once it's validated that
people actually want to use TradeMatch in a browser rather than the mobile
app.

## One Honest Note on Scope

React Native Web covers the large majority of what's already built, but
"reuses nearly everything" isn't "reuses literally everything, untested."
Budget real time for Prompt W1's audit — some third-party libraries used
across `polish-prompts.md` (certain Reanimated features, some native Expo
modules) have partial or no web support, and you won't know which ones
until you actually run the app in a browser and look.
