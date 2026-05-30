const fs = require('fs');
try {
  const data = JSON.parse(fs.readFileSync('scratch/api_clubs.json', 'utf8'));
  data.documents.forEach(doc => {
    const name = doc.name.split('/').pop();
    console.log(name, doc.fields.id ? doc.fields.id.stringValue : 'no-id');
  });
} catch (e) {
  console.log("Error reading JSON:", e.message);
}
