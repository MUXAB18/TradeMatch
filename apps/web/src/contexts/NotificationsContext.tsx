'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppNotification } from '@/types/notifications';
import { MOCK_NOTIFICATIONS } from '@/lib/notifications/mockData';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

interface NotificationsContextType {
  notifications: AppNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: string) => void;
  markAsUnread: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API load and check localStorage
    const loadLocal = () => {
      try {
        const saved = localStorage.getItem('tradematch_notifications');
        return saved ? JSON.parse(saved) : MOCK_NOTIFICATIONS;
      } catch (e) {
        return MOCK_NOTIFICATIONS;
      }
    };

    let localNotifs = loadLocal();

    const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'), limit(20));
    const unsub = onSnapshot(q, (snap) => {
      const adminNotifs: AppNotification[] = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: 'all',
          type: 'system',
          title: data.title || 'System Notification',
          message: data.body || data.message || '',
          isRead: false,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
          priority: 'important',
          actorName: 'TradeMatch Admin',
        };
      });

      // Merge avoiding duplicates (adminNotifs take precedence)
      setNotifications(prev => {
        // If we are just loading, use localNotifs instead of prev
        const base = prev.length === 0 ? localNotifs : prev;
        const newNotifs = [...adminNotifs];
        base.forEach((n: AppNotification) => {
          if (!newNotifs.find(an => an.id === n.id)) {
            newNotifs.push(n);
          }
        });
        return newNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      });
      setLoading(false);
    });

    return () => unsub();
  }, []);

  // Persist data
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tradematch_notifications', JSON.stringify(notifications));
    }
  }, [notifications, loading]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: true } : n
    ));
  }, []);

  const markAsUnread = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, isRead: false } : n
    ));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAsUnread,
      markAllAsRead,
      deleteNotification
    }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
