import json
import os

langs = {
    'en': {
        "landing": {
            "login": "Log In",
            "signup": "Sign Up",
            "hero_title": "The AI-Assisted Job Copilot for",
            "hero_highlight": "Skilled Trades",
            "hero_desc": "Build a professional profile in minutes, track your required certifications, and get matched with real jobs from top staffing agencies.",
            "get_started": "Get Started Free",
            "feature1_title": "Professional CV Builder",
            "feature1_desc": "No design skills needed. Just answer a few questions and generate a polished, agency-ready profile.",
            "feature2_title": "Certification Tracking",
            "feature2_desc": "Know exactly what licenses are required for your trade and country. Track what you have and what you're missing.",
            "feature3_title": "Smart Job Matching",
            "feature3_desc": "Get ranked job matches based on your specific skills, experience, and proximity.",
            "coming_soon": "COMING SOON",
            "app_title1": "Take TradeMatch",
            "app_title2": "wherever you go.",
            "app_desc": "Your professional profile, job matches, and certifications right in your pocket. Built for the modern tradesperson.",
            "download_app_store": "Download on the",
            "app_store": "App Store",
            "get_on_google": "Get it on",
            "google_play": "Google Play",
            "copyright": "© {year} TradeMatch. All rights reserved."
        }
    },
    'ur': {
        "landing": {
            "login": "لاگ ان",
            "signup": "سائن اپ",
            "hero_title": "اسکلڈ ٹریڈز کے لیے اے آئی سے لیس",
            "hero_highlight": "جاب کوپائلٹ",
            "hero_desc": "منٹوں میں ایک پیشہ ورانہ پروفائل بنائیں، اپنے مطلوبہ سرٹیفیکیشنز کو ٹریک کریں، اور ٹاپ اسٹافنگ ایجنسیوں سے حقیقی ملازمتیں حاصل کریں۔",
            "get_started": "مفت شروع کریں",
            "feature1_title": "پروفیشنل سی وی بلڈر",
            "feature1_desc": "ڈیزائن کی مہارت کی کوئی ضرورت نہیں۔ بس چند سوالات کے جواب دیں اور ایک شاندار پروفائل بنائیں۔",
            "feature2_title": "سرٹیفیکیشن ٹریکنگ",
            "feature2_desc": "جانیں کہ آپ کے پیشے اور ملک کے لیے کون سے لائسنس درکار ہیں۔ جو آپ کے پاس ہے اور جس کی کمی ہے اس پر نظر رکھیں۔",
            "feature3_title": "سمارٹ جاب میچنگ",
            "feature3_desc": "اپنی مخصوص مہارتوں، تجربے اور قربت کی بنیاد پر درجہ بند ملازمتیں حاصل کریں۔",
            "coming_soon": "بہت جلد آرہا ہے",
            "app_title1": "TradeMatch کو",
            "app_title2": "جہاں چاہیں لے جائیں۔",
            "app_desc": "آپ کی پروفائل، جاب میچز اور سرٹیفیکیشن اب آپ کی جیب میں۔ جدید ہنرمندوں کے لیے تیار کردہ۔",
            "download_app_store": "ڈاؤن لوڈ کریں",
            "app_store": "ایپ اسٹور",
            "get_on_google": "حاصل کریں",
            "google_play": "گوگل پلے",
            "copyright": "© {year} TradeMatch۔ جملہ حقوق محفوظ ہیں۔"
        }
    },
    'hi': {
        "landing": {
            "login": "लॉग इन",
            "signup": "साइन अप",
            "hero_title": "कुशल पेशेवरों के लिए AI-संचालित",
            "hero_highlight": "जॉब कोपायलट",
            "hero_desc": "मिनटों में एक पेशेवर प्रोफ़ाइल बनाएं, अपने आवश्यक प्रमाणपत्रों को ट्रैक करें, और शीर्ष स्टाफिंग एजेंसियों से वास्तविक नौकरियां प्राप्त करें।",
            "get_started": "मुफ़्त में शुरू करें",
            "feature1_title": "प्रोफेशनल सीवी बिल्डर",
            "feature1_desc": "डिज़ाइन कौशल की आवश्यकता नहीं। बस कुछ सवालों के जवाब दें और एक शानदार प्रोफ़ाइल बनाएं।",
            "feature2_title": "सर्टिफिकेशन ट्रैकिंग",
            "feature2_desc": "जानें कि आपके पेशे और देश के लिए कौन से लाइसेंस आवश्यक हैं। ट्रैक करें कि आपके पास क्या है और क्या नहीं।",
            "feature3_title": "स्मार्ट जॉब मैचिंग",
            "feature3_desc": "अपने विशिष्ट कौशल, अनुभव और निकटता के आधार पर रैंक की गई नौकरी प्राप्त करें।",
            "coming_soon": "जल्द आ रहा है",
            "app_title1": "TradeMatch को",
            "app_title2": "जहां चाहें ले जाएं।",
            "app_desc": "आपकी पेशेवर प्रोफ़ाइल, जॉब मैच और प्रमाणपत्र आपकी जेब में। आधुनिक पेशेवरों के लिए निर्मित।",
            "download_app_store": "ऐप स्टोर से",
            "app_store": "डाउनलोड करें",
            "get_on_google": "गूगल प्ले से",
            "google_play": "प्राप्त करें",
            "copyright": "© {year} TradeMatch. सभी अधिकार सुरक्षित।"
        }
    },
    'ar': {
        "landing": {
            "login": "تسجيل الدخول",
            "signup": "اشتراك",
            "hero_title": "مساعد الوظائف المدعوم بالذكاء الاصطناعي",
            "hero_highlight": "للمهن الحرفية",
            "hero_desc": "أنشئ ملفاً مهنياً في دقائق، وتتبع شهاداتك المطلوبة، واحصل على وظائف حقيقية من أفضل وكالات التوظيف.",
            "get_started": "ابدأ مجانًا",
            "feature1_title": "منشئ السير الذاتية الاحترافي",
            "feature1_desc": "لا حاجة لمهارات التصميم. أجب على بضعة أسئلة وأنشئ ملفاً احترافياً.",
            "feature2_title": "تتبع الشهادات",
            "feature2_desc": "تعرف على التراخيص المطلوبة لمهنتك وبلدك. تتبع ما تملكه وما ينقصك.",
            "feature3_title": "مطابقة الوظائف الذكية",
            "feature3_desc": "احصل على وظائف بناءً على مهاراتك وخبرتك.",
            "coming_soon": "قريباً",
            "app_title1": "خذ TradeMatch",
            "app_title2": "أينما ذهبت.",
            "app_desc": "ملفك المهني، ووظائفك، وشهاداتك في جيبك.",
            "download_app_store": "حمل من",
            "app_store": "App Store",
            "get_on_google": "احصل عليه من",
            "google_play": "Google Play",
            "copyright": "© {year} TradeMatch. جميع الحقوق محفوظة."
        }
    }
}

messages_dir = 'apps/web/messages'
for lang, data in langs.items():
    file_path = os.path.join(messages_dir, f"{lang}.json")
    
    # Read existing
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            existing = json.load(f)
    else:
        existing = {}
        
    # Update
    existing.update(data)
    
    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated translation files successfully.")
