
import { db, collection, getDocs, doc, getDoc } from './src/firebase-config';

async function scanFirestore() {
  console.log('--- SCANNING FIRESTORE ---');
  
  const possibleCollections = [
    'clubvencedores_activities',
    'activities',
    'club_vencedores_data'
  ];

  for (const col of possibleCollections) {
    try {
      const colRef = collection(db, col);
      const snap = await getDocs(colRef);
      console.log(`Collection [${col}]: ${snap.size} docs`);
      snap.docs.forEach(d => {
        console.log(`  - Doc ID: ${d.id}`);
        if (col === 'club_vencedores_data' && d.id === 'activities') {
          console.log(`    - Data content:`, JSON.stringify(d.data()).substring(0, 200));
        }
      });
    } catch (e) {
      console.log(`Error scanning ${col}: ${e.message}`);
    }
  }

  // Check specific central doc for activities
  try {
    const actDoc = await getDoc(doc(db, 'club_vencedores_data', 'activities'));
    if (actDoc.exists()) {
      const data = actDoc.data();
      console.log('Central doc activities exists:', !!data.data);
      if (Array.isArray(data.data)) {
        console.log('Count:', data.data.length);
        console.log('Sample:', data.data[0]);
      }
    }
  } catch (e) {
    console.log('Error reading central doc:', e.message);
  }
}

scanFirestore();
