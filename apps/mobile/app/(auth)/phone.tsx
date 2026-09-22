import React, { useState, useMemo, useRef } from 'react';
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
import { ArrowLeft, Search, X, ChevronDown, Phone } from 'lucide-react-native';
import { useToast } from '../../providers/ToastProvider';
import Button from '../../components/Button';
import Input from '../../components/Input';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { COUNTRIES, Country } from '../../constants/countries';
import { FirebaseRecaptchaVerifierModal, FirebaseRecaptchaBanner } from 'expo-firebase-recaptcha';
import { signInWithPhoneNumber } from 'firebase/auth';
import { auth, firebaseConfig } from '../../services/firebase';

export default function PhoneScreen() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]); // Default to Pakistan
  const [pickerVisible, setPickerVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  
  const recaptchaVerifier = useRef(null);

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const digits = text.replace(/\D/g, '');
    
    if (digits.length > 15) {
      return phoneNumber;
    }
    
    setPhoneNumber(digits);
    return digits;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length < 5) { // Looser validation since country codes vary widely
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
      
      router.push({
        pathname: '/(auth)/otp',
        params: { 
          phone: formattedPhone,
          verificationId: confirmation.verificationId
        },
      });
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
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Welcome to TradeMatch</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your phone number to get started
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={[styles.countrySelector, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setPickerVisible(true)}
            >
              <Text style={styles.selectorFlag}>{selectedCountry.flag}</Text>
              <Text style={[styles.selectorCode, { color: colors.textPrimary }]}>{selectedCountry.dial_code}</Text>
              <ChevronDown size={16} color={colors.textSecondary} />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Input
                placeholder="Phone Number"
                value={phoneNumber}
                onChangeText={formatPhoneNumber}
                keyboardType="phone-pad"
                autoComplete="tel"
                textContentType="telephoneNumber"
                maxLength={15}
                error={error}
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
            title="Send Code"
            onPress={handleSendCode}
            loading={loading}
            disabled={phoneNumber.length < 5}
            style={styles.button}
            fullWidth
          />
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        visible={pickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setPickerVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
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
              placeholder="Search country or code..."
              placeholderTextColor={colors.textPlaceholder}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
          </View>

          <FlatList
            data={filteredCountries}
            keyExtractor={item => item.code}
            renderItem={renderCountryItem}
            keyboardShouldPersistTaps="handled"
            initialNumToRender={20}
          />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: Spacing.lg,
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
  form: {
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    width: '100%',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Spacing.minTapTarget,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    gap: 4,
  },
  selectorFlag: {
    fontSize: 22,
  },
  selectorCode: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  button: {
    marginTop: Spacing.sm,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 10 : 0,
  },
  modalTitle: {
    fontSize: Typography.headerSmall,
    fontWeight: '700',
  },
  closeButton: {
    position: 'absolute',
    right: Spacing.lg,
    padding: Spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Spacing.lg,
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
    height: '100%',
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countryFlag: {
    fontSize: 24,
    width: 40,
  },
  countryName: {
    flex: 1,
    fontSize: Typography.body,
    fontWeight: '500',
  },
  countryDialCode: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
});
