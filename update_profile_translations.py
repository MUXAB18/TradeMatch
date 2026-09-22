import json
import os

langs = {
    'en': {
        "profile": {
            "title": "Profile",
            "subtitle": "Manage your professional information and improve your job matches.",
            "success_profile": "Profile updated successfully.",
            "error_profile": "Failed to update profile.",
            "success_skills": "Skills updated successfully.",
            "error_skills": "Failed to update skills.",
            "success_cert": "Certification added.",
            "success_about": "About summary updated.",
            "success_exp": "Experience added.",
            "success_edu": "Education added.",
            "success_proj": "Project added.",
            "success_resume": "Resume uploaded successfully.",
            "error_resume": "Please upload a new resume to view it.",
            
            "edit_profile": "Edit Profile",
            "full_name": "Full Name",
            "trade": "Trade",
            "select_trade": "Select trade...",
            "location": "Location",
            "location_placeholder": "e.g. Lahore, Pakistan",
            "availability": "Availability",
            "avail_immediate": "Immediate",
            "avail_2weeks": "2 Weeks Notice",
            "avail_not": "Not Available",
            "cancel": "Cancel",
            "save_changes": "Save Changes",
            
            "edit_skills": "Edit Skills",
            "skills_label": "Skills (comma separated)",
            "skills_placeholder": "React, Next.js, TypeScript...",
            "save_skills": "Save Skills",
            
            "add_cert": "Add Certification",
            "cert_image": "Certificate Image",
            "cert_name": "Certificate Name",
            "cert_name_placeholder": "e.g. AWS Solutions Architect",
            "issuer": "Issuing Organization",
            "issuer_placeholder": "e.g. Amazon Web Services",
            "issue_date": "Issue Date",
            "desc_cred": "Description / Credential ID",
            "desc_cred_placeholder": "Describe what you learned or provide your Credential ID...",
            "save_cert": "Save Certification",
            
            "edit_about": "Edit About",
            "prof_summary": "Professional Summary",
            "prof_summary_placeholder": "Tell employers about your background...",
            "save_summary": "Save Summary",
            
            "add_exp": "Add Experience",
            "job_title": "Job Title",
            "company": "Company",
            "start_date": "Start Date",
            "end_date": "End Date",
            "current_work": "I currently work here",
            "description": "Description",
            "save_exp": "Save Experience",
            
            "add_edu": "Add Education",
            "institution": "Institution",
            "degree": "Degree",
            "degree_placeholder": "e.g. BS",
            "field_study": "Field of Study",
            "field_study_placeholder": "e.g. Software Engineering",
            "start_year": "Start Year",
            "end_year": "End Year",
            "save_edu": "Save Education",
            
            "add_proj": "Add Project",
            "proj_name": "Project Name",
            "tech": "Technologies (comma separated)",
            "tech_placeholder": "e.g. Next.js, React, Tailwind",
            "save_proj": "Save Project",
            
            "upload_resume": "Upload Resume",
            "drag_drop": "Drag and drop your resume here or click to browse",
            "supports": "Supports PDF, DOCX up to 5MB",
            "select_file": "Select File",
            "upload": "Upload"
        }
    },
    'ur': {
        "profile": {
            "title": "پروفائل",
            "subtitle": "اپنی پیشہ ورانہ معلومات کا نظم کریں اور اپنی ملازمت کے ملاپ کو بہتر بنائیں۔",
            "success_profile": "پروفائل کامیابی سے اپ ڈیٹ ہو گئی۔",
            "error_profile": "پروفائل کو اپ ڈیٹ کرنے میں ناکام۔",
            "success_skills": "مہارتیں کامیابی سے اپ ڈیٹ ہو گئیں۔",
            "error_skills": "مہارتوں کو اپ ڈیٹ کرنے میں ناکام۔",
            "success_cert": "سرٹیفیکیشن شامل کر دیا گیا۔",
            "success_about": "کے بارے میں خلاصہ اپ ڈیٹ ہو گیا۔",
            "success_exp": "تجربہ شامل کر دیا گیا۔",
            "success_edu": "تعلیم شامل کر دی گئی۔",
            "success_proj": "پروجیکٹ شامل کر دیا گیا۔",
            "success_resume": "ریزیومے کامیابی سے اپ لوڈ ہو گیا۔",
            "error_resume": "براہ کرم اسے دیکھنے کے لیے نیا ریزیومے اپ لوڈ کریں۔",
            
            "edit_profile": "پروفائل میں ترمیم کریں",
            "full_name": "پورا نام",
            "trade": "پیشہ",
            "select_trade": "پیشہ منتخب کریں...",
            "location": "مقام",
            "location_placeholder": "مثال کے طور پر لاہور، پاکستان",
            "availability": "دستیابی",
            "avail_immediate": "فوری",
            "avail_2weeks": "2 ہفتے کا نوٹس",
            "avail_not": "دستیاب نہیں",
            "cancel": "منسوخ کریں",
            "save_changes": "تبدیلیاں محفوظ کریں",
            
            "edit_skills": "مہارتوں میں ترمیم کریں",
            "skills_label": "مہارتیں (کوما سے الگ کی گئی)",
            "skills_placeholder": "React, Next.js, TypeScript...",
            "save_skills": "مہارتیں محفوظ کریں",
            
            "add_cert": "سرٹیفیکیشن شامل کریں",
            "cert_image": "سرٹیفکیٹ کی تصویر",
            "cert_name": "سرٹیفکیٹ کا نام",
            "cert_name_placeholder": "مثلاً AWS Solutions Architect",
            "issuer": "جاری کرنے والی تنظیم",
            "issuer_placeholder": "مثلاً Amazon Web Services",
            "issue_date": "جاری ہونے کی تاریخ",
            "desc_cred": "تفصیل / اسناد کی شناخت",
            "desc_cred_placeholder": "بیان کریں کہ آپ نے کیا سیکھا یا اپنی اسناد کی شناخت فراہم کریں...",
            "save_cert": "سرٹیفیکیشن محفوظ کریں",
            
            "edit_about": "کے بارے میں ترمیم کریں",
            "prof_summary": "پیشہ ورانہ خلاصہ",
            "prof_summary_placeholder": "آجروں کو اپنے پس منظر کے بارے میں بتائیں...",
            "save_summary": "خلاصہ محفوظ کریں",
            
            "add_exp": "تجربہ شامل کریں",
            "job_title": "ملازمت کا عنوان",
            "company": "کمپنی",
            "start_date": "شروع کی تاریخ",
            "end_date": "ختم ہونے کی تاریخ",
            "current_work": "میں فی الحال یہاں کام کرتا ہوں",
            "description": "تفصیل",
            "save_exp": "تجربہ محفوظ کریں",
            
            "add_edu": "تعلیم شامل کریں",
            "institution": "ادارہ",
            "degree": "ڈگری",
            "degree_placeholder": "مثلاً BS",
            "field_study": "مطالعہ کا میدان",
            "field_study_placeholder": "مثلاً سافٹ ویئر انجینئرنگ",
            "start_year": "شروع کا سال",
            "end_year": "ختم ہونے کا سال",
            "save_edu": "تعلیم محفوظ کریں",
            
            "add_proj": "پروجیکٹ شامل کریں",
            "proj_name": "پروجیکٹ کا نام",
            "tech": "ٹیکنالوجیز (کوما سے الگ کی گئی)",
            "tech_placeholder": "مثلاً Next.js, React, Tailwind",
            "save_proj": "پروجیکٹ محفوظ کریں",
            
            "upload_resume": "ریزیومے اپ لوڈ کریں",
            "drag_drop": "اپنا ریزیومے یہاں گھسیٹیں اور چھوڑیں یا براؤز کرنے کے لیے کلک کریں",
            "supports": "5MB تک PDF، DOCX کو سپورٹ کرتا ہے",
            "select_file": "فائل منتخب کریں",
            "upload": "اپ لوڈ کریں"
        }
    },
    'hi': {
        "profile": {
            "title": "प्रोफ़ाइल",
            "subtitle": "अपनी पेशेवर जानकारी प्रबंधित करें और अपने नौकरी के मिलान में सुधार करें।",
            "success_profile": "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई।",
            "error_profile": "प्रोफ़ाइल अपडेट करने में विफल।",
            "success_skills": "कौशल सफलतापूर्वक अपडेट किए गए।",
            "error_skills": "कौशल अपडेट करने में विफल।",
            "success_cert": "प्रमाणन जोड़ा गया।",
            "success_about": "के बारे में सारांश अपडेट किया गया।",
            "success_exp": "अनुभव जोड़ा गया।",
            "success_edu": "शिक्षा जोड़ी गई।",
            "success_proj": "प्रोजेक्ट जोड़ा गया।",
            "success_resume": "रेज़्यूमे सफलतापूर्वक अपलोड किया गया।",
            "error_resume": "कृपया इसे देखने के लिए एक नया रेज़्यूमे अपलोड करें।",
            
            "edit_profile": "प्रोफ़ाइल संपादित करें",
            "full_name": "पूरा नाम",
            "trade": "व्यापार",
            "select_trade": "व्यापार चुनें...",
            "location": "स्थान",
            "location_placeholder": "उदा. लाहौर, पाकिस्तान",
            "availability": "उपलब्धता",
            "avail_immediate": "तत्काल",
            "avail_2weeks": "2 सप्ताह का नोटिस",
            "avail_not": "उपलब्ध नहीं",
            "cancel": "रद्द करें",
            "save_changes": "परिवर्तन सहेजें",
            
            "edit_skills": "कौशल संपादित करें",
            "skills_label": "कौशल (अल्पविराम से अलग)",
            "skills_placeholder": "React, Next.js, TypeScript...",
            "save_skills": "कौशल सहेजें",
            
            "add_cert": "प्रमाणन जोड़ें",
            "cert_image": "प्रमाणपत्र छवि",
            "cert_name": "प्रमाणपत्र का नाम",
            "cert_name_placeholder": "उदा. AWS Solutions Architect",
            "issuer": "जारी करने वाला संगठन",
            "issuer_placeholder": "उदा. Amazon Web Services",
            "issue_date": "जारी करने की तिथि",
            "desc_cred": "विवरण / क्रेडेंशियल आईडी",
            "desc_cred_placeholder": "बताएं कि आपने क्या सीखा या अपनी क्रेडेंशियल आईडी प्रदान करें...",
            "save_cert": "प्रमाणन सहेजें",
            
            "edit_about": "के बारे में संपादित करें",
            "prof_summary": "पेशेवर सारांश",
            "prof_summary_placeholder": "नियोक्ताओं को अपनी पृष्ठभूमि के बारे में बताएं...",
            "save_summary": "सारांश सहेजें",
            
            "add_exp": "अनुभव जोड़ें",
            "job_title": "नौकरी का शीर्षक",
            "company": "कंपनी",
            "start_date": "प्रारंभ तिथि",
            "end_date": "अंतिम तिथि",
            "current_work": "मैं वर्तमान में यहाँ काम करता हूँ",
            "description": "विवरण",
            "save_exp": "अनुभव सहेजें",
            
            "add_edu": "शिक्षा जोड़ें",
            "institution": "संस्थान",
            "degree": "डिग्री",
            "degree_placeholder": "उदा. BS",
            "field_study": "अध्ययन का क्षेत्र",
            "field_study_placeholder": "उदा. सॉफ्टवेयर इंजीनियरिंग",
            "start_year": "प्रारंभ वर्ष",
            "end_year": "अंतिम वर्ष",
            "save_edu": "शिक्षा सहेजें",
            
            "add_proj": "प्रोजेक्ट जोड़ें",
            "proj_name": "प्रोजेक्ट का नाम",
            "tech": "प्रौद्योगिकियां (अल्पविराम से अलग)",
            "tech_placeholder": "उदा. Next.js, React, Tailwind",
            "save_proj": "प्रोजेक्ट सहेजें",
            
            "upload_resume": "रेज़्यूमे अपलोड करें",
            "drag_drop": "अपना रेज़्यूमे यहाँ खींचें और छोड़ें या ब्राउज़ करने के लिए क्लिक करें",
            "supports": "5MB तक PDF, DOCX का समर्थन करता है",
            "select_file": "फ़ाइल चुनें",
            "upload": "अपलोड"
        }
    },
    'ar': {
        "profile": {
            "title": "الملف الشخصي",
            "subtitle": "إدارة معلوماتك المهنية وتحسين مطابقة وظائفك.",
            "success_profile": "تم تحديث الملف الشخصي بنجاح.",
            "error_profile": "فشل في تحديث الملف الشخصي.",
            "success_skills": "تم تحديث المهارات بنجاح.",
            "error_skills": "فشل في تحديث المهارات.",
            "success_cert": "تمت إضافة الشهادة.",
            "success_about": "تم تحديث ملخص حول.",
            "success_exp": "تمت إضافة الخبرة.",
            "success_edu": "تمت إضافة التعليم.",
            "success_proj": "تمت إضافة المشروع.",
            "success_resume": "تم تحميل السيرة الذاتية بنجاح.",
            "error_resume": "يرجى تحميل سيرة ذاتية جديدة لعرضها.",
            
            "edit_profile": "تعديل الملف الشخصي",
            "full_name": "الاسم الكامل",
            "trade": "المهنة",
            "select_trade": "حدد المهنة...",
            "location": "الموقع",
            "location_placeholder": "على سبيل المثال، لاهور، باكستان",
            "availability": "التوفر",
            "avail_immediate": "فوري",
            "avail_2weeks": "إشعار أسبوعين",
            "avail_not": "غير متوفر",
            "cancel": "إلغاء",
            "save_changes": "حفظ التغييرات",
            
            "edit_skills": "تعديل المهارات",
            "skills_label": "المهارات (مفصولة بفواصل)",
            "skills_placeholder": "React, Next.js, TypeScript...",
            "save_skills": "حفظ المهارات",
            
            "add_cert": "إضافة شهادة",
            "cert_image": "صورة الشهادة",
            "cert_name": "اسم الشهادة",
            "cert_name_placeholder": "على سبيل المثال AWS Solutions Architect",
            "issuer": "المنظمة المصدرة",
            "issuer_placeholder": "على سبيل المثال Amazon Web Services",
            "issue_date": "تاريخ الإصدار",
            "desc_cred": "الوصف / معرف الاعتماد",
            "desc_cred_placeholder": "صف ما تعلمته أو قدم معرف الاعتماد الخاص بك...",
            "save_cert": "حفظ الشهادة",
            
            "edit_about": "تعديل حول",
            "prof_summary": "الملخص المهني",
            "prof_summary_placeholder": "أخبر أصحاب العمل عن خلفيتك...",
            "save_summary": "حفظ الملخص",
            
            "add_exp": "إضافة خبرة",
            "job_title": "المسمى الوظيفي",
            "company": "الشركة",
            "start_date": "تاريخ البدء",
            "end_date": "تاريخ الانتهاء",
            "current_work": "أعمل هنا حاليًا",
            "description": "الوصف",
            "save_exp": "حفظ الخبرة",
            
            "add_edu": "إضافة تعليم",
            "institution": "المؤسسة",
            "degree": "الدرجة",
            "degree_placeholder": "على سبيل المثال بكالوريوس",
            "field_study": "مجال الدراسة",
            "field_study_placeholder": "على سبيل المثال هندسة البرمجيات",
            "start_year": "سنة البدء",
            "end_year": "سنة الانتهاء",
            "save_edu": "حفظ التعليم",
            
            "add_proj": "إضافة مشروع",
            "proj_name": "اسم المشروع",
            "tech": "التقنيات (مفصولة بفواصل)",
            "tech_placeholder": "على سبيل المثال Next.js, React, Tailwind",
            "save_proj": "حفظ المشروع",
            
            "upload_resume": "تحميل السيرة الذاتية",
            "drag_drop": "اسحب وأفلت سيرتك الذاتية هنا أو انقر للتصفح",
            "supports": "يدعم PDF و DOCX حتى 5 ميغابايت",
            "select_file": "حدد ملفًا",
            "upload": "تحميل"
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
        
    if "profile" not in existing:
        existing["profile"] = {}
    existing["profile"].update(data["profile"])
    
    with open(file_path, 'w', encoding='utf-8') as f:
        json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated profile translations.")
