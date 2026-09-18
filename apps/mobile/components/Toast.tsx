import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  runOnJS,
  withRepeat,
  Easing,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { CheckCircle, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography, Spacing } from '../constants/theme';
import { ToastType } from '../providers/ToastProvider';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onHide: () => void;
}

export default function Toast({ message, type, onHide }: ToastProps) {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  
  const translateY = useSharedValue(20);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.96);
  const translateX = useSharedValue(0);

  const rotation = useSharedValue(0);

  useEffect(() => {
    // Entrance animation
    translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.ease) });
    scale.value = withSpring(1, { damping: 15, stiffness: 200 });
  }, []);

  useEffect(() => {
    if (type === 'loading') {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1
      );
    } else {
      rotation.value = 0;
    }

    let timeout: any;
    if (type !== 'loading') {
      timeout = setTimeout(() => {
        dismiss();
      }, 3000);
    }
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [type, message]);

  const dismiss = () => {
    'worklet';
    translateY.value = withTiming(-10, { duration: 250, easing: Easing.in(Easing.ease) });
    opacity.value = withTiming(0, { duration: 250, easing: Easing.in(Easing.ease) });
    scale.value = withTiming(0.96, { duration: 250, easing: Easing.in(Easing.ease) }, (finished) => {
      if (finished) {
        runOnJS(onHide)();
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      translateX.value = event.translationX;
    })
    .onEnd((event) => {
      if (Math.abs(event.translationX) > 50) {
        translateX.value = withTiming(
          Math.sign(event.translationX) * 500,
          { duration: 200 },
          () => dismiss()
        );
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  let icon = null;
  const bgColor = colors.surface; 

  switch (type) {
    case 'success':
      icon = <CheckCircle size={18} color={colors.success} strokeWidth={2.5} />;
      break;
    case 'error':
      icon = <AlertCircle size={18} color={colors.error} strokeWidth={2.5} />;
      break;
    case 'info':
      icon = <Info size={18} color={colors.primary} strokeWidth={2.5} />;
      break;
    case 'warning':
      icon = <AlertTriangle size={18} color={colors.warning} strokeWidth={2.5} />;
      break;
    case 'loading':
      icon = (
        <Animated.View style={animatedIconStyle}>
          <Loader2 size={18} color={colors.textSecondary} strokeWidth={2.5} />
        </Animated.View>
      );
      break;
  }

  return (
    <View style={[styles.container, { marginTop: insets.top || Spacing.md }]} pointerEvents="box-none">
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: bgColor, borderColor: isDark ? '#333' : '#E5E5EA' },
            animatedStyle,
          ]}
        >
          <View style={styles.iconContainer}>{icon}</View>
          <Text style={[styles.message, { color: colors.textPrimary }]}>{message}</Text>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.sm,
    width: '100%',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md + 4,
    paddingVertical: Spacing.sm + 4,
    borderRadius: 100, // Pill shape capsule
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8, // for Android
    maxWidth: '90%',
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  message: {
    fontSize: Typography.small + 1,
    fontWeight: '600',
    flexShrink: 1,
    letterSpacing: -0.2,
  },
});
