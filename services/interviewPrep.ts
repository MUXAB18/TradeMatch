/**
 * Interview Prep Service
 * Per architecture.md Section 3: Query interviewPrep collection
 * Per rules.md Section 1: All Firestore access through services layer
 */

import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
import { InterviewPrepCard, ServiceResponse } from '../types';

/**
 * Get interview prep cards for a specific trade
 * Per architecture.md: Query interviewPrep where trade == user.trade, ordered by order field
 *
 * @param trade - Trade type (e.g., "electrician")
 * @returns ServiceResponse with array of interview prep cards
 */
export async function getInterviewPrepCards(
  trade: string
): Promise<ServiceResponse<InterviewPrepCard[]>> {
  try {
    const cardsRef = collection(db, 'interviewPrep');
    const q = query(
      cardsRef,
      where('trade', '==', trade),
      orderBy('order', 'asc') // Ordered by order field
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return {
        data: [],
        error: undefined,
      };
    }

    const cards: InterviewPrepCard[] = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id, // Include document ID for reference
        trade: data.trade,
        question: data.question,
        answer: data.answer,
        order: data.order,
      } as InterviewPrepCard & { id: string };
    });

    return {
      data: cards,
      error: undefined,
    };
  } catch (error) {
    console.error('Error fetching interview prep cards:', error);
    return {
      data: undefined,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to load interview questions. Please try again.',
    };
  }
}
