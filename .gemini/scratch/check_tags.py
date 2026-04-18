import re

def check_tags(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Simple regex to find <tag and </tag>
    # Warning: this will also find them in strings, but good enough for a rough estimate
    open_divs = len(re.findall(r'<div\b[^>]*>', content))
    close_divs = len(re.findall(r'</div>', content))
    
    print(f"Open DIVs: {open_divs}")
    print(f"Close DIVs: {close_divs}")

check_tags('src/ClubVencedoresSystem.jsx')
