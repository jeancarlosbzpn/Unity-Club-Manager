import re

with open("src/ClubVencedoresSystem.jsx", 'r', encoding='utf-8') as f:
    text = f.read()

# Remove JSX comments
text = re.sub(r'\{\/\*.*?\*\/\}', '', text, flags=re.DOTALL)
# Remove strings
text = re.sub(r'"[^"]*"', '""', text)
text = re.sub(r"'[^']*'", "''", text)
text = re.sub(r'`[^`]*`', '``', text)

open_divs = len(re.findall(r'<div\b[^>]*>', text))
close_divs = len(re.findall(r'</div\s*>', text))
print(f"Open DIVs: {open_divs}")
print(f"Close DIVs: {close_divs}")

