import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const app = initializeApp({
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828"
});
const db = getFirestore(app);

async function check() {
  const m1 = await getDoc(doc(db, 'club_vencedores_data', 'fixedPayments'));
  if (m1.exists()) console.log("master_fixedPayments isMap:", m1.data().isMap);
}
check();
