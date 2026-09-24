import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constants/theme';
import { Home, User, Award, Briefcase, BookOpen, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from '../utils/haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  interpolateColor
} from 'react-native-reanimated';

const ICON_SIZE = 22;
const TAB_WIDTH_INACTIVE = 50;
const TAB_WIDTH_ACTIVE = 135;
const TAB_HEIGHT = 50;

interface TabItemProps {
  isFocused: boolean;
  route: any;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

function TabItem({ isFocused, route, onPress, onLongPress, label }: TabItemProps) {
  const { colors } = useAppTheme();
  
  const progress = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    progress.value = withSpring(isFocused ? 1 : 0, {
      damping: 14,
      stiffness: 120,
    });
  }, [isFocused]);

  const animatedContainerStyle = useAnimatedStyle(() => {
    return {
      width: TAB_WIDTH_INACTIVE + progress.value * (TAB_WIDTH_ACTIVE - TAB_WIDTH_INACTIVE),
      backgroundColor: interpolateColor(
        progress.value,
        [0, 1],
        ['transparent', colors.primary]
      )
    };
  });

  const animatedLabelStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [{ translateX: (1 - progress.value) * -10 }],
    };
  });

  let Icon = Home;
  if (route.name === 'certifications') Icon = Award;
  if (route.name === 'profile') Icon = User;
  if (route.name === 'jobs') Icon = Briefcase;
  if (route.name === 'prep') Icon = BookOpen;
  if (route.name === 'settings') Icon = Settings;

  const iconColor = isFocused ? '#FFFFFF' : colors.textSecondary;

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={1}
    >
      <Animated.View style={[styles.tabItem, animatedContainerStyle]}>
        <View style={styles.iconContainer}>
          <Icon size={ICON_SIZE} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />
        </View>
        
        <Animated.View style={[styles.labelContainer, animatedLabelStyle]}>
          <Text style={styles.tabLabel} numberOfLines={1}>
            {label}
          </Text>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const { isDark } = useAppTheme();

  return (
    <View style={[
      styles.container, 
      { 
        bottom: insets.bottom > 0 ? insets.bottom : 20,
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
      }
    ]}>
      <View style={styles.shadowContainer}>
        <BlurView 
          intensity={isDark ? 40 : 80} 
          tint={isDark ? "dark" : "light"} 
          style={[
            styles.capsule, 
            { backgroundColor: isDark ? 'rgba(30,30,30,0.6)' : 'rgba(255,255,255,0.85)' }
          ]}
        >
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const label =
              options.tabBarLabel !== undefined
                ? options.tabBarLabel
                : options.title !== undefined
                ? options.title
                : route.name;
            const isFocused = state.index === index;

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
                label={label as string}
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
    left: 16,
    right: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  shadowContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 400,
    borderRadius: 100,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 100,
    overflow: 'hidden',
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: TAB_HEIGHT,
    borderRadius: TAB_HEIGHT / 2,
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'absolute',
    left: (TAB_WIDTH_INACTIVE / 2) - (ICON_SIZE / 2),
  },
  labelContainer: {
    position: 'absolute',
    left: 42,
    right: 12,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  }
});
