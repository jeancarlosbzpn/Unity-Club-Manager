import re

with open("src/ClubVencedoresSystem.jsx", 'r', encoding='utf-8') as f:
    lines = f.readlines()

modal_lines = lines[23543:23809] # showInvestitureModal block
text = "".join(modal_lines)

text = re.sub(r'\{\/\*.*?\*\/\}', '', text, flags=re.DOTALL)
text = re.sub(r'"[^"]*"', '""', text)
text = re.sub(r"'[^']*'", "''", text)
text = re.sub(r'`[^`]*`', '``', text)

open_divs = len(re.findall(r'<div\b[^>]*>', text))
close_divs = len(re.findall(r'</div\s*>', text))
print(f"Modal Open DIVs: {open_divs}")
print(f"Modal Close DIVs: {close_divs}")
