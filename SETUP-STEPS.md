# 🔥 Firebase Setup Steps for "Job-market copilot"

Follow these exact steps to connect your Firebase project.

---

## Step 1: Get Firebase Configuration

1. **Open Firebase Console:**
   - Go to https://console.firebase.google.com/
   - You should see your project **"Job-market copilot"**
   - Click on it to open

2. **Add a Web App:**
   - On the project overview page, look for the web icon `</>`
   - Click the **Web icon** (looks like `</>`)
   - If you don't see it, look for "Add app" button

3. **Register the App:**
   - **App nickname:** Enter `TradeMatch` (or any name you prefer)
   - **☐ Firebase Hosting:** Leave this UNCHECKED for now
   - Click **"Register app"**

4. **Copy the Configuration:**
   
   You'll see something like this:

   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyC...",
     authDomain: "job-market-copilot-xxxxx.firebaseapp.com",
     projectId: "job-market-copilot-xxxxx",
     storageBucket: "job-market-copilot-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef123456"
   };
   ```

   **Copy these 6 values!** You'll need them in the next step.

   - Click **"Continue to console"** when done

---

## Step 2: Add Configuration to Your App

### Option A: Use Interactive Script (Easiest)

1. **Run the setup script:**
   ```bash
   npm run setup:firebase
   ```

2. **When prompted, paste each value:**
   - It will ask for each config value one by one
   - Paste the exact values from Firebase Console
   - Press Enter after each one

3. **Done!** The script will:
   - Save to `.env` file
   - Test the connection automatically

### Option B: Manual Entry

1. **Open the .env file in your editor**

2. **Replace the empty values with your Firebase config:**

   ```env
   FIREBASE_API_KEY=AIzaSyC...your_actual_key
   FIREBASE_AUTH_DOMAIN=job-market-copilot-xxxxx.firebaseapp.com
   FIREBASE_PROJECT_ID=job-market-copilot-xxxxx
   FIREBASE_STORAGE_BUCKET=job-market-copilot-xxxxx.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=123456789012
   FIREBASE_APP_ID=1:123456789012:web:abcdef123456
   ```

3. **Save the file**

4. **Test it:**
   ```bash
   npm run test:firebase
   ```

   ✅ You should see: **"Firebase configuration is complete!"**

---

## Step 3: Enable Firebase Services

Now that your app is connected, enable the services you need:

### 3A. Enable Authentication

1. **In Firebase Console**, click **"Build"** in the left sidebar
2. Click **"Authentication"**
3. Click **"Get started"** button
4. Go to **"Sign-in method"** tab
5. **Enable Phone Authentication:**
   - Click on **"Phone"**
   - Toggle the switch to **Enable**
   - Click **"Save"**
   
6. **Enable Email/Password (backup method):**
   - Click on **"Email/Password"**
   - Toggle the first switch to **Enable** (not the "Email link" one)
   - Click **"Save"**

### 3B. Create Firestore Database

1. **In Firebase Console**, click **"Firestore Database"** (under Build)
2. Click **"Create database"** button
3. **Choose location:**
   - For UAE/Gulf users: Select **`asia-south1` (Mumbai)**
   - Or choose region closest to your target users
   - Click **"Next"**

4. **Start in production mode:**
   - Select **"Start in production mode"**
   - Click **"Enable"**
   - Wait ~1 minute for database creation

---

## Step 4: Deploy Security Rules & Indexes

Now deploy the security rules and indexes we've created:

### 4A. Install Firebase CLI

```bash
npm install -g firebase-tools
```

Verify installation:
```bash
firebase --version
```

### 4B. Login to Firebase

```bash
firebase login
```

This will open a browser window. Login with the same Google account you used for Firebase Console.

### 4C. Initialize Firebase in Your Project

```bash
firebase init
```

**Answer the prompts:**

1. **"Which Firebase features do you want to set up?"**
   - Use arrow keys to move
   - Press SPACE to select **Firestore**
   - Press ENTER to confirm

2. **"Select a default Firebase project"**
   - Select **"Use an existing project"**
   - Choose **"job-market-copilot"** from the list
   - Press ENTER

3. **"What file should be used for Firestore Rules?"**
   - Just press ENTER (accepts default: `firestore.rules`)
   - We already created this file!

4. **"What file should be used for Firestore indexes?"**
   - Just press ENTER (accepts default: `firestore.indexes.json`)
   - We already created this file!

This creates a `firebase.json` config file.

### 4D. Deploy Everything to Firebase

```bash
firebase deploy --only firestore
```

✅ You should see:
```
✔  Deploy complete!
```

---

## Step 5: Verify Everything Works

### 5A. Check Firebase Console

1. **Verify Security Rules:**
   - Firebase Console → **Firestore Database** → **Rules** tab
   - You should see your deployed rules
   - Status: **Published** with timestamp

2. **Verify Indexes:**
   - Firebase Console → **Firestore Database** → **Indexes** tab
   - You should see 4 composite indexes:
     - `jobPostings` (trade, country, active)
     - `jobPostings` (trade, country, active, postedAt)
     - `certifications` (trade, country)
     - `interviewPrep` (trade, order)
   - Status will be **"Building"** then **"Enabled"** (takes 1-5 minutes)

### 5B. Test Your App

```bash
npm start
```

- Press `i` for iOS simulator
- Press `a` for Android emulator  
- Or scan QR code with Expo Go app

✅ **Expected result:**
- No Firebase errors in terminal
- App loads and shows "TradeMatch - Coming Soon"

---

## ✅ Success Checklist

Mark each item as you complete it:

- [ ] Firebase web app added to project
- [ ] Configuration copied to `.env` file
- [ ] `npm run test:firebase` passes
- [ ] Authentication enabled (Phone + Email)
- [ ] Firestore database created
- [ ] Firebase CLI installed
- [ ] Logged in: `firebase login`
- [ ] Project initialized: `firebase init`
- [ ] Rules deployed successfully
- [ ] Indexes deployed and building/enabled
- [ ] App starts without Firebase errors

---

## 🎯 What's Next?

Once all the above is complete, you're ready to start building!

**Next development steps (per phases.md):**

1. ✅ Firebase connected and working
2. ➡️ **Build authentication flow** (`/app/(auth)`)
3. ➡️ **Build profile builder** (`/app/(tabs)/profile`)
4. ➡️ **Build certification checklist**
5. ➡️ **Build job matching**
6. ➡️ **Build interview prep**

---

## 🆘 Troubleshooting

### "Can't find my Firebase config"

**Solution:**
1. Firebase Console → Click gear icon (⚙️) → **Project settings**
2. Scroll down to **"Your apps"** section
3. You should see your web app
4. If not, click **"Add app"** → Web icon → Register new app

### "npm run test:firebase fails"

**Solution:**
- Check that `.env` values exactly match Firebase Console
- No spaces around the `=` sign
- No quotes around values
- Run test again: `npm run test:firebase`

### "Permission denied" when using app

**Solution:**
```bash
firebase deploy --only firestore:rules
```

### "Index required" error

**Solution:**
```bash
firebase deploy --only firestore:indexes
```
Then wait 1-5 minutes for indexes to build.

---

## 📞 Quick Commands Reference

```bash
# Test Firebase connection
npm run test:firebase

# Interactive config setup
npm run setup:firebase

# Deploy rules and indexes
firebase deploy --only firestore

# Start app
npm start

# View Firebase project
firebase open
```

---

**Last Updated:** September 11, 2026  
**Your Firebase Project:** job-market-copilot  
**Status:** Ready to connect! 🚀
