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

async function checkInspections() {
  console.log("🔍 Escaneando inspecciones de uniformidad...");
  const colRef = collection(db, 'clubvencedores_uniformInspections');
  const snap = await getDocs(colRef);
  
  console.log(`📊 Total de documentos en colección: ${snap.size}`);
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`📅 Inspección ID: ${doc.id} | Fecha: ${data.date} | Miembros evaluados: ${Object.keys(data.records || {}).length}`);
  });

  // Also check master doc for legacy
  console.log("\n🔍 Revisando documento maestro...");
  const { doc, getDoc } = await import("firebase/firestore");
  const masterSnap = await getDoc(doc(db, 'club_vencedores_data', 'uniformInspections'));
  if (masterSnap.exists()) {
    const d = masterSnap.data().data || [];
    console.log(`📊 Maestro tiene ${d.length} inspecciones.`);
    d.forEach(ins => console.log(`   - Fecha en maestro: ${ins.date}`));
  }
}

checkInspections();
