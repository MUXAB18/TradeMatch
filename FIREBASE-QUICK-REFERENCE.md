# Firebase Mobile Setup - Quick Reference

## 🚀 Quick Start Checklist

### 1. Firebase Console Setup (5 minutes)

- [ ] Create Firebase project at https://console.firebase.google.com
- [ ] Add iOS app with bundle ID: `com.tradematch.app`
- [ ] Download `GoogleService-Info.plist` → place in project root
- [ ] Add Android app with package: `com.tradematch.app`
- [ ] Download `google-services.json` → place in project root
- [ ] Add Web app and copy config values

### 2. Environment Configuration (2 minutes)

Update `.env` file:

```env
FIREBASE_API_KEY=your_api_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

Run: `npm run setup:firebase`

### 3. Enable Firebase Services (3 minutes)

In Firebase Console:
- [ ] **Authentication** → Enable Email/Password
- [ ] **Firestore Database** → Create database
- [ ] **Storage** → Create storage bucket (if needed)

### 4. Deploy Rules (1 minute)

```bash
firebase login
firebase init firestore
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 5. Test (1 minute)

```bash
npm run test:firebase
npm run ios
npm run android
```

---

## 📱 Platform Files Checklist

Your project root should have:
```
myapp/
├── GoogleService-Info.plist    ← iOS config
├── google-services.json        ← Android config
├── .env                        ← Environment variables
└── app.json                    ← Updated with googleServicesFile paths
```

---

## 🔑 Key Configuration Values

### Bundle Identifiers (Must Match!)

| Platform | Identifier | Location |
|----------|-----------|----------|
| iOS | `com.tradematch.app` | Firebase Console iOS app |
| Android | `com.tradematch.app` | Firebase Console Android app |
| App Config | `com.tradematch.app` | `app.json` |

### Firebase Config Files Location

```json
// app.json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.tradematch.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.tradematch.app",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

---

## 🧪 Testing Commands

```bash
# Test Firebase connection
npm run test:firebase

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator/device
npm run android

# Verify setup
npm run verify
```

---

## 🔒 Security Best Practices

✅ **DO:**
- Keep `.env` file in `.gitignore`
- Use environment variables for sensitive config
- Deploy Firestore security rules
- Test on real devices before production
- Use separate Firebase projects for dev/prod

❌ **DON'T:**
- Commit `google-services.json` or `GoogleService-Info.plist` with real keys
- Hardcode API keys in source code
- Use development Firebase project in production builds
- Skip testing on real devices

---

## 🐛 Common Issues & Fixes

### Issue: "Firebase config is empty"
**Fix:** 
```bash
# Check .env file exists and has values
cat .env

# Run setup script
npm run setup:firebase

# Restart Expo
npm start
```

### Issue: "App not registered"
**Fix:** 
- Verify bundle ID / package name matches Firebase Console exactly
- Check `GoogleService-Info.plist` / `google-services.json` are in project root
- Rebuild the app

### Issue: Android authentication fails
**Fix:**
1. Get SHA-1 fingerprint:
```bash
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
```
2. Add SHA-1 to Firebase Console → Project Settings → Android app
3. Download new `google-services.json`
4. Rebuild app

### Issue: iOS authentication fails
**Fix:**
- Ensure bundle ID matches: `com.tradematch.app`
- Check `GoogleService-Info.plist` is included in build
- Verify OAuth redirect URIs in Firebase Console

---

## 📦 Building for Production

### iOS

```bash
# Using EAS Build (recommended)
npx eas build --platform ios --profile production

# Traditional
expo build:ios
```

Before building:
- [ ] Update version in `app.json`
- [ ] Test on real device
- [ ] Use production Firebase project
- [ ] Configure code signing

### Android

```bash
# Using EAS Build (recommended)
npx eas build --platform android --profile production

# Traditional
expo build:android
```

Before building:
- [ ] Update version in `app.json`
- [ ] Generate production keystore
- [ ] Add production SHA-1 to Firebase
- [ ] Test on real device
- [ ] Use production Firebase project

---

## 📞 Need Help?

1. Check [FIREBASE-MOBILE-SETUP.md](./FIREBASE-MOBILE-SETUP.md) for detailed instructions
2. Review [Firebase Console](https://console.firebase.google.com) settings
3. Check [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
4. Verify all bundle IDs and package names match

---

## 🎯 Next Steps After Setup

1. Test user registration and login
2. Test Firestore read/write operations
3. Implement your first feature
4. Add error handling and loading states
5. Test on both iOS and Android devices
6. Set up crash reporting
7. Configure analytics
8. Plan production deployment
