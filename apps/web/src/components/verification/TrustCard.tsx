import { VerificationStatus } from '@/types';
import { VerificationBadge } from './VerificationBadge';
import { ShieldCheck } from 'lucide-react';

interface TrustCardProps {
  status: VerificationStatus;
}

export function TrustCard({ status }: TrustCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <ShieldCheck size={24} className="text-blue-600" />
        </div>
        <div>
          <h3 className="font-extrabold text-gray-900 text-[16px]">Trust & Verification</h3>
          <p className="text-xs text-gray-500 font-medium">Your verification status</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900">Identity</span>
            <span className="text-[12px] text-gray-500">Government ID check</span>
          </div>
          <VerificationBadge status={status.identity} />
        </div>
        
        <div className="h-px w-full bg-gray-100" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900">Certificates</span>
            <span className="text-[12px] text-gray-500">Trade qualifications</span>
          </div>
          <VerificationBadge status={status.certificate} />
        </div>

        <div className="h-px w-full bg-gray-100" />

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-gray-900">Experience</span>
            <span className="text-[12px] text-gray-500">Employment history</span>
          </div>
          <VerificationBadge status={status.experience} />
        </div>
      </div>
    </div>
  );
}
