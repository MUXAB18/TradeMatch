import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import AnimatedCircleProgress from './AnimatedCircleProgress';
import Animated, { 
  FadeInUp, 
  useReducedMotion, 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  useAnimatedProps, 
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import Button from './Button';
import { useToast } from '../providers/ToastProvider';

function getMatchQualityColor(score: number) {
  if (score >= 80) return 'success';
  if (score >= 60) return 'secondary';
  return 'warning';
}

function getMatchQualityLabel(score: number) {
  if (score >= 80) return 'Strong Match';
  if (score >= 60) return 'Good Match';
  return 'Partial Match';
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const SWIPE_THRESHOLD = 80;

interface JobCardProps {
  job: any;
  score: any;
  expanded?: boolean;
  onPress: () => void;
  colors: any;
  isDark: boolean;
  index: number;
  scrollY?: Animated.SharedValue<number>;
  parallaxEnabled?: boolean;
  swipeEnabled?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  isNew?: boolean;
  onSave?: () => void;
  onApply?: () => void;
}

export default function JobCard({ 
  job, 
  score, 
  expanded = false, 
  onPress, 
  colors, 
  isDark, 
  index, 
  scrollY,
  parallaxEnabled = true,
  swipeEnabled = true,
  isSaved = false,
  isApplied = false,
  isNew = false,
  onSave,
  onApply
}: JobCardProps) {
  const reducedMotion = useReducedMotion();
  const matchColor = getMatchQualityColor(score.total);
  const colorMap: any = {
    success: colors.success,
    secondary: colors.secondary,
    warning: colors.warning,
    textSecondary: colors.textSecondary,
  };

  // Swipe gesture
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardHeight = useSharedValue('auto');
  const marginB = useSharedValue(Spacing.md);

  const { showToast } = useToast();

  const handleDismiss = () => {
    showToast(`Dismissed ${job.title}`, 'info');
  };
  const handleSave = () => {
    if (onSave) onSave();
  };

  const panGesture = {
    onActive: (event: any) => {
      if (!swipeEnabled) return;
      translateX.value = event.translationX;
    },
    onEnd: (event: any) => {
      if (!swipeEnabled) return;
      if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
        if (event.translationX > 0) {
          runOnJS(handleSave)();
        } else {
          runOnJS(handleDismiss)();
        }
        translateX.value = withSpring(Math.sign(event.translationX) * 500);
        cardOpacity.value = withTiming(0);
        marginB.value = withTiming(0);
        cardHeight.value = withTiming(0);
      } else {
        translateX.value = withSpring(0);
      }
    }
  };

  const swipeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: cardOpacity.value,
      marginBottom: marginB.value,
      height: cardHeight.value === 'auto' ? undefined : cardHeight.value,
    };
  });

  // Parallax scroll effect
  const cardY = index * 180; // approximate card height
  const parallaxStyle = useAnimatedStyle(() => {
    if (reducedMotion || !parallaxEnabled || !scrollY) return {};
    const translateY = interpolate(
      scrollY.value,
      [cardY - 500, cardY + 500],
      [15, -15],
      Extrapolation.CLAMP
    );
    return {
      transform: [{ translateY }],
    };
  });

  // Counting score
  const displayScore = useSharedValue(0);
  React.useEffect(() => {
    if (reducedMotion) {
      displayScore.value = score.total;
    } else {
      displayScore.value = withTiming(score.total, { duration: 800 });
    }
  }, [score.total, reducedMotion]);

  const animatedProps = useAnimatedProps(() => {
    return {
      text: `${Math.round(displayScore.value)}%`,
    } as any;
  });

  return (
    <PanGestureHandler 
      onGestureEvent={swipeEnabled ? panGesture.onActive : undefined} 
      onEnded={swipeEnabled ? panGesture.onEnd : undefined}
    >
      <Animated.View style={[swipeAnimatedStyle]}>
        <AnimatedTouchableOpacity
          entering={reducedMotion ? undefined : FadeInUp.delay(index * 50).duration(250)}
          style={[
            styles.jobCard,
            {
              backgroundColor: isDark ? colors.surface : colors.white,
              borderColor: isDark ? colors.border : `${colors.textSecondary}30`,
            },
            parallaxStyle
          ]}
          onPress={onPress}
          activeOpacity={0.7}
          accessibilityLabel={`${job.title} at ${job.company || 'company'}. ${score.total}% match. Tap for details.`}
          accessibilityRole="button"
        >
          <View style={styles.jobHeader}>
            <View style={styles.jobTitleContainer}>
              <Text style={[styles.jobTitle, { color: colors.textPrimary }]}>{job.title}</Text>
              {job.company && (
                <Text style={[styles.jobCompany, { color: colors.textSecondary }]}>{job.company}</Text>
              )}
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {isNew && (
                <Animated.View style={[styles.newBadge, { backgroundColor: colors.primary, marginRight: Spacing.sm }]}>
                  <Text style={[styles.newBadgeText, { color: '#F5F5F7' }]}>NEW</Text>
                </Animated.View>
              )}
              <View style={[styles.matchBadge, { backgroundColor: `${colorMap[matchColor]}15` }]}>
                <AnimatedTextInput
                  editable={false}
                  animatedProps={animatedProps}
                  style={[styles.matchScore, { color: colorMap[matchColor], padding: 0 }]}
                  value={`${score.total}%`}
                />
              </View>
              <Button
                style={[{ marginLeft: Spacing.sm }, isApplied && { backgroundColor: colors.success, shadowColor: colors.success }]}
                onPress={onApply}
                title={isApplied ? "✓ Marked as Applied" : "Mark as Applied"}
                variant="primary"
                fullWidth={false}
                size="sm"
              />
            </View>
          </View>

          <Text style={[styles.matchLabel, { color: colorMap[matchColor] }]}>
            {getMatchQualityLabel(score.total)}
          </Text>

          <View style={styles.keyInfo}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {score.breakdown.distanceKm} km away
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⚙️</Text>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                {score.breakdown.matchedSkills.length}/{job.requiredSkills.length} skills match
              </Text>
            </View>

            {job.requiredCerts.length > 0 && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>📜</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                  {score.breakdown.matchedCerts.length}/{job.requiredCerts.length} certs match
                </Text>
              </View>
            )}

            {job.salary && (
              <View style={styles.infoRow}>
                <Text style={styles.infoIcon}>💰</Text>
                <Text style={[styles.infoText, { color: colors.textSecondary }]}>{job.salary}</Text>
              </View>
            )}
          </View>

          {expanded && (
            <View style={styles.expandedSection}>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {job.description && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Description</Text>
                  <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.description}</Text>
                </View>
              )}

              {job.requiredSkills.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Required Skills</Text>
                  <View style={styles.tagContainer}>
                    {job.requiredSkills.map((skill: string, idx: number) => {
                      const hasSkill = score.breakdown.matchedSkills.includes(skill);
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.tag,
                            { backgroundColor: hasSkill ? `${colors.success}20` : `${colors.textSecondary}20` }
                          ]}
                        >
                          <Text
                            style={[
                              styles.tagText,
                              { color: hasSkill ? colors.success : colors.textSecondary }
                            ]}
                          >
                            {hasSkill ? '✓' : '○'} {skill}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}

              {job.requiredCerts.length > 0 && (
                <View style={styles.detailSection}>
                  <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Required Certifications</Text>
                  <View style={styles.certList}>
                    {job.requiredCerts.map((cert: string, idx: number) => {
                      const hasCert = score.breakdown.matchedCerts.includes(cert);
                      return (
                        <Text
                          key={idx}
                          style={[
                            styles.certItem,
                            { color: hasCert ? colors.success : colors.textSecondary }
                          ]}
                        >
                          {hasCert ? '✓' : '○'} {cert}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.primary }]}
                accessibilityLabel={`Apply for ${job.title}`}
                accessibilityRole="button"
              >
                <Text style={styles.applyButtonText}>Apply for This Job</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={[styles.tapHint, { color: colors.textSecondary }]}>
            {expanded ? '▲ Tap to collapse' : '▼ Tap for details'}
          </Text>
        </AnimatedTouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({

  newBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  certItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },

  jobCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    minHeight: Spacing.minTapTarget,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  jobTitleContainer: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  jobTitle: {
    fontSize: Typography.header,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  jobCompany: {
    fontSize: Typography.body,
  },
  matchBadge: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  matchScore: {
    fontSize: Typography.header,
    fontWeight: '800',
  },
  matchLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  keyInfo: {
    marginBottom: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  infoIcon: {
    fontSize: Typography.body,
    marginRight: Spacing.xs,
  },
  infoText: {
    fontSize: Typography.body,
  },
  tapHint: {
    fontSize: Typography.small,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
  expandedSection: {
    marginTop: Spacing.md,
  },
  divider: {
    height: 1,
    marginBottom: Spacing.md,
  },
  detailSection: {
    marginBottom: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.body,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  detailText: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  tagText: {
    fontSize: Typography.small,
    fontWeight: '600',
  },
  certList: {
    marginTop: Spacing.xs,
  },
  certItem: {
    fontSize: Typography.body,
    marginBottom: Spacing.xs,
  },
  applyButton: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.sm,
    minHeight: Spacing.minTapTarget,
  },
  applyButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#F5F5F7',
  },
});
