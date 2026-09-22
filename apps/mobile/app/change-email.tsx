import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, KeyRound } from 'lucide-react-native';
import { useToast } from '../providers/ToastProvider';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAppTheme, Typography, Spacing, BorderRadius } from '../constants/theme';
import { updateEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { auth } from '../services/firebase';
import { updateUserProfile } from '../services/users';

export default function ChangeEmailScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const { showToast } = useToast();
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const newEmailRef = useRef<TextInput>(null);

  const handleUpdateEmail = async () => {
    setError('');
    
    if (!currentPassword) {
      setError('Please enter your current password to verify your identity.');
      return;
    }
    
    if (!newEmail || !newEmail.includes('@')) {
      setError('Please enter a valid new email address.');
      return;
    }

    if (!auth.currentUser || !auth.currentUser.email) {
      setError('You must be signed in with an email address to change it.');
      return;
    }

    setLoading(true);

    try {
      // 1. Re-authenticate
      const credential = EmailAuthProvider.credential(auth.currentUser.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // 2. Update Auth Email
      await updateEmail(auth.currentUser, newEmail);
      
      // 3. Update Firestore Profile
      await updateUserProfile(auth.currentUser.uid, { email: newEmail });
      
      showToast('Email address updated successfully.', 'success');
      router.back();
    } catch (err) {
      console.error('Update email error:', err);
      
      let errorMessage = 'Failed to update email. Please try again.';
      if (err instanceof Error) {
        if (err.message.includes('auth/wrong-password')) {
          errorMessage = 'Incorrect current password.';
        } else if (err.message.includes('auth/email-already-in-use')) {
          errorMessage = 'This email address is already in use by another account.';
        } else if (err.message.includes('auth/invalid-email')) {
          errorMessage = 'Please enter a valid email address.';
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
            <Mail size={32} color={colors.primary} strokeWidth={2} />
          </View>
          <Text style={[styles.title, { color: colors.textPrimary }]}>Change Email</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Enter your current password and your new email address.
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
            onSubmitEditing={() => newEmailRef.current?.focus()}
            icon={<KeyRound size={20} color={colors.textSecondary} />}
            autoFocus
          />
          
          <Input
            ref={newEmailRef}
            label="New Email Address"
            placeholder="Enter your new email"
            value={newEmail}
            onChangeText={setNewEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="done"
            onSubmitEditing={handleUpdateEmail}
            icon={<Mail size={20} color={colors.textSecondary} />}
            error={error}
          />

          <Button
            title={loading ? "Updating..." : "Update Email"}
            onPress={handleUpdateEmail}
            loading={loading}
            disabled={loading || !currentPassword || !newEmail}
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
