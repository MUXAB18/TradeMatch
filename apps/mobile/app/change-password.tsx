import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Animated,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Lock, KeyRound } from 'lucide-react-native';
import { useToast } from '../providers/ToastProvider';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppTheme, Typography, Spacing } from '../constants/theme';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const newPasswordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);

  const handleUpdatePassword = async () => {
    setError('');
    
    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    
    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setError('You must be signed in with an email address to change your password.');
      return;
    }

    setLoading(true);

    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // 2. Update Auth Password
      await updatePassword(auth.currentUser, newPassword);
      
      showToast('Password updated successfully.', 'success');
      router.back();
    } catch (err) {
      console.error('Update password error:', err);
      
      let errorMessage = 'Failed to update password. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect current password.';
        } else if (err.message.includes('auth/weak-password')) {
          errorMessage = 'The new password is too weak.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={[styles.headerIconContainer, { backgroundColor: `${colors.primary}15` }]}>
            <Lock size={32} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Change Password</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Create a new, strong password to secure your account.
          </Text>
        </View>

        <View style={[styles.form, styles.card, { backgroundColor: colors.surface }]}>
          <Input
            label="Current Password"
            placeholder="Enter your current password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => newPasswordRef.current?.focus()}
            icon={<KeyRound size={20} color={colors.textSecondary} />}
            autoFocus
          />
          
          <Input
            ref={newPasswordRef}
            label="New Password"
            placeholder="Enter your new password"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="next"
            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
            icon={<Lock size={20} color={colors.textSecondary} />}
          />
          
          <Input
            ref={confirmPasswordRef}
            label="Confirm New Password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            returnKeyType="done"
            onSubmitEditing={handleUpdatePassword}
            icon={<Lock size={20} color={colors.textSecondary} />}
            error={error}
          />

          <Button
            title={loading ? "Updating..." : "Update Password"}
            onPress={handleUpdatePassword}
            loading={loading}
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            style={{ marginTop: Spacing.md }}
            fullWidth
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  header: { marginBottom: Spacing.xl },
  title: {
    fontSize: Typography.headerLarge,
    fontWeight: '800',
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: Typography.body,
    lineHeight: 22,
  },
  form: { 
    marginBottom: Spacing.xl,
  },
  card: {
    borderRadius: 24,
    padding: Spacing.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  }
});
