import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ProfileSectionProps {
  title: string;
  icon?: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
  /** If true the card has no visible inner padding (e.g. for lists) */
  noPadding?: boolean;
}

export default function ProfileSection({
  title,
  icon,
  onEdit,
  children,
  noPadding = false,
}: ProfileSectionProps) {
  return (
    <div className="bg-surface rounded-[20px] border border-border shadow-sm overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          {icon && (
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <div className="text-primary">{icon}</div>
            </div>
          )}
          <h2 className="text-[16px] font-bold text-text-primary">{title}</h2>
        </div>
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center gap-1 text-primary font-bold text-[14px] hover:opacity-80 transition-opacity"
          >
            Edit
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className={noPadding ? '' : 'px-5 py-4'}>{children}</div>
    </div>
  );
}
