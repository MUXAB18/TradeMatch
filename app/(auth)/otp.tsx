import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { FirebaseRecaptchaVerifierModal } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithCredential, signInWithPhoneNumber } from 'firebase/auth';
import { auth, firebaseConfig } from '../../services/firebase';
import { useToast } from '../../providers/ToastProvider';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';

export default function OTPScreen() {
  const router = useRouter();
  const { phone, verificationId } = useLocalSearchParams<{ phone: string, verificationId: string }>();
  const [currentVerificationId, setCurrentVerificationId] = useState(verificationId);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const recaptchaVerifier = useRef(null);
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // If pasting multiple digits, distribute them
      const digits = digit.split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input or next empty one
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      // If all 6 digits entered, verify
      if (newOtp.every(d => d !== '')) {
        void verifyOTP(newOtp.join(''));
      }
      return;
    }

    // Single digit entry
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit entered
    if (digit && index === 5 && newOtp.every(d => d !== '')) {
      void verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code: string) => {
    setError('');
    setLoading(true);

    try {
      if (!currentVerificationId) {
        throw new Error('Verification session lost. Please request a new code.');
      }

      // Create credential for Web SDK
      const credential = PhoneAuthProvider.credential(currentVerificationId, code);
      
      // Sign in Web SDK
      const userCredential = await signInWithCredential(auth, credential);

      if (userCredential.user) {
        const { userProfileExists } = await import('../../services/users');
        const hasProfile = await userProfileExists(userCredential.user.uid);
        
        if (hasProfile) {
          router.replace('/(tabs)/home');
        } else {
          router.replace('/(auth)/trade');
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid verification code. Please try again.';
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      // Clear OTP and focus first input
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, phone, recaptchaVerifier.current as any);
      setCurrentVerificationId(confirmation.verificationId);
      showToast('A new verification code has been sent to your phone.', 'success');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend code';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={false}
      />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Enter Verification Code</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            We sent a code to {phone || 'your phone'}
          </Text>
        </View>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.otpInput,
                {
                  color: colors.textPrimary,
                  backgroundColor: isDark ? colors.surface : colors.white,
                  borderColor: error ? colors.error : digit ? colors.primary : colors.border,
                }
              ]}
              value={digit}
              onChangeText={text => handleChangeText(text, index)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(nativeEvent.key, index)
              }
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!loading}
              accessibilityLabel={`Digit ${index + 1}`}
            />
          ))}
        </View>

        {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleResendCode}
          style={styles.resendButton}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Resend code"
        >
          <Text style={[styles.resendText, { color: colors.primary }]}>Didn't receive the code? Resend</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
  },
  header: {
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderRadius: BorderRadius.md,
    fontSize: Typography.headerLarge,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  resendButton: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  resendText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
});
