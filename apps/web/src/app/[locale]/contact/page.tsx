'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Phone, Mail, MapPin, Send, Loader2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';

const C = {
  primary: '#2563EB',
  primaryLight: '#EEF4FF',
  white: '#FFFFFF',
  background: '#F8FAFC',
  faint: '#F1F5F9',
  border: '#E2E8F0',
  text: '#0F172A',
  muted: '#64748B',
  success: '#10B981',
};

export default function ContactPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'anonymous',
        userName: formData.name,
        userEmail: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        status: 'open',
        createdAt: Date.now()
      });
      setSuccess(true);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err: any) {
      setError(err.message || 'An error occurred while submitting your request.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div style={{ minHeight: '100vh', background: C.background, color: C.text, fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ background: C.white, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ color: C.text, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <ArrowLeft size={20} />
            Back
          </Link>
          <div style={{ flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <MessageSquare size={24} color={C.primary} />
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Contact Us</h1>
          </div>
          <div style={{ width: 60 }} />
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: 1000, margin: '40px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, letterSpacing: '-0.5px' }}>We'd love to hear from you</h2>
          <p style={{ fontSize: 16, color: C.muted, lineHeight: 1.6, maxWidth: 600, margin: '0 auto' }}>
            Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32 }}>
          
          {/* Contact Form */}
          <div style={{ background: C.white, padding: 32, borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: `1px solid ${C.border}` }}>
            <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Send us a message</h3>
            
            {success ? (
              <div style={{ padding: 24, background: '#ECFDF5', border: `1px solid ${C.success}`, borderRadius: 12, textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
                <div style={{ width: 48, height: 48, background: C.success, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <MessageSquare color={C.white} size={24} />
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: '#065F46', margin: '0 0 8px' }}>Request Submitted!</h4>
                <p style={{ color: '#047857', margin: 0 }}>Thank you for reaching out. Our support team will get back to you shortly.</p>
                <button 
                  onClick={() => setSuccess(false)}
                  style={{ marginTop: 20, background: 'transparent', border: 'none', color: C.success, fontWeight: 600, cursor: 'pointer' }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {error && (
                  <div style={{ padding: 12, background: '#FEF2F2', color: '#B91C1C', borderRadius: 8, fontSize: 14 }}>
                    {error}
                  </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Full Name *</label>
                    <input 
                      type="text" name="name" required value={formData.name} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none' }}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Phone Number</label>
                    <input 
                      type="tel" name="phone" value={formData.phone} onChange={handleChange}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none' }}
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Email Address *</label>
                  <input 
                    type="email" name="email" required value={formData.email} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none' }}
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>How can we help? *</label>
                  <select 
                    name="subject" required value={formData.subject} onChange={handleChange}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none', background: C.white }}
                  >
                    <option value="" disabled>Select a topic...</option>
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="Billing Issue">Billing Issue</option>
                    <option value="Report a Bug">Report a Bug</option>
                    <option value="Feature Request">Feature Request</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Message *</label>
                  <textarea 
                    name="message" required value={formData.message} onChange={handleChange}
                    style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 15, outline: 'none', minHeight: 120, resize: 'vertical' }}
                    placeholder="Please describe your issue or question in detail..."
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    marginTop: 8, padding: '12px 24px', background: C.primary, color: C.white, borderRadius: 8, border: 'none', 
                    fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.7 : 1, transition: '0.2s ease'
                  }}
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Contact Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div style={{ background: C.white, padding: 32, borderRadius: 16, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone color={C.primary} size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Call Us</h4>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.muted }}>Mon-Fri from 8am to 5pm.</p>
                <a href="tel:+15551234567" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>+1 (555) 123-4567</a>
              </div>
            </div>

            <div style={{ background: C.white, padding: 32, borderRadius: 16, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Mail color={C.primary} size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Chat with Support</h4>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.muted }}>Our friendly team is here to help.</p>
                <a href="mailto:support@tradematch.com" style={{ color: C.primary, fontWeight: 600, textDecoration: 'none', fontSize: 16 }}>support@tradematch.com</a>
              </div>
            </div>

            <div style={{ background: C.white, padding: 32, borderRadius: 16, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ width: 48, height: 48, background: C.primaryLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MapPin color={C.primary} size={24} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>Visit Us</h4>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: C.muted }}>Come say hello at our office HQ.</p>
                <span style={{ color: C.text, fontWeight: 600, fontSize: 15, lineHeight: 1.5, display: 'block' }}>
                  100 TradeMatch Way<br />
                  Suite 400<br />
                  San Francisco, CA 94107
                </span>
              </div>
            </div>
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
