import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";

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

async function restoreInscripcion() {
  console.log("🚀 Iniciando restauración de Inscripción...");

  // 1. Get transactions to reconstruct mapping
  const transSnap = await getDocs(collection(db, "clubvencedores_transactions"));
  const fixedTrans = transSnap.docs.filter(d => String(d.id).startsWith("fixed-1769816710343-"));
  
  const mapping = {};
  fixedTrans.forEach(d => {
    const data = d.data();
    mapping[data.memberId] = {
      paid: true,
      date: data.date,
      amount: data.amount,
      transactionId: d.id
    };
  });

  console.log(`✅ Mapeo reconstruido: ${Object.keys(mapping).length} miembros pagaron.`);

  // 2. Update fixedPaymentConcepts
  const conceptsRef = doc(db, "club_vencedores_data", "fixedPaymentConcepts");
  const conceptsSnap = await getDoc(conceptsRef);
  let currentConcepts = conceptsSnap.exists() ? conceptsSnap.data().data : [];
  
  if (!currentConcepts.find(c => c.id === "1769816710343")) {
    currentConcepts.push({
      id: "1769816710343",
      name: "Inscripción",
      amount: 350,
      createdAt: "2026-02-15T00:00:00.000Z"
    });
    await setDoc(conceptsRef, { data: currentConcepts, updatedAt: new Date().toISOString() }, { merge: true });
    console.log("✅ Concepto Inscripción agregado a fixedPaymentConcepts.");
  } else {
    console.log("ℹ️ El concepto Inscripción ya existe en fixedPaymentConcepts.");
  }

  // 3. Update fixedPayments mapping
  const paymentsRef = doc(db, "club_vencedores_data", "fixedPayments");
  const paymentsSnap = await getDoc(paymentsRef);
  let currentPayments = paymentsSnap.exists() ? paymentsSnap.data().data : {};
  
  currentPayments["1769816710343"] = mapping;
  
  await setDoc(paymentsRef, { data: currentPayments, updatedAt: new Date().toISOString() }, { merge: true });
  console.log("✅ Mapeo de pagos actualizado en fixedPayments.");

  console.log("🎉 Restauración completada!");
}

restoreInscripcion();
