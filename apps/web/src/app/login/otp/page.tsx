'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { getUserProfile } from '@/lib/services/users';

function OTPForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const phone = searchParams.get('phone') || '';
  
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If we reach here without a confirmation result, redirect back
    if (!window.confirmationResult && process.env.NODE_ENV !== 'development') {
      // In a real app we'd redirect, for dev we might allow it
      console.warn('No confirmation result found in window');
    }
    
    // Auto-focus first input
    if (inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, []);

  const handleCodeChange = (text: string, index: number) => {
    // Only allow numbers
    const value = text.replace(/[^0-9]/g, '');
    if (!value && text !== '') return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Move to next input automatically
    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }

    // Auto submit when all filled
    if (value && index === 5 && newCode.every(d => d !== '')) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode: string) => {
    if (!window.confirmationResult) {
      setError('Session expired. Please try again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const cred = await window.confirmationResult.confirm(fullCode);
      
      if (cred.user) {
        const profile = await getUserProfile(cred.user.uid);
        if (profile?.role === 'agency') {
          if (profile?.accountStatus !== 'approved') {
            await auth.signOut();
            const msg = 'Your agency account is currently pending approval by an administrator.';
            setError(msg);
            setLoading(false);
            setCode(['', '', '', '', '', '']);
            return;
          }
          router.push('/agency/dashboard');
          return;
        }
      }

      // AuthContext will detect the change and update state
      // ProtectedRoute will allow them to stay, we just redirect to home
      router.push('/');
    } catch (err) {
      console.error('OTP verification error:', err);
      setError('Invalid verification code. Please try again.');
      // Clear code
      setCode(['', '', '', '', '', '']);
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 px-6 pt-16 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex h-10 w-10 items-center justify-center text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-text-primary">
            Verification Code
          </h1>
          <p className="text-base text-text-secondary">
            We sent a 6-digit code to <span className="font-bold text-text-primary">{phone}</span>
          </p>
        </div>

        <div className="flex flex-col flex-1">
          <div className="mb-8 flex justify-between gap-2">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputsRef.current[index] = el; }}
                className={`h-14 w-12 rounded-[14px] border ${
                  error ? 'border-error text-error' : 'border-border text-text-primary focus:border-primary'
                } bg-surface text-center text-2xl font-bold outline-none focus:ring-1 focus:ring-primary`}
                type="number"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyPress(e, index)}
              />
            ))}
          </div>

          {error && <p className="mb-4 text-center text-sm text-error font-medium">{error}</p>}

          <button
            onClick={() => verifyCode(code.join(''))}
            disabled={loading || code.some(d => !d)}
            className="mt-2 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-primary font-bold text-white transition-opacity disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Verify & Continue'
            )}
          </button>
          
          <div className="mt-8 flex justify-center">
            <button className="text-sm font-semibold text-primary hover:underline">
              Resend Code
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OTPPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <OTPForm />
    </Suspense>
  );
}
