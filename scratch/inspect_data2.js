const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('extracted_backup_pre_multiclub.json', 'utf8'));
  console.log("UNITS:");
  console.log(data.units);
} catch (e) {
  console.log("Error reading JSON:", e.message);
}
