/**
 * Admin service layer — reads/writes real Firestore data
 * Collections: users, jobPostings, certifications, interviewPrep, agencies, notifications
 */

import {
  collection, query, getDocs, getDoc, doc,
  updateDoc, addDoc, deleteDoc, setDoc,
  orderBy, limit, where, getCountFromServer,
  serverTimestamp, Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { User, JobPosting, Certification, InterviewPrepCard } from '@/types';

/* ─── Types ──────────────────────────────────────────────────── */

export interface AdminUser extends User {
  id: string;
  adminStatus?: 'active' | 'suspended' | 'pending';
}

export interface AdminJob extends JobPosting {
  id: string;
}

export interface AdminCert extends Certification {
  id: string;
}

export interface AdminPrepCard extends InterviewPrepCard {
  id: string;
}

export interface DashboardStats {
  totalUsers: number;
  workers: number;
  agencies: number;
  totalJobs: number;
  activeJobs: number;
  verifiedUsers: number;
  pendingVerification: number;
  totalCerts: number;
  recentUsers: AdminUser[];
  recentJobs: AdminJob[];
}

export interface AdminNotification {
  id?: string;
  title: string;
  body: string;
  target: 'all' | 'workers' | 'agencies';
  createdAt: any;
  sentBy: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  target: string;
  targetId: string;
  admin: string;
  timestamp: number;
  detail?: string;
}

export interface SupportTicket {
  id?: string;
  userId: string;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: number;
  assignedTo?: string;
}

export interface Promotion {
  id?: string;
  title: string;
  message: string;
  icon: string;
  themeColor: string;
  actionText?: string;
  actionUrl?: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  target: 'all' | 'workers' | 'agencies';
  createdAt: number;
}

export interface TaxonomyDocument {
  items: string[];
}

export interface GlobalSettings {
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  maintenanceEndTime?: number;
  supportEmail: string;
  platformFee: number;
  announcementBanner: string;
}

export interface CMSBlock {
  id: string;
  value: string;
  description: string;
  updatedBy: string;
  updatedAt: number;
}

/* ─── Audit log (session-scoped, stored in memory) ──────────── */

const auditLog: AuditEntry[] = [];

export function addAudit(action: string, target: string, targetId: string, admin: string, detail?: string) {
  auditLog.unshift({
    id: Math.random().toString(36).slice(2),
    action, target, targetId, admin,
    timestamp: Date.now(),
    detail,
  });
  if (auditLog.length > 200) auditLog.pop();
}

export function getAuditLog(): AuditEntry[] {
  return auditLog;
}

/* ─── Taxonomies ─────────────────────────────────────────────── */

export async function getTaxonomy(id: string): Promise<string[]> {
  try {
    const ref = doc(db, 'platform_settings', id);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      return snap.data().items || [];
    }
  } catch (e) {
    console.error('Error getting taxonomy', id, e);
  }
  return [];
}

export async function addTaxonomyItem(id: string, item: string, adminEmail: string): Promise<string[]> {
  const current = await getTaxonomy(id);
  if (!current.includes(item)) {
    const updated = [...current, item].sort();
    await setDoc(doc(db, 'platform_settings', id), { items: updated }, { merge: true });
    addAudit(`add_taxonomy_item`, 'platform_settings', id, adminEmail, `Added "${item}" to ${id}`);
    return updated;
  }
  return current;
}

export async function removeTaxonomyItem(id: string, item: string, adminEmail: string): Promise<string[]> {
  const current = await getTaxonomy(id);
  const updated = current.filter(i => i !== item);
  await setDoc(doc(db, 'platform_settings', id), { items: updated }, { merge: true });
  addAudit(`remove_taxonomy_item`, 'platform_settings', id, adminEmail, `Removed "${item}" from ${id}`);
  return updated;
}

/* ─── Global Settings ────────────────────────────────────────── */

