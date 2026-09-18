'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useJobs } from '@/hooks/useJobs';
import { getGreeting, getProfileCompletion } from '@/lib/utils';
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard';
import StatsRow from '@/components/dashboard/StatsRow';
import JobCard from '@/components/dashboard/JobCard';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { Briefcase, ArrowRight, ShieldAlert, CheckCircle2, Sparkles, Building2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function MiniApplicationRow({ job }: { job: import('@/lib/mockData').MockJob }) {
  const statusIndex = job.id.length % 4;
  const statusLabel = ['Application Received', 'Under Review', 'Interviewing', 'Offer Extended'][statusIndex];
  const statusColor = [
    'text-primary bg-blue-50 dark:bg-primary/10',
    'text-amber-600 bg-amber-50 dark:bg-amber-500/10',
    'text-purple-600 bg-purple-50 dark:bg-purple-500/10',
    'text-green-600 bg-green-50 dark:bg-green-500/10',
  ][statusIndex];

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-[#F7F8FA] dark:hover:bg-background rounded-[14px] transition-colors group"
    >
      {/* Logo */}
      <div className="w-10 h-10 rounded-[10px] bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border flex items-center justify-center shrink-0 text-[15px] font-bold text-[#6B7280] group-hover:scale-105 transition-transform">
        {job.company.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[#1D1D1F] dark:text-text-primary truncate group-hover:text-primary transition-colors">{job.title}</p>
        <div className="flex items-center gap-1.5 text-[12px] text-text-secondary font-medium mt-0.5">
          <Building2 size={11} />
          <span className="truncate">{job.company}</span>
          <span className="text-[#D1D5DB]">&middot;</span>
          <MapPin size={11} />
          <span className="truncate">{job.location}</span>
        </div>
      </div>

      {/* Status pill */}
      <span className={`shrink-0 text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColor}`}>
        {statusLabel}
      </span>
    </Link>
  );
}

function JobSkeletonCard() {
  return (
    <div className="bg-white rounded-[18px] p-6 border border-[#E8EAF0] animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-[#F3F4F6] rounded-md w-3/5" />
          <div className="h-4 bg-[#F3F4F6] rounded-md w-2/5" />
        </div>
        <div className="h-9 w-20 bg-[#F3F4F6] rounded-[12px]" />
      </div>
      <div className="flex gap-2 mb-5">
        <div className="h-4 bg-[#F3F4F6] rounded-md w-20" />
        <div className="h-4 bg-[#F3F4F6] rounded-md w-16" />
      </div>
      <div className="h-4 bg-[#F3F4F6] rounded-md w-1/4 mb-5" />
      <div className="flex gap-2 mb-5">
        <div className="h-6 bg-[#F3F4F6] rounded-full w-16" />
        <div className="h-6 bg-[#F3F4F6] rounded-full w-24" />
      </div>
      <div className="pt-4 border-t border-[#F3F4F6] flex justify-between">
        <div className="h-4 bg-[#F3F4F6] rounded-md w-32" />
        <div className="h-8 w-8 bg-[#F3F4F6] rounded-md" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const { jobs, loading: jobsLoading } = useJobs(profile?.trade, profile?.country);

  useEffect(() => {
    if (!profileLoading && profile?.role === 'agency') {
      router.replace('/agency/dashboard');
    }
  }, [profile, profileLoading, router]);

  const [safetyTipIndex, setSafetyTipIndex] = useState(0);
  const safetyTips = [
    "Never pay a recruiter for a job. Genuine employers cover hiring costs.",
    "Always verify the company name and location before sharing documents.",
    "Don't share your passwords or OTPs with anyone.",
    "Read your employment contract carefully before signing.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setSafetyTipIndex((i) => (i + 1) % safetyTips.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [safetyTips.length]);

  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const loadApplied = () => {
      try {
        const applied = JSON.parse(localStorage.getItem('applied_jobs') || '[]');
        setAppliedJobIds(applied);
      } catch (e) {}
    };
    loadApplied();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'applied_jobs') loadApplied();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('sync_applied_jobs', loadApplied);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('sync_applied_jobs', loadApplied);
    };
  }, []);

  const firstName = profile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || 'there';
  const greeting = getGreeting();
  const profilePercent = getProfileCompletion(profile);
  const featuredJobs = jobs.slice(0, 4); // Show top 4 jobs on home page
  const appliedJobs = jobs.filter(j => appliedJobIds.includes(j.id)).slice(0, 2); // Show top 2 applied jobs

  return (
    <div className="flex flex-col min-h-full">
      {/* Header Area */}
      <header className="px-6 pt-10 pb-6 md:pt-12 md:pb-8 shrink-0">
        <div className="max-w-[1200px] mx-auto w-full">
          <p className="text-[14px] text-[#6B7280] font-medium tracking-wide uppercase mb-1">
            {greeting},
          </p>
          <h1 className="text-[36px] md:text-[44px] font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
            Hello {firstName} 👋<br/>
            <span className="text-[28px] md:text-[36px] text-[#6B7280]">Ready for your next job?</span>
          </h1>
          
          {/* Verification Strip */}
          {profile?.verificationStatus && (
            <div className="flex flex-wrap items-center gap-2 mt-6">
              <VerificationBadge status={profile.verificationStatus.identity} label="Identity" />
              <span className="text-gray-300">•</span>
              <VerificationBadge status={profile.verificationStatus.certificate} label="Certificate" />
              <span className="text-gray-300">•</span>
              <VerificationBadge status={profile.verificationStatus.experience} label="Experience" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-5 pb-12 w-full mx-auto max-w-[1200px] space-y-8">

        {/* Quick Stats */}
        <section aria-label="Quick statistics">
          {profileLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-white rounded-[18px] animate-pulse border border-[#E8EAF0]" />
              ))}
            </div>
          ) : (
            <StatsRow
              jobCount={jobs.length}
              skillCount={profile?.skills?.length ?? 0}
              certCount={profile?.certifications?.length ?? 0}
            />
          )}
        </section>

        {/* Two Column Layout for Profile & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Completion */}
          <section aria-label="Profile completion">
            {profileLoading ? (
              <div className="h-[280px] bg-white rounded-[20px] p-6 border border-[#E8EAF0] animate-pulse" />
            ) : (
              <ProfileCompletionCard percent={profilePercent} profile={profile} />
            )}
          </section>

          {/* Safety Tip Section */}
          <section aria-label="Safety Tips">
            <div className="bg-red-50 border border-red-100 rounded-[20px] p-6 h-full flex flex-col hover:shadow-sm transition-all duration-300">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <ShieldAlert size={16} className="text-red-600" />
                </div>
                <h2 className="text-[16px] font-bold text-red-900">Safety Tip</h2>
              </div>
              
              <div className="flex-1">
                <p className="text-[17px] font-bold text-red-800 leading-relaxed mb-3 animate-in fade-in slide-in-from-bottom-2 duration-500" key={safetyTipIndex}>
                  {safetyTips[safetyTipIndex]}
                </p>
              </div>

              <div className="pt-6 mt-auto border-t border-red-200">
                <Link
                  href="/safety"
                  className="inline-flex items-center gap-1.5 text-[14px] font-semibold text-red-700 hover:text-red-900 transition-colors group"
                >
                  Read our full safety guide
                  <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </div>

        {/* AI Preparation Banner */}
        <section aria-label="AI Preparation">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/5 border border-primary/20 rounded-[20px] p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 justify-between hover:shadow-md transition-all relative overflow-hidden group">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-5 dark:opacity-10 pointer-events-none group-hover:scale-110 transition-transform duration-700">
              <Sparkles size={120} />
            </div>
            
            <div className="flex items-start sm:items-center gap-5 relative z-10 flex-1 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles size={26} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[20px] font-bold text-text-primary mb-1.5 flex items-center gap-2">
                  AI Interview Prep <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">New</span>
                </h2>
                <p className="text-[15px] text-text-secondary leading-relaxed">
                  Practice trade-specific interview questions with our advanced AI. Get instant personalized feedback to boost your confidence and land the job.
                </p>
              </div>
            </div>
            <Link
              href="/prep"
              className="w-full md:w-auto px-6 py-3.5 bg-primary text-white text-[15px] font-bold rounded-xl hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 relative z-10 shrink-0 group/btn"
            >
              Start Practice Session
              <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* Recent Applications */}
        {appliedJobs.length > 0 && (
          <section aria-label="Recent applications">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[18px] font-extrabold text-[#1D1D1F] dark:text-text-primary tracking-tight">
                  Your Applications
                </h2>
                <p className="text-[13px] text-text-secondary font-medium mt-0.5">
                  Track your job application status
                </p>
              </div>
              <Link
                href="/applications"
                className="flex items-center gap-1 text-[13px] font-semibold text-[#007AFF] hover:opacity-80 transition-opacity group"
              >
                View all
                <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Compact list */}
            <div className="bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-[18px] overflow-hidden divide-y divide-[#F3F4F6] dark:divide-border">
              {appliedJobs.map((job) => (
                <MiniApplicationRow key={job.id} job={job} />
              ))}
            </div>
          </section>
        )}

        {/* Jobs For You */}
        <section aria-label="Job recommendations">
          <div className="flex items-end justify-between mb-5">
            <div>
              <h2 className="text-[22px] md:text-[26px] font-extrabold text-[#1D1D1F] tracking-tight leading-tight">
                Jobs for you
              </h2>
              <p className="text-[14px] text-[#6B7280] font-medium mt-1">
                Based on your profile and preferences
              </p>
            </div>
            <Link
              href="/jobs"
              className="hidden sm:flex items-center gap-1 text-[14px] font-semibold text-[#007AFF] hover:opacity-80 transition-opacity group"
            >
              View all
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {jobsLoading ? (
              [1, 2, 3, 4].map((i) => <JobSkeletonCard key={i} />)
            ) : featuredJobs.length === 0 ? (
              <div className="col-span-full bg-white rounded-[18px] p-12 border border-[#E8EAF0] flex flex-col items-center justify-center text-center hover:border-[#D0D4DE] transition-colors">
                <div className="w-16 h-16 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
                  <Briefcase size={28} className="text-[#9CA3AF]" />
                </div>
                <h3 className="text-[18px] font-bold text-[#1D1D1F] mb-2">No matching jobs yet</h3>
                <p className="text-[15px] text-[#6B7280] max-w-sm leading-relaxed mb-6">
                  We need a bit more information about your skills and experience to find the best opportunities for you.
                </p>
                <Link
                  href="/profile"
                  className="px-5 py-3 bg-[#007AFF] text-white text-[14px] font-semibold rounded-xl hover:opacity-90 active:scale-[0.98] transition-all"
                >
                  Complete your profile
                </Link>
              </div>
            ) : (
              featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} showViewButton />
              ))
            )}
          </div>
          
          {/* Mobile view all link */}
          <div className="mt-5 sm:hidden">
             <Link
              href="/jobs"
              className="flex items-center justify-center gap-1 w-full py-3.5 bg-white border border-[#E8EAF0] rounded-xl text-[14px] font-semibold text-[#1D1D1F] hover:bg-[#F9FAFB] transition-colors"
            >
              View all jobs
            </Link>
          </div>
        </section>

      </div>
    </div>
  );
}
