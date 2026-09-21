import { UserProfile, FirebaseKeyConfig, AdminSettings } from '../types';

const DB_NAME = 'aks316_nfc_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

export function openIndexedDB(): Promise<IDBDatabase> {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.reject(new Error('IndexedDB is not supported in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('profiles')) {
        const profileStore = db.createObjectStore('profiles', { keyPath: 'id' });
        profileStore.createIndex('slug', 'slug', { unique: false });
        profileStore.createIndex('token', 'token', { unique: false });
      }

      if (!db.objectStoreNames.contains('firebase_keys')) {
        db.createObjectStore('firebase_keys', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('meta')) {
        db.createObjectStore('meta', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });

  return dbPromise;
}

export async function getAllProfilesFromIndexedDB(): Promise<UserProfile[]> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction('profiles', 'readonly');
      const store = tx.objectStore('profiles');
      const request = store.getAll();

      request.onsuccess = () => {
        resolve((request.result as UserProfile[]) || []);
      };

      request.onerror = () => {
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB read profiles error:', err);
    return [];
  }
}

export async function saveProfilesToIndexedDB(profiles: UserProfile[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction(['profiles', 'meta'], 'readwrite');
    const store = tx.objectStore('profiles');

    // Clear old records and put current profiles
    store.clear();
    profiles.forEach((p) => {
      store.put(p);
    });

    const metaStore = tx.objectStore('meta');
    metaStore.put({ key: 'last_saved', timestamp: new Date().toISOString() });
    metaStore.put({ key: 'profile_count', count: profiles.length });
  } catch (err) {
    console.warn('IndexedDB save profiles error:', err);
  }
}

export async function getFirebaseKeysFromIndexedDB(): Promise<FirebaseKeyConfig[] | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction('firebase_keys', 'readonly');
      const store = tx.objectStore('firebase_keys');
      const request = store.getAll();

      request.onsuccess = () => {
        const res = request.result as FirebaseKeyConfig[];
        resolve(res && res.length > 0 ? res : null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function saveFirebaseKeysToIndexedDB(keys: FirebaseKeyConfig[]): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction('firebase_keys', 'readwrite');
    const store = tx.objectStore('firebase_keys');
    store.clear();
    keys.forEach((k) => {
      store.put(k);
    });
  } catch (err) {
    console.warn('IndexedDB save firebase keys error:', err);
  }
}

export async function getMetaValue<T>(key: string): Promise<T | null> {
  try {
    const db = await openIndexedDB();
    return new Promise((resolve) => {
      const tx = db.transaction('meta', 'readonly');
      const store = tx.objectStore('meta');
      const request = store.get(key);

      request.onsuccess = () => {
        resolve(request.result?.value ?? null);
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

export async function setMetaValue(key: string, value: any): Promise<void> {
  try {
    const db = await openIndexedDB();
    const tx = db.transaction('meta', 'readwrite');
    const store = tx.objectStore('meta');
    store.put({ key, value, updatedAt: new Date().toISOString() });
  } catch (err) {
    console.warn('IndexedDB setMetaValue error:', err);
  }
}

export async function checkIndexedDBStatus(): Promise<{
  connected: boolean;
  dbName: string;
  version: number;
  profileCount: number;
  lastSaved?: string;
  error?: string;
}> {
  try {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return { connected: false, dbName: DB_NAME, version: DB_VERSION, profileCount: 0, error: 'IndexedDB is not available in window context' };
    }
    const db = await openIndexedDB();
    const profiles = await getAllProfilesFromIndexedDB();
    const lastSaved = await getMetaValue<string>('last_saved');

    return {
      connected: true,
      dbName: db.name,
      version: db.version,
      profileCount: profiles.length,
      lastSaved: lastSaved || undefined,
    };
  } catch (err: any) {
    return {
      connected: false,
      dbName: DB_NAME,
      version: DB_VERSION,
      profileCount: 0,
      error: err?.message || 'Failed to connect to IndexedDB',
    };
  }
}
