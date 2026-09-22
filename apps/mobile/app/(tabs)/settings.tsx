import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Pressable,
  Modal,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  FadeInUp, 
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolateColor,
  interpolate,
  useDerivedValue,
} from 'react-native-reanimated';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Button from '../../components/Button';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_LANGUAGES } from '../../i18n';
import {
  Sun, Moon, Smartphone, ChevronRight, LogOut,
  User, Phone, Mail, Lock, ShieldCheck,
  Bell, MessageSquare, Clock,
  Globe, DollarSign, Trash2,
  HelpCircle, FileText, Shield, Info, Award, RefreshCw
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Custom Premium Switch ────────────────────────────────────────────────────

function PremiumSwitch({ value, onValueChange, activeColor, inactiveColor, thumbColor }: any) {
  const progress = useDerivedValue(() => withSpring(value ? 1 : 0, { damping: 20, stiffness: 200 }));
  
  const trackStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        [inactiveColor, activeColor]
      ) as string,
    };
  });
  
  const thumbStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: interpolate(progress.value, [0, 1], [2, 23]) }],
    };
  });

  return (
    <Pressable onPress={() => onValueChange(!value)} hitSlop={8} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Animated.View style={[styles.switchTrack, trackStyle]}>
        <Animated.View style={[styles.switchThumb, { backgroundColor: thumbColor }, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({ title, colors }: { title: string; colors: any }) {
  return (
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
      {title}
    </Text>
  );
}

function SettingsCard({ children, colors }: { children: React.ReactNode; colors: any }) {
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {children}
    </View>
  );
}

interface RowProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isLast?: boolean;
  colors: any;
  isDark: boolean;
  danger?: boolean;
}

function SettingsRow({ icon, title, subtitle, value, onPress, rightElement, isLast, colors, isDark, danger }: RowProps) {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isPressed.value 
      ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') 
      : 'transparent',
  }));

  return (
    <View style={{ overflow: 'hidden' }}>
      <Pressable
        onPressIn={() => { if (onPress) isPressed.value = 1; }}
        onPressOut={() => { if (onPress) isPressed.value = 0; }}
        onPress={onPress}
        disabled={!onPress && !rightElement}
        accessibilityRole={onPress ? 'button' : 'none'}
      >
        <Animated.View style={[styles.row, animatedStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: `${danger ? colors.error : colors.primary}15` }]}>
            {icon}
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: danger ? colors.error : colors.textPrimary }]}>{title}</Text>
            {subtitle ? (
              <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
            ) : null}
          </View>
          {value ? (
            <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
          ) : null}
          {rightElement ?? null}
          {onPress && !rightElement ? (
            <ChevronRight size={18} color={colors.textSecondary} style={{ opacity: 0.6 }} />
          ) : null}
        </Animated.View>
      </Pressable>
      {!isLast && <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.3 }]} />}
    </View>
  );
}

interface RadioRowProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  selected: boolean;
  onPress: () => void;
  isLast?: boolean;
  colors: any;
  isDark: boolean;
}

