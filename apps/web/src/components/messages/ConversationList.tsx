'use client';

import React, { useState } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';
import { format, isToday, isYesterday } from 'date-fns';
import { Search, Edit, Pin, BellOff } from 'lucide-react';

export function ConversationList({ onNewMessage }: { onNewMessage?: () => void }) {
  const { conversations, activeConversationId, setActiveConversationId } = useMessages();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(c => 
    c.otherParticipant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.lastMessage?.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    if (isToday(date)) return format(date, 'h:mm a');
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <div className="h-full flex flex-col bg-surface border-e border-border w-full md:w-80 lg:w-[350px] shrink-0">
      
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[22px] font-bold text-text-primary">Messages</h1>
          <button onClick={onNewMessage} className="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-full transition-colors cursor-pointer" title="New Message">
            <Edit size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search size={18} className="absolute start-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:bg-surface rounded-xl ps-10 pe-4 py-2.5 text-[14px] font-medium text-text-primary placeholder:text-text-secondary outline-none transition-all"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredConversations.length === 0 ? (
          <div className="text-center p-8 text-text-secondary">
            <p className="text-[14px] font-semibold">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map(conv => {
            const isActive = activeConversationId === conv.id;
            const contact = conv.otherParticipant;
            const hasUnread = conv.unreadCount > 0;

            return (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`w-full flex items-start gap-3 p-3 rounded-2xl transition-all mb-1 text-start ${
                  isActive 
                    ? 'bg-primary/10' 
                    : 'hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {/* Avatar */}
                <div className="relative w-12 h-12 shrink-0 mt-0.5">
                  <div className="w-12 h-12 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center text-text-primary font-bold overflow-hidden">
                    {contact.avatar ? (
                      <Image src={contact.avatar} alt={contact.name} fill className="object-cover" />
                    ) : (
                      getInitials(contact.name)
                    )}
                  </div>
                  {contact.online && (
                    <div className="absolute bottom-0 end-0 w-3.5 h-3.5 bg-[#34C759] rounded-full border-[3px] border-surface shadow-sm"></div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <h3 className={`text-[15px] truncate pe-2 ${hasUnread ? 'font-bold text-text-primary' : 'font-semibold text-text-primary'}`}>
                      {contact.name}
                    </h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {conv.isMuted && <BellOff size={12} className="text-text-secondary" />}
                      {conv.isPinned && <Pin size={12} className="text-primary" />}
                      <span className={`text-[12px] ${hasUnread ? 'text-primary font-bold' : 'text-text-secondary font-medium'}`}>
                        {formatTime(conv.updatedAt)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-[14px] truncate ${hasUnread ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}>
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                    {hasUnread && (
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center shrink-0 shadow-sm">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

    </div>
  );
}
