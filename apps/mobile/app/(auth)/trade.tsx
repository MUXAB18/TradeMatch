import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
  FadeOutUp,
  LinearTransition,
  ZoomIn,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture, GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from '../../utils/haptics';
import {
  Search,
  Zap,
  Wind,
  Sun,
  ArrowUpDown,
  Hammer,
  BrickWall,
  Paintbrush,
  Wrench,
  Flame,
  Car,
  Key,
  Tractor,
  Leaf,
  CheckCircle2,
  X,
} from 'lucide-react-native';

import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Button from '../../components/Button';
import { useToast } from '../../providers/ToastProvider';
import { getCurrentUserId, logTradeInterest } from '../../services/users';

const TRADES = [
  // Electrical & Mechanical
  { id: 'electrician', name: 'Electrician', category: 'Electrical & Mechanical', isLive: true, icon: Zap },
  { id: 'hvac', name: 'HVAC Technician', category: 'Electrical & Mechanical', isLive: true, icon: Wind },
  { id: 'solar', name: 'Solar Installer', category: 'Electrical & Mechanical', isLive: true, icon: Sun },
  { id: 'elevator', name: 'Elevator Technician', category: 'Electrical & Mechanical', isLive: true, icon: ArrowUpDown },
  
  // Construction & Building
  { id: 'carpenter', name: 'Carpenter', category: 'Construction & Building', isLive: true, icon: Hammer },
  { id: 'mason', name: 'Mason/Bricklayer', category: 'Construction & Building', isLive: true, icon: BrickWall },
  { id: 'painter', name: 'Painter', category: 'Construction & Building', isLive: true, icon: Paintbrush },
  { id: 'pipefitter', name: 'Pipefitter', category: 'Construction & Building', isLive: true, icon: Wrench },
  
  // Skilled Trades & Services
  { id: 'welder', name: 'Welder', category: 'Skilled Trades & Services', isLive: true, icon: Flame },
  { id: 'auto_mechanic', name: 'Auto Mechanic', category: 'Skilled Trades & Services', isLive: true, icon: Car },
  { id: 'locksmith', name: 'Locksmith', category: 'Skilled Trades & Services', isLive: true, icon: Key },
  { id: 'heavy_equipment', name: 'Heavy Equip. Operator', category: 'Skilled Trades & Services', isLive: true, icon: Tractor },
  { id: 'landscaper', name: 'Landscaper', category: 'Skilled Trades & Services', isLive: true, icon: Leaf },
];

const CATEGORIES = [
  'Electrical & Mechanical',
  'Construction & Building',
  'Skilled Trades & Services'
];

interface TradeCardProps {
  trade: typeof TRADES[0];
  selected: boolean;
  onPress: () => void;
  index: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(View);

function TradeCard({ trade, selected, onPress, index }: TradeCardProps) {
  const { colors, isDark } = useAppTheme();
  const Icon = trade.icon;
  
  const scale = useSharedValue(1);
  const isPressed = useSharedValue(false);

  const gesture = Gesture.Tap()
    .onBegin(() => {
      isPressed.value = true;
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      if (trade.isLive) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    })
    .onFinalize(() => {
      isPressed.value = false;
      scale.value = withSpring(1, { damping: 12, stiffness: 250 });
    })
    .onEnd(() => {
      runOnJS(onPress)();
      if (trade.isLive && !selected) {
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { perspective: 400 },
        { rotateX: isPressed.value ? '2deg' : '0deg' },
      ],
      borderColor: selected ? colors.primary : (isDark ? '#333' : '#E5E7EB'),
      backgroundColor: selected 
        ? (isDark ? 'rgba(93, 214, 44, 0.1)' : 'rgba(93, 214, 44, 0.05)')
        : (isDark ? colors.surface : colors.white),
      opacity: trade.isLive ? 1 : 0.6,
    };
  });

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(14)}
      entering={FadeInDown.delay(index * 50).springify().damping(14)}
      exiting={FadeOutUp.duration(200)}
      style={styles.cardWrapper}
    >
      <GestureDetector gesture={gesture}>
        <AnimatedPressable style={[styles.card, animatedStyle]}>
          <View style={styles.iconWrapper}>
            <Icon 
              size={32} 
              strokeWidth={1.5} 
              color={selected ? colors.primary : colors.textPrimary} 
            />
            {selected && (
              <Animated.View entering={ZoomIn.springify()} style={styles.badgeContainer}>
                <View style={[styles.badgeBg, { backgroundColor: colors.background }]}>
                  <CheckCircle2 size={16} color={colors.primary} fill={isDark ? '#000' : '#fff'} />
                </View>
              </Animated.View>
            )}
          </View>
          <Text 
            style={[
              styles.tradeName, 
              { color: selected ? colors.primary : colors.textPrimary }
            ]}
            numberOfLines={2}
          >
            {trade.name}
          </Text>
          {!trade.isLive && (
            <View style={[styles.comingSoonBadge, { backgroundColor: isDark ? '#333' : '#F3F4F6' }]}>
              <Text style={[styles.comingSoonText, { color: colors.textSecondary }]}>Coming Soon</Text>
            </View>
          )}
        </AnimatedPressable>
      </GestureDetector>
    </Animated.View>
  );
}

