'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserProfile } from '@/lib/services/users';
import { updateAgencyProfile } from '@/lib/services/agencies';
import { TRADES, GULF_COUNTRIES, ORIGIN_COUNTRIES } from '@/types';
import Link from 'next/link';
import { auth, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';
import { useRef } from 'react';

type Step = 1 | 2 | 3 | 4;

export default function AgencyOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [hiringTrades, setHiringTrades] = useState<string[]>([]);
  const [targetCountries, setTargetCountries] = useState<string[]>([]);
  
  const [businessLicenseUrl, setBusinessLicenseUrl] = useState('');
  const [uploadingLicense, setUploadingLicense] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (profile) {
      if (profile.role === 'worker') {
        router.push('/onboarding');
      } else {
        setContactName(profile.name || user?.displayName || '');
        setBusinessEmail(profile.email || user?.email || '');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 3) as Step);
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const toggleTrade = (tradeId: string) => {
    setHiringTrades(prev => 
      prev.includes(tradeId) ? prev.filter(id => id !== tradeId) : [...prev, tradeId]
    );
  };

  const toggleCountry = (c: string) => {
    setTargetCountries(prev => 
      prev.includes(c) ? prev.filter(country => country !== c) : [...prev, c]
    );
  };

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    try {
      // 1. Update basic user doc
      await updateUserProfile(user.uid, {
        name: contactName,
        country,
        onboardingCompleted: true,
      });

      // 2. Update extended agency doc
      await updateAgencyProfile(user.uid, {
        companyName,
        contactName,
        businessEmail,
        phone,
        city,
        address,
        country,
        website,
        hiringTrades,
        hiringCountries: targetCountries,
        businessLicenseUrl,
      });

      setStep(4); // Advance to Pending Approval step instead of dashboard
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#8B5CF6]"></div></div>;
  if (!user) return null;

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[45%_55%] xl:grid-cols-2">
      {/* Left Panel - Premium Brand Side (Hidden on Mobile) */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex-col justify-between p-8 lg:p-12 xl:p-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 end-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 start-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10 w-full">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="h-10 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
              <span className="font-bold text-white tracking-wide">TradeMatch</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 w-full pe-4 lg:pe-8 mb-12 mt-8">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-[0.15em] mb-6 text-white border border-white/20 shadow-sm uppercase">
            For Agencies
          </div>
          <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-6 tracking-tight">
            Build your workforce.<br />
            <span className="text-white/80">Grow your business.</span>
          </h1>
          <p className="text-white/80 text-lg xl:text-xl leading-relaxed font-medium">
            Join the premium network of verified tradespeople and scale your hiring operations.
          </p>
        </div>

        <div className="relative z-10 w-full">
          <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold truncate">Setup your agency</p>
              <p className="text-white/70 text-sm break-words">Tell us about your company to get verified.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Side */}
      <div className="flex flex-col relative bg-gray-50/50">
        
        {/* Mobile Nav */}
        <nav className="w-full h-16 bg-white border-b border-gray-200 px-6 flex lg:hidden items-center justify-between sticky top-0 z-10">
          <Image src="/logo-v3.png" alt="TradeMatch" width={140} height={32} className="h-8 w-auto" unoptimized />
        </nav>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-[#8B5CF6] transition-all duration-500 ease-out" 
            style={{ width: `${(step / 3) * 100}%` }} 
          />
        </div>

        <main className="flex-1 w-full max-w-[560px] mx-auto p-6 pt-10 sm:pt-16 pb-24">
        
        {/* Step 1: Company Profile */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-end-8 duration-300">
            <div className="w-14 h-14 bg-[#F5F3FF] rounded-2xl flex items-center justify-center mb-6">
              <svg className="w-7 h-7 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            </div>
            <h2 className="text-[28px] font-extrabold text-gray-900 mb-2">Agency Profile</h2>
            <p className="text-[15px] text-gray-500 mb-8">Tell us about your recruitment agency.</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Company Name *</label>
                <input 
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  placeholder="e.g. Gulf Staffing Solutions"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Country HQ *</label>
                <select 
                  value={country} 
                  onChange={e => setCountry(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select base country</option>
                  {GULF_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  {ORIGIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Contact Name *</label>
                  <input 
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Business Email *</label>
                  <input 
                    type="email"
                    value={businessEmail}
                    onChange={e => setBusinessEmail(e.target.value)}
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number *</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">City *</label>
                  <input 
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder="e.g. Dubai"
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Address *</label>
                  <input 
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Street, Building, Office..."
                    className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Website (Optional)</label>
                <input 
                  type="url"
                  value={website}
                  onChange={e => setWebsite(e.target.value)}
                  placeholder="https://..."
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!companyName || !country || !contactName || !businessEmail || !phone || !city || !address}
              className="w-full h-14 mt-10 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(139,92,246,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 2: Hiring Preferences */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-end-8 duration-300">
            <button onClick={handleBack} className="text-gray-400 hover:text-gray-900 mb-6 flex items-center gap-1 font-semibold text-sm">
              ← Back
            </button>
            <h2 className="text-[28px] font-extrabold text-gray-900 mb-2">Hiring Preferences</h2>
            <p className="text-[15px] text-gray-500 mb-8">What kind of candidates are you looking for?</p>

            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Trades you hire for</label>
            <div className="grid grid-cols-2 gap-3 mb-8">
              {TRADES.slice(0,8).map(t => (
                <button
                  key={t.id}
                  onClick={() => toggleTrade(t.id)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-2 active:scale-[0.98] ${
                    hiringTrades.includes(t.id)
                      ? 'border-[#8B5CF6] bg-[#F5F3FF] text-[#8B5CF6]' 
                      : 'border-gray-200 bg-white hover:border-[#8B5CF6]/50 text-gray-700'
                  }`}
                >
                  <span className="text-xl">{t.emoji}</span>
                  <span className="font-bold text-[14px]">{t.label}</span>
                </button>
              ))}
            </div>

            <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-3">Target Placement Countries</label>
            <div className="flex flex-wrap gap-2 mb-8">
              {GULF_COUNTRIES.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCountry(c)}
                  className={`px-4 py-2 rounded-full border-2 transition-all font-bold text-[14px] ${
                    targetCountries.includes(c)
                      ? 'border-[#8B5CF6] bg-[#F5F3FF] text-[#8B5CF6]' 
                      : 'border-gray-200 bg-white hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={hiringTrades.length === 0 || targetCountries.length === 0}
              className="w-full h-14 mt-4 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(139,92,246,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Verification (UI Only for now) */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-end-8 duration-300">
            <button onClick={handleBack} className="text-gray-400 hover:text-gray-900 mb-6 flex items-center gap-1 font-semibold text-sm">
              ← Back
            </button>
            <h2 className="text-[28px] font-extrabold text-gray-900 mb-2">Verify Agency</h2>
            <p className="text-[15px] text-gray-500 mb-8">To unlock contact info, you'll need to verify your business. This is compulsory.</p>

            <div className="p-6 bg-white border border-gray-200 rounded-2xl mb-8 relative">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">Business License *</h3>
              <p className="text-sm text-gray-500 mb-4">Upload your trade license or commercial registration (PDF, JPG, PNG).</p>
              
              <input 
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".pdf,image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !user) return;
                  try {
                    setUploadingLicense(true);
                    setError('');
                    const storageRef = ref(storage, `agencies/${user.uid}/license_${file.name}`);
                    
                    // Add an 8-second timeout to catch unconfigured Storage buckets hanging
                    const uploadPromise = uploadBytes(storageRef, file).then(() => getDownloadURL(storageRef));
                    const timeoutPromise = new Promise<string>((resolve) => setTimeout(() => resolve('TIMEOUT_ERROR'), 8000));
                    
                    const url = await Promise.race([uploadPromise, timeoutPromise]);
                    if (url === 'TIMEOUT_ERROR') {
                      throw new Error('timeout');
                    }
                    
                    setBusinessLicenseUrl(url);
                  } catch (err) {
                    console.error('Upload failed or timed out. Falling back to base64.', err);
                    // Fallback to base64 if Firebase Storage fails (e.g. not enabled or CORS issue)
                    if (file.size > 800000) {
                      setError('Storage upload failed and file is too large for database fallback. Please use a file under 800KB or configure Firebase Storage.');
                      setUploadingLicense(false);
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setBusinessLicenseUrl(reader.result as string);
                      setUploadingLicense(false);
                    };
                    reader.onerror = () => {
                      setError('Failed to read file.');
                      setUploadingLicense(false);
                    };
                    reader.readAsDataURL(file);
                    return; // exit to wait for reader
                  }
                  setUploadingLicense(false);
                }}
              />
              
              {businessLicenseUrl ? (
                <div className="w-full h-12 rounded-xl bg-green-50 text-green-700 font-bold border-2 border-green-200 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  License Uploaded
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingLicense}
                  className="w-full h-12 rounded-xl bg-gray-100 text-gray-500 hover:text-gray-900 hover:bg-gray-200 hover:border-gray-400 font-bold border-2 border-dashed border-gray-300 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingLicense ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload Document'
                  )}
                </button>
              )}
            </div>

            {error && <p className="text-red-500 mb-4 text-sm font-semibold text-center">{error}</p>}

            <button 
              onClick={handleComplete}
              disabled={loading || uploadingLicense || !businessLicenseUrl}
              className="w-full h-14 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(139,92,246,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="animate-in zoom-in-95 fade-in duration-500 text-center pt-8 w-full block">
            <div className="w-20 h-20 bg-[#F5F3FF] rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm border border-[#8B5CF6]/20">
              <svg className="w-10 h-10 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            <h2 className="text-[28px] font-extrabold text-gray-900 mb-3">Under Review</h2>
            
            <p className="w-full max-w-md mx-auto text-[15px] text-gray-600 mb-8 leading-relaxed">
              Your profile has been submitted successfully! Our administrators are currently reviewing your details. 
              <br /><br />
              You will be able to log in and access the dashboard once your agency is approved.
            </p>

            <button 
              onClick={async () => {
                await auth.signOut();
                router.push('/');
              }}
              className="w-full max-w-[280px] h-14 bg-gray-900 hover:bg-black text-white rounded-full font-bold text-[17px] shadow-lg transition-all active:scale-[0.98]"
            >
              Return Home
            </button>
          </div>
        )}

      </main>
      </div>
    </div>
  );
}
