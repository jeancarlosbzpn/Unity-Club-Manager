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
        // Strip very large base64 from Firestore to prevent 1MB limit issues
        // Increased from 5,000 to 100,000 (~75KB) to allow signatures and member photos
        if (typeof val === 'string' && val.length > 100000 && val.startsWith('data:image')) {
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

/**
 * Helper to convert camelCase to snake_case for DB collection names
 */
const toSnakeCase = (str) => {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
};

export const dataService = {
  /**
   * Reads a full data key. 
   * If Electron, uses local file.
   * If Web, uses Firestore.
   */
  readData: async (key, options = {}) => {
    const { forceMaster = false } = options;

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
        const STORAGE_PREFIX = 'clubvencedores_';
        const snakeKey = toSnakeCase(key);
        
        // Helper for Master Doc candidates
        const docCandidates = [...new Set([key, snakeKey])];

        // LAYER 0: Master Document (PRIORITY if forceMaster is true)
        if (forceMaster) {
          console.log(`💎 MODO MAESTRO: Priorizando documento central para '${key}'...`);
          for (const docId of docCandidates) {
            try {
              const docRef = doc(db, 'club_vencedores_data', docId);
              const docSnap = await getDoc(docRef);
              if (docSnap.exists()) {
                const content = docSnap.data();
                // If the master doc says it's shifted to a collection, query the collection!
                if (content.isCollection) {
                  console.log(`📂 Metadatos de Maestro para '${docId}' indican colección. Consultando...`);
                  const colName = STORAGE_PREFIX + key;
                  const colRef = collection(db, colName);
                  const querySnapshot = await getDocs(colRef);
                  if (!querySnapshot.empty) {
                    console.log(`✅ ÉXITO MAESTRO (Colección): '${key}' cargado.`);
                    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                  }
                }
                console.log(`✅ ÉXITO MAESTRO: '${key}' cargado desde documento central.`);
                return content.data;
              }
            } catch (e) {
              console.warn(`⚠️ Aviso Maestro: No se pudo leer central '${docId}'.`, e.message);
            }
          }
        }

        const uniqueCandidates = [...new Set([
           STORAGE_PREFIX + snakeKey,
           STORAGE_PREFIX + key,
           snakeKey,
           key
        ])];

        // LAYER 1: Collections
        console.log(`🔍 Intentando cargar '${key}' desde colecciones Cloud...`);
        const COLLECTION_KEYS = ['members', 'transactions', 'users', 'points', 'units', 'disciplineRecords', 'announcements', 'attendanceRecords', 'qualifications'];
        
        for (const colName of uniqueCandidates) {
          try {
            const colRef = collection(db, colName);
            const querySnapshot = await getDocs(colRef);
            if (!querySnapshot.empty) {
              console.log(`✅ ÉXITO: ${querySnapshot.size} elementos de '${key}' cargados desde colección: ${colName}`);
              return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
            } else if (COLLECTION_KEYS.includes(key)) {
              // IMPORTANT: If it's a collection-tracked key and the collection is EMPTY,
              // it means there are actually 0 items. DO NOT fall back to Master Doc ghosts.
              console.log(`ℹ️ La colección '${colName}' está vacía. Retornando lista vacía.`);
              return [];
            }
          } catch (e) {
            if (e.code === 'permission-denied') {
              console.warn(`⚠️ Aviso: Permiso denegado para la colección '${colName}'.`);
            }
          }
        }

        // LAYER 2: Central Document (Fallback if not forceMaster or collections empty)
        if (!forceMaster) {
          for (const docId of docCandidates) {
            try {
              console.log(`🔍 Buscando '${key}' en documento central: ${docId}...`);
              const docRef = doc(db, 'club_vencedores_data', docId);
              const docSnap = await getDoc(docRef);
  
              if (docSnap.exists()) {
                const content = docSnap.data();
                if (content.isCollection) {
                  console.log(`📂 Metadatos de '${docId}' indican colección. Consultando...`);
                  const targetCol = (key === 'members' || key === 'transactions') ? (STORAGE_PREFIX + key) : (STORAGE_PREFIX + key);
                  const colRef = collection(db, targetCol);
                  const querySnapshot = await getDocs(colRef);
                  return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                }
                console.log(`✅ ÉXITO: '${key}' cargado desde documento central: ${docId}`);
                return content.data;
              }
            } catch (e) {
              console.warn(`⚠️ Error leyendo central '${docId}':`, e.message);
            }
          }
        }

        console.warn(`❌ FIN: No se encontraron datos para '${key}' tras agotar todas las rutas.`);
        return null;
      } catch (err) {
        console.error(`Error crítico leyendo ${key} de Firestore:`, err);
        return null;
      }
    }
  },

  /**
   * Writes data for a specific key.
   * If Electron, updates local file.
   * If Web, updates Firestore.
   */
  writeData: async (key, data, options = {}) => {
    const { skipMaster = false } = options;
    if (isElectron) {
      const fullData = await window.electronAPI.readData();
      fullData[key] = data;
      return await window.electronAPI.writeData(fullData);
    } else {
      const STORAGE_PREFIX = 'clubvencedores_';
      const COLLECTION_KEYS = ['members', 'transactions', 'users', 'points', 'units', 'disciplineRecords', 'announcements', 'attendanceRecords', 'qualifications'];

      // Collection-based handling for shared data
      if (COLLECTION_KEYS.includes(key) && Array.isArray(data)) {
        const operations = [];
        const colName = STORAGE_PREFIX + key;
        
        // Sync deletions: find docs in cloud that are not in incoming array
        const colRef = collection(db, colName);
        const currentSnap = await getDocs(colRef);
        // FORCE all IDs to strings for robust comparison
        const incomingIds = data.map(item => String(item.id || item.username || (item.firstName + '_' + item.lastName)));
        
        currentSnap.docs.forEach(docSnap => {
          // Type-agnostic comparison: force everything to string
          if (!incomingIds.includes(String(docSnap.id))) {
            console.log(`🗑️ Cloud Sync: Deleting ghost record '${docSnap.id}' from '${colName}'`);
            operations.push({ type: 'delete', ref: docSnap.ref });
          }
        });

        // Upsert items
        for (const item of data) {
          const itemId = String(item.id || item.username || (item.firstName ? (item.firstName + '_' + item.lastName) : Date.now().toString() + Math.random().toString(36).substring(2, 7)));
          const itemRef = doc(db, colName, itemId);
          operations.push({ type: 'set', ref: itemRef, data: sanitizeData(item) });
        }

        // Process in chunks of 450 to stay safely under Firestore's 500 limit
        const chunkSize = 450;
        for (let i = 0; i < operations.length; i += chunkSize) {
          const chunk = operations.slice(i, i + chunkSize);
          const chunkBatch = writeBatch(db);
          for (const op of chunk) {
            if (op.type === 'delete') chunkBatch.delete(op.ref);
            else if (op.type === 'set') chunkBatch.set(op.ref, op.data);
          }
          await chunkBatch.commit();
        }

        if (!skipMaster) {
          // Mark as collection in central metadata
          try {
            await setDoc(doc(db, 'club_vencedores_data', key), { 
              isCollection: true, 
              updatedAt: new Date().toISOString() 
            }, { merge: true });
          } catch (e) {
            console.warn(`Could not set collection metadata for ${key} (Permission Denied for non-admins)`, e.message);
          }
        }

        // Also save to central doc for redundancy/legacy compatibility (UNLESS skipMaster)
        if (!skipMaster) {
          try {
            await saveCollectionToFirestore(key, sanitizeData(data));
          } catch (e) {
            console.warn(`Could not update master document for ${key} (Permission Denied for non-admins)`, e.message);
          }
        }
        return { success: true };
      }

      // Generic handling for non-collection data (Config, settings, etc)
      if (!skipMaster) {
        try {
          await saveCollectionToFirestore(key, sanitizeData(data));
        } catch (e) {
          console.warn(`Could not update master document for generic key ${key}`, e.message);
        }
      }
      return { success: true };
    }
  },

  /**
   * Real-time subscription to a data key
   */
  subscribeToKey: (key, callback) => {
    if (isElectron) return () => {}; // Browser only
    
    const COLLECTION_KEYS = ['members', 'transactions', 'users', 'points', 'units', 'disciplineRecords', 'announcements', 'attendanceRecords', 'qualifications'];
    
    if (COLLECTION_KEYS.includes(key)) {
      const STORAGE_PREFIX = 'clubvencedores_';
      const colName = STORAGE_PREFIX + key;
      const colRef = collection(db, colName);
      return onSnapshot(colRef, (snapshot) => {
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
