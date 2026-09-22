/**
 * Shared utilities for TradeMatch web app
 * Mirrors logic from apps/mobile/app/(tabs)/home.tsx
 */

/**
 * Returns a per-user localStorage key so profile data (including photos)
 * is never shared between different accounts on the same device.
 */
export function profileKey(uid: string | undefined | null): string {
  return uid ? `mockProfileData_${uid}` : 'mockProfileData_anonymous';
}

/**
 * Returns a time-based greeting string
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

/**
 * Calculate profile completion percentage
 * Mirrors the completionSteps logic in mobile home.tsx
 */
export function getProfileCompletion(profile: {
  name?: string;
  yearsExperience?: number;
  skills?: string[];
  certifications?: string[];
} | null): number {
  if (!profile) return 0;
  const steps = {
    name: (profile.name || '') !== '' && profile.name !== 'New User',
    experience: (profile.yearsExperience || 0) > 0,
    skills: (profile.skills || []).length > 0,
    certifications: (profile.certifications || []).length > 0,
  };
  const completed = Object.values(steps).filter(Boolean).length;
  const total = Object.keys(steps).length;
  return Math.round((completed / total) * 100);
}

/**
 * Returns Tailwind color class based on match percentage
 * Green ≥80%, Orange ≥60%, Red otherwise
 */
export function getMatchBadgeClasses(score: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (score >= 80) {
    return {
      bg: 'bg-success/10',
      text: 'text-success',
      border: 'border-success/20',
    };
  }
  if (score >= 60) {
    return {
      bg: 'bg-secondary/10',
      text: 'text-secondary',
      border: 'border-secondary/20',
    };
  }
  return {
    bg: 'bg-error/10',
    text: 'text-error',
    border: 'border-error/20',
  };
}

/**
 * Get initials from a name string
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Format a Firestore Timestamp or Date for display
 */
export function formatPostedDate(
  date: { toDate?: () => Date } | Date | null | undefined, 
  t?: (key: string, values?: any) => string
): string {
  if (!date) return '';
  const d = typeof (date as any).toDate === 'function' ? (date as any).toDate() : date as Date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return t ? t('today') : 'Today';
  if (diffDays === 1) return t ? t('yesterday') : 'Yesterday';
  if (diffDays < 7) return t ? t('days_ago', { count: diffDays }) : `${diffDays} days ago`;
  if (diffDays < 30) return t ? t('weeks_ago', { count: Math.floor(diffDays / 7) }) : `${Math.floor(diffDays / 7)}w ago`;
  return t ? t('months_ago', { count: Math.floor(diffDays / 30) }) : `${Math.floor(diffDays / 30)}mo ago`;
}

