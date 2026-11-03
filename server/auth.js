import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from 'node:crypto';

const SESSION_TTL_MS = 365 * 24 * 60 * 60 * 1000;
export const COOKIE = 'lift_session';

export function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = scryptSync(password, salt, 64);
  return `scrypt$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export function verifyPassword(password, stored) {
  if (!stored) return false;
  const [scheme, salt, hash] = stored.split('$');
  if (scheme !== 'scrypt') return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = scryptSync(password, Buffer.from(salt, 'base64'), expected.length);
  return timingSafeEqual(expected, actual);
}

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

export function createUser(db, { username, password = null, isDefault = false }) {
  const id = randomUUID();
  db.prepare(`INSERT INTO users (id, username, password_hash, is_default, created_at) VALUES (?, ?, ?, ?, ?)`)
    .run(id, username, password ? hashPassword(password) : null, isDefault ? 1 : 0, Date.now());
  return { id, username };
}

export function ensureDefaultUser(db, username, password) {
  let user = db.prepare(`SELECT id, username FROM users WHERE is_default = 1`).get();
  if (!user) user = createUser(db, { username, password, isDefault: true });
  else if (password) db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(hashPassword(password), user.id);
  return user;
}

export function issueSession(db, userId) {
  const token = randomBytes(32).toString('base64url');
  const now = Date.now();
  db.prepare(`INSERT INTO auth_sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)`)
    .run(sha256(token), userId, now, now + SESSION_TTL_MS);
  return token;
}

export function revokeSession(db, token) {
  if (token) db.prepare(`DELETE FROM auth_sessions WHERE token_hash = ?`).run(sha256(token));
}

export function userForToken(db, token) {
  if (!token) return null;
  const row = db.prepare(`
    SELECT u.id, u.username, s.expires_at FROM auth_sessions s
    JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?`).get(sha256(token));
  if (!row || row.expires_at < Date.now()) return null;
  return { id: row.id, username: row.username };
}

export function login(db, username, password) {
  const row = db.prepare(`SELECT id, username, password_hash FROM users WHERE username = ?`).get(username);
  if (!row || !verifyPassword(password, row.password_hash)) return null;
  return { id: row.id, username: row.username };
}

export function sessionCookie(token, secure) {
  const parts = [`${COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${SESSION_TTL_MS / 1000}`];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

export function parseCookies(header = '') {
  const out = {};
  for (const part of header.split(';')) {
    const i = part.indexOf('=');
    if (i > 0) out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
  }
  return out;
}
