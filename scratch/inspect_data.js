const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('backup_data_pre_multiclub.json', 'utf8'));
  console.log("UNITS:");
  (data.units || []).slice(0, 3).forEach(u => console.log(u.id, u.name, u.clubType));
  console.log("\nMEMBERS:");
  (data.members || []).slice(0, 5).forEach(m => console.log(m.id, m.firstName, m.unitId));
} catch (e) {
  console.log("Error reading JSON:", e.message);
}
