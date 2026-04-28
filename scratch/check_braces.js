
const fs = require('fs');
const content = fs.readFileSync('/Users/jeancarlosbaez/Desktop/Vencedores/src/ClubVencedoresSystem.jsx', 'utf8');
let openBraces = 0;
let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    let opens = (line.match(/\{/g) || []).length;
    let closes = (line.match(/\}/g) || []).length;
    openBraces += opens - closes;
    if (i >= 3390 && i <= 3460) {
        console.log(`${i + 1}: [Level ${openBraces}] ${line}`);
    }
}
