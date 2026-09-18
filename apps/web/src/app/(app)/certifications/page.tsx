'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useCertifications } from '@/hooks/useCertifications';
import { updateUserProfile } from '@/lib/services/users';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';

export default function CertificationsPage() {
  const { user: authUser } = useAuth();
  const { profile, loading: profileLoading, setProfile } = useUserProfile();
  
  const trade = profile?.trade;
  const country = profile?.country;
  const userCerts = profile?.certifications || [];
  
  const { certifications, loading: certsLoading } = useCertifications(trade, country);
  
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleCertification = async (certId: string, hasCert: boolean) => {
    if (!authUser || !profile) return;
    
    setUpdatingId(certId);
    
    try {
      const newCerts = hasCert
        ? [...userCerts, certId] // Add
        : userCerts.filter(id => id !== certId); // Remove
      
      await updateUserProfile(authUser.uid, { certifications: newCerts });
      setProfile({ ...profile, certifications: newCerts });
    } catch (err) {
      console.error('Failed to update certification', err);
      // In a real app, show a toast here
    } finally {
      setUpdatingId(null);
    }
  };

  if (profileLoading || (trade && certsLoading)) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Certifications" subtitle="Manage your active qualifications" />
        <div className="flex justify-center items-center flex-1">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (!trade || !country) {
    return (
      <div className="flex flex-col min-h-full">
        <PageHeader title="Certifications" subtitle="Manage your active qualifications" />
        <div className="flex-1 px-5 py-6 max-w-2xl">
          <div className="bg-surface p-8 rounded-[20px] border border-border text-center">
            <p className="text-text-secondary text-[15px] leading-relaxed">Please set your Trade and Country in your Profile first.</p>
          </div>
        </div>
      </div>
    );
  }

  const requiredCerts = certifications.filter(c => c.required);
  const recommendedCerts = certifications.filter(c => !c.required);

  const CertCard = ({ cert }: { cert: any }) => {
    const hasCert = userCerts.includes(cert.id!);
    const isUpdating = updatingId === cert.id;

    return (
      <div className={`p-5 rounded-[20px] border flex items-start gap-4 transition-colors ${hasCert ? 'bg-success/5 border-success/30' : 'bg-surface border-border'}`}>
        <button
          onClick={() => toggleCertification(cert.id!, !hasCert)}
          disabled={isUpdating}
          className={`flex-shrink-0 mt-1 w-6 h-6 rounded-md border flex items-center justify-center transition-colors
            ${hasCert ? 'bg-success border-success' : 'border-text-secondary bg-transparent'}
            ${isUpdating ? 'opacity-50' : 'hover:opacity-80'}
          `}
        >
          {hasCert && (
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </button>
        <div>
          <h3 className={`font-bold text-lg ${hasCert ? 'text-text-primary' : 'text-text-primary'}`}>{cert.name}</h3>
          <p className="text-text-secondary mt-1 text-[15px] leading-relaxed">{cert.description}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-full">
      <PageHeader
        title="Certifications"
        subtitle={`Required qualifications for ${trade.charAt(0).toUpperCase() + trade.slice(1)}`}
      />
      <main className="flex-1 px-5 py-6 max-w-2xl w-full">

      {certifications.length === 0 ? (
        <div className="bg-surface p-8 rounded-[20px] border border-border text-center">
          <p className="text-text-secondary">No certifications found for your trade and country.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {requiredCerts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-error"></span>
                Required for {trade}
              </h2>
              <div className="space-y-4">
                {requiredCerts.map(cert => (
                  <CertCard key={cert.id} cert={cert} />
                ))}
              </div>
            </section>
          )}

          {recommendedCerts.length > 0 && (
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary"></span>
                Recommended
              </h2>
              <div className="space-y-4">
                {recommendedCerts.map(cert => (
                  <CertCard key={cert.id} cert={cert} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
      </main>
    </div>
  );
}
