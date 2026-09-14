# TradeMatch - Quick Start Guide

## ✅ Setup Complete!

Your TradeMatch project is ready for development. The verification script confirms all required files and folders are in place.

---

## 🚀 Get Started in 3 Steps

### Step 1: Configure Firebase

Open `.env` and add your Firebase configuration:

```env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123def456
```

### Step 2: Start the Development Server

```bash
npm start
```

### Step 3: Open the App

- **iOS:** Press `i` or scan QR code with Expo Go
- **Android:** Press `a` or scan QR code with Expo Go
- **Web:** Press `w` to open in browser

---

## 📋 Essential Commands

```bash
npm start          # Start Expo development server
npm run type-check # Check TypeScript errors
npm run format     # Format code with Prettier
npm run verify     # Verify project setup
```

---

## 📁 Project Structure

```
/app/(auth)        # Authentication screens
/app/(tabs)        # Main tab screens (home, profile, jobs, prep)
/services          # Firebase operations (use these, not direct Firestore calls)
/components        # Reusable UI components
/hooks             # Custom React hooks
/constants         # Design system (colors, spacing, typography)
/types             # TypeScript type definitions
/utils             # Helper functions
```

---

## 🎨 Design System Available

Import from `constants/theme`:

```typescript
import { Colors, Typography, Spacing } from '@/constants/theme';

// Colors
Colors.primary      // #1E4D6B (deep blue)
Colors.secondary    // #E8A33D (warm amber)
Colors.success      // #2D8A4E (green)
Colors.warning      // #C4562D (orange)

// Typography
Typography.body     // 16px (minimum)
Typography.header   // 22px

// Spacing
Spacing.md          // 16px
Spacing.lg          // 24px
```

---

## ⚡ Key Rules

From `rules.md`:

1. **TypeScript only** - No `.js` or `.jsx` files
2. **No `any` types** - Always use explicit types
3. **Services layer** - Components never call Firestore directly
4. **One component per file** - File name matches component name
5. **Include timestamps** - All writes need `createdAt` and `updatedAt`

---

## 📚 Full Documentation

- **SETUP.md** - Detailed setup instructions
- **PROJECT-STATUS.md** - Current status and pending tasks
- **STRUCTURE.txt** - Visual folder structure
- **prd.md** - Product requirements
- **architecture.md** - Technical architecture
- **rules.md** - Coding standards (READ THIS!)
- **design.md** - UI/UX specifications

---

## 🔧 Next Development Steps

Per `phases.md`:

1. ✅ Project scaffolding (DONE)
2. ⏳ Add Firebase configuration
3. ⏳ Complete Phase 0 validation (talk to users/agencies)
4. ⏳ Build authentication flow in `/app/(auth)`
5. ⏳ Build profile builder in `/app/(tabs)/profile`
6. ⏳ Continue with Phase 1 tasks...

---

## ✨ What's Already Set Up

- ✅ Expo Router with file-based routing
- ✅ TypeScript (strict mode)
- ✅ Firebase SDK integrated
- ✅ expo-print for PDF generation
- ✅ Prettier for code formatting
- ✅ Complete folder structure per `rules.md`
- ✅ Type definitions for data model
- ✅ Design system constants
- ✅ Firestore security rules
- ✅ Environment variable support

---

## 🆘 Troubleshooting

**App won't start?**
- Ensure Firebase keys are in `.env`
- Try: `npx expo start --clear`

**TypeScript errors?**
- Run: `npm run type-check`
- Fix any errors shown

**Need to verify setup?**
- Run: `npm run verify`

---

**Happy coding! 🎉**

Remember: Read `rules.md` before writing code - it defines the conventions this project follows.
