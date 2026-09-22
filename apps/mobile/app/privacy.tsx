import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, ShieldCheck, Briefcase, Building } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PrivacyScreen() {
  const router = useRouter();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<'professional' | 'agency'>('professional');

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <ShieldCheck size={20} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Privacy Policy</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        <View style={styles.introContainer}>
          <Text style={[styles.introTitle, { color: colors.textPrimary }]}>How we protect your data</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            At TradeMatch, your privacy is our priority. We enforce strict data protection guidelines tailored to how you use our platform.
          </Text>
        </View>

        <View style={[styles.tabContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'professional' && { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}
            onPress={() => setActiveTab('professional')}
          >
            <Briefcase size={16} color={activeTab === 'professional' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'professional' ? colors.primary : colors.textSecondary }]}>For Professionals</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tabBtn, activeTab === 'agency' && { backgroundColor: 'rgba(37, 99, 235, 0.1)' }]}
            onPress={() => setActiveTab('agency')}
          >
            <Building size={16} color={activeTab === 'agency' ? colors.primary : colors.textSecondary} />
            <Text style={[styles.tabText, { color: activeTab === 'agency' ? colors.primary : colors.textSecondary }]}>For Agencies</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.contentCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {activeTab === 'professional' ? (
            <View style={styles.sections}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Information We Collect from Professionals</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>When you sign up as a professional, we collect personal details including your name, contact information, work history, skills, and certifications. We may also collect geolocation data if enabled, to match you with nearby job opportunities.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. How We Use Your Data</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>Your data is primarily used to build your profile and match you with potential agency employers. We use your contact information to send you job alerts, interview requests, and platform updates. Your profile visibility can be managed in your account settings.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Data Sharing and Disclosure</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>We share your professional profile with verified agencies on the TradeMatch platform when you apply for a job or opt into our talent pool. We do not sell your personal data to third-party marketers.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Your Rights and Choices</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>You retain full ownership of your data. You may update, export, or permanently delete your profile at any time through your account settings.</Text>
              </View>
            </View>
          ) : (
            <View style={styles.sections}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Information We Collect from Agencies</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>For agencies, we collect company details, registration numbers, tax information, hiring metrics, and contact details of the primary account managers. We also track job posting history and candidate interaction data.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. How We Use Agency Data</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>We use your agency data to verify your business identity, facilitate billing, and optimize the candidate matching algorithm. Your company profile is displayed to candidates when you post active jobs.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Data Protection and Compliance</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>We employ enterprise-grade encryption to secure your financial and hiring data. Agencies must adhere to our non-disclosure terms, ensuring that candidate data accessed via TradeMatch is handled securely and compliantly.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Communications</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>We will contact you regarding billing, account security, and platform updates. Promotional communications can be opted out of via the settings dashboard.</Text>
              </View>
            </View>
          )}

          <Text style={[styles.footerText, { color: colors.textSecondary, borderColor: colors.border }]}>
            Last updated: September 2026. If you have questions about this policy, contact us at privacy@tradematch.com.
          </Text>
        </View>
      </ScrollView>
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
    marginBottom: 24,
    marginTop: 10,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  introText: {
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  contentCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  sections: {
    gap: 24,
  },
  section: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 15,
    lineHeight: 24,
  },
  footerText: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    fontSize: 13,
    textAlign: 'center',
  }
});
