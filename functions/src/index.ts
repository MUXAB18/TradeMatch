/**
 * Cloud Functions for TradeMatch
 * 
 * Functions:
 * 1. onJobPostingCreated - Trigger when new job is posted, notify matching users
 * 2. weeklyCertificationReminder - Scheduled weekly, nudge users with incomplete certs
 * 3. profileCompletionNudge - Scheduled, nudge users with incomplete profiles
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export functions
export { onJobPostingCreated } from './jobMatchNotifications';
export { weeklyCertificationReminder } from './certificationReminders';
export { profileCompletionNudge } from './profileNudges';
