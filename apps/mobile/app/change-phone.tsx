import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Search, X, Smartphone, Phone, ChevronDown } from 'lucide-react-native';
import { useToast } from '../providers/ToastProvider';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import { COUNTRIES, Country } from '../constants/countries';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { PhoneAuthProvider, signInWithPhoneNumber, updatePhoneNumber } from 'firebase/auth';
import { auth, firebaseConfig } from '../services/firebase';
import { updateUserProfile } from '../services/users';

export default function ChangePhoneScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  
  // Step 1 State
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to US
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Step 2 State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verificationId, setVerificationId] = useState('');
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Common State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  
  const recaptchaVerifier = useRef(null);

  // --- Step 1 Handlers ---
  const formatPhoneNumber = (text: string) => {
    const digits = text.replace(/\D/g, '');
    if (digits.length > 15) return phoneNumber;
    setPhoneNumber(digits);
    return digits;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 5) {
      setError('Please enter a valid phone number');
      return false;
    }
    return true;
  };

  const handleSendCode = async () => {
    setError('');
    
    if (!validatePhoneNumber(phoneNumber)) {
      return;
    }

    setLoading(true);

    try {
      const formattedPhone = `${selectedCountry.dial_code}${phoneNumber}`;
      
      // Use Firebase Web SDK with reCAPTCHA
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier.current as any);
      
      setVerificationId(confirmation.verificationId);
      setStep(2);
      
      // Focus first OTP input when transitioning to step 2
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (err) {
      console.error('Phone auth error:', err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to send verification code. Please check your phone number and try again.';
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredCountries = useMemo(() => {
    if (!searchQuery) return COUNTRIES;
    const lowerQuery = searchQuery.toLowerCase();
    return COUNTRIES.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.dial_code.includes(lowerQuery)
    );
  }, [searchQuery]);

  const renderCountryItem = ({ item }: { item: Country }) => (
    <TouchableOpacity
      style={[
        styles.countryItem,
        { borderBottomColor: colors.border },
        selectedCountry.code === item.code && { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)' }
      ]}
      onPress={() => {
        setSelectedCountry(item);
        setPickerVisible(false);
        setSearchQuery('');
      }}
    >
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <Text style={[styles.countryName, { color: colors.textPrimary }]}>{item.name}</Text>
      <Text style={[styles.countryDialCode, { color: colors.textSecondary }]}>{item.dial_code}</Text>
    </TouchableOpacity>
  );

  // --- Step 2 Handlers ---
  const handleChangeText = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '');
    
    if (digit.length > 1) {
      // If pasting multiple digits
      const digits = digit.split('').slice(0, 6);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) {
          newOtp[index + i] = d;
        }
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(index + digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
      
      if (newOtp.every(d => d !== '')) {
        void verifyOTP(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (digit && index === 5 && newOtp.every(d => d !== '')) {
      void verifyOTP(newOtp.join(''));
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyOTP = async (code: string) => {
    setError('');
    setLoading(true);

    try {
      if (!verificationId) {
        throw new Error('Verification session lost. Please go back and request a new code.');
      }
      
      if (!auth.currentUser) {
        throw new Error('Not authenticated.');
      }

      // Create credential for Web SDK
      const credential = PhoneAuthProvider.credential(verificationId, code);
      
      // Update phone number on the current user
      await updatePhoneNumber(auth.currentUser, credential);
      
      // Update Firestore profile
      const formattedPhone = `${selectedCountry.dial_code}${phoneNumber}`;
      await updateUserProfile(auth.currentUser.uid, { phone: formattedPhone });
      
      showToast('Phone number updated successfully.', 'success');
      router.back();
    } catch (err) {
      console.error('OTP verification error:', err);
      
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Invalid verification code. Please try again.';
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FirebaseRecaptchaVerifierModal
        ref={recaptchaVerifier}
        firebaseConfig={firebaseConfig}
        attemptInvisibleVerification={false}
      />
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => step === 2 ? setStep(1) : router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.headerIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Smartphone size={32} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {step === 1 ? 'Change Phone Number' : 'Enter Verification Code'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {step === 1 
              ? 'Enter your new phone number. We will send a verification code.' 
              : `We've sent a 6-digit code to ${selectedCountry.dial_code}${phoneNumber}`}
          </Text>
        </View>

        {step === 1 ? (
          <View style={[styles.form, styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.inputRow}>
              <TouchableOpacity
                style={[styles.countryPickerBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setPickerVisible(true)}
              >
                <Text style={styles.countryFlagBtn}>{selectedCountry.flag}</Text>
                <Text style={[styles.countryDialCodeBtn, { color: colors.textPrimary }]}>
                  {selectedCountry.dial_code}
                </Text>
                <ChevronDown size={16} color={colors.textSecondary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
              
              <View style={styles.phoneInputWrap}>
                <Input
                  placeholder="Phone Number"
                  value={phoneNumber}
                  onChangeText={formatPhoneNumber}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  error={error}
                  style={{ marginBottom: 0 }}
                  icon={<Phone size={20} color={colors.textSecondary} />}
                  autoFocus
                />
              </View>
            </View>

            <FirebaseRecaptchaBanner 
              textStyle={{ color: colors.textSecondary, fontSize: Typography.small - 2, opacity: 0.8 }} 
              linkStyle={{ color: colors.primary, fontWeight: '500' }} 
            />

            <Button
              title={loading ? "Sending..." : "Send Verification Code"}
              onPress={handleSendCode}
              loading={loading}
              disabled={loading || phoneNumber.length < 5}
              style={{ marginTop: Spacing.md }}
              fullWidth
            />
          </View>
        ) : (
          <View style={[styles.form, styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={ref => { inputRefs.current[index] = ref; }}
                  style={[
                    styles.otpInput,
                    { 
                      backgroundColor: colors.surface,
                      borderColor: digit ? colors.primary : colors.border,
                      color: colors.textPrimary,
                    }
                  ]}
                  value={digit}
                  onChangeText={(text) => handleChangeText(text, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectTextOnFocus
                />
              ))}
            </View>
            
            {error ? <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text> : null}

            <Button
              title="Verify Code"
              onPress={() => verifyOTP(otp.join(''))}
              loading={loading}
              disabled={loading || otp.join('').length < 6}
              style={{ marginTop: Spacing.xl }}
              fullWidth
            />
            
            <TouchableOpacity 
              style={styles.resendButton} 
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#333' : '#E5E5EA' }]} />
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Select Country</Text>
              <TouchableOpacity 
                onPress={() => setPickerVisible(false)}
                style={styles.closeButton}
              >
                <X size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
              <Search size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search countries..."
                placeholderTextColor={colors.textPlaceholder}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCorrect={false}
              />
            </View>
            
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={renderCountryItem}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  header: { marginBottom: Spacing.xl },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    lineHeight: 22,
  },
  form: { 
    marginBottom: Spacing.xl,
  },
  card: {
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Spacing.minTapTarget,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  countryFlagBtn: {
    fontSize: 22,
    marginRight: 4,
  },
  countryDialCodeBtn: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  phoneInputWrap: { flex: 1 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.sm,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    position: 'relative',
  },
  modalTitle: {
    fontSize: Typography.header,
    fontWeight: '800',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.md,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: Typography.body,
    height: '100%',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countryFlag: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  countryName: {
    flex: 1,
    fontSize: Typography.body,
  },
  countryDialCode: {
    fontSize: Typography.body,
    fontWeight: '500',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  otpInput: {
    width: '14%',
    aspectRatio: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    marginTop: -8,
    marginBottom: 16,
    textAlign: 'center',
  },
  resendButton: {
    marginTop: Spacing.lg,
    alignItems: 'center',
    padding: Spacing.sm,
  },
  resendText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
