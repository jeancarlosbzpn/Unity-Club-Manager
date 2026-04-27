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

async function scan() {
  const colRef = collection(db, 'club_vencedores_data');
  const snap = await getDocs(colRef);
  snap.forEach(doc => {
    const d = doc.data();
    const len = Array.isArray(d.data) ? d.data.length : 'obj';
    console.log(`Key: ${doc.id}, length: ${len}, updated: ${d.updatedAt}`);
  });
}

scan();
