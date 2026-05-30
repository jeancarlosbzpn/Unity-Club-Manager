import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const mems = await getDocs(collection(db, 'clubvencedores_members'));
  console.log('Members count:', mems.size);
}
check();
