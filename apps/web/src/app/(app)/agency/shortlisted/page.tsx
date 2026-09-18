'use client';

import { useState, useEffect } from 'react';
import { getShortlist } from '@/lib/services/users';
import { ShortlistEntry, User } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { Bookmark, MapPin, MessageSquare, Clock } from 'lucide-react';
import { VerificationBadge } from '@/components/verification/VerificationBadge';

export default function ShortlistedPage() {
  const { user } = useAuth();
  const [shortlist, setShortlist] = useState<(ShortlistEntry & { worker: User })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadShortlist() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getShortlist(user.uid);
        // We're passing a mock worker object in the getShortlist mock for now
        // In a real app we'd fetch the worker details for each ID
        setShortlist(data as any);
      } catch (error) {
        console.error('Error loading shortlist:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadShortlist();
  }, [user]);

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Shortlisted Candidates</h1>
        <p className="text-gray-500">Manage and contact the candidates you've saved.</p>
      </header>

      {/* Results */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 flex justify-center"><div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full" /></div>
        ) : shortlist.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-gray-200 text-center shadow-sm">
            <Bookmark size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No shortlisted candidates</h3>
            <p className="text-gray-500 mb-6">You haven't saved any candidates yet.</p>
            <Link href="/agency/candidates" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors inline-block">
              Search Candidates
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shortlist.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full relative">
                
                <div className="absolute top-4 right-4 text-gray-400 flex items-center gap-1 text-xs font-medium">
                  <Clock size={12} />
                  {new Date(item.createdAt.toMillis ? item.createdAt.toMillis() : Date.now()).toLocaleDateString()}
                </div>

                <div className="flex items-start gap-4 mb-4 mt-2">
                  <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-extrabold text-xl shrink-0">
                    {item.worker.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.worker.name}</h3>
                    <p className="text-gray-500 capitalize">{item.worker.trade || 'Worker'}</p>
                    {item.worker.country && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <MapPin size={14} /> {item.worker.country}
                      </div>
                    )}
                  </div>
                </div>

                {item.worker.verificationStatus && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    <VerificationBadge status={item.worker.verificationStatus.identity} label="ID" />
                    <VerificationBadge status={item.worker.verificationStatus.certificate} label="Cert" />
                  </div>
                )}

                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                  <Link href={`/agency/candidates/${item.workerId}`} className="flex-1 py-2.5 text-center bg-gray-50 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                    Profile
                  </Link>
                  <button className="flex-1 py-2.5 flex items-center justify-center gap-2 bg-blue-50 text-blue-700 font-bold rounded-xl hover:bg-blue-100 transition-colors">
                    <MessageSquare size={16} /> Contact
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
