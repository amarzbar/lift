// Local-first storage. Every change is written to IndexedDB immediately and
// marked dirty; sync() pushes dirty records and pulls newer ones from the
// server whenever there is a connection. Conflicts: last write wins by
// updated_at, the same rule the server applies.

const DB_NAME = 'lift';
let dbp = null;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      db.createObjectStore('records', { keyPath: 'id' });
      db.createObjectStore('meta');
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbp;
}

function tx(store, mode, fn) {
  return open().then((db) => new Promise((resolve, reject) => {
    const t = db.transaction(store, mode);
    const out = fn(t.objectStore(store));
    t.oncomplete = () => resolve(out instanceof IDBRequest ? out.result : out);
    t.onerror = () => reject(t.error);
  }));
}

export const meta = {
  get: (k) => tx('meta', 'readonly', (s) => s.get(k)),
  set: (k, v) => tx('meta', 'readwrite', (s) => s.put(v, k)),
};

const listeners = new Set();
export const onChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((fn) => fn());

export async function all(type) {
  const rows = await tx('records', 'readonly', (s) => s.getAll());
  return rows.filter((r) => r.type === type && !r.deleted).map((r) => r.data);
}

export async function get(id) {
  const r = await tx('records', 'readonly', (s) => s.get(id));
  return r && !r.deleted ? r.data : null;
}

export async function put(type, id, data) {
  await tx('records', 'readwrite', (s) => s.put({ id, type, data, updated_at: Date.now(), deleted: false, dirty: true }));
  emit();
  scheduleSync();
}

export async function remove(type, id) {
  await tx('records', 'readwrite', (s) => s.put({ id, type, data: null, updated_at: Date.now(), deleted: true, dirty: true }));
  emit();
  scheduleSync();
}

export async function wipe() {
  await tx('records', 'readwrite', (s) => s.clear());
  await tx('meta', 'readwrite', (s) => s.clear());
  emit();
}

// ---------- sync ----------

export const syncState = { status: 'idle', lastSync: null, error: null, pending: 0 };
let timer = null;
let running = null;
let reauth = null;
// Called once per sync when the server says we're signed out (e.g. first
// launch happened offline); return true if signing in worked.
export const setReauth = (fn) => { reauth = fn; };

export function scheduleSync(delay = 1500) {
  clearTimeout(timer);
  timer = setTimeout(() => sync(), delay);
}

async function dirtyRecords() {
  const rows = await tx('records', 'readonly', (s) => s.getAll());
  return rows.filter((r) => r.dirty);
}

export async function sync() {
  if (running) return running;
  running = (async () => {
    // navigator.onLine is unreliable (iOS especially), so always try; a
    // network error from fetch is what "offline" means here.
    syncState.status = 'syncing';
    emit();
    try {
      let more = true;
      let retried = false;
      while (more) {
        const changes = await dirtyRecords();
        const since = (await meta.get('cursor')) || 0;
        const res = await fetch('/api/sync', {
          signal: AbortSignal.timeout(15000),
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            since,
            changes: changes.map(({ id, type, data, updated_at, deleted }) => ({ id, type, data, updated_at, deleted })),
          }),
        });
        if (res.status === 401) {
          if (!retried && reauth && await reauth()) { retried = true; continue; }
          throw Object.assign(new Error('signed out'), { auth: true });
        }
        if (!res.ok) throw new Error(`sync failed (${res.status})`);
        const body = await res.json();
        await applyPull(body.records, changes);
        await meta.set('cursor', body.cursor);
        more = body.more;
      }
      syncState.status = 'ok';
      syncState.error = null;
      syncState.lastSync = Date.now();
      await meta.set('lastSync', syncState.lastSync);
    } catch (e) {
      const network = e instanceof TypeError || e.name === 'TimeoutError' || e.name === 'AbortError';
      syncState.status = e.auth ? 'signed-out' : network ? 'offline' : 'error';
      syncState.error = e.message;
    } finally {
      syncState.pending = (await dirtyRecords()).length;
      running = null;
      emit();
    }
  })();
  return running;
}

async function applyPull(incoming, pushed) {
  const pushedAt = new Map(pushed.map((r) => [r.id, r.updated_at]));
  await tx('records', 'readwrite', (s) => {
    // Clear dirty flags for what was just pushed, unless it changed again mid-flight.
    for (const r of pushed) {
      const req = s.get(r.id);
      req.onsuccess = () => {
        const cur = req.result;
        if (cur && cur.updated_at === pushedAt.get(r.id)) s.put({ ...cur, dirty: false });
      };
    }
    for (const r of incoming) {
      const req = s.get(r.id);
      req.onsuccess = () => {
        const cur = req.result;
        if (cur && cur.updated_at > r.updated_at) return; // local is newer; it stays dirty and wins next push
        s.put({ ...r, dirty: false });
      };
    }
  });
}

export async function initSync() {
  syncState.lastSync = (await meta.get('lastSync')) || null;
  syncState.pending = (await dirtyRecords()).length;
  window.addEventListener('online', () => sync());
  document.addEventListener('visibilitychange', () => { if (!document.hidden) sync(); });
  setInterval(() => { if (!document.hidden) sync(); }, 60_000);
  sync();
}
