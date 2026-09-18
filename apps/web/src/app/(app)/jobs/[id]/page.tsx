'use client';

import { use, useState } from 'react';
import { notFound } from 'next/navigation';
import { MapPin, Briefcase, DollarSign, CheckCircle2, Award, ArrowLeft, Clock, Share2, Bookmark } from 'lucide-react';
import Link from 'next/link';
import { MOCK_JOBS } from '@/lib/mockData';
import { getMatchBadgeClasses, formatPostedDate } from '@/lib/utils';
import ApplicationModal from '@/components/jobs/ApplicationModal';
import { useSavedJob } from '@/hooks/useSavedJob';
import { useAppliedJob } from '@/hooks/useAppliedJob';

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const job = MOCK_JOBS.find((j) => j.id === id);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  
  if (!job) return notFound();

  const { isSaved, toggleSaved } = useSavedJob(job.id);
  const { isApplied } = useAppliedJob(job.id);

  const badge = getMatchBadgeClasses(job.matchScore);

  return (
    <div className="flex flex-col min-h-full max-w-7xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">
      
      {/* Back Link */}
      <Link
        href="/jobs"
        className="flex items-center gap-1.5 text-text-secondary font-bold text-[14px] mb-8 hover:text-primary transition-colors w-max"
      >
        <ArrowLeft size={16} />
        Back to Jobs
      </Link>

      <div className="flex flex-col lg:flex-row gap-10 items-start">
        
        {/* Left Side: Main Content */}
        <div className="flex-1 w-full space-y-10">
          
          {/* Header Section */}
          <div className="bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-2xl p-8">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border flex items-center justify-center shrink-0">
                  <span className="text-[24px] font-bold text-[#6B7280] dark:text-text-secondary">{job.company.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#1D1D1F] dark:text-text-primary tracking-tight leading-tight">
                    {job.title}
                  </h1>
                  <p className="text-[18px] font-semibold text-[#6B7280] dark:text-text-secondary mt-1">{job.company}</p>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <button
                  className="w-11 h-11 rounded-full border border-[#E8EAF0] dark:border-border bg-[#F7F8FA] dark:bg-background flex items-center justify-center text-[#6B7280] dark:text-text-secondary hover:text-primary hover:border-primary/40 transition-all"
                  aria-label="Share job"
                >
                  <Share2 size={18} />
                </button>
                <button
                  onClick={toggleSaved}
                  className={`w-11 h-11 rounded-full border border-[#E8EAF0] dark:border-border flex items-center justify-center transition-all ${
                    isSaved ? 'bg-primary/10 text-primary border-primary/20' : 'bg-[#F7F8FA] dark:bg-background text-[#6B7280] dark:text-text-secondary hover:text-primary hover:border-primary/40'
                  }`}
                  aria-label={isSaved ? "Unsave job" : "Save job"}
                >
                  <Bookmark size={18} className={`translate-y-[1px] transition-colors ${isSaved ? 'fill-primary text-primary' : ''}`} />
                </button>
              </div>
            </div>

            {/* Meta tags inline under header */}
            <div className="flex flex-wrap items-center gap-4 text-[15px] font-medium text-[#6B7280] dark:text-text-secondary border-t border-[#E8EAF0] dark:border-border pt-6">
              <div className="flex items-center gap-2">
                <MapPin size={16} />
                {job.location}
              </div>
              <div className="flex items-center gap-2">
                <Briefcase size={16} />
                {job.employmentType}
              </div>
              <div className="flex items-center gap-2 text-[#1D1D1F] dark:text-text-primary font-bold">
                <DollarSign size={16} />
                {job.salary}
              </div>
            </div>
          </div>

          {/* Job Details Sections */}
          <div className="bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-2xl p-8 space-y-10">
            {/* About */}
            <section>
              <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-text-primary mb-4">About the Role</h2>
              <p className="text-[16px] text-[#6B7280] dark:text-text-secondary leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </section>

            {/* Required Skills */}
            <section>
              <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-text-primary mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2.5">
                {job.requiredSkills.map((skill) => (
                  <span
                    key={skill}
                    className="px-4 py-2 bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border text-[#1D1D1F] dark:text-text-primary rounded-full text-[14px] font-bold"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </section>

            {/* Required Certifications */}
            {job.requiredCerts.length > 0 && (
              <section>
                <h2 className="text-[20px] font-extrabold text-[#1D1D1F] dark:text-text-primary mb-4">Required Certifications</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {job.requiredCerts.map((cert) => (
                    <div key={cert} className="flex items-center gap-3 bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border rounded-xl px-4 py-3.5">
                      <Award size={20} className="text-secondary shrink-0" />
                      <span className="text-[15px] font-bold text-[#1D1D1F] dark:text-text-primary">{cert}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {/* Right Side: Sticky Summary Panel */}
        <div className="w-full lg:w-[380px] shrink-0 sticky top-[100px]">
          <div className="bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Match Banner */}
            <div className={`px-6 py-4 flex items-center justify-center gap-2 ${badge.bg} border-b ${badge.border}`}>
              <CheckCircle2 size={18} className={badge.text} strokeWidth={2.5} />
              <span className={`text-[15px] font-extrabold ${badge.text}`}>
                {job.matchScore}% Match with your profile
              </span>
            </div>

            {/* Summary details */}
            <div className="p-6">
              <h3 className="text-[18px] font-bold text-[#1D1D1F] dark:text-text-primary mb-6">Job Summary</h3>
              
              <div className="space-y-5 mb-8">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-background flex items-center justify-center text-[#6B7280] dark:text-text-secondary shrink-0">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#6B7280] dark:text-text-secondary uppercase tracking-wide">Location</p>
                    <p className="text-[15px] font-semibold text-[#1D1D1F] dark:text-text-primary mt-0.5">{job.location}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-background flex items-center justify-center text-[#6B7280] dark:text-text-secondary shrink-0">
                    <Briefcase size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#6B7280] dark:text-text-secondary uppercase tracking-wide">Job Type</p>
                    <p className="text-[15px] font-semibold text-[#1D1D1F] dark:text-text-primary mt-0.5">{job.employmentType}</p>
                  </div>
                </div>

                {job.salary && (
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-background flex items-center justify-center text-[#6B7280] dark:text-text-secondary shrink-0">
                      <DollarSign size={18} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#6B7280] dark:text-text-secondary uppercase tracking-wide">Salary</p>
                      <p className="text-[15px] font-semibold text-[#1D1D1F] dark:text-text-primary mt-0.5">{job.salary}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#F7F8FA] dark:bg-background flex items-center justify-center text-[#6B7280] dark:text-text-secondary shrink-0">
                    <Clock size={18} />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-[#6B7280] dark:text-text-secondary uppercase tracking-wide">Date Posted</p>
                    <p className="text-[15px] font-semibold text-[#1D1D1F] dark:text-text-primary mt-0.5">{formatPostedDate(job.postedAt)}</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isApplied ? (
                  <button 
                    disabled
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-green-500/10 text-green-600 font-bold text-[16px] transition-all"
                  >
                    <CheckCircle2 size={20} />
                    Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsApplyModalOpen(true)}
                    className="w-full py-4 rounded-xl bg-primary text-white font-bold text-[16px] hover:opacity-90 active:scale-[0.98] transition-all shadow-md shadow-primary/25"
                  >
                    Apply Now
                  </button>
                )}
                <button className="w-full py-4 rounded-xl bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border text-[#1D1D1F] dark:text-text-primary font-bold text-[15px] hover:border-primary/40 transition-colors lg:hidden">
                  Save Job
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      {isApplyModalOpen && (
        <ApplicationModal 
          job={job} 
          onClose={() => setIsApplyModalOpen(false)} 
        />
      )}
    </div>
  );
}
