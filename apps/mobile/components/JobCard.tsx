import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import * as Haptics from '../utils/haptics';
import { MapPin, Settings2, ChevronRight, CheckCircle2 } from 'lucide-react-native';
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
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import Button from './Button';
import { useToast } from '../providers/ToastProvider';
import AnimatedCircleProgress from './AnimatedCircleProgress';

function getMatchQualityColor(score: number, colors: any) {
  if (score >= 80) return colors.success;
  if (score >= 60) return colors.primary;
  return colors.textSecondary;
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
  scrollY?: any;
  parallaxEnabled?: boolean;
  swipeEnabled?: boolean;
  isSaved?: boolean;
  isApplied?: boolean;
  isNew?: boolean;
  onSave?: () => void;
  onApply?: () => void;
  onApplyPress?: () => void;
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
  onApply,
  onApplyPress
}: JobCardProps) {
  const reducedMotion = useReducedMotion();
  const matchColor = getMatchQualityColor(score.total, colors);

  // Swipe gesture
  const translateX = useSharedValue(0);
  const cardOpacity = useSharedValue(1);
  const cardHeight = useSharedValue<number | 'auto'>('auto');
  const marginB = useSharedValue(Spacing.md);

  const { showToast } = useToast();

  const handleDismiss = () => {
    showToast(`Dismissed ${job.title}`, 'info');
  };
  const handleSave = () => {
    if (onSave) onSave();
  };

  const gestureHandler = Gesture.Pan()
    .enabled(swipeEnabled)
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onUpdate((event) => {
      if (!swipeEnabled) return;
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
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
    });

  const swipeAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: cardOpacity.value,
      marginBottom: marginB.value,
      height: cardHeight.value === 'auto' ? undefined : (cardHeight.value as any),
    };
  });

  // Parallax scroll effect
  const cardY = index * 180;
  const parallaxStyle = useAnimatedStyle(() => {
    if (reducedMotion || !parallaxEnabled || !scrollY) return {};
    const translateY = interpolate(
      scrollY.value,
      [cardY - 500, cardY + 500],
      [10, -10],
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
      text: `${Math.round(displayScore.value)}% Match`,
    } as any;
  });

  const matchedSkillsCount = score.breakdown?.matchedSkills?.length || 0;
  const requiredSkillsCount = job.requiredSkills?.length || 0;

  return (
    <GestureDetector gesture={gestureHandler}>
      <Animated.View style={swipeAnimatedStyle}>
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(index * 50).duration(250)}>
          <AnimatedTouchableOpacity
            style={[
              styles.jobCard,
              {
                backgroundColor: isDark ? colors.surface : colors.white,
                borderColor: isDark ? colors.border : '#E5E5EA',
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
                {isNew && (
                  <View style={[styles.newBadge, { backgroundColor: colors.primary }]}>
                    <Text style={styles.newBadgeText}>NEW</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.matchBadgeContainer}>
                <AnimatedCircleProgress
                  progress={score.total}
                  size={46}
                  strokeWidth={4}
                  primaryColor={matchColor}
                  secondaryColor={colors.warning}
                  successColor={colors.success}
                  backgroundColor={isDark ? '#333' : '#E5E5EA'}
                />
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: isDark ? colors.border : '#F2F2F7' }]} />

            <View style={styles.metadataContainer}>
              <View style={styles.metadataRow}>
                <MapPin size={14} color={colors.textSecondary} />
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  {score.breakdown?.distanceKm || '?'} km away
                </Text>
              </View>
              <View style={styles.metadataRow}>
                <Settings2 size={14} color={colors.textSecondary} />
                <Text style={[styles.metadataText, { color: colors.textSecondary }]}>
                  {matchedSkillsCount}/{requiredSkillsCount} skills matched
                </Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              {!expanded ? (
                <View style={styles.ctaContainer}>
                  {isApplied ? (
                    <Text style={[styles.appliedText, { color: colors.success }]}>Applied ✓</Text>
                  ) : (
                    <TouchableOpacity 
                      style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: `${colors.primary}15`, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 }}
                      onPress={() => {
                        if (onApplyPress) onApplyPress();
                        else if (onApply) onApply();
                      }}
                    >
                      <Text style={[styles.ctaText, { color: colors.primary, marginRight: 0 }]}>Apply</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : <View />}
            </View>

            {expanded && (
              <View style={styles.expandedSection}>
                {job.salary && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Salary & Benefits</Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.salary}</Text>
                  </View>
                )}

                {job.description && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Role Description</Text>
                    <Text style={[styles.detailText, { color: colors.textSecondary }]}>{job.description}</Text>
                  </View>
                )}

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <View style={styles.detailSection}>
                    <Text style={[styles.detailLabel, { color: colors.textPrimary }]}>Required Skills</Text>
                    <View style={styles.tagContainer}>
                      {job.requiredSkills.map((skill: string, idx: number) => {
                        const hasSkill = score.breakdown?.matchedSkills?.includes(skill);
                        return (
                          <View
                            key={idx}
                            style={[
                              styles.tag,
                              { backgroundColor: hasSkill ? `${colors.success}15` : `${colors.textSecondary}10` }
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

                <Button
                  style={[
                    { marginTop: Spacing.md },
                    isApplied && { backgroundColor: colors.success, borderColor: colors.success }
                  ]}
                  onPress={() => {
                    if (onApplyPress) {
                      onApplyPress();
                    } else if (onApply) {
                      onApply();
                    }
                  }}
                  title={isApplied ? "Applied ✓" : "Apply for This Job"}
                  variant="primary"
                />
              </View>
            )}
          </AnimatedTouchableOpacity>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  jobCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  jobHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  jobTitleContainer: {
    flex: 1,
    paddingRight: 12,
  },
  jobTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  jobCompany: {
    fontSize: 14,
    fontWeight: '500',
  },
  newBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 6,
    alignSelf: 'flex-start',
  },
  newBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#FFF',
  },
  divider: {
    height: 1,
    marginBottom: 12,
  },
  metadataContainer: {
    marginBottom: 16,
    gap: 6,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metadataText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  matchBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  matchBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  matchScore: {
    fontSize: 13,
    fontWeight: '700',
    padding: 0,
    margin: 0,
  },
  matchScoreLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 12,
  },
  ctaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 2,
  },
  appliedText: {
    fontSize: 14,
    fontWeight: '700',
  },
  expandedSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    lineHeight: 22,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
  }
});
