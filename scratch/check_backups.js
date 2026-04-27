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

async function checkBackups() {
  const possible = ['backups', 'backup', 'club_vencedores_backups', 'clubvencedores_backups'];
  for (const p of possible) {
    try {
      const snap = await getDocs(collection(db, p));
      console.log(`Backup '${p}': ${snap.size} docs`);
    } catch(e) {}
  }
}

checkBackups();
