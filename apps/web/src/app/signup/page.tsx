'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { CountryCodeSelect } from '@/components/CountryCodeSelect';
import { updateUserProfile } from '@/lib/services/users';
import Link from 'next/link';
import Image from 'next/image';
import { HardHat, Building2, ChevronRight } from 'lucide-react';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

type Role = 'worker' | 'agency';
type AuthMethod = 'email' | 'phone';
type Step = 'role' | 'form';

export default function SignupPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState<Step>('role');
  const [role, setRole] = useState<Role | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+92'); // Default Pakistan

  useEffect(() => {
    if (step === 'form' && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, [step]);

  const handleError = (err: any) => {
    let msg = err.message || 'Authentication failed. Please try again.';
    if (err.code === 'auth/email-already-in-use') msg = 'That email is already in use.';
    if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
    if (err.code === 'auth/weak-password') msg = 'Password must be at least 6 characters.';
    setError(msg);
  };

  const handleSelectRole = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password || !name) { setError('Please fill in all fields.'); return; }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        await updateProfile(cred.user, { displayName: name });
        // Save role to Firestore immediately
        await updateUserProfile(cred.user.uid, {
          name,
          email,
          role: role || 'worker',
          onboardingCompleted: false,
          ...(role === 'agency' ? { accountStatus: 'pending' } : {})
        });
      }
      router.push(role === 'agency' ? '/agency/onboarding' : '/onboarding');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phoneNumber.length < 5) { setError('Please enter a valid phone number'); return; }
    setLoading(true);
    try {
      const formattedPhone = `${countryCode}${phoneNumber}`;
      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error('Recaptcha not initialized');
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmation;
      // Store role in sessionStorage to read after OTP
      sessionStorage.setItem('pendingRole', role || 'worker');
      router.push(`/login/otp?phone=${encodeURIComponent(formattedPhone)}&role=${role || 'worker'}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send code.';
      setError(errorMessage);
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.render().then(widgetId => {
          (window as any).grecaptcha.reset(widgetId);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const cred = await signInWithPopup(auth, provider);
      await updateUserProfile(cred.user.uid, {
        name: cred.user.displayName || '',
        email: cred.user.email || '',
        role: role || 'worker',
        onboardingCompleted: false,
        ...(role === 'agency' ? { accountStatus: 'pending' } : {})
      });
      router.push(role === 'agency' ? '/agency/onboarding' : '/onboarding');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP: Role Selection ── */
  if (step === 'role') {
    return (
      <div className="grid min-h-screen w-full lg:grid-cols-[45%_55%] xl:grid-cols-2">
        {/* Brand panel */}
        <div className="hidden lg:flex relative bg-gradient-to-br from-[#0055FF] to-[#007AFF] flex-col justify-between p-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-white/10 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4" />
          <div className="relative z-10">
            <Link href="/" className="inline-flex items-center gap-2 h-10 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
              <span className="font-bold text-white tracking-wide">TradeMatch</span>
            </Link>
          </div>
          <div className="relative z-10">
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
              The platform<br />built for<br /><span className="text-white/80">real trade work.</span>
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Workers get verified. Agencies find the right people. Faster.
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-sm">⭐</div>
              ))}
            </div>
            <p className="text-white/90 text-sm font-medium">Trusted by 10,000+ professionals</p>
          </div>
        </div>

        {/* Role selection */}
        <div className="flex flex-col justify-center items-center p-6 sm:p-10 bg-gray-50/50">
          <div className="w-full max-w-[440px]">
            <Link href="/" className="mb-8 lg:hidden block">
              <img
                src="/logo-v3.png"
                alt="TradeMatch"
                className="h-12 w-auto"
              /></Link>
            <div className="hidden lg:block mb-8">
              <img
                src="/logo-v3.png"
                alt="TradeMatch"
                className="h-14 w-auto"
              /></div>

            <h2 className="text-[28px] font-extrabold text-gray-900 tracking-tight mb-2">
              How will you use TradeMatch?
            </h2>
            <p className="text-[15px] text-gray-500 mb-8">Choose your account type to get started.</p>

            <div className="space-y-4">
              {/* Worker card */}
              <button
                onClick={() => handleSelectRole('worker')}
                className="w-full group flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#007AFF] hover:shadow-md transition-all duration-200 text-left active:scale-[0.99]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#E8F5FF] flex items-center justify-center shrink-0 group-hover:bg-[#007AFF] transition-colors">
                  <HardHat size={28} className="text-[#007AFF] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-extrabold text-gray-900">I'm looking for work</h3>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-[#007AFF] transition-colors" />
                  </div>
                  <p className="text-[14px] text-gray-500 mt-1 leading-snug">
                    Build your profile, upload certificates, and find jobs in the Gulf. <span className="text-[#007AFF] font-semibold">Always free for workers.</span>
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {['⚡ Electrician', '🔥 Welder', '🔧 Mechanic', '🚰 Plumber'].map(t => (
                      <span key={t} className="text-[11px] font-bold px-2 py-1 bg-gray-100 rounded-full text-gray-600">{t}</span>
                    ))}
                    <span className="text-[11px] font-bold px-2 py-1 bg-gray-100 rounded-full text-gray-600">+ more</span>
                  </div>
                </div>
              </button>

              {/* Agency card */}
              <button
                onClick={() => handleSelectRole('agency')}
                className="w-full group flex items-start gap-4 p-5 bg-white border-2 border-gray-200 rounded-2xl hover:border-[#8B5CF6] hover:shadow-md transition-all duration-200 text-left active:scale-[0.99]"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#F5F3FF] flex items-center justify-center shrink-0 group-hover:bg-[#8B5CF6] transition-colors">
                  <Building2 size={28} className="text-[#8B5CF6] group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[18px] font-extrabold text-gray-900">I'm hiring workers</h3>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-[#8B5CF6] transition-colors" />
                  </div>
                  <p className="text-[14px] text-gray-500 mt-1 leading-snug">
                    Search verified skilled workers. Filter by trade, experience, and verification status.
                  </p>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {['🇦🇪 UAE', '🇸🇦 Saudi', '🇶🇦 Qatar', '🇴🇲 Oman'].map(c => (
                      <span key={c} className="text-[11px] font-bold px-2 py-1 bg-gray-100 rounded-full text-gray-600">{c}</span>
                    ))}
                  </div>
                </div>
              </button>
            </div>

            <div className="flex justify-center items-center mt-8">
              <span className="text-[15px] text-gray-500 mr-2">Already have an account?</span>
              <Link href="/login" className="text-[15px] font-bold text-[#007AFF] hover:opacity-80">Sign In</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── STEP: Form (email / phone) ── */
  const accentColor = role === 'agency' ? '#8B5CF6' : '#007AFF';
  const roleName = role === 'agency' ? 'Recruitment Agency' : 'Skilled Worker';

  return (
    <div className="flex min-h-screen w-full bg-white">
      {/* Brand panel */}
      <div className={`hidden lg:flex w-[45%] relative flex-col justify-between p-12 overflow-hidden ${role === 'agency' ? 'bg-gradient-to-br from-[#4C1D95] to-[#8B5CF6]' : 'bg-gradient-to-br from-[#0055FF] to-[#007AFF]'}`}>
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="relative z-10">
          <Link href="/" className="inline-flex h-10 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 items-center">
            <span className="font-bold text-white">TradeMatch</span>
          </Link>
        </div>
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold text-white uppercase tracking-widest mb-4">{roleName}</div>
          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            {role === 'agency' ? 'Find the right workers.\nFast.' : 'Your skills\ndeserve the\nbest jobs.'}
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            {role === 'agency'
              ? 'Search verified candidates. Stop wasting time on WhatsApp groups.'
              : 'Build a professional profile. Get noticed by top recruiters.'}
          </p>
        </div>
        <button onClick={() => setStep('role')} className="relative z-10 self-start text-white/70 text-sm hover:text-white transition-colors">
          ← Change account type
        </button>
      </div>

      {/* Form panel */}
      <div className="w-full lg:w-[55%] flex flex-col justify-center items-center p-6 sm:p-10 bg-gray-50/50">
        <div className="w-full max-w-[420px]">
          <Link href="/" className="mb-6 lg:hidden block">
            <Image src="/logo-v3.png" alt="TradeMatch" width={180} height={48} className="h-12 w-auto" unoptimized />
          </Link>
          <div className="hidden lg:block mb-6">
            <Image src="/logo-v3.png" alt="TradeMatch" width={210} height={56} className="h-14 w-auto" unoptimized />
          </div>

          <button onClick={() => setStep('role')} className="lg:hidden mb-4 text-sm text-gray-500 hover:text-gray-700">← Back</button>

          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${role === 'agency' ? 'bg-[#F5F3FF] text-[#8B5CF6]' : 'bg-[#E8F5FF] text-[#007AFF]'}`}>
            {role === 'agency' ? <Building2 size={12} /> : <HardHat size={12} />}
            {roleName}
          </div>

          <h2 className="text-[26px] font-extrabold text-gray-900 tracking-tight mb-1">Create your account</h2>
          <p className="text-sm text-gray-500 mb-6">
            {authMethod === 'email' ? 'Fill in your details below.' : 'Enter your phone number to get started.'}
          </p>

          <div id="recaptcha-container" />

          {authMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-sm font-semibold text-red-600">⚠ {error}</p>
                </div>
              )}
              {[
                { label: 'Full Name', value: name, setter: setName, type: 'text', placeholder: 'Your full name', autoComplete: 'name' },
                { label: 'Email Address', value: email, setter: setEmail, type: 'email', placeholder: 'you@example.com', autoComplete: 'email' },
                { label: 'Password', value: password, setter: setPassword, type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
              ].map(field => (
                <div key={field.label} className="relative h-14 border border-gray-200 bg-white shadow-sm rounded-xl px-4 flex flex-col justify-center focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-[#007AFF]/10 transition-all">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{field.label}</label>
                  <input
                    type={field.type}
                    value={field.value}
                    onChange={e => { field.setter(e.target.value); setError(''); }}
                    className="w-full text-[15px] font-semibold text-gray-900 outline-none bg-transparent placeholder-gray-300"
                    placeholder={field.placeholder}
                    autoComplete={field.autoComplete}
                  />
                </div>
              ))}
              <button
                type="submit"
                disabled={loading}
                style={{ background: loading ? '#9CA3AF' : accentColor }}
                className="mt-1 h-14 w-full rounded-full font-bold text-[15px] text-white flex items-center justify-center transition-all active:scale-[0.98] shadow-lg disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : 'Create Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendCode} className="flex flex-col gap-3 mb-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <p className="text-sm font-semibold text-red-600">⚠ {error}</p>
                </div>
              )}
              <div className="relative h-14 border border-gray-200 bg-white shadow-sm rounded-xl px-4 flex flex-col justify-center focus-within:border-[#007AFF] focus-within:ring-4 focus-within:ring-[#007AFF]/10 transition-all">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</label>
                <div className="flex items-center w-full mt-0.5">
                  <div className="mr-2"><CountryCodeSelect value={countryCode} onChange={setCountryCode} /></div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={e => { const d = e.target.value.replace(/\D/g, ''); if (d.length <= 15) setPhoneNumber(d); setError(''); }}
                    className="w-full text-[15px] font-semibold text-gray-900 outline-none bg-transparent placeholder-gray-300"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || phoneNumber.length < 5}
                style={{ background: loading ? '#9CA3AF' : accentColor }}
                className="mt-2 h-14 w-full rounded-full font-bold text-[15px] text-white flex items-center justify-center transition-all active:scale-[0.98] shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send Code'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-5">
            <div className="absolute w-full border-t border-gray-200" />
            <span className="relative bg-gray-50/50 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">Or continue with</span>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 bg-white border border-gray-200 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-2 relative active:scale-[0.98]"
            >
              <div className="absolute left-4">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
              </div>
              <span>Google</span>
            </button>

            {authMethod === 'email' ? (
              <button type="button" onClick={() => { setAuthMethod('phone'); setError(''); }} className="w-full h-12 bg-white border border-gray-200 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center active:scale-[0.98]">
                📱 Phone Number
              </button>
            ) : (
              <button type="button" onClick={() => { setAuthMethod('email'); setError(''); }} className="w-full h-12 bg-white border border-gray-200 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center active:scale-[0.98]">
                ✉️ Email & Password
              </button>
            )}
          </div>

          <div className="flex justify-center items-center mt-8">
            <span className="text-[15px] text-gray-500 mr-2">Already have an account?</span>
            <Link href="/login" className="text-[15px] font-bold text-[#007AFF] hover:opacity-80">Sign In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
