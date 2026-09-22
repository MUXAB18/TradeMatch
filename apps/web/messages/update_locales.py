import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        'active_matches': 'Active Matches',
        'skills_added': 'Skills Added',
        'certifications': 'Certifications',
        'active': 'active',
        'none_added': 'None added',
        'browse_jobs': 'Browse jobs',
        'add_skills': 'Add skills',
        'add_certification': 'Add certification'
    },
    'ur': {
        'active_matches': 'فعال میچز',
        'skills_added': 'شامل کردہ مہارتیں',
        'certifications': 'سرٹیفیکیشنز',
        'active': 'فعال',
        'none_added': 'کوئی شامل نہیں',
        'browse_jobs': 'نوکریاں تلاش کریں',
        'add_skills': 'مہارتیں شامل کریں',
        'add_certification': 'سرٹیفیکیشن شامل کریں'
    },
    'ar': {
        'active_matches': 'المطابقات النشطة',
        'skills_added': 'المهارات المضافة',
        'certifications': 'الشهادات',
        'active': 'نشط',
        'none_added': 'لم يتم إضافة شيء',
        'browse_jobs': 'تصفح الوظائف',
        'add_skills': 'إضافة مهارات',
        'add_certification': 'إضافة شهادة'
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
