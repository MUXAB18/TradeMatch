import { useEffect, useState, useCallback } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, AccessibilityInfo, Image, StyleSheet, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  withSpring,
  useAnimatedProps,
} from 'react-native-reanimated';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { ToastProvider } from '../providers/ToastProvider';
import { NetworkProvider } from '../contexts/NetworkContext';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '../components/ErrorFallback';
import { useAppTheme } from '../constants/theme';
import { ThemeProvider } from '../contexts/ThemeContext';

SplashScreen.preventAutoHideAsync();



function PremiumSplashScreen({ onAnimationComplete, reduceMotion }: { onAnimationComplete: () => void, reduceMotion: boolean }) {
  const { colors, isDark } = useAppTheme();
  
  // Background
  const bgOpacity = useSharedValue(0);
  const orbScale = useSharedValue(0.8);
  
  // Logo
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.88);
  const logoTranslateY = useSharedValue(15);
  
  // Premium Glow
  const logoGlowOpacity = useSharedValue(0);
  const logoGlowScale = useSharedValue(0.5);

  // Brand Name
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(15);
  
  // Container Out Transition
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    if (reduceMotion) {
      bgOpacity.value = 1;
      logoOpacity.value = 1;
      logoScale.value = 1;
      logoTranslateY.value = 0;
      textOpacity.value = 1;
      textTranslateY.value = 0;
      
      containerOpacity.value = withDelay(1200, withTiming(0, { duration: 300 }, (finished) => {
        if (finished) runOnJS(onAnimationComplete)();
      }));
      return;
    }

    // Stage 1 & 5: Subtle Background Fade In and Motion
    bgOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    orbScale.value = withTiming(1.1, { duration: 3000, easing: Easing.inOut(Easing.sin) });

    // Stage 2: Logo Reveal
    logoOpacity.value = withDelay(200, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    logoScale.value = withDelay(200, withSpring(1, { damping: 20, stiffness: 100 }));
    logoTranslateY.value = withDelay(200, withSpring(0, { damping: 20, stiffness: 100 }));

    // Stage 3: Premium Light Effect (Soft Radial Glow behind logo)
    logoGlowOpacity.value = withDelay(400, withTiming(0.15, { duration: 600, easing: Easing.out(Easing.quad) }));
    logoGlowScale.value = withDelay(400, withTiming(1.6, { duration: 1500, easing: Easing.out(Easing.cubic) }));

    // Stage 4: Brand Name Reveal
    textOpacity.value = withDelay(600, withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) }));
    textTranslateY.value = withDelay(600, withSpring(0, { damping: 20, stiffness: 100 }));

    // Stage 6: Transition into app
    // Subtly scale down logo before fade out for seamless momentum
    logoScale.value = withDelay(1800, withTiming(0.95, { duration: 500, easing: Easing.inOut(Easing.quad) }));
    
    // Smoothly fade out entire splash screen revealing the loaded app underneath
    containerOpacity.value = withDelay(
      1900,
      withTiming(0, { duration: 400, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(onAnimationComplete)();
        }
      })
    );
  }, [reduceMotion, bgOpacity, orbScale, logoOpacity, logoScale, logoTranslateY, logoGlowOpacity, logoGlowScale, textOpacity, textTranslateY, containerOpacity, onAnimationComplete]);

  // Animated Styles
  const containerStyle = useAnimatedStyle(() => ({ opacity: containerOpacity.value }));
  const bgStyle = useAnimatedStyle(() => ({ opacity: bgOpacity.value }));
  const orbStyle = useAnimatedStyle(() => ({ transform: [{ scale: orbScale.value }] }));
  
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: logoTranslateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: logoGlowOpacity.value,
    transform: [{ scale: logoGlowScale.value }, { translateY: logoTranslateY.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  return (
    <Animated.View
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
        containerStyle
      ]}
      pointerEvents="none"
    >
      {/* Background Ambience (Stage 1 & 5) */}
      <Animated.View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }, bgStyle]}>
        <Animated.View style={[{ position: 'absolute', width: '150%', aspectRatio: 1, borderRadius: 1000, backgroundColor: colors.primary, opacity: isDark ? 0.03 : 0.02, top: '-20%' }, orbStyle]} />
        <Animated.View style={[{ position: 'absolute', width: '120%', aspectRatio: 1, borderRadius: 1000, backgroundColor: colors.secondary || colors.primary, opacity: isDark ? 0.02 : 0.01, bottom: '-10%', left: '-20%' }, orbStyle]} />
      </Animated.View>

      {/* Premium Light Effect Behind Logo (Stage 3) */}
      <Animated.View style={[{ 
        position: 'absolute', 
        width: 140, 
        height: 140, 
        borderRadius: 70, 
        backgroundColor: colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 60,
        elevation: 20
      }, glowStyle]} />

      {/* Logo Reveal (Stage 2) */}
      <Animated.Image 
        source={require('../assets/logo-v2.png')} 
        style={[{ width: 140, height: 140, resizeMode: 'contain' }, logoStyle]} 
      />

      {/* Brand Name (Stage 4) */}
      <Animated.View style={[{ position: 'absolute', bottom: '25%', alignItems: 'center' }, textStyle]}>
        <Text style={{ color: colors.textPrimary, fontSize: 32, fontWeight: '800', letterSpacing: 4 }}>
          TRADEMATCH
        </Text>
        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', letterSpacing: 2, marginTop: 10, textAlign: 'center', opacity: 0.9 }}>
          FIND YOUR CREW
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

function RootLayoutNav() {
  const { colors, isDark } = useAppTheme();
  const { loading } = useAuth();
  const [reduceMotion, setReduceMotion] = useState(false);
  const [appReady, setAppReady] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
  }, []);

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().then(() => {
        setAppReady(true);
      });
    }
  }, [loading]);

  const onSplashAnimationComplete = useCallback(() => {
    setSplashFinished(true);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: reduceMotion ? 'none' : 'fade',
        animationDuration: 250,
      }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="settings" options={{ presentation: 'modal' }} />
      </Stack>
      {appReady && !splashFinished && (
        <PremiumSplashScreen onAnimationComplete={onSplashAnimationComplete} reduceMotion={reduceMotion} />
      )}
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Unhandled App Error:', error, info);
      }}
    >
      <ThemeProvider>
        <NetworkProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <AuthProvider>
              <ToastProvider>
                <RootLayoutNav />
              </ToastProvider>
            </AuthProvider>
          </GestureHandlerRootView>
        </NetworkProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
