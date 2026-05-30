import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const app = initializeApp({
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828"
});
const db = getFirestore(app);

async function findBackups() {
  const possible = ['backups', 'backup', 'club_vencedores_backups', 'clubvencedores_backups'];
  for (const p of possible) {
    try {
      const snap = await getDocs(collection(db, p));
      console.log(`Backup '${p}': ${snap.size} docs`);
      if (snap.size > 0) {
         snap.docs.forEach(doc => {
            console.log(` - Doc: ${doc.id}`);
         });
      }
    } catch(e) {}
  }
}
findBackups();
