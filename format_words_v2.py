import re
import os

file_path = r'e:\work\github\daydayup\docs\eng\words.md'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Standardize spacing around phonetic brackets
content = re.sub(r'([a-zA-Z])\[', r'\1 [', content)
content = re.sub(r'\]([a-zA-Z])', r'] \1', content)

# 2. Bold words followed by phonetic brackets
# Matches "word [phonetic]" or "word[phonetic]"
content = re.sub(r'(\b[a-zA-Z\-\(\)\/]+\b)\s*\[', r'**\1** [', content)

# 3. Break lines before bolded words if they are not at the start of a line
# This helps separate entries that were merged into one line
content = re.sub(r'([。？！])\s*\*\*([a-zA-Z\-\(\)\/]+)\*\*', r'\1\n**\2**', content)

# 4. Clean up phonetic internal spaces again (just in case)
def clean_phonetic(match):
    return '[' + match.group(1).replace(' ', '') + ']'
content = re.sub(r'\[(.*?)\]', clean_phonetic, content)

# 5. Fix common punctuation issues
content = content.replace(' ，', '，').replace('， ', '，')
content = content.replace(' 。', '。').replace('。 ', '。')
content = content.replace(' ；', '；').replace('； ', '；')
content = content.replace(' ：', '：').replace('： ', '：')

# 6. Remove any leftover page numbers that might be floating
content = re.sub(r'\n\d+\s+', r'\n', content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Second pass complete.")
