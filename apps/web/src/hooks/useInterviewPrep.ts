import { useState, useEffect } from 'react';
import { InterviewPrepCard } from '@/types';
import { getInterviewPrep } from '@/lib/services/prep';

export function useInterviewPrep(trade?: string) {
  const [prepCards, setPrepCards] = useState<InterviewPrepCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrep() {
      if (!trade) {
        setPrepCards([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getInterviewPrep(trade);
        setPrepCards(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchPrep();
  }, [trade]);

  return { prepCards, loading, error };
}
