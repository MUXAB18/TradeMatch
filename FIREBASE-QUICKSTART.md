# 🚀 Firebase Quick Start

**Get Firebase connected in 5 minutes!**

---

## Option 1: Automated Setup (Recommended)

Run the interactive setup script:

```bash
npm run setup:firebase
```

This will prompt you for your Firebase credentials and automatically update your `.env` file.

---

## Option 2: Manual Setup

### Step 1: Get Firebase Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project or select existing
3. Click **Web icon** (`</>`) → Register app → Copy config

### Step 2: Update .env File

Open `.env` and paste your values:

```env
FIREBASE_API_KEY=your_key_here
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=123456789
FIREBASE_APP_ID=1:123456789:web:abc123
```

### Step 3: Test Connection

```bash
npm run test:firebase
```

You should see: ✅ Firebase configuration is complete!

---

## Next: Enable Firebase Services

### Enable Authentication

1. Firebase Console → **Authentication** → **Get started**
2. **Sign-in method** tab
3. Enable **Phone** and **Email/Password**

### Create Firestore Database

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose your region (e.g., `asia-south1` for UAE)
3. Start in **production mode**

---

## Deploy Rules & Indexes

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Initialize
firebase init firestore

# Deploy
firebase deploy --only firestore
```

---

## Verify Everything

```bash
# Test Firebase config
npm run test:firebase

# Verify schema
npm run verify:schema

# Start app
npm start
```

---

## 📚 Detailed Guides

- **FIREBASE-SETUP-GUIDE.md** - Complete step-by-step guide
- **FIREBASE-DEPLOYMENT.md** - Rules and indexes deployment
- **FIRESTORE-SCHEMA.md** - Database schema reference

---

## ❓ Troubleshooting

**Can't find Firebase config?**
- Firebase Console → Project Settings (gear icon) → Scroll to "Your apps"

**Test fails?**
- Double-check `.env` values match Firebase Console exactly
- No spaces or quotes around values

**Permission denied errors?**
- Deploy security rules: `firebase deploy --only firestore:rules`

---

## ✅ Success Checklist

- [ ] Firebase credentials in `.env`
- [ ] `npm run test:firebase` passes
- [ ] Authentication enabled (Phone + Email)
- [ ] Firestore database created
- [ ] Rules deployed
- [ ] Indexes deployed
- [ ] `npm start` works without errors

---

**Quick Links:**
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Docs](https://firebase.google.com/docs)

---

**Need detailed help?** See `FIREBASE-SETUP-GUIDE.md`
