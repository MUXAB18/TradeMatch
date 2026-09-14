import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import { AlertTriangle } from 'lucide-react-native';
import { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ resetErrorBoundary }: FallbackProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${colors.error}20` }]}>
        <AlertTriangle size={48} color={colors.error} />
      </View>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Something went wrong</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        An unexpected error occurred. We've logged this and are looking into it.
      </Text>
      
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={resetErrorBoundary}
        accessibilityRole="button"
        accessibilityLabel="Try again"
      >
        <Text style={[styles.buttonText, { color: colors.white }]}>
          Try again
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.body,
    textAlign: 'center',
    marginBottom: Spacing.xl,
    lineHeight: 24,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    minHeight: Spacing.minTapTarget,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    fontSize: Typography.body,
    fontWeight: '600',
  },
});
