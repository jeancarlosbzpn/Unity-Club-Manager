import { db, saveCollectionToFirestore, loadCollectionFromFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc } from '../firebase-config';

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

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
      // Special handling for members
      if (key === 'members' && Array.isArray(data)) {
        // Use batch to update multiple members if needed, 
        // but typically the app saves the whole array.
        // For efficiency in a web app, we'd ideally save only one member, 
        // but to keep the 23k lines of code working with minimal changes,
        // we'll implement a "sync" approach for the array.
        const batch = writeBatch(db);
        
        // This is a heavy operation if members > 100. 
        // In the future, we should refactor the UI to save individual members.
        for (const member of data) {
          if (!member.id) member.id = crypto.randomUUID();
          const memberRef = doc(db, 'members', member.id);
          batch.set(memberRef, member);
        }
        await batch.commit();
        return { success: true };
      }

      // Generic handling
      await saveCollectionToFirestore(key, data);
      return { success: true };
    }
  },

  /**
   * Batch save for migration or full state updates
   */
  saveFullState: async (allData) => {
    if (isElectron) {
      return await window.electronAPI.writeData(allData);
    } else {
      for (const [key, value] of Object.entries(allData)) {
        await dataService.writeData(key, value);
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
