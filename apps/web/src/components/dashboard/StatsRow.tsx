import Link from 'next/link';
import { Briefcase, Zap, Award, ArrowRight } from 'lucide-react';

interface InsightStatProps {
  value: number;
  label: string;
  icon: React.ReactNode;
  href: string;
  accentColor: string;
  emptyAction?: string;
  emptyHref?: string;
}

function InsightStat({
  value,
  label,
  icon,
  href,
  accentColor,
  emptyAction,
  emptyHref,
}: InsightStatProps) {
  const isEmpty = value === 0;

  return (
    <Link
      href={href}
      className="group flex flex-col bg-white border border-[#E8EAF0] rounded-[18px] p-5 hover:border-[#C7D0DE] hover:-translate-y-[1px] hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-200"
    >
      {/* Icon */}
      <div
        className="w-9 h-9 rounded-[10px] flex items-center justify-center mb-3 shrink-0"
        style={{ backgroundColor: `${accentColor}12`, color: accentColor }}
      >
        {icon}
      </div>

      {/* Value */}
      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-[32px] font-extrabold text-[#1D1D1F] tracking-tight leading-none">
          {value}
        </span>
      </div>

      {/* Label */}
      <p className="text-[13px] font-semibold text-[#6B7280] mb-2">{label}</p>

      {/* Sub-line */}
      <div className="mt-auto pt-2 border-t border-[#F3F4F6]">
        {isEmpty && emptyAction ? (
          <span className="text-[12px] font-medium text-[#007AFF] flex items-center gap-1 group-hover:gap-1.5 transition-all">
            {emptyAction}
            <ArrowRight size={11} />
          </span>
        ) : (
          <span className="text-[12px] font-medium text-[#6B7280] flex items-center gap-1">
            {value > 0 ? `${value} active` : 'None added'}
          </span>
        )}
      </div>
    </Link>
  );
}

interface StatsRowProps {
  jobCount: number;
  skillCount: number;
  certCount: number;
}

export default function StatsRow({ jobCount, skillCount, certCount }: StatsRowProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      <InsightStat
        value={jobCount}
        label="Active Matches"
        icon={<Briefcase size={18} />}
        href="/jobs"
        accentColor="#007AFF"
        emptyAction="Browse jobs"
        emptyHref="/jobs"
      />
      <InsightStat
        value={skillCount}
        label="Skills Added"
        icon={<Zap size={18} />}
        href="/profile"
        accentColor="#7C3AED"
        emptyAction="Add skills"
        emptyHref="/profile"
      />
      <InsightStat
        value={certCount}
        label="Certifications"
        icon={<Award size={18} />}
        href="/certifications"
        accentColor="#059669"
        emptyAction="Add certification"
        emptyHref="/certifications"
      />
    </div>
  );
}
