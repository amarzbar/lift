import webpush from 'web-push';
import { kvGet, kvSet } from './db.js';

let keys = null;

// VAPID keys are generated once and kept in the database, so existing
// subscriptions keep working across restarts.
export function initPush(db, subject) {
  const stored = kvGet(db, 'vapid');
  keys = stored ? JSON.parse(stored) : webpush.generateVAPIDKeys();
  if (!stored) kvSet(db, 'vapid', JSON.stringify(keys));
  webpush.setVapidDetails(subject, keys.publicKey, keys.privateKey);
}

export const publicKey = () => keys.publicKey;

export async function sendToUser(db, userId, payload) {
  const subs = db.prepare(`SELECT endpoint, keys FROM push_subscriptions WHERE user_id = ?`).all(userId);
  let sent = 0;
  for (const s of subs) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: JSON.parse(s.keys) }, JSON.stringify(payload), { TTL: 3600 });
      sent += 1;
    } catch (e) {
      // 404/410: the browser dropped this subscription for good.
      if (e.statusCode === 404 || e.statusCode === 410) {
        db.prepare(`DELETE FROM push_subscriptions WHERE endpoint = ?`).run(s.endpoint);
      } else console.error('push failed', e.statusCode || e.message);
    }
  }
  return sent;
}
