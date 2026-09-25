import React, { useState, forwardRef } from 'react';
import {
  TextInput,
  View,
  Text,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  style?: import('react-native').StyleProp<import('react-native').ViewStyle>;
  inputStyle?: import('react-native').StyleProp<import('react-native').TextStyle>;
}

const Input = forwardRef<TextInput, InputProps>(({ label, error, icon, style, onFocus, onBlur, ...props }, ref) => {
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
          ref={ref}
          style={[
            styles.input,
            { color: colors.textPrimary },
            icon ? { paddingLeft: Spacing.sm } : undefined, // Icon has its own padding/margin
            props.inputStyle,
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
});

export default Input;

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
