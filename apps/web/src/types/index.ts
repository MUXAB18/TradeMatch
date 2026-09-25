/**
 * TypeScript type definitions for TradeMatch
 * Per architecture.md Section 3 - Data Model
 *
 * CRITICAL: Field names must match Firestore exactly to prevent silent bugs.
 * Any changes here must be reflected in architecture.md first.
 */

import { Timestamp, GeoPoint } from 'firebase/firestore';

/* ─── Verification ─────────────────────────────────────────────────────── */

export type VerificationState =
  | 'unverified'   // not submitted
  | 'submitted'    // candidate submitted, pending admin review
  | 'verified'     // admin confirmed
  | 'rejected'     // admin rejected
  | 'attention';   // previously verified, now requires re-submission

export interface VerificationStatus {
  identity: VerificationState;
  certificate: VerificationState;
  experience: VerificationState;
}

/* ─── Agency Profile (embedded in User doc for agency role) ─────────────── */

export interface AgencyProfile {
  companyName: string;
  website?: string;
  businessEmail?: string;
  hiringTrades: string[];       // trades they recruit for
  hiringCountries: string[];    // countries they place workers in
  verifiedAgency: boolean;      // admin-confirmed agency
  subscriptionTier?: 'free' | 'basic' | 'pro'; // BACKEND REQUIRED: billing
}

/* ─── User Profile — users collection ──────────────────────────────────── */
// Path: users/{userId}
//
// Field names match architecture.md Section 3 exactly:
// - role: 'worker' | 'agency'
// - name: string
// - phone: string
// - email: string (optional)
// - trade: string
// - country: string
// - city: string (optional)
// - yearsExperience: number
// - skills: array<string>
// - availability: string
// - location: geopoint
// - certifications: array<string> (cert IDs the user has)
// - languages: array<string>
// - preferredCountries: array<string> (countries worker wants to work in)
// - profilePhotoUrl: string (optional)
// - verificationStatus: VerificationStatus
// - agencyProfile: AgencyProfile (only for role === 'agency')
// - pushToken: string (optional)
// - notificationPreferences: object (optional)
// - onboardingCompleted: boolean
// - createdAt: timestamp
// - updatedAt: timestamp

export interface User {
  // Core identity
  uid?: string;
  id?: string;
  role: 'worker' | 'agency';
  accountStatus?: 'pending' | 'approved' | 'suspended';
  name: string;
  phone: string;
  email?: string;
  profilePhotoUrl?: string;

  // Location
  country: string;
  city?: string;
  location: GeoPoint;

  // Worker-specific
  trade: string;
  yearsExperience: number;
  skills: string[];
  certifications: string[];
  languages?: string[];
  preferredCountries?: string[];
  availability: string; // 'immediate' | 'available_soon' | 'employed'

  // Trust layer — never fabricate, only read from Firestore
  verificationStatus?: VerificationStatus;

  // Agency-specific (only populated when role === 'agency')
  agencyProfile?: AgencyProfile;

  // App meta
  onboardingCompleted?: boolean;
  pushToken?: string;
  notificationPreferences?: {
    jobMatches: boolean;
    certReminders: boolean;
    profileNudges: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/* ─── Certification — certifications collection ─────────────────────────── */
// Path: certifications/{certId}

export interface Certification {
  id?: string;
  name: string;
  trade: string;
  country: string;
  description: string;
  required: boolean;
}

/* ─── User Certificate (worker's uploaded cert) ─────────────────────────── */
// Path: users/{userId}/userCertificates/{certId}

export interface UserCertificate {
  id?: string;
  name: string;
  issuingOrganization?: string;
  issueDate?: string;
  fileUrl?: string;       // Storage URL
  verificationState: VerificationState;
  uploadedAt: Timestamp;
}

/* ─── Job Posting — jobPostings collection ──────────────────────────────── */
// Path: jobPostings/{jobId}

export interface JobPosting {
  id?: string;
  title: string;
  trade: string;
  country: string;
  location: GeoPoint;
  requiredSkills: string[];
  requiredCerts: string[];
  postedBy: string;
  postedAt: Timestamp;
  active: boolean;
  // Additional display fields
  description?: string;
  company?: string;
  salary?: string;
  jobType?: string;
  verifiedRecruiter?: boolean; // BACKEND REQUIRED: admin-verified agency
}

/* ─── Interview Prep Card — interviewPrep collection ────────────────────── */
// Path: interviewPrep/{cardId}

export interface InterviewPrepCard {
  id?: string;
  trade: string;
  question: string;
  answer: string;
  order: number;
}

/* ─── Shortlist — shortlists collection ─────────────────────────────────── */
// Path: shortlists/{agencyId}/candidates/{workerId}

export interface ShortlistEntry {
  id?: string;
  workerId: string;
  workerName: string;
  workerTrade: string;
  notes?: string;
  createdAt: Timestamp;
}

/* ─── Service layer return types ─────────────────────────────────────────── */

export interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

/* ─── Utility types ──────────────────────────────────────────────────────── */

export type UserUpdate = Partial<Omit<User, 'createdAt' | 'updatedAt'>>;
export type JobPostingUpdate = Partial<Omit<JobPosting, 'postedAt'>>;
export type CertificationUpdate = Partial<Certification>;
export type InterviewPrepCardUpdate = Partial<InterviewPrepCard>;

/* ─── Trade constants ────────────────────────────────────────────────────── */

export const TRADES = [
  { id: 'electrician',  label: 'Electrician',      emoji: '⚡' },
  { id: 'welder',       label: 'Welder',            emoji: '🔥' },
  { id: 'hvac',         label: 'HVAC Technician',   emoji: '❄️' },
  { id: 'mechanic',     label: 'Mechanic',          emoji: '🔧' },
  { id: 'plumber',      label: 'Plumber',           emoji: '🚰' },
  { id: 'mason',        label: 'Mason',             emoji: '🧱' },
  { id: 'carpenter',    label: 'Carpenter',         emoji: '🪚' },
  { id: 'painter',      label: 'Painter',           emoji: '🎨' },
  { id: 'technician',   label: 'Technician',        emoji: '🖥️' },
  { id: 'other',        label: 'Other Trade',       emoji: '⚙️' },
] as const;

export const GULF_COUNTRIES = ['UAE', 'Saudi Arabia', 'Qatar', 'Oman', 'Kuwait', 'Bahrain'];

export const ORIGIN_COUNTRIES = [
  'Pakistan', 'India', 'Bangladesh', 'Nepal', 'Sri Lanka',
  'Philippines', 'Indonesia', 'Egypt', 'Ethiopia', 'Other',
];

export const EXPERIENCE_OPTIONS = [
  { value: 0,  label: 'Less than 1 year' },
  { value: 2,  label: '1–3 years' },
  { value: 4,  label: '3–5 years' },
  { value: 7,  label: '5–10 years' },
  { value: 10, label: '10+ years' },
];
