'use client';

import { useState, useEffect } from 'react';
import { getWorkers } from '@/lib/services/users';
import { User } from '@/types';
import Link from 'next/link';
import { Search, MapPin, Briefcase } from 'lucide-react';
import { VerificationBadge } from '@/components/verification/VerificationBadge';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tradeFilter, setTradeFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    async function loadCandidates() {
      setLoading(true);
      try {
        const filters: any = {};
        if (tradeFilter) filters.trade = tradeFilter;
        if (countryFilter) filters.country = countryFilter;
        const data = await getWorkers(filters);
        setCandidates(data);
      } catch (error) {
        console.error('Error loading candidates:', error);
      } finally {
        setLoading(false);
      }
    }
    
    // In a real app we'd debounce this, but for now we just load on change
    const timer = setTimeout(() => {
      loadCandidates();
    }, 300);
    return () => clearTimeout(timer);
  }, [tradeFilter, countryFilter]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Search Candidates</h1>
        <p className="text-gray-500">Find verified workers for your open roles.</p>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <select 
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
            value={tradeFilter}
            onChange={(e) => setTradeFilter(e.target.value)}
          >
            <option value="">Any Trade</option>
            <option value="electrician">Electrician</option>
            <option value="plumber">Plumber</option>
            <option value="hvac">HVAC Technician</option>
            <option value="welder">Welder</option>
            <option value="carpenter">Carpenter</option>
          </select>
        </div>
        <div className="flex-1 relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text"
            placeholder="Any Location (e.g. Dubai)"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full" /></div>
        ) : candidates.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center">
            <Search size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No candidates found</h3>
            <p className="text-gray-500">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidates.map((candidate) => (
              <div key={candidate.uid} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-xl shrink-0">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{candidate.name}</h3>
                    <p className="text-gray-500 capitalize">{candidate.trade || 'Worker'}</p>
                    {candidate.country && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} /> {candidate.country}
                      </div>
                    )}
                  </div>
                </div>

                {candidate.verificationStatus && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <VerificationBadge status={candidate.verificationStatus.identity} label="ID" />
                    <VerificationBadge status={candidate.verificationStatus.certificate} label="Cert" />
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100">
                  <Link href={`/agency/candidates/${candidate.uid}`} className="block w-full py-2.5 text-center bg-blue-50 text-blue-600 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                    View Full Profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
