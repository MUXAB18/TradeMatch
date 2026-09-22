import json
import os

langs = {
    'en': {
        "sidebar": {
            "home": "Home",
            "profile": "Profile",
            "jobs": "Jobs",
            "prep": "Prep",
            "messages": "Messages",
            "notifications": "Notifications",
            "settings": "Settings",
            "dashboard": "Dashboard",
            "candidates": "Candidates",
            "shortlisted": "Shortlisted",
            "signout": "Sign out"
        }
    },
    'ur': {
        "sidebar": {
            "home": "ہوم",
            "profile": "پروفائل",
            "jobs": "نوکریاں",
            "prep": "تیاری",
            "messages": "پیغامات",
            "notifications": "اطلاعات",
            "settings": "ترتیبات",
            "dashboard": "ڈیش بورڈ",
            "candidates": "امیدوار",
            "shortlisted": "شارٹ لسٹ",
            "signout": "سائن آؤٹ"
        }
    },
    'hi': {
        "sidebar": {
            "home": "होम",
            "profile": "प्रोफ़ाइल",
            "jobs": "नौकरियां",
            "prep": "तैयारी",
            "messages": "संदेश",
            "notifications": "सूचनाएं",
            "settings": "सेटिंग्स",
            "dashboard": "डैशबोर्ड",
            "candidates": "उम्मीदवार",
            "shortlisted": "शॉर्टलिस्ट",
            "signout": "साइन आउट"
        }
    },
    'ar': {
        "sidebar": {
            "home": "الرئيسية",
            "profile": "الملف الشخصي",
            "jobs": "وظائف",
            "prep": "التحضير",
            "messages": "الرسائل",
            "notifications": "الإشعارات",
            "settings": "الإعدادات",
            "dashboard": "لوحة القيادة",
            "candidates": "المرشحون",
            "shortlisted": "المختارون",
            "signout": "تسجيل الخروج"
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
        
    if "sidebar" not in existing:
        existing["sidebar"] = {}
    existing["sidebar"].update(data["sidebar"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated sidebar translations.")
