const fs = require('fs');
const path = require('path');

const formsPath = path.join(__dirname, 'apps/web/src/components/settings/SettingsForms.tsx');
let content = fs.readFileSync(formsPath, 'utf8');

// Add import
content = content.replace("import { useLocale } from 'next-intl';", "import { useLocale, useTranslations } from 'next-intl';");

// ProfileSettings
content = content.replace("export function ProfileSettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {", "export function ProfileSettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {\n  const t = useTranslations('settings');");
content = content.replace(/'Image size must be less than 5MB'/g, "t('photo_hint')");
content = content.replace(/'Photo selected for upload'/g, "'Photo selected for upload'"); // skipping toasts if not all translated
content = content.replace(/"Profile Settings"/g, "t('title_profile')");
content = content.replace(/"Manage your personal information and how others see you."/g, "t('desc_profile')");
content = content.replace(/"Change photo"/g, "t('change_photo')");
content = content.replace(/JPG, GIF or PNG. Max size of 5MB./g, "{t('photo_hint')}");
content = content.replace(/>First Name</g, ">{t('first_name')}<");
content = content.replace(/>Last Name</g, ">{t('last_name')}<");
content = content.replace(/>Bio</g, ">{t('bio')}<");
content = content.replace(/placeholder="Write a short bio about your professional experience..."/g, "placeholder={t('bio_placeholder')}");

// AccountSettings
content = content.replace("export function AccountSettings({ showToast }: { showToast?: (t: 'success'|'error', m: string) => void }) {", "export function AccountSettings({ showToast }: { showToast?: (t: 'success'|'error', m: string) => void }) {\n  const t = useTranslations('settings');");
content = content.replace(/"Account Information"/g, "t('title_account')");
content = content.replace(/"View and manage your core account details."/g, "t('desc_account')");
content = content.replace(/'Email Address'/g, "t('email')");
content = content.replace(/'Phone Number'/g, "t('phone')");
content = content.replace(/'No email linked'/g, "t('no_email')");
content = content.replace(/'Not provided'/g, "t('no_phone')");
content = content.replace(/>Account Details</g, ">{t('account_details')}<");
content = content.replace(/>Account ID</g, ">{t('account_id')}<");
content = content.replace(/>Account Created</g, ">{t('account_created')}<");
content = content.replace(/>Account Type</g, ">{t('account_type')}<");

// NotificationSettings
content = content.replace("export function NotificationSettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {", "export function NotificationSettings({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {\n  const t = useTranslations('settings');");
content = content.replace(/"Notification Preferences"/g, "t('title_notifications')");
content = content.replace(/"Control what alerts you receive and how you receive them."/g, "t('desc_notifications')");
content = content.replace(/>Email Notifications</g, ">{t('email_notifications')}<");
content = content.replace(/title="Job recommendations"/g, "title={t('job_recs')}");
content = content.replace(/desc="Receive notifications about jobs matching your interests."/g, "desc={t('job_recs_desc')}");
content = content.replace(/title="Certification Reminders"/g, "title={t('cert_reminders')}");
content = content.replace(/desc="Get alerted before your certs expire."/g, "desc={t('cert_reminders_desc')}");
content = content.replace(/title="Messages"/g, "title={t('messages')}");
content = content.replace(/desc="Alerts for new chat messages from employers."/g, "desc={t('messages_desc')}");

// AppearanceSettings
content = content.replace("export function AppearanceSettings() {", "export function AppearanceSettings() {\n  const t = useTranslations('settings');");
content = content.replace(/"Appearance"/g, "t('title_appearance')");
content = content.replace(/"Customize how TradeMatch looks on this device."/g, "t('desc_appearance')");
content = content.replace(/>Theme</g, ">{t('theme')}<");
content = content.replace(/label="Light"/g, "label={t('light')}");
content = content.replace(/label="Dark"/g, "label={t('dark')}");
content = content.replace(/label="System"/g, "label={t('system')}");

