import { sendToUser } from './push.js';
import {
  withDefaults, nextWorkoutKey, progression, liftsFor, stats, dayKey, EXERCISES, WORKOUTS,
} from '../public/js/program.js';

function localNow(tz) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
    timeZone: tz, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date()).map((p) => [p.type, p.value]));
  const dow = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
  return { dow, hhmm: `${parts.hour}:${parts.minute}` };
}

function userData(db, userId) {
  const rows = db.prepare(`SELECT type, data FROM records WHERE user_id = ? AND deleted = 0 AND type IN ('settings', 'session')`).all(userId);
  let settings = null;
  const sessions = [];
  for (const r of rows) {
    const data = JSON.parse(r.data);
    if (r.type === 'settings') settings = data;
    else sessions.push(data);
  }
  return { settings: withDefaults(settings), sessions };
}

// Once per day per kind, guarded by reminder_log.
function claim(db, userId, kind, day) {
  return db.prepare(`INSERT OR IGNORE INTO reminder_log (user_id, kind, day) VALUES (?, ?, ?)`).run(userId, kind, day).changes === 1;
}

async function tick(db) {
  const users = db.prepare(`SELECT DISTINCT user_id FROM push_subscriptions`).all();
  for (const { user_id: userId } of users) {
    const { settings, sessions } = userData(db, userId);
    const r = settings.reminders;
    if (!r.enabled || !r.tz) continue;
    const { dow, hhmm } = localNow(r.tz);
    if (hhmm !== r.time) continue;
    const st = stats(sessions, settings, Date.now(), r.tz);
    if (st.trainedToday) continue;
    const today = dayKey(Date.now(), r.tz);

    if (settings.trainingDays.includes(dow)) {
      if (!claim(db, userId, 'train', today)) continue;
      const key = nextWorkoutKey(sessions);
      const prog = progression(sessions, settings);
      const main = liftsFor(key, settings).slice(0, 3)
        .map((l) => `${EXERCISES[l].name} ${prog[l].weight}${settings.unit}`).join(' · ');
      const streakLine = st.streak > 0 ? ` Keep your ${st.streak}-week streak alive.` : '';
      await sendToUser(db, userId, {
        title: `Gym day: ${WORKOUTS[key].name}`,
        body: `${main}.${streakLine}`,
        url: '/#/today',
        tag: 'train',
      });
    } else if (r.streakSave) {
      // Off day, but the week can only be saved if they train today.
      const needed = st.goal - st.thisWeekCount;
      const daysLeft = 7 - ((dow + 6) % 7); // including today, week ends Sunday
      if (needed > 0 && needed >= daysLeft && claim(db, userId, 'save', today)) {
        await sendToUser(db, userId, {
          title: st.streak > 0 ? `Your ${st.streak}-week streak is at risk` : 'Still time to hit this week',
          body: `${needed} workout${needed > 1 ? 's' : ''} left this week and ${daysLeft} day${daysLeft > 1 ? 's' : ''} to do it.`,
          url: '/#/today',
          tag: 'save',
        });
      }
    }
  }
}

export function startReminders(db) {
  const run = () => tick(db).catch((e) => console.error('reminder tick failed', e));
  // Align to the start of each minute.
  setTimeout(() => { run(); setInterval(run, 60_000); }, 60_000 - (Date.now() % 60_000) + 500);
}
