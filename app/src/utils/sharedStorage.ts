// Shared storage utility for cross-session data synchronization
// Uses localStorage with a timestamp-based polling mechanism

const STORAGE_KEY = 'pettyCashStore_shared';
const LAST_UPDATE_KEY = 'pettyCashStore_lastUpdate';

export interface SharedStorageData {
  requests: any[];
  lastUpdate: number;
}

// Get shared data
export const getSharedData = (): SharedStorageData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const parsed: unknown = JSON.parse(data);
    if (!parsed || typeof parsed !== 'object') return null;
    const candidate = parsed as Partial<SharedStorageData>;
    if (!Array.isArray(candidate.requests) ||
        typeof candidate.lastUpdate !== 'number' ||
        !Number.isFinite(candidate.lastUpdate) || candidate.lastUpdate < 0) return null;
    return candidate as SharedStorageData;
  } catch (error) {
    console.error('Error reading shared storage:', error);
    return null;
  }
};

// Set shared data
export const setSharedData = (data: any[]) => {
  try {
    const sharedData: SharedStorageData = {
      requests: data,
      lastUpdate: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sharedData));
    localStorage.setItem(LAST_UPDATE_KEY, String(sharedData.lastUpdate));
  } catch (error) {
    console.error('Error writing shared storage:', error);
  }
};

// Get last update timestamp
export const getLastUpdate = (): number => {
  try {
    const timestamp = localStorage.getItem(LAST_UPDATE_KEY);
    const value = timestamp ? Number(timestamp) : 0;
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
};

// Check if data has been updated by another session
export const hasExternalUpdate = (localTimestamp: number): boolean => {
  const sharedTimestamp = getLastUpdate();
  return sharedTimestamp > localTimestamp;
};

// Listen for storage changes from other tabs/windows
export const onStorageChange = (callback: () => void) => {
  const handler = (e: StorageEvent) => {
    if (e.storageArea === window.localStorage &&
        (e.key === null || e.key === STORAGE_KEY || e.key === LAST_UPDATE_KEY)) {
      callback();
    }
  };
  
  window.addEventListener('storage', handler);
  
  return () => {
    window.removeEventListener('storage', handler);
  };
};
