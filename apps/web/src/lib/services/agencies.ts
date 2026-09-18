import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AgencyProfile } from '@/types';

export interface AgencyDoc {
  companyName: string;
  contactName: string;
  businessEmail?: string;
  phone?: string;
  country: string;
  hiringTrades: string[];
  hiringCountries: string[];
  website?: string;
  city?: string;
  address?: string;
  verifiedAgency: boolean;
  subscriptionTier: 'free' | 'basic' | 'pro';
  verificationDocUrl?: string; // BACKEND REQUIRED: Storage + admin review
  businessLicenseUrl?: string;
  createdAt: any;
  updatedAt: any;
}

/**
 * Fetch an agency's extended profile from Firestore
 * Path: agencies/{userId}
 */
export async function getAgencyProfile(userId: string): Promise<AgencyDoc | null> {
  try {
    const ref = doc(db, 'agencies', userId);
    const snap = await getDoc(ref);
    if (snap.exists()) return snap.data() as AgencyDoc;
    return null;
  } catch (error) {
    console.error('Error fetching agency profile:', error);
    return null;
  }
}

/**
 * Create or update an agency profile
 * Path: agencies/{userId}
 */
export async function updateAgencyProfile(
  userId: string,
  data: Partial<AgencyDoc>
): Promise<void> {
  try {
    const ref = doc(db, 'agencies', userId);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
    } else {
      await setDoc(ref, {
        companyName: '',
        contactName: '',
        country: '',
        hiringTrades: [],
        hiringCountries: [],
        verifiedAgency: false,
        subscriptionTier: 'free',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...data,
      });
    }
  } catch (error) {
    console.error('Error updating agency profile:', error);
    throw new Error('Failed to save agency profile.');
  }
}
