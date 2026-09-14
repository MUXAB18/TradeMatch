import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import { useAppTheme, Typography, Spacing } from '../constants/theme';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  label?: string;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  label,
}: ProgressBarProps) {
  const { colors } = useAppTheme();
  const progress = (currentStep / totalSteps) * 100;
  
  const reducedMotion = useReducedMotion();
  const animatedWidth = useSharedValue(progress);

  useEffect(() => {
    if (reducedMotion) {
      animatedWidth.value = progress;
    } else {
      animatedWidth.value = withSpring(progress, {
        damping: 15,
        stiffness: 120,
        mass: 1,
      });
    }
  }, [progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${animatedWidth.value}%`,
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View style={[styles.fill, { backgroundColor: colors.primary }, animatedStyle]} />
      </View>
      <Text style={[styles.stepText, { color: colors.textSecondary }]}>
        Step {currentStep} of {totalSteps}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: Typography.small,
    marginBottom: Spacing.xs,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  track: {
    height: 4, // Slimmer, more modern track
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  stepText: {
    fontSize: Typography.small,
    textAlign: 'right',
  },
});
