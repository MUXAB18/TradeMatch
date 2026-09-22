import { getInitials } from '@/lib/utils';
import { MapPin, Briefcase, ShieldCheck } from 'lucide-react';
import { User } from '@/types';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { profileKey } from '@/lib/utils';

interface ProfileHeaderProps {
  profile: User | null;
  onEdit: () => void;
}

export default function ProfileHeader({ profile, onEdit }: ProfileHeaderProps) {
  const name = profile?.name || 'Your Name';
  const initials = getInitials(name);
  
  const trade = profile?.trade ? profile.trade.charAt(0).toUpperCase() + profile.trade.slice(1) : null;
  const isAvailable = profile?.availability === 'immediate';

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const localData = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(profileKey(user?.uid)) || '{}') : {};
    if (localData.photoUrl) {
      setPhotoUrl(localData.photoUrl);
    }
  }, [user?.uid]);

  return (
    <div className="bg-white border border-[#E8EAF0] rounded-[24px] p-6 sm:p-8 relative overflow-hidden">
      {/* Decorative top band */}
      <div className="absolute top-0 start-0 end-0 h-24 bg-gradient-to-r from-[#F0F5FF] to-[#F8FAFC]" />
      
      <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6 mt-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          {/* Avatar */}
          <div className="w-[100px] h-[100px] rounded-full bg-[#007AFF] text-white flex items-center justify-center text-[36px] font-extrabold shadow-lg shrink-0 border-4 border-white overflow-hidden">
            {photoUrl ? (
              <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
              <h1 className="text-[32px] sm:text-[36px] font-extrabold text-[#1D1D1F] tracking-tight leading-none">
                {name}
              </h1>
              {profile?.verificationStatus && (
                <div className="flex items-center gap-1.5 mt-1 sm:mt-0">
                  <VerificationBadge status={profile.verificationStatus.identity} label="ID" />
                  <VerificationBadge status={profile.verificationStatus.certificate} label="Cert" />
                </div>
              )}
            </div>
            
            {trade && (
              <p className="text-[18px] font-semibold text-[#374151] mb-2">{trade} Professional</p>
            )}
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
              {profile?.country && (
                <div className="flex items-center gap-1.5 text-[14px] text-[#6B7280] font-medium">
                  <MapPin size={15} className="opacity-70" />
                  {profile.country}
                </div>
              )}
              {isAvailable && (
                <div className="flex items-center gap-1.5 text-[14px] text-[#059669] font-semibold bg-[#ECFDF5] px-2.5 py-1 rounded-md">
                  <Briefcase size={14} />
                  Open to opportunities
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={onEdit}
          className="shrink-0 px-5 py-2.5 bg-[#007AFF] text-white font-semibold text-[14px] rounded-xl hover:opacity-90 transition-all w-full sm:w-auto text-center"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
}
