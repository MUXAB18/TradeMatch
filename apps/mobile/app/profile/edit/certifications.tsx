import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Edit2 } from 'lucide-react-native';
import * as Haptics from '../../../utils/haptics';
import { useRouter } from 'expo-router';
import { useNetwork } from '../../../contexts/NetworkContext';
import { useToast } from '../../../providers/ToastProvider';
import { useUserProfile } from '../../../hooks/useUserProfile';
import { updateUserProfile, getCurrentUserId } from '../../../services/users';

import ProgressBar from '../../../components/ProgressBar';
import SkillTag from '../../../components/SkillTag';
import Button from '../../../components/Button';
import Input from '../../../components/Input';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../../constants/theme';

const TOTAL_STEPS = 4;
const CURRENT_STEP = 4;

export default function CertificationsStep() {
  const router = useRouter();
  const { data: profile } = useUserProfile();
  const [selectedCertifications, setSelectedCertifications] = useState<string[]>([]);
  const [certificationDetails, setCertificationDetails] = useState<Record<string, { photoURL?: string; completionDate?: string; issuer?: string }>>({});
  const [editingCert, setEditingCert] = useState<string | null>(null);
  const [certForm, setCertForm] = useState<{ photoURL?: string; completionDate?: string; issuer?: string }>({});
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customCertification, setCustomCertification] = useState('');
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();

  const presetCertifications = profile ? ["OSHA 10", "OSHA 30", "First Aid/CPR", "EPA Section 608", "Journeyman License", "Master License", "NCCER Certified", "AWS Certified Welder"] : [];

  useEffect(() => {
    if (profile && profile.certifications && profile.certifications.length > 0) {
      setSelectedCertifications(profile.certifications);
    }
    if (profile && profile.certificationDetails) {
      setCertificationDetails(profile.certificationDetails);
    }
  }, [profile]);

  const handleToggleCertification = (certification: string) => {
    setSelectedCertifications(prev =>
      prev.includes(certification) ? prev.filter(s => s !== certification) : [...prev, certification]
    );
  };

  const handleAddCustomCertification = () => {
    const trimmed = customCertification.trim();
    if (!trimmed) {
      return;
    }

    if (selectedCertifications.includes(trimmed)) {
      showToast('This certification is already in your list', 'error');
      return;
    }

    setSelectedCertifications(prev => [...prev, trimmed]);
    setCustomCertification('');
    setShowCustomModal(false);
  };


  const handleEditCertDetails = (cert: string) => {
    setEditingCert(cert);
    setCertForm(certificationDetails[cert] || {});
  };

  const handleSaveCertDetails = () => {
    if (editingCert) {
      setCertificationDetails(prev => ({
        ...prev,
        [editingCert]: certForm
      }));
    }
    setEditingCert(null);
    setCertForm({});
  };

  const handlePickCertImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.2,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIsUploadingPhoto(true);
        const asset = result.assets[0];
        if (asset.base64) {
          const base64Data = `data:image/jpeg;base64,${asset.base64}`;
          setCertForm(prev => ({ ...prev, photoURL: base64Data }));
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      showToast('Failed to attach photo', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleContinue = async () => {
    if (isOffline) {
      showToast('Cannot save while offline', 'error');
      return;
    }
    if (selectedCertifications.length === 0) {
      showToast('Please select at least one certification', 'error');
      return;
    }

    setLoading(true);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const result = await updateUserProfile(userId, {
        certifications: selectedCertifications,
        certificationDetails,
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
    if (selectedCertifications.length > 0) {
      setLoading(true);
      try {
        const userId = getCurrentUserId();
        if (userId) {
          await updateUserProfile(userId, { certifications: selectedCertifications, certificationDetails });
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
          <Text style={[styles.title, { color: colors.textPrimary }]}>What certifications do you have?</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Select all that apply. You can add custom certifications too.
          </Text>
        </View>

{selectedCertifications.length > 0 && (
          <View style={styles.selectedContainer}>
            <Text style={[styles.selectedLabel, { color: colors.primary, marginBottom: Spacing.sm }]}>
              Selected ({selectedCertifications.length})
            </Text>
            {selectedCertifications.map(cert => (
              <View key={cert} style={[styles.selectedCertCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', borderColor: colors.border }]}>
                <View style={styles.selectedCertHeader}>
                  <Text style={[styles.selectedCertName, { color: colors.textPrimary }]}>{cert}</Text>
                  <TouchableOpacity onPress={() => handleEditCertDetails(cert)}>
                    <Edit2 size={18} color={colors.primary} />
                  </TouchableOpacity>
                </View>
                {certificationDetails[cert]?.completionDate && (
                  <Text style={{ color: colors.textSecondary, marginTop: 4 }}>Date: {certificationDetails[cert].completionDate}</Text>
                )}
                {certificationDetails[cert]?.issuer && (
                  <Text style={{ color: colors.textSecondary, marginTop: 2 }}>Issuer: {certificationDetails[cert].issuer}</Text>
                )}
                {certificationDetails[cert]?.photoURL && (
                  <Text style={{ color: colors.success || '#10B981', marginTop: 2, fontSize: 12, fontWeight: '600' }}>PHOTO ATTACHED</Text>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={styles.certificationsContainer}>
          {presetCertifications.map(certification => (
            <SkillTag
              key={certification}
              label={certification}
              selected={selectedCertifications.includes(certification)}
              onPress={() => handleToggleCertification(certification)}
            />
          ))}

          <TouchableOpacity
            style={[styles.addCustomButton, { borderColor: colors.secondary }]}
            onPress={() => setShowCustomModal(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Add Custom Certification"
          >
            <Text style={[styles.addCustomText, { color: colors.secondary }]}>+ Add Custom Certification</Text>
          </TouchableOpacity>
        </View>

        {/* Custom certifications */}
        {selectedCertifications.some(s => !presetCertifications.includes(s)) && (
          <View style={styles.customSection}>
            <Text style={[styles.customLabel, { color: colors.textPrimary }]}>Custom Certifications:</Text>
            <View style={styles.certificationsContainer}>
              {selectedCertifications
                .filter(s => !presetCertifications.includes(s))
                .map(certification => (
                  <SkillTag
                    key={certification}
                    label={certification}
                    selected={true}
                    onPress={() => handleToggleCertification(certification)}
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
          disabled={selectedCertifications.length === 0 || isOffline}
        />
        <Button
          title="Save & Exit"
          onPress={handleSaveAndExit}
          variant="secondary"
          disabled={loading || isOffline}
          style={styles.secondaryButton}
        />
      </View>

      {/* Edit Cert Details Modal */}
      <Modal
        visible={!!editingCert}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingCert(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Details for {editingCert}</Text>
            
            <TouchableOpacity style={styles.photoUploadBtn} onPress={handlePickCertImage} disabled={isUploadingPhoto}>
              {certForm.photoURL ? (
                <Image source={{ uri: certForm.photoURL }} style={styles.certPreviewImg} />
              ) : (
                <View style={[styles.certImagePlaceholder, { backgroundColor: isDark ? '#1F2937' : '#F3F4F6' }]}>
                  <Camera size={24} color={colors.textSecondary} />
                  <Text style={{ color: colors.textSecondary, marginTop: 8 }}>{isUploadingPhoto ? 'Uploading...' : 'Upload Photo'}</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={{ color: colors.textPrimary, marginTop: Spacing.md, marginBottom: 4 }}>Completion Date (e.g. MM/YYYY)</Text>
            <Input
              placeholder="MM/YYYY"
              value={certForm.completionDate || ''}
              onChangeText={(text) => setCertForm(prev => ({ ...prev, completionDate: text }))}
            />

            <Text style={{ color: colors.textPrimary, marginTop: Spacing.md, marginBottom: 4 }}>Issuer / Organization</Text>
            <Input
              placeholder="e.g. OSHA, NCCER"
              value={certForm.issuer || ''}
              onChangeText={(text) => setCertForm(prev => ({ ...prev, issuer: text }))}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colors.border }]}
                onPress={() => setEditingCert(null)}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleSaveCertDetails}
              >
                <Text style={[styles.modalButtonPrimaryText, { color: isDark ? '#000000' : '#FFFFFF' }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Certification Modal */}
      <Modal
        visible={showCustomModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCustomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? colors.surface : colors.white }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add Custom Certification</Text>
            <Input
              placeholder="Enter certification name"
              value={customCertification}
              onChangeText={setCustomCertification}
              autoFocus
              maxLength={50}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary, { borderColor: colors.border }]}
                onPress={() => {
                  setCustomCertification('');
                  setShowCustomModal(false);
                }}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleAddCustomCertification}
                accessibilityRole="button"
                accessibilityLabel="Add certification"
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
  selectedCertCard: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  selectedCertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedCertName: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  photoUploadBtn: {
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  certImagePlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  certPreviewImg: {
    width: '100%',
    height: 120,
    borderRadius: BorderRadius.md,
    resizeMode: 'cover',
  },
  selectedLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  certificationsContainer: {
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
