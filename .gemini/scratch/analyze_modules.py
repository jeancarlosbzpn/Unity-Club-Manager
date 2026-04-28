import re

with open("src/ClubVencedoresSystem.jsx", 'r', encoding='utf-8') as f:
    text = f.read()

# Naive split by "activeModule ==="
# We know they start like: activeModule === 'moduleName' && (
parts = re.split(r"activeModule === '([a-zA-Z0-9_]+)'(.*?&&\s*\()", text)
# parts[0] is everything before first activeModule
# parts[1] is 'dashboard'
# parts[2] is ' && ('
# parts[3] is content of dashboard up to next 'activeModule'
# parts[4] is 'discipline'
# etc

if len(parts) > 1:
    print(f"Found { (len(parts)-1)//3 } modules")
    for i in range(1, len(parts), 3):
        mod_name = parts[i]
        mod_content = parts[i+2]
        
        open_tags = len(re.findall(r'<div\b[^>]*>', mod_content))
        close_tags = len(re.findall(r'</div>', mod_content))
        
        print(f"Module '{mod_name}': {open_tags} <divs> vs {close_tags} </divs>. Diff: {open_tags - close_tags}")
