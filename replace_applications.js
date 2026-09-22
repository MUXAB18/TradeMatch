const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'apps/web/src/app/[locale]/(app)/applications/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace("import { MockJob } from '@/lib/mockData';", "import { MockJob } from '@/lib/mockData';\nimport { useTranslations } from 'next-intl';");

content = content.replace(/const STATUS_STEPS = \['Applied', 'Under Review', 'Interview', 'Decision'\];/g, "const getStatusSteps = (t: any) => [t('application_received'), t('under_review'), t('interviewing'), t('offer_extended')];");

content = content.replace(/function ApplicationCard\({ job }: { job: MockJob }\) {/g, "function ApplicationCard({ job, t }: { job: MockJob, t: any }) {\n  const STATUS_STEPS = getStatusSteps(t);");

content = content.replace(/function StatsBar\({ jobs }: { jobs: MockJob\[\] }\) {/g, "function StatsBar({ jobs, t }: { jobs: MockJob[], t: any }) {");
content = content.replace(/const labels = \['Applied', 'In Review', 'Interview', 'Decision'\];/g, "const labels = [t('application_received'), t('under_review'), t('interviewing'), t('offer_extended')];");

content = content.replace(/export default function ApplicationsPage\(\) {/g, "export default function ApplicationsPage() {\n  const t = useTranslations('applications');");

// Apply t prop
content = content.replace(/<StatsBar jobs=\{appliedJobs\} \/>/g, "<StatsBar jobs={appliedJobs} t={t} />");
content = content.replace(/<ApplicationCard key=\{job.id\} job=\{job\} \/>/g, "<ApplicationCard key={job.id} job={job} t={t} />");

// Replace hardcoded strings
content = content.replace(/>Back to Jobs</g, ">{t('back_to_jobs') || 'Back to Jobs'}<");
content = content.replace(/>\s*My Applications\s*</g, ">\n              {t('title')}\n            <");
content = content.replace(/\{appliedJobs\.length > 0\n\s*\? `Tracking \$\{appliedJobs\.length\} active application\$\{appliedJobs\.length > 1 \? 's' : ''\}`\n\s*: 'Track the status of every job you apply to'\}/g, "{appliedJobs.length > 0 ? t('subtitle') : t('subtitle')}"); // simplified for now
content = content.replace(/>\s*No applications yet\s*</g, ">\n            {t('no_applications')}\n          <");
content = content.replace(/>\s*You haven&apos;t applied to any jobs yet\. Start exploring opportunities that match your skills\.\s*</g, ">\n            {t('no_applications_desc')}\n          <");
content = content.replace(/>\s*Browse Open Roles\s*</g, ">\n            {t('view_job')}\n          <"); // maybe browse jobs
content = content.replace(/Applied today/g, "{t('applied_on')} {new Date().toLocaleDateString()}");

fs.writeFileSync(filePath, content);
