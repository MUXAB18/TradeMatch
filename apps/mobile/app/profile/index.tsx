import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Settings, FileText, Home } from 'lucide-react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCertifications } from '../../hooks/useCertifications';
import { generateCVHTML } from '../../utils/cvTemplate';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { EmptyProfileIllustration } from '../../components/illustrations';
import Button from '../../components/Button';
import { useToast } from '../../providers/ToastProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface InfoRowProps {
  label: string;
  value: string;
  colors: any;
}

function InfoRow({ label, value, colors }: InfoRowProps) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { data, loading, error } = useUserProfile();
  const [showPreview, setShowPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  // Fetch user's certifications for CV
  const { have: userCerts } = useCertifications(
    data?.trade || '',
    data?.country || '',
    data?.certifications || []
  );

  const handleEditProfile = () => {
    router.push('/profile/edit/name');
  };

  const handleExportCV = async () => {
    if (!data) {
      showToast('Profile not loaded', 'error');
      return;
    }

    try {
      const html = generateCVHTML({
        user: data,
        certifications: userCerts,
      });

      setPreviewHTML(html);
      setShowPreview(true);
    } catch (err) {
      console.error('CV generation error:', err);
      showToast('Failed to generate CV. Please try again.', 'error');
    }
  };

  const exportAnimTranslateY = useSharedValue(0);
  const exportAnimOpacity = useSharedValue(0);
  const exportAnimScale = useSharedValue(0.5);

  const exportIconAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: exportAnimOpacity.value,
      transform: [
        { translateY: exportAnimTranslateY.value },
        { scale: exportAnimScale.value },
      ],
      position: 'absolute',
      alignSelf: 'center',
      top: -30, // Just above the button
    };
  });

  const triggerExportSuccessAnim = (callback: () => void) => {
    exportAnimOpacity.value = 1;
    exportAnimScale.value = withSpring(1.5, { damping: 10, stiffness: 100 });
    exportAnimTranslateY.value = withSequence(
      withTiming(-80, { duration: 600 }),
      withDelay(200, withTiming(-100, { duration: 200 }, () => {
        runOnJS(callback)();
        exportAnimOpacity.value = withTiming(0, { duration: 200 }, () => {
          exportAnimTranslateY.value = 0;
          exportAnimScale.value = 0.5;
        });
      }))
    );
  };

  const handleConfirmExport = async () => {
    if (!data || !previewHTML) return;

    setIsExporting(true);

    try {
      const { uri } = await Print.printToFileAsync({
        html: previewHTML,
        base64: false,
      });

      triggerExportSuccessAnim(async () => {
        setShowPreview(false);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save or Share your CV',
            UTI: 'com.adobe.pdf',
          });
        } else {
          showToast('CV generated successfully!', 'success');
        }
      });
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export CV. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, Spacing.lg) }]}>
          <Skeleton width="50%" height={Typography.headerLarge} style={{ marginBottom: Spacing.lg }} />
        </View>
        
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Skeleton width="40%" height={Typography.body} style={{ marginBottom: Spacing.md }} />
          {[1, 2, 3, 4].map(i => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Skeleton width="25%" height={Typography.body} />
              <Skeleton width="40%" height={Typography.body} />
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Skeleton width="30%" height={Typography.body} style={{ marginBottom: Spacing.md }} />
          {[1, 2].map(i => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: colors.border }]}>
              <Skeleton width="40%" height={Typography.body} />
              <Skeleton width="30%" height={Typography.body} />
            </View>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Skeleton width="20%" height={Typography.body} style={{ marginBottom: Spacing.md }} />
          <View style={styles.skillsContainer}>
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} width={80} height={32} borderRadius={16} style={{ marginRight: Spacing.sm, marginBottom: Spacing.sm }} />
            ))}
          </View>
        </View>
        
        <Skeleton width="100%" height={Spacing.minTapTarget} style={{ marginTop: Spacing.md }} />
        <Skeleton width="100%" height={Spacing.minTapTarget} style={{ marginTop: Spacing.md }} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Profile</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/profile')}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          illustration={<EmptyProfileIllustration size={140} color={colors.primary} />}
          title="No Profile Found"
          description="Let's create your profile to start matching with jobs and tracking certifications."
          actionLabel="Get Started"
          onActionPress={handleEditProfile}
        />
      </View>
    );
  }

  const isProfileComplete = data.name !== 'New User' && data.yearsExperience > 0 && data.skills.length > 0;

  return (
    <View style={[{ flex: 1, backgroundColor: colors.background }]}>
      <View style={[styles.headerContainer, { paddingTop: Math.max(insets.top, Spacing.lg) }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.settingsIcon, { marginRight: Spacing.sm }]}
            onPress={() => router.push('/(tabs)/home')}
            accessibilityRole="button"
            accessibilityLabel="Go to Home"
          >
            <Home size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Your Profile</Text>
        </View>
        <TouchableOpacity
          style={styles.settingsIcon}
          onPress={() => router.push('/(tabs)/settings')}
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.container} 
        contentContainerStyle={{ paddingBottom: Spacing.xxl + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {!isProfileComplete && (
          <View style={[styles.incompleteCard, { backgroundColor: isDark ? colors.surface : `${colors.warning}20`, borderLeftColor: colors.warning }]}>
            <Text style={[styles.incompleteTitle, { color: colors.textPrimary }]}>⚠️ Complete Your Profile</Text>
            <Text style={[styles.incompleteText, { color: colors.textSecondary }]}>
              Add your experience and skills to get better job matches
            </Text>
          </View>
        )}

        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Basic Information</Text>
          <InfoRow label="Name" value={data.name} colors={colors} />
          <InfoRow label="Phone" value={data.phone} colors={colors} />
          <InfoRow label="Trade" value={data.trade} colors={colors} />
          <InfoRow label="Country" value={data.country} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Experience</Text>
          <InfoRow label="Years of Experience" value={`${data.yearsExperience} years`} colors={colors} />
          <InfoRow label="Availability" value={data.availability} colors={colors} />
        </View>

        <View style={[styles.section, { backgroundColor: colors.surface, shadowColor: isDark ? '#000' : colors.primary }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Skills</Text>
          {data.skills.length > 0 ? (
            <View style={styles.skillsContainer}>
              {data.skills.map((skill, index) => (
                <View key={index} style={[styles.skillChip, { backgroundColor: isDark ? colors.background : `${colors.primary}15` }]}>
                  <Text style={[styles.skillText, { color: colors.primary }]}>{skill}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No skills added yet</Text>
          )}
        </View>

        <Button
          title="Edit Profile"
          variant="primary"
          onPress={handleEditProfile}
          style={{ marginTop: Spacing.md }}
        />

        <Button
          title="Export CV as PDF"
          variant="outline"
          onPress={handleExportCV}
          icon={<Text style={{fontSize: 16}}>📄</Text>}
          style={{ marginTop: Spacing.md, marginBottom: Spacing.xl, borderColor: colors.primary }}
          textStyle={{ color: colors.primary }}
        />
      </ScrollView>

      <Modal
        visible={showPreview}
        animationType="slide"
        onRequestClose={() => setShowPreview(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>CV Preview</Text>
            <TouchableOpacity
              onPress={() => setShowPreview(false)}
              style={styles.modalCloseButton}
              accessibilityRole="button"
              accessibilityLabel="Close CV Preview"
            >
              <Text style={[styles.modalCloseText, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.previewContainer}>
              <Text style={[styles.previewHint, { color: colors.textSecondary }]}>
                Preview of your CV. Tap "Export PDF" to save or share.
              </Text>
              <View style={[styles.previewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.previewName, { color: colors.primary }]}>{data?.name}</Text>
                <Text style={[styles.previewTrade, { color: colors.textSecondary }]}>{data?.trade}</Text>
                <Text style={[styles.previewSection, { color: colors.textPrimary }]}>
                  {data?.yearsExperience} years experience
                </Text>
                <Text style={[styles.previewSection, { color: colors.textPrimary }]}>
                  {data?.skills.length} skills • {userCerts.length} certifications
                </Text>
              </View>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowPreview(false)}
              style={{ flex: 1, borderColor: colors.border }}
            />
            
            <View style={{ flex: 1, marginLeft: Spacing.md }}>
              <Animated.View style={exportIconAnimatedStyle} pointerEvents="none">
                <FileText size={32} color={colors.primary} />
              </Animated.View>
              <Button
                title="Export PDF"
                variant="primary"
                onPress={handleConfirmExport}
                loading={isExporting}
                disabled={isExporting}
              />
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
    padding: Spacing.lg,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  settingsIcon: {
    padding: Spacing.sm,
    minWidth: Spacing.minTapTarget,
    minHeight: Spacing.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.header,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.header,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  incompleteCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
  },
  incompleteTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  incompleteText: {
    fontSize: Typography.small,
  },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: Typography.body,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontSize: Typography.body,
  },
  infoValue: {
    fontSize: Typography.body,
    fontWeight: '500',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs,
  },
  skillChip: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  skillText: {
    fontSize: Typography.small,
    fontWeight: '500',
  },
  button: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.md,
    minHeight: Spacing.minTapTarget,
  },
  buttonSecondary: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  retryButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Spacing.minTapTarget,
  },
  retryText: {
    fontSize: Typography.body,
    fontWeight: '600',
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl * 2,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
  },
  modalCloseButton: {
    padding: Spacing.sm,
    minWidth: Spacing.minTapTarget,
    minHeight: Spacing.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: Typography.headerLarge,
  },
  modalContent: {
    flex: 1,
  },
  previewContainer: {
    padding: Spacing.lg,
  },
  previewHint: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  previewCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  previewName: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
  },
  previewTrade: {
    fontSize: Typography.header,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },
  previewSection: {
    fontSize: Typography.body,
    marginBottom: Spacing.xs,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: Spacing.lg,
    borderTopWidth: 1,
    paddingBottom: Spacing.xxl,
  },
});
