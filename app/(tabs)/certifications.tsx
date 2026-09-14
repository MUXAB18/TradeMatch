import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useNetwork } from '../../contexts/NetworkContext';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useCertifications } from '../../hooks/useCertifications';
import { updateUserProfile, getCurrentUserId } from '../../services/users';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { NoCertificationsIllustration } from '../../components/illustrations';
import { useToast } from '../../providers/ToastProvider';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';

interface CertificationItemProps {
  id: string;
  name: string;
  description: string;
  required: boolean;
  hasIt: boolean;
  onToggle: () => void;
  loading?: boolean;
  colors: any;
  isDark: boolean;
}

import Svg, { Path, Circle } from 'react-native-svg';
import Animated, { 
  useAnimatedProps, 
  useSharedValue, 
  withTiming, 
  withDelay,
  Easing,
  interpolateColor
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedText = Animated.createAnimatedComponent(Text);

function CertificationItem({
  name,
  description,
  required,
  hasIt,
  onToggle,
  loading,
  colors,
  isDark,
}: CertificationItemProps) {
  // SVG drawing progress (0 to 1)
  const progress = useSharedValue(hasIt ? 1 : 0);
  
  React.useEffect(() => {
    progress.value = withTiming(hasIt ? 1 : 0, {
      duration: 400,
      easing: Easing.inOut(Easing.ease),
    });
  }, [hasIt]);

  const pathAnimatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: 100 * (1 - progress.value),
    };
  });

  const circleAnimatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: 100 * (1 - (1 - progress.value)), // Just to make circle do something if we wanted to
      opacity: 1 - progress.value,
    };
  });

  const textAnimatedStyle = {
    color: hasIt ? colors.success : colors.textSecondary,
  };

  return (
    <TouchableOpacity
      style={[
        styles.certItem,
        {
          backgroundColor: hasIt ? (isDark ? colors.surface : colors.white) : (isDark ? colors.surface : colors.background),
          borderColor: hasIt ? `${colors.success}40` : `${colors.warning}80`,
        }
      ]}
      onPress={onToggle}
      disabled={loading}
      activeOpacity={0.7}
      accessibilityLabel={`${name}. ${hasIt ? 'Obtained' : 'Missing'}. ${required ? 'Required certification. ' : ''}${description}. Tap to ${hasIt ? 'remove' : 'mark as obtained'}.`}
      accessibilityRole="button"
    >
      <View style={styles.certContent}>
        <View style={styles.certHeader}>
          <View style={styles.certTitle}>
            <Text
              style={[
                styles.certName,
                { color: hasIt ? colors.success : colors.textPrimary }
              ]}
            >
              {name}
            </Text>
            {required && (
              <View style={[styles.requiredBadge, { backgroundColor: `${colors.warning}20` }]}>
                <Text style={[styles.requiredText, { color: colors.warning }]}>Required</Text>
              </View>
            )}
          </View>
          <View style={[
            styles.statusBadge, 
            { backgroundColor: hasIt ? `${colors.success}20` : `${colors.textSecondary}20` }
          ]}>
            <Svg width="18" height="18" viewBox="0 0 24 24" style={{ marginRight: Spacing.xs }}>
              {/* Unchecked state (circle) */}
              <AnimatedCircle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke={colors.textSecondary} 
                strokeWidth="2" 
                fill="none" 
                animatedProps={circleAnimatedProps}
              />
              {/* Checked state (checkmark) */}
              <AnimatedPath
                d="M5 13l4 4L19 7"
                stroke={colors.success}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                strokeDasharray="100"
                animatedProps={pathAnimatedProps}
              />
            </Svg>
            <AnimatedText
              style={[
                styles.statusText,
                textAnimatedStyle
              ]}
            >
              {hasIt ? 'Have' : 'Missing'}
            </AnimatedText>
          </View>
        </View>
        <Text style={[styles.certDescription, { color: colors.textSecondary }]}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function CertificationsScreen() {
  const { data: profile, loading: profileLoading } = useUserProfile();
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const { showToast } = useToast();
  const { colors, isDark } = useAppTheme();
  const { isOffline } = useNetwork();

  const {
    have,
    missing,
    loading: certsLoading,
    error,
    refetch,
  } = useCertifications(
    profile?.trade || '',
    profile?.country || '',
    profile?.certifications || []
  );

  const handleToggle = async (certId: string, currentlyHas: boolean) => {
    if (isOffline) {
      showToast('You are offline', 'error');
      return;
    }

    if (!profile) {
      showToast('Profile not loaded', 'error');
      return;
    }

    setTogglingId(certId);

    try {
      const userId = getCurrentUserId();
      if (!userId) {
        throw new Error('Not authenticated');
      }

      const updatedCerts = currentlyHas
        ? profile.certifications.filter(id => id !== certId)
        : [...profile.certifications, certId];

      const result = await updateUserProfile(userId, {
        certifications: updatedCerts,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      showToast(currentlyHas ? 'Certification removed' : 'Certification added', 'success');

      await refetch();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update. Please try again.';
      showToast(errorMessage, 'error');
    } finally {
      setTogglingId(null);
    }
  };

  if (profileLoading || certsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Skeleton width="60%" height={Typography.headerLarge} style={{ marginBottom: Spacing.xs }} />
          <Skeleton width="40%" height={Typography.body} style={{ marginBottom: Spacing.md }} />
          
          <View style={[styles.progressCard, { backgroundColor: colors.background }]}>
            <View style={styles.progressRow}>
              <Skeleton width="20%" height={Typography.body} />
              <Skeleton width="15%" height={Typography.body} />
            </View>
            <Skeleton width="100%" height={6} borderRadius={3} />
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Skeleton width="30%" height={Typography.header} style={{ marginBottom: Spacing.xs }} />
              <Skeleton width="40%" height={Typography.small} />
            </View>
            
            {[1, 2, 3].map(i => (
              <View
                key={i}
                style={[
                  styles.certItem,
                  {
                    backgroundColor: isDark ? colors.surface : colors.background,
                    borderColor: `${colors.textSecondary}30`,
                  }
                ]}
              >
                <View style={styles.certContent}>
                  <View style={styles.certHeader}>
                    <Skeleton width="50%" height={Typography.body} style={{ marginBottom: Spacing.xs }} />
                    <Skeleton width={80} height={24} borderRadius={12} />
                  </View>
                  <Skeleton width="90%" height={Typography.body} style={{ marginBottom: Spacing.xs }} />
                  <Skeleton width="70%" height={Typography.body} />
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Certifications</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (have.length === 0 && missing.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Certification Checklist</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            {profile?.trade} • {profile?.country}
          </Text>
        </View>

        <EmptyState
          illustration={<NoCertificationsIllustration size={120} color={colors.primary} />}
          title="No Certifications Found"
          description={`No certification data available for ${profile?.trade} in ${profile?.country}. Check back later or contact support.`}
        />
      </View>
    );
  }

  const totalCount = have.length + missing.length;
  const completionPercent = Math.round((have.length / totalCount) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Certification Checklist</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>
          {profile?.trade} • {profile?.country}
        </Text>

        <View style={[styles.progressCard, { backgroundColor: colors.background }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: colors.textPrimary }]}>Progress</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>
              {have.length} of {totalCount}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
            <View
              style={[styles.progressFill, { width: `${completionPercent}%`, backgroundColor: colors.success }]}
            />
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {missing.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Missing ({missing.length})</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>
                Tap to mark as obtained
              </Text>
            </View>
            {missing.map((cert) => (
              <CertificationItem
                key={cert.id}
                id={cert.id!}
                name={cert.name}
                description={cert.description}
                required={cert.required}
                hasIt={false}
                onToggle={() => handleToggle(cert.id!, false)}
                loading={togglingId === cert.id}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        {have.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Obtained ({have.length})</Text>
              <Text style={[styles.sectionSubtitle, { color: colors.textSecondary }]}>Tap to remove</Text>
            </View>
            {have.map((cert) => (
              <CertificationItem
                key={cert.id}
                id={cert.id!}
                name={cert.name}
                description={cert.description}
                required={cert.required}
                hasIt={true}
                onToggle={() => handleToggle(cert.id!, true)}
                loading={togglingId === cert.id}
                colors={colors}
                isDark={isDark}
              />
            ))}
          </View>
        )}

        <View style={[styles.disclaimer, { backgroundColor: `${colors.secondary}10`, borderLeftColor: colors.secondary }]}>
          <Text style={[styles.disclaimerText, { color: colors.textPrimary }]}>
            ⚠️ This list is for reference only. Always verify certification
            requirements with local licensing authorities.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Spacing.xl + 20, // adjust for status bar
    borderBottomWidth: 1,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  progressCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  progressValue: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.header,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  sectionSubtitle: {
    fontSize: Typography.small,
  },
  certItem: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    minHeight: Spacing.minTapTarget,
  },
  certContent: {
    flex: 1,
  },
  certHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  certTitle: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  certName: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  requiredBadge: {
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-start',
    marginTop: Spacing.xs,
  },
  requiredText: {
    fontSize: Typography.small,
    fontWeight: '600',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  statusIcon: {
    fontSize: Typography.body,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.small,
    fontWeight: '600',
  },
  certDescription: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
  },
  disclaimer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderLeftWidth: 4,
    marginTop: Spacing.md,
  },
  disclaimerText: {
    fontSize: Typography.small,
    lineHeight: Typography.small * Typography.lineHeight,
  },
  errorTitle: {
    fontSize: Typography.header,
    fontWeight: 'bold',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.lg,
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
});
