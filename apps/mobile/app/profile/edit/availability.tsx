import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import * as Haptics from '../../../utils/haptics';
import { useRouter } from 'expo-router';
import LottieView from 'lottie-react-native';
import { useNetwork } from '../../../contexts/NetworkContext';
import { useToast } from '../../../providers/ToastProvider';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { updateUserProfile, getCurrentUserId } from '../../../services/users';
import { AVAILABILITY_OPTIONS } from '../../../constants/skills';
import ProgressBar from '../../../components/ProgressBar';
import Button from '../../../components/Button';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../../constants/theme';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 4;

interface AvailabilityCardProps {
  option: typeof AVAILABILITY_OPTIONS[0];
  selected: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}

function AvailabilityCard({ option, selected, onPress, colors, isDark }: AvailabilityCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: isDark ? colors.surface : colors.white,
          borderColor: selected ? colors.primary : colors.border,
        },
        selected && { backgroundColor: isDark ? 'rgba(93, 214, 44, 0.1)' : 'rgba(93, 214, 44, 0.05)' }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={option.label}
      accessibilityState={{ selected }}
    >
      <View style={styles.cardContent}>
        <Text style={[styles.cardLabel, { color: selected ? colors.primary : colors.textPrimary }]}>
          {option.label}
        </Text>
        <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>{option.description}</Text>
      </View>
      <View style={[
        styles.radioOuter,
        { borderColor: selected ? colors.primary : colors.textSecondary }
      ]}>
        {selected && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
      </View>
    </TouchableOpacity>
  );
}

export default function AvailabilityStep() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [selectedAvailability, setSelectedAvailability] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();
  
  const confettiRef = useRef<LottieView>(null);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    if (profile && profile.availability) {
      setSelectedAvailability(profile.availability);
    }
  }, [profile]);

  const handleComplete = async () => {
    if (isOffline) {
      showToast('Cannot save while offline', 'error');
      return;
    }
    if (!selectedAvailability) {
      showToast('Please select your availability', 'error');
      return;
    }

    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const result = await updateUserProfile(userId, {
        availability: selectedAvailability,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      // Profile complete!
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      if (!reduceMotion && confettiRef.current) {
        setShowConfetti(true);
        confettiRef.current.play();
        setTimeout(() => {
          showToast('Profile Complete! 🎉', 'success');
          router.replace('/profile');
        }, 1500); // let confetti play a bit
      } else {
        showToast('Profile Complete! 🎉', 'success');
        router.replace('/profile');
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (isOffline) {
      showToast('Cannot save while offline', 'error');
      return;
    }
    if (selectedAvailability && selectedAvailability !== profile?.availability) {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (userId) {
          await updateUserProfile(userId, { availability: selectedAvailability });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          showToast('Profile saved', 'success');
        }
      } catch (err) {
        console.error('Save error:', err);
      }
      setLoading(false);
    }
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProgressBar
        currentStep={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        label="Complete Your Profile"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>When can you start?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Let employers know your availability for new opportunities
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {AVAILABILITY_OPTIONS.map(option => (
            <AvailabilityCard
              key={option.id}
              option={option}
              selected={selectedAvailability === option.id}
              onPress={() => setSelectedAvailability(option.id)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>

        <View style={[styles.infoBox, { backgroundColor: isDark ? 'rgba(51, 116, 24, 0.2)' : 'rgba(93, 214, 44, 0.1)', borderLeftColor: isDark ? '#1E4D6B' : colors.primary }]}>
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            💡 You can update your availability anytime from your profile
          </Text>
        </View>
      </ScrollView>

      {showConfetti && (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <LottieView
            ref={confettiRef}
            source={require('../../../assets/lottie/confetti.json')}
            loop={false}
            style={{ width: '100%', height: '100%' }}
          />
        </View>
      )}

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Complete Profile"
          onPress={handleComplete}
          loading={loading}
          disabled={!selectedAvailability || isOffline}
        />
        <Button
          title="Save & Exit"
          onPress={handleSaveAndExit}
          variant="secondary"
          disabled={loading || isOffline}
          style={styles.secondaryButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
  },
  header: {
    marginBottom: Spacing.xl,
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
  cardsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: Spacing.minTapTarget,
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardDescription: {
    fontSize: Typography.small,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  infoBox: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
  },
  infoText: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
