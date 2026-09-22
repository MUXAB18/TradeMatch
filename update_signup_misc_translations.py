import json
import os

langs = {
    'en': {
        "signup": {
            "hero_title_1": "The platform",
            "hero_title_2": "built for",
            "hero_title_3": "real trade work.",
            "hero_desc": "Workers get verified. Agencies find the right people. Faster.",
            "trusted_by": "Trusted by 10,000+ professionals",
            "agency_hero_title": "Find the right workers.\nFast.",
            "worker_hero_title": "Your skills\ndeserve the\nbest jobs.",
            "agency_hero_desc": "Search verified candidates. Stop wasting time on WhatsApp groups.",
            "worker_hero_desc": "Build a professional profile. Get noticed by top recruiters.",
            "change_account_type": "Change account type",
            "or_continue_with": "Or continue with",
            "google": "Google",
            "phone_number_btn": "Phone Number",
            "email_pass_btn": "Email & Password"
        }
    },
    'ur': {
        "signup": {
            "hero_title_1": "یہ پلیٹ فارم",
            "hero_title_2": "بنایا گیا ہے",
            "hero_title_3": "حقیقی تجارتی کام کے لیے۔",
            "hero_desc": "کارکنان کی تصدیق کی جاتی ہے۔ ایجنسیاں صحیح لوگوں کو تلاش کرتی ہیں۔ تیزی سے۔",
            "trusted_by": "10,000+ پیشہ ور افراد کا اعتماد",
            "agency_hero_title": "صحیح کارکنان تلاش کریں۔\nتیزی سے۔",
            "worker_hero_title": "آپ کی مہارتیں\nبہترین نوکریوں کی\nمستحق ہیں۔",
            "agency_hero_desc": "تصدیق شدہ امیدواروں کو تلاش کریں۔ واٹس ایپ گروپس پر وقت ضائع کرنا بند کریں۔",
            "worker_hero_desc": "ایک پیشہ ورانہ پروفائل بنائیں۔ ٹاپ ریکروٹرز کی توجہ حاصل کریں۔",
            "change_account_type": "اکاؤنٹ کی قسم تبدیل کریں",
            "or_continue_with": "یا اس کے ساتھ جاری رکھیں",
            "google": "گوگل (Google)",
            "phone_number_btn": "فون نمبر",
            "email_pass_btn": "ای میل اور پاس ورڈ"
        }
    },
    'hi': {
        "signup": {
            "hero_title_1": "यह प्लेटफॉर्म",
            "hero_title_2": "बनाया गया है",
            "hero_title_3": "वास्तविक व्यापार कार्य के लिए।",
            "hero_desc": "श्रमिकों का सत्यापन किया जाता है। एजेंसियां ​​सही लोगों को ढूंढती हैं। तेज़ी से।",
            "trusted_by": "10,000+ पेशेवरों द्वारा विश्वसनीय",
            "agency_hero_title": "सही कर्मचारी खोजें।\nतेज़ी से।",
            "worker_hero_title": "आपका कौशल\nसर्वश्रेष्ठ नौकरियों का\nहकदार है।",
            "agency_hero_desc": "सत्यापित उम्मीदवारों की खोज करें। व्हाट्सएप ग्रुप्स पर समय बर्बाद करना बंद करें।",
            "worker_hero_desc": "एक पेशेवर प्रोफ़ाइल बनाएं। शीर्ष भर्तीकर्ताओं द्वारा ध्यान दिए जाएं।",
            "change_account_type": "खाता प्रकार बदलें",
            "or_continue_with": "या इसके साथ जारी रखें",
            "google": "गूगल (Google)",
            "phone_number_btn": "फ़ोन नंबर",
            "email_pass_btn": "ईमेल और पासवर्ड"
        }
    },
    'ar': {
        "signup": {
            "hero_title_1": "المنصة",
            "hero_title_2": "المبنية من أجل",
            "hero_title_3": "العمل التجاري الحقيقي.",
            "hero_desc": "يتم التحقق من العمال. تجد الوكالات الأشخاص المناسبين. بشكل أسرع.",
            "trusted_by": "موثوق به من قبل أكثر من 10,000 محترف",
            "agency_hero_title": "ابحث عن العمال المناسبين.\nبسرعة.",
            "worker_hero_title": "مهاراتك\nتستحق\nأفضل الوظائف.",
            "agency_hero_desc": "ابحث عن المرشحين المعتمدين. توقف عن إضاعة الوقت في مجموعات واتساب.",
            "worker_hero_desc": "أنشئ ملفاً شخصياً احترافياً. احصل على اهتمام كبار مسؤولي التوظيف.",
            "change_account_type": "تغيير نوع الحساب",
            "or_continue_with": "أو المتابعة باستخدام",
            "google": "جوجل (Google)",
            "phone_number_btn": "رقم الهاتف",
            "email_pass_btn": "البريد الإلكتروني وكلمة المرور"
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
        
    if "signup" not in existing:
        existing["signup"] = {}
    existing["signup"].update(data["signup"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated signup misc translations.")
