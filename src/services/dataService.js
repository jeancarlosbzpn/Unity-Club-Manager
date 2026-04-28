import { db, saveCollectionToFirestore, loadCollectionFromFirestore, doc, setDoc, getDoc, collection, getDocs, writeBatch, deleteDoc, onSnapshot } from '../firebase-config';

const isElectron = typeof window !== 'undefined' && window.electronAPI !== undefined;

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
  'attendanceRecords', 'lockedSaturdays',
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
      const STORAGE_PREFIX = 'clubvencedores_';
      const colName = STORAGE_PREFIX + key;
      
      // 1. Try Collection First
      if (ALL_COLLECTION_KEYS.includes(key)) {
        const colRef = collection(db, colName);
        const querySnapshot = await getDocs(colRef);
        
        if (!querySnapshot.empty) {
          console.log(`✅ Colección '${key}' encontrada (${querySnapshot.size} docs).`);
          // Check if this was stored as an Object or Array
          // If docs have numeric-like or specific IDs, we'll see.
          // For safety, we check metadata or structure.
          const masterRef = doc(db, 'club_vencedores_data', key);
          const masterSnap = await getDoc(masterRef);
          const isMap = masterSnap.exists() && masterSnap.data().isMap === true;

          if (isMap) {
            const map = {};
            querySnapshot.docs.forEach(d => { map[d.id] = d.data(); });
            return map;
          } else {
            return querySnapshot.docs.map(d => ({ ...d.data(), id: d.id }));
          }
        }
      }

      // 2. Fallback to Master Doc
      const docRef = doc(db, 'club_vencedores_data', key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().data;
      }
      
      return null;
    } catch (err) {
      console.error(`Error leyendo ${key}:`, err);
      return null;
    }
  },

  writeData: async (key, data, options = {}) => {
    if (isElectron) {
      const fullData = await window.electronAPI.readData();
      fullData[key] = data;
      return await window.electronAPI.writeData(fullData);
    }

    const now = Date.now();
    if (!window.__lastDataInit) window.__lastDataInit = now;
    if (now - window.__lastDataInit < 5000 && !options.force) {
      return { success: false, error: 'init_lockout' };
    }

    if (ALL_COLLECTION_KEYS.includes(key)) {
      const colName = 'clubvencedores_' + key;
      const operations = [];
      const isArray = Array.isArray(data);
      const isObject = !isArray && data !== null && typeof data === 'object';

      if (isArray || isObject) {
        // Wipe Protection
        const colRef = collection(db, colName);
        const currentSnap = await getDocs(colRef);
        const cloudCount = currentSnap.size;
        const localCount = isArray ? data.length : Object.keys(data).length;

        if (cloudCount > 5) {
          if (localCount === 0) return { success: false, error: 'wipe_protection' };
          if (localCount < cloudCount * 0.7) return { success: false, error: 'wipe_protection' };
        }

        if (isArray) {
          const incomingIds = data.map(item => String(item.id || item.username || Date.now()));
          currentSnap.docs.forEach(docSnap => {
            if (!incomingIds.includes(String(docSnap.id))) operations.push({ type: 'delete', ref: docSnap.ref });
          });
          data.forEach(item => {
            const id = String(item.id || item.username || Date.now() + Math.random());
            operations.push({ type: 'set', ref: doc(db, colName, id), data: sanitizeData(item) });
          });
        } else {
          // KEYED OBJECT (Map)
          const incomingKeys = Object.keys(data);
          currentSnap.docs.forEach(docSnap => {
            if (!incomingKeys.includes(docSnap.id)) operations.push({ type: 'delete', ref: docSnap.ref });
          });
          incomingKeys.forEach(keyId => {
            operations.push({ type: 'set', ref: doc(db, colName, keyId), data: sanitizeData(data[keyId]) });
          });
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
          await batch.commit();
        }

        // Update Metadata
        await setDoc(doc(db, 'club_vencedores_data', key), { 
          isCollection: true, 
          isMap: isObject,
          updatedAt: new Date().toISOString(),
          data: sanitizeData(data) // Backup in master doc
        }, { merge: true });

        return { success: true };
      }
    }

    // Default Master Doc Save
    await saveCollectionToFirestore(key, sanitizeData(data));
    return { success: true };
  },

  subscribeToKey: (key, callback) => {
    if (isElectron) return () => {};
    if (ALL_COLLECTION_KEYS.includes(key)) {
      const colRef = collection(db, 'clubvencedores_' + key);
      return onSnapshot(colRef, (snapshot) => {
        if (snapshot.metadata.hasPendingWrites) return;
        // This is tricky for Maps vs Arrays... 
        // For now, most real-time stuff are arrays.
        const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        callback(data);
      });
    }
    const docRef = doc(db, 'club_vencedores_data', key);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) return;
      if (snapshot.exists()) callback(snapshot.data().data);
    });
  },

  saveFullState: async (allData, changedKeys = null) => {
    const keysToSync = changedKeys || Object.keys(allData);
    for (const key of keysToSync) {
      if (allData[key] !== undefined) await dataService.writeData(key, allData[key]);
    }
    return { success: true };
  },

  saveSingle: async (key, item) => {
    if (isElectron) return { success: false };
    try {
      const colName = 'clubvencedores_' + key;
      const id = String(item.id || Date.now() + Math.random());
      await setDoc(doc(db, colName, id), sanitizeData(item));
      return { success: true };
    } catch (err) {
      console.error(`Error saving single ${key}:`, err);
      return { success: false, error: err.message };
    }
  }
};

export function getDefaultValue(key) {
  const arrays = ['members', 'transactions', 'activities', 'points', 'lockedSaturdays', 'units', 'users', 'inventory', 'inventoryCategories', 'tents', 'tentAssignments', 'uniformInspections', 'uniformItems', 'uniformCategories', 'firstAidItems', 'classRequirements', 'evaluationGroups', 'requirementSections', 'reminders', 'fixedPayments', 'fixedPaymentConcepts', 'disciplineRecords', 'announcements', 'qualifications', 'homeworks', 'memberHomeworkStatus', 'attendanceRecords', 'unit_messages'];
  return arrays.includes(key) ? [] : {};
}
