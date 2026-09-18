'use client';

import { useState } from 'react';

type FilterOption = 'all' | 'strong' | 'saved' | 'applied';
type SortOption = 'score' | 'recent';

interface JobFiltersProps {
  activeFilter: FilterOption;
  onFilterChange: (f: FilterOption) => void;
  activeSort: SortOption;
  onSortChange: (s: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

const FILTERS: { id: FilterOption; label: string }[] = [
  { id: 'all', label: 'All Matches' },
  { id: 'strong', label: 'Strong (>80%)' },
  { id: 'saved', label: 'Saved' },
  { id: 'applied', label: 'Applied' },
];

const SORTS: { id: SortOption; label: string }[] = [
  { id: 'score', label: 'Match Score' },
  { id: 'recent', label: 'Most Recent' },
];

export default function JobFilters({
  activeFilter,
  onFilterChange,
  activeSort,
  onSortChange,
  totalCount,
  filteredCount,
}: JobFiltersProps) {
  return (
    <div className="flex flex-col bg-surface border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[16px] font-bold text-text-primary uppercase tracking-wide">Filter Jobs</h2>
        <button className="text-[13px] font-semibold text-text-secondary hover:text-primary transition-colors">
          Clear All
        </button>
      </div>

      {/* Sort (moved from header to top of sidebar) */}
      <div className="mb-8">
        <label className="block text-[14px] font-bold text-text-primary mb-3">Sort By</label>
        <select
          value={activeSort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="w-full text-[14px] font-medium text-text-primary bg-background border border-border rounded-xl px-4 py-2.5 outline-none focus:border-primary cursor-pointer appearance-none"
        >
          {SORTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Job Type */}
      <div className="mb-8">
        <label className="block text-[14px] font-bold text-text-primary mb-3">Job Type</label>
        <div className="space-y-3">
          {['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'].map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="jobType" className="w-4 h-4 text-primary border-border focus:ring-primary/20 cursor-pointer" />
              <span className="text-[14px] text-text-secondary group-hover:text-text-primary transition-colors">{type}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Work Mode */}
      <div className="mb-8">
        <label className="block text-[14px] font-bold text-text-primary mb-3">Work Mode</label>
        <div className="space-y-3">
          {['Remote', 'Hybrid', 'On-site'].map((mode) => (
            <label key={mode} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="workMode" className="w-4 h-4 text-primary border-border focus:ring-primary/20 cursor-pointer" />
              <span className="text-[14px] text-text-secondary group-hover:text-text-primary transition-colors">{mode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Experience Level */}
      <div className="mb-8">
        <label className="block text-[14px] font-bold text-text-primary mb-3">Experience Level</label>
        <div className="space-y-3">
          {['Internship', 'Entry Level', 'Junior', 'Mid Level', 'Senior', 'Lead'].map((exp) => (
            <label key={exp} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="experience" className="w-4 h-4 text-primary border-border focus:ring-primary/20 cursor-pointer" />
              <span className="text-[14px] text-text-secondary group-hover:text-text-primary transition-colors">{exp}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Posted */}
      <div>
        <label className="block text-[14px] font-bold text-text-primary mb-3">Date Posted</label>
        <div className="space-y-3">
          {['Any time', 'Past 24 hours', 'Past 3 days', 'Past week', 'Past month'].map((time) => (
            <label key={time} className="flex items-center gap-3 cursor-pointer group">
              <input type="radio" name="datePosted" className="w-4 h-4 text-primary border-border focus:ring-primary/20 cursor-pointer" />
              <span className="text-[14px] text-text-secondary group-hover:text-text-primary transition-colors">{time}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
