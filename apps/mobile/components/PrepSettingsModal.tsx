import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Switch,
  TouchableWithoutFeedback
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme, Typography, Spacing } from '../constants/theme';
import * as Haptics from '../utils/haptics';

interface PrepSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  onResetProgress: () => void;
  isShuffleEnabled: boolean;
  onToggleShuffle: (enabled: boolean) => void;
}

export default function PrepSettingsModal({
  visible,
  onClose,
  onResetProgress,
  isShuffleEnabled,
  onToggleShuffle
}: PrepSettingsModalProps) {
  const { colors, isDark } = useAppTheme();
  
  // Animation for modal sliding up
  const translateY = useSharedValue(600);
  
  React.useEffect(() => {
    if (visible) {
      translateY.value = withSpring(0, {
        damping: 20,
        stiffness: 200,
        mass: 0.8
      });
    } else {
      translateY.value = withTiming(600, { duration: 250 });
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    };
  });

  const handleClose = () => {
    translateY.value = withTiming(600, { duration: 250 }, () => {
      runOnJS(onClose)();
    });
  };

  const handleReset = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onResetProgress();
    handleClose();
  };

  const handleShuffleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleShuffle(value);
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={true} animationType="fade" onRequestClose={handleClose}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        <Animated.View 
          style={[
            styles.modalContent, 
            animatedStyle, 
            { backgroundColor: isDark ? colors.surface : colors.white }
          ]}
        >
          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Prep Settings</Text>
            <TouchableOpacity 
              onPress={handleClose}
              style={[styles.closeButton, { backgroundColor: isDark ? colors.background : '#F2F2F7' }]}
            >
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingsGroup}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PREFERENCES</Text>
            
            <View style={[styles.settingRow, { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth }]}>
              <View style={styles.settingLabelContainer}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
                  <Ionicons name="shuffle-outline" size={18} color={colors.primary} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: colors.textPrimary }]}>Shuffle Cards</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Randomize question order</Text>
                </View>
              </View>
              <Switch
                value={isShuffleEnabled}
                onValueChange={handleShuffleToggle}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor="#FFFFFF"
              />
            </View>

            <TouchableOpacity 
              style={styles.settingRow}
              onPress={handleReset}
            >
              <View style={styles.settingLabelContainer}>
                <View style={[styles.iconContainer, { backgroundColor: `${colors.error}15` }]}>
                  <Ionicons name="refresh-outline" size={18} color={colors.error} />
                </View>
                <View>
                  <Text style={[styles.settingTitle, { color: colors.error }]}>Reset Progress</Text>
                  <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>Start over from the beginning</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill as any,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 40 : Spacing.xl,
    minHeight: 350,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsGroup: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },
  settingLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '400',
  }
});
