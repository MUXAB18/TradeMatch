'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Briefcase, Clock, ChevronRight, CheckCircle2, Bookmark } from 'lucide-react';
import { MockJob } from '@/lib/mockData';
import { getMatchBadgeClasses, formatPostedDate } from '@/lib/utils';
import { useSavedJob } from '@/hooks/useSavedJob';
import { useAppliedJob } from '@/hooks/useAppliedJob';

interface JobCardProps {
  job: MockJob;
  showViewButton?: boolean;
}

export default function JobCard({ job, showViewButton = true }: JobCardProps) {
  const { isSaved, toggleSaved } = useSavedJob(job.id);
  const { isApplied } = useAppliedJob(job.id);
  const score = job.matchScore;

  // Match quality label
  const matchLabel =
    score >= 90 ? 'Excellent fit' :
    score >= 75 ? 'Strong match' :
    score >= 60 ? 'Good match' : 'Partial match';

  // Match color
  const matchColor =
    score >= 80 ? '#16a34a' :
    score >= 60 ? '#d97706' : '#dc2626';

  const matchBg =
    score >= 80 ? '#f0fdf4' :
    score >= 60 ? '#fffbeb' : '#fef2f2';

  const matchBorder =
    score >= 80 ? '#bbf7d0' :
    score >= 60 ? '#fde68a' : '#fecaca';

  return (
    <Link href={`/jobs/${job.id}`} className="block group">
      <article className="relative bg-surface border border-border rounded-2xl p-6 transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-md group-hover:border-primary/30">
        
        {/* Row 1: Title + Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-background border border-border flex items-center justify-center shrink-0">
              <span className="text-[18px] font-bold text-text-secondary">{job.company.charAt(0)}</span>
            </div>
            <div>
              <h3 className="text-[18px] font-extrabold text-text-primary group-hover:text-primary transition-colors">
                {job.title}
              </h3>
              <p className="text-[15px] text-text-secondary font-medium">{job.company}</p>
            </div>
          </div>

          <button
            aria-label={isSaved ? "Unsave job" : "Save job"}
            onClick={(e) => {
              e.preventDefault();
              toggleSaved();
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isSaved ? 'text-primary bg-primary/10' : 'text-text-secondary hover:text-primary hover:bg-primary/10'
            }`}
          >
            <Bookmark size={18} className={`translate-y-[1px] transition-colors ${isSaved ? 'fill-primary text-primary' : ''}`} />
          </button>
        </div>

        {/* Row 2: Meta info */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 mt-5">
          <div className="flex items-center gap-1.5 text-[14px] text-text-secondary font-medium">
            <MapPin size={15} className="shrink-0" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[14px] text-text-secondary font-medium">
            <Briefcase size={15} className="shrink-0" />
            <span>{job.employmentType}</span>
          </div>
        </div>

        {/* Salary */}
        {job.salary && (
          <p className="text-[15px] font-bold text-text-primary mb-4">{job.salary}</p>
        )}

        {/* Description Snippet */}
        <p className="text-[14px] text-text-secondary mb-5 line-clamp-2 leading-relaxed">
          {job.description}
        </p>

        {/* Skills */}
        {job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {job.requiredSkills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="text-[13px] font-medium text-text-primary bg-background border border-border px-3 py-1 rounded-full"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 4 && (
              <span className="text-[13px] font-medium text-text-secondary px-2 py-1">
                +{job.requiredSkills.length - 4} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div className="flex items-center gap-1.5 text-[13px] text-text-secondary">
            {job.postedAt && (
              <>
                <Clock size={14} className="shrink-0" />
                <span>Posted {formatPostedDate(job.postedAt)}</span>
              </>
            )}
          </div>
          {isApplied ? (
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium text-text-secondary">Status:</span>
              <span className={`text-[13px] font-bold px-2 py-1 rounded-full ${
                job.id.length % 4 === 0 ? 'bg-blue-500/10 text-blue-600' :
                job.id.length % 4 === 1 ? 'bg-purple-500/10 text-purple-600' :
                job.id.length % 4 === 2 ? 'bg-orange-500/10 text-orange-600' :
                'bg-green-500/10 text-green-600'
              }`}>
                {job.id.length % 4 === 0 ? 'Under Review' :
                 job.id.length % 4 === 1 ? 'Interviewing' :
                 job.id.length % 4 === 2 ? 'Offer Extended' :
                 'Application Received'}
              </span>
            </div>
          ) : (
            <span className="text-[14px] font-bold text-primary flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              View Job <ChevronRight size={16} />
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}
