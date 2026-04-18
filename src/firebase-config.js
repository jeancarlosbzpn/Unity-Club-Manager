import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, writeBatch, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadString, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

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

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false
});

export const storage = getStorage(app);
export { ref, uploadString, getDownloadURL };

const COLLECTION_NAME = 'club_vencedores_data';

// Generic utilities for the main system
export const saveCollectionToFirestore = async (key, data) => {
    try {
        await setDoc(doc(db, COLLECTION_NAME, key), { data, updatedAt: new Date().toISOString() });
        console.log(`✅ Saved ${key} to Firestore`);
    } catch (e) {
        console.error(`❌ Error saving ${key}:`, e);
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
        return null;
    } catch (e) {
        console.error(`Error loading ${key}:`, e);
        return null;
    }
};

// Export Firestore primitives for the dataService
export { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, writeBatch, onSnapshot };
