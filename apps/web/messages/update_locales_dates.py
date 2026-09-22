import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        'today': 'Today',
        'yesterday': 'Yesterday',
        'days_ago': '{count} days ago',
        'weeks_ago': '{count}w ago',
        'months_ago': '{count}mo ago'
    },
    'ur': {
        'today': 'آج',
        'yesterday': 'گزشتہ کل',
        'days_ago': '{count} days ago',
        'weeks_ago': '{count}w ago',
        'months_ago': '{count}mo ago'
    },
    'ar': {
        'today': 'اليوم',
        'yesterday': 'أمس',
        'days_ago': 'قبل {count} أيام',
        'weeks_ago': 'قبل {count} أسابيع',
        'months_ago': 'قبل {count} أشهر'
    }
}

# Fix ur translations since the screenshot shows english "days ago", but it probably should be translated in the UI just the number kept same
# Wait, the user specifically mentioned "keep numbers same". For Urdu, I'll translate the text but keep {count}.
keys_to_add['ur'] = {
    'today': 'Today', # The user's screenshot had 'Today', but I should translate it
    'yesterday': 'Yesterday',
    'days_ago': '{count} دن پہلے',
    'weeks_ago': '{count} ہفتے پہلے',
    'months_ago': '{count} مہینے پہلے'
}
keys_to_add['ur']['today'] = 'آج'
keys_to_add['ur']['yesterday'] = 'گزشتہ کل'


for filename in os.listdir(locales_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(locales_dir, filename)
        lang = filename.split('.')[0]
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'common' not in data:
            data['common'] = {}
            
        updates = keys_to_add.get(lang, keys_to_add['en'])
        
        for k, v in updates.items():
            if k not in data['common']:
                data['common'][k] = v
                
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Locales updated.")
