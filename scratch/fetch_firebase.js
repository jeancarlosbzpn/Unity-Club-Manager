const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const fs = require('fs');

const configContent = fs.readFileSync('src/firebaseConfig.js', 'utf8');
const match = configContent.match(/const firebaseConfig = ({[\s\S]*?});/);
if (match) {
  let firebaseConfig;
  eval(`firebaseConfig = ${match[1]}`);
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  
  async function fetchData() {
    console.log("Fetching data from Firebase...");
    try {
      const prefix = 'clubvencedores_';
      const unitsRef = collection(db, `${prefix}units`);
      const unitsSnap = await getDocs(unitsRef);
      console.log(`Units: ${unitsSnap.size}`);
      unitsSnap.forEach(doc => {
        console.log(`Unit: ${doc.id} -> ${doc.data().name}`);
      });
      process.exit(0);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  }
  fetchData();
}
