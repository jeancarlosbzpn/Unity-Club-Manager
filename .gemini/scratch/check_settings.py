import re

with open("src/ClubVencedoresSystem.jsx", 'r', encoding='utf-8') as f:
    lines = f.readlines()

settings_lines = lines[23124:23541] # The settings activeModule block
text = "".join(settings_lines)

# Remove JSX comments
text = re.sub(r'\{\/\*.*?\*\/\}', '', text, flags=re.DOTALL)
# Remove strings
text = re.sub(r'"[^"]*"', '""', text)
text = re.sub(r"'[^']*'", "''", text)
text = re.sub(r'`[^`]*`', '``', text)

open_divs = len(re.findall(r'<div\b[^>]*>', text))
close_divs = len(re.findall(r'</div\s*>', text))
print(f"Settings Open DIVs: {open_divs}")
print(f"Settings Close DIVs: {close_divs}")
