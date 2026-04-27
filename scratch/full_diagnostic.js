import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyB1PFUEHzOjb5UlINsYy-TYthOd9hiQSTA",
    authDomain: "unityclubmanager.firebaseapp.com",
    projectId: "unityclubmanager",
    storageBucket: "unityclubmanager.firebasestorage.app",
    messagingSenderId: "403617338105",
    appId: "1:403617338105:web:38cce769fc80e06c630828",
    measurementId: "G-H38F1FTKZ2"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// All keys that the app tries to save
const ALL_SAVED_KEYS = [
  'members', 'transactions', 'activities', 'points', 'lockedSaturdays',
  'units', 'users', 'inventory', 'cuotaAmount', 'masterGuideData',
  'financeCategories', 'inventoryCategories', 'tents', 'tentAssignments',
  'uniformInspections', 'memberUniforms', 'uniformItems', 'uniformCategories',
  'clubSettings', 'duesConfig', 'qualifications',
  'attendanceRecords', 'firstAidItems', 'disciplineRecords', 'announcements',
  'homeworks', 'memberHomeworkStatus', 'campDetails', 'classRequirements',
  'evaluationGroups', 'memberProgress', 'requirementSections', 'reminders',
  'fixedPaymentConcepts', 'fixedPayments'
];

// Keys that are in COLLECTION_KEYS in dataService.js writeData
const COLLECTION_KEYS = [
  'members', 'transactions', 'users', 'points', 'units',
  'disciplineRecords', 'announcements', 'attendanceRecords',
  'qualifications', 'activities', 'homeworks', 'memberHomeworkStatus',
  'inventory', 'inventoryCategories', 'uniformItems', 'uniformCategories',
  'uniformInspections', 'memberUniforms', 'firstAidItems', 'tents',
  'tentAssignments', 'fixedPayments', 'fixedPaymentConcepts'
];

// Keys NOT in COLLECTION_KEYS (go through master doc / generic path)
const GENERIC_KEYS = ALL_SAVED_KEYS.filter(k => !COLLECTION_KEYS.includes(k));

async function fullDiagnostic() {
  console.log('\n====== DIAGNOSTIC: DATA PERSISTENCE AUDIT ======\n');
  
  console.log('📁 COLLECTION-BASED KEYS (protected by wipe detection):');
  console.log('   ' + COLLECTION_KEYS.join(', '));
  
  console.log('\n⚠️  GENERIC/MASTER-DOC KEYS (less protected):');
  console.log('   ' + GENERIC_KEYS.join(', '));

  console.log('\n\n====== FIRESTORE CURRENT STATE ======\n');

  // Check master docs
  for (const key of ALL_SAVED_KEYS) {
    try {
      const snap = await getDoc(doc(db, 'club_vencedores_data', key));
      if (snap.exists()) {
        const d = snap.data();
        const isCollection = d.isCollection;
        const dataLen = Array.isArray(d.data) ? d.data.length : (d.data !== undefined && d.data !== null ? typeof d.data : 'NULL/MISSING');
        const status = isCollection ? '[COL]' : '[DOC]';
        const updated = d.updatedAt ? new Date(d.updatedAt).toLocaleTimeString() : '?';
        console.log(`  ${status} ${key.padEnd(25)} data: ${String(dataLen).padEnd(10)} updated: ${updated}`);
      } else {
        console.log(`  [---] ${key.padEnd(25)} ⚠️ NOT FOUND in master docs`);
      }
    } catch(e) {
      console.log(`  [ERR] ${key.padEnd(25)} ERROR: ${e.message}`);
    }
  }

  // Check collections
  console.log('\n\n====== FIRESTORE COLLECTIONS (separate docs per record) ======\n');
  for (const key of COLLECTION_KEYS) {
    try {
      const colName = 'clubvencedores_' + key;
      const snap = await getDocs(collection(db, colName));
      console.log(`  ${colName.padEnd(40)} ${snap.size} docs`);
    } catch(e) {
      console.log(`  clubvencedores_${key.padEnd(35)} ERROR: ${e.message}`);
    }
  }

  // Check keys in the save effect that are NOT in the load keys array
  const LOADED_KEYS = [
    'members', 'transactions', 'activities', 'points', 'lockedSaturdays',
    'units', 'users', 'inventory', 'cuotaAmount', 'masterGuideData',
    'financeCategories', 'inventoryCategories', 'tents', 'tentAssignments',
    'uniformInspections', 'memberUniforms', 'uniformItems', 'uniformCategories',
    'clubSettings', 'duesConfig', 'qualifications',
    'attendanceRecords', 'firstAidItems', 'disciplineRecords', 'announcements',
    'homeworks', 'memberHomeworkStatus'
  ];

  const SAVED_BUT_NOT_LOADED = ALL_SAVED_KEYS.filter(k => !LOADED_KEYS.includes(k));
  console.log('\n\n====== 🚨 KEYS SAVED BUT NEVER LOADED (data orphaned) ======\n');
  if (SAVED_BUT_NOT_LOADED.length === 0) {
    console.log('  None - all saved keys are also loaded. ✅');
  } else {
    SAVED_BUT_NOT_LOADED.forEach(k => console.log(`  ⚠️ ${k} is SAVED but NOT in the load list`));
  }
}

fullDiagnostic().catch(console.error);
