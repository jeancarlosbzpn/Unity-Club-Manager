
import { db } from '../src/firebase-config.js';
import { collection, getDocs } from 'firebase/firestore';

async function scanUsers() {
  console.log('--- SCANNING clubvencedores_users ---');
  try {
    const colRef = collection(db, 'clubvencedores_users');
    const snap = await getDocs(colRef);
    console.log(`Found ${snap.size} users:`);
    snap.docs.forEach(d => {
      const data = d.data();
      console.log(`  - [${d.id}] Name: ${data.name}, Role: ${data.role}, Club: ${data.clubId}`);
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

scanUsers();
