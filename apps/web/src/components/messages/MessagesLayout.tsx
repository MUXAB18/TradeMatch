'use client';

import React, { useState, useMemo } from 'react';
import { useMessages } from '@/contexts/MessagesContext';
import { ConversationList } from './ConversationList';
import { ChatArea } from './ChatArea';
import { ContactSidebar } from './ContactSidebar';
import Modal from '@/components/ui/Modal';
import { MOCK_USERS, CURRENT_USER_ID } from '@/lib/messages/mockData';
import { Search, UserPlus } from 'lucide-react';

export function MessagesLayout() {
  const { activeConversationId, conversations, muteConversation, pinConversation, setActiveConversationId } = useMessages();
  const [showContact, setShowContact] = useState(false);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [newMessageSearch, setNewMessageSearch] = useState('');
  const { createNewConversation } = useMessages();

  const filteredUsers = useMemo(() => {
    const query = newMessageSearch.toLowerCase();
    return Object.values(MOCK_USERS)
      .filter(u => u.id !== CURRENT_USER_ID)
      .filter(u => u.name.toLowerCase().includes(query) || u.role?.toLowerCase().includes(query));
  }, [newMessageSearch]);

  const activeConversation = conversations.find(c => c.id === activeConversationId);

  return (
    <div className="flex w-full h-[calc(100vh-68px)] md:h-[calc(100vh-68px)] bg-surface overflow-hidden">
      {/* Left Sidebar - Conversation List */}
      <div className={`h-full shrink-0 md:flex ${activeConversationId ? 'hidden md:block' : 'w-full'}`}>
        <ConversationList onNewMessage={() => setShowNewMessage(true)} />
      </div>

      {/* Center - Active Chat */}
      <div className={`flex-1 h-full min-w-0 ${!activeConversationId ? 'hidden md:flex' : 'flex'}`}>
        <ChatArea 
          onBack={() => setActiveConversationId(null)}
          onShowContact={() => setShowContact(!showContact)}
        />
      </div>

      {/* Right Sidebar - Contact Info (Responsive drawer/sidebar) */}
      {activeConversation && showContact && (
        <div className="absolute inset-0 z-20 md:relative md:inset-auto md:h-full shrink-0 flex justify-end bg-black/50 md:bg-transparent">
          {/* Mobile backdrop tap to close */}
          <div className="absolute inset-0 md:hidden" onClick={() => setShowContact(false)} />
          
          <div className="relative z-30 h-full bg-surface shadow-2xl md:shadow-none transition-transform w-80 max-w-full">
            <ContactSidebar 
              conversation={activeConversation}
              onMute={() => muteConversation(activeConversation.id)}
              onPin={() => pinConversation(activeConversation.id)}
            />
          </div>
        </div>
      )}

      {/* New Message Modal */}
      <Modal 
        isOpen={showNewMessage} 
        onClose={() => {
          setShowNewMessage(false);
          setNewMessageSearch('');
        }} 
        title="New Message" 
        maxWidth="max-w-md"
      >
        <div className="p-1">
          {/* Search Bar */}
          <div className="p-4 border-b border-border/50 bg-surface/50 backdrop-blur-xl sticky top-0 z-10">
            <div className="relative group">
              <Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search by name or role..."
                value={newMessageSearch}
                onChange={e => setNewMessageSearch(e.target.value)}
                className="w-full ps-10 pe-4 py-2.5 bg-surface-hover/50 hover:bg-surface-hover focus:bg-surface border border-border/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 rounded-xl outline-none transition-all placeholder:text-text-secondary/50 text-[15px]"
                autoFocus
              />
            </div>
          </div>

          {/* User List */}
          <div className="p-2 space-y-1 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {filteredUsers.length > 0 ? (
              filteredUsers.map(user => (
                <button
                  key={user.id}
                  onClick={() => {
                    const convId = createNewConversation(user.id);
                    setActiveConversationId(convId);
                    setShowNewMessage(false);
                    setNewMessageSearch('');
                  }}
                  className="w-full flex items-center gap-3 p-3 hover:bg-surface-hover rounded-xl transition-all duration-200 text-start group"
                >
                  <div className="relative shadow-sm rounded-full">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-11 h-11 rounded-full object-cover ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-primary font-bold shadow-inner ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    {user.online && (
                      <div className="absolute bottom-0 end-0 w-3.5 h-3.5 bg-green-500 rounded-full border-[2.5px] border-surface shadow-sm" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-bold text-text-primary truncate group-hover:text-primary transition-colors">{user.name}</h3>
                    {user.role && <p className="text-[13px] text-text-secondary truncate">{user.role}</p>}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform group-hover:scale-100 scale-90">
                    <UserPlus size={16} className="text-primary" />
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 bg-surface-hover rounded-full flex items-center justify-center mb-3">
                  <Search size={24} className="text-text-secondary/50" />
                </div>
                <h3 className="text-[15px] font-bold text-text-primary mb-1">No connections found</h3>
                <p className="text-[13px] text-text-secondary max-w-[200px]">We couldn't find anyone matching "{newMessageSearch}"</p>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
