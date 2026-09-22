import json
import os

langs = {
    'en': {
        "jobs": {
            "hero_title": "Find Your Next Opportunity",
            "hero_desc": "Discover jobs that match your skills, experience, and career goals.",
            "my_applications": "My Applications",
            "jobs_found": "{count} jobs found",
            "job_found": "{count} job found",
            "sort": "Sort:",
            "sort_score": "Most Relevant",
            "sort_recent": "Newest",
            "no_saved_jobs_title": "No saved jobs yet",
            "no_applications_title": "No applications yet",
            "no_jobs_title": "No jobs found",
            "no_saved_jobs_desc": "Save interesting opportunities and easily find them later.",
            "no_applications_desc": "When you apply for a job, you can track its status here.",
            "no_jobs_desc": "Try changing your search terms or adjusting your filters.",
            "explore_jobs": "Explore Jobs"
        }
    },
    'ur': {
        "jobs": {
            "hero_title": "اپنا اگلا موقع تلاش کریں",
            "hero_desc": "ایسی نوکریاں دریافت کریں جو آپ کی مہارتوں، تجربے اور کیریئر کے اہداف سے مماثل ہوں۔",
            "my_applications": "میری درخواستیں",
            "jobs_found": "{count} نوکریاں ملیں",
            "job_found": "{count} نوکری ملی",
            "sort": "ترتیب دیں:",
            "sort_score": "سب سے زیادہ متعلقہ",
            "sort_recent": "تازہ ترین",
            "no_saved_jobs_title": "ابھی تک کوئی محفوظ شدہ نوکری نہیں",
            "no_applications_title": "ابھی تک کوئی درخواست نہیں",
            "no_jobs_title": "کوئی نوکری نہیں ملی",
            "no_saved_jobs_desc": "دلچسپ مواقع محفوظ کریں اور انہیں بعد میں آسانی سے تلاش کریں۔",
            "no_applications_desc": "جب آپ کسی نوکری کے لیے درخواست دیتے ہیں، تو آپ یہاں اس کی حیثیت کو ٹریک کر سکتے ہیں۔",
            "no_jobs_desc": "اپنی تلاش کی اصطلاحات کو تبدیل کرنے یا اپنے فلٹرز کو ایڈجسٹ کرنے کی کوشش کریں۔",
            "explore_jobs": "نوکریاں دریافت کریں"
        }
    },
    'hi': {
        "jobs": {
            "hero_title": "अपना अगला अवसर खोजें",
            "hero_desc": "ऐसी नौकरियां खोजें जो आपके कौशल, अनुभव और करियर के लक्ष्यों से मेल खाती हों।",
            "my_applications": "मेरे आवेदन",
            "jobs_found": "{count} नौकरियां मिलीं",
            "job_found": "{count} नौकरी मिली",
            "sort": "क्रमबद्ध करें:",
            "sort_score": "सबसे प्रासंगिक",
            "sort_recent": "नवीनतम",
            "no_saved_jobs_title": "अभी तक कोई सहेजी गई नौकरी नहीं",
            "no_applications_title": "अभी तक कोई आवेदन नहीं",
            "no_jobs_title": "कोई नौकरी नहीं मिली",
            "no_saved_jobs_desc": "दिलचस्प अवसरों को सहेजें और बाद में उन्हें आसानी से ढूंढें।",
            "no_applications_desc": "जब आप किसी नौकरी के लिए आवेदन करते हैं, तो आप यहां उसकी स्थिति को ट्रैक कर सकते हैं।",
            "no_jobs_desc": "अपने खोज शब्दों को बदलने या अपने फ़िल्टर को समायोजित करने का प्रयास करें।",
            "explore_jobs": "नौकरियां खोजें"
        }
    },
    'ar': {
        "jobs": {
            "hero_title": "ابحث عن فرصتك القادمة",
            "hero_desc": "اكتشف الوظائف التي تتوافق مع مهاراتك وخبرتك وأهدافك المهنية.",
            "my_applications": "طلباتي",
            "jobs_found": "تم العثور على {count} وظائف",
            "job_found": "تم العثور على وظيفة {count}",
            "sort": "ترتيب:",
            "sort_score": "الأكثر صلة",
            "sort_recent": "الأحدث",
            "no_saved_jobs_title": "لا توجد وظائف محفوظة حتى الآن",
            "no_applications_title": "لا توجد طلبات حتى الآن",
            "no_jobs_title": "لم يتم العثور على وظائف",
            "no_saved_jobs_desc": "احفظ الفرص المثيرة للاهتمام واعثر عليها بسهولة لاحقاً.",
            "no_applications_desc": "عندما تتقدم بطلب للحصول على وظيفة، يمكنك تتبع حالتها هنا.",
            "no_jobs_desc": "حاول تغيير مصطلحات البحث أو ضبط عوامل التصفية الخاصة بك.",
            "explore_jobs": "استكشف الوظائف"
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
        
    if "jobs" not in existing:
        existing["jobs"] = {}
    existing["jobs"].update(data["jobs"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated jobs translations.")
