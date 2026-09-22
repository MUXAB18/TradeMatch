'use client';

import { useState } from 'react';
import { Search, Book, Shield, CreditCard, User, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const faqCategories = [
  {
    id: 'account',
    title: 'Account & Profile',
    icon: <User className="text-[#007AFF]" size={20} />,
    description: 'Manage your profile, settings, and visibility.',
    articles: [
      'How do I change my password?',
      'Updating your professional portfolio',
      'Account verification process',
    ]
  },
  {
    id: 'billing',
    title: 'Billing & Subscriptions',
    icon: <CreditCard className="text-[#007AFF]" size={20} />,
    description: 'Invoices, payment methods, and plans.',
    articles: [
      'Understanding your billing cycle',
      'How to upgrade your subscription',
      'Where to find your past invoices',
    ]
  },
  {
    id: 'safety',
    title: 'Trust & Safety',
    icon: <Shield className="text-[#007AFF]" size={20} />,
    description: 'Keeping your account and data secure.',
    articles: [
      'Reporting suspicious behavior',
      'How we protect your data',
      'Setting up Two-Factor Authentication',
    ]
  },
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: <Book className="text-[#007AFF]" size={20} />,
    description: 'New to TradeMatch? Start here.',
    articles: [
      'Platform overview and features',
      'How to find the best jobs',
      'Tips for a great profile',
    ]
  }
];

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex flex-col h-full overflow-hidden bg-background">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-10 lg:py-14">
          
          <Link href="/help" className="inline-flex items-center text-[14px] font-bold text-text-secondary hover:text-text-primary transition-colors mb-8 group">
            <ArrowLeft size={16} className="me-2 group-hover:-translate-x-1 transition-transform" />
            Back to Help & Support
          </Link>

          {/* Header & Search */}
          <div className="mb-14 text-center max-w-3xl mx-auto">
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-text-primary mb-5">
              How can we help you?
            </h1>
            
            <div className="relative max-w-2xl mx-auto mt-8">
              <div className="absolute inset-y-0 start-0 ps-5 flex items-center pointer-events-none">
                <Search size={20} className="text-text-secondary" />
              </div>
              <input 
                type="text" 
                placeholder="Search for articles, guides, and FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full ps-12 pe-6 py-4 md:py-5 bg-surface border border-border rounded-full text-[16px] text-text-primary shadow-sm focus:outline-none focus:border-[#007AFF] focus:ring-4 focus:ring-[#007AFF]/10 transition-all placeholder:text-text-secondary/70"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {faqCategories.map((category) => (
              <div key={category.id} className="p-8 bg-surface border border-border rounded-[24px] hover:border-[#007AFF]/30 transition-colors group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#F0F7FF] dark:bg-[#007AFF]/10 rounded-2xl flex items-center justify-center">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-[18px] font-bold text-text-primary">{category.title}</h3>
                  </div>
                </div>
                <p className="text-[14px] text-text-secondary mb-6">{category.description}</p>
                
                <ul className="space-y-3">
                  {category.articles.map((article, i) => (
                    <li key={i}>
                      <Link href="#" className="flex items-center text-[15px] font-medium text-text-primary hover:text-[#007AFF] transition-colors group/link">
                        {article}
                        <ChevronRight size={16} className="ms-1 opacity-0 -translate-x-2 group-hover/link:opacity-100 group-hover/link:translate-x-0 transition-all text-[#007AFF]" />
                      </Link>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 pt-5 border-t border-border/50">
                  <Link href="#" className="text-[14px] font-bold text-[#007AFF] hover:underline decoration-2 underline-offset-4">
                    View all 12 articles
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Still need help CTA */}
          <div className="bg-[#F0F7FF] dark:bg-surface dark:border dark:border-border rounded-[24px] p-8 md:p-12 text-center flex flex-col items-center">
            <h3 className="text-2xl font-extrabold text-text-primary mb-3">Still need help?</h3>
            <p className="text-[16px] text-text-secondary w-full max-w-[500px] mb-8">
              Can't find the answer you're looking for? Our dedicated support team is ready to assist you.
            </p>
            <Link 
              href="/help/contact" 
              className="inline-flex items-center justify-center px-8 py-3.5 bg-[#007AFF] text-white rounded-xl font-bold text-[15px] hover:bg-[#0066D6] transition-colors shadow-sm"
            >
              Contact Support
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
