import { CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import ProfileCompletionCard from '@/components/dashboard/ProfileCompletionCard';
import { TrustCard } from '@/components/verification/TrustCard';
import { User } from '@/types';
import Link from 'next/link';

interface RightSidebarProps {
  profile: User | null;
  completionPercent: number;
  onEditPreferences: () => void;
  onAction?: (action: string) => void;
}

export default function RightSidebar({ profile, completionPercent, onEditPreferences, onAction }: RightSidebarProps) {
  // Mock visibility for now since it's not in the User type, 
  // but we build the UI exactly as requested.
  const isVisible = true;

  return (
    <div className="space-y-6 sticky top-[92px]">
      {/* Profile Strength */}
      <ProfileCompletionCard percent={completionPercent} profile={profile} onAction={onAction} />

      {/* Trust Card */}
      {profile?.verificationStatus && (
        <TrustCard status={profile.verificationStatus} />
      )}

      {/* Profile Visibility */}
      <div className="bg-white border border-[#E8EAF0] rounded-[20px] p-6">
        <h3 className="text-[15px] font-extrabold text-[#1D1D1F] mb-3 uppercase tracking-wider">
          Profile visibility
        </h3>
        <div className="flex items-start gap-3">
          {isVisible ? (
            <Eye className="text-[#059669] shrink-0 mt-0.5" size={18} />
          ) : (
            <EyeOff className="text-[#6B7280] shrink-0 mt-0.5" size={18} />
          )}
          <div>
            <p className={`text-[15px] font-bold ${isVisible ? 'text-[#1D1D1F]' : 'text-[#6B7280]'}`}>
              {isVisible ? 'Visible to employers' : 'Hidden from employers'}
            </p>
            <p className="text-[13px] text-[#6B7280] mt-1 leading-relaxed">
              Your profile can be found by recruiters and companies.
            </p>
          </div>
        </div>
      </div>

      {/* Career Preferences */}
      <div className="bg-white border border-[#E8EAF0] rounded-[20px] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[15px] font-extrabold text-[#1D1D1F] uppercase tracking-wider">
            Career preferences
          </h3>
          <button 
            onClick={onEditPreferences}
            className="text-[13px] font-bold text-[#007AFF] hover:opacity-80 transition-opacity"
          >
            Edit
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide">Preferred role</p>
            <p className="text-[14px] font-semibold text-[#1D1D1F] mt-0.5 capitalize">
              {profile?.trade || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide">Location</p>
            <p className="text-[14px] font-semibold text-[#1D1D1F] mt-0.5">
              {profile?.country || 'Not specified'}
            </p>
          </div>
          <div>
            <p className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wide">Availability</p>
            <p className="text-[14px] font-semibold text-[#1D1D1F] mt-0.5 capitalize">
              {profile?.availability || 'Not specified'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
