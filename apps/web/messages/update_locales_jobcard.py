import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        'more': 'more',
        'posted': 'Posted',
        'status': 'Status:',
        'view_job': 'View Job'
    },
    'ur': {
        'more': 'مزید',
        'posted': 'پوسٹ کیا گیا',
        'status': 'حیثیت:',
        'view_job': 'نوکری دیکھیں'
    },
    'ar': {
        'more': 'المزيد',
        'posted': 'نشرت',
        'status': 'الحالة:',
        'view_job': 'عرض الوظيفة'
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
