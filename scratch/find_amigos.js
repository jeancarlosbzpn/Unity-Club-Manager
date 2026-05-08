import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

async function findAmigos() {
  const docRef = doc(db, 'club_vencedores_data', 'members');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data().data;
    const amigos = data.filter(m => 
      String(m.membershipClass).toLowerCase() === 'friend' || 
      String(m.pathfinderClass).toLowerCase() === 'friend' ||
      String(m.membershipClass).toLowerCase() === 'amigo' ||
      String(m.pathfinderClass).toLowerCase() === 'amigo'
    );
    console.log(`Found ${amigos.length} Amigos.`);
    if (amigos.length > 0) {
      console.log(JSON.stringify(amigos[0], null, 2));
    } else {
      // Print all classes to see what's available
      const classes = [...new Set(data.map(m => m.membershipClass))];
      console.log('Available classes:', classes);
    }
  }
}

findAmigos();
