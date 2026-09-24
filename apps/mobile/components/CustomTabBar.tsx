import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constants/theme';
import { Home, User, Award, Briefcase, BookOpen, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from '../utils/haptics';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const TAB_BAR_WIDTH = Math.min(width - 32, 400); 

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
      stiffness: 150,
    });
  }, [isFocused]);

  let Icon = Home;
  if (route.name === 'certifications') Icon = Award;
  if (route.name === 'profile') Icon = User;
  if (route.name === 'jobs') Icon = Briefcase;
  if (route.name === 'prep') Icon = BookOpen;
  if (route.name === 'settings') Icon = Settings;

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: progress.value * -8 }
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: progress.value,
      transform: [
        { translateY: (1 - progress.value) * 10 }
      ],
    };
  });

  const iconColor = isFocused ? colors.primary : colors.textSecondary;
  
  const displayLabel = label === 'Certifications' ? 'Certs' : label;

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
      style={styles.tabItem}
    >
      <View style={styles.contentContainer}>
        <Animated.View style={animatedIconStyle}>
          <Icon size={24} color={iconColor} strokeWidth={isFocused ? 2.5 : 2} />
        </Animated.View>
        
        <Animated.View style={[styles.labelContainer, animatedTextStyle]}>
          <Text style={[styles.tabLabel, { color: colors.primary }]} numberOfLines={1}>
            {displayLabel}
          </Text>
        </Animated.View>
      </View>
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
          intensity={90} 
          tint={isDark ? "dark" : "light"} 
          style={[
            styles.capsule, 
            { 
              backgroundColor: isDark ? 'rgba(25,25,25,0.7)' : 'rgba(255, 255, 255, 0.95)',
              borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
            }
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
    shadowOpacity: 0.2,
    shadowRadius: 32,
    elevation: 16,
    borderRadius: 36,
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    height: 68,
    borderRadius: 34,
    borderWidth: 1,
    overflow: 'hidden',
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    height: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    bottom: 12,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  }
});
