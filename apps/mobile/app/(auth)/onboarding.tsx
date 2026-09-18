import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, SafeAreaView, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';
import LottieView from 'lottie-react-native';
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
  runOnJS,
  useDerivedValue
} from 'react-native-reanimated';
import * as Haptics from '../../utils/haptics';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { FileText, Award, Briefcase, TrendingUp } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    animation: require('../../assets/lottie/onboarding1.json'),
    icon: FileText,
    headline: 'Build your professional profile in minutes',
    subtext: 'Create a CV that highlights your certifications and hands-on experience correctly.',
    accentLight: '#e0f2fe',
    accentDark: '#0c4a6e',
  },
  {
    id: '2',
    animation: require('../../assets/lottie/onboarding2.json'),
    icon: Award,
    headline: 'See exactly which certifications you need',
    subtext: 'See exactly which licenses and certifications you need for your trade and region.',
    accentLight: '#fef3c7',
    accentDark: '#78350f',
  },
  {
    id: '3',
    animation: require('../../assets/lottie/onboarding3.json'),
    icon: Briefcase,
    headline: 'Get matched to real jobs near you',
    subtext: 'Find relevant openings that match your skills, location, and availability.',
    accentLight: '#dcfce7',
    accentDark: '#14532d',
  },
  {
    id: '4',
    animation: require('../../assets/lottie/onboarding1.json'), // Fallback
    icon: TrendingUp,
    headline: 'Prep for interviews with confidence',
    subtext: 'Review flashcards and tips specifically tailored for the trades.',
    accentLight: '#f3e8ff',
    accentDark: '#4c1d95',
  },
];

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

