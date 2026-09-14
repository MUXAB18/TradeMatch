/**
 * Custom hook for certification operations
 * Per rules.md Section 4: wraps service calls and exposes { data, loading, error }
 */

import { useState, useEffect } from 'react';
import { Certification } from '../types';
import { getUserCertificationStatus } from '../services/certifications';

interface CertificationWithId extends Certification {
  id: string;
}

interface UseCertificationsResult {
  have: CertificationWithId[];
  missing: CertificationWithId[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch and categorize certifications for a user
 * Per architecture.md Section 4.2: Query certifications where trade/country match,
 * cross-reference against user's certifications array
 */
export function useCertifications(
  trade: string,
  country: string,
  userCertIds: string[]
): UseCertificationsResult {
  const [have, setHave] = useState<CertificationWithId[]>([]);
  const [missing, setMissing] = useState<CertificationWithId[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCertifications = async () => {
    setLoading(true);
    setError(null);

    const result = await getUserCertificationStatus(trade, country, userCertIds);

    if (result.error) {
      setError(result.error);
      setHave([]);
      setMissing([]);
    } else if (result.data) {
      setHave(result.data.have);
      setMissing(result.data.missing);
      setError(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCertifications();
  }, [trade, country, userCertIds.join(',')]); // Stringify array for dependency

  return {
    have,
    missing,
    loading,
    error,
    refetch: fetchCertifications,
  };
}
