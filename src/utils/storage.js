/**
 * IndexedDB Storage Utility
 * 
 * Provides a simple async API for storing portfolio data in IndexedDB.
 * Falls back to localStorage if IndexedDB is not available.
 */

const DB_NAME = 'PortfolioTrackerDB';
const DB_VERSION = 1;

// Store names
const STORES = {
    ASSETS: 'assets',
    HISTORY: 'history',
    DAILY_HISTORY: 'dailyHistory',
    SETTINGS: 'settings'
};

let dbInstance = null;

/**
 * Initialize and get the database instance
 */
const getDB = () => {
    return new Promise((resolve, reject) => {
        if (dbInstance) {
            resolve(dbInstance);
            return;
        }

        if (!window.indexedDB) {
            console.warn('IndexedDB not supported, falling back to localStorage');
            reject(new Error('IndexedDB not supported'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => {
            console.error('Failed to open IndexedDB:', request.error);
            reject(request.error);
        };

        request.onsuccess = () => {
            dbInstance = request.result;
            resolve(dbInstance);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.ASSETS)) {
                db.createObjectStore(STORES.ASSETS, { keyPath: 'id' });
            }

            if (!db.objectStoreNames.contains(STORES.HISTORY)) {
                const historyStore = db.createObjectStore(STORES.HISTORY, { keyPath: 'timestamp' });
                historyStore.createIndex('timestamp', 'timestamp', { unique: true });
            }

            if (!db.objectStoreNames.contains(STORES.DAILY_HISTORY)) {
                const dailyStore = db.createObjectStore(STORES.DAILY_HISTORY, { keyPath: 'date' });
                dailyStore.createIndex('date', 'date', { unique: true });
            }

            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
            }
        };
    });
};

/**
 * Generic get all items from a store
 */
const getAll = async (storeName) => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn('IndexedDB getAll failed, using localStorage:', error);
        return null;
    }
};

/**
 * Generic put item to a store
 */
const put = async (storeName, data) => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn('IndexedDB put failed:', error);
        return null;
    }
};

/**
 * Generic put multiple items to a store
 */
const putAll = async (storeName, items) => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);

            items.forEach(item => store.put(item));

            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        });
    } catch (error) {
        console.warn('IndexedDB putAll failed:', error);
        return null;
    }
};

/**
 * Clear all items from a store
 */
const clear = async (storeName) => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn('IndexedDB clear failed:', error);
        return null;
    }
};

/**
 * Delete a specific item from a store
 */
const remove = async (storeName, key) => {
    try {
        const db = await getDB();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    } catch (error) {
        console.warn('IndexedDB remove failed:', error);
        return null;
    }
};

// ============================================
// Portfolio-specific API
// ============================================

/**
 * Get all assets from IndexedDB, fallback to localStorage
 */
export const getAssets = async () => {
    const assets = await getAll(STORES.ASSETS);
    if (assets && assets.length > 0) {
        return assets;
    }
    // Fallback to localStorage
    const saved = localStorage.getItem('myPortfolio_v7');
    return saved ? JSON.parse(saved) : null;
};

/**
 * Save all assets to IndexedDB and localStorage (for backup)
 */
export const saveAssets = async (assets) => {
    // Save to localStorage as backup
    localStorage.setItem('myPortfolio_v7', JSON.stringify(assets));

    // Save to IndexedDB
    await clear(STORES.ASSETS);
    if (assets && assets.length > 0) {
        await putAll(STORES.ASSETS, assets);
    }
};

/**
 * Get real-time history from IndexedDB
 */
export const getHistory = async () => {
    const history = await getAll(STORES.HISTORY);
    if (history && history.length > 0) {
        return history.sort((a, b) => a.timestamp - b.timestamp);
    }
    // Fallback to localStorage
    const saved = localStorage.getItem('portfolioHistory_v1');
    return saved ? JSON.parse(saved) : [];
};

/**
 * Save real-time history point
 */
export const saveHistoryPoint = async (point) => {
    await put(STORES.HISTORY, point);

    // Also save to localStorage as backup
    const history = await getHistory();
    localStorage.setItem('portfolioHistory_v1', JSON.stringify(history.slice(-50)));
};

/**
 * Trim history to keep only last N points
 */
export const trimHistory = async (maxPoints = 50) => {
    const history = await getHistory();
    if (history.length > maxPoints) {
        const toKeep = history.slice(-maxPoints);
        await clear(STORES.HISTORY);
        await putAll(STORES.HISTORY, toKeep);
    }
};

/**
 * Get daily history from IndexedDB
 */
export const getDailyHistory = async () => {
    const history = await getAll(STORES.DAILY_HISTORY);
    if (history && history.length > 0) {
        return history.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    // Fallback to localStorage
    const saved = localStorage.getItem('portfolioDaily_v1');
    return saved ? JSON.parse(saved) : [];
};

/**
 * Save daily history point
 */
export const saveDailyPoint = async (point) => {
    await put(STORES.DAILY_HISTORY, point);

    // Also save to localStorage as backup
    const history = await getDailyHistory();
    localStorage.setItem('portfolioDaily_v1', JSON.stringify(history.slice(-365)));
};

/**
 * Get a setting value
 */
export const getSetting = async (key, defaultValue = null) => {
    try {
        const db = await getDB();
        return new Promise((resolve) => {
            const transaction = db.transaction(STORES.SETTINGS, 'readonly');
            const store = transaction.objectStore(STORES.SETTINGS);
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : defaultValue);
            };
            request.onerror = () => resolve(defaultValue);
        });
    } catch {
        // Fallback to localStorage
        const saved = localStorage.getItem(`setting_${key}`);
        return saved ? JSON.parse(saved) : defaultValue;
    }
};

/**
 * Save a setting value
 */
export const saveSetting = async (key, value) => {
    localStorage.setItem(`setting_${key}`, JSON.stringify(value));
    await put(STORES.SETTINGS, { key, value });
};

/**
 * Migrate data from localStorage to IndexedDB (run once on startup)
 */
export const migrateFromLocalStorage = async () => {
    try {
        const db = await getDB();

        // Check if migration already done
        const migrated = await getSetting('migrated_v1', false);
        if (migrated) return;

        console.log('Migrating data from localStorage to IndexedDB...');

        // Migrate assets
        const assets = localStorage.getItem('myPortfolio_v7');
        if (assets) {
            const parsed = JSON.parse(assets);
            if (parsed.length > 0) {
                await putAll(STORES.ASSETS, parsed);
            }
        }

        // Migrate history
        const history = localStorage.getItem('portfolioHistory_v1');
        if (history) {
            const parsed = JSON.parse(history);
            if (parsed.length > 0) {
                await putAll(STORES.HISTORY, parsed);
            }
        }

        // Migrate daily history
        const daily = localStorage.getItem('portfolioDaily_v1');
        if (daily) {
            const parsed = JSON.parse(daily);
            if (parsed.length > 0) {
                await putAll(STORES.DAILY_HISTORY, parsed);
            }
        }

        // Mark as migrated
        await saveSetting('migrated_v1', true);
        console.log('Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
    }
};

export default {
    getAssets,
    saveAssets,
    getHistory,
    saveHistoryPoint,
    trimHistory,
    getDailyHistory,
    saveDailyPoint,
    getSetting,
    saveSetting,
    migrateFromLocalStorage,
    STORES
};
