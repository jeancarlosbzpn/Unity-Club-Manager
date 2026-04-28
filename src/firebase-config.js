import { initializeApp } from "firebase/app";
import { initializeFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, writeBatch, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, uploadString, getDownloadURL } from "firebase/storage";
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
export { ref, uploadBytes, uploadString, getDownloadURL };

const COLLECTION_NAME = 'club_vencedores_data';

// Generic utilities for the main system
export const saveCollectionToFirestore = async (key, data) => {
    try {
        await setDoc(doc(db, COLLECTION_NAME, key), { data, updatedAt: new Date().toISOString() }, { merge: true });
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

// Upload a photo/file to Firebase Storage and return its permanent download URL.
export const uploadImageToStorage = async (base64DataUrl, storagePath) => {
    try {
        console.log(`📡 Iniciando subida a Storage: ${storagePath}`);
        
        // Convert base64 to Blob manually (more robust than fetch for large URLs)
        const parts = base64DataUrl.split(';base64,');
        const contentType = parts[0].split(':')[1];
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        
        for (let i = 0; i < rawLength; ++i) {
            uInt8Array[i] = raw.charCodeAt(i);
        }
        
        const blob = new Blob([uInt8Array], { type: contentType });
        console.log(`📦 Blob generado: ${blob.size} bytes, tipo: ${contentType}`);
        
        const storageRef = ref(storage, storagePath);
        const metadata = { contentType };
        
        const snapshot = await uploadBytes(storageRef, blob, metadata);
        console.log('✅ UploadBytes exitoso:', snapshot.metadata.fullPath);
        
        const downloadURL = await getDownloadURL(storageRef);
        console.log(`✅ URL obtenida: ${downloadURL}`);
        return downloadURL;
    } catch (e) {
        console.error(`❌ Error crítico en Storage (${storagePath}):`, e);
        
        // Detailed error analysis
        let errorMessage = e.message;
        if (e.code === 'storage/unauthorized') {
            errorMessage = "Error de permisos: El usuario no tiene permiso para escribir en esta carpeta. Verifique que esté logueado correctamente.";
        } else if (e.code === 'storage/canceled') {
            errorMessage = "La subida fue cancelada por el usuario o el sistema.";
        } else if (e.code === 'storage/unknown') {
            errorMessage = "Error desconocido de Firebase Storage.";
        }
        
        const error = new Error(errorMessage);
        error.code = e.code;
        throw error;
    }
};

// Export Firestore primitives for the dataService
export { doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, writeBatch, onSnapshot };