// LanguageSettings
content = content.replace("export function LanguageSettings() {", "export function LanguageSettings() {\n  const t = useTranslations('settings');");
content = content.replace(/"Language & Region"/g, "t('title_language')");
content = content.replace(/"Manage your locale settings."/g, "t('desc_language')");
content = content.replace(/label="Language"/g, "label={t('language')}");
content = content.replace(/label="Region"/g, "label={t('region')}");
content = content.replace(/label="Timezone"/g, "label={t('timezone')}");

// PrivacySettings
content = content.replace("export function PrivacySettings() {", "export function PrivacySettings() {\n  const t = useTranslations('settings');");
content = content.replace(/"Privacy"/g, "t('title_privacy')");
content = content.replace(/"Control who can see your profile and job activity."/g, "t('desc_privacy')");
content = content.replace(/>Profile Visibility</g, ">{t('profile_visibility')}<");
content = content.replace(/everyone' \? 'registered'/g, "everyone' ? 'registered'"); // careful with regex here
// skip options mapping since they are hardcoded array strings

content = content.replace(/>Data Management</g, ">{t('data_management')}<");
content = content.replace(/>Download My Data</g, ">{t('download_data')}<");
content = content.replace(/>Export a copy of all your data</g, ">{t('download_data_desc')}<");
content = content.replace(/>Request Data Deletion</g, ">{t('delete_data')}<");
content = content.replace(/>Permanently delete your account and data</g, ">{t('delete_data_desc')}<");

// BillingSettings
content = content.replace("export function BillingSettings() {", "export function BillingSettings() {\n  const t = useTranslations('settings');");
content = content.replace(/"Billing & Plans"/g, "t('title_billing')");
content = content.replace(/"Manage your subscription and payment methods."/g, "t('desc_billing')");
content = content.replace(/>Current Plan</g, ">{t('current_plan')}<");
content = content.replace(/>Free Tier</g, ">{t('free_tier')}<");
content = content.replace(/>You are currently on the free basic plan.</g, ">{t('free_tier_desc')}<");
content = content.replace(/>\s*Upgrade Plan\s*</g, ">{t('upgrade_plan')}<");
content = content.replace(/>\s*Compare Plans\s*</g, ">{t('compare_plans')}<");

// HelpSettings
content = content.replace("export function HelpSettings() {", "export function HelpSettings() {\n  const t = useTranslations('settings');");
content = content.replace(/>Help & Support</g, ">{t('title_help')}<");
content = content.replace(/>Get help with your account or report an issue.</g, ">{t('desc_help')}<");
content = content.replace(/>Help Center</g, ">{t('help_center')}<");
content = content.replace(/>Find answers to common questions and guides.</g, ">{t('help_center_desc')}<");
content = content.replace(/Visit Help Center/g, "{t('visit_help')}");
content = content.replace(/>Contact Support</g, ">{t('contact_support')}<");
content = content.replace(/>Need help\? Contact our support team directly.</g, ">{t('contact_support_desc')}<");
content = content.replace(/Contact Us/g, "{t('contact_us')}");

// DangerZone
content = content.replace("export function DangerZone({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {", "export function DangerZone({ showToast }: { showToast: (t: 'success'|'error', m: string) => void }) {\n  const t = useTranslations('settings');");
content = content.replace(/>Danger Zone</g, ">{t('title_danger')}<");
content = content.replace(/>Irreversible and destructive actions.</g, ">{t('desc_danger')}<");
content = content.replace(/>Sign Out</g, ">{t('sign_out_title')}<");
content = content.replace(/>Log out of your account on this device.</g, ">{t('sign_out_desc')}<");
content = content.replace(/>Delete Account</g, ">{t('delete_account_title')}<");
content = content.replace(/>Deleting your account is permanent. Your profile and data will be removed.</g, ">{t('delete_account_desc')}<");
content = content.replace(/>\s*Delete account\?\s*</g, ">{t('delete_confirm_title')}<");
content = content.replace(/>\s*This action is permanent and cannot be undone. All your data, profile information, and settings will be completely wiped from our servers.\s*</g, ">{t('delete_confirm_desc')}<");
content = content.replace(/>\s*Yes, Delete\s*</g, ">{t('yes_delete')}<");

fs.writeFileSync(formsPath, content);
