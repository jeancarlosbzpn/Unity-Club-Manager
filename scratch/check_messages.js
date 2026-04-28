const { db, collection, getDocs } = require('./src/firebase-config');

async function checkMessages() {
  try {
    const colName = 'clubvencedores_unit_messages';
    const colRef = collection(db, colName);
    const snapshot = await getDocs(colRef);
    
    console.log(`Total mensajes en '${colName}': ${snapshot.size}`);
    snapshot.docs.forEach(doc => {
      console.log(`[${doc.id}]`, doc.data());
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

checkMessages();
