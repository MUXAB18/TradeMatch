import { useState, useEffect } from 'react';
import { Certification } from '@/types';
import { getCertifications } from '@/lib/services/certifications';

export function useCertifications(trade?: string, country?: string) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCerts() {
      if (!trade || !country) {
        setCertifications([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getCertifications(trade, country);
        setCertifications(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCerts();
  }, [trade, country]);

  return { certifications, loading, error };
}
