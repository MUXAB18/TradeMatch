import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  Easing,
  interpolateColor,
  useDerivedValue,
  useAnimatedStyle,
  runOnJS,
} from 'react-native-reanimated';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface AnimatedCircleProgressProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  primaryColor: string;
  secondaryColor: string;
  successColor: string;
  backgroundColor: string;
}

export default function AnimatedCircleProgress({
  progress,
  size = 120,
  strokeWidth = 10,
  primaryColor,
  secondaryColor,
  successColor,
  backgroundColor,
}: AnimatedCircleProgressProps) {
  const animatedProgress = useSharedValue(0);
  const isComplete = progress === 100;

  useEffect(() => {
    animatedProgress.value = withSpring(progress, {
      damping: 20,
      stiffness: 90,
    });
  }, [progress]);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
    
    const stroke = interpolateColor(
      animatedProgress.value,
      [0, 50, 100],
      [secondaryColor, primaryColor, successColor]
    );

    return {
      strokeDashoffset,
      stroke,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const color = interpolateColor(
      animatedProgress.value,
      [0, 50, 100],
      [secondaryColor, primaryColor, successColor]
    );
    return {
      color,
    };
  });

  const celebrationScale = useSharedValue(0);
  useEffect(() => {
    if (isComplete) {
      celebrationScale.value = withSpring(1, { damping: 12, stiffness: 100 });
    } else {
      celebrationScale.value = 0;
    }
  }, [isComplete]);

  const celebrationStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: celebrationScale.value }],
      opacity: celebrationScale.value,
    };
  });

  return (
    <View style={[{ width: size, height: size }, styles.container]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={styles.textContainer}>
        {isComplete ? (
          <Animated.Text style={[styles.completeIcon, celebrationStyle, { color: successColor, fontSize: size * 0.4 }]}>
            ✓
          </Animated.Text>
        ) : (
          <Animated.Text style={[styles.progressText, textAnimatedStyle, { fontSize: size * 0.3 }]}>
            {Math.round(progress)}%
          </Animated.Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    ...StyleSheet.absoluteFill as any,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 24,
    fontWeight: '800',
  },
  completeIcon: {
    fontSize: 32,
    fontWeight: '800',
  },
});
