import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import JobCard from './JobCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface TinderCardProps {
  job: any;
  score: any;
  isFirst: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  colors: any;
  isDark: boolean;
  onApplyPress: () => void;
  isSaved?: boolean;
  isApplied?: boolean;
}

export default function TinderCard({
  job,
  score,
  isFirst,
  onSwipeRight,
  onSwipeLeft,
  colors,
  isDark,
  onApplyPress,
  isSaved,
  isApplied
}: TinderCardProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(isFirst)
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(SCREEN_WIDTH * 1.5, { velocity: event.velocityX });
        runOnJS(onSwipeRight)();
      } else if (translateX.value < -SWIPE_THRESHOLD) {
        translateX.value = withSpring(-SCREEN_WIDTH * 1.5, { velocity: event.velocityX });
        runOnJS(onSwipeLeft)();
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    if (!isFirst) return { transform: [{ scale: 0.95 }], opacity: 0.8 };

    const rotate = interpolate(
      translateX.value,
      [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      [-10, 0, 10],
      Extrapolation.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate}deg` },
      ],
      zIndex: isFirst ? 1 : 0,
    };
  });

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.cardContainer, animatedStyle]}>
        <JobCard
          job={job}
          score={score}
          index={0}
          expanded={true}
          onPress={() => {}}
          colors={colors}
          isDark={isDark}
          swipeEnabled={false}
          parallaxEnabled={false}
          onApplyPress={onApplyPress}
          isSaved={isSaved}
          isApplied={isApplied}
        />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 40,
    paddingBottom: 80,
  }
});
