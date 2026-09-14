/**
 * Custom hook for interview prep operations
 * Per rules.md Section 4: wraps service calls and exposes { data, loading, error }
 */

import { useState, useEffect } from 'react';
import { InterviewPrepCard } from '../types';
import { getInterviewPrepCards } from '../services/interviewPrep';

interface UseInterviewPrepResult {
  cards: (InterviewPrepCard & { id: string })[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch interview prep cards for a trade
 * Returns cards ordered by order field
 *
 * @param trade - Trade type (e.g., "electrician")
 * @returns Interview prep cards with loading/error states
 */
export function useInterviewPrep(trade: string): UseInterviewPrepResult {
  const [cards, setCards] = useState<(InterviewPrepCard & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCards = async () => {
    if (!trade) {
      setLoading(false);
      setError('Trade not specified');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getInterviewPrepCards(trade);

    if (result.error) {
      setError(result.error);
      setCards([]);
    } else if (result.data) {
      setCards(result.data as (InterviewPrepCard & { id: string })[]);
      setError(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCards();
  }, [trade]); // Refetch if trade changes

  return {
    cards,
    loading,
    error,
    refetch: fetchCards,
  };
}
