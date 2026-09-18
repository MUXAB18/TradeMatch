import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from '../../../utils/haptics';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../../contexts/NetworkContext';
import { useToast } from '../../../providers/ToastProvider';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { updateUserProfile, getCurrentUserId } from '../../../services/users';
import { getSkillsForTrade } from '../../../constants/skills';
import ProgressBar from '../../../components/ProgressBar';
import SkillTag from '../../../components/SkillTag';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../../constants/theme';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 3;

export default function SkillsStep() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customSkill, setCustomSkill] = useState('');
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();

  const presetSkills = profile ? getSkillsForTrade(profile.trade) : [];

  useEffect(() => {
    if (profile && profile.skills.length > 0) {
      setSelectedSkills(profile.skills);
    }
  }, [profile]);

  const handleToggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (!trimmed) {
      return;
    }

    if (selectedSkills.includes(trimmed)) {
      showToast('This skill is already in your list', 'error');
      return;
    }

    setSelectedSkills(prev => [...prev, trimmed]);
    setCustomSkill('');
    setShowCustomModal(false);
  };

  const handleContinue = async () => {
    if (isOffline) {
      showToast('Cannot save while offline', 'error');
      return;
    }
    if (selectedSkills.length === 0) {
      showToast('Please select at least one skill', 'error');
      return;
    }

    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const result = await updateUserProfile(userId, {
        skills: selectedSkills,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast('Profile saved', 'success');
      router.push('/profile/edit/availability');
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
    if (selectedSkills.length > 0) {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (userId) {
          await updateUserProfile(userId, { skills: selectedSkills });
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>What skills do you have?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select all that apply. You can add custom skills too.
          </Text>
        </View>

        {selectedSkills.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={[styles.selectedLabel, { color: colors.primary }]}>
              Selected ({selectedSkills.length})
            </Text>
          </View>
        )}

        <View style={styles.skillsContainer}>
          {presetSkills.map(skill => (
            <SkillTag
              key={skill}
              label={skill}
              selected={selectedSkills.includes(skill)}
              onPress={() => handleToggleSkill(skill)}
            />
          ))}

          <TouchableOpacity
            style={[styles.addCustomButton, { borderColor: colors.secondary }]}
            onPress={() => setShowCustomModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Add Custom Skill"
          >
            <Text style={[styles.addCustomText, { color: colors.secondary }]}>+ Add Custom Skill</Text>
          </TouchableOpacity>
        </View>

        {/* Custom skills */}
        {selectedSkills.some(s => !presetSkills.includes(s)) && (
          <View style={styles.customSection}>
            <Text style={[styles.customLabel, { color: colors.textPrimary }]}>Custom Skills:</Text>
            <View style={styles.skillsContainer}>
              {selectedSkills
                .filter(s => !presetSkills.includes(s))
                .map(skill => (
                  <SkillTag
                    key={skill}
                    label={skill}
                    selected={true}
                    onPress={() => handleToggleSkill(skill)}
                  />
                ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border }]}>
        <Button
          title="Continue"
          onPress={handleContinue}
          loading={loading}
          disabled={selectedSkills.length === 0 || isOffline}
        />
        <Button
          title="Save & Exit"
          onPress={handleSaveAndExit}
          variant="secondary"
          disabled={loading || isOffline}
          style={styles.secondaryButton}
        />
      </View>

      {/* Custom Skill Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Custom Skill</Text>
            <Input
              placeholder="Enter skill name"
              value={customSkill}
              onChangeText={setCustomSkill}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colors.border }]}
                onPress={() => {
                  setCustomSkill('');
                  setShowCustomModal(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleAddCustomSkill}
                accessibilityRole="button"
                accessibilityLabel="Add skill"
              >
                <Text style={[styles.modalButtonPrimaryText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: Spacing.lg,
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
  selectedContainer: {
    marginBottom: Spacing.md,
  },
  selectedLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  addCustomButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderStyle: 'dashed',
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  addCustomText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  customSection: {
    marginTop: Spacing.lg,
  },
  customLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  secondaryButton: {
    marginTop: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: Typography.header,
    fontWeight: '800',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonPrimary: {
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
  },
  modalButtonPrimaryText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  modalButtonSecondaryText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
});
