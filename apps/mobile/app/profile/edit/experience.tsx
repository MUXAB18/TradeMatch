import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from '../../../utils/haptics';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../../contexts/NetworkContext';
import { useToast } from '../../../providers/ToastProvider';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { updateUserProfile, getCurrentUserId } from '../../../services/users';
import ProgressBar from '../../../components/ProgressBar';
import Button from '../../../components/Button';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../../constants/theme';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 2;

const EXPERIENCE_OPTIONS = [
  { value: 0, label: 'Less than 1 year', description: 'Entry level' },
  { value: 1, label: '1-2 years', description: 'Some experience' },
  { value: 3, label: '3-5 years', description: 'Experienced' },
  { value: 6, label: '6-10 years', description: 'Very experienced' },
  { value: 11, label: '10+ years', description: 'Expert' },
];

interface ExperienceCardProps {
  option: typeof EXPERIENCE_OPTIONS[0];
  selected: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
}

function ExperienceCard({ option, selected, onPress, colors, isDark }: ExperienceCardProps) {
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

export default function ExperienceStep() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();

  useEffect(() => {
    if (profile && profile.yearsExperience !== undefined) {
      // Find closest match
      const closest = EXPERIENCE_OPTIONS.reduce((prev, curr) => {
        return Math.abs(curr.value - profile.yearsExperience) <
          Math.abs(prev.value - profile.yearsExperience)
          ? curr
          : prev;
      });
      setSelectedValue(closest.value);
    }
  }, [profile]);

  const handleContinue = async () => {
    if (isOffline) {
      showToast('Cannot save while offline', 'error');
      return;
    }

    if (selectedValue === null) {
      showToast('Please select your years of experience', 'error');
      return;
    }

    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const result = await updateUserProfile(userId, {
        yearsExperience: selectedValue,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('Profile saved', 'success');
      router.push('/profile/edit/skills');
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

    if (selectedValue !== null && selectedValue !== profile?.yearsExperience) {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (userId) {
          await updateUserProfile(userId, { yearsExperience: selectedValue });
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>How many years of experience do you have?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select the range that best matches your experience in {profile?.trade}
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {EXPERIENCE_OPTIONS.map(option => (
            <ExperienceCard
              key={option.value}
              option={option}
              selected={selectedValue === option.value}
              onPress={() => setSelectedValue(option.value)}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={selectedValue === null || isOffline}
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
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
