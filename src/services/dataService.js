import { db, saveCollectionToFirestore, loadCollectionFromFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc, onSnapshot } from '../firebase-config';

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

/**
 * Internal utility to clean data before Firebase.
 * Removes 'undefined' values. Does NOT strip images because photos/signatures
 * are now uploaded to Firebase Storage (URLs are tiny strings).
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
        // Safety net: if somehow a raw base64 still ends up here, strip it to avoid 1MB Firestore limit.
        // Photos/signatures should be Storage URLs (https://...) not data: URIs.
        if (typeof val === 'string' && val.length > 800000 && val.startsWith('data:image')) {
          console.warn(`⚠️ Campo '${key}' contiene base64 crudo (${Math.round(val.length/1024)}KB). Usa Firebase Storage en su lugar. Omitiendo para proteger Firestore.`);
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

/**
 * Canonical list of all keys that use individual Firestore documents (collection mode).
 * These get wipe protection and per-record isolation.
 * Anything NOT in this list is stored as a single master document.
 */
const ALL_COLLECTION_KEYS = [
  // Core data
  'members', 'transactions', 'users', 'points', 'units', 'activities',
  // Attendance & scheduling
  'attendanceRecords', 'lockedSaturdays',
  // Finance
  'fixedPayments', 'fixedPaymentConcepts', 'financeCategories',
  // Discipline & announcements
  'disciplineRecords', 'announcements',
  // Qualifications & progress tracking
  'qualifications', 'classRequirements', 'evaluationGroups', 'requirementSections',
  // Homework
  'homeworks', 'memberHomeworkStatus',
  // Inventory & equipment
  'inventory', 'inventoryCategories', 'firstAidItems', 'tents', 'tentAssignments',
  // Uniformity
  'uniformItems', 'uniformCategories', 'uniformInspections', 'memberUniforms',
  // Reminders
  'reminders',
];

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
                if (content.isCollection) {
                  const colName = STORAGE_PREFIX + key;
                  const colRef = collection(db, colName);
                  const querySnapshot = await getDocs(colRef);
                  if (!querySnapshot.empty) {
                    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                  }
                }
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

        // LAYER 1: Collections (for array-based keys)
        if (ALL_COLLECTION_KEYS.includes(key)) {
          for (const colName of uniqueCandidates) {
            try {
              const colRef = collection(db, colName);
              const querySnapshot = await getDocs(colRef);
              if (!querySnapshot.empty) {
                console.log(`✅ ÉXITO: ${querySnapshot.size} elementos de '${key}' cargados desde colección: ${colName}`);
                return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
              }
            } catch (e) {
              if (e.code !== 'permission-denied') {
                // Silently skip permission errors, they're expected for some roles
              }
            }
          }
        }

        // LAYER 2: Central Document (fallback for all keys, and primary for non-collection keys)
        if (!forceMaster) {
          for (const docId of docCandidates) {
            try {
              const docRef = doc(db, 'club_vencedores_data', docId);
              const docSnap = await getDoc(docRef);
  
              if (docSnap.exists()) {
                const content = docSnap.data();
                if (content.isCollection) {
                  const targetCol = STORAGE_PREFIX + key;
                  const colRef = collection(db, targetCol);
                  const querySnapshot = await getDocs(colRef);
                  if (!querySnapshot.empty) {
                    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
                  }
                }
                
                if (content.data !== undefined) {
                  console.log(`✅ ÉXITO (Master Fallback): '${key}' cargado desde documento central.`);
                  return content.data;
                }
              }
            } catch (e) {
              console.warn(`⚠️ Error leyendo central '${docId}':`, e.message);
            }
          }
        }

        console.warn(`❌ FIN: No se encontraron datos para '${key}'.`);
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

      // LOCKOUT: Prevent any write for the first 5 seconds after data loads
      // to avoid overwriting cloud data with empty initial state during page load.
      const now = Date.now();
      if (!window.__lastDataInit) window.__lastDataInit = now;
      if (now - window.__lastDataInit < 5000 && !options.force) {
        console.warn('⚠️ LOCKOUT: Bloqueando guardado durante fase de inicialización (5s).');
        return { success: false, error: 'init_lockout' };
      }

      // Collection-based handling: per-record isolation + wipe protection
      if (ALL_COLLECTION_KEYS.includes(key) && Array.isArray(data)) {
        const operations = [];
        const colName = STORAGE_PREFIX + key;
        
        // Read current cloud state for wipe protection
        const colRef = collection(db, colName);
        const currentSnap = await getDocs(colRef);
        
        // SAFETY: Differential Wipe Protection
        if (!currentSnap.empty) {
          const cloudCount = currentSnap.size;
          const localCount = data.length;
          
          if (localCount === 0) {
            console.warn(`🛑 PROTECCIÓN ANTIBORRADO: Se intentó guardar una lista VACÍA en '${colName}' que tiene ${cloudCount} registros. Operación cancelada.`);
            return { success: false, error: 'wipe_protection_triggered_empty' };
          }
          
          if (localCount < cloudCount * 0.7 && cloudCount > 5) {
            console.warn(`🛑 PROTECCIÓN ANTIBORRADO: El guardado local tiene solo ${localCount} registros vs ${cloudCount} en la nube (Pérdida > 30%). Abortando.`);
            return { success: false, error: 'wipe_protection_triggered_differential' };
          }
        }

        // Build IDs for sync-deletion detection
        const incomingIds = data.map(item => String(
          item.id || item.username || 
          (item.firstName ? `${item.firstName}_${item.lastName}` : Date.now().toString())
        ));
        
        currentSnap.docs.forEach(docSnap => {
          if (!incomingIds.includes(String(docSnap.id))) {
            operations.push({ type: 'delete', ref: docSnap.ref });
          }
        });

        // Upsert items
        for (const item of data) {
          const itemId = String(
            item.id || item.username || 
            (item.firstName ? `${item.firstName}_${item.lastName}` : `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`)
          );
          const itemRef = doc(db, colName, itemId);
          operations.push({ type: 'set', ref: itemRef, data: sanitizeData(item) });
        }

        // Process in batches of 450 (safely under Firestore's 500 limit)
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
          // Mark master doc as collection-backed
          try {
            await setDoc(doc(db, 'club_vencedores_data', key), { 
              isCollection: true, 
              updatedAt: new Date().toISOString() 
            }, { merge: true });
          } catch (e) {
            // Non-critical; permissions may restrict non-admins
          }
          // Redundant master doc backup for legacy compatibility
          try {
            await saveCollectionToFirestore(key, sanitizeData(data));
          } catch (e) {
            console.warn(`Could not update master document for ${key}:`, e.message);
          }
        }
        return { success: true };
      }

      // Generic handling for non-array / non-collection data (config objects, settings, etc.)
      if (!skipMaster) {
        try {
          // PROTECCIÓN ANTIBORRADO para Master Docs que son arrays
          if (Array.isArray(data)) {
            const cloudDoc = await getDoc(doc(db, 'club_vencedores_data', key));
            if (cloudDoc.exists()) {
              const cloudData = cloudDoc.data().data;
              if (Array.isArray(cloudData) && cloudData.length > 5) {
                if (data.length === 0) {
                  console.warn(`🛑 PROTECCIÓN (Master): Lista VACÍA para '${key}' rechazada. Nube tiene ${cloudData.length} registros.`);
                  return { success: false, error: 'wipe_protection_triggered_empty' };
                }
                if (data.length < cloudData.length * 0.7) {
                  console.warn(`🛑 PROTECCIÓN (Master): Pérdida >30% para '${key}' (local: ${data.length}, nube: ${cloudData.length}). Abortando.`);
                  return { success: false, error: 'wipe_protection_triggered_differential' };
                }
              }
            }
          }
          await saveCollectionToFirestore(key, sanitizeData(data));
        } catch (e) {
          console.warn(`Could not save master document for '${key}':`, e.message);
        }
      }
      return { success: true };
    }
  },

  /**
   * Real-time subscription to a data key.
   */
  subscribeToKey: (key, callback) => {
    if (isElectron) return () => {}; // Browser only
    
    if (ALL_COLLECTION_KEYS.includes(key)) {
      const STORAGE_PREFIX = 'clubvencedores_';
      const colName = STORAGE_PREFIX + key;
      const colRef = collection(db, colName);
      return onSnapshot(colRef, (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(data);
      });
    }

    // Default document-based subscription for master docs
    const docRef = doc(db, 'club_vencedores_data', key);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (snapshot.exists()) {
        callback(snapshot.data().data);
      }
    });
  },

  /**
   * Batch save for migration or full state updates.
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
 * Returns default empty values for known keys (used for initialization).
 */
export function getDefaultValue(key) {
  const arrays = [
    'members', 'transactions', 'activities', 'points', 'lockedSaturdays', 'units', 'users',
    'inventory', 'inventoryCategories', 'tents', 'tentAssignments', 'uniformInspections',
    'uniformItems', 'uniformCategories', 'memberUniforms', 'firstAidItems',
    'classRequirements', 'evaluationGroups', 'requirementSections', 'reminders',
    'fixedPayments', 'fixedPaymentConcepts', 'disciplineRecords', 'announcements',
    'qualifications', 'homeworks', 'memberHomeworkStatus', 'attendanceRecords'
  ];
  return arrays.includes(key) ? [] : {};
}