function OnboardingSlide({ item, index, scrollX, reduceMotion, colors, isDark }: any) {
  const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

  // Parallax background shape (moves slower)
  const bgAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ translateX: 0 }], opacity: 1 };
    
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.5, 0, -width * 0.5],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateX }], opacity };
  });

  // Foreground content (moves normal/slightly faster)
  const contentAnimatedStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { transform: [{ translateX: 0 }] };
    
    const translateX = interpolate(
      scrollX.value,
      inputRange,
      [width * 0.2, 0, -width * 0.2],
      Extrapolation.CLAMP
    );
    return { transform: [{ translateX }] };
  });

  // Staggered text entry
  const textOpacity = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ translateY: 0 }] };
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, -20],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  const subtextOpacity = useAnimatedStyle(() => {
    if (reduceMotion) return { opacity: 1, transform: [{ translateY: 0 }] };
    
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [-0.2, 1, -0.2],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [30, 0, -30],
      Extrapolation.CLAMP
    );
    return { opacity, transform: [{ translateY }] };
  });

  const FallbackIcon = item.icon;

  return (
    <View style={styles.slide}>
      {/* Background wash / parallax element */}
      <Animated.View style={[styles.parallaxBg, { backgroundColor: isDark ? item.accentDark : item.accentLight }, bgAnimatedStyle]} />

      <Animated.View style={[styles.iconContainer, contentAnimatedStyle]}>
        {reduceMotion ? (
          <FallbackIcon size={120} color={colors.primary} strokeWidth={1.5} />
        ) : (
          <LottieView
            source={item.animation}
            autoPlay
            loop
            style={{ width: 300, height: 300 }}
            colorFilters={[
              { keypath: '**', color: colors.primary }
            ]}
          />
        )}
      </Animated.View>

      <Animated.View style={[styles.textContainer, textOpacity]}>
        <Text style={[styles.headline, { color: colors.textPrimary }]}>{item.headline}</Text>
      </Animated.View>
      
      <Animated.View style={[styles.textContainer, subtextOpacity]}>
        <Text style={[styles.subtext, { color: colors.textSecondary }]}>{item.subtext}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();
  const scrollViewRef = useRef<Animated.ScrollView>(null);
  const scrollX = useSharedValue(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    
    // Nudge animation for first launch
    setTimeout(() => {
      if (!reduceMotion && scrollViewRef.current && scrollX.value === 0) {
        scrollViewRef.current.scrollTo({ x: 40, animated: true });
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({ x: 0, animated: true });
        }, 300);
      }
    }, 1000);
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('has_seen_onboarding', 'true');
      if (!reduceMotion) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)');
      }
    } catch (error) {
      console.error('Error saving onboarding state:', error);
      if (user) {
        router.replace('/(tabs)/home');
      } else {
        router.replace('/(auth)');
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
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
      if (index !== currentIndex) {
        runOnJS(setCurrentIndex)(index);
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Light);
      }
    },
  });

  const bgStyle = useAnimatedStyle(() => {
    if (reduceMotion) return { backgroundColor: colors.background };
    
    const inputRange = ONBOARDING_DATA.map((_, i) => i * width);
    const outputRange = ONBOARDING_DATA.map(item => isDark ? item.accentDark : item.accentLight);
    
    // We blend the background slightly towards the accent color
    const backgroundColor = interpolateColor(
      scrollX.value,
      inputRange,
      outputRange
    );

    return { backgroundColor };
  });

  // Morphing button text
  const isLastSlide = currentIndex === ONBOARDING_DATA.length - 1;

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      scrollX.value,
      [(ONBOARDING_DATA.length - 2) * width, (ONBOARDING_DATA.length - 1) * width],
      [0, 1],
      Extrapolation.CLAMP
    );
    
    return {
      width: interpolate(progress, [0, 1], [150, 250], Extrapolation.CLAMP), // Expands on last slide
    };
  });

  const skipOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      [(ONBOARDING_DATA.length - 2) * width, (ONBOARDING_DATA.length - 1) * width],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <Animated.View style={[styles.container, bgStyle]}>
      <SafeAreaView style={styles.container}>
        {/* Skip Button */}
        <Animated.View style={[styles.header, skipOpacityStyle]}>
          <TouchableOpacity 
            onPress={completeOnboarding}
            style={styles.skipButton}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            disabled={isLastSlide}
          >
            <Text style={[styles.skipText, { color: colors.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Carousel */}
        <Animated.ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          style={styles.flatList}
        >
          {ONBOARDING_DATA.map((item, index) => (
            <OnboardingSlide
              key={item.id}
              item={item}
              index={index}
              scrollX={scrollX}
              reduceMotion={reduceMotion}
              colors={colors}
              isDark={isDark}
            />
          ))}
        </Animated.ScrollView>

        {/* Footer Controls */}
        <View style={styles.footer}>
          {/* Pagination Pills */}
          <View style={styles.paginationContainer}>
            {ONBOARDING_DATA.map((_, index) => {
              const dotAnimatedStyle = useAnimatedStyle(() => {
                const widthAnim = interpolate(
                  scrollX.value,
                  [(index - 1) * width, index * width, (index + 1) * width],
                  [8, 24, 8],
                  Extrapolation.CLAMP
                );
                const opacityAnim = interpolate(
                  scrollX.value,
                  [(index - 1) * width, index * width, (index + 1) * width],
                  [0.3, 1, 0.3],
                  Extrapolation.CLAMP
                );
                return { width: widthAnim, opacity: opacityAnim };
              });

              return (
                <Animated.View
                  key={index.toString()}
                  style={[
                    styles.dot,
                    { backgroundColor: colors.primary },
                    dotAnimatedStyle
                  ]}
                />
              );
            })}
          </View>

          {/* Morphing Next / Get Started Button */}
          <View style={styles.buttonContainer}>
            <AnimatedTouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }, buttonAnimatedStyle]}
              onPress={handleNext}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={isLastSlide ? 'Get Started' : 'Next step'}
            >
              <Text style={styles.primaryButtonText}>
                {isLastSlide ? 'Get Started' : 'Next'}
              </Text>
            </AnimatedTouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    height: 60,
    zIndex: 10,
  },
  skipButton: {
    padding: Spacing.sm,
    minHeight: Spacing.minTapTarget,
    justifyContent: 'center',
  },
  skipText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
  flatList: {
    flex: 1,
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  parallaxBg: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    top: '20%',
    opacity: 0.5,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
  },
  textContainer: {
    width: '100%',
  },
  headline: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  subtext: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
    textAlign: 'center',
    paddingHorizontal: Spacing.sm,
  },
  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xl + 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    height: 20,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    alignItems: 'center',
  },
  primaryButton: {
    height: 56,
    borderRadius: BorderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: Typography.header,
    fontWeight: '700',
  },
});
