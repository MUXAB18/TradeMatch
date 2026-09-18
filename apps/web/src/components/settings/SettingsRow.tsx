import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface SettingsRowProps {
  icon?: ReactNode;
  accentColor?: string;
  title: string;
  subtitle?: string;
  rightElement?: ReactNode;
  onPress?: () => void;
  /** Use text-error style */
  danger?: boolean;
  /** Hide the bottom divider */
  isLast?: boolean;
}

export default function SettingsRow({
  icon,
  accentColor = '#007AFF',
  title,
  subtitle,
  rightElement,
  onPress,
  danger = false,
  isLast = false,
}: SettingsRowProps) {
  const Element = onPress ? 'button' : 'div';

  return (
    <Element
      onClick={onPress}
      className={`
        flex items-center gap-4 px-5 py-4 w-full text-left transition-colors
        ${onPress ? 'hover:bg-background/70 active:bg-background cursor-pointer' : ''}
        ${!isLast ? 'border-b border-border/60' : ''}
      `}
    >
      {icon && (
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${danger ? '#FF3B30' : accentColor}18` }}
        >
          <div style={{ color: danger ? '#FF3B30' : accentColor }}>{icon}</div>
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p
          className={`text-[15px] font-semibold leading-tight ${
            danger ? 'text-error' : 'text-text-primary'
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <p className="text-[13px] text-text-secondary mt-0.5 leading-tight">{subtitle}</p>
        )}
      </div>

      <div className="shrink-0 flex items-center gap-2">
        {rightElement}
        {onPress && !rightElement && (
          <ChevronRight size={16} className="text-text-secondary opacity-50" />
        )}
      </div>
    </Element>
  );
}