export default function TradeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const { showToast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrade, setSelectedTrade] = useState<string | null>(null);
  const [notifyModalVisible, setNotifyModalVisible] = useState(false);
  const [pendingTrade, setPendingTrade] = useState<typeof TRADES[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    return CATEGORIES.map(category => {
      const trades = TRADES.filter(t => 
        t.category === category && 
        t.name.toLowerCase().includes(query)
      );
      return { category, trades };
    }).filter(cat => cat.trades.length > 0);
  }, [searchQuery]);

  const handleTradePress = (trade: typeof TRADES[0]) => {
    if (trade.isLive) {
      setSelectedTrade(trade.id);
    } else {
      setPendingTrade(trade);
      setNotifyModalVisible(true);
    }
  };

  const handleNotifyMe = async () => {
    if (!pendingTrade) return;
    
    setIsSubmitting(true);
    const userId = getCurrentUserId();
    
    if (userId) {
      const result = await logTradeInterest(userId, pendingTrade.id);
      if (result.error) {
        showToast(result.error, 'error');
      } else {
        showToast(`We'll notify you when ${pendingTrade.name} is available!`, 'success');
      }
    } else {
      showToast('You must be logged in to register interest.', 'error');
    }
    
    setIsSubmitting(false);
    setNotifyModalVisible(false);
    setPendingTrade(null);
  };

  const handleContinue = () => {
    if (selectedTrade) {
      router.push({
        pathname: '/(auth)/location',
        params: { trade: selectedTrade },
      });
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Select Your Trade</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Choose the trade that best matches your skills and experience.
          </Text>
          
          <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: isDark ? colors.border : '#E5E7EB' }]}>
            <Search size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.textPrimary }]}
              placeholder="Search trades..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{top:10, bottom:10, left:10, right:10}}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          {filteredCategories.length === 0 ? (
            <Animated.View entering={FadeInDown} style={styles.emptyState}>
              <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
                No trades found matching "{searchQuery}"
              </Text>
            </Animated.View>
          ) : (
            filteredCategories.map((section) => (
              <Animated.View 
                key={section.category}
                layout={LinearTransition.springify()}
                style={styles.section}
              >
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
                  {section.category}
                </Text>
                <View style={styles.grid}>
                  {section.trades.map((trade, index) => (
                    <TradeCard
                      key={trade.id}
                      trade={trade}
                      selected={selectedTrade === trade.id}
                      onPress={() => handleTradePress(trade)}
                      index={index}
                    />
                  ))}
                </View>
              </Animated.View>
            ))
          )}
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: isDark ? colors.border : '#E5E7EB' }]}>
          <Button
            title="Continue"
            onPress={handleContinue}
            disabled={!selectedTrade}
            style={{ width: '100%' }}
          />
        </View>

        {/* Notify Me Modal */}
        <Modal
          visible={notifyModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setNotifyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <Animated.View 
              entering={FadeInDown.springify().damping(15)}
              style={[
                styles.modalContent,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#E5E7EB' }
              ]}
            >
              <View style={styles.modalHeader}>
                <View style={[styles.modalIconBg, { backgroundColor: isDark ? '#2C2C2E' : '#F3F4F6' }]}>
                  {pendingTrade && <pendingTrade.icon size={24} color={colors.textPrimary} strokeWidth={1.5} />}
                </View>
                <TouchableOpacity 
                  onPress={() => setNotifyModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={24} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
              
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                We're not in {pendingTrade?.name} yet
              </Text>
              
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                We're currently focusing on Electricians, but we're expanding quickly. Want us to notify you when we launch for {pendingTrade?.name}s?
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: colors.surface }]}
                  onPress={() => setNotifyModalVisible(false)}
                >
                  <Text style={[styles.modalButtonText, { color: colors.textPrimary }]}>Maybe Later</Text>
                </TouchableOpacity>
                <Button
                  title="Notify Me"
                  onPress={handleNotifyMe}
                  loading={isSubmitting}
                  style={styles.modalPrimaryButton}
                />
              </View>
            </Animated.View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl * 2,
    paddingBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
    marginBottom: Spacing.xl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
  },
  searchIcon: {
    marginRight: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.body,
    height: '100%',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emptyState: {
    paddingVertical: Spacing.xxl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: Typography.body,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.headerSmall,
    fontWeight: '700',
    marginBottom: Spacing.md,
    letterSpacing: -0.3,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  cardWrapper: {
    width: '47%', // 2 columns with gap (roughly 47-48% each)
  },
  card: {
    borderWidth: 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  iconWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  badgeContainer: {
    position: 'absolute',
    top: -6,
    right: -6,
  },
  badgeBg: {
    borderRadius: 10,
    padding: 2,
  },
  tradeName: {
    fontSize: Typography.body,
    fontWeight: '600',
    lineHeight: 20,
  },
  comingSoonBadge: {
    marginTop: Spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  comingSoonText: {
    fontSize: Typography.small,
    fontWeight: '600',
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  modalIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: Typography.headerMedium,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    letterSpacing: -0.5,
  },
  modalSubtitle: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
    marginBottom: Spacing.xl,
  },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    height: Spacing.minTapTarget,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  modalPrimaryButton: {
    flex: 1,
  },
});
