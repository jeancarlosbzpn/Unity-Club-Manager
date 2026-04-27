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
  const colRef = collection(db, 'clubvencedores_points');
  const snap = await getDocs(colRef);
  snap.forEach(doc => {
    const d = doc.data();
    if (d.month === '2026-04') {
       Object.keys(d.saturdays || {}).forEach(date => {
          if (date === '2026-04-27') {
             console.log(`Member ${d.memberId} has points on 2026-04-27: ${JSON.stringify(d.saturdays[date])}`);
          }
       });
    }
  });
}

scan();
