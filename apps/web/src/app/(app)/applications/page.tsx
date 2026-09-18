'use client';

import { useState, useEffect } from 'react';
import {
  Briefcase, ArrowLeft, CheckCircle2, Circle,
  Building2, MapPin, DollarSign, Clock, FileText,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';
import { useJobs } from '@/hooks/useJobs';
import { MockJob } from '@/lib/mockData';

/* ─── Skeleton ─────────────────────────────────────────────────────── */
function SkeletonTracker() {
  return (
    <div className="bg-white dark:bg-surface rounded-2xl p-6 md:p-8 border border-[#E8EAF0] dark:border-border animate-pulse">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex gap-4 md:w-[30%]">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F8FA] dark:bg-background shrink-0" />
          <div className="space-y-2 flex-1 pt-1">
            <div className="h-4 bg-[#F7F8FA] dark:bg-background rounded-lg w-3/4" />
            <div className="h-3 bg-[#F7F8FA] dark:bg-background rounded-lg w-1/2" />
            <div className="h-3 bg-[#F7F8FA] dark:bg-background rounded-lg w-1/3 mt-2" />
          </div>
        </div>
        <div className="flex-1 space-y-3 pt-2">
          <div className="h-2.5 bg-[#F7F8FA] dark:bg-background rounded-full w-full" />
          <div className="flex justify-between">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-3 bg-[#F7F8FA] dark:bg-background rounded-full w-[60px]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Status Config ─────────────────────────────────────────────────── */
const STATUS_STEPS = ['Applied', 'Under Review', 'Interview', 'Decision'];

function getStatusIndex(job: MockJob): number {
  const n = job.id.length % 4;
  return n === 0 ? 1 : n === 1 ? 2 : n === 2 ? 3 : 0;
}

/* ─── Application Card ──────────────────────────────────────────────── */
function ApplicationCard({ job }: { job: MockJob }) {
  const currentStep = getStatusIndex(job);

  return (
    <div className="bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-[20px] p-6 md:p-8 hover:border-primary/30 hover:shadow-[0_4px_24px_rgba(0,122,255,0.07)] transition-all duration-300 group">
      
      {/* Top Row: Job Info + Link */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-[14px] bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border flex items-center justify-center shrink-0 text-[18px] font-bold text-[#6B7280] dark:text-text-secondary group-hover:scale-105 transition-transform duration-300">
            {job.company.charAt(0)}
          </div>

          <div className="min-w-0">
            <Link href={`/jobs/${job.id}`}>
              <h3 className="text-[17px] font-extrabold text-[#1D1D1F] dark:text-text-primary tracking-tight hover:text-primary transition-colors line-clamp-1">
                {job.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1 text-[14px] font-medium text-text-secondary mt-0.5">
              <Building2 size={13} />
              <span className="truncate">{job.company}</span>
            </div>
          </div>
        </div>

        {/* Status pill */}
        <span className={`shrink-0 text-[12px] font-bold px-3 py-1.5 rounded-full whitespace-nowrap ${
          currentStep === 0 ? 'bg-blue-50 dark:bg-blue-500/10 text-primary' :
          currentStep === 1 ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400' :
          currentStep === 2 ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400' :
          'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-500'
        }`}>
          {STATUS_STEPS[currentStep]}
        </span>
      </div>

      {/* Meta Row */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] font-semibold text-text-secondary mb-7">
        <div className="flex items-center gap-1.5">
          <MapPin size={13} />
          {job.location}
        </div>
        <div className="flex items-center gap-1.5">
          <DollarSign size={13} />
          {job.salary}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={13} />
          Applied today
        </div>
      </div>

      {/* Progress Track */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-[13px] left-[calc(12.5%)] right-[calc(12.5%)] h-[2px] bg-[#E8EAF0] dark:bg-[#2A2A2A] rounded-full" />

        {/* Active line */}
        <div
          className="absolute top-[13px] left-[calc(12.5%)] h-[2px] bg-primary rounded-full transition-all duration-700 ease-out"
          style={{ width: `${(currentStep / (STATUS_STEPS.length - 1)) * 75}%` }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentStep;
            const active = idx === currentStep;
            return (
              <div key={step} className="flex flex-col items-center gap-2 w-[25%]">
                <div
                  className={`w-[26px] h-[26px] rounded-full flex items-center justify-center border-2 transition-all duration-500 ${
                    done
                      ? 'bg-primary border-primary text-white shadow-[0_0_0_4px_rgba(0,122,255,0.12)]'
                      : 'bg-white dark:bg-surface border-[#D1D5DB] dark:border-[#333]'
                  } ${active ? 'scale-110' : ''}`}
                >
                  {done
                    ? <CheckCircle2 size={14} strokeWidth={2.5} />
                    : <Circle size={8} className="text-[#D1D5DB] dark:text-[#555] fill-current" />
                  }
                </div>
                <span
                  className={`text-[11px] font-bold text-center leading-tight transition-colors ${
                    active ? 'text-primary' : done ? 'text-[#1D1D1F] dark:text-text-primary' : 'text-[#C0C4CC] dark:text-[#555]'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Stats Bar ─────────────────────────────────────────────────────── */
function StatsBar({ jobs }: { jobs: MockJob[] }) {
  const counts = [0, 1, 2, 3].map(i => jobs.filter(j => getStatusIndex(j) === i).length);
  const labels = ['Applied', 'In Review', 'Interview', 'Decision'];
  const colors = ['text-primary', 'text-amber-500', 'text-purple-500', 'text-green-500'];
  const bgs = ['bg-blue-50 dark:bg-primary/10', 'bg-amber-50 dark:bg-amber-500/10', 'bg-purple-50 dark:bg-purple-500/10', 'bg-green-50 dark:bg-green-500/10'];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      {labels.map((label, i) => (
        <div key={label} className={`${bgs[i]} rounded-[16px] p-4 border border-[#E8EAF0] dark:border-border`}>
          <span className={`text-[28px] font-extrabold block leading-none mb-1 ${colors[i]}`}>{counts[i]}</span>
          <span className="text-[13px] font-semibold text-text-secondary">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────────────── */
export default function ApplicationsPage() {
  const { jobs, loading } = useJobs();
  const [appliedJobIds, setAppliedJobIds] = useState<string[]>([]);

  useEffect(() => {
    const loadApplied = () => {
      try {
        setAppliedJobIds(JSON.parse(localStorage.getItem('applied_jobs') || '[]'));
      } catch {}
    };
    loadApplied();

    const onStorage = (e: StorageEvent) => { if (e.key === 'applied_jobs') loadApplied(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener('sync_applied_jobs', loadApplied);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('sync_applied_jobs', loadApplied);
    };
  }, []);

  const appliedJobs = jobs.filter(j => appliedJobIds.includes(j.id));

  return (
    <div className="flex flex-col min-h-full max-w-4xl mx-auto w-full px-4 md:px-8 py-8 md:py-12">

      {/* Back Link */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-text-secondary font-bold text-[14px] mb-8 hover:text-primary transition-colors w-max group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        Back to Jobs
      </Link>

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-8">
        {/* Icon + Title */}
        <div className="flex items-center gap-4 mb-3">
          <div className="w-12 h-12 rounded-[14px] bg-primary/10 dark:bg-primary/20 flex items-center justify-center shrink-0">
            <FileText size={22} className="text-primary" />
          </div>
          <div>
            <h1 className="text-[30px] md:text-[38px] font-extrabold text-[#1D1D1F] dark:text-text-primary tracking-tight leading-tight">
              My Applications
            </h1>
            <p className="text-[15px] text-text-secondary font-medium mt-0.5">
              {appliedJobs.length > 0
                ? `Tracking ${appliedJobs.length} active application${appliedJobs.length > 1 ? 's' : ''}`
                : 'Track the status of every job you apply to'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-[#E8EAF0] dark:bg-border mt-6" />
      </div>

      {/* ── Content ─────────────────────────────────────────────────── */}
      {loading ? (
        <>
          {/* Skeleton stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            {[1,2,3,4].map(i => (
              <div key={i} className="bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-[16px] p-4 animate-pulse h-[72px]" />
            ))}
          </div>
          {/* Skeleton cards */}
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map(i => <SkeletonTracker key={i} />)}
          </div>
        </>

      ) : appliedJobs.length === 0 ? (

        /* ── Empty State ──────────────────────────────────────────── */
        <div className="flex flex-col items-center justify-center text-center py-20">
          <div className="w-20 h-20 rounded-[24px] bg-[#F7F8FA] dark:bg-surface border border-[#E8EAF0] dark:border-border flex items-center justify-center mb-6">
            <Briefcase size={30} className="text-[#C0C4CC] dark:text-[#555]" />
          </div>
          <h2 className="text-[24px] font-extrabold text-[#1D1D1F] dark:text-text-primary mb-3">
            No applications yet
          </h2>
          <p className="text-[15px] text-text-secondary max-w-sm leading-relaxed mb-8">
            You haven&apos;t applied to any jobs yet. Start exploring opportunities that match your skills.
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white text-[15px] font-bold rounded-xl hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm shadow-primary/25 group"
          >
            Browse Open Roles
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

      ) : (

        /* ── Applications List ────────────────────────────────────── */
        <>
          <StatsBar jobs={appliedJobs} />
          <div className="flex flex-col gap-4">
            {appliedJobs.map(job => (
              <ApplicationCard key={job.id} job={job} />
            ))}
          </div>
        </>

      )}
    </div>
  );
}
