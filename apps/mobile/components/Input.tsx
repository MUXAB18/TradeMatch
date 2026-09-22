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
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, style, onFocus, onBlur, ...props }: InputProps) {
  const { colors } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>}
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.surface,
            borderColor: error ? colors.error : (isFocused ? colors.primary : colors.border),
          },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[
            styles.input,
            { color: colors.textPrimary },
            icon && { paddingLeft: Spacing.sm }, // Icon has its own padding/margin
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
      </View>
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    minHeight: Spacing.minTapTarget,
    paddingHorizontal: Spacing.md,
  },
  iconContainer: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.body,
    height: '100%',
  },
  errorText: {
    fontSize: Typography.small,
    marginTop: Spacing.xs,
  },
});
