import { initializeApp } from "firebase/app";
import { getFirestore, enableIndexedDbPersistence, collection, doc, setDoc, getDoc } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828",
    measurementId: "G-H38F1FTKZ2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence
try {
    enableIndexedDbPersistence(db).catch((err) => {
        if (err.code == 'failed-precondition') {
            console.warn('Persistence failed: Multiple tabs open');
        } else if (err.code == 'unimplemented') {
            console.warn('Persistence not supported by browser');
        }
    });
} catch (e) {
    console.log("Persistence setup error (ignore if in node env):", e);
}

// Data keys mapping to Firestore Document IDs
// Collection: 'club_vencedores_data'
const COLLECTION_NAME = 'club_vencedores_data';

export const saveCollectionToFirestore = async (key, data) => {
    try {
        await setDoc(doc(db, COLLECTION_NAME, key), { data });
        console.log(`Saved ${key} to Firestore`);
    } catch (e) {
        console.error(`Error saving ${key}:`, e);
        throw e;
    }
};

export const loadCollectionFromFirestore = async (key) => {
    try {
        const docRef = doc(db, COLLECTION_NAME, key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return docSnap.data().data;
        }
        return null; // Return null if not found
    } catch (e) {
        console.error(`Error loading ${key}:`, e);
        return null;
    }
};
