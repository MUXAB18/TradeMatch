'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User } from '@/types';
import { ArrowLeft, MapPin, Briefcase, Download, Bookmark, Check, MessageSquare } from 'lucide-react';
import { VerificationBadge } from '@/components/verification/VerificationBadge';
import { TrustCard } from '@/components/verification/TrustCard';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { shortlistCandidate } from '@/lib/services/users';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const { user: authUser } = useAuth();
  const router = useRouter();
  
  const [candidate, setCandidate] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [shortlisting, setShortlisting] = useState(false);
  const [isShortlisted, setIsShortlisted] = useState(false);

  useEffect(() => {
    async function loadCandidate() {
      if (!id) return;
      try {
        const docRef = doc(db, 'users', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setCandidate({ id: docSnap.id, uid: docSnap.id, ...docSnap.data() } as User);
        }
      } catch (error) {
        console.error("Failed to load candidate", error);
      } finally {
        setLoading(false);
      }
    }
    loadCandidate();
  }, [id]);

  const handleShortlist = async () => {
    if (!authUser || !candidate) return;
    setShortlisting(true);
    try {
      await shortlistCandidate(authUser.uid, candidate as User & { id: string });
      setIsShortlisted(true);
    } catch (error) {
      console.error("Failed to shortlist", error);
    } finally {
      setShortlisting(false);
    }
  };

  if (loading) {
    return <div className="py-20 flex justify-center"><div className="w-8 h-8 animate-spin border-4 border-blue-500 border-t-transparent rounded-full" /></div>;
  }

  if (!candidate) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Candidate not found</h2>
        <Link href="/agency/candidates" className="text-blue-600 font-bold hover:underline">Back to search</Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-10">
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to search
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 start-0 end-0 h-24 bg-gradient-to-r from-blue-50 to-indigo-50" />
            
            <div className="relative flex flex-col sm:flex-row sm:items-start justify-between gap-6 mt-6">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className="w-[100px] h-[100px] rounded-full bg-blue-600 text-white flex items-center justify-center text-[36px] font-extrabold shadow-lg shrink-0 border-4 border-white">
                  {candidate.name.charAt(0)}
                </div>

                <div className="pt-2">
                  <h1 className="text-[32px] sm:text-[36px] font-extrabold text-gray-900 tracking-tight leading-none mb-2">
                    {candidate.name}
                  </h1>
                  
                  {candidate.trade && (
                    <p className="text-[18px] font-semibold text-gray-700 mb-2 capitalize">{candidate.trade} Professional</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                    {candidate.country && (
                      <div className="flex items-center gap-1.5 text-[14px] text-gray-500 font-medium">
                        <MapPin size={15} />
                        {candidate.country}
                      </div>
                    )}
                    {candidate.availability && (
                      <div className="flex items-center gap-1.5 text-[14px] text-green-700 font-semibold bg-green-50 px-2.5 py-1 rounded-md">
                        <Briefcase size={14} />
                        {candidate.availability}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 shrink-0">
                <button 
                  onClick={handleShortlist}
                  disabled={shortlisting || isShortlisted}
                  className={`px-6 py-3 font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                    isShortlisted 
                      ? 'bg-green-100 text-green-700 cursor-default' 
                      : 'bg-gray-900 text-white hover:bg-gray-800 active:scale-95'
                  }`}
                >
                  {isShortlisted ? (
                    <><Check size={18} /> Shortlisted</>
                  ) : shortlisting ? (
                    <div className="w-5 h-5 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    <><Bookmark size={18} /> Shortlist</>
                  )}
                </button>
                <button className="px-6 py-3 bg-blue-50 text-blue-700 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors">
                  <MessageSquare size={18} /> Message
                </button>
              </div>
            </div>
          </div>

          {/* Skills */}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Skills & Expertise</h3>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-50 border border-gray-200 text-gray-700 font-medium rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {candidate.certifications && candidate.certifications.length > 0 && (
            <div className="bg-white rounded-[24px] p-8 border border-gray-200 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Certifications</h3>
              <ul className="space-y-3">
                {candidate.certifications.map((cert, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <span className="text-gray-700 font-medium">{cert}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {candidate.verificationStatus && (
            <TrustCard status={candidate.verificationStatus} />
          )}

          <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Documents</h3>
            <button className="w-full py-3 px-4 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl flex items-center justify-between text-gray-700 font-medium transition-colors">
              <span className="flex items-center gap-2">
                <Download size={18} className="text-gray-400" />
                Resume / CV
              </span>
              <span className="text-xs text-gray-400 font-bold">PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
