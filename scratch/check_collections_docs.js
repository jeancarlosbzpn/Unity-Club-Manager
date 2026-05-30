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

async function check() {
  const c1 = await getDocs(collection(db, 'clubvencedores_fixedPayments'));
  c1.docs.forEach(d => console.log('FP:', d.id, JSON.stringify(d.data()).substring(0, 50)));

  const c2 = await getDocs(collection(db, 'clubvencedores_fixedPaymentConcepts'));
  c2.docs.forEach(d => console.log('FPC:', d.id, JSON.stringify(d.data()).substring(0, 50)));
}
check();
