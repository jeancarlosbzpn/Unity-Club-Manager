const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function scan() {
  try {
    const mems = await getDocs(collection(db, 'clubvencedores_members'));
    console.log('Total members in Firestore:', mems.size);
    mems.forEach(doc => {
      const data = doc.data();
      console.log(`ID: ${doc.id} | Name: ${data.firstName} ${data.lastName} | Position: ${data.position} | directiveRoles:`, JSON.stringify(data.directiveRoles));
    });
  } catch (e) {
    console.error(e);
  }
}
scan();
