import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        'mark_as_read': 'Mark as read',
        'mark_as_unread': 'Mark as unread',
        'delete': 'Delete',
        'options': 'Options'
    },
    'ur': {
        'mark_as_read': 'پڑھا ہوا نشان کریں',
        'mark_as_unread': 'ان پڑھ نشان کریں',
        'delete': 'حذف کریں',
        'options': 'اختیارات'
    },
    'ar': {
        'mark_as_read': 'تحديد كمقروء',
        'mark_as_unread': 'تحديد كغير مقروء',
        'delete': 'حذف',
        'options': 'خيارات'
    }
}

for filename in os.listdir(locales_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(locales_dir, filename)
        lang = filename.split('.')[0]
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'notifications' not in data:
            data['notifications'] = {}
            
        updates = keys_to_add.get(lang, keys_to_add['en'])
        
        for k, v in updates.items():
            if k not in data['notifications']:
                data['notifications'][k] = v
                
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Locales updated.")
