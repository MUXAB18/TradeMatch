import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Certification } from '@/types';

/**
 * Fetch certifications for a given trade and country
 */
export async function getCertifications(trade: string, country: string): Promise<Certification[]> {
  try {
    const certsRef = collection(db, 'certifications');
    const q = query(
      certsRef,
      where('trade', '==', trade),
      where('country', '==', country)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Certification[];
  } catch (error) {
    console.error('Error fetching certifications:', error);
    throw new Error('Failed to load certifications. Check your connection and try again.');
  }
}
