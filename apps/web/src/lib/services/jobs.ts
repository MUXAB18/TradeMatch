import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { JobPosting } from '@/types';

/**
 * Fetch active job postings for a given trade and country
 */
export async function getActiveJobs(trade: string, country: string): Promise<(JobPosting & { id: string })[]> {
  try {
    const jobsRef = collection(db, 'jobPostings');
    const q = query(
      jobsRef,
      where('trade', '==', trade),
      where('country', '==', country),
      where('active', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as (JobPosting & { id: string })[];
  } catch (error) {
    console.error('Error fetching jobs:', error);
    throw new Error('Failed to load jobs. Check your connection and try again.');
  }
}
