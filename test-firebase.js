import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  console.log("Checking club_vencedores_data/transactions...");
  const docRef = doc(db, 'club_vencedores_data', 'transactions');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("Found transactions! Length:", snap.data().data?.length);
  } else {
    console.log("TRANSACTIONS NOT FOUND!");
  }

  console.log("Checking members collection...");
  const colRef = collection(db, 'members');
  const qSnap = await getDocs(colRef);
  console.log("Found members! Count:", qSnap.docs.length);
}

test().then(() => process.exit(0)).catch(console.error);
