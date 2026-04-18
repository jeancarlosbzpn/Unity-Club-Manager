const fs = require('fs');
const content = fs.readFileSync('src/ClubVencedoresSystem.jsx', 'utf8');

// A very naive JSX tag stack counter to find the unclosed div or main
const lines = content.split('\n');
let tags = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  // Remove comments { /* ... */ } and // ...
  let cleanLine = line.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\/.*$/g, '');
  
  // Find tags
  const openTags = [...cleanLine.matchAll(/<([a-zA-Z0-9]+)(?![a-zA-Z0-9])/g)];
  const closeTags = [...cleanLine.matchAll(/<\/([a-zA-Z0-9]+)>/g)];
  const selfCloseTags = [...cleanLine.matchAll(/<([a-zA-Z0-9]+)[^>]*\/>/g)];
  
  for (const match of openTags) {
    if (['div', 'main', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'ul', 'li', 'button', 'svg', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'label', 'select', 'option'].includes(match[1])) {
       // Check if self closed on the same line
       if (!cleanLine.substring(match.index).match(/^<([a-zA-Z0-9]+)[^>]*\/>/)) {
          tags.push({ tag: match[1], line: i + 1, type: 'open', string: cleanLine.substring(match.index, match.index+20) });
       }
    }
  }
  for (const match of closeTags) {
    if (['div', 'main', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'ul', 'li', 'button', 'svg', 'table', 'thead', 'tbody', 'tr', 'td', 'th', 'form', 'label', 'select', 'option'].includes(match[1])) {
       if (tags.length > 0) {
         const last = tags[tags.length - 1];
         if (last.tag === match[1]) {
           tags.pop();
         } else {
           // Mismatch!
           tags.push({ tag: match[1], line: i + 1, type: 'close', string: cleanLine.substring(match.index, match.index+20) });
         }
       }
    }
  }
}

// Print remaining stack at end
console.log("Remaining tags:", tags.map(t => `${t.tag} at line ${t.line} (${t.type})`).slice(-20));
