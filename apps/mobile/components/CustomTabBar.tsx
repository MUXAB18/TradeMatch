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
const TAB_BAR_WIDTH = Math.min(width - 60, 320); // slightly narrower
const TAB_COUNT = 5;
const TAB_WIDTH = TAB_BAR_WIDTH / TAB_COUNT;

// EXACT Dimensions to match the 100000% image
const PILL_HEIGHT = 52;
const INDICATOR_SIZE = 64; // White circle breaks out by 6px top/bottom
const CENTER_CIRCLE_SIZE = 64; // Blue circle breaks out exactly like the white one

interface TabItemProps {
  isFocused: boolean;
  route: any;
  onPress: () => void;
  onLongPress: () => void;
  isCenter: boolean;
}

function TabItem({ isFocused, route, onPress, onLongPress, isCenter }: TabItemProps) {
  const { colors } = useAppTheme();
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
    const scale = isCenter ? 1 : 1 + (progress.value * 0.15);
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
              {/* Note: The image shows white sparkles */}
              <Icon size={24} color="#FFFFFF" strokeWidth={2.5} />
            </Animated.View>
          </View>
        )}
        {!isCenter && (
          <Animated.View style={animatedIconStyle}>
            {/* When focused it is black inside the white circle, otherwise light translucent gray */}
            <Icon 
              size={24} 
              color={isFocused ? '#000000' : 'rgba(255,255,255,0.75)'} 
              strokeWidth={isFocused ? 2.5 : 2.2} 
            />
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
    // Calculate the precise X position so it's perfectly centered on the tab
    const newPosition = (state.index * TAB_WIDTH) + (TAB_WIDTH / 2) - (INDICATOR_SIZE / 2);
    
    indicatorPosition.value = withSpring(newPosition, {
      damping: 16,
      stiffness: 160,
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
        {/* Background layer (clipped) */}
        <View style={styles.glassPillContainer}>
          <BlurView intensity={50} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.glassPillOverlay} />
        </View>

        {/* The sliding white circle layer (NOT clipped, allows break out) */}
        <Animated.View style={[styles.activeIndicator, animatedIndicatorStyle]} />

        {/* The icons layer (NOT clipped) */}
        <View style={styles.tabsContainer}>
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
        </View>
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
    height: PILL_HEIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 16,
    // We do NOT overflow: hidden here so the active indicator can break out
  },
  glassPillContainer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    borderRadius: PILL_HEIGHT / 2,
    overflow: 'hidden',
  },
  glassPillOverlay: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(90, 90, 95, 0.45)', // The exact dark translucent gray tone from the image
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: PILL_HEIGHT / 2,
  },
  tabsContainer: {
    position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeIndicator: {
    position: 'absolute',
    width: INDICATOR_SIZE,
    height: INDICATOR_SIZE,
    borderRadius: INDICATOR_SIZE / 2,
    backgroundColor: '#FFFFFF',
    // Position it vertically so it breaks out equally top and bottom
    top: (PILL_HEIGHT - INDICATOR_SIZE) / 2, 
    left: 0,
    zIndex: 0, // Behind the icons
    
    // Slight shadow for the white circle to make it pop like the image
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
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
    width: CENTER_CIRCLE_SIZE,
    height: CENTER_CIRCLE_SIZE,
    borderRadius: CENTER_CIRCLE_SIZE / 2,
    justifyContent: 'center',
    alignItems: 'center',
    // We want the blue circle to pop slightly
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  }
});
