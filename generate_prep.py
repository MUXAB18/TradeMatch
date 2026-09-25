import re

with open('/tmp/prep_backup.tsx', 'r') as f:
    content = f.read()

# 1. Add Lucide icons to imports
import_lucide = "import { Bot, ArrowLeft, Menu, Plus, Mic, Send, Sparkles, ChevronDown, MessageSquare, Zap, Headphones, BookOpen } from 'lucide-react-native';\n"
content = content.replace("import { Ionicons } from '@expo/vector-icons';", "import { Ionicons } from '@expo/vector-icons';\n" + import_lucide)

# 2. Insert GlowingAvatar component before PrepScreen
glowing_avatar_code = """
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

"""

content = content.replace("export default function PrepScreen() {", glowing_avatar_code + "export default function PrepScreen() {")

# 3. Replace PrepScreen function
new_prep_screen = """export default function PrepScreen() {
  const { data: profile, loading: profileLoading } = useUserProfile();
  const { cards: fetchedCards, loading: cardsLoading, error } = useInterviewPrep(
    profile?.trade || ''
  );
  
  const cards = fetchedCards.length > 0 ? fetchedCards : DUMMY_QUESTIONS;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [shuffleEnabled, setShuffleEnabled] = useState(false);
  const [activeCards, setActiveCards] = useState(cards);
  
  // Modes: 'home', 'flashcards', 'chat'
  const [mode, setMode] = useState<'home' | 'flashcards' | 'chat'>('home');
  const [questionText, setQuestionText] = useState('');

  React.useEffect(() => {
    if (shuffleEnabled) {
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

  // Home / AI Agent Mode
  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: colors.background }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 120 }} keyboardShouldPersistTaps="handled">
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

        {/* Suggested Modes Tags */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={newStyles.tagsContainer}
        >
          <TouchableOpacity 
            style={[newStyles.tag, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
            onPress={() => setMode('flashcards')}
          >
            <Zap size={14} color={colors.primary} />
            <Text style={[newStyles.tagText, { color: colors.textPrimary }]}>Flashcards</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[newStyles.tag, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}
            onPress={() => setMode('chat')}
          >
            <MessageSquare size={14} color={colors.success} />
            <Text style={[newStyles.tagText, { color: colors.textPrimary }]}>Text Chat</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[newStyles.tag, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <Headphones size={14} color={colors.warning} />
            <Text style={[newStyles.tagText, { color: colors.textPrimary }]}>Voice Session</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[newStyles.tag, { backgroundColor: isDark ? colors.surface : '#FFFFFF' }]}>
            <BookOpen size={14} color="#8B5CF6" />
            <Text style={[newStyles.tagText, { color: colors.textPrimary }]}>Trade Knowledge</Text>
          </TouchableOpacity>
        </ScrollView>
      </ScrollView>

      {/* Bottom Input Area */}
      <View style={[newStyles.bottomInputContainer, { 
        backgroundColor: isDark ? colors.surface : '#FFFFFF',
        borderColor: isDark ? colors.border : '#E5E7EB',
        paddingBottom: Math.max(insets.bottom + 10, 20)
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
"""
# Replace the whole PrepScreen function body
prep_pattern = re.compile(r"export default function PrepScreen\(\) \{.*?(?=const styles = StyleSheet\.create\()", re.DOTALL)
content = prep_pattern.sub(new_prep_screen, content)

# 4. Add the newStyles before styles export
new_styles = """
const newStyles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 40,
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
    marginTop: 40,
    marginBottom: 60,
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
  tagsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  tagText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bottomInputContainer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
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

"""
content = content.replace("const styles = StyleSheet.create({", new_styles + "const styles = StyleSheet.create({")

# Add the missing imports for reanimated withRepeat, withSequence if not present
if "withRepeat" not in content:
    content = content.replace("useReducedMotion,", "useReducedMotion, withRepeat, withSequence,")


with open('apps/mobile/app/(tabs)/prep.tsx', 'w') as f:
    f.write(content)

