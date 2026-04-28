
const fs = require('fs');
const content = fs.readFileSync('/Users/jeancarlosbaez/Desktop/Vencedores/src/ClubVencedoresSystem.jsx', 'utf8');
let stack = [];
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    // Remove strings and regex to avoid false positives
    let cleanLine = line.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '""').replace(/\/.+\//g, '//');
    for (let char of cleanLine) {
        if (char === '{') stack.push(i + 1);
        if (char === '}') {
            if (stack.length === 0) {
                console.log(`EXTRA CLOSING BRACE at line ${i + 1}`);
            } else {
                stack.pop();
            }
        }
    }
}
if (stack.length > 0) {
    console.log(`UNCLOSED BRACES at lines: ${stack.join(', ')}`);
} else {
    console.log("Braces are balanced!");
}
