# 🖥️ Desktop Testing Guide

## Quick Start

**Simply open your browser and go to:**

```
http://localhost:8081
```

That's it! Your app is now running in the browser.

---

## ✅ Status

- **Expo Server:** Running
- **Web Bundle:** Compiled successfully
- **URL:** http://localhost:8081
- **Ready to Test:** YES

---

## How to Access

### Method 1: Direct URL (Easiest)

1. Open any browser (Chrome, Safari, Firefox, Edge)
2. Type in address bar: `http://localhost:8081`
3. Press Enter
4. Wait 5-10 seconds for first load
5. App appears!

### Method 2: Press 'w' in Terminal

1. Find the terminal where Expo is running
2. Press the `w` key (lowercase)
3. Your default browser opens automatically
4. App loads

### Method 3: Command-Click Link

1. Look at your Expo terminal output
2. Find the line: `› Web: http://localhost:8081`
3. Cmd+Click (Mac) or Ctrl+Click (Windows/Linux) the link
4. Browser opens with app

---

## What You'll See

The app will appear as a **mobile phone screen** in your browser:

```
┌─────────────────────┐
│   TradeMatch App    │
│                     │
│  (Mobile Screen)    │
│                     │
│   Content here...   │
│                     │
│                     │
│  [Home] [Profile]  │
│  [Certs] [Jobs]... │
└─────────────────────┘
```

This is intentional! The app is designed mobile-first.

---

## Testing Workflow

### 1. Create Account

```
Email:    test@example.com
Password: test123456
```

Click "Sign in with Email"

### 2. Onboarding Flow

- **Phone:** Enter any number (e.g., +971501234567)
- **Trade:** Click one: Electrician, Plumber, HVAC, or Carpenter
- **Country:** Select United Arab Emirates (AE)
- **Location:** Allow location or click "Use Dubai"

### 3. Complete Profile

Go to Profile tab → Edit Profile:

- **Name:** Your name
- **Experience:** Years (e.g., 5)
- **Skills:** Click to select multiple (e.g., Residential Wiring, Commercial)
- **Availability:** Immediate, 2 weeks, 1 month

### 4. Test All Features

| Feature | How to Test |
|---|---|
| **Home Dashboard** | View completion %, stats, quick links |
| **Certifications** | Click items to toggle have/missing |
| **Job Matching** | View 27 jobs, click to expand, see match scores |
| **Interview Prep** | Click card to flip, use Previous/Next |
| **CV Export** | Click "Export CV", preview, then download PDF |

---

## Desktop vs Mobile Differences

| Feature | Desktop | Mobile |
|---|---|---|
| **Auth** | ✅ Works | ✅ Works |
| **Navigation** | ✅ Click tabs | ✅ Tap tabs |
| **Forms** | ✅ Type | ✅ Type |
| **Flashcards** | ⚠️ Click to flip | ✅ Tap/Swipe |
| **PDF Export** | ⚠️ Downloads file | ✅ OS share sheet |
| **Touch Gestures** | ⚠️ Click/drag | ✅ Swipe/tap |

✅ = Full support  
⚠️ = Works but different behavior

---

## Browser Console Warnings (Expected)

You may see these warnings in browser DevTools (F12):

```
⚠️ "shadow*" style props are deprecated. Use "boxShadow".
⚠️ Unexpected text node
```

**These are normal!** React Native Web shows these warnings but they don't affect functionality. The app still works perfectly.

---

## Before Testing: Seed Data

**Important:** Seed the database first for best experience.

Open a **new terminal** (keep Expo running) and run:

```bash
cd /Users/user/Desktop/myapp

# Seed certifications (21 items)
npm run seed:certifications

# Seed jobs (27 items)
npm run seed:jobs

# Seed interview questions (30 items)
npm run seed:interview
```

You only need to do this once.

---

## Developer Tools

### Open Browser DevTools

- **Chrome:** Press F12 or Cmd+Option+I (Mac)
- **Safari:** Enable Developer menu, then Cmd+Option+I
- **Firefox:** Press F12 or Cmd+Shift+I (Mac)

