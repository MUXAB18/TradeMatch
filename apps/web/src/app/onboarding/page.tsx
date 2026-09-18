'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { updateUserProfile } from '@/lib/services/users';
import { TRADES, GULF_COUNTRIES, ORIGIN_COUNTRIES, EXPERIENCE_OPTIONS } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

type Step = 1 | 2 | 3 | 4 | 5;

export default function WorkerOnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useUserProfile();
  
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [trade, setTrade] = useState('');
  const [yearsExperience, setYearsExperience] = useState<number | ''>('');
  const [previousGulfExp, setPreviousGulfExp] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (profile) {
      if (profile.role === 'agency') {
        router.push('/agency/onboarding');
      } else {
        setName(profile.name || user?.displayName || '');
        setPhone(profile.phone || user?.phoneNumber || '');
      }
    }
  }, [user, profile, authLoading, router]);

  const handleNext = () => setStep((s) => Math.min(s + 1, 5) as Step);
  const handleBack = () => setStep((s) => Math.max(s - 1, 1) as Step);

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    try {
      await updateUserProfile(user.uid, {
        name,
        country,
        city,
        phone,
        trade,
        yearsExperience: Number(yearsExperience) || 0,
        onboardingCompleted: true,
      });
      router.push('/home');
    } catch (err) {
      console.error(err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (user) {
      updateUserProfile(user.uid, { onboardingCompleted: true })
        .then(() => router.push('/home'))
        .catch(console.error);
    }
  };

  if (authLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF]"></div></div>;
  if (!user) return null;

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Brand panel */}
      <div className="hidden lg:flex w-[45%] relative bg-gradient-to-br from-[#0055FF] to-[#007AFF] flex-col justify-between p-12 overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex h-10 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 items-center">
            <span className="font-bold text-white tracking-wide">TradeMatch</span>
          </Link>
        </div>
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-widest mb-4">Skilled Worker</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Your skills<br />deserve the<br />best jobs.
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            Build a professional profile. Get noticed by top recruiters.
          </p>
        </div>
        <div />
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-[55%] flex flex-col p-6 sm:p-10 bg-gray-50/50 overflow-y-auto relative items-center justify-center">
        
        {/* Top Nav (Mobile logo + Skip) */}
        <nav className="w-full max-w-[480px] flex items-center justify-between mb-8">
          <Link href="/" className="block lg:hidden">
            <Image src="/logo-v3.png" alt="TradeMatch" width={140} height={32} className="h-8 w-auto" unoptimized />
          </Link>
          <div className="hidden lg:block w-[140px]"></div>
          {step > 1 && step < 5 && (
            <button onClick={handleSkip} className="text-sm font-bold text-gray-400 hover:text-gray-600">
              Skip for now
            </button>
          )}
        </nav>

        <div className="w-full max-w-[480px]">
          {/* Progress Bar */}
          {step < 5 && (
            <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden mb-10">
              <div 
                className="h-full bg-[#007AFF] transition-all duration-500 ease-out" 
                style={{ width: `${(step / 4) * 100}%` }} 
              />
            </div>
          )}

          <main className="w-full pb-24">
        
        {/* Step 1: Welcome */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-20 h-20 bg-[#E8F5FF] rounded-full flex items-center justify-center mb-6">
              <span className="text-4xl">👋</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Welcome to TradeMatch, {name.split(' ')[0] || 'Friend'}!
            </h1>
            <p className="text-[17px] text-gray-600 mb-10 leading-relaxed max-w-[320px]">
              Let's build your professional profile so top recruiters in the Gulf can find you. It only takes 2 minutes.
            </p>
            <button 
              onClick={handleNext}
              className="w-full h-14 bg-[#007AFF] hover:bg-[#0055FF] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all active:scale-[0.98]"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 2: Basic Info */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <button onClick={handleBack} className="text-gray-400 hover:text-gray-900 mb-6 flex items-center gap-1 font-semibold text-sm">
              ← Back
            </button>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Basic Information</h2>
            <p className="text-gray-500 mb-8">Where are you currently located?</p>

            <div className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">Country of Residence</label>
                <select 
                  value={country} 
                  onChange={e => setCountry(e.target.value)}
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all appearance-none"
                >
                  <option value="" disabled>Select your country</option>
                  {ORIGIN_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  {GULF_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">City</label>
                <input 
                  type="text"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  placeholder="e.g. Dubai or Lahore"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[13px] font-bold text-gray-700 uppercase tracking-wider mb-2">WhatsApp / Phone</label>
                <input 
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+971 50 123 4567"
                  className="w-full h-14 px-4 rounded-xl border border-gray-300 bg-white text-[15px] font-semibold text-gray-900 focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20 outline-none transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleNext}
              disabled={!country || !city}
              className="w-full h-14 mt-10 bg-[#007AFF] hover:bg-[#0055FF] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 3: Trade */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <button onClick={handleBack} className="text-gray-400 hover:text-gray-900 mb-6 flex items-center gap-1 font-semibold text-sm">
              ← Back
            </button>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">What is your profession?</h2>
            <p className="text-gray-500 mb-8">Select your primary trade.</p>

            <div className="grid grid-cols-2 gap-3">
              {TRADES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTrade(t.id)}
                  className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-[0.98] ${
                    trade === t.id 
                      ? 'border-[#007AFF] bg-[#E8F5FF]' 
                      : 'border-gray-200 bg-white hover:border-[#007AFF]/50'
                  }`}
                >
                  <span className="text-3xl mb-2">{t.emoji}</span>
                  <span className={`text-[13px] font-bold text-center ${trade === t.id ? 'text-[#007AFF]' : 'text-gray-700'}`}>
                    {t.label}
                  </span>
                </button>
              ))}
            </div>

            <button 
              onClick={handleNext}
              disabled={!trade}
              className="w-full h-14 mt-10 bg-[#007AFF] hover:bg-[#0055FF] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Step 4: Experience */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            <button onClick={handleBack} className="text-gray-400 hover:text-gray-900 mb-6 flex items-center gap-1 font-semibold text-sm">
              ← Back
            </button>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Your Experience</h2>
            <p className="text-gray-500 mb-8">How long have you been working as a {TRADES.find(t=>t.id===trade)?.label.toLowerCase()}?</p>

            <div className="space-y-3 mb-8">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setYearsExperience(opt.value)}
                  className={`w-full h-14 px-6 rounded-xl border-2 transition-all flex items-center text-left ${
                    yearsExperience === opt.value
                      ? 'border-[#007AFF] bg-[#E8F5FF] text-[#007AFF]' 
                      : 'border-gray-200 bg-white hover:border-[#007AFF]/50 text-gray-700'
                  }`}
                >
                  <span className="font-bold text-[15px]">{opt.label}</span>
                  {yearsExperience === opt.value && (
                    <div className="ml-auto w-5 h-5 bg-[#007AFF] rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5 bg-white border border-gray-200 rounded-2xl flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 mb-1">Worked in the Gulf before?</h3>
                <p className="text-[13px] text-gray-500">Saudi Arabia, UAE, Qatar, etc.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={previousGulfExp} onChange={e => setPreviousGulfExp(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#007AFF]"></div>
              </label>
            </div>

            {error && <p className="text-red-500 mt-4 text-sm font-semibold">{error}</p>}

            <button 
              onClick={handleComplete}
              disabled={yearsExperience === '' || loading}
              className="w-full h-14 mt-10 bg-[#007AFF] hover:bg-[#0055FF] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </div>
        )}

        {/* Step 5: Done */}
        {step === 5 && (
          <div className="flex flex-col items-center text-center animate-in zoom-in duration-500 pt-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">
              You're all set!
            </h1>
            <p className="text-[17px] text-gray-600 mb-10 leading-relaxed max-w-[320px]">
              Your worker profile is ready. You can now start searching for jobs or upload your certificates to get verified.
            </p>
            <button 
              onClick={() => router.push('/home')}
              className="w-full h-14 bg-[#007AFF] hover:bg-[#0055FF] text-white rounded-full font-bold text-[17px] shadow-[0_8px_20px_rgba(0,122,255,0.25)] transition-all active:scale-[0.98]"
            >
              Go to Home
            </button>
          </div>
        )}

          </main>
        </div>
      </div>
    </div>
  );
}
