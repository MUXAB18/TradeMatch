/**
 * TypeScript type definitions for TradeMatch
 * Per architecture.md Section 3 - Data Model
 *
 * CRITICAL: Field names must match Firestore exactly to prevent silent bugs.
 * Any changes here must be reflected in architecture.md first.
 */

import { Timestamp, GeoPoint } from 'firebase/firestore';

/**
 * User Profile - users collection
 * Path: users/{userId}
 *
 * Field names match architecture.md Section 3 exactly:
 * - name: string
 * - phone: string
 * - email: string (optional)
 * - trade: string
 * - country: string
 * - yearsExperience: number
 * - skills: array<string>
 * - availability: string
 * - location: geopoint
 * - certifications: array<string> (cert IDs the user has)
 * - pushToken: string (optional) - Expo push notification token
 * - notificationPreferences: object (optional) - User notification settings
 * - createdAt: timestamp
 * - updatedAt: timestamp
 */
export interface User {
  name: string;
  phone: string;
  email?: string;
  trade: string;
  country: string;
  yearsExperience: number;
  skills: string[];
  availability: string;
  location: GeoPoint;
  certifications: string[];
  photoURL?: string;
  pushToken?: string;
  notificationPreferences?: {
    jobMatches: boolean;
    certReminders: boolean;
    profileNudges: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Certification - certifications collection
 * Path: certifications/{certId}
 *
 * Field names match architecture.md Section 3 exactly:
 * - name: string
 * - trade: string
 * - country: string
 * - description: string
 * - required: boolean
 */
export interface Certification {
  id?: string; // Document ID, included when fetched
  name: string;
  trade: string;
  country: string;
  description: string;
  required: boolean;
}

/**
 * Job Posting - jobPostings collection
 * Path: jobPostings/{jobId}
 *
 * Field names match architecture.md Section 3 exactly:
 * - title: string
 * - trade: string
 * - country: string
 * - location: geopoint
 * - requiredSkills: array<string>
 * - requiredCerts: array<string>
 * - postedBy: string
 * - postedAt: timestamp
 * - active: boolean
 */
export interface JobPosting {
  id?: string; // Document ID, included when fetched
  title: string;
  trade: string;
  country: string;
  location: GeoPoint;
  requiredSkills: string[];
  requiredCerts: string[];
  postedBy: string;
  postedAt: Timestamp;
  active: boolean;
  // Additional fields for display
  description?: string;
  company?: string;
  salary?: string;
}

/**
 * Interview Prep Card - interviewPrep collection
 * Path: interviewPrep/{cardId}
 *
 * Field names match architecture.md Section 3 exactly:
 * - trade: string
 * - question: string
 * - answer: string
 * - order: number
 */
export interface InterviewPrepCard {
  id?: string; // Document ID, included when fetched
  trade: string;
  question: string;
  answer: string;
  order: number;
}

/**
 * Service layer return types
 */
export interface ServiceResponse<T> {
  data?: T;
  error?: string;
}

/**
 * Utility types for partial updates (excluding timestamps)
 */
export type UserUpdate = Partial<Omit<User, 'createdAt' | 'updatedAt'>>;
export type JobPostingUpdate = Partial<Omit<JobPosting, 'postedAt'>>;
export type CertificationUpdate = Partial<Certification>;
export type InterviewPrepCardUpdate = Partial<InterviewPrepCard>;
