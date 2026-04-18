import sys

def check_balance(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()

    balance = 0
    in_string = None
    in_block_comment = False
    in_template = False
    
    last_zero = 0

    lines = content.split('\n')
    for i, line in enumerate(lines):
        j = 0
        while j < len(line):
            char = line[j]

            # Comments
            if not in_string and not in_template and not in_block_comment:
                if char == '/' and j + 1 < len(line) and line[j+1] == '/':
                    break 
                if char == '/' and j + 1 < len(line) and line[j+1] == '*':
                    in_block_comment = True
                    j += 2
                    continue
            
            if in_block_comment:
                if char == '*' and j + 1 < len(line) and line[j+1] == '/':
                    in_block_comment = False
                    j += 2
                    continue
                j += 1
                continue

            # Strings
            if not in_template:
                if in_string:
                    if char == in_string and (j == 0 or line[j-1] != '\\'):
                        in_string = None
                else:
                    if char == '"' or char == "'":
                        in_string = char
            
            # Template literals
            if not in_string:
                if in_template:
                    if char == '`' and (j == 0 or line[j-1] != '\\'):
                        in_template = False
                else:
                    if char == '`':
                        in_template = True

            # Regex handling in JS can be complex, skipping for now and hoping no regex contains unmatched parens

            if not in_string and not in_template and not in_block_comment:
                if char == '(':
                    balance += 1
                elif char == ')':
                    balance -= 1

            j += 1

        if balance < 0:
            print(f'Negative balance at line {i+1}')
            sys.exit(1)
            
        if balance == 0:
            last_zero = i + 1

    print(f'Final balance: {balance}')
    print(f'Last zero balance at line: {last_zero}')

check_balance('src/ClubVencedoresSystem.jsx')
