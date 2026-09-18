import { useState, useEffect, useCallback } from 'react';
import { JobPosting } from '@/types';
import { getActiveJobs } from '@/lib/services/jobs';
import { MOCK_JOBS, MockJob } from '@/lib/mockData';

export type JobWithScore = {
  job: (JobPosting & { id: string }) | MockJob;
  matchScore: number;
};

export function useJobs(trade?: string, country?: string) {
  const [jobs, setJobs] = useState<MockJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!trade || !country) {
      // Return mock data when profile isn't loaded yet
      setJobs(MOCK_JOBS);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getActiveJobs(trade, country);
      if (data.length > 0) {
        // Map real Firestore jobs to MockJob shape with a default matchScore
        const mapped: MockJob[] = data.map((j) => ({
          id: j.id || '',
          title: j.title,
          company: j.company || '',
          trade: j.trade,
          country: j.country,
          location: `${j.country}`,
          requiredSkills: j.requiredSkills,
          requiredCerts: j.requiredCerts,
          description: j.description || '',
          salary: j.salary || '',
          employmentType: 'Full-time',
          postedAt: (j.postedAt as any)?.toDate?.() ?? new Date(),
          active: j.active,
          matchScore: 85, // default — real score would come from matching algorithm
        }));
        setJobs(mapped);
      } else {
        // Fall back to mock data if Firestore is empty
        setJobs(MOCK_JOBS);
      }
    } catch (err: any) {
      setError(err.message);
      setJobs(MOCK_JOBS);
    } finally {
      setLoading(false);
    }
  }, [trade, country]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
