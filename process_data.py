import re
import os

files = [
    'data_kanto.js', 
    'data_chubu.js', 
    'data_kansai.js'
]

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 1. Remove onsen
    content = re.sub(r',\s*onsen:\s*"[^"]*"', '', content)
    
    # 2. Remove gourmet
    content = re.sub(r',\s*gourmet:\s*"[^"]*"', '', content)
    
    # 3. Format summary
    def replace_summary(match):
        text = match.group(1)
        sentences = [s.strip() for s in text.split('。') if s.strip()]
        if not sentences:
            if text.strip():
                return 'summary: "・' + text + '"'
            return 'summary: ""'
        bullets = ['・' + s for s in sentences]
        new_html = '<br>'.join(bullets)
        return 'summary: "' + new_html + '"'

    content = re.sub(r'summary:\s*"([^"]*)"', replace_summary, content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
        
    print(f'Processed {file}')
