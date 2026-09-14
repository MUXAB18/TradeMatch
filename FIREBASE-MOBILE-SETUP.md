# Firebase Setup for Android & iOS

This guide will walk you through setting up Firebase for your TradeMatch mobile app on both Android and iOS platforms.

## Prerequisites

- Firebase account (https://console.firebase.google.com)
- Node.js and npm installed
- Expo CLI installed
- Xcode (for iOS development)
- Android Studio (for Android development)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project" or select your existing project
3. Enter project name: `TradeMatch` (or your preferred name)
4. Enable/disable Google Analytics (recommended: enable)
5. Click "Create project"

## Step 2: Register Your Apps in Firebase

### For iOS App

1. In Firebase Console, click the **iOS icon** (⊕ iOS)
2. Fill in the registration form:
   - **iOS bundle ID**: `com.tradematch.app` (must match `app.json`)
   - **App nickname**: `TradeMatch iOS` (optional)
   - **App Store ID**: Leave blank for now
3. Click "Register app"
4. **Download `GoogleService-Info.plist`**
5. Click "Next" through the SDK setup (we're using web SDK with Expo)
6. Click "Continue to console"

### For Android App

1. In Firebase Console, click the **Android icon** (⊕ Android)
2. Fill in the registration form:
   - **Android package name**: `com.tradematch.app` (must match `app.json`)
   - **App nickname**: `TradeMatch Android` (optional)
   - **Debug signing certificate**: Leave blank for development
3. Click "Register app"
4. **Download `google-services.json`**
5. Click "Next" through the SDK setup
6. Click "Continue to console"

## Step 3: Get Firebase Web Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. You should see a web app section or click "Add app" → Web icon (</>)
4. Register web app:
   - **App nickname**: `TradeMatch Web`
   - Check "Also set up Firebase Hosting" (optional)
5. Copy the Firebase configuration object:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 4: Configure Environment Variables

1. Open your `.env` file in the project root
2. Add your Firebase configuration:

```env
FIREBASE_API_KEY=AIza...
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abcdef
```

3. Run the setup script to update `app.json`:

```bash
npm run setup:firebase
```

Or manually update `app.json` extra section with your Firebase config values.

## Step 5: Enable Firebase Services

### Enable Authentication

1. In Firebase Console, go to **Authentication**
2. Click "Get started"
3. Enable sign-in methods you need:
   - **Email/Password** ✓ (recommended)
   - **Phone** (optional)
   - **Google** (optional)
   - **Apple** (recommended for iOS)

### Enable Firestore Database

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose a location (select closest to your users)
4. Start in **production mode** (we have custom rules)
5. Click "Enable"

### Deploy Firestore Rules

Deploy the security rules from your project:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

## Step 6: Platform-Specific Configuration

### iOS Configuration with Expo

For Expo projects, the Firebase JS SDK works across platforms. However, for native modules:

1. Update `app.json` to include iOS config:

```json
{
  "expo": {
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.tradematch.app",
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

2. Place `GoogleService-Info.plist` in your project root

3. If using EAS Build, add to `eas.json`:

```json
{
  "build": {
    "production": {
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### Android Configuration with Expo

1. Update `app.json` to include Android config:

```json
{
  "expo": {
    "android": {
      "package": "com.tradematch.app",
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "backgroundColor": "#1E4D6B",
        "foregroundImage": "./assets/android-icon-foreground.png"
      }
    }
  }
}
```

2. Place `google-services.json` in your project root

## Step 7: Add Firebase Config Plugin (Optional)

For better native integration, you can use the Firebase config plugin:

```bash
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore
```

Update `app.json`:

```json
{
  "expo": {
    "plugins": [
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "@react-native-firebase/firestore"
    ]
  }
}
```

**Note**: Using `@react-native-firebase` requires custom development builds and won't work with Expo Go.

## Step 8: Test Firebase Connection

Run the test script:

```bash
npm run test:firebase
```

Or test manually:

```bash
# Start Expo
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

## Step 9: Build for Production

### iOS Production Build

1. Configure app signing in Xcode or EAS
2. Update `app.json` with proper credentials
3. Build:

```bash
# Using EAS Build (recommended)
npx eas build --platform ios

# Or using Expo
expo build:ios
```

### Android Production Build

1. Generate keystore for signing
2. Configure signing in `eas.json` or `app.json`
3. Build:

```bash
# Using EAS Build (recommended)
npx eas build --platform android

# Or using Expo
expo build:android
```

## Important Notes for Mobile Apps

### iOS Specific

- **Bundle ID** must match exactly: `com.tradematch.app`
- For push notifications, you'll need to upload APNs certificates
- Apple Sign-In is required if you offer any other social login
- Test on real iOS devices for best results

### Android Specific

- **Package name** must match exactly: `com.tradematch.app`
- For push notifications, FCM works automatically
- Generate SHA-1 fingerprint for Google Sign-In:

```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Production keystore
keytool -list -v -keystore /path/to/your/keystore.jks -alias your-key-alias
```

Add SHA-1 to Firebase Console → Project Settings → Your Android App → Add fingerprint

### Using Expo Go vs Development Builds

**Expo Go** (easier, limited):
- Uses Firebase JS SDK (web mode)
- Works for basic auth and Firestore
- No native Firebase features
- Great for development

**Development Build** (more features):
- Full native Firebase SDK
- Push notifications work natively
- Better performance
- Required for production apps

## Troubleshooting

### "Firebase config is empty"
- Check `.env` file has correct values
- Run `npm run setup:firebase` to sync with `app.json`
- Restart Expo dev server

### "App not authorized"
- Verify bundle ID / package name matches Firebase Console
- For Android, check SHA-1 fingerprints are added
- For iOS, check `GoogleService-Info.plist` is included

### "Network request failed"
- Check internet connection
- Verify Firebase project is active
- Check Firestore rules allow your operations

### Auth not working on device
- iOS: Ensure bundle ID matches
- Android: Ensure package name and SHA-1 fingerprints are correct
- Check Firebase Console shows your app platforms

## Security Checklist

- ✅ Firestore security rules deployed
- ✅ Authentication enabled
- ✅ API keys in environment variables (not hardcoded)
- ✅ `.env` file in `.gitignore`
- ✅ Production builds use production Firebase project
- ✅ Test users removed from Auth before launch

## Next Steps

1. Test authentication flows on both platforms
2. Test Firestore read/write operations
3. Set up analytics and crash reporting
4. Configure push notifications (if needed)
5. Test on real devices
6. Submit to App Store and Google Play Store

## Resources

- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [React Native Firebase](https://rnfirebase.io/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
