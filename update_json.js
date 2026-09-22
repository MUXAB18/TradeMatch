const fs = require('fs');
const path = require('path');

const newKeys = {
  settings: {
    title_profile: "Profile Settings",
    desc_profile: "Manage your personal information and how others see you.",
    change_photo: "Change photo",
    photo_hint: "JPG, GIF or PNG. Max size of 5MB.",
    first_name: "First Name",
    last_name: "Last Name",
    bio: "Bio",
    bio_placeholder: "Write a short bio about your professional experience...",
    title_account: "Account Information",
    desc_account: "View and manage your core account details.",
    email: "Email Address",
    phone: "Phone Number",
    no_email: "No email linked",
    no_phone: "Not provided",
    account_details: "Account Details",
    account_id: "Account ID",
    account_created: "Account Created",
    account_type: "Account Type",
    title_notifications: "Notification Preferences",
    desc_notifications: "Control what alerts you receive and how you receive them.",
    email_notifications: "Email Notifications",
    job_recs: "Job recommendations",
    job_recs_desc: "Receive notifications about jobs matching your interests.",
    cert_reminders: "Certification Reminders",
    cert_reminders_desc: "Get alerted before your certs expire.",
    messages: "Messages",
    messages_desc: "Alerts for new chat messages from employers.",
    title_appearance: "Appearance",
    desc_appearance: "Customize how TradeMatch looks on this device.",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    title_language: "Language & Region",
    desc_language: "Manage your locale settings.",
    language: "Language",
    region: "Region",
    timezone: "Timezone",
    title_privacy: "Privacy",
    desc_privacy: "Control who can see your profile and job activity.",
    profile_visibility: "Profile Visibility",
    opt_everyone: "Everyone",
    opt_registered: "Registered users",
    opt_only_me: "Only me",
    data_management: "Data Management",
    download_data: "Download My Data",
    download_data_desc: "Export a copy of all your data",
    delete_data: "Request Data Deletion",
    delete_data_desc: "Permanently delete your account and data",
    title_billing: "Billing & Plans",
    desc_billing: "Manage your subscription and payment methods.",
    current_plan: "Current Plan",
    free_tier: "Free Tier",
    free_tier_desc: "You are currently on the free basic plan.",
    upgrade_plan: "Upgrade Plan",
    compare_plans: "Compare Plans",
    title_help: "Help & Support",
    desc_help: "Get help with your account or report an issue.",
    help_center: "Help Center",
    help_center_desc: "Find answers to common questions and guides.",
    visit_help: "Visit Help Center",
    contact_support: "Contact Support",
    contact_support_desc: "Need help? Contact our support team directly.",
    contact_us: "Contact Us",
    title_danger: "Danger Zone",
    desc_danger: "Irreversible and destructive actions.",
    sign_out_title: "Sign Out",
    sign_out_desc: "Log out of your account on this device.",
    delete_account_title: "Delete Account",
    delete_account_desc: "Deleting your account is permanent. Your profile and data will be removed.",
    delete_confirm_title: "Delete account?",
    delete_confirm_desc: "This action is permanent and cannot be undone. All your data, profile information, and settings will be completely wiped from our servers.",
    yes_delete: "Yes, Delete",
    success_email_phone: "updated successfully",
    failed_update: "Failed to update",
    success_preferences: "Preferences updated",
    demo_delete_error: "Demo account cannot be deleted."
  },
  applications: {
    title: "My Applications",
    subtitle: "Track the status of your job applications.",
    application_received: "Application Received",
    under_review: "Under Review",
    interviewing: "Interviewing",
    offer_extended: "Offer Extended",
    rejected: "Rejected",
    all: "All",
    active: "Active",
    past: "Past",
    no_applications: "No applications found.",
    no_applications_desc: "You haven't applied to any jobs yet.",
    view_job: "View Job",
    withdraw: "Withdraw",
    applied_on: "Applied on",
    status: "Status"
  }
};

const urduSettings = {
  ...newKeys.settings,
  title_profile: "پروفائل کی ترتیبات",
  desc_profile: "اپنی ذاتی معلومات کا نظم کریں۔",
  title_account: "اکاؤنٹ کی معلومات",
  desc_account: "اپنے اکاؤنٹ کی تفصیلات دیکھیں۔",
  email: "ای میل ایڈریس",
  phone: "فون نمبر",
  title_notifications: "اطلاعات کی ترجیحات",
  title_appearance: "ظاہری شکل",
  theme: "تھیم",
  light: "ہلکا",
  dark: "گہرا",
  title_language: "زبان اور علاقہ",
  language: "زبان",
  title_privacy: "پرائیویسی",
  title_billing: "بلنگ اور منصوبے",
  title_help: "مدد اور معاونت",
  title_danger: "خطرناک علاقہ",
  sign_out_title: "لاگ آؤٹ",
  delete_account_title: "اکاؤنٹ حذف کریں"
};

const urduApplications = {
  ...newKeys.applications,
  title: "میری درخواستیں",
  subtitle: "اپنی درخواستوں کی صورتحال چیک کریں۔",
  status: "صورتحال",
  applied_on: "درخواست کی تاریخ",
  view_job: "نوکری دیکھیں"
};

const hindiSettings = {
  ...newKeys.settings,
  title_profile: "प्रोफाइल सेटिंग्स",
  title_account: "खाता जानकारी",
  email: "ईमेल पता",
  phone: "फ़ोन नंबर",
  title_notifications: "सूचना प्राथमिकताएँ",
  title_appearance: "दिखावट",
  theme: "थीम",
  title_language: "भाषा और क्षेत्र",
  language: "भाषा",
  title_privacy: "गोपनीयता",
  title_billing: "बिलिंग",
  title_help: "मदद",
  title_danger: "खतरे का क्षेत्र",
  sign_out_title: "साइन आउट",
  delete_account_title: "खाता हटाएं"
};

const hindiApplications = {
  ...newKeys.applications,
  title: "मेरे आवेदन",
  subtitle: "अपने नौकरी आवेदनों की स्थिति ट्रैक करें।",
  status: "स्थिति",
  applied_on: "आवेदन किया गया",
  view_job: "नौकरी देखें"
};

const arabicSettings = {
  ...newKeys.settings,
  title_profile: "إعدادات الملف الشخصي",
  title_account: "معلومات الحساب",
  email: "البريد الإلكتروني",
  phone: "رقم الهاتف",
  title_notifications: "الإشعارات",
  title_appearance: "المظهر",
  theme: "السمة",
  title_language: "اللغة والمنطقة",
  language: "اللغة",
  title_privacy: "الخصوصية",
  title_billing: "الفواتير",
  title_help: "المساعدة والدعم",
  title_danger: "منطقة الخطر",
  sign_out_title: "تسجيل الخروج",
  delete_account_title: "حذف الحساب"
};

const arabicApplications = {
  ...newKeys.applications,
  title: "طلباتي",
  subtitle: "تتبع حالة طلبات العمل الخاصة بك.",
  status: "الحالة",
  applied_on: "تم التقديم في",
  view_job: "عرض الوظيفة"
};

['en', 'ur', 'hi', 'ar'].forEach(lang => {
  const filePath = path.join(__dirname, `apps/web/messages/${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  if (lang === 'en') {
    data.settings = newKeys.settings;
    data.applications = newKeys.applications;
  } else if (lang === 'ur') {
    data.settings = urduSettings;
    data.applications = urduApplications;
  } else if (lang === 'hi') {
    data.settings = hindiSettings;
    data.applications = hindiApplications;
  } else if (lang === 'ar') {
    data.settings = arabicSettings;
    data.applications = arabicApplications;
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});
