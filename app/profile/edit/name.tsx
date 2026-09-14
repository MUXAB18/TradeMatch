import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../../contexts/NetworkContext';
import { useToast } from '../../../providers/ToastProvider';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { updateUserProfile, getCurrentUserId } from '../../../services/users';
import ProgressBar from '../../../components/ProgressBar';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import { useAppTheme, Typography, Spacing } from '../../../constants/theme';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 1;

export default function NameStep() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const { colors } = useAppTheme();
  const { isOffline } = useNetwork();

  useEffect(() => {
    if (profile && profile.name !== 'New User') {
      setName(profile.name);
    }
  }, [profile]);

  const handleContinue = async () => {
    if (isOffline) {
      showToast('Cannot save while offline', 'error');
      return;
    }
    // Validation
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      // Save-as-you-go per prd.md Section 5.1
      const result = await updateUserProfile(userId, {
        name: name.trim(),
      });

      if (result.error) {
        throw new Error(result.error);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('Profile saved', 'success');
      // Navigate to next step
      router.push('/profile/edit/experience');
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to save. Please try again.';
      setError(errorMessage);
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
    if (name.trim() && name !== profile?.name) {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (userId) {
          await updateUserProfile(userId, { name: name.trim() });
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
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ProgressBar
        currentStep={CURRENT_STEP}
        totalSteps={TOTAL_STEPS}
        label="Complete Your Profile"
      />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>What's your name?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            This will be shown on your profile and applications
          </Text>
        </View>

        <Input
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={text => {
            setName(text);
            setError('');
          }}
          error={error}
          autoFocus
          autoCapitalize="words"
          textContentType="name"
          maxLength={100}
        />

        <View style={styles.buttonContainer}>
          <Button title="Continue" onPress={handleContinue} loading={loading} disabled={isOffline} />

          <Button
            title="Save & Exit"
            onPress={handleSaveAndExit}
            variant="secondary"
            disabled={loading || isOffline}
            style={styles.secondaryButton}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
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
  buttonContainer: {
    marginTop: Spacing.lg,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
});
