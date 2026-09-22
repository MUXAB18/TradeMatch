'use client';

import { useState } from 'react';
import { Mail, MessageSquare, Phone, MapPin, Send, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

export default function ContactSupportPage() {
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !topic || !message) return;
    
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'guest',
        userName: `${firstName} ${lastName}`,
        userEmail: email,
        subject: topic,
        message: message,
        status: 'open',
        createdAt: Date.now()
      });
      setIsSubmitted(true);
      setFirstName('');
      setLastName('');
      setTopic('');
      setMessage('');
    } catch (err) {
      console.error('Failed to submit ticket', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
          
          <Link href="/help" className="inline-flex items-center text-[14px] font-bold text-text-secondary hover:text-text-primary transition-colors mb-8 group">
            <ArrowLeft size={16} className="me-2 group-hover:-translate-x-1 transition-transform" />
            Back to Help Center
          </Link>

          <div className="mb-12">
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-text-primary mb-3">Contact Support</h1>
            <p className="text-[16px] text-text-secondary max-w-2xl leading-relaxed">
              Have a question or need assistance? Fill out the form below or use one of our direct contact methods. Our team is here to help you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-surface border border-border rounded-[24px] p-8 shadow-sm">
                {isSubmitted ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center animate-in zoom-in-95 duration-500">
                    <div className="w-20 h-20 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-500 mb-6">
                      <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-text-primary mb-3">Message Sent!</h3>
                    <p className="text-[15px] text-text-secondary max-w-sm mb-8 leading-relaxed">
                      Thanks for reaching out. Our support team will get back to you within 24-48 hours.
                    </p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="px-6 py-3 bg-surface border border-border text-text-primary rounded-xl font-bold text-[14px] hover:bg-background transition-colors"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">First Name</label>
                        <input 
                          required
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          type="text" 
                          placeholder="John"
                          className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">Last Name</label>
                        <input 
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          type="text" 
                          placeholder="Doe"
                          className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">Email Address</label>
                      <input 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email" 
                        placeholder="john@example.com"
                        className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">Topic</label>
                      <select 
                        required 
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>Select a topic...</option>
                        <option value="account">Account & Profile</option>
                        <option value="billing">Billing & Subscriptions</option>
                        <option value="technical">Technical Issue</option>
                        <option value="feedback">Product Feedback</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[13px] font-bold text-text-secondary uppercase tracking-wider mb-2">Message</label>
                      <textarea 
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={5}
                        placeholder="How can we help you?"
                        className="w-full px-4 py-3.5 bg-background border border-border rounded-xl text-[15px] text-text-primary focus:outline-none focus:border-[#007AFF] focus:ring-1 focus:ring-[#007AFF] transition-all resize-y min-h-[120px]"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:bg-[#0066D6] transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <Send size={18} />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-4">
              <div className="p-6 bg-[#F0F7FF] dark:bg-[#007AFF]/10 border border-[#007AFF]/20 rounded-[24px]">
                <div className="w-10 h-10 bg-[#007AFF]/20 dark:bg-[#007AFF]/20 rounded-full flex items-center justify-center text-[#007AFF] mb-4">
                  <Mail size={20} />
                </div>
                <h3 className="text-[17px] font-bold text-text-primary mb-1">Email Us</h3>
                <p className="text-[14px] text-text-secondary mb-3">Drop us a line and we'll get back to you.</p>
                <a href="mailto:support@tradematch.com" className="text-[15px] font-bold text-[#007AFF] hover:underline">
                  support@tradematch.com
                </a>
              </div>

              <div className="p-6 bg-surface border border-border rounded-[24px] hover:border-[#007AFF]/30 transition-colors">
                <div className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-text-secondary mb-4">
                  <Phone size={20} />
                </div>
                <h3 className="text-[17px] font-bold text-text-primary mb-1">Call Support</h3>
                <p className="text-[14px] text-text-secondary mb-3">Available Mon-Fri, 9am-5pm EST.</p>
                <a href="tel:+18001234567" className="text-[15px] font-bold text-text-primary hover:text-[#007AFF] transition-colors">
                  +1 (800) 123-4567
                </a>
              </div>

              <div className="p-6 bg-surface border border-border rounded-[24px] hover:border-[#007AFF]/30 transition-colors">
                <div className="w-10 h-10 bg-background border border-border rounded-full flex items-center justify-center text-text-secondary mb-4">
                  <MapPin size={20} />
                </div>
                <h3 className="text-[17px] font-bold text-text-primary mb-1">Office</h3>
                <p className="text-[14px] text-text-secondary">
                  123 Innovation Drive<br />
                  Tech District, NY 10001
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
