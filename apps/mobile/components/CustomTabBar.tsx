import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constants/theme';
import { Home, Users, Sparkles, ClipboardList, Hexagon } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from '../utils/haptics';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = Math.min(width - 40, 360);
const TAB_COUNT = 5;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;
const INDICATOR_SIZE = 52; // Big white circle

interface TabItemProps {
  isFocused: boolean;
  route: any;
  onPress: () => void;
  onLongPress: () => void;
  isCenter: boolean;
}

function TabItem({ isFocused, route, onPress, onLongPress, isCenter }: TabItemProps) {
  const { colors, isDark } = useAppTheme();
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, {
      damping: 14,
      stiffness: 150,
    });
  }, [isFocused]);

  let Icon = Home;
  if (route.name === 'jobs') Icon = Users;
  if (route.name === 'prep') Icon = Sparkles;
  if (route.name === 'certifications') Icon = ClipboardList;
  if (route.name === 'settings') Icon = Hexagon;

  const animatedIconStyle = useAnimatedStyle(() => {
    // Slight scale up for center or focused icon
    const scale = isCenter ? 1 : 1 + (progress.value * 0.1);
    return {
      transform: [{ scale }],
    };
  });


  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tabItem}
    >
      <View style={styles.contentContainer}>
        {isCenter && (
          <View style={[styles.centerCircle, { backgroundColor: colors.primary }]}>
            <Animated.View style={animatedIconStyle}>
              <Icon size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Animated.View>
          </View>
        )}
        {!isCenter && (
          <Animated.View style={animatedIconStyle}>
             {/* We use an Animated component for the icon to animate color, but lucide-react-native icons don't animate color easily with animated props. 
                 Instead, we just hardcode the color switch based on isFocused. */}
            <Icon size={24} color={isFocused ? '#000000' : (isDark ? '#A0A0A0' : '#888888')} strokeWidth={isFocused ? 2.5 : 2} />
          </Animated.View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  
  const indicatorPosition = useSharedValue(0);
  const indicatorOpacity = useSharedValue(1);
  
  useEffect(() => {
    const isCenter = state.index === 2;
    // Calculate the position of the indicator
    const newPosition = (state.index * TAB_WIDTH) + (TAB_WIDTH / 2) - (INDICATOR_SIZE / 2);
    
    indicatorPosition.value = withSpring(newPosition, {
      damping: 15,
      stiffness: 150,
      mass: 0.8
    });
    
    // Hide indicator when center (blue) tab is active
    indicatorOpacity.value = withTiming(isCenter ? 0 : 1, { duration: 150 });
  }, [state.index]);

  const animatedIndicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
      opacity: indicatorOpacity.value,
    };
  });

  return (
    <View style={[
      styles.container,
      {
        bottom: insets.bottom > 0 ? insets.bottom + 10 : 30,
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
      }
    ]}>
      <View style={styles.shadowContainer}>
        <BlurView
          intensity={60}
          tint="dark" // Image shows dark translucent pill
          style={[
            styles.capsule,
            {
              backgroundColor: 'rgba(30, 30, 30, 0.65)',
              borderColor: 'rgba(255,255,255,0.1)',
            }
          ]}
        >
          {/* Animated active indicator */}
          <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />

          {state.routes.map((route: any, index: number) => {
            const isFocused = state.index === index;
            const isCenter = index === 2;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.emit({
                type: 'tabLongPress',
                target: route.key,
              });
            };

            return (
              <TabItem
                key={route.key}
                isFocused={isFocused}
                route={route}
                onPress={onPress}
                onLongPress={onLongPress}
                isCenter={isCenter}
              />
            );
          })}
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  shadowContainer: {
    width: TAB_BAR_WIDTH,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
    borderRadius: 36,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 0,
    position: 'relative',
  },
  activeIndicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: '#FFFFFF',
    top: 9, // (70 - 52) / 2
    left: 0,
    zIndex: 0,
  },
  tabItem: {
    flex: 1,
    height: '100%',
    zIndex: 1, // Above the indicator
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  }
});
