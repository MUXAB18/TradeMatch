/**
 * Type definitions for Cloud Functions
 * Mirrors the types from the client app
 */

import { GeoPoint, Timestamp } from 'firebase-admin/firestore';

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
  pushToken?: string;
  notificationPreferences?: {
    jobMatches: boolean;
    certReminders: boolean;
    profileNudges: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface JobPosting {
  title: string;
  trade: string;
  country: string;
  location: GeoPoint;
  requiredSkills: string[];
  requiredCerts: string[];
  postedBy: string;
  postedAt: Timestamp;
  active: boolean;
  description?: string;
  company?: string;
  salary?: string;
}

export interface Certification {
  name: string;
  trade: string;
  country: string;
  description: string;
  required: boolean;
}
