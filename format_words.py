import re
import os

file_path = r'e:\work\github\daydayup\docs\eng\words.md'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
in_yaml = False
yaml_count = 0

for line in lines:
    # Handle YAML front matter
    if line.strip() == '---':
        yaml_count += 1
        in_yaml = yaml_count < 2
        new_lines.append(line)
        continue
    
    if in_yaml:
        new_lines.append(line)
        continue

    # Remove page numbers at the start of lines (e.g., "44 modest...", "13 UNIT2")
    # But be careful not to remove "### 1 Unit1" completely, just the "1 "
    line = re.sub(r'^\d+\s+', '', line)
    
    # Standardize Unit headers
    # Matches "### 1 Unit1", "### 13 UNIT2", etc.
    unit_match = re.search(r'^###\s*\d*\s*UNIT\s*(\d+)', line, re.IGNORECASE)
    if unit_match:
        new_lines.append(f'## Unit {unit_match.group(1)}\n')
        continue

    # Clean up the Table of Contents (lines with many dots)
    if '.....' in line:
        # If it contains "UNIT X", extract it
        units = re.findall(r'UNIT\s*(\d+)', line)
        if units:
            for u in units:
                new_lines.append(f'- [Unit {u}](#unit-{u})\n')
            continue
        else:
            # Just ignore lines that are just dots
            if line.strip().strip('.'):
                pass # keep if there's other text, but usually it's just dots and numbers
            else:
                continue

    # Clean up punctuation spacing (Chinese punctuation)
    line = line.replace(' ，', '，').replace('， ', '，')
    line = line.replace(' 。', '。').replace('。 ', '。')
    line = line.replace(' ；', '；').replace('； ', '；')
    line = line.replace(' ：', '：').replace('： ', '：')
    line = line.replace('（ ', '（').replace(' ）', '）')

    # Clean up spaces inside phonetic brackets [ ... ]
    def clean_phonetic(match):
        return '[' + match.group(1).replace(' ', '') + ']'
    line = re.sub(r'\[(.*?)\]', clean_phonetic, line)

    # Bold the word at the start of the line if it looks like a vocabulary entry
    # Entry pattern: Word[phonetic] or Word pos.
    # Note: Some lines are explanations, we don't want to bold every first word.
    # We only bold if it's followed by a bracket or a POS tag (n., v., a., etc.)
    line = re.sub(r'^([a-zA-Z\-\(\)\/]+)(\[|\s+[a-z]+\.)', r'**\1** \2', line)

    new_lines.append(line)

# Further cleanup: remove consecutive empty lines
final_lines = []
prev_empty = False
for line in new_lines:
    is_empty = not line.strip()
    if is_empty and prev_empty:
        continue
    final_lines.append(line)
    prev_empty = is_empty

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(final_lines)

print("Formatting complete.")
