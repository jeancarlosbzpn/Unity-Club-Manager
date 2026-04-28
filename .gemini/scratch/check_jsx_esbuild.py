import subprocess
import os

try:
    content = open("src/ClubVencedoresSystem.jsx").read()
    # Simple check for activeModule roots
    import re
    
    blocks = re.split(r'activeModule === \'(.*?)\'', content)
    # The split makes blocks[1] = 'dashboard', blocks[2] = dashboard content, blocks[3] = 'discipline', etc.
    # Actually split gives: pre-match, match1, text1, match2, text2
    
    for i in range(1, len(blocks), 2):
        mod_name = blocks[i]
        mod_text = blocks[i+1]
        
        # Extroct up to the next 'activeModule' or end of file
        # But this is rough since blocks are split.
        
        # Let's count divs in mod_text up to the closing `)` of the `&& (`
        # Very rough estimation.
        pass
        
    open_divs = len(re.findall(r'<div\b[^>]*>', content))
    close_divs = len(re.findall(r'</div>', content))
    print(f"Open DIVs: {open_divs}")
    print(f"Close DIVs: {close_divs}")
    
except Exception as e:
    print(e)
