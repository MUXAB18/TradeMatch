import { useState, useEffect, useCallback } from 'react';

export function useSavedJob(jobId: string) {
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
    setIsSaved(savedJobs.includes(jobId));

    // Handle cross-tab or cross-component sync
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'saved_jobs') {
        const jobs = JSON.parse(e.newValue || '[]');
        setIsSaved(jobs.includes(jobId));
      }
    };
    
    // Custom event for same-window syncing
    const handleLocalSync = () => {
      const jobs = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
      setIsSaved(jobs.includes(jobId));
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('sync_saved_jobs', handleLocalSync);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sync_saved_jobs', handleLocalSync);
    };
  }, [jobId]);

  const toggleSaved = useCallback(() => {
    try {
      const savedJobs = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
      const isCurrentlySaved = savedJobs.includes(jobId);
      const newState = !isCurrentlySaved;
      
      let newJobs;
      if (newState) {
        newJobs = [...new Set([...savedJobs, jobId])];
      } else {
        newJobs = savedJobs.filter((id: string) => id !== jobId);
      }
      
      localStorage.setItem('saved_jobs', JSON.stringify(newJobs));
      setIsSaved(newState);
      
      // Dispatch event so other components in the same window update
      // Run it in a timeout to ensure React finishes current state updates
      setTimeout(() => {
        window.dispatchEvent(new Event('sync_saved_jobs'));
      }, 0);
    } catch (e) {
      console.error("Failed to save job", e);
      // Fallback
      setIsSaved(prev => !prev);
    }
  }, [jobId]);

  return { isSaved, toggleSaved };
}