export async function getGlobalSettings(): Promise<GlobalSettings> {
  const snap = await getDoc(doc(db, 'platform_settings', 'global'));
  if (snap.exists()) {
    return snap.data() as GlobalSettings;
  }
  return { maintenanceMode: false, supportEmail: 'support@tradematch.com', platformFee: 5, announcementBanner: '' };
}

export async function updateGlobalSettings(settings: Partial<GlobalSettings>, adminEmail: string): Promise<void> {
  await setDoc(doc(db, 'platform_settings', 'global'), settings, { merge: true });
  addAudit('update_global_settings', 'platform_settings', 'global', adminEmail, `Updated global settings`);
}


/* ─── CMS Blocks ─────────────────────────────────────────────── */

export async function getAllCMSBlocks(): Promise<CMSBlock[]> {
  try {
    const q = query(collection(db, 'cms'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as CMSBlock));
  } catch (e) {
    console.error('Error getting CMS blocks', e);
    return [];
  }
}

export async function updateCMSBlock(id: string, value: string, description: string, adminEmail: string): Promise<void> {
  await setDoc(doc(db, 'cms', id), {
    value,
    description,
    updatedBy: adminEmail,
    updatedAt: Date.now()
  }, { merge: true });
  addAudit('update_cms_block', 'cms', id, adminEmail, `Updated CMS block "${id}"`);
}

/* ─── Support Tickets ────────────────────────────────────────────── */

export async function getSupportTickets(): Promise<SupportTicket[]> {
  try {
    const q = query(collection(db, 'support_tickets'), orderBy('createdAt', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
  } catch (e) {
    console.error('Error getting support tickets', e);
    // fallback if no index
    const snap = await getDocs(query(collection(db, 'support_tickets'), limit(100)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupportTicket));
  }
}

export async function updateSupportTicket(id: string, updates: Partial<SupportTicket>, adminEmail: string): Promise<void> {
  await setDoc(doc(db, 'support_tickets', id), updates, { merge: true });
  addAudit('update_support_ticket', 'support_tickets', id, adminEmail, `Updated ticket ${id}`);
}

export async function deleteSupportTicket(id: string, adminEmail: string): Promise<void> {
  await deleteDoc(doc(db, 'support_tickets', id));
  addAudit('delete_support_ticket', 'support_tickets', id, adminEmail, `Deleted ticket ${id}`);
}

/* ─── Promotions / Popups ──────────────────────────────────── */

export async function getPromotions(): Promise<Promotion[]> {
  try {
    const q = query(collection(db, 'promotions'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
  } catch (e) {
    console.error('Error getting promotions', e);
    const snap = await getDocs(query(collection(db, 'promotions')));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Promotion));
  }
}

export async function savePromotion(promo: Partial<Promotion>, adminEmail: string): Promise<string> {
  let docRef;
  if (promo.id) {
    docRef = doc(db, 'promotions', promo.id);
    await setDoc(docRef, promo, { merge: true });
    addAudit('update_promotion', 'promotions', promo.id, adminEmail, `Updated promotion ${promo.title}`);
  } else {
    docRef = doc(collection(db, 'promotions'));
    const data = { ...promo, createdAt: Date.now() };
    await setDoc(docRef, data);
    addAudit('create_promotion', 'promotions', docRef.id, adminEmail, `Created promotion ${promo.title}`);
  }
  return docRef.id;
}

export async function deletePromotion(id: string, adminEmail: string): Promise<void> {
  await deleteDoc(doc(db, 'promotions', id));
  addAudit('delete_promotion', 'promotions', id, adminEmail, `Deleted promotion ${id}`);
}

/* ─── Dashboard ─────────────────────────────────────────────── */

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    usersSnap, workersSnap, agenciesSnap,
    jobsSnap, activeJobsSnap, certsSnap,
  ] = await Promise.all([
    getCountFromServer(collection(db, 'users')),
    getCountFromServer(query(collection(db, 'users'), where('role', '==', 'worker'))),
    getCountFromServer(query(collection(db, 'users'), where('role', '==', 'agency'))),
    getCountFromServer(collection(db, 'jobPostings')),
    getCountFromServer(query(collection(db, 'jobPostings'), where('active', '==', true))),
    getCountFromServer(collection(db, 'certifications')),
  ]);

  // Recent users & jobs
  const recentUsersQ = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(5));
  const recentJobsQ  = query(collection(db, 'jobPostings'), orderBy('postedAt', 'desc'), limit(5));
  const [recentUsersSnap, recentJobsSnap] = await Promise.all([
    getDocs(recentUsersQ),
    getDocs(recentJobsQ),
  ]);

  const recentUsers = recentUsersSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser));
  const recentJobs  = recentJobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as AdminJob));

  // Count verified users (verificationStatus.identity === 'verified')
  let verifiedUsers = 0;
  let pendingVerification = 0;
  try {
    const vQ = query(collection(db, 'users'), where('verificationStatus.identity', '==', 'verified'));
    const pQ = query(collection(db, 'users'), where('verificationStatus.identity', '==', 'submitted'));
    const [vSnap, pSnap] = await Promise.all([getCountFromServer(vQ), getCountFromServer(pQ)]);
    verifiedUsers = vSnap.data().count;
    pendingVerification = pSnap.data().count;
  } catch { /* index may not exist yet */ }

  return {
    totalUsers: usersSnap.data().count,
    workers: workersSnap.data().count,
    agencies: agenciesSnap.data().count,
    totalJobs: jobsSnap.data().count,
    activeJobs: activeJobsSnap.data().count,
    verifiedUsers,
    pendingVerification,
    totalCerts: certsSnap.data().count,
    recentUsers,
    recentJobs,
  };
}

