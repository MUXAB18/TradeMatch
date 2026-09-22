const fs = require('fs');
const path = require('path');

const newKeys = {
  agency: {
    dashboard_title: "Agency Dashboard",
    dashboard_welcome: "Welcome back",
    shortlisted: "Shortlisted",
    active_jobs: "Active Jobs",
    messages: "Messages",
    search_candidates: "Search Candidates",
    post_job: "Post a Job",
    recent_candidates: "Recently Verified Candidates",
    view_all: "View All",
    candidate: "Candidate",
    trade: "Trade",
    location: "Location",
    verification: "Verification",
    view_profile: "View Profile"
  }
};

['en', 'ur', 'hi', 'ar'].forEach(lang => {
  const filePath = path.join(__dirname, `apps/web/messages/${lang}.json`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch(e) {
    return;
  }
  
  if (lang === 'en') {
    data.agency = newKeys.agency;
  } else if (lang === 'ur') {
    data.agency = {
      ...newKeys.agency,
      dashboard_title: "ایجنسی ڈیش بورڈ",
      dashboard_welcome: "خوش آمدید",
      shortlisted: "شارٹ لسٹڈ",
      active_jobs: "فعال نوکریاں",
      messages: "پیغامات",
      search_candidates: "امیدوار تلاش کریں",
      post_job: "نوکری پوسٹ کریں"
    };
  } else if (lang === 'hi') {
    data.agency = {
      ...newKeys.agency,
      dashboard_title: "एजेंसी डैशबोर्ड",
      dashboard_welcome: "वापसी पर स्वागत है",
      shortlisted: "शॉर्टलिस्ट किए गए",
      active_jobs: "सक्रिय नौकरियां",
      messages: "संदेश",
      search_candidates: "उम्मीदवार खोजें",
      post_job: "नौकरी पोस्ट करें"
    };
  } else if (lang === 'ar') {
    data.agency = {
      ...newKeys.agency,
      dashboard_title: "لوحة تحكم الوكالة",
      dashboard_welcome: "مرحبًا بعودتك",
      shortlisted: "القائمة المختصرة",
      active_jobs: "وظائف نشطة",
      messages: "رسائل",
      search_candidates: "البحث عن مرشحين",
      post_job: "نشر وظيفة"
    };
  }
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
});

// Now update the agency dashboard page
const dashPath = path.join(__dirname, 'apps/web/src/app/[locale]/(app)/agency/dashboard/page.tsx');
let content = fs.readFileSync(dashPath, 'utf8');

content = content.replace("import { VerificationBadge } from '@/components/verification/VerificationBadge';", "import { VerificationBadge } from '@/components/verification/VerificationBadge';\nimport { useTranslations } from 'next-intl';");
content = content.replace("export default function AgencyDashboard() {", "export default function AgencyDashboard() {\n  const t = useTranslations('agency');");

content = content.replace(/>Agency Dashboard</g, ">{t('dashboard_title')}<");
content = content.replace(/Welcome back/g, "{t('dashboard_welcome')}");
content = content.replace(/>Shortlisted</g, ">{t('shortlisted')}<");
content = content.replace(/>Active Jobs</g, ">{t('active_jobs')}<");
content = content.replace(/>Messages</g, ">{t('messages')}<");
content = content.replace(/Search Candidates/g, "{t('search_candidates')}");
content = content.replace(/Post a Job/g, "{t('post_job')}");
content = content.replace(/>Recently Verified Candidates</g, ">{t('recent_candidates')}<");
content = content.replace(/>View All</g, ">{t('view_all')}<");
content = content.replace(/>Candidate</g, ">{t('candidate')}<");
content = content.replace(/>Trade</g, ">{t('trade')}<");
content = content.replace(/>Location</g, ">{t('location')}<");
content = content.replace(/>Verification</g, ">{t('verification')}<");
content = content.replace(/View Profile/g, "{t('view_profile')}");

fs.writeFileSync(dashPath, content);
