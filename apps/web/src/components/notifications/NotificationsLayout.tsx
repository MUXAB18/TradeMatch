'use client';

import React from 'react';
import NotificationList from './NotificationList';
import { Settings, Bell } from 'lucide-react';
import Link from 'next/link';

export default function NotificationsLayout() {
  return (
    <div className="flex-1 flex justify-center bg-surface w-full h-full">
      {/* Centered container with max-width */}
      <div className="w-full max-w-6xl flex flex-col md:flex-row h-full max-h-[calc(100vh-68px)] md:px-6">
        
        {/* Main List */}
        <div className="w-full md:w-[65%] lg:w-[70%] h-full flex flex-col bg-surface md:border-x border-border shadow-sm">
          <NotificationList />
        </div>

        {/* Right Side - Desktop Only Settings/Summary */}
        <div className="hidden md:flex flex-col md:w-[35%] lg:w-[30%] bg-surface p-6 overflow-y-auto">
          <div className="bg-background border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell size={20} />
              </div>
              <div>
                <h2 className="text-[16px] font-bold text-text-primary">Notification Settings</h2>
                <p className="text-[13px] text-text-secondary">Manage what you receive</p>
              </div>
            </div>
            
            <p className="text-[14px] text-text-secondary mb-6 leading-relaxed">
              Customize how you want to be notified about messages, job matches, and application updates.
            </p>
            
            <Link 
              href="/settings"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-surface border border-border hover:bg-black/5 dark:hover:bg-white/5 text-text-primary font-bold text-[14px] rounded-xl transition-colors"
            >
              <Settings size={18} />
              Go to Settings
            </Link>
          </div>
          
          {/* We can add a "Recent Activity" or "Stats" card here later */}
        </div>
      </div>
    </div>
  );
}