### Useful DevTools Features

1. **Console:** See logs and warnings
2. **Network:** Monitor Firebase API calls
3. **Elements:** Inspect DOM structure
4. **Mobile View:** Click phone icon to simulate mobile screen size

### Mobile Simulation in Browser

Most browsers have mobile device simulation:

1. Open DevTools (F12)
2. Click phone/tablet icon (toggle device toolbar)
3. Select device: iPhone 14 Pro, Pixel 7, etc.
4. App resizes to match device

---

## Keyboard Shortcuts (In Expo Terminal)

While Expo is running, press:

- `w` - Open in web browser
- `r` - Reload app
- `m` - Toggle menu
- `c` - Clear cache and reload
- `?` - Show all commands
- `Ctrl+C` - Stop server

---

## Troubleshooting

### App Won't Load in Browser

**Problem:** Blank page or loading forever

**Solution:**
```bash
# Clear Metro cache and restart
npx expo start -c
```

### "Cannot Connect" Error

**Problem:** Browser shows "Can't reach localhost"

**Check:**
1. Is Expo server running? Look for terminal with Metro bundler
2. Is the port correct? Should be 8081
3. Try: http://127.0.0.1:8081

### Styles Look Wrong

**Problem:** Layout is broken or text is weird

**Solution:**
1. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
2. Clear browser cache
3. Restart Expo: Press `r` in terminal

### Firebase Auth Errors

**Problem:** Can't sign in

**Check:**
1. `.env` file exists with Firebase keys
2. Firebase project is active
3. Authentication is enabled in Firebase Console
4. Email/password auth is enabled (not phone)

### Seed Data Not Showing

**Problem:** No jobs, no certs, no questions

**Solution:**
```bash
# Run seed scripts (in new terminal)
npm run seed:certifications
npm run seed:jobs
npm run seed:interview
```

---

## Performance Notes

### First Load

- **Time:** 5-15 seconds
- **Why:** Metro bundler compiling JavaScript
- **Normal:** Yes, subsequent loads are faster

### After Code Changes

- **Reload:** Automatic (Fast Refresh)
- **Time:** 1-3 seconds
- **What happens:** Only changed components reload

### Navigation

- **Between tabs:** Instant
- **Between screens:** <100ms
- **Why:** Client-side routing (Expo Router)

---

## Known Limitations (Desktop Web)

1. **Mobile-First Design**
   - App looks like a phone screen (this is intentional)
   - Best experience is on actual mobile device

2. **Touch Gestures**
   - Flashcards: Click instead of swipe
   - Navigation: Click instead of tap
   - Still fully functional!

3. **Native Features**
   - PDF Export uses browser download (not native share sheet)
   - Push notifications don't work on web
   - Camera/gallery access limited

4. **React Native Web Warnings**
   - Console shows warnings (can be ignored for MVP)
   - Don't affect functionality
   - Would be cleaned up for production

---

## Best Testing Experience

**For MVP Phase 1, the best testing is:**

1. **Desktop browser** - Quick development/debugging
2. **Mobile device** - Real user experience (recommended)
3. **iOS Simulator** - If you have Xcode
4. **Android Emulator** - If you have Android Studio

**To test on mobile:**
1. Install Expo Go app on your phone
2. Scan QR code from terminal
3. Full native experience!

---

## Summary

**Desktop testing is working!** 🎉

- **URL:** http://localhost:8081
- **Features:** All working (with mobile-optimized UI)
- **Warnings:** Normal React Native Web messages (can ignore)
- **Best For:** Quick testing and development
- **MVP Focus:** Mobile device testing (iOS/Android)

The app is fully functional on desktop. You can:
- ✅ Create accounts
- ✅ Complete onboarding
- ✅ Build profiles
- ✅ Toggle certifications
- ✅ View job matches
- ✅ Practice interviews
- ✅ Export CVs

Everything works! The UI is mobile-sized because it's a mobile-first app.

---

**Ready to test?** → http://localhost:8081 🚀
