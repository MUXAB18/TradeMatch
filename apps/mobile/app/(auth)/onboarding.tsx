import React, { useRef, useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Dimensions, TouchableOpacity,
  SafeAreaView, AccessibilityInfo, StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolateColor,
  interpolate,
  Extrapolation,
  withSpring,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { useAppTheme, Spacing, BorderRadius } from '../../constants/theme';
import {
  Briefcase, Award, MapPin, TrendingUp,
  Star, Zap, Shield, Users,
  CheckCircle, ArrowRight, ChevronRight,
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// ── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    icon: Briefcase,
    badge: 'QUICK SETUP',
    badgeIcon: Zap,
    headline: 'Build Your\nPro Profile',
    subtext: 'Create a stunning CV that highlights your certifications, skills, and hands-on experience in minutes.',
    features: ['Upload certifications', 'Showcase your trade skills', 'Instant profile preview'],
    gradientFrom: '#007AFF',
    gradientTo: '#0055D4',
    accentLight: '#E8F4FF',
    accentDark: '#001A3D',
    stat: '4.9★',
    statLabel: 'Avg. Rating',
  },
  {
    id: '2',
    icon: Award,
    badge: 'SMART MATCHING',
    badgeIcon: Star,
    headline: 'Get Matched\nInstantly',
    subtext: 'Our AI matches you with the right agencies based on your trade, location, and availability.',
    features: ['AI-powered matching', 'Real-time job alerts', 'Location-based search'],
    gradientFrom: '#7C3AED',
    gradientTo: '#4F1D95',
    accentLight: '#F3E8FF',
    accentDark: '#1A0040',
    stat: '10k+',
    statLabel: 'Active Jobs',
  },
  {
    id: '3',
    icon: MapPin,
    badge: 'NEAR YOU',
    badgeIcon: MapPin,
    headline: 'Jobs Near\nYou',
    subtext: 'Find relevant openings that match your trade, location, and availability — all in one place.',
    features: ['Filter by distance', 'See agency ratings', 'Apply in one tap'],
    gradientFrom: '#059669',
    gradientTo: '#065F46',
    accentLight: '#ECFDF5',
    accentDark: '#001A0F',
    stat: '500+',
    statLabel: 'Companies',
  },
  {
    id: '4',
    icon: TrendingUp,
    badge: 'GROW FAST',
    badgeIcon: TrendingUp,
    headline: 'Advance Your\nCareer',
    subtext: 'Track your applications, prep for interviews, and grow your earning potential with TradeMatch.',
    features: ['Interview prep tips', 'Salary benchmarks', 'Career progress tracking'],
    gradientFrom: '#D97706',
    gradientTo: '#92400E',
    accentLight: '#FFFBEB',
    accentDark: '#1A0F00',
    stat: '85%',
    statLabel: 'Hire Rate',
  },
];

