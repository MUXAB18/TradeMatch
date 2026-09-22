import json
import os

langs = {
    'en': {
        "job_detail": {
            "back_to_jobs": "Back to Jobs",
            "share_job": "Share job",
            "save_job": "Save Job",
            "unsave_job": "Unsave job",
            "about_role": "About the Role",
            "required_skills": "Required Skills",
            "required_certs": "Required Certifications",
            "match_profile": "{score}% Match with your profile",
            "job_summary": "Job Summary",
            "location": "Location",
            "job_type": "Job Type",
            "salary": "Salary",
            "date_posted": "Date Posted",
            "applied": "Applied",
            "apply_now": "Apply Now"
        }
    },
    'ur': {
        "job_detail": {
            "back_to_jobs": "نوکریوں پر واپس جائیں",
            "share_job": "نوکری شیئر کریں",
            "save_job": "نوکری محفوظ کریں",
            "unsave_job": "نوکری غیر محفوظ کریں",
            "about_role": "کردار کے بارے میں",
            "required_skills": "مطلوبہ مہارتیں",
            "required_certs": "مطلوبہ سرٹیفیکیشن",
            "match_profile": "آپ کی پروفائل کے ساتھ {score}% مماثلت",
            "job_summary": "نوکری کا خلاصہ",
            "location": "مقام",
            "job_type": "نوکری کی قسم",
            "salary": "تنخواہ",
            "date_posted": "پوسٹ کرنے کی تاریخ",
            "applied": "درخواست دے دی گئی",
            "apply_now": "ابھی درخواست دیں"
        }
    },
    'hi': {
        "job_detail": {
            "back_to_jobs": "नौकरियों पर वापस जाएं",
            "share_job": "नौकरी साझा करें",
            "save_job": "नौकरी सहेजें",
            "unsave_job": "नौकरी असहेजें",
            "about_role": "भूमिका के बारे में",
            "required_skills": "आवश्यक कौशल",
            "required_certs": "आवश्यक प्रमाणपत्र",
            "match_profile": "आपकी प्रोफ़ाइल के साथ {score}% मेल",
            "job_summary": "नौकरी का सारांश",
            "location": "स्थान",
            "job_type": "नौकरी का प्रकार",
            "salary": "वेतन",
            "date_posted": "पोस्ट करने की तिथि",
            "applied": "आवेदन किया गया",
            "apply_now": "अभी आवेदन करें"
        }
    },
    'ar': {
        "job_detail": {
            "back_to_jobs": "العودة إلى الوظائف",
            "share_job": "مشاركة الوظيفة",
            "save_job": "حفظ الوظيفة",
            "unsave_job": "إلغاء حفظ الوظيفة",
            "about_role": "حول الدور",
            "required_skills": "المهارات المطلوبة",
            "required_certs": "الشهادات المطلوبة",
            "match_profile": "تطابق {score}% مع ملفك الشخصي",
            "job_summary": "ملخص الوظيفة",
            "location": "الموقع",
            "job_type": "نوع الوظيفة",
            "salary": "الراتب",
            "date_posted": "تاريخ النشر",
            "applied": "تم التقديم",
            "apply_now": "قدم الآن"
        }
    }
}

messages_dir = 'apps/web/messages'
for lang, data in langs.items():
    file_path = os.path.join(messages_dir, f"{lang}.json")
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    else:
        existing = {}
        
    if "job_detail" not in existing:
        existing["job_detail"] = {}
    existing["job_detail"].update(data["job_detail"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated job detail translations.")
