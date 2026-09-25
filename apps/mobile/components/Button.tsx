import React, { ReactNode } from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
  StyleProp,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
} from 'react-native-reanimated';
import * as Haptics from '../utils/haptics';
import { useAppTheme, Spacing } from '../constants/theme';
import BouncingDots from './BouncingDots';

interface ButtonProps {
  title?: string;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  fullWidth = true,
  style,
  textStyle,
}: ButtonProps) {
  const { colors, isDark } = useAppTheme();
  const reducedMotion = useReducedMotion();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const handlePressIn = () => {
    if (!disabled && !loading) {
      if (!reducedMotion) scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
      opacity.value = withSpring(0.8, { damping: 15 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      if (!reducedMotion) scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      opacity.value = withSpring(1, { damping: 15 });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      if (!reducedMotion && variant === 'primary') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    }
  };

  const getBackgroundColor = () => {
    if (disabled || loading) {
      if (variant === 'ghost' || variant === 'outline') return 'transparent';
      return colors.surface;
    }
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surface;
      case 'destructive': return colors.error;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getBorderColor = () => {
    if (variant === 'outline') return `${colors.border}80`;
    if (variant === 'secondary') return colors.border;
    return 'transparent';
  };

  const getTextColor = () => {
    if (disabled || loading) return colors.textPlaceholder;
    switch (variant) {
      case 'primary': return '#FFFFFF';
      case 'secondary': return colors.textPrimary;
      case 'destructive': return '#FFFFFF';
      case 'outline': return colors.textPrimary;
      case 'ghost': return colors.textPrimary;
      default: return '#FFFFFF';
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: (disabled || loading) ? 0.6 : opacity.value,
    };
  });

  const getPadding = () => {
    if (size === 'icon') return 0;
    switch (size) {
      case 'sm': return Spacing.md;
      case 'lg': return Spacing.xl;
      case 'md':
      default: return Spacing.lg;
    }
  };

  const getHeight = () => {
    if (size === 'icon') return 48;
    switch (size) {
      case 'sm': return 40;
      case 'lg': return 60;
      case 'md':
      default: return 52;
    }
  };

  const getBorderRadius = () => {
    if (size === 'icon') return 24; // circle
    return 100; // standard pill shape for modern premium feel
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm': return 14;
      case 'lg': return 17;
      case 'md':
      default: return 16;
    }
  };

  return (
    <Animated.View style={[animatedStyle, fullWidth && { width: '100%' }]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityLabel={title || 'Button'}
        accessibilityState={{ disabled: disabled || loading }}
        style={[
          styles.button,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            borderWidth: (variant === 'secondary' || variant === 'outline') ? 1 : 0,
            paddingHorizontal: getPadding(),
            height: getHeight(),
            width: size === 'icon' ? getHeight() : (fullWidth ? '100%' : 'auto'),
            shadowColor: variant === 'primary' ? colors.primary : 'transparent',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: variant === 'primary' ? 4 : 0,
          },
          style,
          {
            borderRadius: getBorderRadius(), // Always apply borderRadius last
          },
        ]}
      >
        <View style={[styles.contentContainer, { opacity: loading ? 0 : 1 }]}>
          {icon && iconPosition === 'left' && <View style={[title ? styles.iconLeft : null]}>{icon}</View>}
          {title && (
            <Text
              style={[
                styles.text,
                { color: getTextColor(), fontSize: getFontSize() },
                textStyle
              ]}
            >
              {title}
            </Text>
          )}
          {icon && iconPosition === 'right' && <View style={[title ? styles.iconRight : null]}>{icon}</View>}
        </View>

        {loading && (
          <View style={StyleSheet.absoluteFillObject}>
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <BouncingDots color={getTextColor()} />
            </View>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  iconLeft: {
    marginRight: Spacing.sm,
  },
  iconRight: {
    marginLeft: Spacing.sm,
  },
});
