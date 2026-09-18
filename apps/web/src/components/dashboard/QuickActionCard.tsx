import { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  actionText: string;
  href: string;
  icon?: ReactNode;
  accentColor?: string;
}

export default function QuickActionCard({ title, actionText, href, icon, accentColor = '#007AFF' }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="bg-surface border border-border rounded-[16px] p-4 flex items-center justify-between gap-3 hover:bg-background transition-colors active:scale-[0.98] group"
    >
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${accentColor}15` }}
          >
            <div style={{ color: accentColor }}>{icon}</div>
          </div>
        )}
        <span className="text-[15px] font-semibold text-text-primary truncate">{title}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0" style={{ color: accentColor }}>
        <span className="text-[14px] font-bold">{actionText}</span>
        <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
      </div>
    </Link>
  );
}
