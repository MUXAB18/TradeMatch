<div align="center">

<img src="https://img.shields.io/badge/TradeMatch-0064DC?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyQzYuNDggMiAyIDYuNDggMiAxMnM0LjQ4IDEwIDEwIDEwIDEwLTQuNDggMTAtMTBTMTcuNTIgMiAxMiAyem0tMSAxNEg5VjhIMTF2OHptNCAwaC0yVjhoMnY4eiIvPjwvc3ZnPg==&logoColor=white" alt="TradeMatch" />

# TradeMatch

### The AI-Powered Job Copilot for Skilled Trades Workers

**Connect qualified tradespeople with the right opportunities — globally.**

[![Next.js](https://img.shields.io/badge/Next.js-16.x-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2057-000020?style=flat-square&logo=expo)](https://expo.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%7C%20Auth%20%7C%20Storage-FFCA28?style=flat-square&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## 🔧 What is TradeMatch?

TradeMatch is a **full-stack, cross-platform job-matching platform** purpose-built for the **skilled trades workforce** — electricians, plumbers, HVAC technicians, carpenters, welders, and more. Unlike generic job boards designed for white-collar professionals, TradeMatch speaks the language of tradespeople and the staffing agencies that hire them.

> **The problem:** Qualified tradespeople struggle to present themselves professionally and find the right opportunities. Staffing agencies waste hours manually screening unqualified candidates. TradeMatch bridges this gap.

---

## ✨ Key Features

### 👷 For Workers (Mobile App)
| Feature | Description |
|---|---|
| **Smart Profile Builder** | Step-by-step guided profile creation with trade, skills, certifications, experience, and availability |
| **Document Verification** | Submit government ID and professional trade certificates for admin verification |
| **Job Matching** | Browse and apply to curated job postings matched to your trade and location |
| **Certification Tracker** | Know exactly which licenses/certs are required for your target country and which you're missing |
| **Interview Prep** | Trade-specific flashcard Q&A to prepare for job interviews |
| **CV Export** | Generate a professional PDF résumé from your profile with one tap |
| **Push Notifications** | Real-time alerts for job matches, verification updates, and platform announcements |
| **Multilingual Support** | Full i18n support (English + Arabic) for Gulf market workers |

### 🏢 For Agencies (Web Platform)
| Feature | Description |
|---|---|
| **Agency Dashboard** | Browse and shortlist pre-verified candidate profiles |
| **Company Registration** | Register your company with full onboarding details and business license upload |
| **Job Posting Management** | Create and manage job listings with salary details, required skills, and location |
| **Candidate Pipeline** | Track applicants through your hiring pipeline |
| **Direct Contact** | Access contact details of verified, qualified candidates |

### 🛡️ Admin Panel (Web)
| Feature | Description |
|---|---|
| **Verification Center** | Full-page side-by-side review and approve/reject for worker identity and trade certificates |
| **User Management** | Manage workers and agencies with search, filter, and status controls |
| **Job Management** | Create, edit, activate, and remove job postings platform-wide |
| **CMS** | Manage certifications database and interview prep content |
| **Promotions & Campaigns** | Schedule and broadcast targeted promotional banners to workers or agencies |
| **Push Notifications** | Send targeted system notifications with priority levels |
| **Platform Settings** | Control maintenance mode, feature flags, taxonomy (trades, skills, countries) |
| **Audit Log** | Full audit trail of all admin actions |
| **Analytics Dashboard** | Real-time platform stats with charts |

---

## 🏗️ Architecture

TradeMatch is a **monorepo** containing two separate applications sharing Firebase as a common backend.

```
TradeMatch/
├── apps/
│   ├── mobile/          # React Native (Expo) — iOS & Android
│   └── web/             # Next.js 16 — Admin Panel + Agency Web Platform
├── prd.md               # Product Requirements Document
├── architecture.md      # System Architecture
└── design.md            # Design System
```

### System Overview

```
┌──────────────────────┐      ┌──────────────────────┐
│  Mobile App (Expo)   │      │   Web App (Next.js)  │
│  iOS + Android       │      │  Admin + Agency       │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           └──────────────┬──────────────┘
                          │ Firebase SDK
                          ▼
           ┌──────────────────────────────┐
           │           Firebase            │
           │  ┌─────────┐  ┌──────────┐  │
           │  │  Auth   │  │Firestore │  │
           │  └─────────┘  └──────────┘  │
           │  ┌─────────┐  ┌──────────┐  │
           │  │ Storage │  │   FCM    │  │
           │  └─────────┘  └──────────┘  │
           └──────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Mobile (`apps/mobile`)
| Layer | Technology |
|---|---|
| Framework | **React Native** + **Expo SDK 57** |
| Navigation | **Expo Router** (file-based routing) |
| Auth | **Firebase Authentication** (email + phone/OTP) |
| Database | **Cloud Firestore** |
| Storage | **Firebase Storage** |
| Push Notifications | **Expo Notifications** + FCM |
| Animations | **React Native Reanimated** + Lottie |
| Localization | **i18next** + react-i18next |
| PDF Export | **expo-print** + expo-sharing |
| UI Components | Custom components with expo-linear-gradient, expo-blur |

### Web (`apps/web`)
| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) |
| Language | **TypeScript 5** |
| Styling | **Tailwind CSS** + Vanilla CSS |
| Auth | **Firebase Authentication** |
| Database | **Cloud Firestore** |
| Storage | **Firebase Storage** |
| Charts | **Recharts** |
| Icons | **Lucide React** |
| Notifications | Toast system + real-time Firestore listener |

---

## 🗂️ Firestore Data Model

```
users/                        # All users (workers + agencies)
  {uid}/
    name, email, role, trade, country
    verificationStatus: { identity, certificate }
    accountStatus, adminStatus

agencies/                     # Agency company profiles
  {uid}/
    companyName, businessEmail, industry
    country, address, website
    hiringTrades[], hiringCountries[]
    businessLicenseUrl

jobPostings/                  # Job listings
  {jobId}/
    title, company, trade, location
    salary, description, requirements[]
    active, postedAt, agencyId

certifications/               # Certification content (CMS)
interviewPrep/                # Interview flashcards (CMS)
adminNotifications/           # Platform-wide push notifications
promotions/                   # In-app promotional banners
platform_settings/            # Taxonomy, feature flags, maintenance mode
auditLog/                     # Admin action audit trail
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo`)
- Firebase project with Firestore, Auth, and Storage enabled

### 1. Clone the Repository
```bash
git clone https://github.com/MUXAB18/TradeMatch.git
cd TradeMatch
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install mobile dependencies
cd apps/mobile && npm install

# Install web dependencies
cd ../web && npm install
```

### 3. Configure Firebase

**Mobile** — create `apps/mobile/.env` or update `apps/mobile/services/firebase.ts`:
```env
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

**Web** — create `apps/web/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 4. Run the Apps

**Mobile (Expo):**
```bash
cd apps/mobile
npx expo start
```
Scan the QR code with Expo Go on your phone, or press `i` for iOS Simulator / `a` for Android Emulator.

**Web (Next.js):**
```bash
cd apps/web
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

**Admin Panel:**
Navigate to [http://localhost:3000/en/admin](http://localhost:3000/en/admin)

---

## 📱 App Screens

### Mobile
| Screen | Description |
|---|---|
| **Onboarding** | Multi-step profile builder with progress tracking |
| **Home** | Personalized dashboard with active promotions, quick actions |
| **Jobs** | Job listings with trade-based filtering and apply flow |
| **Prep** | Interview flashcard deck with swipe gestures |
| **Profile** | Full profile view with CV export and document upload |
| **Settings** | Account, notifications, language, and privacy settings |

### Web
| Route | Description |
|---|---|
| `/` | Public landing page |
| `/agency` | Agency portal (company login & dashboard) |
| `/admin` | Full admin panel (super admin only) |
| `/onboarding` | Worker web onboarding flow |

---

## 🌍 Target Market

TradeMatch is initially focused on the **Gulf Cooperation Council (GCC)** market — one of the world's largest importers of skilled trade labor — with plans to expand globally.

**Target Trades:** Electricians, Plumbers, HVAC Technicians, Carpenters, Welders, General Laborers, Drivers, and more.

**Target Countries:** UAE, Saudi Arabia, Qatar, Kuwait, Bahrain, Oman

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

**Built with ❤️ for the global trades workforce**

[GitHub](https://github.com/MUXAB18/TradeMatch) · [Report Bug](https://github.com/MUXAB18/TradeMatch/issues) · [Request Feature](https://github.com/MUXAB18/TradeMatch/issues)

</div>
