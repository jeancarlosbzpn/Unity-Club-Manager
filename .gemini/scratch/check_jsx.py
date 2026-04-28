import re
import sys

def parse_jsx(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    # Very naive parser to find unmatched tags
    # Remove all string literals and JS comments
    content = re.sub(r'//.*', '', content)
    content = re.sub(r'/\*.*?\*/', '', content, flags=re.DOTALL)
    # Remove quotes
    content = re.sub(r'"[^"]*"', '""', content)
    content = re.sub(r"'[^']*'", "''", content)
    content = re.sub(r'`[^`]*`', '``', content)
    
    # Track tags
    tag_pattern = re.compile(r'<(/?)(\w+)[^>]*?(/?)>')
    stack = []
    
    lines = content.split('\n')
    for i, line in enumerate(lines):
        for match in tag_pattern.finditer(line):
            is_close_tag = match.group(1) == '/'
            tag_name = match.group(2)
            is_self_closing = match.group(3) == '/'
            
            if is_self_closing:
                continue
                
            if is_close_tag:
                if not stack:
                    print(f"Unmatched closing tag </{tag_name}> at line {i+1}")
                    # continue instead of sys.exit to see the flow
                else:
                    if stack[-1][0] == tag_name:
                        stack.pop()
                    else:
                        print(f"Mismatched closing tag </{tag_name}> at line {i+1}. Expected </{stack[-1][0]}> (opened at {stack[-1][1]})")
                        stack.pop() # Try to recover
            else:
                stack.append((tag_name, i+1))
                
    if stack:
        print("Unclosed tags:")
        for tag in stack:
            print(f"<{tag[0]}> opened at line {tag[1]}")
            
parse_jsx('src/ClubVencedoresSystem.jsx')
