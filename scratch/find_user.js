
import { db } from '../src/firebase-config.js';
import { collection, getDocs, query, where } from 'firebase/firestore';

async function findUser() {
  console.log('🔍 Searching for username "jeancarlosbzpn"...');
  try {
    const colRef = collection(db, 'clubvencedores_users');
    const q = query(colRef, where("username", "==", "jeancarlosbzpn"));
    const snap = await getDocs(q);
    console.log(`Found ${snap.size} documents with username "jeancarlosbzpn"`);
    snap.docs.forEach(d => {
      console.log(`Doc ID: [${d.id}]`, d.data());
    });

    const q2 = query(colRef, where("name", "==", "Fulano de Tal"));
    const snap2 = await getDocs(q2);
    console.log(`Found ${snap2.size} documents with name "Fulano de Tal"`);
    snap2.docs.forEach(d => {
      console.log(`Doc ID: [${d.id}]`, d.data());
    });
    
  } catch (e) {
    console.error('Error:', e);
  }
}

findUser();
