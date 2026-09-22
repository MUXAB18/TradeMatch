'use client';

import React from 'react';
import { ChatUser, HydratedConversation } from '@/types/messages';
import { getInitials } from '@/lib/utils';
import Image from 'next/image';
import { BellOff, Pin, Archive, Slash, MapPin, Mail, Briefcase, ChevronRight, Image as ImageIcon, FileText } from 'lucide-react';

interface ContactSidebarProps {
  conversation: HydratedConversation;
  onMute: () => void;
  onPin: () => void;
}

export function ContactSidebar({ conversation, onMute, onPin }: ContactSidebarProps) {
  const contact = conversation.otherParticipant;

  return (
    <div className="h-full flex flex-col bg-surface border-s border-border overflow-y-auto hidden lg:flex w-80 shrink-0">
      {/* Header */}
      <div className="h-[68px] shrink-0 border-b border-border flex items-center justify-center px-6 font-bold text-[15px]">
        Contact Info
      </div>

      <div className="flex-1 p-6 flex flex-col items-center">
        {/* Avatar */}
        <div className="relative w-24 h-24 mb-4 shrink-0">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold overflow-hidden">
            {contact.avatar ? (
              <Image src={contact.avatar} alt={contact.name} fill className="object-cover" />
            ) : (
              getInitials(contact.name)
            )}
          </div>
          {contact.online && (
            <div className="absolute bottom-1 end-1 w-6 h-6 bg-[#34C759] rounded-full border-[3.5px] border-surface shadow-md"></div>
          )}
        </div>

        {/* Name & Status */}
        <h2 className="text-[20px] font-bold text-text-primary mb-1">{contact.name}</h2>
        {contact.role && <p className="text-[14px] text-text-secondary mb-1 text-center">{contact.role}</p>}
        {contact.company && <p className="text-[14px] font-semibold text-text-primary mb-4 text-center">{contact.company}</p>}

        <button className="px-6 py-2 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full text-[13px] font-bold transition-colors mb-6">
          View Profile
        </button>

        <div className="w-full h-px bg-border my-2"></div>

        {/* Details */}
        <div className="w-full py-4 space-y-4">
          {contact.location && (
            <div className="flex items-center gap-3 text-text-secondary text-[14px]">
              <MapPin size={18} />
              <span>{contact.location}</span>
            </div>
          )}
          {contact.email && (
            <div className="flex items-center gap-3 text-text-secondary text-[14px]">
              <Mail size={18} />
              <span className="truncate">{contact.email}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-text-secondary text-[14px]">
            <Briefcase size={18} />
            <span>3 active applications</span>
          </div>
        </div>

        <div className="w-full h-px bg-border my-2"></div>

        {/* Media & Files */}
        <div className="w-full py-4">
          <button className="w-full flex items-center justify-between group mb-2">
            <div className="flex items-center gap-2 text-[14px] font-bold">
              <ImageIcon size={18} className="text-text-secondary" />
              Shared Media
            </div>
            <ChevronRight size={18} className="text-text-secondary group-hover:text-text-primary transition-colors" />
          </button>
          
          <button className="w-full flex items-center justify-between group mt-4">
            <div className="flex items-center gap-2 text-[14px] font-bold">
              <FileText size={18} className="text-text-secondary" />
              Shared Files
            </div>
            <ChevronRight size={18} className="text-text-secondary group-hover:text-text-primary transition-colors" />
          </button>
        </div>

        <div className="w-full h-px bg-border my-2"></div>

        {/* Actions */}
        <div className="w-full py-4 space-y-2">
          <button onClick={onPin} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[14px] font-semibold text-text-primary">
            <div className="flex items-center gap-3">
              <Pin size={18} className={conversation.isPinned ? 'text-primary' : 'text-text-secondary'} />
              {conversation.isPinned ? 'Unpin Conversation' : 'Pin Conversation'}
            </div>
          </button>

          <button onClick={onMute} className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[14px] font-semibold text-text-primary">
            <div className="flex items-center gap-3">
              <BellOff size={18} className={conversation.isMuted ? 'text-warning' : 'text-text-secondary'} />
              {conversation.isMuted ? 'Unmute Notifications' : 'Mute Notifications'}
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-[14px] font-semibold text-text-primary">
            <div className="flex items-center gap-3">
              <Archive size={18} className="text-text-secondary" />
              Archive Chat
            </div>
          </button>

          <button className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-error/10 transition-colors text-[14px] font-semibold text-error mt-4">
            <div className="flex items-center gap-3">
              <Slash size={18} />
              Block User
            </div>
          </button>
        </div>

      </div>
    </div>
  );
}
