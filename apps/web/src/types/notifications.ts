export type NotificationType = 'message' | 'job' | 'application' | 'interview' | 'profile' | 'system';

export type NotificationPriority = 'normal' | 'important' | 'security';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string; // ISO String
  priority: NotificationPriority;
  actorId?: string; // e.g. ID of user who sent message
  actorName?: string;
  actorAvatar?: string;
  relatedEntityId?: string; // Job ID, Application ID, Conversation ID
  actionUrl?: string; // Fallback URL if we don't dynamically route based on type
}
