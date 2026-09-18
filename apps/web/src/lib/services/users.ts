import {
  doc, getDoc, setDoc, updateDoc, collection,
  query, where, getDocs, orderBy, limit,
  serverTimestamp, GeoPoint, addDoc, deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, UserUpdate, ShortlistEntry } from '@/types';

/**
 * Fetch a user's profile from Firestore
 */
export async function getUserProfile(userId: string): Promise<User | null> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      return userSnap.data() as User;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw new Error('Failed to load profile. Check your connection and try again.');
  }
}

/**
 * Update an existing user's profile or create a new one
 */
export async function updateUserProfile(userId: string, data: UserUpdate): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      await updateDoc(userRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });
    } else {
      const defaultData: Partial<User> = {
        role: 'worker',
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        trade: data.trade || '',
        country: data.country || '',
        city: data.city || '',
        yearsExperience: data.yearsExperience || 0,
        skills: data.skills || [],
        certifications: data.certifications || [],
        languages: data.languages || ['English'],
        preferredCountries: data.preferredCountries || [],
        availability: data.availability || 'immediate',
        location: data.location || new GeoPoint(0, 0),
        onboardingCompleted: false,
        verificationStatus: {
          identity: 'unverified',
          certificate: 'unverified',
          experience: 'unverified',
        },
        createdAt: serverTimestamp() as any,
        updatedAt: serverTimestamp() as any,
      };
      await setDoc(userRef, { ...defaultData, ...data });
    }
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to save profile. Check your connection and try again.');
  }
}

/**
 * Search workers for agency candidate search
 * Returns workers (role === 'worker') with optional filters
 */
export async function getWorkers(filters?: {
  trade?: string;
  country?: string;
  availability?: string;
  maxResults?: number;
}): Promise<(User & { id: string })[]> {
  try {
    const usersRef = collection(db, 'users');
    const constraints: any[] = [where('role', '==', 'worker')];

    if (filters?.trade && filters.trade !== 'all') {
      constraints.push(where('trade', '==', filters.trade));
    }
    if (filters?.country && filters.country !== 'all') {
      constraints.push(where('country', '==', filters.country));
    }
    if (filters?.availability && filters.availability !== 'all') {
      constraints.push(where('availability', '==', filters.availability));
    }

    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(filters?.maxResults || 50));

    const q = query(usersRef, ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as User) }));
  } catch (error) {
    console.error('Error fetching workers:', error);
    // Fallback: try without filters if index missing
    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'worker'),
        limit(50)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...(d.data() as User) }));
    } catch {
      return [];
    }
  }
}

/**
 * Shortlist a worker (agency action)
 * Writes to shortlists/{agencyId}/candidates/{workerId}
 */
export async function shortlistCandidate(
  agencyId: string,
  worker: User & { id: string },
  notes?: string
): Promise<void> {
  const ref = doc(db, 'shortlists', agencyId, 'candidates', worker.id);
  const entry: ShortlistEntry = {
    workerId: worker.id,
    workerName: worker.name,
    workerTrade: worker.trade,
    notes: notes || '',
    createdAt: serverTimestamp() as any,
  };
  await setDoc(ref, entry);
}

/**
 * Remove a worker from an agency's shortlist
 */
export async function removeFromShortlist(agencyId: string, workerId: string): Promise<void> {
  const ref = doc(db, 'shortlists', agencyId, 'candidates', workerId);
  await deleteDoc(ref);
}

/**
 * Get an agency's shortlisted candidates
 */
export async function getShortlist(agencyId: string): Promise<ShortlistEntry[]> {
  try {
    const ref = collection(db, 'shortlists', agencyId, 'candidates');
    const snap = await getDocs(query(ref, orderBy('createdAt', 'desc')));
    return snap.docs.map(d => ({ id: d.id, ...(d.data() as ShortlistEntry) }));
  } catch {
    return [];
  }
}
