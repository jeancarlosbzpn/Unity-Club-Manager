import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

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
    const docRef = doc(db, 'club_vencedores_data', 'members');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        const members = docSnap.data().data || [];
        const jean = members.find(m => m.firstName.includes('Jean Carlos'));
        const luis = members.find(m => m.firstName.includes('Luis Rafael'));
        
        console.log("Jean photo:", jean?.photo?.substring(0, 50) + "...");
        console.log("Luis photo:", luis?.photo?.substring(0, 50) + "...");
    } else {
        console.log("No members doc found");
    }
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
