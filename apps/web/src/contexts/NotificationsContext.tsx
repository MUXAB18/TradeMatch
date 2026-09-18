'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { AppNotification } from '@/types/notifications';
import { MOCK_NOTIFICATIONS } from '@/lib/notifications/mockData';

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
    const timer = setTimeout(() => {
      try {
        const savedNotifications = localStorage.getItem('tradematch_notifications');
        if (savedNotifications) {
          setNotifications(JSON.parse(savedNotifications));
        } else {
          setNotifications(MOCK_NOTIFICATIONS);
        }
      } catch (e) {
        console.error('Failed to load notifications from local storage', e);
        setNotifications(MOCK_NOTIFICATIONS);
      }
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
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
