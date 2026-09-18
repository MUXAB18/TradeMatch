import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
  /** Breadcrumb back link */
  backHref?: string;
  backLabel?: string;
}

export default function PageHeader({ title, subtitle, rightSlot, backHref, backLabel }: PageHeaderProps) {
  return (
    <div className="bg-surface border-b border-border px-6 py-6 shrink-0">
      {backHref && (
        <Link
          href={backHref}
          className="flex items-center gap-1 text-primary text-sm font-semibold mb-3 w-max hover:opacity-80 transition-opacity"
        >
          <ChevronRight size={14} className="rotate-180" />
          {backLabel || 'Back'}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-[26px] font-extrabold text-text-primary tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-base text-text-secondary mt-1.5 leading-relaxed">{subtitle}</p>
          )}
        </div>
        {rightSlot && <div className="shrink-0">{rightSlot}</div>}
      </div>
    </div>
  );
}
