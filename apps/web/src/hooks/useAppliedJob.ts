import { useState, useEffect, useCallback } from 'react';

export function useAppliedJob(jobId: string) {
  const [isApplied, setIsApplied] = useState(false);

  useEffect(() => {
    const appliedJobs = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
    setIsApplied(appliedJobs.includes(jobId));

    // Handle cross-tab or cross-component sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'applied_jobs') {
        const jobs = JSON.parse(e.newValue || '[]');
        setIsApplied(jobs.includes(jobId));
      }
    };
    
    // Custom event for same-window syncing
    const handleLocalSync = () => {
      const jobs = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
      setIsApplied(jobs.includes(jobId));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sync_applied_jobs', handleLocalSync);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sync_applied_jobs', handleLocalSync);
    };
  }, [jobId]);

  const markAsApplied = useCallback(() => {
    try {
      const appliedJobs = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
      if (!appliedJobs.includes(jobId)) {
        const newJobs = [...appliedJobs, jobId];
        localStorage.setItem('applied_jobs', JSON.stringify(newJobs));
        setIsApplied(true);
        
        // Dispatch event so other components in the same window update
        setTimeout(() => {
          window.dispatchEvent(new Event('sync_applied_jobs'));
        }, 0);
      }
    } catch (e) {
      console.error("Failed to mark job as applied", e);
      setIsApplied(true);
    }
  }, [jobId]);

  return { isApplied, markAsApplied };
}
