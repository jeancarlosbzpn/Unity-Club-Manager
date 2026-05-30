import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

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
  console.log("clubvencedores_fixedPayments:", c1.size);
  const c2 = await getDocs(collection(db, 'clubvencedores_fixedPaymentConcepts'));
  console.log("clubvencedores_fixedPaymentConcepts:", c2.size);

  const m1 = await getDoc(doc(db, 'club_vencedores_data', 'fixedPayments'));
  console.log("master_fixedPayments:", m1.exists() ? 'Exists' : 'No');
  if (m1.exists()) console.log(JSON.stringify(m1.data().data).substring(0, 50));

  const m2 = await getDoc(doc(db, 'club_vencedores_data', 'fixedPaymentConcepts'));
  console.log("master_fixedPaymentConcepts:", m2.exists() ? 'Exists' : 'No');
  if (m2.exists()) console.log(JSON.stringify(m2.data().data).substring(0, 50));
}
check();
