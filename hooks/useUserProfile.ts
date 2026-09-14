/**
 * Custom hook for user profile operations
 * Per rules.md Section 4: wraps services calls and exposes { data, loading, error }
 */

import { useState, useEffect } from 'react';
import { User } from '../types';
import { getUserProfile } from '../services/users';
import { useAuth } from '../contexts/AuthContext';

interface UseUserProfileResult {
  data: User | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserProfile(): UseUserProfileResult {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (authLoading) return;

    if (!user) {
      setError('Not authenticated');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getUserProfile(user.uid);

    if (result.error) {
      setError(result.error);
      setData(null);
    } else {
      setData(result.data || null);
      setError(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchProfile();
  }, [user, authLoading]);

  return {
    data,
    loading: loading || authLoading,
    error,
    refetch: fetchProfile,
  };
}
