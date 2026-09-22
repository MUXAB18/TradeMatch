import json
import os

langs = {
    'en': {
        "signup": {
            "title_role": "How will you use TradeMatch?",
            "subtitle_role": "Choose your account type to get started.",
            "worker_title": "I'm looking for work",
            "worker_desc": "Build your profile, upload certificates, and find jobs in the Gulf. Always free for workers.",
            "agency_title": "I'm hiring workers",
            "agency_desc": "Search verified skilled workers. Filter by trade, experience, and verification status.",
            "create_account": "Create your account",
            "fill_details": "Fill in your details below.",
            "phone_prompt": "Enter your phone number to get started.",
            "btn_create": "Create Account",
            "btn_sending": "Sending...",
            "btn_send_code": "Send Code",
            "phone_number": "Phone Number",
            "email_pass": "Email & Password",
            "back": "Back",
            "change_type": "Change account type",
            "already_account": "Already have an account?"
        }
    },
    'ur': {
        "signup": {
            "title_role": "آپ ٹریڈ میچ کو کس طرح استعمال کریں گے؟",
            "subtitle_role": "شروع کرنے کے لیے اپنے اکاؤنٹ کی قسم منتخب کریں۔",
            "worker_title": "میں کام تلاش کر رہا ہوں",
            "worker_desc": "اپنی پروفائل بنائیں، سرٹیفکیٹ اپ لوڈ کریں، اور خلیج میں نوکریاں تلاش کریں۔ مزدوروں کے لیے ہمیشہ مفت۔",
            "agency_title": "میں مزدوروں کو بھرتی کر رہا ہوں",
            "agency_desc": "تصدیق شدہ ہنر مند مزدوروں کو تلاش کریں۔ ٹریڈ، تجربے اور تصدیقی حیثیت کے لحاظ سے فلٹر کریں۔",
            "create_account": "اپنا اکاؤنٹ بنائیں",
            "fill_details": "نیچے اپنی تفصیلات پُر کریں۔",
            "phone_prompt": "شروع کرنے کے لیے اپنا فون نمبر درج کریں۔",
            "btn_create": "اکاؤنٹ بنائیں",
            "btn_sending": "بھیجا جا رہا ہے...",
            "btn_send_code": "کوڈ بھیجیں",
            "phone_number": "فون نمبر",
            "email_pass": "ای میل اور پاس ورڈ",
            "back": "پیچھے",
            "change_type": "اکاؤنٹ کی قسم تبدیل کریں",
            "already_account": "کیا آپ کا پہلے سے اکاؤنٹ ہے؟"
        }
    },
    'hi': {
        "signup": {
            "title_role": "आप TradeMatch का उपयोग कैसे करेंगे?",
            "subtitle_role": "आरंभ करने के लिए अपने खाते का प्रकार चुनें।",
            "worker_title": "मैं काम की तलाश में हूँ",
            "worker_desc": "अपनी प्रोफ़ाइल बनाएं, प्रमाणपत्र अपलोड करें, और खाड़ी में नौकरियां खोजें। श्रमिकों के लिए हमेशा मुफ्त।",
            "agency_title": "मैं श्रमिकों को काम पर रख रहा हूँ",
            "agency_desc": "सत्यापित कुशल श्रमिकों की खोज करें। व्यापार, अनुभव और सत्यापन स्थिति के अनुसार फ़िल्टर करें।",
            "create_account": "अपना खाता बनाएं",
            "fill_details": "नीचे अपना विवरण भरें।",
            "phone_prompt": "आरंभ करने के लिए अपना फोन नंबर दर्ज करें।",
            "btn_create": "खाता बनाएं",
            "btn_sending": "भेजा जा रहा है...",
            "btn_send_code": "कोड भेजें",
            "phone_number": "फोन नंबर",
            "email_pass": "ईमेल और पासवर्ड",
            "back": "पीछे",
            "change_type": "खाते का प्रकार बदलें",
            "already_account": "क्या आपके पास पहले से खाता है?"
        }
    },
    'ar': {
        "signup": {
            "title_role": "كيف ستستخدم TradeMatch؟",
            "subtitle_role": "اختر نوع حسابك للبدء.",
            "worker_title": "أنا أبحث عن عمل",
            "worker_desc": "أنشئ ملفك الشخصي، وحمّل شهاداتك، وابحث عن وظائف في الخليج. مجاني دائماً للعمال.",
            "agency_title": "أنا أوظف عمالاً",
            "agency_desc": "ابحث عن عمال مهرة معتمدين. قم بالتصفية حسب المهنة والخبرة وحالة الاعتماد.",
            "create_account": "إنشاء حسابك",
            "fill_details": "املأ بياناتك أدناه.",
            "phone_prompt": "أدخل رقم هاتفك للبدء.",
            "btn_create": "إنشاء حساب",
            "btn_sending": "جاري الإرسال...",
            "btn_send_code": "إرسال الرمز",
            "phone_number": "رقم الهاتف",
            "email_pass": "البريد الإلكتروني وكلمة المرور",
            "back": "رجوع",
            "change_type": "تغيير نوع الحساب",
            "already_account": "هل لديك حساب بالفعل؟"
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

print("Updated signup translations.")
