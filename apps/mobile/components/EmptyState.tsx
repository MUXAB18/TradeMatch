/**
 * EmptyState Component
 * Reusable component for empty states throughout the app
 * Follows design.md principle: "illustration + short text + one clear action"
 */

import React, { ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { FadeInDown, FadeInUp, useReducedMotion } from 'react-native-reanimated';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';

interface EmptyStateProps {
  /** SVG illustration component */
  illustration: ReactNode;
  /** Main heading text */
  title: string;
  /** Explanatory description text */
  description: string;
  /** Optional action button */
  actionLabel?: string;
  /** Action button press handler */
  onActionPress?: () => void;
  /** Optional additional content (e.g., tips list) */
  children?: ReactNode;
}

export default function EmptyState({
  illustration,
  title,
  description,
  actionLabel,
  onActionPress,
  children,
}: EmptyStateProps) {
  const { colors } = useAppTheme();
  const reducedMotion = useReducedMotion();

  return (
    <View style={styles.container}>
      <Animated.View 
        entering={reducedMotion ? undefined : FadeInUp.delay(100).springify().damping(15)} 
        style={styles.illustrationContainer}
      >
        {illustration}
      </Animated.View>

      <Animated.Text 
        entering={reducedMotion ? undefined : FadeInUp.delay(200).springify().damping(15)}
        style={[styles.title, { color: colors.textPrimary }]}
      >
        {title}
      </Animated.Text>

      <Animated.Text 
        entering={reducedMotion ? undefined : FadeInUp.delay(300).springify().damping(15)}
        style={[styles.description, { color: colors.textSecondary }]}
      >
        {description}
      </Animated.Text>

      {children && (
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(400).springify().damping(15)}>
          {children}
        </Animated.View>
      )}

      {actionLabel && onActionPress && (
        <Animated.View entering={reducedMotion ? undefined : FadeInUp.delay(500).springify().damping(15)}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            onPress={onActionPress}
            activeOpacity={0.8}
            accessibilityLabel={actionLabel}
            accessibilityRole="button"
          >
            <Text style={styles.actionButtonText}>{actionLabel}</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
    paddingTop: Spacing.xl * 2,
  },
  illustrationContainer: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.header,
    fontWeight: '700',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  description: {
    fontSize: Typography.body,
    lineHeight: Typography.body * Typography.lineHeight,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 320,
  },
  actionButton: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Spacing.minTapTarget,
    marginTop: Spacing.md,
  },
  actionButtonText: {
    fontSize: Typography.body,
    fontWeight: '700',
    color: '#F5F5F7',
  },
});
