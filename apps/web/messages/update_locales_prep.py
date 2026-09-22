import json
import os

locales_dir = '/Users/user/Desktop/myapp/apps/web/messages'
keys_to_add = {
    'en': {
        'tab_flashcards': 'Flashcards',
        'tab_text_chat': 'Text Chat',
        'tab_voice': 'Voice',
        'generate_flashcards': 'Generate AI Flashcards',
        'generate_flashcards_desc': 'Instantly generate 10 realistic interview questions tailored to your trade, skills, and experience level.',
        'generate_for_trade': 'Generate for {trade}',
        'add_trade_first': 'Add a trade to your profile first',
        'text_interview_practice': 'Text Interview Practice',
        'text_interview_desc': 'The AI will ask you real interview questions. Type your answers and get instant feedback.',
        'start_practice_session': 'Start Practice Session',
        'voice_interview_practice': 'Voice Interview Practice',
        'voice_interview_desc': 'The AI asks a question. You speak your answer. Get instant feedback on your response.',
        'start_voice_session': 'Start Voice Session'
    },
    'ur': {
        'tab_flashcards': 'فلیش کارڈز',
        'tab_text_chat': 'ٹیکسٹ چیٹ',
        'tab_voice': 'آواز',
        'generate_flashcards': 'AI فلیش کارڈز بنائیں',
        'generate_flashcards_desc': 'اپنے ہنر، مہارت، اور تجربے کی سطح کے مطابق فوراً 10 حقیقت پسندانہ انٹرویو سوالات بنائیں۔',
        'generate_for_trade': '{trade} کے لیے بنائیں',
        'add_trade_first': 'پہلے اپنے پروفائل میں کوئی ہنر شامل کریں',
        'text_interview_practice': 'ٹیکسٹ انٹرویو کی مشق',
        'text_interview_desc': 'AI آپ سے اصلی انٹرویو کے سوالات پوچھے گا۔ اپنے جوابات ٹائپ کریں اور فوراً رائے حاصل کریں۔',
        'start_practice_session': 'مشق شروع کریں',
        'voice_interview_practice': 'وائس انٹرویو کی مشق',
        'voice_interview_desc': 'AI سوال پوچھتا ہے۔ آپ اپنا جواب بولیں۔ اپنے جواب پر فوراً رائے حاصل کریں۔',
        'start_voice_session': 'وائس سیشن شروع کریں'
    },
    'ar': {
        'tab_flashcards': 'بطاقات تعليمية',
        'tab_text_chat': 'دردشة نصية',
        'tab_voice': 'صوت',
        'generate_flashcards': 'إنشاء بطاقات ذكاء اصطناعي',
        'generate_flashcards_desc': 'أنشئ فوراً 10 أسئلة مقابلة واقعية مصممة خصيصًا لمهنتك ومهاراتك ومستوى خبرتك.',
        'generate_for_trade': 'إنشاء لـ {trade}',
        'add_trade_first': 'أضف مهنة إلى ملفك الشخصي أولاً',
        'text_interview_practice': 'التدريب على المقابلة النصية',
        'text_interview_desc': 'سيطرح عليك الذكاء الاصطناعي أسئلة مقابلة حقيقية. اكتب إجاباتك واحصل على ملاحظات فورية.',
        'start_practice_session': 'بدء جلسة التدريب',
        'voice_interview_practice': 'التدريب على المقابلة الصوتية',
        'voice_interview_desc': 'الذكاء الاصطناعي يطرح سؤالاً. تتحدث إجابتك. احصل على ملاحظات فورية على ردك.',
        'start_voice_session': 'بدء جلسة صوتية'
    }
}

for filename in os.listdir(locales_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(locales_dir, filename)
        lang = filename.split('.')[0]
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        if 'prep' not in data:
            data['prep'] = {}
            
        updates = keys_to_add.get(lang, keys_to_add['en'])
        
        for k, v in updates.items():
            if k not in data['prep']:
                data['prep'][k] = v
                
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
            
print("Locales updated.")
