import PageHeader from '@/components/layout/PageHeader';
import { HelpCircle, MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Help & Support | TradeMatch',
  description: 'Get help with your account or report an issue.',
};

export default function HelpPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-10 lg:py-14">
          <div className="mb-10">
            <h1 className="text-3xl font-extrabold tracking-tight text-text-primary mb-2">Help & Support</h1>
            <p className="text-[15px] text-text-secondary">Get help with your account or report an issue.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Help Center Card - Active State (Black Border as per design) */}
            <Link 
              href="/help/center" 
              className="p-8 bg-surface rounded-[24px] border-2 border-black dark:border-white shadow-sm transition-all group"
            >
              <div className="w-12 h-12 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#007AFF] mb-6">
                <HelpCircle size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Help Center</h3>
              <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
                Find answers to common questions and guides.
              </p>
              <div className="text-[15px] font-bold text-[#007AFF] flex items-center gap-1.5 group-hover:underline decoration-2 underline-offset-4">
                Visit Help Center <ExternalLink size={16} />
              </div>
            </Link>
            
            {/* Contact Support Card - Inactive State */}
            <Link 
              href="/help/contact" 
              className="p-8 bg-surface rounded-[24px] border border-border hover:border-[#007AFF]/40 hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-[#F0F7FF] rounded-full flex items-center justify-center text-[#007AFF] mb-6">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">Contact Support</h3>
              <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
                Need help? Contact our support team directly.
              </p>
              <div className="text-[15px] font-bold text-[#007AFF] flex items-center gap-1.5 group-hover:underline decoration-2 underline-offset-4">
                Contact Us <ExternalLink size={16} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
