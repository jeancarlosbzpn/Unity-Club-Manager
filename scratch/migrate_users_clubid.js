import { db, doc, updateDoc, collection, getDocs, query, where } from '../src/firebase-config.js';

async function migrateUsers() {
  console.log('🚀 Migrating users to include clubId: "vencedores"...');
  const usersRef = collection(db, 'clubvencedores_users');
  const snap = await getDocs(usersRef);
  
  for (const userDoc of snap.docs) {
    const data = userDoc.data();
    if (!data.clubId) {
      console.log(`  Updating user: ${data.username || data.email || userDoc.id}`);
      await updateDoc(userDoc.ref, { clubId: 'vencedores' });
    } else {
      console.log(`  User already has clubId: ${data.clubId} (${data.username || data.email})`);
    }
  }
  console.log('✅ Migration complete.');
}

migrateUsers().catch(console.error);
