'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { COUNTRY_CODES } from '@/lib/countryCodes';
import { CountryCodeSelect } from '@/components/CountryCodeSelect';
import Link from 'next/link';
import { toast } from '@/components/ui/toast';
import { getUserProfile } from '@/lib/services/users';

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}
import Image from 'next/image';

export default function LoginPage() {
  const router = useRouter();
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // UI State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+1');

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const handleError = (err: any) => {
    console.error(err);
    let msg = err.message || 'Authentication failed. Please try again.';
    if (err.code === 'auth/email-already-in-use') msg = 'That email is already in use.';
    if (err.code === 'auth/invalid-email') msg = 'Please enter a valid email.';
    if (err.code === 'auth/weak-password') msg = 'Password is too weak (min 6 chars).';
    if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') msg = 'Invalid email or password.';
    setError(msg);
    toast.error(msg);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      const msg = 'Please fill in all fields.';
      setError(msg);
      toast.warning(msg);
      return;
    }

    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);

      if (cred.user) {
        const profile = await getUserProfile(cred.user.uid);
        if (profile?.role === 'agency') {
          if (profile?.accountStatus !== 'approved') {
            await auth.signOut();
            const msg = 'Your agency account is currently pending approval by an administrator.';
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }
          toast.success('Welcome back!');
          router.push('/agency/dashboard');
          return;
        }
      }

      toast.success('Welcome back!');

      // Cookie is handled automatically via AuthContext listening to onAuthStateChanged
      // Redirect handled by onAuthStateChanged in AuthContext or here.
      router.push('/home');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length > 15) return phoneNumber;
    setPhoneNumber(digits);
    return digits;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length < 5) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = `${countryCode}${phoneNumber}`;

      const appVerifier = window.recaptchaVerifier;
      if (!appVerifier) throw new Error('Recaptcha not initialized');

      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      window.confirmationResult = confirmation;

      // Navigate to OTP page
      router.push(`/login/otp?phone=${encodeURIComponent(formattedPhone)}`);
    } catch (err) {
      console.error('Phone auth error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send verification code.';
      setError(errorMessage);

      // Reset recaptcha on error so user can try again
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

      if (cred.user) {
        const profile = await getUserProfile(cred.user.uid);
        if (profile?.role === 'agency') {
          if (profile?.accountStatus !== 'approved') {
            await auth.signOut();
            const msg = 'Your agency account is currently pending approval by an administrator.';
            setError(msg);
            toast.error(msg);
            setLoading(false);
            return;
          }
          router.push('/agency/dashboard');
          return;
        }
      }

      router.push('/home');
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-[45%_55%] xl:grid-cols-2">
      {/* Left Panel - Premium Brand Side (Hidden on Mobile) */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0055FF] to-[#007AFF] flex-col justify-between p-8 lg:p-12 xl:p-16 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>

        <div className="relative z-10">
          <Link href="/" className="inline-block transition-transform hover:scale-105">
            <div className="h-10 px-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 flex items-center justify-center">
              <span className="font-bold text-white tracking-wide">TradeMatch</span>
            </div>
          </Link>
        </div>

        <div className="relative z-10 w-full pr-8 mb-12 mt-8">
          <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-[0.15em] mb-6 text-white border border-white/20 shadow-sm uppercase">
            For Professionals
          </div>
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-white leading-[1.1] mb-6 tracking-tight">
            Build your <br />
            <span className="text-white/80">professional</span> <br />
            reputation.
          </h1>
          <p className="text-white/80 text-xl leading-relaxed font-medium w-full">
            Join the elite network for skilled trades. Match with verified employers, manage your certifications, and take control of your career.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-4 mt-auto">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-[#0055FF] bg-white/20 flex items-center justify-center backdrop-blur-sm z-10">
                <span className="text-white text-xs">⭐</span>
              </div>
            ))}
          </div>
          <p className="text-white/90 text-sm font-medium">Trusted by 10,000+ professionals</p>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12 xl:p-16 bg-gray-50/50 relative">
        <div className="w-full max-w-[420px]">
          {/* Header */}
          <div className="flex flex-col mb-8">
            <Link href="/" className="mb-6 lg:hidden">
              <img
                src="/logo-v3.png"
                alt="TradeMatch"
                className="h-12 w-auto"
              />
            </Link>

            <div className="hidden lg:block mb-6">
              <img
                src="/logo-v3.png"
                alt="TradeMatch"
                className="h-14 w-auto"
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
              Welcome back
            </h2>
            <p className="text-sm text-gray-500 font-medium">
              {authMethod === 'email' ? 'Enter your details to access your account.' : 'Enter your phone number to get started.'}
            </p>
          </div>

          <div id="recaptcha-container"></div>

          {/* Form */}
          {authMethod === 'email' ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4">
                  <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</span>
                    {error}
                  </p>
                </div>
              )}

              <div className="relative h-14 border border-gray-200 bg-white shadow-sm rounded-xl px-4 flex flex-col justify-center transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  className="w-full text-[15px] font-semibold text-gray-900 outline-none bg-transparent placeholder-gray-300"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>

              <div className="relative h-14 border border-gray-200 bg-white shadow-sm rounded-xl px-4 flex flex-col justify-center transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  className="w-full text-[15px] font-semibold text-gray-900 outline-none bg-transparent placeholder-gray-300 pr-10"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <div className="flex justify-end pt-0.5 pb-2">
                <button type="button" className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`mt-1 h-14 w-full rounded-full bg-primary hover:bg-primary/90 font-bold text-[15px] text-white flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,122,255,0.25)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSendCode} className="flex flex-col gap-3 mb-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl mb-4">
                  <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-red-600">!</span>
                    {error}
                  </p>
                </div>
              )}

              <div className="relative h-14 border border-gray-200 bg-white shadow-sm rounded-xl px-4 flex flex-col justify-center transition-all focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">
                  Phone Number
                </label>
                <div className="flex items-center w-full mt-0.5">
                  <div className="mr-2">
                    <CountryCodeSelect
                      value={countryCode}
                      onChange={setCountryCode}
                    />
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => { formatPhoneNumber(e.target.value); setError(''); }}
                    className="w-full text-[15px] font-semibold text-gray-900 outline-none bg-transparent placeholder-gray-300"
                    placeholder="Enter phone number"
                    autoFocus
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || phoneNumber.length < 5}
                className={`mt-2 h-14 w-full rounded-full bg-primary hover:bg-primary/90 font-bold text-[15px] text-white flex items-center justify-center transition-all active:scale-[0.98] shadow-[0_8px_20px_rgba(0,122,255,0.25)] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  'Send Code'
                )}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute w-full border-t border-gray-200"></div>
            <span className="relative bg-gray-50/50 px-4 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Or continue with
            </span>
          </div>

          {/* Alternative Methods */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full h-12 bg-transparent border border-gray-200 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-2 relative active:scale-[0.98]"
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
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(''); }}
                className="w-full h-12 bg-transparent border border-gray-200 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-2 relative active:scale-[0.98]"
              >
                <div className="absolute left-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                  </svg>
                </div>
                <span>Phone Number</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(''); }}
                className="w-full h-12 bg-transparent border border-gray-200 rounded-full font-bold text-[14px] text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center justify-center gap-2 relative active:scale-[0.98]"
              >
                <div className="absolute left-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-700">
                    <rect x="3" y="5" width="18" height="14" rx="2" ry="2"></rect>
                    <polyline points="3 7 12 13 21 7"></polyline>
                  </svg>
                </div>
                <span>Email & Password</span>
              </button>
            )}
          </div>

          {/* Footer Toggle */}
          <div className="flex justify-center items-center mt-8">
            <span className="text-[15px] font-medium text-gray-500 mr-2">
              Don't have an account?
            </span>
            <Link href="/signup" className="text-[15px] font-bold text-primary hover:text-primary/80 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
