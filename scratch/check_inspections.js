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

async function scan() {
  const k = 'uniformInspections';
  const snap = await getDoc(doc(db, 'club_vencedores_data', k));
  if (snap.exists()) {
    const d = snap.data();
    console.log(`Master Doc '${k}': length: ${d.data?.length}, updated: ${d.updatedAt}`);
    if (d.data && d.data.length > 0) {
      console.log(`Last items: ${JSON.stringify(d.data.slice(-2))}`);
    }
  } else {
    console.log(`Master Doc '${k}': NOT FOUND`);
  }
}

scan();
