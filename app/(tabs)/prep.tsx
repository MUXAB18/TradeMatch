import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useInterviewPrep } from '../../hooks/useInterviewPrep';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { NoInterviewPrepIllustration } from '../../components/illustrations';
import Button from '../../components/Button';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';

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

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  useReducedMotion,
} from 'react-native-reanimated';

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
  const flipAnim = useSharedValue(0);
  const reducedMotion = useReducedMotion();

  const handleFlip = () => {
    setShowAnswer(!showAnswer);
    if (!reducedMotion) {
      flipAnim.value = withTiming(showAnswer ? 0 : 1, { duration: 400 });
    } else {
      flipAnim.value = showAnswer ? 0 : 1;
    }
  };

  const handleNext = () => {
    setShowAnswer(false);
    flipAnim.value = 0;
    onNext();
  };

  const handlePrevious = () => {
    setShowAnswer(false);
    flipAnim.value = 0;
    onPrevious();
  };

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 1], [0, 180]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` }
      ],
      backfaceVisibility: 'hidden',
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = interpolate(flipAnim.value, [0, 1], [180, 360]);
    return {
      transform: [
        { perspective: 1000 },
        { rotateY: `${rotateY}deg` }
      ],
      backfaceVisibility: 'hidden',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    };
  });

  return (
    <View style={styles.flashcardContainer}>
      <View style={styles.progressContainer}>
        <Text style={[styles.progressText, { color: colors.textPrimary }]}>
          {currentIndex + 1} of {totalCards}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / totalCards) * 100}%`, backgroundColor: colors.primary },
            ]}
          />
        </View>
      </View>

      <TouchableOpacity
        style={{ minHeight: 300 }} // Keep touch area height
        onPress={handleFlip}
        activeOpacity={0.9}
        accessibilityLabel={
          showAnswer
            ? `Answer: ${answer}. Tap to see question again.`
            : `Question ${currentIndex + 1} of ${totalCards}: ${question}. Tap to reveal answer.`
        }
        accessibilityRole="button"
      >
        {/* Front of card */}
        <Animated.View style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
          frontAnimatedStyle,
        ]}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.primary }]}>QUESTION</Text>
            <ScrollView
              style={styles.cardTextContainer}
              contentContainerStyle={styles.cardTextContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.cardText, { color: colors.textPrimary }]}>{question}</Text>
            </ScrollView>
            <Text style={[styles.tapHint, { color: colors.textSecondary }]}>👆 Tap to reveal answer</Text>
          </View>
        </Animated.View>

        {/* Back of card */}
        <Animated.View style={[
          styles.card,
          {
            backgroundColor: isDark ? colors.background : `${colors.primary}05`,
            borderColor: colors.success,
          },
          backAnimatedStyle,
        ]}>
          <View style={styles.cardContent}>
            <Text style={[styles.cardLabel, { color: colors.success }]}>ANSWER</Text>
            <ScrollView
              style={styles.cardTextContainer}
              contentContainerStyle={styles.cardTextContent}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[styles.cardText, { color: colors.textPrimary }]}>{answer}</Text>
            </ScrollView>
            <Text style={[styles.tapHint, { color: colors.textSecondary }]}>💡 Tap to see question</Text>
          </View>
        </Animated.View>
      </TouchableOpacity>

      <View style={styles.navigationContainer}>
        <Button
          style={{ flex: 1 }}
          onPress={handlePrevious}
          disabled={isFirst}
          title="← Previous"
          variant="secondary"
          fullWidth={false}
        />

        <Button
          style={{ flex: 1 }}
          onPress={handleNext}
          title={isLast ? 'Restart' : 'Next →'}
          variant="primary"
          fullWidth={false}
        />
      </View>
    </View>
  );
}

export default function PrepScreen() {
  const { data: profile, loading: profileLoading } = useUserProfile();
  const { cards, loading: cardsLoading, error } = useInterviewPrep(
    profile?.trade || ''
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const { colors, isDark } = useAppTheme();

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
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
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Skeleton width="50%" height={Typography.headerLarge} style={{ marginBottom: Spacing.xs }} />
          <Skeleton width="70%" height={Typography.body} />
        </View>

        <View style={styles.flashcardContainer}>
          <View style={styles.progressContainer}>
            <Skeleton width="30%" height={Typography.body} style={{ alignSelf: 'center', marginBottom: Spacing.sm }} />
            <Skeleton width="100%" height={6} borderRadius={3} />
          </View>

          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardContent}>
              <Skeleton width={80} height={Typography.small} style={{ marginBottom: Spacing.md }} />
              <View style={styles.cardTextContent}>
                <Skeleton width="80%" height={Typography.header} style={{ alignSelf: 'center', marginBottom: Spacing.sm }} />
                <Skeleton width="60%" height={Typography.header} style={{ alignSelf: 'center' }} />
              </View>
              <Skeleton width="40%" height={Typography.small} style={{ alignSelf: 'center', marginTop: Spacing.md }} />
            </View>
          </View>

          <View style={styles.navigationContainer}>
            <Skeleton width="48%" height={Spacing.minTapTarget} borderRadius={BorderRadius.md} />
            <Skeleton width="48%" height={Spacing.minTapTarget} borderRadius={BorderRadius.md} />
          </View>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorTitle, { color: colors.error }]}>Error Loading Questions</Text>
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{error}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Interview Prep</Text>
          <Text style={[styles.subtitle, { color: colors.primary }]}>
            Practice questions for {profile?.trade}
          </Text>
        </View>

        <EmptyState
          illustration={<NoInterviewPrepIllustration size={120} color={colors.primary} />}
          title="No Questions Available"
          description={`Interview prep questions for ${profile?.trade} are coming soon. Check back later.`}
        />
      </View>
    );
  }

  const currentCard = cards[currentIndex];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.textPrimary }]}>Interview Prep</Text>
        <Text style={[styles.subtitle, { color: colors.primary }]}>
          Practice questions for {profile?.trade}
        </Text>
      </View>

      <Flashcard
        question={currentCard.question}
        answer={currentCard.answer}
        onNext={handleNext}
        onPrevious={handlePrevious}
        currentIndex={currentIndex}
        totalCards={cards.length}
        isFirst={currentIndex === 0}
        isLast={currentIndex === cards.length - 1}
        colors={colors}
        isDark={isDark}
      />

      <View style={[styles.tipContainer, { backgroundColor: `${colors.secondary}10`, borderLeftColor: colors.secondary }]}>
        <Text style={[styles.tipText, { color: colors.textPrimary }]}>
          💡 Tip: Practice answering out loud before revealing the answer
        </Text>
      </View>
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
    paddingTop: Spacing.xl + 20, // account for status bar
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
  },
  flashcardContainer: {
    flex: 1,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
  progressContainer: {
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontSize: Typography.body,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.sm,
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
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    minHeight: 300,
    maxHeight: 500,
    borderWidth: 1,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  cardLabel: {
    fontSize: Typography.small,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTextContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  cardText: {
    fontSize: Typography.header,
    lineHeight: Typography.header * Typography.lineHeight,
    textAlign: 'center',
  },
  tapHint: {
    fontSize: Typography.small,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    minHeight: Spacing.minTapTarget,
  },
  navButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
  },
  tipContainer: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    margin: Spacing.lg,
    borderLeftWidth: 4,
  },
  tipText: {
    fontSize: Typography.body,
    textAlign: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.body,
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
  },
});
