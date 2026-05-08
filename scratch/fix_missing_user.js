import { db, collection, getDocs, doc, setDoc } from './src/firebase-config.js';

async function syncUser() {
  const email = 'deibigalvesp13@gmail.com';
  const username = 'deibigalvesp13';
  
  console.log(`Verificando usuario ${email} en Firestore...`);
  
  try {
    const colRef = collection(db, 'clubvencedores_users');
    const snapshot = await getDocs(colRef);
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    const existing = users.find(u => u.username === username || u.email === email);
    
    if (existing) {
      console.log('✅ El usuario ya existe en la lista:', JSON.stringify(existing, null, 2));
    } else {
      console.log('❌ El usuario NO existe en la lista. Creando perfil básico...');
      
      const newUser = {
        name: 'Deibi Galvez', // Nombre sugerido
        username: username,
        email: email,
        role: 'user',
        position: 'Instructor', // Posición sugerida
        allowedModules: ['dashboard', 'attendance', 'activities'], // Permisos básicos
        modulePermissions: {
          dashboard: 'read',
          attendance: 'edit',
          activities: 'read'
        },
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'clubvencedores_users', username), newUser);
      console.log('🚀 Perfil creado correctamente en Firestore.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

syncUser();
