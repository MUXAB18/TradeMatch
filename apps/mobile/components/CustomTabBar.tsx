import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme, Typography } from '../constants/theme';
import { Home, User, Award, Briefcase, BookOpen, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from '../utils/haptics';

const ICON_SIZE = 22;
const TAB_WIDTH_INACTIVE = 46;
const TAB_WIDTH_ACTIVE = 110;
const TAB_HEIGHT = 44;

interface TabItemProps {
  isFocused: boolean;
  route: any;
  onPress: () => void;
  onLongPress: () => void;
  label: string;
}

function TabItem({ isFocused, route, onPress, onLongPress, label }: TabItemProps) {
  const { colors } = useAppTheme();
  // Use Animated.Value for expanding/collapsing
  const animatedValue = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: isFocused ? 1 : 0,
      tension: 60,
      friction: 8,
      useNativeDriver: false, // width and backgroundColor do not support native driver
    }).start();
  }, [isFocused]);

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [TAB_WIDTH_INACTIVE, TAB_WIDTH_ACTIVE],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', 'rgba(255,255,255,0.1)'], // extremely subtle pill background
  });

  // Map route name to appropriate Lucide icon
  let Icon = Home;
  if (route.name === 'certifications') Icon = Award;
  if (route.name === 'profile') Icon = User;
  if (route.name === 'jobs') Icon = Briefcase;
  if (route.name === 'prep') Icon = BookOpen;
  if (route.name === 'settings') Icon = Settings;

  return (
    <TouchableOpacity
      accessibilityRole="tab"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={label}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.tabItem,
          { width, backgroundColor },
        ]}
      >
        <View style={styles.iconContainer}>
          <Icon size={ICON_SIZE} color="#F5F5F7" strokeWidth={isFocused ? 2.5 : 2} />
        </View>
        
        <Animated.View 
          style={[
            styles.labelContainer, 
            { opacity: animatedValue }
          ]}
        >
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
  const { colors } = useAppTheme();

  return (
    <View style={[
      styles.container, 
      { 
        bottom: insets.bottom > 0 ? insets.bottom - 4 : 16,
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
      }
    ]}>
      <BlurView intensity={80} tint="dark" style={[styles.capsule]}>
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
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderRadius: 100,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    width: '100%',
    maxWidth: 380,
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
    left: 40,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#F5F5F7',
    letterSpacing: 0.2,
  }
});