// ── Animated illustration card ───────────────────────────────────────────────
function IllustrationCard({ slide, index, scrollX, isDark }: any) {
  const Icon      = slide.icon;
  const BadgeIcon = slide.badgeIcon;

  // Float animation
  const floatY = useSharedValue(0);
  const pulse  = useSharedValue(1);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0,  { duration: 2000, easing: Easing.inOut(Easing.sin) }),
      ), -1, false
    );
    pulse.value = withRepeat(
      withSequence(withTiming(1.06, { duration: 1500 }), withTiming(1, { duration: 1500 })),
      -1, false
    );
  }, []);

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatY.value }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, inputRange, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollX.value, inputRange, [30, 0, -30], Extrapolation.CLAMP),
    }],
  }));

  return (
    <View style={[styles.illustrationWrap]}>
      <Animated.View style={[styles.illustrationCard, contentStyle]}>
        {/* Outer glow ring */}
        <Animated.View style={[
          styles.glowRing,
          { borderColor: slide.gradientFrom + '40' },
          pulseStyle,
        ]} />

        {/* Main icon circle */}
        <Animated.View style={[
          styles.iconCircle,
          { backgroundColor: slide.gradientFrom },
          floatStyle,
        ]}>
          {/* Inner ring decoration */}
          <View style={[styles.iconRingInner, { borderColor: 'rgba(255,255,255,0.25)' }]} />
          <Icon size={56} color="#fff" strokeWidth={1.5} />
        </Animated.View>

        {/* Floating badge top-right */}
        <Animated.View style={[styles.floatingBadge, { backgroundColor: isDark ? '#1C1C1E' : '#fff' }, floatStyle]}>
          <BadgeIcon size={12} color={slide.gradientFrom} strokeWidth={2.5} />
          <Text style={[styles.floatingBadgeText, { color: slide.gradientFrom }]}>{slide.badge}</Text>
        </Animated.View>

        {/* Stat card bottom-left */}
        <View style={[styles.statCard, { backgroundColor: slide.gradientFrom }]}>
          <Text style={styles.statValue}>{slide.stat}</Text>
          <Text style={styles.statLabel}>{slide.statLabel}</Text>
        </View>

        {/* Decorative dots */}
        <View style={[styles.decorDot, styles.decorDot1, { backgroundColor: slide.gradientFrom + '50' }]} />
        <View style={[styles.decorDot, styles.decorDot2, { backgroundColor: slide.gradientTo + '40' }]} />
      </Animated.View>
    </View>
  );
}

