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

async function checkCollections() {
  try {
    const unitsSnap = await getDocs(collection(db, 'clubvencedores_units'));
    console.log(`Club Vencedores Units: ${unitsSnap.size} docs`);
    unitsSnap.forEach(d => console.log('Unit:', d.id, d.data().name));

    const masterDoc = await getDoc(doc(db, 'club_vencedores_data', 'units'));
    if (masterDoc.exists()) {
      console.log('Master Doc (units):', masterDoc.data()?.data?.length || 'Empty/Not array');
    } else {
      console.log('Master Doc (units) does not exist');
    }
  } catch(e) {
    console.error(e);
  }
}

checkCollections();
