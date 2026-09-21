import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  onSnapshot,
  Firestore,
  Unsubscribe,
} from 'firebase/firestore';
import { UserProfile, FirebaseKeyConfig, AdminSettings } from '../types';
import { getFirebaseKeys, getAdminSettings, saveAdminSettings } from './storage';
import {
  saveProfilesToIndexedDB,
  getAllProfilesFromIndexedDB,
  saveFirebaseKeysToIndexedDB,
  setMetaValue,
  getMetaValue,
} from './indexedDb';

export type DataSourceType = 'firebase' | 'indexeddb';

let activeFirebaseApp: FirebaseApp | null = null;
let activeFirestore: Firestore | null = null;
let currentDataSource: DataSourceType = 'indexeddb';
let unsubscribeListener: Unsubscribe | null = null;

const dataSourceListeners: Array<(source: DataSourceType) => void> = [];

export function getDataSource(): DataSourceType {
  return currentDataSource;
}

export function setDataSource(source: DataSourceType) {
  if (currentDataSource !== source) {
    currentDataSource = source;
    dataSourceListeners.forEach((fn) => fn(source));
    setMetaValue('last_data_source', source);
  }
}

export function onDataSourceChange(listener: (source: DataSourceType) => void): () => void {
  dataSourceListeners.push(listener);
  listener(currentDataSource);
  return () => {
    const idx = dataSourceListeners.indexOf(listener);
    if (idx !== -1) dataSourceListeners.splice(idx, 1);
  };
}

/**
 * Retrieves the currently active Firebase slot configuration.
 */
export function getActiveFirebaseConfig(): FirebaseKeyConfig | null {
  const keys = getFirebaseKeys();
  const active = keys.find((k) => k.status === 'active' && k.apiKey.trim() && k.projectId.trim());
  if (active) return active;
  // Fallback to first slot with credentials
  const firstValid = keys.find((k) => k.apiKey.trim() && k.projectId.trim());
  return firstValid || null;
}

/**
 * Initializes or re-initializes Firebase client with the active key config.
 */
export function initFirebaseClient(config?: FirebaseKeyConfig): { success: boolean; firestore: Firestore | null } {
  const targetConfig = config || getActiveFirebaseConfig();
  if (!targetConfig || !targetConfig.apiKey.trim() || !targetConfig.projectId.trim()) {
    activeFirebaseApp = null;
    activeFirestore = null;
    setDataSource('indexeddb');
    return { success: false, firestore: null };
  }

  try {
    const firebaseConfig = {
      apiKey: targetConfig.apiKey.trim(),
      authDomain: targetConfig.authDomain?.trim() || `${targetConfig.projectId.trim()}.firebaseapp.com`,
      projectId: targetConfig.projectId.trim(),
      storageBucket: `${targetConfig.projectId.trim()}.appspot.com`,
    };

    const appName = `aks316_app_${targetConfig.id}`;
    const existingApps = getApps();
    const existing = existingApps.find((a) => a.name === appName);

    if (existing) {
      activeFirebaseApp = existing;
    } else {
      activeFirebaseApp = initializeApp(firebaseConfig, appName);
    }

    activeFirestore = getFirestore(activeFirebaseApp);
    return { success: true, firestore: activeFirestore };
  } catch (err) {
    console.warn('Firebase init error:', err);
    activeFirebaseApp = null;
    activeFirestore = null;
    setDataSource('indexeddb');
    return { success: false, firestore: null };
  }
}

/**
 * Tests a Firebase configuration connection.
 */
export async function testFirebaseConnection(config: FirebaseKeyConfig): Promise<{ success: boolean; message: string }> {
  if (!config.apiKey.trim() || !config.projectId.trim()) {
    return { success: false, message: 'API Key and Project ID are required.' };
  }

  try {
    const init = initFirebaseClient(config);
    if (!init.success || !init.firestore) {
      return { success: false, message: 'Could not initialize Firebase with provided credentials.' };
    }

    // Try a ping write to test document
    const pingDocRef = doc(init.firestore, 'nfc_system', 'ping');
    await setDoc(pingDocRef, {
      lastPing: new Date().toISOString(),
      client: 'NexTech AKS-316 NFC',
    }, { merge: true });

    return { success: true, message: 'Successfully connected to Firebase Firestore in real-time!' };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Failed to connect. Please verify Firebase Project ID and Security Rules.',
    };
  }
}

/**
 * Uploads/syncs all profiles to Firebase Firestore in real-time.
 */
export async function syncProfilesToFirebase(profiles: UserProfile[]): Promise<boolean> {
  // Always update IndexedDB first so local cache is never lost
  await saveProfilesToIndexedDB(profiles);

  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) {
    setDataSource('indexeddb');
    return false;
  }

  try {
    const colRef = collection(firestore, 'nfc_profiles');
    const promises = profiles.map((p) => {
      const docRef = doc(colRef, p.id);
      return setDoc(docRef, { ...p, lastSyncedAt: new Date().toISOString() }, { merge: true });
    });

    await Promise.all(promises);
    setDataSource('firebase');
    return true;
  } catch (err) {
    console.warn('Failed to sync profiles to Firebase:', err);
    setDataSource('indexeddb');
    return false;
  }
}

/**
 * Direct real-time sync for a single modified or newly added profile.
 * Immediately pushes updates to Firestore and updates IndexedDB.
 */