// ── Feature pill ─────────────────────────────────────────────────────────────
function FeaturePill({ text, color, delay }: { text: string; color: string; delay: number }) {
  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value    = withDelay(delay, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(delay, withSpring(0, { damping: 14 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <Animated.View style={[styles.featurePill, style]}>
      <CheckCircle size={14} color={color} strokeWidth={2.5} />
      <Text style={styles.featurePillText}>{text}</Text>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('has_seen_onboarding', 'true');
    if (user) {
      router.replace('/(tabs)/home');
    } else {
      router.replace('/(auth)');
    }
  };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      scrollViewRef.current?.scrollTo({ x: (currentIndex + 1) * width, animated: !reduceMotion });
    } else {
      completeOnboarding();
    }
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
    },
    onMomentumEnd: (event) => {
      const index = Math.round(event.contentOffset.x / width);
      if (index !== currentIndex) runOnJS(setCurrentIndex)(index);
    },
  });

  // Background color interpolation
  const bgStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { backgroundColor: isDark ? '#000' : SLIDES[0].accentLight };
    return {
      backgroundColor: interpolateColor(
        scrollX.value,
        SLIDES.map((_, i) => i * width),
        SLIDES.map(s => isDark ? s.accentDark : s.accentLight)
      ),
    };
  });

  // Button width expands on last slide
  const btnStyle = useAnimatedStyle(() => ({
    width: interpolate(
      scrollX.value,
      [(SLIDES.length - 2) * width, (SLIDES.length - 1) * width],
      [64, 200],
      Extrapolation.CLAMP
    ),
  }));

  // Skip fades out on last slide
  const skipStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollX.value,
      [(SLIDES.length - 2) * width, (SLIDES.length - 1) * width],
      [1, 0],
      Extrapolation.CLAMP
    ),
  }));

  const slide = SLIDES[currentIndex];

  // Content fade per slide
  const textInputRange = [
    (currentIndex - 1) * width,
    currentIndex * width,
    (currentIndex + 1) * width,
  ];
  const textFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollX.value, textInputRange, [0, 1, 0], Extrapolation.CLAMP),
    transform: [{
      translateY: interpolate(scrollX.value, textInputRange, [16, 0, -16], Extrapolation.CLAMP),
    }],
  }));

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safe}>

        {/* Skip */}
        <Animated.View style={[styles.topBar, skipStyle]}>
          <TouchableOpacity onPress={completeOnboarding} style={styles.skipBtn}>
            <Text style={[styles.skipText, { color: isDark ? '#8E8E93' : '#8E8E93' }]}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Illustrations carousel */}
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={styles.scroll}
        >
          {SLIDES.map((s, i) => (
            <IllustrationCard
              key={s.id}
              slide={s}
              index={i}
              scrollX={scrollX}
              isDark={isDark}
            />
          ))}
        </Animated.ScrollView>

        {/* Text content */}
        <View style={styles.textSection}>
          {/* Slide tag */}
          <Animated.View style={[styles.slideTag, { backgroundColor: slide.gradientFrom + '20' }, textFadeStyle]}>
            <Text style={[styles.slideTagText, { color: slide.gradientFrom }]}>
              {`${currentIndex + 1} of ${SLIDES.length}`}
            </Text>
          </Animated.View>

          {/* Headline */}
          <Animated.Text style={[styles.headline, { color: isDark ? '#F5F5F7' : '#1D1D1F' }, textFadeStyle]}>
            {slide.headline}
          </Animated.Text>

          {/* Subtext */}
          <Animated.Text style={[styles.subtext, { color: isDark ? '#8E8E93' : '#6B7280' }, textFadeStyle]}>
            {slide.subtext}
          </Animated.Text>

          {/* Features */}
          <View style={styles.features}>
            {slide.features.map((f, i) => (
              <FeaturePill
                key={f}
                text={f}
                color={slide.gradientFrom}
                delay={i * 80}
              />
            ))}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          {/* Dot indicators */}
          <View style={styles.dots}>
            {SLIDES.map((_, i) => {
              const dotStyle = useAnimatedStyle(() => ({
                width: interpolate(
                  scrollX.value,
                  [(i - 1) * width, i * width, (i + 1) * width],
                  [8, 28, 8],
                  Extrapolation.CLAMP
                ),
                opacity: interpolate(
                  scrollX.value,
                  [(i - 1) * width, i * width, (i + 1) * width],
                  [0.35, 1, 0.35],
                  Extrapolation.CLAMP
                ),
                backgroundColor: slide.gradientFrom,
              }));
              return (
                <Animated.View key={i} style={[styles.dot, dotStyle]} />
              );
            })}
          </View>

          {/* Next / Get Started button */}
          <AnimatedTouchableOpacity
            style={[styles.nextBtn, { backgroundColor: slide.gradientFrom }, btnStyle]}
            onPress={handleNext}
            activeOpacity={0.85}
          >
            {currentIndex === SLIDES.length - 1 ? (
              <Text style={styles.nextBtnText}>Get Started</Text>
            ) : (
              <ChevronRight size={26} color="#fff" strokeWidth={2.5} />
            )}
          </AnimatedTouchableOpacity>
        </View>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    height: 52,
  },
  skipBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(142,142,147,0.12)',
    justifyContent: 'center',
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },

  scroll: { flex: 1 },

  // Illustration
  illustrationWrap: {
    width,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationCard: {
    width: width * 0.72,
    height: width * 0.72,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
  },
  glowRing: {
    position: 'absolute',
    width: '90%',
    height: '90%',
    borderRadius: 36,
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  iconRingInner: {
    position: 'absolute',
    width: '80%',
    height: '80%',
    borderRadius: 50,
    borderWidth: 1,
  },
  floatingBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  floatingBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  statCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '600',
  },
  decorDot: {
    position: 'absolute',
    borderRadius: 999,
  },
  decorDot1: {
    width: 60,
    height: 60,
    top: -10,
    left: -10,
  },
  decorDot2: {
    width: 40,
    height: 40,
    bottom: 30,
    right: -8,
  },

  // Text section
  textSection: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    minHeight: height * 0.25,
  },
  slideTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },
  slideTagText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.8,
    lineHeight: 40,
    marginBottom: 12,
  },
  subtext: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 16,
  },
  features: {
    flexDirection: 'column',
    gap: 6,
  },
  featurePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featurePillText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingTop: Spacing.md,
  },
  dots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextBtn: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
    paddingHorizontal: 24,
    overflow: 'hidden',
  },
  nextBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
});
