const fs = require('fs');
const path = require('path');

const CACHE_ROOT = path.resolve(__dirname, '..', '..', '..', '.cache', 'server');

function ensureCacheRoot() {
  fs.mkdirSync(CACHE_ROOT, { recursive: true });
}

function sanitizePersistKey(value) {
  return String(value || 'cache').replace(/[^a-z0-9_.-]+/gi, '-').toLowerCase();
}

function resolvePersistPath(persistKey) {
  ensureCacheRoot();
  return path.join(CACHE_ROOT, `${sanitizePersistKey(persistKey)}.json`);
}

function loadPersistedEntries(persistPath) {
  try {
    const raw = fs.readFileSync(persistPath, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return [];
    return Object.entries(parsed)
      .filter(([, entry]) => entry && typeof entry === 'object' && 'ts' in entry)
      .map(([key, entry]) => [key, entry]);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn(`No se pudo leer la cache persistida ${persistPath}: ${err.message}`);
    }
    return [];
  }
}

function getStoreMap(store) {
  return store instanceof Map ? store : store?.map;
}

function persistStore(store) {
  if (!store?.persistPath) return;

  try {
    ensureCacheRoot();
    const data = Object.fromEntries(store.map.entries());
    fs.writeFileSync(store.persistPath, JSON.stringify(data), 'utf8');
  } catch (err) {
    console.warn(`No se pudo escribir la cache persistida ${store.persistPath}: ${err.message}`);
  }
}

function schedulePersist(store) {
  if (!store?.persistPath || store.persistTimer) return;
  store.persistTimer = setTimeout(() => {
    store.persistTimer = null;
    persistStore(store);
  }, 50);
  if (typeof store.persistTimer.unref === 'function') {
    store.persistTimer.unref();
  }
}

function createTimedStore(options = {}) {
  const map = new Map();
  const persistPath = options.persistKey ? resolvePersistPath(options.persistKey) : null;
  if (persistPath) {
    for (const [key, entry] of loadPersistedEntries(persistPath)) {
      map.set(key, entry);
    }
  }

  return {
    map,
    persistPath,
    persistTimer: null,
  };
}

function getTimedCache(store, key, ttl, options = {}) {
  const { allowStale = false } = options;
  const map = getStoreMap(store);
  const entry = map?.get(key);
  if (!entry) return null;
  if (allowStale || Date.now() - entry.ts < ttl) return entry.data;
  return null;
}

function setTimedCache(store, key, data) {
  const map = getStoreMap(store);
  map.set(key, { data, ts: Date.now() });
  schedulePersist(store);
}

function createMemoryCache(ttl, options = {}) {
  const store = createTimedStore(options);

  return {
    get(key, cacheOptions) {
      return getTimedCache(store, key, ttl, cacheOptions);
    },
    set(key, data) {
      setTimedCache(store, key, data);
    },
    clear() {
      store.map.clear();
      schedulePersist(store);
    },
    store,
  };
}

module.exports = {
  createMemoryCache,
  createTimedStore,
  getTimedCache,
  setTimedCache,
};
