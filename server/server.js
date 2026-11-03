import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDb, nextRev } from './db.js';
import * as auth from './auth.js';
import { initPush, publicKey, sendToUser } from './push.js';
import { startReminders } from './reminders.js';

const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || './data';
// 'single': the app signs everyone in as the default user (no login screen).
// 'multi': username/password login is required.
const AUTH_MODE = process.env.AUTH_MODE || 'single';
const DEFAULT_USER = process.env.DEFAULT_USER || 'me';
const SECURE_COOKIES = process.env.SECURE_COOKIES !== 'false';
const PUBLIC_DIR = fileURLToPath(new URL('../public/', import.meta.url));

const db = openDb(DATA_DIR);
auth.ensureDefaultUser(db, DEFAULT_USER, process.env.DEFAULT_PASSWORD || null);
initPush(db, process.env.VAPID_SUBJECT || 'mailto:admin@localhost');
startReminders(db);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  const isJson = typeof body !== 'string' && !Buffer.isBuffer(body);
  res.writeHead(status, {
    'Content-Type': isJson ? 'application/json' : 'text/plain; charset=utf-8',
    'Cache-Control': 'no-store',
    ...headers,
  });
  res.end(isJson ? JSON.stringify(body) : body);
}

async function readJson(req) {
  let size = 0;
  const chunks = [];
  for await (const c of req) {
    size += c.length;
    if (size > 5_000_000) throw Object.assign(new Error('payload too large'), { status: 413 });
    chunks.push(c);
  }
  if (!chunks.length) return {};
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw Object.assign(new Error('invalid json'), { status: 400 }); }
}

function currentUser(req) {
  return auth.userForToken(db, auth.parseCookies(req.headers.cookie)[auth.COOKIE]);
}

function upsertRecords(userId, changes) {
  const get = db.prepare(`SELECT updated_at FROM records WHERE user_id = ? AND id = ?`);
  const put = db.prepare(`
    INSERT INTO records (user_id, id, type, data, updated_at, deleted, rev) VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(user_id, id) DO UPDATE SET type = excluded.type, data = excluded.data,
      updated_at = excluded.updated_at, deleted = excluded.deleted, rev = excluded.rev`);
  let applied = 0;
  db.exec('BEGIN');
  try {
    for (const r of changes) {
      if (typeof r?.id !== 'string' || typeof r.type !== 'string' || !Number.isFinite(r.updated_at)) continue;
      const existing = get.get(userId, r.id);
      if (existing && existing.updated_at > r.updated_at) continue; // server copy is newer
      put.run(userId, r.id, r.type, JSON.stringify(r.data ?? null), r.updated_at, r.deleted ? 1 : 0, nextRev(db));
      applied += 1;
    }
    db.exec('COMMIT');
  } catch (e) {
    db.exec('ROLLBACK');
    throw e;
  }
  return applied;
}

