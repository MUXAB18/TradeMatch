import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Keyboard,
} from 'react-native';
import * as Haptics from '../../utils/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolate,
  useReducedMotion,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Bot, ArrowLeft, Menu, Plus, Mic, Send, Sparkles, ChevronDown, MessageSquare, Zap, Headphones, BookOpen } from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUserProfile } from '../../hooks/useUserProfile';
import { useInterviewPrep } from '../../hooks/useInterviewPrep';
import Skeleton from '../../components/Skeleton';
import EmptyState from '../../components/EmptyState';
import { NoInterviewPrepIllustration } from '../../components/illustrations';
import PrepSettingsModal from '../../components/PrepSettingsModal';
import { useAppTheme, Spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_PADDING = Spacing.lg * 2;


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

function GlowingAvatar({ colors }: { colors: any }) {
  const pulse = useSharedValue(1);
  
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, []);

  const ringStyle1 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.15], [0.4, 0]),
  }));
  
  const ringStyle2 = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value * 1.08 }],
    opacity: interpolate(pulse.value, [1, 1.15], [0.2, 0]),
  }));

  return (
    <View style={newStyles.avatarContainer}>
      <Animated.View style={[newStyles.glowingRing, { backgroundColor: colors.primary }, ringStyle2]} />
      <Animated.View style={[newStyles.glowingRing, { backgroundColor: colors.primary }, ringStyle1]} />
      <View style={[newStyles.avatarInner, { backgroundColor: colors.primary }]}>
        <Bot size={44} color="#FFF" strokeWidth={2.5} />
      </View>
    </View>
  );
}

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
  
  // Modes: 'home', 'flashcards', 'chat'
  const [mode, setMode] = useState<'home' | 'flashcards' | 'chat'>('home');
  const [questionText, setQuestionText] = useState('');
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  React.useEffect(() => {
    const showSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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

        <View style={[styles.flashcardContainer, { paddingBottom: 80 + (insets.bottom > 0 ? insets.bottom : 12) }]}>
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

  if (mode === 'flashcards' && currentCard) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[newStyles.flashcardHeader, { paddingTop: Math.max(insets.top + 10, 50) }]}>
          <TouchableOpacity onPress={() => setMode('home')} style={[newStyles.iconButton, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <ArrowLeft size={20} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={[newStyles.pillHeader, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <Zap size={14} color={colors.primary} />
            <Text style={[newStyles.pillText, { color: colors.textPrimary }]}>Flashcards</Text>
          </View>
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={[newStyles.iconButton, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <Ionicons name="settings-outline" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <View style={{ flex: 1, paddingBottom: 80 + (insets.bottom > 0 ? insets.bottom : 12) }}>
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
        </View>

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

  // Home / AI Agent Mode
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { 
        backgroundColor: colors.background,
        paddingBottom: isKeyboardVisible ? 0 : (60 + Math.max(insets.bottom, 12)) 
      }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={{ flex: 1, justifyContent: 'space-between', paddingBottom: 16 }}>
        {/* Top Navigation */}
        <View style={[newStyles.topBar, { paddingTop: Math.max(insets.top + 10, 50) }]}>
          <TouchableOpacity style={[newStyles.iconButton, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <ArrowLeft size={22} color={colors.textPrimary} />
          </TouchableOpacity>
          
          <View style={[newStyles.pillHeader, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <Sparkles size={16} color={colors.primary} />
            <Text style={[newStyles.pillText, { color: colors.textPrimary }]}>AI Interview Buddy</Text>
          </View>

          <TouchableOpacity style={[newStyles.iconButton, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <Menu size={22} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Center Content */}
        <View style={newStyles.centerContent}>
          <GlowingAvatar colors={colors} />
          
          <Text style={[newStyles.title, { color: colors.textPrimary }]}>
            How Can I Help You Prepare Today?
          </Text>
        </View>

        {/* Suggested Modes Control Panel */}
        <View style={newStyles.cardsGrid}>
          <TouchableOpacity 
            style={[newStyles.compactCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', shadowColor: isDark ? '#000' : colors.primary }]}
            onPress={() => setMode('flashcards')}
            activeOpacity={0.7}
          >
            <View style={[newStyles.compactIconWrapper, { backgroundColor: `${colors.primary}12` }]}>
              <Zap size={18} color={colors.primary} />
            </View>
            <View style={newStyles.compactTextContainer}>
              <Text style={[newStyles.compactTitle, { color: colors.textPrimary }]}>Flashcards</Text>
              <Text style={[newStyles.compactDesc, { color: colors.textSecondary }]}>Review</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[newStyles.compactCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', shadowColor: isDark ? '#000' : colors.success }]}
            onPress={() => setMode('chat')}
            activeOpacity={0.7}
          >
            <View style={[newStyles.compactIconWrapper, { backgroundColor: `${colors.success}12` }]}>
              <MessageSquare size={18} color={colors.success} />
            </View>
            <View style={newStyles.compactTextContainer}>
              <Text style={[newStyles.compactTitle, { color: colors.textPrimary }]}>Text Chat</Text>
              <Text style={[newStyles.compactDesc, { color: colors.textSecondary }]}>Q&A</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[newStyles.compactCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', shadowColor: isDark ? '#000' : colors.warning }]} activeOpacity={0.7}>
            <View style={[newStyles.compactIconWrapper, { backgroundColor: `${colors.warning}12` }]}>
              <Headphones size={18} color={colors.warning} />
            </View>
            <View style={newStyles.compactTextContainer}>
              <Text style={[newStyles.compactTitle, { color: colors.textPrimary }]}>Voice</Text>
              <Text style={[newStyles.compactDesc, { color: colors.textSecondary }]}>Interview</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[newStyles.compactCard, { backgroundColor: isDark ? colors.surface : '#FFFFFF', shadowColor: isDark ? '#000' : '#8B5CF6' }]} activeOpacity={0.7}>
            <View style={[newStyles.compactIconWrapper, { backgroundColor: `#8B5CF612` }]}>
              <BookOpen size={18} color="#8B5CF6" />
            </View>
            <View style={newStyles.compactTextContainer}>
              <Text style={[newStyles.compactTitle, { color: colors.textPrimary }]}>Trade Data</Text>
              <Text style={[newStyles.compactDesc, { color: colors.textSecondary }]}>Code & Safety</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Input Area */}
      <View style={[newStyles.bottomInputContainer, { 
        backgroundColor: isDark ? colors.surface : '#FFFFFF',
        borderColor: isDark ? colors.border : '#E5E7EB',
        marginBottom: isKeyboardVisible ? 20 : (60 + Math.max(insets.bottom, 12) + 20),
        paddingBottom: isKeyboardVisible ? Math.max(insets.bottom + 10, 20) : 20,
      }]}>
        <View style={newStyles.inputWrapper}>
          <Sparkles size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[newStyles.textInput, { color: colors.textPrimary }]}
            placeholder="Ask a question..."
            placeholderTextColor={colors.textSecondary}
            value={questionText}
            onChangeText={setQuestionText}
          />
        </View>

        <View style={newStyles.inputControlsRow}>
          <View style={newStyles.leftControls}>
            <TouchableOpacity style={[newStyles.circleBtn, { borderColor: isDark ? colors.border : '#E5E7EB' }]}>
              <Plus size={18} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <TouchableOpacity style={[newStyles.deepThinkBtn, { borderColor: isDark ? colors.border : '#E5E7EB' }]}>
              <Text style={[newStyles.deepThinkText, { color: colors.textPrimary }]}>Deep Think</Text>
              <ChevronDown size={14} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={newStyles.rightControls}>
            <TouchableOpacity style={newStyles.circleBtnIconOnly}>
              <Mic size={20} color={colors.textSecondary} />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                newStyles.sendBtn, 
                { backgroundColor: questionText.trim() ? colors.primary : `${colors.primary}50` }
              ]}
              disabled={!questionText.trim()}
              onPress={() => setMode('chat')}
            >
              <Send size={16} color="#FFF" style={{ marginLeft: 2 }} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const newStyles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pillHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pillText: {
    fontSize: 15,
    fontWeight: '700',
  },
  flashcardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  glowingRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 42,
    letterSpacing: -0.5,
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'space-between',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40 - 12) / 2,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 4,
  },
  compactIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  compactTextContainer: {
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    marginBottom: 2,
  },
  compactDesc: {
    fontSize: 11,
    fontWeight: '500',
  },
  bottomInputContainer: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  inputControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  circleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deepThinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    height: 36,
    gap: 4,
  },
  deepThinkText: {
    fontSize: 13,
    fontWeight: '600',
  },
  rightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  circleBtnIconOnly: {
    padding: 8,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

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
    paddingBottom: Spacing.md,
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
