/**
 * User service - handles all Firestore operations for user profiles
 * Per rules.md Section 1: Components never call Firestore directly
 */

import { db, auth } from './firebase';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  GeoPoint,
  collection,
  addDoc,
} from 'firebase/firestore';
import { User, UserUpdate, ServiceResponse } from '../types';

/**
 * Create a new user profile in Firestore
 * Per architecture.md Section 3: includes all required fields with timestamps
 */
export async function createUserProfile(
  userId: string,
  data: {
    name: string;
    phone: string;
    email?: string;
    trade: string;
    country: string;
    latitude: number;
    longitude: number;
  }
): Promise<ServiceResponse<User>> {
  try {
    const userRef = doc(db, 'users', userId);

    const userData: Omit<User, 'createdAt' | 'updatedAt'> & {
      createdAt: ReturnType<typeof serverTimestamp>;
      updatedAt: ReturnType<typeof serverTimestamp>;
    } = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      trade: data.trade,
      country: data.country,
      yearsExperience: 0, // Will be set in profile builder
      skills: [], // Will be set in profile builder
      availability: 'immediate', // Default value
      location: new GeoPoint(data.latitude, data.longitude),
      certifications: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    await setDoc(userRef, userData);

    // Return the created user (note: timestamps will be null until read back)
    return {
      data: userData as unknown as User,
    };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create user profile. Please try again.',
    };
  }
}

/**
 * Get a user profile by ID
 */
export async function getUserProfile(
  userId: string
): Promise<ServiceResponse<User>> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return {
        error: 'User profile not found',
      };
    }

    return {
      data: userSnap.data() as User,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load user profile. Please try again.',
    };
  }
}

/**
 * Update an existing user profile
 * Per architecture.md Section 3: updates include updatedAt timestamp
 */
export async function updateUserProfile(
  userId: string,
  updates: UserUpdate
): Promise<ServiceResponse<void>> {
  try {
    const userRef = doc(db, 'users', userId);

    await updateDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });

    return {};
  } catch (error) {
    console.error('Error updating user profile:', error);
    return {
      error:
        error instanceof Error
          ? error.message
          : 'Failed to update profile. Please try again.',
    };
  }
}

/**
 * Check if a user profile exists
 */
export async function userProfileExists(userId: string): Promise<boolean> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    return userSnap.exists();
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
}

/**
 * Get current authenticated user ID
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}

/**
 * Log user interest for trades not yet live in the app
 * Used for demand capture (Phase 5 expansion gating)
 */
export async function logTradeInterest(
  userId: string,
  tradeId: string
): Promise<ServiceResponse<void>> {
  try {
    const interestRef = collection(db, 'tradeInterest');
    await addDoc(interestRef, {
      userId,
      trade: tradeId,
      timestamp: serverTimestamp(),
    });
    return {};
  } catch (error) {
    console.error('Error logging trade interest:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to log interest.',
    };
  }
}

/**
 * Log user interest for countries not yet live in the app
 * Used for demand capture (Phase 5 expansion gating)
 */
export async function logCountryInterest(
  userId: string,
  countryId: string
): Promise<ServiceResponse<void>> {
  try {
    const interestRef = collection(db, 'countryInterest');
    await addDoc(interestRef, {
      userId,
      country: countryId,
      timestamp: serverTimestamp(),
    });
    return {};
  } catch (error) {
    console.error('Error logging country interest:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to log country interest.',
    };
  }
}