export async function syncSingleProfileToFirebase(profile: UserProfile): Promise<boolean> {
  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) {
    setDataSource('indexeddb');
    return false;
  }

  try {
    const docRef = doc(firestore, 'nfc_profiles', profile.id);
    await setDoc(docRef, { ...profile, lastSyncedAt: new Date().toISOString() }, { merge: true });
    setDataSource('firebase');
    return true;
  } catch (err) {
    console.warn('Failed to sync single profile to Firebase:', err);
    setDataSource('indexeddb');
    return false;
  }
}

/**
 * Directly removes a deleted profile from Firebase Firestore.
 */
export async function deleteProfileFromFirebase(profileId: string): Promise<boolean> {
  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) return false;

  try {
    const docRef = doc(firestore, 'nfc_profiles', profileId);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn('Failed to delete profile from Firebase:', err);
    return false;
  }
}

/**
 * Directly syncs website branding & admin settings to Firebase Firestore (nfc_system/settings).
 */
export async function syncAdminSettingsToFirebase(settings: AdminSettings): Promise<boolean> {
  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) return false;

  try {
    const docRef = doc(firestore, 'nfc_system', 'settings');
    await setDoc(docRef, { ...settings, lastSyncedAt: new Date().toISOString() }, { merge: true });
    return true;
  } catch (err) {
    console.warn('Failed to sync admin settings to Firebase:', err);
    return false;
  }
}

/**
 * Fetches website branding and admin settings from Firebase Firestore.
 */
export async function fetchAdminSettingsRealtime(): Promise<AdminSettings | null> {
  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) return null;

  try {
    const docRef = doc(firestore, 'nfc_system', 'settings');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as AdminSettings;
    }
  } catch (err) {
    console.warn('Could not fetch admin settings from Firebase:', err);
  }
  return null;
}

let adminSettingsUnsub: Unsubscribe | null = null;

/**
 * Subscribes to realtime updates of website settings & branding from Firebase Firestore.
 */
export function subscribeToAdminSettingsRealtime(onUpdate: (settings: AdminSettings) => void): () => void {
  if (adminSettingsUnsub) {
    adminSettingsUnsub();
    adminSettingsUnsub = null;
  }

  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) return () => {};

  try {
    const docRef = doc(firestore, 'nfc_system', 'settings');
    adminSettingsUnsub = onSnapshot(
      docRef,
      (snap) => {
        if (snap.exists()) {
          const cloudSettings = snap.data() as AdminSettings;
          onUpdate(cloudSettings);
        }
      },
      (err) => {
        console.warn('Firebase admin settings listener error:', err);
      }
    );

    return () => {
      if (adminSettingsUnsub) {
        adminSettingsUnsub();
        adminSettingsUnsub = null;
      }
    };
  } catch (err) {
    console.warn('Could not setup admin settings subscription:', err);
    return () => {};
  }
}

/**
 * Fetches latest profiles from Firebase. If failed or offline, loads from IndexedDB.
 */
export async function fetchProfilesRealtime(): Promise<{ profiles: UserProfile[]; source: DataSourceType }> {
  // Check if Firebase is configured
  const { success, firestore } = initFirebaseClient();

  if (success && firestore) {
    try {
      const colRef = collection(firestore, 'nfc_profiles');
      const snapshot = await getDocs(colRef);

      if (!snapshot.empty) {
        const cloudProfiles: UserProfile[] = [];
        snapshot.forEach((docSnap) => {
          cloudProfiles.push(docSnap.data() as UserProfile);
        });

        // Cache into IndexedDB
        await saveProfilesToIndexedDB(cloudProfiles);
        setDataSource('firebase');
        return { profiles: cloudProfiles, source: 'firebase' };
      }
    } catch (err) {
      console.warn('Firebase fetch failed, falling back to IndexedDB:', err);
    }
  }

  // Fallback to IndexedDB
  const localIndexed = await getAllProfilesFromIndexedDB();
  setDataSource('indexeddb');
  return { profiles: localIndexed, source: 'indexeddb' };
}

/**
 * Subscribes to realtime updates from Firebase Firestore.
 */
export function subscribeToFirebaseRealtime(onUpdate: (profiles: UserProfile[]) => void): () => void {
  if (unsubscribeListener) {
    unsubscribeListener();
    unsubscribeListener = null;
  }

  const { success, firestore } = initFirebaseClient();
  if (!success || !firestore) {
    setDataSource('indexeddb');
    return () => {};
  }

  try {
    const colRef = collection(firestore, 'nfc_profiles');
    unsubscribeListener = onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const updatedProfiles: UserProfile[] = [];
          snapshot.forEach((docSnap) => {
            updatedProfiles.push(docSnap.data() as UserProfile);
          });
          saveProfilesToIndexedDB(updatedProfiles);
          setDataSource('firebase');
          onUpdate(updatedProfiles);
        }
      },
      (error) => {
        console.warn('Firebase realtime subscription error:', error);
        setDataSource('indexeddb');
      }
    );

    return () => {
      if (unsubscribeListener) {
        unsubscribeListener();
        unsubscribeListener = null;
      }
    };
  } catch (err) {
    console.warn('Could not setup Firebase subscription:', err);
    setDataSource('indexeddb');
    return () => {};
  }
}
