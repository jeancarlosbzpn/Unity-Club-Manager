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
  console.log("Scanning known keys...");
  const collections = ['clubvencedores_members', 'clubvencedores_transactions', 'clubvencedores_users'];
  for (const k of collections) {
    try {
      const snap = await getDocs(collection(db, k));
      console.log(`Collection '${k}': ${snap.size} docs`);
    } catch(e) { console.error(`Err ${k}: ${e.message}`); }
  }

  const masterKeys = ['members', 'transactions', 'clubSettings', 'users', 'points'];
  for (const k of masterKeys) {
    try {
      const snap = await getDoc(doc(db, 'club_vencedores_data', k));
      if (snap.exists()) {
        const d = snap.data();
        const dataLength = Array.isArray(d.data) ? d.data.length : (typeof d.data === 'object' ? Object.keys(d.data).length : 'scalar');
        console.log(`Master Doc '${k}': exists, size/length: ${dataLength}, updated: ${d.updatedAt}`);
      } else {
        console.log(`Master Doc '${k}': NOT FOUND`);
      }
    } catch(e) { console.error(`Err Master ${k}: ${e.message}`); }
  }
}

scan();