/* ─── Users ─────────────────────────────────────────────────── */

export async function getAllUsers(maxResults = 100): Promise<AdminUser[]> {
  try {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser));
  } catch {
    // Fallback without orderBy if index missing
    const snap = await getDocs(query(collection(db, 'users'), limit(maxResults)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminUser));
  }
}

export async function getUserById(userId: string): Promise<AdminUser | null> {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as AdminUser;
}

export async function adminUpdateUser(
  userId: string,
  data: Partial<AdminUser>,
  adminEmail: string,
): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  addAudit('User Updated', userId, userId, adminEmail, JSON.stringify(data));
}

export async function setUserVerification(
  userId: string,
  field: 'identity' | 'certificate' | 'experience',
  state: 'verified' | 'unverified' | 'submitted' | 'attention',
  adminEmail: string,
): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    [`verificationStatus.${field}`]: state,
    updatedAt: serverTimestamp(),
  });
  addAudit(`Verification ${state}`, `users/${userId}`, userId, adminEmail, `${field} → ${state}`);
}

export async function setUserSuspended(
  userId: string,
  suspended: boolean,
  adminEmail: string,
): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    adminStatus: suspended ? 'suspended' : 'active',
    updatedAt: serverTimestamp(),
  });
  addAudit(suspended ? 'User Suspended' : 'User Unsuspended', `users/${userId}`, userId, adminEmail);
}

export async function adminUpdateUserStatus(
  userId: string,
  status: 'pending' | 'approved' | 'suspended',
  adminEmail: string
): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    accountStatus: status,
    updatedAt: serverTimestamp(),
  });
  addAudit(`User Status: ${status}`, `users/${userId}`, userId, adminEmail, `Status changed to ${status}`);
}

/* ─── Jobs ──────────────────────────────────────────────────── */

export async function getAllJobs(maxResults = 100): Promise<AdminJob[]> {
  try {
    const q = query(collection(db, 'jobPostings'), orderBy('postedAt', 'desc'), limit(maxResults));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminJob));
  } catch {
    const snap = await getDocs(query(collection(db, 'jobPostings'), limit(maxResults)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminJob));
  }
}

export async function createJob(data: Omit<AdminJob, 'id'>, adminEmail: string): Promise<string> {
  const ref = await addDoc(collection(db, 'jobPostings'), {
    ...data,
    postedAt: serverTimestamp(),
    active: true,
  });
  addAudit('Job Created', `jobPostings/${ref.id}`, ref.id, adminEmail, data.title);
  return ref.id;
}

