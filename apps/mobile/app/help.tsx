import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Mail, Phone, MapPin, Send, CheckCircle2, ChevronLeft, MessageSquare } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useAppTheme, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HelpSupportScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !subject || !message) {
      setErrorMsg('Please fill in all required fields');
      return;
    }

    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'anonymous',
        userName: name,
        userEmail: email,
        phone,
        subject,
        message,
        status: 'open',
        createdAt: Date.now()
      });
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit ticket', err);
      setErrorMsg(err.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <MessageSquare size={20} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Contact Us</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
          
          <View style={styles.introContainer}>
            <Text style={[styles.introTitle, { color: colors.textPrimary }]}>We'd love to hear from you</Text>
            <Text style={[styles.introText, { color: colors.textSecondary }]}>
              Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
            </Text>
          </View>

          {isSubmitted ? (
            <View style={[styles.successContainer, { backgroundColor: '#ECFDF5', borderColor: '#10B981', borderWidth: 1 }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#10B981' }]}>
                <MessageSquare size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.successTitle}>Request Submitted!</Text>
              <Text style={styles.successText}>
                Thank you for reaching out. Our support team will get back to you shortly.
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setIsSubmitted(false);
                  setName(user?.displayName || '');
                  setEmail(user?.email || '');
                  setPhone('');
                  setSubject('');
                  setMessage('');
                }}
                style={styles.resetBtn}
              >
                <Text style={styles.resetBtnText}>Send another message</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.formContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Send us a message</Text>

              {errorMsg ? (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              ) : null}

              <View style={styles.row}>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>Full Name *</Text>
                  <TextInput 
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    placeholderTextColor={colors.textSecondary}
                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  />
                </View>
                <View style={styles.halfWidth}>
                  <Text style={[styles.label, { color: colors.textPrimary }]}>Phone Number</Text>
                  <TextInput 
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="+1 (555) 000-0000"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="phone-pad"
                    style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
                  />
                </View>
              </View>

              <Text style={[styles.label, { color: colors.textPrimary }]}>Email Address *</Text>
              <TextInput 
                value={email}
                onChangeText={setEmail}
                placeholder="john@example.com"
                placeholderTextColor={colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              />

              <Text style={[styles.label, { color: colors.textPrimary }]}>How can we help? *</Text>
              <TextInput 
                value={subject}
                onChangeText={setSubject}
                placeholder="Select a topic... (e.g. Technical Support)"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              />

              <Text style={[styles.label, { color: colors.textPrimary }]}>Message *</Text>
              <TextInput 
                value={message}
                onChangeText={setMessage}
                placeholder="Please describe your issue or question in detail..."
                placeholderTextColor={colors.textSecondary}
                multiline
                textAlignVertical="top"
                style={[styles.textArea, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              />

              <TouchableOpacity 
                style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 }]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Send size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>Send Message</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Contact Details Cards */}
          <View style={styles.infoCards}>
            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <Phone size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Call Us</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>Mon-Fri from 8am to 5pm.</Text>
                <Text style={[styles.cardLink, { color: colors.primary }]}>+1 (555) 123-4567</Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <Mail size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Chat with Support</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>Our friendly team is here to help.</Text>
                <Text style={[styles.cardLink, { color: colors.primary }]}>support@tradematch.com</Text>
              </View>
            </View>

            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.cardIcon, { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}>
                <MapPin size={24} color={colors.primary} />
              </View>
              <View style={styles.cardContent}>
                <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Visit Us</Text>
                <Text style={[styles.cardText, { color: colors.textSecondary }]}>Come say hello at our office HQ.</Text>
                <Text style={[styles.cardAddress, { color: colors.textPrimary }]}>
                  100 TradeMatch Way{'\n'}
                  Suite 400{'\n'}
                  San Francisco, CA 94107
                </Text>
              </View>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  introContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  introText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  formContainer: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    fontSize: 15,
    marginBottom: 24,
  },
  submitBtn: {
    height: 52,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  errorBox: {
    padding: 12,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  successContainer: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  successText: {
    fontSize: 15,
    color: '#047857',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  resetBtn: {
    marginTop: 8,
  },
  resetBtnText: {
    color: '#10B981',
    fontSize: 15,
    fontWeight: '600',
  },
  infoCards: {
    gap: 24,
  },
  infoCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  cardIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 12,
  },
  cardLink: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardAddress: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