function RadioRow({ icon, title, subtitle, selected, onPress, isLast, colors, isDark }: RadioRowProps) {
  const isPressed = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: isPressed.value 
      ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)') 
      : 'transparent',
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(selected ? 1 : 0.8, { damping: 15 }) }]
  }));

  return (
    <View style={{ overflow: 'hidden' }}>
      <Pressable
        onPressIn={() => (isPressed.value = 1)}
        onPressOut={() => (isPressed.value = 0)}
        onPress={onPress}
        accessibilityRole="radio"
        accessibilityState={{ checked: selected }}
      >
        <Animated.View style={[styles.row, animatedStyle]}>
          <View style={[styles.iconCircle, { backgroundColor: `${selected ? colors.primary : colors.textSecondary}15` }]}>
            {icon}
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowTitle, { color: selected ? colors.primary : colors.textPrimary }]}>{title}</Text>
            <Text style={[styles.rowSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>
          </View>
          <View style={[styles.radioOuter, { borderColor: selected ? colors.primary : colors.textSecondary, opacity: selected ? 1 : 0.3 }]}>
            {selected && (
              <Animated.View style={[styles.radioInner, { backgroundColor: colors.primary }, scaleStyle]} />
            )}
          </View>
        </Animated.View>
      </Pressable>
      {!isLast && <View style={[styles.divider, { backgroundColor: colors.border, opacity: 0.3 }]} />}
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { themePreference, setThemePreference } = useThemeContext();
  const { user } = useAuth();
  const { data: profile } = useUserProfile();
  const reducedMotion = useReducedMotion();
  const { t, i18n } = useTranslation();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLanguageModalVisible, setLanguageModalVisible] = useState(false);

  const initials = (profile?.name || user?.displayName || 'U')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayName = profile?.name || user?.displayName || 'User';
  const displayEmail = user?.email || user?.phoneNumber || 'No email';

  const handleLogout = () => {
    Alert.alert(
      t('settings.logout'),
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/');
            } catch (error) {
              console.error('Failed to log out', error);
            }
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Cached data has been cleared.', [{ text: 'OK' }]);
  };

  const handleResetOnboarding = () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screen again on next app launch.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('has_seen_onboarding');
            Alert.alert('Done', 'Restart the app to see the onboarding screen.');
          },
        },
      ]
    );
  };

  const handleComingSoon = (feature: string) => {
    Alert.alert('Coming Soon', `${feature} will be available in a future update.`);
  };

  const handleLanguageChange = () => {
    setLanguageModalVisible(true);
  };

  const changeLanguage = async (lang: string) => {
    setLanguageModalVisible(false);
    await i18n.changeLanguage(lang);
    const isRTL = lang === 'ar';
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      // Show an alert instead of reloadAsync since reloadAsync can crash in Expo Go
      setTimeout(() => {
        Alert.alert(
          'Restart Required',
          'Please restart the app to apply layout changes.'
        );
      }, 500);
    }
  };

  const sections = [
    {
      title: 'ACCOUNT',
      delay: 200,
      rows: [
        {
          icon: <User size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => router.push('/profile'),
        },
        {
          icon: <Phone size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Change Phone Number',
          subtitle: 'Update your registered number',
          onPress: () => router.push('/change-phone'),
        },
        {
          icon: <Mail size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Change Email',
          subtitle: 'Update your email address',
          onPress: () => router.push('/change-email'),
        },
        {
          icon: <Lock size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Change Password',
          subtitle: 'Update your security credentials',
          onPress: () => router.push('/change-password'),
        },
        {
          icon: <ShieldCheck size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Two-Factor Authentication',
          subtitle: 'Add extra security to your account',
          onPress: () => handleComingSoon('Two-Factor Authentication'),
          isLast: true,
        },
      ],
    },
    {
      title: 'PREFERENCES',
      delay: 400,
      rows: [
        {
          icon: <Globe size={18} color={colors.primary} strokeWidth={2.5} />,
          title: t('settings.language'),
          subtitle: t('settings.languageSubtitle'),
          value: SUPPORTED_LANGUAGES.find(l => l.code === i18n.language)?.nativeName ?? 'English',
          onPress: handleLanguageChange,
        },
        {
          icon: <DollarSign size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Currency',
          subtitle: 'Custom currency',
          value: 'PKR (₨)',
          onPress: () => handleComingSoon('Currency'),
        },
        {
          icon: <Trash2 size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Clear Cache',
          subtitle: 'Free up storage space',
          onPress: handleClearCache,
          isLast: true,
        },
      ],
    },
    {
      title: 'SUPPORT & ABOUT',
      delay: 500,
      rows: [
        {
          icon: <HelpCircle size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Help & Support',
          subtitle: 'Get help or contact us',
          onPress: () => router.push('/help'),
        },
        {
          icon: <Award size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'View Onboarding',
          subtitle: 'Replay the introductory tutorial',
          onPress: () => router.push('/(auth)/onboarding'),
        },
        {
          icon: <RefreshCw size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Reset Onboarding',
          subtitle: 'Show intro again on next launch',
          onPress: handleResetOnboarding,
        },
        {
          icon: <FileText size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Terms & Conditions',
          subtitle: 'Read our terms and policies',
          onPress: () => router.push('/terms'),
        },
        {
          icon: <Shield size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'Privacy Policy',
          subtitle: 'How we protect your data',
          onPress: () => router.push('/privacy'),
        },
        {
          icon: <Info size={18} color={colors.primary} strokeWidth={2.5} />,
          title: 'About App',
          subtitle: 'Version 1.0.0',
          onPress: () => handleComingSoon('About App'),
          isLast: true,
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingTop: insets.top + Spacing.lg, paddingBottom: 120 }]}
      >
        {/* Header */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.duration(500)} style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>{t('settings.title')}</Text>
        </Animated.View>

        {/* Profile Card */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(100).duration(500)}>
          <Pressable
            style={({ pressed }) => [
              styles.profileCard,
              { backgroundColor: colors.surface },
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] }
            ]}
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.textPrimary }]}>{displayName}</Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>{displayEmail}</Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} style={{ opacity: 0.6 }} />
          </Pressable>
        </Animated.View>

        {/* Appearance Section */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(150).duration(500)}>
          <SectionHeader title="APPEARANCE" colors={colors} />
          <SettingsCard colors={colors}>
            <RadioRow
              icon={<Sun size={18} color={themePreference === 'light' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />}
              title="Light Mode"
              subtitle="Bright and clean interface"
              selected={themePreference === 'light'}
              onPress={() => setThemePreference('light')}
              colors={colors}
              isDark={isDark}
            />
            <RadioRow
              icon={<Moon size={18} color={themePreference === 'dark' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />}
              title="Dark Mode"
              subtitle="Easy on your eyes"
              selected={themePreference === 'dark'}
              onPress={() => setThemePreference('dark')}
              colors={colors}
              isDark={isDark}
            />
            <RadioRow
              icon={<Smartphone size={18} color={themePreference === 'system' ? colors.primary : colors.textSecondary} strokeWidth={2.5} />}
              title="System Default"
              subtitle="Follows your device settings"
              selected={themePreference === 'system'}
              onPress={() => setThemePreference('system')}
              isLast
              colors={colors}
              isDark={isDark}
            />
          </SettingsCard>
        </Animated.View>

        {/* Account Section */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(200).duration(500)}>
          <SectionHeader title="ACCOUNT" colors={colors} />
          <SettingsCard colors={colors}>
            {sections[0].rows.map((row, idx) => (
              <SettingsRow
                key={row.title}
                icon={row.icon}
                title={row.title}
                subtitle={row.subtitle}
                onPress={row.onPress}
                isLast={idx === sections[0].rows.length - 1}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </SettingsCard>
        </Animated.View>

        {/* Notifications Section */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(300).duration(500)}>
          <SectionHeader title="NOTIFICATIONS" colors={colors} />
          <SettingsCard colors={colors}>
            <SettingsRow
              icon={<Bell size={18} color={colors.primary} strokeWidth={2.5} />}
              title="Push Notifications"
              subtitle="Get notified about important updates"
              colors={colors}
              isDark={isDark}
              rightElement={
                <PremiumSwitch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  activeColor={colors.success}
                  inactiveColor={isDark ? '#3A3A3C' : '#E5E5EA'}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingsRow
              icon={<MessageSquare size={18} color={colors.primary} strokeWidth={2.5} />}
              title="Email Notifications"
              subtitle="Receive updates via email"
              colors={colors}
              isDark={isDark}
              rightElement={
                <PremiumSwitch
                  value={emailNotifications}
                  onValueChange={setEmailNotifications}
                  activeColor={colors.success}
                  inactiveColor={isDark ? '#3A3A3C' : '#E5E5EA'}
                  thumbColor="#FFFFFF"
                />
              }
            />
            <SettingsRow
              icon={<Clock size={18} color={colors.primary} strokeWidth={2.5} />}
              title="Quiet Hours"
              subtitle="Silence notifications at night"
              onPress={() => handleComingSoon('Quiet Hours')}
              isLast
              colors={colors}
              isDark={isDark}
            />
          </SettingsCard>
        </Animated.View>

        {/* Preferences Section */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(400).duration(500)}>
          <SectionHeader title="PREFERENCES" colors={colors} />
          <SettingsCard colors={colors}>
            {sections[1].rows.map((row, idx) => (
              <SettingsRow
                key={row.title}
                icon={row.icon}
                title={row.title}
                subtitle={row.subtitle}
                value={'value' in row ? (row.value as string) : undefined}
                onPress={row.onPress}
                isLast={idx === sections[1].rows.length - 1}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </SettingsCard>
        </Animated.View>

        {/* Support & About Section */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(500).duration(500)}>
          <SectionHeader title="SUPPORT & ABOUT" colors={colors} />
          <SettingsCard colors={colors}>
            {sections[2].rows.map((row, idx) => (
              <SettingsRow
                key={row.title}
                icon={row.icon}
                title={row.title}
                subtitle={row.subtitle}
                onPress={row.onPress}
                isLast={idx === sections[2].rows.length - 1}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </SettingsCard>
        </Animated.View>

        {/* Log Out Button */}
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(600).duration(500)}>
          <Button
            style={{ marginTop: Spacing.xl, marginBottom: Spacing.xl }}
            onPress={handleLogout}
            title={t('settings.logout')}
            variant="outline"
            icon={<LogOut size={18} color={colors.error} strokeWidth={2.5} />}
            textStyle={{ color: colors.error }}
            fullWidth={true}
          />
        </Animated.View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={isLanguageModalVisible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]} onPress={e => e.stopPropagation()}>
            {/* Handle bar */}
            <View style={[styles.modalHandle, { backgroundColor: isDark ? '#3A3A3C' : '#E2E8F0' }]} />

            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
              {t('settings.selectLanguage')}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
              {SUPPORTED_LANGUAGES.map((lang, idx) => {
                const isSelected = i18n.language === lang.code;
                return (
                  <TouchableOpacity
                    key={lang.code}
                    style={[
                      styles.langOption,
                      isSelected && { backgroundColor: colors.primary + '12' },
                      idx === SUPPORTED_LANGUAGES.length - 1 && { borderBottomWidth: 0 },
                      { borderBottomColor: isDark ? '#2C2C2E' : '#F1F5F9' },
                    ]}
                    onPress={() => changeLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={styles.langTextWrap}>
                      <Text style={[styles.langNative, { color: isSelected ? colors.primary : colors.textPrimary }]}>
                        {lang.nativeName}
                      </Text>
                      <Text style={[styles.langEnglish, { color: colors.textSecondary }]}>
                        {lang.name}
                      </Text>
                    </View>
                    {isSelected && (
                      <View style={[styles.langCheck, { backgroundColor: colors.primary }]}>
                        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalCancelBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}
              onPress={() => setLanguageModalVisible(false)}
            >
              <Text style={[styles.modalCancelText, { color: colors.textPrimary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 4,
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  // Custom Switch
  switchTrack: {
    width: 51,
    height: 31,
    borderRadius: 16,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 27,
    height: 27,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2.5,
    elevation: 2,
  },
  // Profile card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    minHeight: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    color: '#fff',
    fontSize: Typography.header,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: Typography.header - 2,
    fontWeight: '700',
    marginBottom: 2,
    letterSpacing: -0.3,
  },
  profileEmail: {
    fontSize: Typography.body - 1,
  },
  // Section
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: Spacing.md + 36 + Spacing.md, // padding + icon + margin
  },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 4,
    minHeight: 56,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: Typography.body,
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: -0.2,
  },
  rowSubtitle: {
    fontSize: Typography.small,
  },
  rowValue: {
    fontSize: Typography.body - 1,
    fontWeight: '500',
    marginRight: Spacing.xs,
  },
  // Radio
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 40,
    maxHeight: '80%',
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
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: Typography.header,
    fontWeight: '800',
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
  },
  langFlag: {
    fontSize: 24,
    marginRight: 16,
  },
  langTextWrap: {
    flex: 1,
  },
  langNative: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  langEnglish: {
    fontSize: 13,
  },
  langCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtn: {
    marginTop: Spacing.xl,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 17,
    fontWeight: '600',
  },
});
