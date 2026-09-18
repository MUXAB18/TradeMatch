import { CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { VerificationState } from '@/types';

interface VerificationBadgeProps {
  status: VerificationState;
  label?: string;
  className?: string;
}

export function VerificationBadge({ status, label, className = '' }: VerificationBadgeProps) {
  const config = {
    verified: {
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle2,
      text: 'Verified',
    },
    submitted: {
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200',
      icon: Clock,
      text: 'In Review',
    },
    attention: {
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      icon: AlertCircle,
      text: 'Needs Attention',
    },
    unverified: {
      color: 'text-gray-500',
      bg: 'bg-gray-50 border-gray-200',
      icon: XCircle,
      text: 'Not Verified',
    },
  };

  const { color, bg, icon: Icon, text } = config[status] || config.unverified;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${bg} ${color} ${className}`}>
      <Icon size={14} strokeWidth={2.5} />
      <span className="text-[11px] font-bold uppercase tracking-wider">
        {label || text}
      </span>
    </div>
  );
}