const routes = {
  'GET /api/health': () => ({ ok: true }),

  'GET /api/auth/me': (req) => {
    const user = currentUser(req);
    return { user, mode: AUTH_MODE };
  },

  'POST /api/auth/auto': (req, res) => {
    if (AUTH_MODE !== 'single') return [403, { error: 'login required' }];
    const user = db.prepare(`SELECT id, username FROM users WHERE is_default = 1`).get();
    const token = auth.issueSession(db, user.id);
    res.setHeader('Set-Cookie', auth.sessionCookie(token, SECURE_COOKIES));
    return { user: { id: user.id, username: user.username }, mode: AUTH_MODE };
  },

  'POST /api/auth/login': async (req, res) => {
    const { username, password } = await readJson(req);
    const user = auth.login(db, String(username || ''), String(password || ''));
    if (!user) return [401, { error: 'wrong username or password' }];
    res.setHeader('Set-Cookie', auth.sessionCookie(auth.issueSession(db, user.id), SECURE_COOKIES));
    return { user, mode: AUTH_MODE };
  },

  'POST /api/auth/logout': (req, res) => {
    auth.revokeSession(db, auth.parseCookies(req.headers.cookie)[auth.COOKIE]);
    res.setHeader('Set-Cookie', auth.clearCookie());
    return { ok: true };
  },

  // Push local changes, pull everything newer than the client's cursor.
  'POST /api/sync': async (req, res, user) => {
    const { since = 0, changes = [] } = await readJson(req);
    const applied = Array.isArray(changes) ? upsertRecords(user.id, changes) : 0;
    const rows = db.prepare(`SELECT id, type, data, updated_at, deleted, rev FROM records WHERE user_id = ? AND rev > ? ORDER BY rev LIMIT 2000`)
      .all(user.id, Number(since) || 0);
    const records = rows.map((r) => ({ id: r.id, type: r.type, data: JSON.parse(r.data), updated_at: r.updated_at, deleted: !!r.deleted }));
    const cursor = rows.length ? rows[rows.length - 1].rev : Number(since) || 0;
    return { applied, records, cursor, more: rows.length === 2000, serverTime: Date.now() };
  },

  'GET /api/push/key': () => ({ key: publicKey() }),

  'POST /api/push/subscribe': async (req, res, user) => {
    const sub = await readJson(req);
    if (!sub?.endpoint || !sub?.keys) return [400, { error: 'bad subscription' }];
    db.prepare(`INSERT INTO push_subscriptions (endpoint, user_id, keys, created_at) VALUES (?, ?, ?, ?)
      ON CONFLICT(endpoint) DO UPDATE SET user_id = excluded.user_id, keys = excluded.keys`)
      .run(sub.endpoint, user.id, JSON.stringify(sub.keys), Date.now());
    return { ok: true };
  },

  'POST /api/push/unsubscribe': async (req, res, user) => {
    const { endpoint } = await readJson(req);
    db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ? AND user_id = ?`).run(String(endpoint || ''), user.id);
    return { ok: true };
  },

  'POST /api/push/test': async (req, res, user) => {
    const sent = await sendToUser(db, user.id, { title: 'Reminders are on', body: 'This is what a gym reminder will look like.', url: '/#/today' });
    return { sent };
  },
};

const PUBLIC_ROUTES = new Set(['GET /api/health', 'GET /api/auth/me', 'POST /api/auth/auto', 'POST /api/auth/login', 'GET /api/push/key']);

async function serveStatic(req, res, pathname) {
  let rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  if (rel === '/' || rel === '') rel = '/index.html';
  let file = join(PUBLIC_DIR, rel);
  if (!file.startsWith(PUBLIC_DIR)) return send(res, 403, 'forbidden');
  try {
    if (!(await stat(file)).isFile()) throw new Error();
  } catch {
    if (extname(rel)) return send(res, 404, 'not found');
    file = join(PUBLIC_DIR, 'index.html'); // client-side routes
  }
  const ext = extname(file);
  const body = await readFile(file);
  // The service worker and the HTML entry must always revalidate so updates land.
  const cache = ext === '.html' || file.endsWith('sw.js') || ext === '.webmanifest' ? 'no-cache' : 'public, max-age=300';
  res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': cache });
  res.end(body);
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const key = `${req.method} ${url.pathname}`;
  try {
    if (url.pathname.startsWith('/api/')) {
      const handler = routes[key];
      if (!handler) return send(res, 404, { error: 'not found' });
      let user = null;
      if (!PUBLIC_ROUTES.has(key)) {
        user = currentUser(req);
        if (!user) return send(res, 401, { error: 'not signed in' });
      }
      const out = await handler(req, res, user);
      return Array.isArray(out) ? send(res, out[0], out[1]) : send(res, 200, out);
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') return send(res, 405, 'method not allowed');
    return await serveStatic(req, res, url.pathname);
  } catch (e) {
    if (!e.status) console.error(e);
    return send(res, e.status || 500, { error: e.status ? e.message : 'server error' });
  }
}).listen(PORT, () => console.log(`lift listening on :${PORT} (auth mode: ${AUTH_MODE})`));
