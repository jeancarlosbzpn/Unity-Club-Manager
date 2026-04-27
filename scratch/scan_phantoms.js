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

async function scanPhantomUnits() {
  console.log("🔍 Escaneando miembros y unidades...");
  
  const unitsSnap = await getDocs(collection(db, 'clubvencedores_units'));
  const validUnitIds = unitsSnap.docs.map(doc => doc.id);
  console.log("✅ Unidades válidas encontradas:", validUnitIds);

  const membersSnap = await getDocs(collection(db, 'clubvencedores_members'));
  console.log(`📊 Total de miembros: ${membersSnap.size}`);
  
  membersSnap.forEach(doc => {
    const m = doc.data();
    if (m.unitId) {
      const isValid = validUnitIds.includes(String(m.unitId));
      if (!isValid) {
        console.log(`⚠️ Miembro FANSTASMA detectado: ${m.firstName} ${m.lastName} | ID Unidad: ${m.unitId} (NO EXISTE)`);
      } else {
        console.log(`✅ Miembro OK: ${m.firstName} ${m.lastName} | ID Unidad: ${m.unitId}`);
      }
    } else {
       // console.log(`⚪ Miembro LIBRE: ${m.firstName} ${m.lastName}`);
    }
  });
}

scanPhantomUnits();
