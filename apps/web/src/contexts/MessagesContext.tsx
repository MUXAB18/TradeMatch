'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Conversation, ChatMessage, HydratedConversation, ChatUser } from '@/types/messages';
import { MOCK_CONVERSATIONS, MOCK_MESSAGES, MOCK_USERS, CURRENT_USER_ID } from '@/lib/messages/mockData';

interface MessagesContextType {
  conversations: HydratedConversation[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (conversationId: string, text: string, options?: Partial<ChatMessage>) => void;
  markAsRead: (conversationId: string) => void;
  editMessage: (messageId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;
  pinConversation: (conversationId: string) => void;
  muteConversation: (conversationId: string) => void;
  createNewConversation: (userId: string) => string;
  reactToMessage: (messageId: string, emoji: string) => void;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export function MessagesProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [loading, setLoading] = useState(true);

  // Initialize data
  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem('tradematch_conversations');
      const savedMessages = localStorage.getItem('tradematch_messages');
      
      if (savedConversations && savedMessages) {
        setConversations(JSON.parse(savedConversations));
        setMessagesMap(JSON.parse(savedMessages));
      } else {
        setConversations(MOCK_CONVERSATIONS);
        setMessagesMap(MOCK_MESSAGES);
      }
    } catch (e) {
      console.error('Failed to load messages from local storage', e);
      setConversations(MOCK_CONVERSATIONS);
      setMessagesMap(MOCK_MESSAGES);
    }
    setLoading(false);
  }, []);

  // Persist data
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('tradematch_conversations', JSON.stringify(conversations));
      localStorage.setItem('tradematch_messages', JSON.stringify(messagesMap));
    }
  }, [conversations, messagesMap, loading]);

  const hydrateConversation = useCallback((conv: Conversation): HydratedConversation => {
    const otherUserId = conv.participantIds.find(id => id !== CURRENT_USER_ID) || conv.participantIds[0];
    const otherUser = MOCK_USERS[otherUserId] || { id: otherUserId, name: 'Unknown User', online: false };
    return {
      ...conv,
      otherParticipant: otherUser,
    };
  }, []);

  const hydratedConversations = conversations.map(hydrateConversation).sort((a, b) => {
    if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const activeMessages = activeConversationId ? (messagesMap[activeConversationId] || []) : [];

  const sendMessage = useCallback((conversationId: string, text: string, options?: Partial<ChatMessage>) => {
    const newMessage: ChatMessage = {
      id: `m_${Date.now()}`,
      conversationId,
      senderId: CURRENT_USER_ID,
      text,
      status: 'sent',
      createdAt: new Date().toISOString(),
      ...options,
    };

    setMessagesMap(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), newMessage]
    }));

    setConversations(prev => prev.map(c => 
      c.id === conversationId 
        ? { ...c, lastMessage: newMessage, updatedAt: newMessage.createdAt }
        : c
    ));
    
    // Simulate delivery
    setTimeout(() => {
      setMessagesMap(prev => ({
        ...prev,
        [conversationId]: prev[conversationId].map(m => m.id === newMessage.id ? { ...m, status: 'delivered' } : m)
      }));
    }, 1000);
  }, []);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, unreadCount: 0 } : c
    ));
  }, []);

  const editMessage = useCallback((messageId: string, text: string) => {
    if (!activeConversationId) return;
    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m => 
        m.id === messageId ? { ...m, text, editedAt: new Date().toISOString() } : m
      )
    }));
  }, [activeConversationId]);

  const reactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!activeConversationId) return;
    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m => {
        if (m.id === messageId) {
          const currentReactions = m.reactions || [];
          const existing = currentReactions.find(r => r.emoji === emoji);
          let newReactions;
          if (existing) {
            if (existing.userReacted) {
              if (existing.count === 1) newReactions = currentReactions.filter(r => r.emoji !== emoji);
              else newReactions = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count - 1, userReacted: false } : r);
            } else {
              newReactions = currentReactions.map(r => r.emoji === emoji ? { ...r, count: r.count + 1, userReacted: true } : r);
            }
          } else {
            newReactions = [...currentReactions, { emoji, count: 1, userReacted: true }];
          }
          return { ...m, reactions: newReactions };
        }
        return m;
      })
    }));
  }, [activeConversationId]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!activeConversationId) return;
    setMessagesMap(prev => ({
      ...prev,
      [activeConversationId]: prev[activeConversationId].map(m => 
        m.id === messageId ? { ...m, deletedAt: new Date().toISOString() } : m
      )
    }));
  }, [activeConversationId]);

  const pinConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, isPinned: !c.isPinned } : c
    ));
  }, []);

  const muteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c => 
      c.id === conversationId ? { ...c, isMuted: !c.isMuted } : c
    ));
  }, []);

  const createNewConversation = useCallback((userId: string) => {
    // Check if exists
    const existing = conversations.find(c => c.participantIds.includes(userId) && c.participantIds.includes(CURRENT_USER_ID));
    if (existing) return existing.id;

    const newConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantIds: [CURRENT_USER_ID, userId],
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isMuted: false,
    };

    setConversations(prev => [newConv, ...prev]);
    setMessagesMap(prev => ({ ...prev, [newConvId]: [] }));
    
    return newConvId;
  }, [conversations]);

  return (
    <MessagesContext.Provider value={{
      conversations: hydratedConversations,
      activeConversationId,
      setActiveConversationId,
      messages: activeMessages,
      loading,
      sendMessage,
      markAsRead,
      editMessage,
      deleteMessage,
      pinConversation,
      muteConversation,
      createNewConversation,
      reactToMessage,
    }}>
      {children}
    </MessagesContext.Provider>
  );
}

export function useMessages() {
  const context = useContext(MessagesContext);
  if (context === undefined) {
    throw new Error('useMessages must be used within a MessagesProvider');
  }
  return context;
}
