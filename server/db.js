import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

export function openDb(dataDir) {
  mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(join(dataDir, 'lift.db'));
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      username      TEXT NOT NULL UNIQUE,
      password_hash TEXT,
      is_default    INTEGER NOT NULL DEFAULT 0,
      created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at INTEGER NOT NULL,
      expires_at INTEGER NOT NULL
    );

    -- Every piece of user data is a record. Clients own ids (uuid) and
    -- updated_at (ms); the server assigns a monotonically increasing rev that
    -- clients use as their pull cursor. Conflicts resolve last-write-wins.
    CREATE TABLE IF NOT EXISTS records (
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      id         TEXT NOT NULL,
      type       TEXT NOT NULL,
      data       TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      deleted    INTEGER NOT NULL DEFAULT 0,
      rev        INTEGER NOT NULL,
      PRIMARY KEY (user_id, id)
    );
    CREATE INDEX IF NOT EXISTS records_rev ON records(user_id, rev);

    CREATE TABLE IF NOT EXISTS push_subscriptions (
      endpoint   TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      keys       TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS reminder_log (
      user_id TEXT NOT NULL,
      kind    TEXT NOT NULL,
      day     TEXT NOT NULL,
      PRIMARY KEY (user_id, kind, day)
    );

    CREATE TABLE IF NOT EXISTS kv (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return db;
}

export function nextRev(db) {
  const row = db.prepare(`SELECT value FROM kv WHERE key = 'rev'`).get();
  const rev = (row ? Number(row.value) : 0) + 1;
  db.prepare(`INSERT INTO kv (key, value) VALUES ('rev', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(String(rev));
  return rev;
}

export function kvGet(db, key) {
  const row = db.prepare(`SELECT value FROM kv WHERE key = ?`).get(key);
  return row ? row.value : null;
}

export function kvSet(db, key, value) {
  db.prepare(`INSERT INTO kv (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`).run(key, value);
}
