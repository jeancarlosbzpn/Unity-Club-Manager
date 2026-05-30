
import { db } from '../src/firebase-config.js';
import { collection, getDocs } from 'firebase/firestore';

async function dumpUsers() {
  console.log('--- DUMPING clubvencedores_users ---');
  try {
    const colRef = collection(db, 'clubvencedores_users');
    const snap = await getDocs(colRef);
    console.log(`Total documents: ${snap.size}`);
    snap.docs.forEach(d => {
      console.log(`Doc ID: [${d.id}]`);
      console.log(`  Data:`, JSON.stringify(d.data()));
    });
  } catch (e) {
    console.error('Error:', e);
  }
}

dumpUsers();
