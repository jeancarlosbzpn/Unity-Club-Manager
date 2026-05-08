import { db, collection, getDocs } from './src/firebase-config.js';

async function checkUser() {
  console.log('Checking users collection...');
  try {
    const colRef = collection(db, 'clubvencedores_users');
    const snapshot = await getDocs(colRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log('Total users found:', users.length);
    const target = users.find(u => 
      u.email === 'deibigalvesp13@gmail.com' || 
      u.username === 'deibigalvesp13' ||
      u.name?.toLowerCase().includes('deibi')
    );
    
    if (target) {
      console.log('User found in Firestore:', JSON.stringify(target, null, 2));
    } else {
      console.log('User deibigalvesp13@gmail.com NOT found in Firestore.');
      console.log('Existing usernames:', users.map(u => u.username).join(', '));
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

checkUser();
