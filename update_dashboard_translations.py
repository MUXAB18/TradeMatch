import json
import os

langs = {
    'en': {
        "dashboard": {
            "greeting": "Hello",
            "ready_next_job": "Ready for your next job?",
            "safety_tip_title": "Safety Tip",
            "read_full_guide": "Read our full safety guide",
            "ai_prep_title": "AI Interview Prep",
            "new_badge": "New",
            "ai_prep_desc": "Practice trade-specific interview questions with our advanced AI. Get instant personalized feedback to boost your confidence and land the job.",
            "start_practice": "Start Practice Session",
            "your_applications": "Your Applications",
            "track_status": "Track your job application status",
            "view_all": "View all",
            "jobs_for_you": "Jobs for you",
            "based_on_profile": "Based on your profile and preferences",
            "no_jobs_title": "No matching jobs yet",
            "no_jobs_desc": "We need a bit more information about your skills and experience to find the best opportunities for you.",
            "complete_profile": "Complete your profile",
            "view_all_jobs": "View all jobs",
            "application_received": "Application Received",
            "under_review": "Under Review",
            "interviewing": "Interviewing",
            "offer_extended": "Offer Extended"
        }
    },
    'ur': {
        "dashboard": {
            "greeting": "ہیلو",
            "ready_next_job": "کیا آپ اپنی اگلی نوکری کے لیے تیار ہیں؟",
            "safety_tip_title": "حفاظتی مشورہ",
            "read_full_guide": "ہماری مکمل حفاظتی گائیڈ پڑھیں",
            "ai_prep_title": "اے آئی انٹرویو کی تیاری",
            "new_badge": "نیا",
            "ai_prep_desc": "ہمارے جدید اے آئی کے ساتھ اپنے پیشے سے متعلق انٹرویو کے سوالات کی مشق کریں۔ اپنا اعتماد بڑھانے اور نوکری حاصل کرنے کے لیے فوری ذاتی رائے حاصل کریں۔",
            "start_practice": "مشق شروع کریں",
            "your_applications": "آپ کی درخواستیں",
            "track_status": "اپنی نوکری کی درخواست کی حیثیت کا پتہ لگائیں",
            "view_all": "سب دیکھیں",
            "jobs_for_you": "آپ کے لیے نوکریاں",
            "based_on_profile": "آپ کی پروفائل اور ترجیحات کی بنیاد پر",
            "no_jobs_title": "ابھی تک کوئی مماثل نوکری نہیں",
            "no_jobs_desc": "آپ کے لیے بہترین مواقع تلاش کرنے کے لیے ہمیں آپ کی مہارتوں اور تجربے کے بارے میں تھوڑی مزید معلومات درکار ہیں۔",
            "complete_profile": "اپنی پروفائل مکمل کریں",
            "view_all_jobs": "تمام نوکریاں دیکھیں",
            "application_received": "درخواست موصول ہو گئی",
            "under_review": "زیر جائزہ",
            "interviewing": "انٹرویو ہو رہا ہے",
            "offer_extended": "پیشکش کی گئی"
        }
    },
    'hi': {
        "dashboard": {
            "greeting": "नमस्ते",
            "ready_next_job": "क्या आप अपनी अगली नौकरी के लिए तैयार हैं?",
            "safety_tip_title": "सुरक्षा टिप",
            "read_full_guide": "हमारी पूरी सुरक्षा गाइड पढ़ें",
            "ai_prep_title": "एआई साक्षात्कार तैयारी",
            "new_badge": "नया",
            "ai_prep_desc": "हमारे उन्नत एआई के साथ व्यापार-विशिष्ट साक्षात्कार प्रश्नों का अभ्यास करें। अपना आत्मविश्वास बढ़ाने और नौकरी पाने के लिए तुरंत व्यक्तिगत प्रतिक्रिया प्राप्त करें।",
            "start_practice": "अभ्यास शुरू करें",
            "your_applications": "आपके आवेदन",
            "track_status": "अपने नौकरी आवेदन की स्थिति को ट्रैक करें",
            "view_all": "सभी देखें",
            "jobs_for_you": "आपके लिए नौकरियां",
            "based_on_profile": "आपकी प्रोफ़ाइल और प्राथमिकताओं के आधार पर",
            "no_jobs_title": "अभी तक कोई मेल खाने वाली नौकरी नहीं",
            "no_jobs_desc": "आपके लिए सर्वोत्तम अवसर खोजने के लिए हमें आपके कौशल और अनुभव के बारे में थोड़ी और जानकारी चाहिए।",
            "complete_profile": "अपनी प्रोफ़ाइल पूरी करें",
            "view_all_jobs": "सभी नौकरियां देखें",
            "application_received": "आवेदन प्राप्त हुआ",
            "under_review": "समीक्षाधीन",
            "interviewing": "साक्षात्कार हो रहा है",
            "offer_extended": "प्रस्ताव दिया गया"
        }
    },
    'ar': {
        "dashboard": {
            "greeting": "مرحباً",
            "ready_next_job": "هل أنت مستعد لوظيفتك القادمة؟",
            "safety_tip_title": "نصيحة أمان",
            "read_full_guide": "اقرأ دليل الأمان الكامل الخاص بنا",
            "ai_prep_title": "التحضير للمقابلة بالذكاء الاصطناعي",
            "new_badge": "جديد",
            "ai_prep_desc": "تدرّب على أسئلة المقابلة الخاصة بالمهنة مع ذكائنا الاصطناعي المتقدم. احصل على ملاحظات شخصية فورية لتعزيز ثقتك بنفسك والحصول على الوظيفة.",
            "start_practice": "ابدأ جلسة التدريب",
            "your_applications": "طلباتك",
            "track_status": "تتبع حالة طلب الوظيفة الخاص بك",
            "view_all": "عرض الكل",
            "jobs_for_you": "وظائف لك",
            "based_on_profile": "بناءً على ملفك الشخصي وتفضيلاتك",
            "no_jobs_title": "لا توجد وظائف مطابقة حتى الآن",
            "no_jobs_desc": "نحتاج إلى مزيد من المعلومات حول مهاراتك وخبرتك للعثور على أفضل الفرص لك.",
            "complete_profile": "أكمل ملفك الشخصي",
            "view_all_jobs": "عرض جميع الوظائف",
            "application_received": "تم استلام الطلب",
            "under_review": "قيد المراجعة",
            "interviewing": "في مرحلة المقابلة",
            "offer_extended": "تم تقديم عرض"
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
        
    if "dashboard" not in existing:
        existing["dashboard"] = {}
    existing["dashboard"].update(data["dashboard"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated dashboard translations.")
