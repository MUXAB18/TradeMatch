'use client';

import { useUserProfile } from '@/hooks/useUserProfile';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Briefcase, MessageSquare, Search, Plus } from 'lucide-react';
import { VerificationBadge } from '@/components/verification/VerificationBadge';

export default function AgencyDashboard() {
  const { profile, loading } = useUserProfile();
  const router = useRouter();

  useEffect(() => {
    if (!loading && profile?.role === 'worker') {
      router.replace('/home');
    }
  }, [profile, loading, router]);

  const recentCandidates = [
    { id: '1', name: 'Ahmad M.', trade: 'electrician', location: 'Dubai, UAE', verificationStatus: { identity: 'verified', certificate: 'verified', experience: 'submitted' } },
    { id: '2', name: 'Tariq R.', trade: 'plumber', location: 'Riyadh, KSA', verificationStatus: { identity: 'verified', certificate: 'verified', experience: 'verified' } },
    { id: '3', name: 'Zain A.', trade: 'hvac', location: 'Doha, Qatar', verificationStatus: { identity: 'verified', certificate: 'submitted', experience: 'unverified' } },
  ];

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Agency Dashboard</h1>
        <p className="text-gray-500">Welcome back, {profile?.agencyProfile?.companyName || profile?.name || 'Recruiter'}</p>
      </header>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Shortlisted</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">12</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center">
            <Users size={24} className="text-blue-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Active Jobs</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">4</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center">
            <Briefcase size={24} className="text-green-600" />
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">Messages</p>
            <p className="text-3xl font-extrabold text-gray-900 mt-1">3</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center">
            <MessageSquare size={24} className="text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-4 mb-10">
        <Link href="/agency/candidates" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <Search size={18} />
          Search Candidates
        </Link>
        <Link href="/agency/jobs" className="bg-white border border-gray-200 text-gray-900 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 transition-colors">
          <Plus size={18} />
          Post a Job
        </Link>
      </div>

      {/* Recent Candidates */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-gray-900">Recently Verified Candidates</h2>
          <Link href="/agency/candidates" className="text-blue-600 font-bold hover:underline">View All</Link>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wide">Candidate</th>
                <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wide">Trade</th>
                <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wide">Location</th>
                <th className="py-4 px-6 font-bold text-gray-500 text-sm uppercase tracking-wide">Verification</th>
                <th className="py-4 px-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentCandidates.map((candidate) => (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">{candidate.name}</div>
                  </td>
                  <td className="py-4 px-6 capitalize text-gray-600">{candidate.trade}</td>
                  <td className="py-4 px-6 text-gray-600">{candidate.location}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <VerificationBadge status={candidate.verificationStatus.identity as any} label="ID" />
                      <VerificationBadge status={candidate.verificationStatus.certificate as any} label="Cert" />
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link href={`/agency/candidates/${candidate.id}`} className="text-blue-600 font-semibold hover:underline">
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
