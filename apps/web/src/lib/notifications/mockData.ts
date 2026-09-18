import { AppNotification } from '@/types/notifications';

export const CURRENT_USER_ID = 'u_current';

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif_1',
    userId: CURRENT_USER_ID,
    type: 'message',
    title: 'New message from Ahmed Khan',
    message: '"Are you available for a quick call?"',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    priority: 'normal',
    actorId: 'u_1',
    actorName: 'Ahmed Khan',
    relatedEntityId: 'conv_1',
  },
  {
    id: 'notif_2',
    userId: CURRENT_USER_ID,
    type: 'application',
    title: 'Application status updated',
    message: 'Your application for Frontend Developer has moved to Under Review.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    priority: 'important',
    relatedEntityId: 'app_1',
  },
  {
    id: 'notif_3',
    userId: CURRENT_USER_ID,
    type: 'job',
    title: 'New job recommendation',
    message: 'Senior React Developer at WebCorp matches your preferences.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    priority: 'normal',
    relatedEntityId: 'job_123',
  },
  {
    id: 'notif_4',
    userId: CURRENT_USER_ID,
    type: 'interview',
    title: 'Interview scheduled',
    message: 'Your interview with ABC Technologies is scheduled for tomorrow at 10:00 AM.',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    priority: 'important',
    relatedEntityId: 'interview_1',
  },
  {
    id: 'notif_5',
    userId: CURRENT_USER_ID,
    type: 'system',
    title: 'Security alert',
    message: 'A new login was detected on your account from Chrome on Mac.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    priority: 'security',
  },
  {
    id: 'notif_6',
    userId: CURRENT_USER_ID,
    type: 'profile',
    title: 'Complete your profile',
    message: 'Your profile is 80% complete. Add your certifications to stand out to employers.',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
    priority: 'normal',
  }
];
