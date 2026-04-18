import re

with open("src/ClubVencedoresSystem.jsx", 'r', encoding='utf-8') as f:
    text = f.read()

# Naive split by "activeModule ==="
parts = re.split(r"activeModule === '([a-zA-Z0-9_]+)'(.*?&&\s*\()", text)

if len(parts) > 1:
    print(f"Found { (len(parts)-1)//3 } modules")
    for i in range(1, len(parts), 3):
        mod_name = parts[i]
        mod_content = parts[i+2]
        
        # Remove JSX comments
        cleaned = re.sub(r'\{\/\*.*?\*\/\}', '', mod_content, flags=re.DOTALL)
        # Remove strings
        cleaned = re.sub(r'"[^"]*"', '""', cleaned)
        cleaned = re.sub(r"'[^']*'", "''", cleaned)
        cleaned = re.sub(r'`[^`]*`', '``', cleaned)
        
        open_tags = len(re.findall(r'<div\b[^>]*>', cleaned))
        close_tags = len(re.findall(r'</div\s*>', cleaned))
        
        diff = open_tags - close_tags
        if diff != 0:
            print(f"Module '{mod_name}': {open_tags} <divs> vs {close_tags} </divs>. Diff: {diff}")
            
