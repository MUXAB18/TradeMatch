import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Animated, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppTheme } from '../constants/theme';
import { Home, User, Award, Briefcase, BookOpen, Settings } from 'lucide-react-native';

const ICON_SIZE = 24;
const TAB_WIDTH_INACTIVE = 50;
const TAB_WIDTH_ACTIVE = 120;

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
      tension: 50,
      friction: 7,
      useNativeDriver: false, // width and backgroundColor do not support native driver
    }).start();
  }, [isFocused]);

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [TAB_WIDTH_INACTIVE, TAB_WIDTH_ACTIVE],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', 'rgba(255,255,255,0.15)'], // lighter pill background
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
          <Icon size={ICON_SIZE} color={colors.white} strokeWidth={isFocused ? 2.5 : 2} />
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
        bottom: insets.bottom - 12,
        position: Platform.OS === 'web' ? ('fixed' as any) : 'absolute',
      }
    ]}>
      <View style={[styles.capsule, { backgroundColor: colors.black }]}>
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
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
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
  },
  capsule: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 100,
    // Add shadow
    shadowColor: '#1D1D1F',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
    maxWidth: 400,
  },
  tabItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Fallback for absolute positioning
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  iconContainer: {
    position: 'absolute',
    left: 13, // 50 (width) / 2 - 12 (half icon size) = 13 to perfectly center when inactive
  },
  labelContainer: {
    position: 'absolute',
    left: 42,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F5F5F7',
  }
});
