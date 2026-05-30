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
  const possible = ['clubvencedores_units', 'club_vencedores_data'];
  const snapshot = await getDocs(collection(db, 'clubvencedores_units'));
  console.log("clubvencedores_units size:", snapshot.size);
}
findBackups();
