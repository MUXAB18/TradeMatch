# Quick Commands Reference

## Start Development

```bash
# First-time setup: Install expo-sharing for CV export
npx expo install expo-sharing

# Start Expo dev server
npm start

# Then press:
i  # iOS simulator
a  # Android emulator
w  # Web browser
```

## Testing & Verification

```bash
# Test Firebase connection
npm run test:firebase

# Verify schema consistency
npm run verify:schema

# Check TypeScript
npm run type-check

# Verify project setup
npm run verify
```

## Seed Data

```bash
# Seed certification data (21 certs: 4 trades × UAE)
npm run seed:certifications

# Seed job postings (27 jobs: 4 trades × UAE)
npm run seed:jobs

# Seed interview questions (30 questions: 2 trades)
npm run seed:interview

# ⚠️ IMPORTANT: Review data after seeding
# - Certifications: verify with licensing authorities
# - Interview questions: review with hiring professionals
```

## Testing

```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test matching.test.ts
```

## Firebase Commands

```bash
# Deploy rules and indexes
firebase deploy --only firestore

# Deploy only rules
firebase deploy --only firestore:rules

# Deploy only indexes
firebase deploy --only firestore:indexes

# View current project
firebase projects:list

# Open Firebase Console
firebase open
```

## Troubleshooting

```bash
# Clear Expo cache
npx expo start --clear

# Reinstall dependencies
rm -rf node_modules
npm install --legacy-peer-deps

# Reset Metro bundler
npx expo start --clear --reset-cache
```

## Documentation

```bash
# Read specific guides
cat ONBOARDING-COMPLETE.md
cat PROFILE-BUILDER-COMPLETE.md
cat CERTIFICATIONS-COMPLETE.md
cat JOB-MATCHING-COMPLETE.md
cat INTERVIEW-PREP-COMPLETE.md
cat TEST-ONBOARDING.md
cat FIREBASE-SETUP-GUIDE.md
cat FIRESTORE-SCHEMA.md
```

## Quick Test

```bash
# 1. Seed all data
npm run seed:certifications
npm run seed:jobs
npm run seed:interview

# 2. Start app
npm start

# 3. Test complete MVP flow
# - Onboarding → Profile → Certifications → Jobs → Interview Prep
```

---

**Current Status:** 🎉 **MVP BUILD COMPLETE (Phase 1)** 🎉  
**All Features:** Onboarding, Profile, Certs, Jobs, Interview Prep, CV Export  
**Next:** Install expo-sharing → Seed data → User Testing (Phase 1 Exit)
