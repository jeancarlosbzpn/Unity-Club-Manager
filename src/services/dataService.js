import { db, saveCollectionToFirestore, loadCollectionFromFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc, onSnapshot } from '../firebase-config';

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

/**
 * Internal utility to clean data before Firebase
 * Removes 'undefined' and strips large base64 images that clog Firestore
 */
const sanitizeData = (obj) => {
  if (obj === undefined) return null;
  if (obj === null) return null;
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeData(item)).filter(item => item !== undefined);
  }
  if (typeof obj === 'object') {
    const newObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const val = obj[key];
        // Strip large base64 from Firestore to prevent 1MB limit issues
        if (typeof val === 'string' && val.length > 5000 && val.startsWith('data:image')) {
          newObj[key] = null;
          continue;
        }
        if (val !== undefined) {
          newObj[key] = sanitizeData(val);
        }
      }
    }
    return newObj;
  }
  return obj;
};

export const dataService = {
  /**
   * Reads a full data key. 
   * If Electron, uses local file.
   * If Web, uses Firestore.
   */
  readData: async (key) => {
    if (isElectron) {
      try {
        const fullData = await window.electronAPI.readData();
        return fullData[key];
      } catch (err) {
        console.warn(`Error reading ${key} from Electron, falling back to empty`, err);
        return null;
      }
    } else {
      try {
        if (key === 'members') {
          console.log('📂 Fetching members collection directly...');
          const colRef = collection(db, 'members');
          const querySnapshot = await getDocs(colRef);
          return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        }

        // Transactions might be a collection now
        if (key === 'transactions') {
          // Check metadata first
          const docRef = doc(db, 'club_vencedores_data', 'transactions');
          const docSnap = await getDoc(docRef);
          if (docSnap.exists() && docSnap.data().isCollection) {
            console.log('📂 Fetching transactions collection...');
            const colRef = collection(db, 'transactions');
            const querySnapshot = await getDocs(colRef);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          }
        }

        // First check the metadata document in the common collection
        const docRef = doc(db, 'club_vencedores_data', key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const content = docSnap.data();
          
          if (content.isCollection) {
            console.log(`📂 ${key} is stored as a collection. Loading items...`);
            const colRef = collection(db, key);
            const querySnapshot = await getDocs(colRef);
            return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          }
          
          return content.data;
        }
        return null;
      } catch (err) {
        console.error(`Error reading ${key} from Firestore:`, err);
        return null;
      }
    }
  },

  /**
   * Writes data for a specific key.
   * If Electron, updates local file.
   * If Web, updates Firestore.
   */
  writeData: async (key, data) => {
    if (isElectron) {
      const fullData = await window.electronAPI.readData();
      fullData[key] = data;
      return await window.electronAPI.writeData(fullData);
    } else {
      // 1. Members handling (Collection + Deletions)
      if (key === 'members' && Array.isArray(data)) {
        const batch = writeBatch(db);
        
        // Sync deletions: find docs in cloud that are not in incoming array
        const colRef = collection(db, 'members');
        const currentSnap = await getDocs(colRef);
        const incomingIds = data.map(m => m.id);
        
        currentSnap.docs.forEach(docSnap => {
          if (!incomingIds.includes(docSnap.id)) {
            batch.delete(docSnap.ref);
          }
        });

        for (const member of data) {
          if (!member.id) member.id = crypto.randomUUID();
          const memberRef = doc(db, 'members', member.id);
          batch.set(memberRef, sanitizeData(member));
        }
        await batch.commit();
        return { success: true };
      }

      // 2. Transactions handling (Collection + Deletions)
      if (key === 'transactions' && Array.isArray(data)) {
        const batch = writeBatch(db);
        // Mark as collection
        await setDoc(doc(db, 'club_vencedores_data', 'transactions'), { isCollection: true, updatedAt: new Date().toISOString() });
        
        // Sync deletions
        const colRef = collection(db, 'transactions');
        const currentSnap = await getDocs(colRef);
        const incomingIds = data.map(t => t.id);
        
        currentSnap.docs.forEach(docSnap => {
          if (!incomingIds.includes(docSnap.id)) {
            batch.delete(docSnap.ref);
          }
        });

        for (const tx of data) {
          if (!tx.id) tx.id = Date.now().toString() + Math.random().toString(36).substring(2, 7);
          const txRef = doc(db, 'transactions', tx.id);
          batch.set(txRef, sanitizeData(tx));
        }
        await batch.commit();
        return { success: true };
      }

      // Generic handling with sanitization
      await saveCollectionToFirestore(key, sanitizeData(data));
      return { success: true };
    }
  },

  /**
   * Real-time subscription to a data key
   */
  subscribeToKey: (key, callback) => {
    if (isElectron) return () => {}; // Browser only
    
    // Subscribe logic for specific keys
    if (key === 'members' || key === 'transactions') {
      const colRef = collection(db, key);
      return onSnapshot(colRef, (snapshot) => {
        // Skip updates initiated by THIS client to avoid echo/loops
        if (snapshot.metadata.hasPendingWrites) return;
        
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(data);
      });
    }

    // Default document-based subscription
    const docRef = doc(db, 'club_vencedores_data', key);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (snapshot.exists()) {
        callback(snapshot.data().data);
      }
    });
  },

  /**
   * Batch save for migration or full state updates
   */
  saveFullState: async (allData, changedKeys = null) => {
    if (isElectron) {
      return await window.electronAPI.writeData(allData);
    } else {
      const keysToSync = changedKeys || Object.keys(allData);
      for (const key of keysToSync) {
        if (allData[key] !== undefined) {
          await dataService.writeData(key, allData[key]);
        }
      }
      return { success: true };
    }
  }
};

/**
 * Returns default empty values for known keys
 */
function getDefaultValue(key) {
  const arrays = ['members', 'transactions', 'activities', 'points', 'lockedSaturdays', 'units', 'users', 'inventory', 'tents', 'tentAssignments', 'uniformInspections', 'uniformItems'];
  return arrays.includes(key) ? [] : {};
}