export async function updateJob(jobId: string, data: Partial<AdminJob>, adminEmail: string): Promise<void> {
  await updateDoc(doc(db, 'jobPostings', jobId), { ...data });
  addAudit('Job Updated', `jobPostings/${jobId}`, jobId, adminEmail, data.title);
}

export async function deleteJob(jobId: string, adminEmail: string): Promise<void> {
  await deleteDoc(doc(db, 'jobPostings', jobId));
  addAudit('Job Deleted', `jobPostings/${jobId}`, jobId, adminEmail);
}

export async function toggleJobActive(jobId: string, active: boolean, adminEmail: string): Promise<void> {
  await updateDoc(doc(db, 'jobPostings', jobId), { active });
  addAudit(active ? 'Job Published' : 'Job Unpublished', `jobPostings/${jobId}`, jobId, adminEmail);
}

/* ─── Certifications ────────────────────────────────────────── */

export async function getAllCerts(): Promise<AdminCert[]> {
  const snap = await getDocs(collection(db, 'certifications'));
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminCert));
}

export async function createCert(data: Omit<AdminCert, 'id'>, adminEmail: string): Promise<string> {
  const ref = await addDoc(collection(db, 'certifications'), data);
  addAudit('Cert Created', `certifications/${ref.id}`, ref.id, adminEmail, data.name);
  return ref.id;
}

export async function updateCert(certId: string, data: Partial<AdminCert>, adminEmail: string): Promise<void> {
  await updateDoc(doc(db, 'certifications', certId), { ...data });
  addAudit('Cert Updated', `certifications/${certId}`, certId, adminEmail, data.name);
}

export async function deleteCert(certId: string, adminEmail: string): Promise<void> {
  await deleteDoc(doc(db, 'certifications', certId));
  addAudit('Cert Deleted', `certifications/${certId}`, certId, adminEmail);
}

/* ─── Interview Prep ────────────────────────────────────────── */

export async function getAllPrepCards(): Promise<AdminPrepCard[]> {
  try {
    const q = query(collection(db, 'interviewPrep'), orderBy('order', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminPrepCard));
  } catch {
    const snap = await getDocs(collection(db, 'interviewPrep'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminPrepCard));
  }
}

export async function createPrepCard(data: Omit<AdminPrepCard, 'id'>, adminEmail: string): Promise<string> {
  const ref = await addDoc(collection(db, 'interviewPrep'), data);
  addAudit('PrepCard Created', `interviewPrep/${ref.id}`, ref.id, adminEmail, data.question.slice(0, 60));
  return ref.id;
}

export async function updatePrepCard(cardId: string, data: Partial<AdminPrepCard>, adminEmail: string): Promise<void> {
  await updateDoc(doc(db, 'interviewPrep', cardId), { ...data });
  addAudit('PrepCard Updated', `interviewPrep/${cardId}`, cardId, adminEmail);
}

export async function deletePrepCard(cardId: string, adminEmail: string): Promise<void> {
  await deleteDoc(doc(db, 'interviewPrep', cardId));
  addAudit('PrepCard Deleted', `interviewPrep/${cardId}`, cardId, adminEmail);
}

/* ─── Notifications ─────────────────────────────────────────── */

export async function sendNotification(n: Omit<AdminNotification, 'id'>, adminEmail: string): Promise<string> {
  const ref = await addDoc(collection(db, 'adminNotifications'), {
    ...n,
    createdAt: serverTimestamp(),
    sentBy: adminEmail,
  });
  addAudit('Notification Sent', `adminNotifications/${ref.id}`, ref.id, adminEmail, n.title);
  return ref.id;
}

export async function getNotifications(): Promise<(AdminNotification & { id: string })[]> {
  try {
    const q = query(collection(db, 'adminNotifications'), orderBy('createdAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as AdminNotification & { id: string }));
  } catch {
    return [];
  }
}
