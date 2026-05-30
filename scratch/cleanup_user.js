
import { db } from '../src/firebase-config.js';
import { doc, deleteDoc } from 'firebase/firestore';

async function cleanupUser() {
  console.log('🧹 Cleaning up user "jeancarlosbzpn" (Fulano de Tal)...');
  try {
    await deleteDoc(doc(db, 'clubvencedores_users', 'jeancarlosbzpn'));
    console.log('✅ Deleted doc "jeancarlosbzpn" from clubvencedores_users');
  } catch (e) {
    console.error('Error:', e);
  }
}

cleanupUser();
