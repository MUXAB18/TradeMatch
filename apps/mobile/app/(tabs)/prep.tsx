import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import * as Haptics from '../../utils/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useReducedMotion,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useInterviewPrep } from '../../hooks/useInterviewPrep';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { NoInterviewPrepIllustration } from '../../components/illustrations';
import PrepSettingsModal from '../../components/PrepSettingsModal';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = Spacing.lg * 2;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface FlashcardProps {
  question: string;
  answer: string;
  onNext: () => void;
  onPrevious: () => void;
  currentIndex: number;
  totalCards: number;
  isFirst: boolean;
  isLast: boolean;
  colors: any;
  isDark: boolean;
}

function Flashcard({
  question,
  answer,
  onNext,
  onPrevious,
  currentIndex,
  totalCards,
  isFirst,
  isLast,
  colors,
  isDark,
}: FlashcardProps) {
  const [showAnswer, setShowAnswer] = useState(false);
  const reducedMotion = useReducedMotion();
  
  // Animation values
  const cardScale = useSharedValue(1);

  const handleFlip = () => {
    if (!reducedMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    setShowAnswer(!showAnswer);
  };

  const handleNext = () => {
    if (!reducedMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setShowAnswer(false);
    onNext();
  };

  const handlePrevious = () => {
    if (!reducedMotion) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setShowAnswer(false);
    onPrevious();
  };

  const handlePressIn = () => {
    if (!reducedMotion) {
      cardScale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (!reducedMotion) {
      cardScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }],
    };
  });

  const progressPercentage = Math.round(((currentIndex + 1) / totalCards) * 100);

  return (
    <View style={styles.flashcardContainer}>
      {/* Premium Progress Section */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
              Question
            </Text>
            <Text style={[styles.progressCount, { color: colors.textPrimary }]}>
              {currentIndex + 1} <Text style={{ color: colors.textSecondary }}>/ {totalCards}</Text>
            </Text>
          </View>
          <View style={[styles.percentageBadge, { backgroundColor: `${colors.primary}15` }]}>
            <Text style={[styles.percentageText, { color: colors.primary }]}>
              {progressPercentage}%
            </Text>
          </View>
        </View>
        <View style={[styles.progressBarTrack, { backgroundColor: isDark ? colors.surface : `${colors.primary}08` }]}>
          <Animated.View
            style={[
              styles.progressBarFill,
              { 
                width: `${progressPercentage}%`, 
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>

      {/* Premium Question Card */}
      <Animated.View style={[cardAnimatedStyle]}>
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDark ? colors.surface : colors.white,
              borderColor: showAnswer ? `${colors.primary}40` : colors.border,
              shadowColor: showAnswer ? colors.primary : '#000',
            }
          ]}
        >
          {/* Question Section */}
          <View style={styles.questionSection}>
            <Pressable 
              onPress={handleFlip}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.labelPillContainer}
            >
              <View style={[styles.labelPill, { backgroundColor: `${colors.primary}12` }]}>
                <View style={[styles.labelDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.labelText, { color: colors.primary }]}>QUESTION</Text>
              </View>
            </Pressable>
            <ScrollView 
              style={styles.contentScroll}
              showsVerticalScrollIndicator={true}
              bounces={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text style={[styles.questionText, { color: colors.textPrimary }]}>
                {question}
              </Text>

              {/* Answer Section (conditional) */}
              {showAnswer && (
                <View style={styles.answerSection}>
                  <View style={[styles.answerDivider, { backgroundColor: colors.border }]} />
                  <View style={[styles.labelPill, { backgroundColor: `${colors.success}12` }]}>
                    <View style={[styles.labelDot, { backgroundColor: colors.success }]} />
                    <Text style={[styles.labelText, { color: colors.success }]}>ANSWER</Text>
                  </View>
                  <Text style={[styles.answerText, { color: colors.textPrimary }]}>
                    {answer}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>

          {/* Tap Indicator */}
          <Pressable 
            style={styles.tapIndicator}
            onPress={handleFlip}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <View style={[styles.tapPill, { backgroundColor: isDark ? colors.background : colors.surface }]}>
              <Ionicons 
                name={showAnswer ? "chevron-up" : "hand-left-outline"} 
                size={16} 
                color={colors.textSecondary} 
              />
              <Text style={[styles.tapText, { color: colors.textSecondary }]}>
                {showAnswer ? 'Tap to hide' : 'Tap to reveal'}
              </Text>
            </View>
          </Pressable>
        </View>
      </Animated.View>

      {/* Premium Navigation Controls */}
      <View style={styles.navigationControls}>
        <AnimatedTouchable
          style={[
            styles.navButton,
            styles.navButtonSecondary,
            {
              backgroundColor: isDark ? colors.surface : colors.white,
              borderColor: colors.border,
              opacity: isFirst ? 0.3 : 1,
            }
          ]}
          onPress={handlePrevious}
          disabled={isFirst}
          activeOpacity={0.7}
          accessibilityLabel="Previous question"
          accessibilityRole="button"
        >
          <Ionicons 
            name="chevron-back" 
            size={22} 
            color={isFirst ? colors.textSecondary : colors.textPrimary} 
          />
          <Text
            style={[
              styles.navButtonText,
              { color: isFirst ? colors.textSecondary : colors.textPrimary }
            ]}
          >
            Previous
          </Text>
        </AnimatedTouchable>

        <AnimatedTouchable
          style={[
            styles.navButton,
            styles.navButtonPrimary,
            { 
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
            }
          ]}
          onPress={handleNext}
          activeOpacity={0.85}
          accessibilityLabel={isLast ? 'Restart from first question' : 'Next question'}
          accessibilityRole="button"
        >
          <Text style={styles.navButtonTextPrimary}>
            {isLast ? 'Restart' : 'Next'}
          </Text>
          <Ionicons 
            name={isLast ? "refresh-outline" : "chevron-forward"} 
            size={22} 
            color="#FFFFFF" 
          />
        </AnimatedTouchable>
      </View>
    </View>
  );
}

// Dummy data for when no real questions are available
const DUMMY_QUESTIONS = [
  {
    id: 'dummy-1',
    trade: 'Electrician',
    question: 'What is the purpose of a ground fault circuit interrupter (GFCI)?',
    answer: 'A GFCI is designed to protect people from electrical shock by interrupting a household circuit when there is a difference in the currents in the "hot" and neutral wires. This difference indicates that current is leaking, potentially through a person who is grounded.',
    order: 1
  },
  {
    id: 'dummy-2',
    trade: 'Electrician',
    question: 'How do you calculate voltage drop in a circuit?',
    answer: 'Voltage Drop = 2 × K × I × D / CM, where K is the conductor material constant (12.9 for copper, 21.2 for aluminum), I is current in amperes, D is one-way distance in feet, and CM is the wire size in circular mils.',
    order: 2
  },
  {
    id: 'dummy-3',
    trade: 'Electrician',
    question: 'What are the most common safety hazards on a construction site?',
    answer: 'The "Fatal Four" according to OSHA: Falls (from heights), Struck-by accidents (falling objects or equipment), Caught-in/between hazards (equipment or materials), and Electrocution. Always wear proper PPE including hard hats, safety glasses, and steel-toed boots.',
    order: 3
  },
  {
    id: 'dummy-4',
    trade: 'Electrician',
    question: 'Explain the difference between single-phase and three-phase power.',
    answer: 'Single-phase power uses two wires (one hot and one neutral) and is common in residential settings. Three-phase power uses three or four wires and provides more consistent, efficient power delivery for heavy equipment and industrial applications. Three-phase is more economical for larger loads.',
    order: 4
  },
  {
    id: 'dummy-5',
    trade: 'Electrician',
    question: 'What is the National Electrical Code (NEC) and why is it important?',
    answer: 'The NEC is a set of standards for safe electrical design, installation, and inspection. It\'s updated every three years and is adopted by most US states. Following the NEC ensures installations are safe, reduces fire hazards, and protects people from electrical shock. Compliance is often legally required.',
    order: 5
  }
];

export default function PrepScreen() {
  const { data: profile, loading: profileLoading } = useUserProfile();
  const { cards: fetchedCards, loading: cardsLoading, error } = useInterviewPrep(
    profile?.trade || ''
  );
  
  // Use fetched cards if available, otherwise use dummy data
  const cards = fetchedCards.length > 0 ? fetchedCards : DUMMY_QUESTIONS;
  
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [activeCards, setActiveCards] = useState(cards);

  // Update active cards when data arrives or shuffle setting changes
  React.useEffect(() => {
    if (shuffleEnabled) {
      // Simple Fisher-Yates shuffle
      const shuffled = [...cards];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setActiveCards(shuffled);
    } else {
      setActiveCards(cards);
    }
  }, [cards, shuffleEnabled]);

  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentIndex < activeCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  if (profileLoading || cardsLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(insets.top + Spacing.md, 50) }]}>
          <Skeleton width="40%" height={32} style={{ marginBottom: Spacing.xs }} />
          <Skeleton width="60%" height={16} />
        </View>

        <View style={styles.flashcardContainer}>
          <View style={styles.progressSection}>
            <Skeleton width="100%" height={12} borderRadius={6} style={{ marginTop: Spacing.md }} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, height: 400 }]}>
            <Skeleton width="30%" height={24} style={{ marginBottom: Spacing.lg }} />
            <Skeleton width="90%" height={24} style={{ marginBottom: Spacing.sm }} />
            <Skeleton width="80%" height={24} />
          </View>
        </View>
      </View>
    );
  }

  if (error && cards.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Questions</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  // Show empty state only if we don't have ANY cards (including dummy data)
  if (cards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(insets.top + Spacing.md, 50) }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Interview Prep</Text>
          <View style={styles.headerSubtitleRow}>
            <View style={[styles.tradeBadge, { backgroundColor: `${colors.primary}15` }]}>
              <Text style={[styles.tradeBadgeText, { color: colors.primary }]}>⚡</Text>
            </View>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {profile?.trade || 'Your Trade'}
            </Text>
          </View>
        </View>

        <EmptyState
          illustration={<NoInterviewPrepIllustration size={120} color={colors.primary} />}
          title="No Questions Available"
          description={`Interview prep questions for ${profile?.trade || 'your trade'} are coming soon. Check back later.`}
        />
      </View>
    );
  }

  const currentCard = activeCards[currentIndex];

  if (!currentCard) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>No Question Found</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>Unable to load question data.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, paddingTop: Math.max(insets.top + Spacing.md, 50) }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Interview Prep</Text>
            <View style={styles.headerSubtitleRow}>
              <View style={[styles.tradeBadge, { backgroundColor: `${colors.primary}15` }]}>
                <Text style={[styles.tradeBadgeText, { color: colors.primary }]}>⚡</Text>
              </View>
              <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                {profile?.trade || 'Electrician'}
              </Text>
            </View>
          </View>
          <TouchableOpacity 
            style={[styles.settingsButton, { backgroundColor: isDark ? colors.background : colors.background }]}
            accessibilityLabel="Settings"
            accessibilityRole="button"
            onPress={() => setSettingsVisible(true)}
          >
            <Ionicons name="settings-outline" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Flashcard
        question={currentCard.question}
        answer={currentCard.answer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentIndex={currentIndex}
        totalCards={activeCards.length}
        isFirst={currentIndex === 0}
        isLast={currentIndex === activeCards.length - 1}
        colors={colors}
        isDark={isDark}
      />

      <PrepSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        onResetProgress={() => setCurrentIndex(0)}
        isShuffleEnabled={shuffleEnabled}
        onToggleShuffle={setShuffleEnabled}
      />
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 0.5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  headerSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  tradeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tradeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashcardContainer: {
    flex: 1,
    paddingHorizontal: CARD_PADDING,
    paddingTop: Spacing.lg,
    paddingBottom: 100, // Space for bottom nav + buttons
    justifyContent: 'space-between',
  },
  progressSection: {
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressTextRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.xs,
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressCount: {
    fontSize: 18,
    fontWeight: '700',
  },
  percentageBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  percentageText: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  card: {
    borderRadius: 20,
    padding: Spacing.lg,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
    height: 380,
  },
  questionSection: {
    flex: 1,
  },
  labelPillContainer: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.sm,
  },
  contentScroll: {
    flex: 1,
  },
  labelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: Spacing.md,
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  labelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  answerSection: {
    overflow: 'visible',
    marginTop: Spacing.sm,
  },
  answerDivider: {
    height: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  answerText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  tapIndicator: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  tapPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tapText: {
    fontSize: 13,
    fontWeight: '600',
  },
  navigationControls: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    minHeight: 54,
  },
  navButtonSecondary: {
    borderWidth: 1.5,
  },
  navButtonPrimary: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  navButtonTextPrimary: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});
