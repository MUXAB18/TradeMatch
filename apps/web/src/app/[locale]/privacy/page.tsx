'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ShieldCheck, Briefcase, Building } from 'lucide-react';

const C = {
  primary: '#2563EB',
  white: '#FFFFFF',
  background: '#F8FAFC',
  faint: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  primaryLight: '#DBEAFE',
};

export default function PrivacyPolicyPage() {
  const [activeTab, setActiveTab] = useState<'professional' | 'agency'>('professional');

  return (
    <div style={{ minHeight: '100vh', background: C.background, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ color: C.text, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Back
          </Link>
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <ShieldCheck size={24} color={C.primary} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Privacy Policy</h1>
          </div>
          <div style={{ width: 60 }} /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>How we protect your data</h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            At TradeMatch, your privacy is our priority. We enforce strict data protection guidelines tailored to how you use our platform. Please select your account type below to view your specific privacy rights.
          </p>
        </div>

        {/* Custom Tabs */}
        <div style={{ display: 'flex', background: C.white, borderRadius: 12, padding: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', marginBottom: 32 }}>
          <button
            onClick={() => setActiveTab('professional')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'professional' ? C.primaryLight : 'transparent',
              color: activeTab === 'professional' ? C.primary : C.muted,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Briefcase size={18} />
            For Professionals
          </button>
          <button
            onClick={() => setActiveTab('agency')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '12px 16px',
              borderRadius: 8,
              border: 'none',
              background: activeTab === 'agency' ? C.primaryLight : 'transparent',
              color: activeTab === 'agency' ? C.primary : C.muted,
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <Building size={18} />
            For Agencies
          </button>
        </div>

        {/* Content Box */}
        <div style={{ background: C.white, padding: 40, borderRadius: 16, boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
          {activeTab === 'professional' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>1. Information We Collect from Professionals</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  When you sign up as a professional, we collect personal details including your name, contact information, work history, skills, and certifications. We may also collect geolocation data if enabled, to match you with nearby job opportunities.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>2. How We Use Your Data</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  Your data is primarily used to build your profile and match you with potential agency employers. We use your contact information to send you job alerts, interview requests, and platform updates. Your profile visibility can be managed in your account settings.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>3. Data Sharing and Disclosure</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  We share your professional profile with verified agencies on the TradeMatch platform when you apply for a job or opt into our talent pool. We do not sell your personal data to third-party marketers.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>4. Your Rights and Choices</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  You retain full ownership of your data. You may update, export, or permanently delete your profile at any time through your account settings.
                </p>
              </section>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>1. Information We Collect from Agencies</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  For agencies, we collect company details, registration numbers, tax information, hiring metrics, and contact details of the primary account managers. We also track job posting history and candidate interaction data.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>2. How We Use Agency Data</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  We use your agency data to verify your business identity, facilitate billing, and optimize the candidate matching algorithm. Your company profile is displayed to candidates when you post active jobs.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>3. Data Protection and Compliance</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  We employ enterprise-grade encryption to secure your financial and hiring data. Agencies must adhere to our non-disclosure terms, ensuring that candidate data accessed via TradeMatch is handled securely and compliantly.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>4. Communications</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  We will contact you regarding billing, account security, and platform updates. Promotional communications can be opted out of via the settings dashboard.
                </p>
              </section>
            </div>
          )}
          
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, textAlign: 'center' }}>
            Last updated: September 2026. If you have questions about this policy, contact us at privacy@tradematch.com.
          </div>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
