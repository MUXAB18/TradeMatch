'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { ArrowLeft } from 'lucide-react';

// Keep reference to confirmation result to pass to OTP page
// In a real app we'd use a context or global store, but window works for simple flows
declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: ConfirmationResult;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Initialize reCAPTCHA when component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
      });
    }
  }, []);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    if (digits.length > 15) return phoneNumber;
    setPhoneNumber(digits);
    return digits;
  };

  const handleSendCode = async () => {
    setError('');
    
    if (phoneNumber.length < 5) {
      setError('Please enter a valid phone number');
      return;
    }

    setLoading(true);

    try {
      // Assuming US country code for now as default, matching mobile's simplest path
      const formattedPhone = `+1${phoneNumber}`;
      
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

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div id="recaptcha-container"></div>
      
      <div className="flex-1 px-6 pt-16 pb-8 max-w-md mx-auto w-full">
        <button 
          onClick={() => router.back()}
          className="mb-8 flex h-10 w-10 items-center justify-center text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-full"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-text-primary">
            Welcome to TradeMatch
          </h1>
          <p className="text-base text-text-secondary">
            Enter your phone number to get started
          </p>
        </div>

        <div className="flex flex-col flex-1">
          <div className="mb-6 flex gap-4">
            <div className="flex h-14 items-center rounded-xl border border-border bg-surface px-4 gap-2">
              <span className="text-xl">🇺🇸</span>
              <span className="text-base font-semibold text-text-primary">+1</span>
            </div>

            <div className="flex-1">
              <input
                type="tel"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => formatPhoneNumber(e.target.value)}
                className="w-full h-14 rounded-xl border border-border bg-surface px-4 text-base font-medium text-text-primary outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                autoFocus
              />
            </div>
          </div>

          {error && <p className="mb-4 text-sm text-error">{error}</p>}

          <button
            onClick={handleSendCode}
            disabled={loading || phoneNumber.length < 5}
            className="mt-2 flex h-[52px] w-full items-center justify-center rounded-[14px] bg-primary font-bold text-white transition-opacity disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
            ) : (
              'Send Code'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
