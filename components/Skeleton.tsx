import React, { useEffect } from 'react';
import { StyleProp, ViewStyle, DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useReducedMotion,
} from 'react-native-reanimated';
import { useAppTheme } from '../constants/theme';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
  color?: string;
}

export default function Skeleton({
  width,
  height,
  borderRadius = 4,
  style,
  color,
}: SkeletonProps) {
  const { colors, isDark } = useAppTheme();
  const opacity = useSharedValue(0.3);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!reducedMotion) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 800 }),
          withTiming(0.3, { duration: 800 })
        ),
        -1, // Infinite
        true // Reverse
      );
    } else {
      opacity.value = 0.5; // Static opacity for reduced motion
    }
  }, [reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const defaultColor = isDark ? colors.surface : colors.border;

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: color || defaultColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}
