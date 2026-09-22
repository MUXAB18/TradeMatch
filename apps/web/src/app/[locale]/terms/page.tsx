'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Briefcase, Building } from 'lucide-react';

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

export default function TermsAndConditionsPage() {
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
            <FileText size={24} color={C.primary} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Terms and Conditions</h1>
          </div>
          <div style={{ width: 60 }} /> {/* Spacer */}
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 16 }}>Our Commitment to You</h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            Please read these terms carefully before using TradeMatch. Select your account type below to view the terms specific to your relationship with our platform.
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
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>1. User Account Responsibilities</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  As a professional on TradeMatch, you agree to provide accurate and up-to-date information regarding your work experience, skills, and certifications. Falsifying credentials may result in immediate account suspension.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>2. Professional Conduct</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  You agree to communicate professionally with prospective employers. Any form of harassment, spam, or inappropriate behavior through our messaging system violates these terms.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>3. Platform Usage</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  TradeMatch provides a platform to connect professionals with agencies. We do not guarantee employment, nor are we a party to any contract or agreement you sign directly with an agency.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>4. Account Termination</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  You may close your account at any time. TradeMatch reserves the right to suspend or terminate accounts that violate these terms or exhibit malicious activity.
                </p>
              </section>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease' }}>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>1. Agency Account Verification</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  Agencies must provide valid registration and contact details. TradeMatch reserves the right to request additional documentation to verify your business before granting full access to the talent pool.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>2. Hiring Practices & Non-Discrimination</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  Agencies agree to follow fair hiring practices. Any job postings that are discriminatory, illegal, or violate local labor laws will be removed immediately, and the offending agency account may be suspended.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>3. Fees and Payments</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  Agencies are responsible for paying all applicable fees for premium features, job promotions, or platform access as outlined in your billing agreement. All payments are non-refundable unless otherwise stated.
                </p>
              </section>
              <section>
                <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 12, color: C.text }}>4. Candidate Data Handling</h3>
                <p style={{ color: C.muted, lineHeight: 1.6, margin: 0 }}>
                  You agree to use candidate data obtained through TradeMatch solely for the purpose of recruitment. Selling, distributing, or misusing candidate profiles outside of the hiring process is strictly prohibited.
                </p>
              </section>
            </div>
          )}
          
          <div style={{ marginTop: 40, paddingTop: 24, borderTop: `1px solid ${C.border}`, fontSize: 13, color: C.muted, textAlign: 'center' }}>
            Last updated: September 2026. If you have questions about these terms, contact us at legal@tradematch.com.
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
