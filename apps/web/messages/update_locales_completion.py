import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        'basic_info': 'Basic information',
        'add_experience': 'Add experience',
        'add_skills': 'Add skills',
        'add_certifications': 'Add certifications',
        'add_name_start': 'Add your name to get started',
        'add_years_experience': 'Add your years of experience',
        'add_skills_unlock': 'Add skills to unlock job matches',
        'add_certs_strengthen': 'Add certifications to strengthen your profile',
        'profile_is_complete': 'Your profile is complete!',
        'profile_complete_check': 'Profile complete ✓',
        'complete_your_profile': 'Complete your profile',
        'all_set_matches': 'You\'re all set to receive the best job matches.',
        'done': 'Done',
        'continue_profile': 'Continue profile'
    },
    'ur': {
        'basic_info': 'بنیادی معلومات',
        'add_experience': 'تجربہ شامل کریں',
        'add_skills': 'مہارتیں شامل کریں',
        'add_certifications': 'سرٹیفیکیشن شامل کریں',
        'add_name_start': 'شروع کرنے کے لیے اپنا نام شامل کریں',
        'add_years_experience': 'اپنے تجربے کے سال شامل کریں',
        'add_skills_unlock': 'ملازمت کے میچز کو غیر مقفل کرنے کے لیے مہارتیں شامل کریں',
        'add_certs_strengthen': 'اپنے پروفائل کو مضبوط بنانے کے لیے سرٹیفیکیشن شامل کریں',
        'profile_is_complete': 'آپ کا پروفائل مکمل ہے!',
        'profile_complete_check': 'پروفائل مکمل ✓',
        'complete_your_profile': 'اپنا پروفائل مکمل کریں',
        'all_set_matches': 'آپ بہترین جاب میچز حاصل کرنے کے لیے تیار ہیں۔',
        'done': 'مکمل',
        'continue_profile': 'پروفائل جاری رکھیں'
    },
    'ar': {
        'basic_info': 'المعلومات الأساسية',
        'add_experience': 'إضافة خبرة',
        'add_skills': 'إضافة مهارات',
        'add_certifications': 'إضافة شهادات',
        'add_name_start': 'أضف اسمك للبدء',
        'add_years_experience': 'أضف سنوات خبرتك',
        'add_skills_unlock': 'أضف المهارات لفتح مطابقات الوظائف',
        'add_certs_strengthen': 'أضف الشهادات لتقوية ملفك الشخصي',
        'profile_is_complete': 'ملفك الشخصي مكتمل!',
        'profile_complete_check': 'اكتمل الملف الشخصي ✓',
        'complete_your_profile': 'أكمل ملفك الشخصي',
        'all_set_matches': 'أنت جاهز لتلقي أفضل مطابقات الوظائف.',
        'done': 'منجز',
        'continue_profile': 'متابعة الملف الشخصي'
    }
}

for filename in os.listdir(locales_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(locales_dir, filename)
        lang = filename.split('.')[0]
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'dashboard' not in data:
            data['dashboard'] = {}
            
        updates = keys_to_add.get(lang, keys_to_add['en'])
        
        for k, v in updates.items():
            if k not in data['dashboard']:
                data['dashboard'][k] = v
                
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Locales updated.")
