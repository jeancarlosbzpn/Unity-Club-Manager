import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828",
    measurementId: "G-H38F1FTKZ2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkPhotos() {
  console.log("🔍 Buscando fotos en la colección de miembros...");
  const colRef = collection(db, 'clubvencedores_members');
  const snap = await getDocs(colRef);
  
  let found = 0;
  snap.forEach(doc => {
    const m = doc.data();
    if (m.photo) {
      console.log(`✅ Miembro: ${m.firstName} ${m.lastName} - Foto: ${m.photo.substring(0, 50)}...`);
      found++;
    }
  });
  
  if (found === 0) {
    console.log("❌ No se encontró NINGUNA foto en ningún miembro en clubvencedores_members.");
  }
}

checkPhotos();
