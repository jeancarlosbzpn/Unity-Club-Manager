import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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

async function scan() {
  const keysToCheck = ['clubSettings', 'members'];
  
  for (const k of keysToCheck) {
    const snap = await getDoc(doc(db, 'club_vencedores_data', k));
    if (snap.exists()) {
      const d = snap.data();
      if (k === 'clubSettings') {
        const data = d.data || d;
        console.log(`=== ${k} ===`);
        // List all keys but truncate images
        for (const [field, val] of Object.entries(data)) {
          if (typeof val === 'string' && val.startsWith('data:image')) {
            console.log(`  ${field}: [IMAGE ${Math.round(val.length/1024)}KB]`);
          } else {
            console.log(`  ${field}: ${JSON.stringify(val)?.substring(0, 100)}`);
          }
        }
      } else {
        const arr = d.data;
        console.log(`${k}: ${Array.isArray(arr) ? arr.length : 'N/A'} records`);
        // Check if first member has a photo
        if (Array.isArray(arr) && arr.length > 0) {
          const first = arr[0];
          console.log(`First member: ${first.firstName} ${first.lastName}, photo: ${first.photo ? '[HAS PHOTO ' + Math.round(first.photo.length/1024) + 'KB]' : 'none'}`);
        }
      }
    } else {
      console.log(`${k}: NOT FOUND`);
    }
  }
}

scan();
