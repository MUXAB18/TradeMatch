'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Briefcase, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useJobs } from '@/hooks/useJobs';
import JobCard from '@/components/dashboard/JobCard';
import JobFilters from '@/components/jobs/JobFilters';
import JobSearch from '@/components/jobs/JobSearch';
import JobsTabs, { JobTab } from '@/components/jobs/JobsTabs';
import { useTranslations } from 'next-intl';

type SortOption = 'score' | 'recent';

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-6 border border-[#E8EAF0] dark:border-border animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="flex gap-4 w-full">
          <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border shrink-0" />
          <div className="space-y-3 flex-1">
            <div className="h-5 bg-[#F7F8FA] dark:bg-background rounded-lg w-2/3" />
            <div className="h-4 bg-[#F7F8FA] dark:bg-background rounded-lg w-1/3" />
          </div>
        </div>
      </div>
      <div className="h-3 bg-[#F7F8FA] dark:bg-background rounded-full w-1/2 mb-2 mt-6" />
      <div className="h-10 bg-[#F7F8FA] dark:bg-background rounded-xl mt-6" />
    </div>
  );
}

export default function JobsPage() {
  const t = useTranslations('jobs');
  const searchParams = useSearchParams();
  const initialTab = (searchParams.get('tab') as JobTab) || 'all';

  const { profile } = useUserProfile();
  const { jobs, loading } = useJobs(profile?.trade, profile?.country);
  
  const [search, setSearch] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [filter, setFilter] = useState<JobTab>(initialTab);
  const [sort, setSort] = useState<SortOption>('score');
  
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    // Initial load
    const loadSaved = () => {
      try {
        const saved = JSON.parse(localStorage.getItem('saved_jobs') || '[]');
        setSavedJobIds(saved);
      } catch (e) {}
    };
    const loadApplied = () => {
      try {
        const applied = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
        setAppliedJobIds(applied);
      } catch (e) {}
    };
    loadSaved();
    loadApplied();

    // Listen for cross-tab or local sync events
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'saved_jobs') loadSaved();
      if (e.key === 'applied_jobs') loadApplied();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sync_saved_jobs', loadSaved);
    window.addEventListener('sync_applied_jobs', loadApplied);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sync_saved_jobs', loadSaved);
      window.removeEventListener('sync_applied_jobs', loadApplied);
    };
  }, []);

  const processedJobs = useMemo(() => {
    let result = [...jobs];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.requiredSkills.some((s) => s.toLowerCase().includes(q))
      );
    }
    
    // Location filter
    if (locationQuery.trim()) {
      const q = locationQuery.toLowerCase();
      result = result.filter((j) => j.location.toLowerCase().includes(q));
    }

    // Category filter (Tabs)
    if (filter === 'recommended') {
      result = result.filter((j) => j.matchScore >= 80);
    }
    
    if (filter === 'saved') {
      result = result.filter((j) => savedJobIds.includes(j.id));
    }

    // Sort
    if (sort === 'score') {
      result.sort((a, b) => b.matchScore - a.matchScore);
    } else {
      result.sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime());
    }

    return result;
  }, [jobs, search, locationQuery, filter, sort, savedJobIds]);

  const handleSearchSubmit = () => {
    // In a real app, this might trigger a server fetch
    // For now, the useMemo handles the filtering based on state
  };

  return (
    <div className="flex flex-col min-h-full max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
      
      {/* Hero Section */}
      <div className="mb-10 text-center md:text-start flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#1D1D1F] dark:text-text-primary tracking-tight leading-tight mb-3">
            {t('hero_title')}
          </h1>
          <p className="text-[16px] md:text-[18px] text-[#6B7280] dark:text-text-secondary leading-relaxed">
            {t('hero_desc')}
          </p>
        </div>
        <div className="shrink-0 flex gap-3 justify-center md:justify-start">
          <Link
            href="/applications"
            className="px-5 py-2.5 rounded-xl text-[14px] font-bold transition-all flex items-center gap-2 border bg-white dark:bg-surface border-[#E8EAF0] dark:border-border text-[#1D1D1F] dark:text-text-primary hover:border-primary/40 hover:text-primary"
          >
            <CheckCircle2 size={18} />
            {t('my_applications')}
          </Link>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-2">
        <JobSearch
          searchQuery={search}
          onSearchChange={setSearch}
          locationQuery={locationQuery}
          onLocationChange={setLocationQuery}
          onSearchSubmit={handleSearchSubmit}
        />
      </div>

      {/* Navigation Tabs */}
      <JobsTabs activeTab={filter} onTabChange={setFilter} />

      {/* Content Area (70/30 split on desktop) */}
      <div className="mt-8 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Left Side: Job Listings (70%) */}
        <div className="flex-1 w-full">
          {/* Results Header */}
          <div className="flex items-center justify-between mb-6">
            <span className="text-[16px] font-bold text-[#1D1D1F] dark:text-text-primary">
              {processedJobs.length === 1 ? t('job_found', { count: 1 }) : t('jobs_found', { count: processedJobs.length })}
            </span>
            <div className="flex items-center gap-2 lg:hidden">
              {/* On mobile, show a sort dropdown here since sidebar is hidden */}
              <span className="text-[13px] font-bold text-[#6B7280] dark:text-text-secondary">{t('sort')}</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortOption)}
                className="text-[13px] font-bold text-[#1D1D1F] dark:text-text-primary bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border rounded-xl px-2 py-1 outline-none"
              >
                <option value="score">{t('sort_score')}</option>
                <option value="recent">{t('sort_recent')}</option>
              </select>
            </div>
          </div>

          {/* Job List */}
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            ) : processedJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border flex items-center justify-center mb-5">
                  <Briefcase size={28} className="text-[#9CA3AF] dark:text-text-secondary opacity-50" />
                </div>
                <h3 className="text-[20px] font-bold text-[#1D1D1F] dark:text-text-primary mb-2">
                  {filter === 'saved' ? t('no_saved_jobs_title') : filter as string === 'applied' ? t('no_applications_title') : t('no_jobs_title')}
                </h3>
                <p className="text-[15px] text-[#6B7280] dark:text-text-secondary max-w-[400px] mx-auto leading-relaxed mb-6">
                  {filter === 'saved' 
                    ? t('no_saved_jobs_desc')
                    : filter as string === 'applied'
                    ? t('no_applications_desc')
                    : t('no_jobs_desc')}
                </p>
                {(filter === 'saved' || filter as string === 'applied') && (
                  <button 
                    onClick={() => setFilter('all')}
                    className="px-6 py-2.5 bg-primary text-white font-bold rounded-full hover:opacity-90 transition-opacity"
                  >
                    {t('explore_jobs')}
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {processedJobs.map((job) => (
                  <JobCard key={job.id} job={job} showViewButton />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Filters Sidebar (30%) */}
        <div className="w-full lg:w-[320px] shrink-0 sticky top-[100px] hidden lg:block">
          <JobFilters
            activeFilter={filter as any} // we don't need this anymore since we use tabs, but keep for now
            onFilterChange={(f) => setFilter(f as JobTab)}
            activeSort={sort}
            onSortChange={setSort}
            totalCount={jobs.length}
            filteredCount={processedJobs.length}
          />
        </div>

      </div>
    </div>
  );
}
