'use client';

import React, { useState, useMemo } from 'react';
import { useNotifications } from '@/contexts/NotificationsContext';
import NotificationItem from './NotificationItem';
import { AppNotification } from '@/types/notifications';
import { Search, BellRing, CheckCircle2 } from 'lucide-react';
import { isToday, isYesterday } from 'date-fns';
import { toast } from '@/components/ui/toast';

type FilterType = 'all' | 'unread' | 'messages' | 'jobs' | 'applications';

export default function NotificationList() {
  const { notifications, loading, markAllAsRead, unreadCount } = useNotifications();
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNotifications = useMemo(() => {
    let result = notifications;

    // Apply Tab Filter
    if (filter === 'unread') result = result.filter(n => !n.isRead);
    else if (filter === 'messages') result = result.filter(n => n.type === 'message');
    else if (filter === 'jobs') result = result.filter(n => n.type === 'job');
    else if (filter === 'applications') result = result.filter(n => n.type === 'application');

    // Apply Search Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(q) || 
        n.message.toLowerCase().includes(q) || 
        (n.actorName && n.actorName.toLowerCase().includes(q))
      );
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [notifications, filter, searchQuery]);

  const groups = useMemo(() => {
    const today: AppNotification[] = [];
    const yesterday: AppNotification[] = [];
    const earlier: AppNotification[] = [];

    filteredNotifications.forEach(n => {
      const date = new Date(n.createdAt);
      if (isToday(date)) today.push(n);
      else if (isYesterday(date)) yesterday.push(n);
      else earlier.push(n);
    });

    return { today, yesterday, earlier };
  }, [filteredNotifications]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col p-6 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl border border-border bg-surface animate-pulse">
            <div className="w-12 h-12 bg-black/5 dark:bg-white/5 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-black/5 dark:bg-white/5 rounded w-1/3" />
              <div className="h-3 bg-black/5 dark:bg-white/5 rounded w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-surface md:border-r md:border-border">
      
      {/* Header & Controls */}
      <div className="p-4 md:p-6 border-b border-border space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-text-primary">Notifications</h1>
          {unreadCount > 0 && (
            <button 
              onClick={() => { markAllAsRead(); toast.success('All notifications marked as read'); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-bold text-primary hover:bg-primary/10 transition-colors"
            >
              <CheckCircle2 size={16} />
              <span className="hidden sm:inline">Mark all as read</span>
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input 
            type="text" 
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-[14px] font-semibold text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:text-text-primary'}`}
          >
            All
          </button>
          <button 
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filter === 'unread' ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:text-text-primary'}`}
          >
            Unread
          </button>
          <button 
            onClick={() => setFilter('messages')}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filter === 'messages' ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:text-text-primary'}`}
          >
            Messages
          </button>
          <button 
            onClick={() => setFilter('jobs')}
            className={`px-4 py-2 rounded-full text-[13px] font-bold whitespace-nowrap transition-colors ${filter === 'jobs' ? 'bg-primary text-white' : 'bg-background border border-border text-text-secondary hover:text-text-primary'}`}
          >
            Jobs
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
              <BellRing size={32} />
            </div>
            <h3 className="text-lg font-bold text-text-primary mb-2">You're all caught up!</h3>
            <p className="text-[14px] text-text-secondary max-w-sm mx-auto">
              {searchQuery ? "No notifications match your search." : "When you receive messages, job alerts, or updates, they'll show up here."}
            </p>
          </div>
        ) : (
          <div className="pb-8">
            {groups.today.length > 0 && (
              <div className="mb-4">
                <div className="px-4 md:px-6 py-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary">Today</h3>
                </div>
                <div>
                  {groups.today.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
              </div>
            )}
            
            {groups.yesterday.length > 0 && (
              <div className="mb-4">
                <div className="px-4 md:px-6 py-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary">Yesterday</h3>
                </div>
                <div>
                  {groups.yesterday.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
              </div>
            )}

            {groups.earlier.length > 0 && (
              <div>
                <div className="px-4 md:px-6 py-2 bg-background/50 backdrop-blur-sm sticky top-0 z-10 border-b border-border">
                  <h3 className="text-[12px] font-bold uppercase tracking-wider text-text-tertiary">Earlier</h3>
                </div>
                <div>
                  {groups.earlier.map(n => <NotificationItem key={n.id} notification={n} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
