import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Pressable, Modal } from 'react-native';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import * as LucideIcons from 'lucide-react-native';
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  ZoomOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme } from '../constants/theme';
import * as WebBrowser from 'expo-web-browser';

interface Promotion {
  id: string;
  title: string;
  message: string;
  icon: string;
  themeColor: string;
  isActive: boolean;
  target: 'all' | 'workers' | 'agencies';
  startDate?: number;
  endDate?: number;
  actionText?: string;
  actionUrl?: string;
}

const PALETTES: Record<string, { bg: string; shadow: string }> = {
  primary: { bg: '#2563EB', shadow: 'rgba(37,99,235,0.35)' },
  success: { bg: '#059669', shadow: 'rgba(5,150,105,0.35)' },
  warning: { bg: '#D97706', shadow: 'rgba(217,119,6,0.35)' },
  danger:  { bg: '#DC2626', shadow: 'rgba(220,38,38,0.35)' },
  purple:  { bg: '#7C3AED', shadow: 'rgba(124,58,237,0.35)' },
};

export function GlobalPopup() {
  // ── All hooks at top — no early returns before them ──────────────────────
  const { user }           = useAuth();
  const { colors, isDark } = useAppTheme();

  const [validPromos, setValidPromos]   = useState<Promotion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible]           = useState(false);

  const iconPulse    = useSharedValue(1);
  const actionScale  = useSharedValue(1);
  const dismissScale = useSharedValue(1);

  const iconStyle    = useAnimatedStyle(() => ({ transform: [{ scale: iconPulse.value }] }));
  const actionStyle  = useAnimatedStyle(() => ({ transform: [{ scale: actionScale.value }] }));
  const dismissStyle = useAnimatedStyle(() => ({ transform: [{ scale: dismissScale.value }] }));

  useEffect(() => {
    async function fetch() {
      try {
        const q    = query(collection(db, 'promotions'), where('isActive', '==', true));
        const snap = await getDocs(q);
        const all  = snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
        const now  = Date.now();
        const valid = all.filter(p => {
          if (p.startDate && now < p.startDate) return false;
          if (p.endDate   && now > p.endDate)   return false;
          
          const role = 'worker'; // Mobile app is for workers
          if (p.target === 'workers'  && role !== 'worker')  return false;
          if (p.target === 'agencies' && role !== 'agency') return false;
          return true;
        });
        if (valid.length > 0) { setValidPromos(valid); setCurrentIndex(0); setVisible(true); }
      } catch (e) { console.error('Promo fetch failed', e); }
    }
    fetch();
  }, [user]);

  useEffect(() => {
    iconPulse.value = withRepeat(
      withSequence(
        withTiming(1.12, { duration: 700, easing: Easing.inOut(Easing.ease) }),
        withTiming(1,    { duration: 700, easing: Easing.inOut(Easing.ease) }),
      ), -1, false
    );
  }, []);

  // ── Safe to early-return after all hooks ────────────────────────────────
  const promo = validPromos[currentIndex];

  const dismiss = () => setCurrentIndex(i => i + 1);
  const action  = async () => {
    actionScale.value = withSequence(withSpring(0.92), withSpring(1));
    if (promo?.actionUrl) await WebBrowser.openBrowserAsync(promo.actionUrl);
  };

  if (!promo) return null;

  const palette = PALETTES[promo.themeColor] || PALETTES.primary;
  const Icon    = (LucideIcons as any)[promo.icon] || LucideIcons.Gift;

  return (
    // Native Modal always renders over EVERYTHING — tab bars, navigation, status bar
    <Modal
      visible={visible && !!promo}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismiss}
    >
      <Animated.View style={styles.overlay} entering={FadeIn.duration(250)} exiting={FadeOut.duration(200)}>
        <Animated.View
          key={promo.id}
          style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
          entering={ZoomIn.springify().damping(16).stiffness(130)}
          exiting={ZoomOut.duration(200)}
        >
          {/* Close */}
          <TouchableOpacity
            onPress={dismiss}
            style={[styles.closeBtn, { backgroundColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}
            hitSlop={10}
          >
            <LucideIcons.X size={16} color={isDark ? '#AAA' : '#64748B'} strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Pulsing icon */}
          <Animated.View style={[styles.iconCircle, { backgroundColor: palette.bg + '22' }, iconStyle]}>
            <View style={[styles.iconInner, { backgroundColor: palette.bg }]}>
              <Icon size={32} color="#fff" strokeWidth={2} />
            </View>
          </Animated.View>

          {/* Text */}
          <Text style={[styles.title, { color: isDark ? '#FFF' : '#0F172A' }]}>{promo.title}</Text>
          <Text style={[styles.message, { color: isDark ? '#A0A0A8' : '#64748B' }]}>{promo.message}</Text>

          {/* Pagination dots */}
          {validPromos.length > 1 && (
            <View style={styles.dots}>
              {validPromos.map((_, i) => (
                <View key={i} style={[
                  styles.dot,
                  { backgroundColor: i === currentIndex ? palette.bg : (isDark ? '#3A3A3C' : '#CBD5E1') },
                  i === currentIndex && styles.dotActive,
                ]} />
              ))}
            </View>
          )}

          {/* Buttons */}
          <View style={styles.actions}>
            {promo.actionText && (
              <Animated.View style={[{ flex: 1 }, actionStyle]}>
                <Pressable
                  onPress={action}
                  onPressIn={() => { actionScale.value = withSpring(0.95); }}
                  onPressOut={() => { actionScale.value = withSpring(1); }}
                  style={[styles.btn, styles.primaryBtn, { backgroundColor: palette.bg, shadowColor: palette.shadow }]}
                >
                  <Text style={styles.primaryBtnText}>{promo.actionText}</Text>
                </Pressable>
              </Animated.View>
            )}
            <Animated.View style={[{ flex: 1 }, dismissStyle]}>
              <Pressable
                onPress={dismiss}
                onPressIn={() => { dismissScale.value = withSpring(0.95); }}
                onPressOut={() => { dismissScale.value = withSpring(1); }}
                style={[styles.btn, styles.ghostBtn, {
                  borderColor: isDark ? '#3A3A3C' : '#E2E8F0',
                  backgroundColor: isDark ? '#2C2C2E' : '#F8FAFC',
                }]}
              >
                <Text style={[styles.ghostBtnText, { color: isDark ? '#EBEBF5' : '#475569' }]}>Dismiss</Text>
              </Pressable>
            </Animated.View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 20,
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 20,
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotActive: {
    width: 18,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  btn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryBtn: {
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  ghostBtn: {
    borderWidth: 1,
  },
  ghostBtnText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
