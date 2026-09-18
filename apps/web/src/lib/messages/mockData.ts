import { ChatUser, Conversation, ChatMessage } from '@/types/messages';

export const CURRENT_USER_ID = 'u_current';

export const MOCK_USERS: Record<string, ChatUser> = {
  u_current: {
    id: 'u_current',
    name: 'Current User',
    online: true,
  },
  u_1: {
    id: 'u_1',
    name: 'Ahmed Khan',
    online: true,
    role: 'Software Engineer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    email: 'ahmed@techcorp.com',
  },
  u_2: {
    id: 'u_2',
    name: 'Sarah Chen',
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    role: 'Product Manager',
    company: 'InnovateInc',
  },
  u_3: {
    id: 'u_3',
    name: 'Michael Ross',
    online: false,
    lastSeen: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    role: 'Recruiter',
    company: 'HireFast',
  }
};

export const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'conv_1': [
    {
      id: 'm_1_1',
      conversationId: 'conv_1',
      senderId: 'u_1',
      text: 'Hey, are you available for a quick call?',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: 'm_1_2',
      conversationId: 'conv_1',
      senderId: CURRENT_USER_ID,
      text: 'Sure, give me 10 minutes.',
      status: 'read',
      createdAt: new Date(Date.now() - 1000 * 60 * 50).toISOString(),
    },
    {
      id: 'm_1_3',
      conversationId: 'conv_1',
      senderId: 'u_1',
      text: 'Awesome, talk soon!',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    }
  ],
  'conv_2': [
    {
      id: 'm_2_1',
      conversationId: 'conv_2',
      senderId: 'u_2',
      text: 'Did you get a chance to review the new designs?',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    }
  ],
  'conv_3': [
    {
      id: 'm_3_1',
      conversationId: 'conv_3',
      senderId: 'u_3',
      text: 'Hi there! We have an opening you might be interested in.',
      status: 'delivered',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    }
  ]
};

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    participantIds: [CURRENT_USER_ID, 'u_1'],
    lastMessage: MOCK_MESSAGES['conv_1'][MOCK_MESSAGES['conv_1'].length - 1],
    unreadCount: 1,
    updatedAt: MOCK_MESSAGES['conv_1'][MOCK_MESSAGES['conv_1'].length - 1].createdAt,
    isPinned: true,
    isMuted: false,
  },
  {
    id: 'conv_2',
    participantIds: [CURRENT_USER_ID, 'u_2'],
    lastMessage: MOCK_MESSAGES['conv_2'][0],
    unreadCount: 1,
    updatedAt: MOCK_MESSAGES['conv_2'][0].createdAt,
    isPinned: false,
    isMuted: false,
  },
  {
    id: 'conv_3',
    participantIds: [CURRENT_USER_ID, 'u_3'],
    lastMessage: MOCK_MESSAGES['conv_3'][0],
    unreadCount: 0,
    updatedAt: MOCK_MESSAGES['conv_3'][0].createdAt,
    isPinned: false,
    isMuted: true,
  }
];
