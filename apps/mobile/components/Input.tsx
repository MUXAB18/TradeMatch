import React, { useState } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, style, onFocus, onBlur, ...props }: InputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border),
            color: colors.textPrimary,
          },
        ]}
        accessibilityLabel={label || props.placeholder || 'Text input'}
        placeholderTextColor={colors.textPlaceholder}
        onFocus={(e) => {
          setIsFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          onBlur?.(e);
        }}
        {...props}
      />
      {error && <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.small, // Slightly smaller label for modern feel
    marginBottom: Spacing.xs,
    fontWeight: '500',
    textTransform: 'uppercase', // Premium touch
    letterSpacing: 0.5,
  },
  input: {
    width: '100%',
    minHeight: Spacing.minTapTarget,
    borderWidth: 1, // Subtle border
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.body,
  },
  errorText: {
    fontSize: Typography.small,
    marginTop: Spacing.xs,
  },
});
