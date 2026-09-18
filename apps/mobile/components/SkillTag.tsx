import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';

interface SkillTagProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export default function SkillTag({ label, selected, onPress }: SkillTagProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tag,
        {
          backgroundColor: selected 
            ? (isDark ? colors.secondary : `${colors.primary}20`) 
            : colors.surface,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.7 : 1,
        }
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
    >
      <Text style={[
        styles.text, 
        { 
          color: selected ? (isDark ? colors.white : colors.primary) : colors.textPrimary,
          fontWeight: selected ? '600' : '400',
        }
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tag: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  text: {
    fontSize: Typography.body,
  },
});
