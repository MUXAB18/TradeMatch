import React, { useState } from 'react';
import Link from 'next/link';
import { AppNotification } from '@/types/notifications';
import { useNotifications } from '@/contexts/NotificationsContext';
import { formatDistanceToNow } from 'date-fns';
import { 
  MessageSquare, Briefcase, FileText, Calendar, ShieldAlert, User, 
  MoreVertical, Check, Trash2, CheckCircle2, Bell
} from 'lucide-react';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';

interface NotificationItemProps {
  notification: AppNotification;
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const { markAsRead, markAsUnread, deleteNotification } = useNotifications();
  const [menuOpen, setMenuOpen] = useState(false);

  const getIcon = () => {
    switch (notification.type) {
      case 'message': return <MessageSquare size={20} className="text-primary" />;
      case 'job': return <Briefcase size={20} className="text-secondary" />;
      case 'application': return <FileText size={20} className="text-blue-500" />;
      case 'interview': return <Calendar size={20} className="text-purple-500" />;
      case 'system': return <ShieldAlert size={20} className={notification.priority === 'security' ? 'text-error' : 'text-text-secondary'} />;
      case 'profile': return <User size={20} className="text-green-500" />;
      default: return <Bell size={20} className="text-text-secondary" />;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  const handleAction = (e: React.MouseEvent, action: 'read' | 'unread' | 'delete') => {
    e.preventDefault();
    e.stopPropagation();
    setMenuOpen(false);
    
    if (action === 'read') markAsRead(notification.id);
    else if (action === 'unread') markAsUnread(notification.id);
    else if (action === 'delete') deleteNotification(notification.id);
  };

  // Determine standard route for clicks if no actionUrl provided
  let routeUrl = notification.actionUrl || '#';
  if (!notification.actionUrl) {
    if (notification.type === 'message') routeUrl = '/messages';
    if (notification.type === 'job') routeUrl = '/jobs';
    if (notification.type === 'profile') routeUrl = '/profile';
  }

  return (
    <div className={`relative flex items-start gap-4 p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-border last:border-b-0 group ${!notification.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}>
      
      {/* Unread dot */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full" />
      )}

      {/* Avatar or Icon */}
      <div className="shrink-0 pt-1">
        {notification.actorAvatar || (notification.actorName && notification.type === 'message') ? (
          <div className="w-12 h-12 rounded-full overflow-hidden bg-surface border border-border flex items-center justify-center text-primary font-bold shadow-sm">
            {notification.actorAvatar ? (
              <Image src={notification.actorAvatar} alt={notification.actorName || ''} width={48} height={48} className="w-full h-full object-cover" />
            ) : (
              getInitials(notification.actorName || 'U')
            )}
          </div>
        ) : (
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-sm ${!notification.isRead ? 'bg-surface border border-primary/20' : 'bg-surface border border-border'}`}>
            {getIcon()}
          </div>
        )}
      </div>

      {/* Content */}
      <Link href={routeUrl} className="flex-1 min-w-0 flex flex-col pt-1" onClick={() => !notification.isRead && markAsRead(notification.id)}>
        <div className="flex justify-between items-start gap-2">
          <p className={`text-[15px] leading-tight mb-1 ${!notification.isRead ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary'}`}>
            {notification.title}
          </p>
          <span className="text-[12px] text-text-tertiary whitespace-nowrap shrink-0">
            {timeAgo}
          </span>
        </div>
        <p className={`text-[14px] line-clamp-2 ${!notification.isRead ? 'text-text-secondary' : 'text-text-tertiary'}`}>
          {notification.message}
        </p>
      </Link>

      {/* Actions */}
      <div className="relative pt-1">
        <button 
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-black/5 transition-colors opacity-0 group-hover:opacity-100 md:opacity-100 focus:opacity-100"
          aria-label="Options"
        >
          <MoreVertical size={18} />
        </button>

        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-xl shadow-xl z-50 py-1 overflow-hidden">
              {!notification.isRead ? (
                <button 
                  onClick={(e) => handleAction(e, 'read')}
                  className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-text-primary hover:bg-black/5 flex items-center gap-2"
                >
                  <Check size={16} className="text-text-secondary" />
                  Mark as read
                </button>
              ) : (
                <button 
                  onClick={(e) => handleAction(e, 'unread')}
                  className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-text-primary hover:bg-black/5 flex items-center gap-2"
                >
                  <CheckCircle2 size={16} className="text-text-secondary" />
                  Mark as unread
                </button>
              )}
              <div className="h-px bg-border my-1" />
              <button 
                onClick={(e) => handleAction(e, 'delete')}
                className="w-full text-left px-4 py-2.5 text-[14px] font-semibold text-error hover:bg-error/10 flex items-center gap-2 transition-colors"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
