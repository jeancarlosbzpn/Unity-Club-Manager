const fs = require('fs');
const data = fs.readFileSync('src/firebase-config.js', 'utf8');
console.log(data.substring(0, 300));
