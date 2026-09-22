import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft, FileText, Briefcase, Building } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAppTheme, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TermsScreen() {
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
          <FileText size={20} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Terms & Conditions</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>
        <View style={styles.introContainer}>
          <Text style={[styles.introTitle, { color: colors.textPrimary }]}>Our Commitment</Text>
          <Text style={[styles.introText, { color: colors.textSecondary }]}>
            Please read these terms carefully before using TradeMatch. Select your account type below.
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
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. User Account Responsibilities</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>As a professional on TradeMatch, you agree to provide accurate and up-to-date information regarding your work experience, skills, and certifications. Falsifying credentials may result in immediate account suspension.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Professional Conduct</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>You agree to communicate professionally with prospective employers. Any form of harassment, spam, or inappropriate behavior through our messaging system violates these terms.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Platform Usage</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>TradeMatch provides a platform to connect professionals with agencies. We do not guarantee employment, nor are we a party to any contract or agreement you sign directly with an agency.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Account Termination</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>You may close your account at any time. TradeMatch reserves the right to suspend or terminate accounts that violate these terms or exhibit malicious activity.</Text>
              </View>
            </View>
          ) : (
            <View style={styles.sections}>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>1. Agency Account Verification</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>Agencies must provide valid registration and contact details. TradeMatch reserves the right to request additional documentation to verify your business before granting full access to the talent pool.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>2. Hiring Practices & Non-Discrimination</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>Agencies agree to follow fair hiring practices. Any job postings that are discriminatory, illegal, or violate local labor laws will be removed immediately, and the offending agency account may be suspended.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>3. Fees and Payments</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>Agencies are responsible for paying all applicable fees for premium features, job promotions, or platform access as outlined in your billing agreement. All payments are non-refundable unless otherwise stated.</Text>
              </View>
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>4. Candidate Data Handling</Text>
                <Text style={[styles.sectionText, { color: colors.textSecondary }]}>You agree to use candidate data obtained through TradeMatch solely for the purpose of recruitment. Selling, distributing, or misusing candidate profiles outside of the hiring process is strictly prohibited.</Text>
              </View>
            </View>
          )}

          <Text style={[styles.footerText, { color: colors.textSecondary, borderColor: colors.border }]}>
            Last updated: September 2026. If you have questions about these terms, contact us at legal@tradematch.com.
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
