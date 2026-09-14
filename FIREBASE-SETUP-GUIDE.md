# 🔥 Firebase Setup Guide - Step by Step

Follow these steps to connect Firebase to your TradeMatch app.

---

## Part 1: Create Firebase Project & Get Credentials

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Add project"** or **"Create a project"**
3. Enter project name: **TradeMatch** (or your preferred name)
4. **Optional:** Disable Google Analytics for MVP (can enable later)
5. Click **"Create project"**
6. Wait for project creation (takes ~30 seconds)
7. Click **"Continue"** when done

### Step 2: Add Web App to Firebase

1. In your Firebase project, click the **Web icon** (`</>`) to add a web app
2. Register app:
   - **App nickname:** TradeMatch
   - **☐ Firebase Hosting:** Leave unchecked for now
3. Click **"Register app"**

### Step 3: Copy Firebase Configuration

You'll see a screen with your Firebase config. Copy the values:

```javascript
const firebaseConfig = {
  apiKey: "AIza...your_key_here",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};
```

**IMPORTANT:** Keep these values safe! Do not share them publicly.

### Step 4: Add Configuration to .env File

Open `.env` in your project and fill in the values:

```env
FIREBASE_API_KEY=AIza...your_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123def456
```

**Save the file!**

---

## Part 2: Enable Firebase Services

### Step 5: Enable Authentication

1. In Firebase Console, go to **Build** → **Authentication**
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **"Phone"** authentication:
   - Click on **Phone**
   - Toggle **Enable**
   - Click **Save**
5. Optional: Also enable **Email/Password** as fallback:
   - Click on **Email/Password**
   - Toggle **Enable**
   - Click **Save**

### Step 6: Create Firestore Database

1. In Firebase Console, go to **Build** → **Firestore Database**
2. Click **"Create database"**
3. Choose location:
   - Select a region close to your users
   - **Recommended for UAE/Gulf:** `asia-south1` (Mumbai) or `europe-west1` (Belgium)
4. Start in **production mode** (we'll deploy our custom rules next)
5. Click **"Enable"**
6. Wait for database creation (~1 minute)

---

## Part 3: Test Firebase Connection

### Step 7: Test Connection

Run the connection test:

```bash
npm run test:firebase
```

You should see:
```
✅ Firebase connection test PASSED!
```

If you see errors:
- ❌ **API key not valid**: Double-check your .env file values
- ❌ **Network error**: Check your internet connection
- ⚠️  **Permission denied**: Normal before deploying security rules

---

## Part 4: Deploy Security Rules and Indexes

### Step 8: Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### Step 9: Login to Firebase

```bash
firebase login
```

This opens a browser for Google authentication.

### Step 10: Initialize Firebase

```bash
firebase init
```

When prompted:

1. **Which Firebase features?**
   - Select: ☑ Firestore (use space to select, enter to confirm)

2. **Select a default Firebase project:**
   - Choose your project from the list

3. **Firestore Rules file?**
   - Press Enter (accepts `firestore.rules` - already created)

4. **Firestore indexes file?**
   - Press Enter (accepts `firestore.indexes.json` - already created)

This creates `firebase.json` configuration file.

### Step 11: Deploy to Firebase

Deploy security rules and indexes:

```bash
firebase deploy --only firestore
```

You should see:
```
✔  Deploy complete!
```

---

## Part 5: Verify Everything Works

### Step 12: Verify in Firebase Console

1. **Check Rules:**
   - Go to **Firestore Database** → **Rules**
   - You should see your deployed rules
   - Status should be **Published**

2. **Check Indexes:**
   - Go to **Firestore Database** → **Indexes**
   - You should see indexes for `jobPostings`, `certifications`, `interviewPrep`
   - Status will be **Building** → **Enabled** (takes 1-5 minutes)

### Step 13: Test the App

Start your app:

```bash
npm start
```

Press `i` for iOS or `a` for Android (or scan QR code with Expo Go).

You should see:
- ✅ No Firebase errors in the console
- ✅ "TradeMatch - Coming Soon" screen

---

## Part 6: Set Up Collections (Optional for Testing)

### Add Sample Data

You can add sample data via Firebase Console:

1. Go to **Firestore Database** → **Data**
2. Click **"Start collection"**
3. Collection ID: `certifications`
4. Add a document with these fields:

```
Document ID: (auto-generate)
Fields:
  - name: "Level 1 Electrician License"
  - trade: "electrician"
  - country: "UAE"
  - description: "Basic electrical work certification"
  - required: true
```

5. Click **"Save"**

Repeat for other collections as needed.

---

## ✅ Checklist

Before moving forward, verify:

- [ ] Firebase project created
- [ ] `.env` file filled with Firebase config
- [ ] Authentication enabled (Phone + Email)
- [ ] Firestore database created
- [ ] Connection test passes: `npm run test:firebase`
- [ ] Firebase CLI installed and logged in
- [ ] Security rules deployed
- [ ] Indexes deployed and enabled
- [ ] App starts without Firebase errors

---

## 🚨 Troubleshooting

### Issue: "API key not valid"
**Solution:** Check that you copied the **apiKey** correctly from Firebase Console to `.env`

### Issue: "Permission denied"
**Solution:** Deploy security rules: `firebase deploy --only firestore:rules`

### Issue: "Index required"
**Solution:** 
1. Click the error link (auto-creates index), OR
2. Deploy indexes: `firebase deploy --only firestore:indexes`

### Issue: Can't find firebase CLI
**Solution:** 
```bash
npm install -g firebase-tools
# Or use npx: npx firebase-tools login
```

### Issue: Wrong project selected
**Solution:**
```bash
firebase use --add
# Select correct project from list
```

---

## 📋 Quick Commands Reference

```bash
# Test Firebase connection
npm run test:firebase

# Deploy rules and indexes
firebase deploy --only firestore

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# View current project
firebase projects:list

# Switch projects
firebase use project-name

# Open Firebase Console
firebase open
```

---

## Next Steps After Setup

Once Firebase is connected and working:

1. ✅ Schema and rules are deployed
2. ➡️ **Next:** Build authentication flow in `/app/(auth)`
3. ➡️ **Then:** Build profile builder in `/app/(tabs)/profile`
4. ➡️ **Follow:** Phase 1 roadmap in `phases.md`

---

**Need Help?**

Check these docs:
- `FIRESTORE-SCHEMA.md` - Complete schema reference
- `FIREBASE-DEPLOYMENT.md` - Detailed deployment guide
- `architecture.md` - System architecture

---

**Last Updated:** September 11, 2026
