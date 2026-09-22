import json
import os

langs = {
    'en': {
        "common": {
            "save": "Save Changes",
            "saving": "Saving...",
            "cancel": "Cancel",
            "edit": "Edit",
            "delete": "Delete",
            "signout": "Sign Out",
            "coming_soon": "Coming Soon"
        },
        "sidebar": {
            "dashboard": "Dashboard",
            "jobs": "Find Jobs",
            "applications": "My Applications",
            "certifications": "Certifications",
            "messages": "Messages",
            "profile": "Profile",
            "settings": "Settings",
            "help": "Help & Support"
        },
        "auth": {
            "login_title": "Welcome back",
            "login_subtitle": "Enter your details to access your account",
            "email": "Email Address",
            "password": "Password",
            "login_btn": "Log In",
            "no_account": "Don't have an account?",
            "signup_link": "Sign up",
            "signup_title": "Create an account",
            "signup_subtitle": "Join thousands of tradespeople finding work.",
            "name": "Full Name",
            "signup_btn": "Sign Up",
            "has_account": "Already have an account?",
            "login_link": "Log in"
        }
    },
    'ur': {
        "common": {
            "save": "تبدیلیاں محفوظ کریں",
            "saving": "محفوظ ہو رہا ہے...",
            "cancel": "منسوخ کریں",
            "edit": "ترمیم",
            "delete": "حذف کریں",
            "signout": "سائن آؤٹ",
            "coming_soon": "بہت جلد"
        },
        "sidebar": {
            "dashboard": "ڈیش بورڈ",
            "jobs": "نوکریاں تلاش کریں",
            "applications": "میری درخواستیں",
            "certifications": "سرٹیفیکیشنز",
            "messages": "پیغامات",
            "profile": "پروفائل",
            "settings": "سیٹنگز",
            "help": "مدد اور سپورٹ"
        },
        "auth": {
            "login_title": "خوش آمدید",
            "login_subtitle": "اپنے اکاؤنٹ تک رسائی کے لیے تفصیلات درج کریں",
            "email": "ای میل ایڈریس",
            "password": "پاس ورڈ",
            "login_btn": "لاگ ان",
            "no_account": "کیا آپ کا اکاؤنٹ نہیں ہے؟",
            "signup_link": "سائن اپ کریں",
            "signup_title": "اکاؤنٹ بنائیں",
            "signup_subtitle": "ہزاروں ہنرمندوں میں شامل ہوں جو کام تلاش کر رہے ہیں۔",
            "name": "پورا نام",
            "signup_btn": "سائن اپ",
            "has_account": "کیا آپ کا پہلے سے اکاؤنٹ ہے؟",
            "login_link": "لاگ ان کریں"
        }
    },
    'hi': {
        "common": {
            "save": "परिवर्तन सहेजें",
            "saving": "सहेजा जा रहा है...",
            "cancel": "रद्द करें",
            "edit": "संपादित करें",
            "delete": "हटाएं",
            "signout": "साइन आउट",
            "coming_soon": "जल्द आ रहा है"
        },
        "sidebar": {
            "dashboard": "डैशबोर्ड",
            "jobs": "नौकरियां खोजें",
            "applications": "मेरी एप्लिकेशन",
            "certifications": "प्रमाणपत्र",
            "messages": "संदेश",
            "profile": "प्रोफ़ाइल",
            "settings": "सेटिंग्स",
            "help": "मदद और सहायता"
        },
        "auth": {
            "login_title": "वापसी पर स्वागत है",
            "login_subtitle": "अपने खाते तक पहुंचने के लिए विवरण दर्ज करें",
            "email": "ईमेल पता",
            "password": "पासवर्ड",
            "login_btn": "लॉग इन",
            "no_account": "क्या आपके पास खाता नहीं है?",
            "signup_link": "साइन अप करें",
            "signup_title": "खाता बनाएं",
            "signup_subtitle": "काम खोजने वाले हजारों पेशेवरों से जुड़ें।",
            "name": "पूरा नाम",
            "signup_btn": "साइन अप",
            "has_account": "क्या आपके पास पहले से खाता है?",
            "login_link": "लॉग इन करें"
        }
    },
    'ar': {
        "common": {
            "save": "حفظ التغييرات",
            "saving": "جاري الحفظ...",
            "cancel": "إلغاء",
            "edit": "تعديل",
            "delete": "حذف",
            "signout": "تسجيل الخروج",
            "coming_soon": "قريباً"
        },
        "sidebar": {
            "dashboard": "لوحة القيادة",
            "jobs": "البحث عن وظائف",
            "applications": "طلباتي",
            "certifications": "الشهادات",
            "messages": "الرسائل",
            "profile": "الملف الشخصي",
            "settings": "الإعدادات",
            "help": "المساعدة والدعم"
        },
        "auth": {
            "login_title": "مرحباً بعودتك",
            "login_subtitle": "أدخل بياناتك للوصول إلى حسابك",
            "email": "البريد الإلكتروني",
            "password": "كلمة المرور",
            "login_btn": "تسجيل الدخول",
            "no_account": "ليس لديك حساب؟",
            "signup_link": "اشتراك",
            "signup_title": "إنشاء حساب",
            "signup_subtitle": "انضم إلى الآلاف من الحرفيين الذين يبحثون عن عمل.",
            "name": "الاسم الكامل",
            "signup_btn": "اشتراك",
            "has_account": "هل لديك حساب بالفعل؟",
            "login_link": "تسجيل الدخول"
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
        
    existing.update(data)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated more translations.")
