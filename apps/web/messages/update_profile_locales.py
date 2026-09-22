import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        "section_about": "About",
        "empty_about_title": "Professional summary",
        "empty_about_subtitle": "Tell employers about your background, interests and career goals.",
        "empty_about_action": "Add About",
        "section_experience": "Experience",
        "empty_exp_title": "Add your work experience",
        "empty_exp_subtitle": "Showcase your professional journey to employers.",
        "empty_exp_action": "Add experience",
        "section_skills": "Skills",
        "empty_skills_title": "No skills added yet",
        "empty_skills_subtitle": "Add your skills to improve job matching.",
        "empty_skills_action": "Add skills",
        "section_education": "Education",
        "empty_edu_title": "Add your education history",
        "empty_edu_subtitle": "Include your academic background to strengthen your profile.",
        "empty_edu_action": "Add education",
        "section_certifications": "Certifications",
        "empty_cert_title": "No certifications added",
        "empty_cert_subtitle": "Certifications can strengthen your professional profile.",
        "empty_cert_action": "Add certification",
        "section_projects": "Projects",
        "empty_proj_title": "Showcase your work",
        "empty_proj_subtitle": "Add projects to help employers understand your capabilities.",
        "empty_proj_action": "Add project",
        "section_resume": "Resume",
        "empty_resume_title": "Upload your resume",
        "empty_resume_subtitle": "Stand out to employers by adding your most up-to-date resume.",
        "empty_resume_action": "Upload resume",
        "resume_view": "View",
        "resume_replace": "Replace",
        "present": "Present",
        "issued": "Issued"
    },
    'ur': {
        "section_about": "میرے بارے میں",
        "empty_about_title": "پیشہ ورانہ خلاصہ",
        "empty_about_subtitle": "آجروں کو اپنے پس منظر، دلچسپیوں اور کیریئر کے اہداف کے بارے میں بتائیں۔",
        "empty_about_action": "تفصیل شامل کریں",
        "section_experience": "تجربہ",
        "empty_exp_title": "اپنا کام کا تجربہ شامل کریں",
        "empty_exp_subtitle": "آجروں کو اپنا پیشہ ورانہ سفر دکھائیں۔",
        "empty_exp_action": "تجربہ شامل کریں",
        "section_skills": "مہارتیں",
        "empty_skills_title": "ابھی تک کوئی مہارت شامل نہیں کی گئی",
        "empty_skills_subtitle": "نوکری کی مماثلت کو بہتر بنانے کے لیے اپنی مہارتیں شامل کریں۔",
        "empty_skills_action": "مہارتیں شامل کریں",
        "section_education": "تعلیم",
        "empty_edu_title": "اپنی تعلیمی تاریخ شامل کریں",
        "empty_edu_subtitle": "اپنے پروفائل کو مضبوط بنانے کے لیے اپنا تعلیمی پس منظر شامل کریں۔",
        "empty_edu_action": "تعلیم شامل کریں",
        "section_certifications": "سرٹیفیکیشنز",
        "empty_cert_title": "کوئی سرٹیفیکیشن شامل نہیں",
        "empty_cert_subtitle": "سرٹیفیکیشن آپ کے پیشہ ورانہ پروفائل کو مضبوط بنا سکتے ہیں۔",
        "empty_cert_action": "سرٹیفیکیشن شامل کریں",
        "section_projects": "پروجیکٹس",
        "empty_proj_title": "اپنے کام کی نمائش کریں",
        "empty_proj_subtitle": "آجروں کو اپنی صلاحیتوں کو سمجھنے میں مدد کے لیے پروجیکٹس شامل کریں۔",
        "empty_proj_action": "پروجیکٹ شامل کریں",
        "section_resume": "ریزیومے",
        "empty_resume_title": "اپنا ریزیومے اپ لوڈ کریں",
        "empty_resume_subtitle": "اپنا تازہ ترین ریزیومے شامل کر کے آجروں کی توجہ حاصل کریں۔",
        "empty_resume_action": "ریزیومے اپ لوڈ کریں",
        "resume_view": "دیکھیں",
        "resume_replace": "تبدیل کریں",
        "present": "موجودہ",
        "issued": "جاری شدہ"
    },
    'ar': {
        "section_about": "حول",
        "empty_about_title": "الملخص المهني",
        "empty_about_subtitle": "أخبر أصحاب العمل عن خلفيتك واهتماماتك وأهدافك المهنية.",
        "empty_about_action": "إضافة حول",
        "section_experience": "الخبرة",
        "empty_exp_title": "أضف خبرتك في العمل",
        "empty_exp_subtitle": "اعرض رحلتك المهنية لأصحاب العمل.",
        "empty_exp_action": "إضافة خبرة",
        "section_skills": "المهارات",
        "empty_skills_title": "لم يتم إضافة مهارات بعد",
        "empty_skills_subtitle": "أضف مهاراتك لتحسين مطابقة الوظائف.",
        "empty_skills_action": "إضافة مهارات",
        "section_education": "التعليم",
        "empty_edu_title": "أضف تاريخك التعليمي",
        "empty_edu_subtitle": "قم بتضمين خلفيتك الأكاديمية لتعزيز ملفك الشخصي.",
        "empty_edu_action": "إضافة تعليم",
        "section_certifications": "الشهادات",
        "empty_cert_title": "لم تتم إضافة شهادات",
        "empty_cert_subtitle": "الشهادات يمكن أن تعزز ملفك المهني.",
        "empty_cert_action": "إضافة شهادة",
        "section_projects": "المشاريع",
        "empty_proj_title": "اعرض أعمالك",
        "empty_proj_subtitle": "أضف مشاريع لمساعدة أصحاب العمل على فهم قدراتك.",
        "empty_proj_action": "إضافة مشروع",
        "section_resume": "السيرة الذاتية",
        "empty_resume_title": "قم بتحميل سيرتك الذاتية",
        "empty_resume_subtitle": "تميز لأصحاب العمل عن طريق إضافة أحدث سيرة ذاتية لك.",
        "empty_resume_action": "تحميل السيرة الذاتية",
        "resume_view": "عرض",
        "resume_replace": "استبدال",
        "present": "حاضر",
        "issued": "تاريخ الإصدار"
    }
}

for filename in os.listdir(locales_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(locales_dir, filename)
        lang = filename.split('.')[0]
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'profile' not in data:
            data['profile'] = {}
            
        updates = keys_to_add.get(lang, keys_to_add['en'])
        
        for k, v in updates.items():
            if k not in data['profile']:
                data['profile'][k] = v
                
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Locales updated.")
