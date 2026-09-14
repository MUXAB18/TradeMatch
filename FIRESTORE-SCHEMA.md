# Firestore Schema Documentation

## Overview

This document describes the Firestore data model for TradeMatch, as defined in `architecture.md` Section 3.

**CRITICAL:** The TypeScript types in `/types/index.ts` must match these field names exactly. Any mismatch causes silent bugs since Firestore is schemaless.

---

## Collections

### 1. `users/{userId}`

Stores user profiles. Each document ID is the Firebase Auth UID.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | User's full name |
| `phone` | string | Yes | Phone number (used for auth) |
| `email` | string | No | Email address (optional) |
| `trade` | string | Yes | Trade/profession (e.g., "electrician") |
| `country` | string | Yes | Country code or name |
| `yearsExperience` | number | Yes | Years of experience in trade |
| `skills` | string[] | Yes | Array of skill names |
| `availability` | string | Yes | Availability status (e.g., "immediate", "2-weeks-notice") |
| `location` | GeoPoint | Yes | Geographic location |
| `certifications` | string[] | Yes | Array of certification IDs the user has |
| `createdAt` | Timestamp | Yes | Document creation timestamp |
| `updatedAt` | Timestamp | Yes | Last update timestamp |

**Security:**
- Users can only read/write their own document (userId matches auth.uid)
- Create requires both `createdAt` and `updatedAt` set to `request.time`
- Update requires `updatedAt` set to `request.time`

---

### 2. `certifications/{certId}`

Stores certification/license requirements per trade and country.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Certification name |
| `trade` | string | Yes | Applicable trade |
| `country` | string | Yes | Applicable country |
| `description` | string | Yes | Why this certification matters |
| `required` | boolean | Yes | Whether certification is required vs. optional |

**Security:**
- Read-only for authenticated users
- Writes are admin-only (via Firebase Console at MVP stage)

**Indexes:**
- Composite: `trade` + `country` (ascending)

---

### 3. `jobPostings/{jobId}`

Stores job postings (manually curated at MVP stage).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | string | Yes | Job title |
| `trade` | string | Yes | Required trade |
| `country` | string | Yes | Job location country |
| `location` | GeoPoint | Yes | Exact job location |
| `requiredSkills` | string[] | Yes | Required skills |
| `requiredCerts` | string[] | Yes | Required certification IDs |
| `postedBy` | string | Yes | Source/poster (manually entered at MVP) |
| `postedAt` | Timestamp | Yes | Posting date |
| `active` | boolean | Yes | Whether posting is still active |

**Security:**
- Read-only for authenticated users
- Writes are admin-only (via Firebase Console at MVP stage)

**Indexes:**
- Composite: `trade` + `country` + `active` (all ascending)
- Composite: `trade` + `country` + `active` + `postedAt` (descending for recent-first sorting)

**Query Example:**
```typescript
// Per architecture.md Section 4.3
const q = query(
  collection(db, 'jobPostings'),
  where('trade', '==', userTrade),
  where('country', '==', userCountry),
  where('active', '==', true)
);
```

---

### 4. `interviewPrep/{cardId}`

Stores interview preparation flashcards per trade.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `trade` | string | Yes | Applicable trade |
| `question` | string | Yes | Interview question |
| `answer` | string | Yes | Sample answer |
| `order` | number | Yes | Display order |

**Security:**
- Read-only for authenticated users
- Writes are admin-only (via Firebase Console at MVP stage)

**Indexes:**
- Composite: `trade` + `order` (ascending)

**Query Example:**
```typescript
// Per architecture.md Section 4.5
const q = query(
  collection(db, 'interviewPrep'),
  where('trade', '==', userTrade),
  orderBy('order', 'asc')
);
```

---

## Security Rules Summary

Per `architecture.md` Section 5:

| Collection | Read | Write |
|------------|------|-------|
| `users/{userId}` | Owner only | Owner only (with timestamp validation) |
| `jobPostings` | Authenticated users | Admin-only (false at client) |
| `certifications` | Authenticated users | Admin-only (false at client) |
| `interviewPrep` | Authenticated users | Admin-only (false at client) |

---

## Deployment Instructions

### 1. Initialize Firebase in Your Project

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firestore in this project
firebase init firestore
```

When prompted:
- Select your Firebase project
- Accept default `firestore.rules` file
- Accept default `firestore.indexes.json` file

### 2. Deploy Security Rules

```bash
firebase deploy --only firestore:rules
```

### 3. Deploy Indexes

```bash
firebase deploy --only firestore:indexes
```

Or deploy both at once:

```bash
firebase deploy --only firestore
```

### 4. Verify Deployment

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Firestore Database** → **Rules**
4. Verify rules match `firestore.rules`
5. Navigate to **Firestore Database** → **Indexes**
6. Verify composite indexes are created or building

---

## Type Safety Verification

The TypeScript types in `/types/index.ts` have been verified to match the schema exactly:

✅ **User interface** - All 12 required fields match  
✅ **Certification interface** - All 5 required fields match  
✅ **JobPosting interface** - All 9 required fields match  
✅ **InterviewPrepCard interface** - All 4 required fields match  

**Field name validation:**
- `yearsExperience` (camelCase) - matches schema ✅
- `requiredSkills` (camelCase) - matches schema ✅
- `requiredCerts` (camelCase) - matches schema ✅
- `postedBy` (camelCase) - matches schema ✅
- `postedAt` (camelCase) - matches schema ✅
- `createdAt` (camelCase) - matches schema ✅
- `updatedAt` (camelCase) - matches schema ✅

---

## Common Pitfalls

❌ **Don't do this:**
```typescript
// Wrong: Using different field names
const user = {
  full_name: "John",  // Should be "name"
  years_of_experience: 5  // Should be "yearsExperience"
}
```

✅ **Do this:**
```typescript
// Correct: Use exact field names from types/index.ts
const user: User = {
  name: "John",
  yearsExperience: 5,
  // ... other fields
}
```

---

## Adding New Fields

If you need to add new fields:

1. Update `architecture.md` Section 3 first (source of truth)
2. Update `/types/index.ts` to match
3. Update `firestore.rules` if validation is needed
4. Add indexes to `firestore.indexes.json` if querying on new fields
5. Deploy: `firebase deploy --only firestore`

---

## Admin Data Population (MVP Stage)

Per `architecture.md`, during MVP:
- `jobPostings`, `certifications`, and `interviewPrep` are populated manually
- Use Firebase Console to add documents
- Or create a one-time admin script (not included in client app)

Post-MVP, an admin dashboard will be built per `phases.md` Phase 4.

---

**Last Updated:** September 11, 2026  
**Status:** Schema Complete - Ready for Firebase Deployment
