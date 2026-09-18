'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ChevronRight, CheckCircle2, Circle } from 'lucide-react';

interface ProfileCompletionCardProps {
  percent: number;
  profile: {
    name?: string;
    yearsExperience?: number;
    skills?: string[];
    certifications?: string[];
  } | null;
  onAction?: (action: string) => void;
}

const STEPS = [
  { key: 'name', label: 'Basic information', href: '/profile', action: 'editProfile' },
  { key: 'experience', label: 'Add experience', href: '/profile', action: 'addExp' },
  { key: 'skills', label: 'Add skills', href: '/profile', action: 'editSkills' },
  { key: 'certifications', label: 'Add certifications', href: '/profile', action: 'addCert' },
];

function getStepStatus(profile: ProfileCompletionCardProps['profile']): Record<string, boolean> {
  if (!profile) return {};
  return {
    name: (profile.name || '').trim() !== '' && profile.name !== 'New User',
    experience: (profile.yearsExperience || 0) > 0,
    skills: (profile.skills || []).length > 0,
    certifications: (profile.certifications || []).length > 0,
  };
}

function getNextStep(stepStatus: Record<string, boolean>): string {
  if (!stepStatus.name) return 'Add your name to get started';
  if (!stepStatus.experience) return 'Add your years of experience';
  if (!stepStatus.skills) return 'Add skills to unlock job matches';
  if (!stepStatus.certifications) return 'Add certifications to strengthen your profile';
  if (!stepStatus.certifications) return 'Add certifications to strengthen your profile';
  return 'Your profile is complete!';
}

function getNextAction(stepStatus: Record<string, boolean>): string {
  if (!stepStatus.name) return 'editProfile';
  if (!stepStatus.experience) return 'addExp';
  if (!stepStatus.skills) return 'editSkills';
  if (!stepStatus.certifications) return 'addCert';
  return '';
}

// SVG Circular progress ring
function CircleRing({ percent }: { percent: number }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const [offset, setOffset] = useState(circ);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circ - (percent / 100) * circ);
    }, 100);
    return () => clearTimeout(timer);
  }, [percent, circ]);

  return (
    <div className="relative w-[72px] h-[72px] shrink-0" aria-label={`${percent}% profile strength`}>
      <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
        {/* Track */}
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="5" className="stroke-[#F3F4F6]" />
        {/* Progress */}
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="5"
          stroke="#007AFF"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-extrabold text-[#1D1D1F] leading-none tracking-tight ${percent === 100 ? 'text-[15px]' : 'text-[16px]'}`}>{percent}%</span>
        <span className="text-[9px] font-semibold text-[#6B7280] uppercase tracking-wide mt-0.5">Done</span>
      </div>
    </div>
  );
}

export default function ProfileCompletionCard({ percent, profile, onAction }: ProfileCompletionCardProps) {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);
  const stepStatus = getStepStatus(profile);
  const nextStep = getNextStep(stepStatus);
  const nextAction = getNextAction(stepStatus);
  const isComplete = clampedPercent >= 100;

  const handleContinue = (e: React.MouseEvent) => {
    if (onAction && nextAction) {
      e.preventDefault();
      onAction(nextAction);
    }
  };

  return (
    <div className="bg-white border border-[#E8EAF0] rounded-[20px] p-6">
      {/* Top row: title + ring */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-bold text-[#1D1D1F] mb-1">
            {isComplete ? 'Profile complete ✓' : 'Complete your profile'}
          </h2>
          <p className="text-[13px] text-[#6B7280] leading-relaxed">
            {isComplete
              ? "You're all set to receive the best job matches."
              : nextStep}
          </p>
        </div>
        <CircleRing percent={clampedPercent} />
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden mb-5">
        <div
          className="h-full bg-[#007AFF] rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${clampedPercent}%` }}
        />
      </div>

      {/* Checklist */}
      <div className="space-y-2 mb-5">
        {STEPS.map((step) => {
          const done = stepStatus[step.key] === true;
          
          const content = (
            <>
              {done ? (
                <CheckCircle2 size={16} className="text-[#059669] shrink-0" strokeWidth={2.5} />
              ) : (
                <Circle size={16} className="text-[#D1D5DB] shrink-0" strokeWidth={2} />
              )}
              <span
                className={`text-[14px] font-medium ${
                  done
                    ? 'text-[#6B7280] line-through decoration-[#D1D5DB]'
                    : 'text-[#374151] group-hover:text-[#007AFF] transition-colors'
                }`}
              >
                {step.label}
              </span>
              {!done && (
                <ChevronRight
                  size={13}
                  className="ml-auto text-[#D1D5DB] group-hover:text-[#007AFF] transition-colors"
                />
              )}
            </>
          );

          if (onAction) {
            return (
              <button
                key={step.key}
                onClick={() => onAction(step.action)}
                className="flex items-center gap-3 group py-1 text-left w-full"
                disabled={done}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={step.key}
              href={step.href}
              className="flex items-center gap-3 group py-1"
            >
              {content}
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      {!isComplete && (
        onAction ? (
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#007AFF] text-white text-[14px] font-semibold rounded-[10px] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Continue profile
            <ChevronRight size={15} />
          </button>
        ) : (
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#007AFF] text-white text-[14px] font-semibold rounded-[10px] hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Continue profile
            <ChevronRight size={15} />
          </Link>
        )
      )}
    </div>
  );
}
