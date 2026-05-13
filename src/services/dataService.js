import { db, saveCollectionToFirestore, loadCollectionFromFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc, onSnapshot } from '../firebase-config';

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

// Multi-tenancy support
let currentClubId = 'vencedores'; // Default for backward compatibility

/**
 * Updates the current club context for all data operations.
 */
export const setClubId = (id) => {
  if (id) {
    currentClubId = id;
    console.log(`🏢 DataService: Club context set to '${id}'`);
  }
};

const getPrefix = () => {
  // Special case for users: we keep a global registry for authentication, 
  // but we prefix it to distinguish from other apps if needed.
  // For now, we keep using 'clubvencedores_' for the users collection 
  // to maintain compatibility with the master login.
  return currentClubId === 'vencedores' ? 'clubvencedores_' : `club_${currentClubId}_`;
};

const getMasterDocPath = () => {
  return currentClubId === 'vencedores' ? 'club_vencedores_data' : `club_${currentClubId}_data`;
};

/**
 * Internal utility to clean data before Firebase.
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
        if (typeof val === 'string' && val.length > 800000 && val.startsWith('data:image')) {
          console.error(`❌ ERROR CRÍTICO: El campo '${key}' contiene una imagen base64 demasiado grande (${Math.round(val.length/1024)}KB).`);
          throw new Error(`La imagen en '${key}' es muy grande para guardarse directamente. Asegúrese de que la subida a la nube (Storage) se haya completado correctamente antes de guardar.`);
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

const toSnakeCase = (str) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

const ALL_COLLECTION_KEYS = [
  'members', 'transactions', 'users', 'points', 'units', 'activities',
  'attendanceRecords',
  'fixedPayments', 'fixedPaymentConcepts', 'financeCategories',
  'disciplineRecords', 'announcements',
  'qualifications', 'classRequirements', 'evaluationGroups', 'requirementSections',
  'homeworks', 'memberHomeworkStatus',
  'inventory', 'inventoryCategories', 'firstAidItems', 'tents', 'tentAssignments',
  'uniformItems', 'uniformCategories', 'uniformInspections', 'memberUniforms',
  'reminders', 'campDetails', 'memberProgress', 'unit_messages'
];

export const dataService = {
  readData: async (key, options = {}) => {
    if (isElectron) {
      try {
        const fullData = await window.electronAPI.readData();
        return fullData[key];
      } catch (err) { return null; }
    }
    
    try {
      // Special case for global registries
      const colName = (key === 'users') ? 'clubvencedores_users' : (key === 'clubs') ? 'clubvencedores_clubs' : getPrefix() + key;
      const masterDocCollection = (key === 'users' || key === 'clubs') ? null : getMasterDocPath();
      
      if (key === 'users') console.log(`🔍 DataService: Reading users from collection '${colName}'`);
      
      // 1. Try Collection First
      if (ALL_COLLECTION_KEYS.includes(key)) {
        const colRef = collection(db, colName);
        const querySnapshot = await getDocs(colRef);
        
        if (!querySnapshot.empty) {
          console.log(`✅ Colección '${colName}' encontrada (${querySnapshot.size} docs).`);
          
          let isMap = false;
          if (masterDocCollection) {
            try {
              const masterRef = doc(db, masterDocCollection, key);
              const masterSnap = await getDoc(masterRef);
              isMap = masterSnap.exists() && masterSnap.data().isMap === true;
            } catch (e) {
              console.warn(`⚠️ Error reading master doc for '${key}':`, e);
            }
          }

          if (isMap) {
            const map = {};
            querySnapshot.docs.forEach(d => { map[d.id] = d.data(); });
            return map;
          } else {
            return querySnapshot.docs.map(d => {
              const docData = d.data();
              // Unwrap primitive values that were wrapped for Firestore storage
              if (docData._isPrimitive === true) return docData._primitiveValue;
              return { ...docData, id: d.id };
            });
          }
        }
      }

      // 2. Fallback to Master Doc
      if (masterDocCollection) {
        const docRef = doc(db, masterDocCollection, key);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data().data;
        }
      }
      
      return null;
    } catch (err) {
      console.error(`Error leyendo ${key} (Club: ${currentClubId}):`, err);
      return null;
    }
  },

  writeData: async (key, data, options = {}) => {
    if (isElectron) {
      const fullData = await window.electronAPI.readData();
      fullData[key] = data;
      return await window.electronAPI.writeData(fullData);
    }

    // Lockout removed - relying on dataLoaded state in the component for safety

    if (ALL_COLLECTION_KEYS.includes(key) || key === 'clubs') {
      // Global registries (users and clubs)
      const colName = (key === 'users') ? 'clubvencedores_users' : (key === 'clubs') ? 'clubvencedores_clubs' : getPrefix() + key;
      const masterDocCollection = (key === 'users' || key === 'clubs') ? null : getMasterDocPath();
      
      const operations = [];
      const isArray = Array.isArray(data);
      const isObject = !isArray && data !== null && typeof data === 'object';

      if (isArray || isObject) {
        // Wipe Protection (Skip for global registries to avoid permission/access issues)
        let currentSnap = null;
        let cloudCount = 0;
        if (key !== 'users' && key !== 'clubs') {
          try {
            const colRef = collection(db, colName);
            currentSnap = await getDocs(colRef);
            cloudCount = currentSnap.size;
          } catch (e) {
            console.warn(`⚠️ Wipe protection check failed for '${key}':`, e);
          }
        }
        
        const localCount = isArray ? data.length : Object.keys(data).length;

        if (cloudCount > 5) {
          if (localCount === 0) {
            console.error(`🛑 WIPE PROTECTION: Attempted to save empty list to '${colName}' when cloud has ${cloudCount} items.`);
            return { success: false, error: 'wipe_protection' };
          }
          if (localCount < cloudCount * 0.7) {
            console.error(`🛑 WIPE PROTECTION: Attempted to save ${localCount} items to '${colName}' when cloud has ${cloudCount} (too many deletions).`);
            return { success: false, error: 'wipe_protection' };
          }
        }

        if (isArray) {
          const incomingIds = data.map(item => 
            (item !== null && typeof item === 'object') 
              ? String(item.id || item.username || JSON.stringify(item))
              : String(item)
          );
          if (currentSnap) {
            currentSnap.docs.forEach(docSnap => {
              if (!incomingIds.includes(String(docSnap.id))) operations.push({ type: 'delete', ref: docSnap.ref });
            });
          }
          data.forEach((item, idx) => {
            let docData, id;
            if (item === null || typeof item !== 'object') {
              // Primitive value (string, number) — wrap for Firestore compatibility
              id = String(item ?? idx);
              docData = { _primitiveValue: item, _isPrimitive: true };
            } else {
              id = String(item.id || item.username || Date.now() + Math.random());
              docData = sanitizeData(item);
            }
            operations.push({ type: 'set', ref: doc(db, colName, id), data: docData });
          });
        } else {
          // KEYED OBJECT (Map)
          const incomingKeys = Object.keys(data);
          if (currentSnap) {
            currentSnap.docs.forEach(docSnap => {
              if (!incomingKeys.includes(docSnap.id)) operations.push({ type: 'delete', ref: docSnap.ref });
            });
          }
          incomingKeys.forEach(keyId => {
            operations.push({ type: 'set', ref: doc(db, colName, keyId), data: sanitizeData(data[keyId]) });
          });
        }

        if (key === 'users') {
          console.log(`💾 DataService: Writing ${localCount} users to collection '${colName}'`);
          console.log(`📋 User IDs to be saved:`, incomingIds);
        }

        // Batch execution
        const chunkSize = 450;
        for (let i = 0; i < operations.length; i += chunkSize) {
          const chunk = operations.slice(i, i + chunkSize);
          const batch = writeBatch(db);
          chunk.forEach(op => {
            if (op.type === 'delete') batch.delete(op.ref);
            else batch.set(op.ref, op.data);
          });
          try {
            await batch.commit();
          } catch (err) {
            console.error(`❌ Batch commit failed for '${key}':`, err);
            return { success: false, error: err.message };
          }
        }

        // Update Metadata and Master Doc backup
        if (masterDocCollection) {
          try {
            await setDoc(doc(db, masterDocCollection, key), { 
              isCollection: true, 
              isMap: isObject,
              updatedAt: new Date().toISOString(),
              data: sanitizeData(data) // Backup in master doc
            }, { merge: true });
          } catch (masterErr) {
            console.warn(`⚠️ Master doc backup failed for '${key}' (likely size limit), but collection was updated.`, masterErr);
          }
        }

        return { success: true };
      }
    }

    // Default Master Doc Save (for single-value keys or legacy structures)
    const masterDocCollection = (key === 'users') ? 'club_vencedores_data' : getMasterDocPath();
    try {
      await setDoc(doc(db, masterDocCollection, key), { 
        data: sanitizeData(data), 
        updatedAt: new Date().toISOString() 
      }, { merge: true });
      return { success: true };
    } catch (e) {
      console.error(`❌ Error saving ${key} to ${masterDocCollection}:`, e);
      return { success: false, error: e.message };
    }
  },

  subscribeToKey: (key, callback) => {
    if (isElectron) return () => {};
    const colName = (key === 'users') ? 'clubvencedores_users' : (key === 'clubs') ? 'clubvencedores_clubs' : getPrefix() + key;
    const masterDocCollection = (key === 'users' || key === 'clubs') ? null : getMasterDocPath();

    if (ALL_COLLECTION_KEYS.includes(key)) {
      const colRef = collection(db, colName);
      return onSnapshot(colRef, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(data);
      });
    }
    const docRef = doc(db, masterDocCollection, key);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) callback(snapshot.data().data);
    });
  },

  saveFullState: async (allData, changedKeys = null) => {
    const keysToSync = changedKeys || Object.keys(allData);
    const results = [];
    
    for (const key of keysToSync) {
      if (allData[key] !== undefined) {
        const res = await dataService.writeData(key, allData[key]);
        results.push({ key, ...res });
      }
    }
    
    const errors = results.filter(r => !r.success);
    if (errors.length > 0) {
      console.error('❌ Errors during saveFullState:', errors);
      return { success: false, errors };
    }
    return { success: true };
  },

  saveSingle: async (key, item) => {
    if (isElectron) return { success: false };
    try {
      const colName = (key === 'users') ? 'clubvencedores_users' : getPrefix() + key;
      const id = String(item.id || Date.now() + Math.random());
      await setDoc(doc(db, colName, id), sanitizeData(item));
      return { success: true };
    } catch (err) {
      console.error(`Error saving single ${key}:`, err);
      return { success: false, error: err.message };
    }
  },

  deleteItem: async (key, id) => {
    if (isElectron) return { success: false };
    try {
      const colName = (key === 'users') ? 'clubvencedores_users' : getPrefix() + key;
      await deleteDoc(doc(db, colName, String(id)));
      return { success: true };
    } catch (err) {
      console.error(`Error deleting ${key}:`, err);
      return { success: false, error: err.message };
    }
  }
};

export function getDefaultValue(key) {
  const arrays = ['members', 'transactions', 'activities', 'points', 'lockedSaturdays', 'units', 'users', 'inventory', 'inventoryCategories', 'tents', 'tentAssignments', 'uniformInspections', 'uniformItems', 'uniformCategories', 'firstAidItems', 'classRequirements', 'evaluationGroups', 'requirementSections', 'reminders', 'fixedPayments', 'fixedPaymentConcepts', 'disciplineRecords', 'announcements', 'qualifications', 'homeworks', 'memberHomeworkStatus', 'attendanceRecords', 'unit_messages'];
  return arrays.includes(key) ? [] : {};
}
