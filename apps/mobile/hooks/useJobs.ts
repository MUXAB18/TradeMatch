/**
 * Custom hook for job matching operations
 * Per rules.md Section 4: wraps service calls and exposes { data, loading, error }
 * Per rules.md Section 11: useMemo for scoring to stay performant on low-end devices
 */

import { useState, useEffect, useMemo } from 'react';
import { JobPosting, User } from '../types';
import { getJobsForTrade } from '../services/jobs';
import { scoreAndSortJobs, MatchScore } from '../utils/matching';

interface ScoredJob {
  job: JobPosting & { id: string };
  score: MatchScore;
}

interface UseJobsResult {
  jobs: ScoredJob[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Fetch and score job postings for a user
 * Per architecture.md Section 4.3: Query jobs, score client-side, sort by match quality
 *
 * @param user - User profile for matching
 * @returns Scored and sorted jobs with loading/error states
 */
export function useJobs(user: User | null): UseJobsResult {
  const [rawJobs, setRawJobs] = useState<(JobPosting & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!user) {
      setLoading(false);
      setError('User not loaded');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await getJobsForTrade(user.trade, user.country);

    if (result.error) {
      setError(result.error);
      setRawJobs([]);
    } else if (result.data) {
      setRawJobs(result.data as (JobPosting & { id: string })[]);
      setError(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchJobs();
  }, [user?.trade, user?.country]); // Refetch if trade/country changes

  // Memoize scoring calculation per rules.md Section 11
  // This can run on every render and needs to stay performant on low-end devices
  const scoredJobs = useMemo(() => {
    if (!user || rawJobs.length === 0) {
      return [];
    }

    return scoreAndSortJobs(user, rawJobs);
  }, [user, rawJobs]); // Only recalculate when user profile or jobs change

  return {
    jobs: scoredJobs,
    loading,
    error,
    refetch: fetchJobs,
  };
}
