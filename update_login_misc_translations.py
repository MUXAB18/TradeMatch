import json
import os

langs = {
    'en': {
        "auth": {
            "for_professionals": "For Professionals",
            "hero_title_1": "Build your",
            "hero_title_2": "professional",
            "hero_title_3": "reputation.",
            "hero_desc": "Join the elite network for skilled trades. Match with verified employers, manage your certifications, and take control of your career.",
            "trusted_by": "Trusted by 10,000+ professionals",
            "or_continue_with": "Or continue with",
            "google": "Google",
            "phone_number": "Phone Number",
            "email_pass": "Email & Password",
            "forgot_password": "Forgot Password?",
            "processing": "Processing...",
            "send_code": "Send Code"
        }
    },
    'ur': {
        "auth": {
            "for_professionals": "پیشہ ور افراد کے لیے",
            "hero_title_1": "اپنی",
            "hero_title_2": "پیشہ ورانہ",
            "hero_title_3": "ساکھ بنائیں۔",
            "hero_desc": "ہنرمندوں کے ایلیٹ نیٹ ورک میں شامل ہوں۔ تصدیق شدہ آجروں سے ملیں، اپنے سرٹیفیکیشنز کا نظم کریں، اور اپنے کیریئر کا کنٹرول سنبھالیں۔",
            "trusted_by": "10,000+ پیشہ ور افراد کا اعتماد",
            "or_continue_with": "یا اس کے ساتھ جاری رکھیں",
            "google": "گوگل (Google)",
            "phone_number": "فون نمبر",
            "email_pass": "ای میل اور پاس ورڈ",
            "forgot_password": "پاس ورڈ بھول گئے؟",
            "processing": "کارروائی ہو رہی ہے...",
            "send_code": "کوڈ بھیجیں"
        }
    },
    'hi': {
        "auth": {
            "for_professionals": "पेशेवरों के लिए",
            "hero_title_1": "अपनी",
            "hero_title_2": "पेशेवर",
            "hero_title_3": "प्रतिष्ठा बनाएं।",
            "hero_desc": "कुशल ट्रेडों के लिए एलीट नेटवर्क से जुड़ें। सत्यापित नियोक्ताओं के साथ मिलान करें, अपने प्रमाणपत्रों का प्रबंधन करें, और अपने करियर पर नियंत्रण रखें।",
            "trusted_by": "10,000+ पेशेवरों द्वारा विश्वसनीय",
            "or_continue_with": "या इसके साथ जारी रखें",
            "google": "गूगल (Google)",
            "phone_number": "फ़ोन नंबर",
            "email_pass": "ईमेल और पासवर्ड",
            "forgot_password": "पासवर्ड भूल गए?",
            "processing": "प्रसंस्करण हो रहा है...",
            "send_code": "कोड भेजें"
        }
    },
    'ar': {
        "auth": {
            "for_professionals": "للمحترفين",
            "hero_title_1": "ابنِ",
            "hero_title_2": "سمعتك",
            "hero_title_3": "المهنية.",
            "hero_desc": "انضم إلى شبكة النخبة للحرف الماهرة. تواصل مع أصحاب العمل المعتمدين، وأدر شهاداتك، وتحكم في مسيرتك المهنية.",
            "trusted_by": "موثوق به من قبل أكثر من 10,000 محترف",
            "or_continue_with": "أو المتابعة باستخدام",
            "google": "جوجل (Google)",
            "phone_number": "رقم الهاتف",
            "email_pass": "البريد الإلكتروني وكلمة المرور",
            "forgot_password": "هل نسيت كلمة المرور؟",
            "processing": "جاري المعالجة...",
            "send_code": "إرسال الرمز"
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
        
    if "auth" not in existing:
        existing["auth"] = {}
    existing["auth"].update(data["auth"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated login misc translations.")
