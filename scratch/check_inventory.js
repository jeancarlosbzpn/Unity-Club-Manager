import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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
  const keys = ['inventory', 'inventoryCategories', 'uniformItems', 'uniformCategories'];
  for (const k of keys) {
    try {
      const snap = await getDoc(doc(db, 'club_vencedores_data', k));
      if (snap.exists()) {
        const d = snap.data();
        const dataLength = Array.isArray(d.data) ? d.data.length : (typeof d.data === 'object' ? Object.keys(d.data).length : 'scalar');
        console.log(`Master Doc '${k}': length: ${dataLength}, updated: ${d.updatedAt}`);
      } else {
        console.log(`Master Doc '${k}': NOT FOUND`);
      }
    } catch(e) { console.error(`Err ${k}: ${e.message}`); }
  }
}

scan();
