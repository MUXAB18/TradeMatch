import { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { MockJob } from '@/lib/mockData';
import { useUserProfile } from '@/hooks/useUserProfile';
import { toast } from '@/components/ui/toast';
import { useAppliedJob } from '@/hooks/useAppliedJob';

interface ApplicationModalProps {
  job: MockJob;
  onClose: () => void;
}

export default function ApplicationModal({ job, onClose }: ApplicationModalProps) {
  const { profile } = useUserProfile();
  const { markAsApplied } = useAppliedJob(job.id);
  const [step, setStep] = useState<'review' | 'success'>('review');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In a real app, this would check if the profile has missing required fields
  const isProfileComplete = profile && profile.trade && profile.yearsExperience > 0;

  const handleApply = () => {
    setIsSubmitting(true);
    // Simulate network request
    setTimeout(() => {
      setIsSubmitting(false);
      markAsApplied();
      setStep('success');
      toast.success(`Application submitted for ${job.title}!`, {
        title: 'Application Sent',
        action: { label: 'View Status', onClick: () => {} }
      });
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-50 w-[90vw] sm:w-[500px] bg-white dark:bg-surface border border-[#E8EAF0] dark:border-border rounded-2xl shadow-2xl overflow-hidden transform-gpu">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8EAF0] dark:border-border">
          <h2 className="text-[18px] font-bold text-[#1D1D1F] dark:text-text-primary">
            {step === 'review' ? 'Review Application' : 'Application Sent'}
          </h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] dark:text-text-secondary hover:bg-[#F7F8FA] dark:hover:bg-background transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'review' ? (
            <>
              {/* Job Summary */}
              <div className="flex items-start gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border flex items-center justify-center shrink-0">
                  <span className="text-[20px] font-bold text-[#6B7280] dark:text-text-secondary">{job.company.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="text-[16px] font-bold text-[#1D1D1F] dark:text-text-primary mb-1">{job.title}</h3>
                  <p className="text-[14px] font-medium text-[#6B7280] dark:text-text-secondary">{job.company} • {job.location}</p>
                </div>
              </div>

              {/* Profile Status */}
              <div className="space-y-4 mb-8">
                <h4 className="text-[15px] font-bold text-[#1D1D1F] dark:text-text-primary">Your Profile</h4>
                
                {isProfileComplete ? (
                  <div className="flex gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <CheckCircle2 size={20} className="text-green-500 shrink-0" />
                    <div>
                      <p className="text-[14px] font-bold text-[#1D1D1F] dark:text-text-primary mb-1">Ready to apply</p>
                      <p className="text-[13px] text-[#6B7280] dark:text-text-secondary leading-relaxed">
                        Your profile looks great. We will share your trade experience, certifications, and contact info with the employer.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-3 bg-warning/10 border border-warning/20 rounded-xl p-4">
                    <AlertCircle size={20} className="text-warning shrink-0" />
                    <div>
                      <p className="text-[14px] font-bold text-[#1D1D1F] dark:text-text-primary mb-1">Profile incomplete</p>
                      <p className="text-[13px] text-[#6B7280] dark:text-text-secondary leading-relaxed mb-3">
                        You have missing information in your profile. Employers are 80% more likely to respond to complete profiles.
                      </p>
                      <button className="text-[13px] font-bold text-primary hover:underline">
                        Update Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-xl bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border text-[#1D1D1F] dark:text-text-primary font-bold text-[15px] hover:border-primary/40 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleApply}
                  disabled={isSubmitting}
                  className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold text-[15px] hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Submit Application'
                  )}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <h3 className="text-[20px] font-bold text-[#1D1D1F] dark:text-text-primary mb-2">Application Submitted!</h3>
              <p className="text-[15px] text-[#6B7280] dark:text-text-secondary mx-auto max-w-[320px] leading-relaxed mb-8">
                Your profile has been successfully sent to <span className="font-semibold text-[#1D1D1F] dark:text-text-primary">{job.company}</span>. 
                They usually respond within 3-5 business days.
              </p>
              <button 
                onClick={onClose}
                className="w-full py-3.5 rounded-xl bg-[#F7F8FA] dark:bg-background border border-[#E8EAF0] dark:border-border text-[#1D1D1F] dark:text-text-primary font-bold text-[15px] hover:border-primary/40 transition-colors"
              >
                Back to Jobs
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
