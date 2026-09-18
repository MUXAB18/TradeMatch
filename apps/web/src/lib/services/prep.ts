import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { InterviewPrepCard } from '@/types';

/**
 * Fetch interview prep cards for a given trade
 */
export async function getInterviewPrep(trade: string): Promise<InterviewPrepCard[]> {
  try {
    const prepRef = collection(db, 'interviewPrep');
    const q = query(
      prepRef,
      where('trade', '==', trade),
      orderBy('order', 'asc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InterviewPrepCard[];
  } catch (error) {
    console.error('Error fetching interview prep:', error);
    throw new Error('Failed to load interview prep materials. Check your connection and try again.');
  }
}
