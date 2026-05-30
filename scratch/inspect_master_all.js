const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('scratch/api_master_all.json', 'utf8'));
  data.documents.forEach(doc => {
    const name = doc.name.split('/').pop();
    console.log(name);
  });
} catch (e) {
  console.log("Error reading JSON:", e.message);
}
