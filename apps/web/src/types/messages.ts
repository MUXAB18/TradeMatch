export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}

export interface ChatAttachment {
  id: string;
  fileType: 'image' | 'document' | 'pdf';
  fileName: string;
  fileSize: number;
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  status: MessageStatus;
  createdAt: string; // ISO String
  updatedAt?: string;
  editedAt?: string;
  deletedAt?: string;
  reactions?: MessageReaction[];
  replyToMessageId?: string;
  attachments?: ChatAttachment[];
  audioUrl?: string;
}

export interface ChatUser {
  id: string;
  name: string;
  avatar?: string;
  online: boolean;
  lastSeen?: string;
  role?: string;
  company?: string;
  email?: string;
  location?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  updatedAt: string; // ISO String
  isPinned: boolean;
  isMuted: boolean;
}

// Full hydrated conversation with participant user data
export interface HydratedConversation extends Conversation {
  otherParticipant: ChatUser;
}
