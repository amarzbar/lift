import * as store from './store.js';
import {
  EXERCISES, UNITS, SLOT_OF, incFor, progression, nextWorkoutKey, buildSession, stats, badges, convert,
} from './program.js';
import { mountMotion, mountStill, destroyMotions } from './motion.js';
import { bindCharts } from './chart.js';
import {
  state, ui, api, load, saveSettings, saveSession, toast, armed, activeSession, uuid, unit, weightLabel, setRenderer,
} from './core.js';
import { viewToday } from './views/today.js';
import { viewWorkout, tickWorkout, nextUpLabel, exDone } from './views/workout.js';
import { viewProgress, viewLift, viewHistory, viewSession } from './views/progress.js';
import { viewRewards, viewDone } from './views/rewards.js';
import { viewSettings, viewWeights, viewPlan, viewCredits } from './views/settings.js';
import { viewExercise, viewOnboarding, viewLogin } from './views/other.js';
import { viewSwapSlot } from './views/swap.js';

const $app = document.getElementById('app');
const $nav = document.getElementById('nav');

// ---------- auth ----------

async function adoptUser(user, mode) {
  state.mode = mode;
  const prev = await store.meta.get('user');
  if (prev && prev.id !== user.id) await store.wipe(); // different account: don't mix data
  state.user = user;
  await store.meta.set('user', user);
  await store.meta.set('mode', mode);
}

// Offline-first: a known user means the app works immediately; the server
// check runs in the background and only matters once we're online.
async function ensureAuth() {
  state.user = await store.meta.get('user');
  state.mode = (await store.meta.get('mode')) || 'single';
  const check = (async () => {
    try {
      const me = await api('/api/auth/me');
      if (me.user) return adoptUser(me.user, me.mode);
      if (me.mode === 'single') {
        const r = await api('/api/auth/auto', { method: 'POST' });
        return adoptUser(r.user, r.mode);
      }
      state.mode = me.mode;
      state.user = null;
      await store.meta.set('user', null);
    } catch { /* offline: keep whatever we had */ }
  })();
  if (!state.user) await check;
}

// ---------- router ----------

const routes = {
  today: viewToday,
  workout: viewWorkout,
  ex: viewExercise,
  lift: viewLift,
  done: viewDone,
  progress: viewProgress,
  history: viewHistory,
  session: viewSession,
  rewards: viewRewards,
  settings: viewSettings,
  weights: viewWeights,
  plan: viewPlan,
  credits: viewCredits,
  swap: viewSwapSlot,
  onboarding: viewOnboarding,
  login: viewLogin,
};
const TAB_OF = {
  today: 'today', workout: 'today', ex: 'today',
  progress: 'progress', lift: 'progress', history: 'progress', session: 'progress',
  rewards: 'rewards', settings: 'settings', weights: 'settings', plan: 'settings', credits: 'settings', swap: 'settings',
};
const FULLSCREEN = new Set(['onboarding', 'login', 'done', 'workout']);

function route() {
  const [name = 'today', arg] = location.hash.replace(/^#\/?/, '').split('/');
  return { name: routes[name] ? name : 'today', arg };
}

let lastKey = '';
function render() {
  let { name, arg } = route();
  if (!state.user && state.mode === 'multi' && navigator.onLine) name = 'login';
  else if (!state.settings.onboarded && name !== 'credits') name = 'onboarding';
  const key = `${name}/${arg}/${name === 'workout' ? activeSession()?.current || 0 : ''}/${name === 'onboarding' ? ui.obStep : ''}`;
  const same = key === lastKey;
  const scroll = same ? window.scrollY : 0;
  lastKey = key;
  destroyMotions();
  $app.innerHTML = routes[name](arg);
  $app.dataset.view = name;
  if (!same) { $app.classList.remove('enter'); void $app.offsetWidth; $app.classList.add('enter'); }
  $nav.hidden = FULLSCREEN.has(name);
  $nav.querySelectorAll('a').forEach((a) => {
    const on = a.dataset.tab === TAB_OF[name];
    a.classList.toggle('on', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  $app.querySelectorAll('[data-motion]').forEach((el) => mountMotion(el, el.dataset.motion, el.dataset.title));
  $app.querySelectorAll('[data-still]').forEach((el) => mountStill(el, el.dataset.still));
  bindCharts($app);
  window.scrollTo(0, scroll);
  updateBadge();
}
setRenderer(render);

// ---------- actions ----------

// Starting weights and an in-progress workout are converted (rounded to
// loadable plates); finished workouts keep the unit they were logged in.
async function setUnit(to) {
  const s = state.settings;
  if (to === s.unit || !UNITS[to]) return;
  const start = Object.fromEntries(Object.entries(s.start).map(([k, v]) => [k, convert(v, s.unit, to)]));
  await saveSettings({ unit: to, start });
  const active = activeSession();
  if (active && active.unit !== to) {
    for (const e of active.exercises) e.weight = convert(e.weight, active.unit, to);
    active.unit = to;
    await saveSession(active);
  }
  toast(to === 'lb' ? 'Switched to imperial (lb)' : 'Switched to metric (kg)');
  render();
}

async function saveSwapDefault(slot, lift) {
  const swaps = { ...state.settings.swaps };
  if (lift === slot) delete swaps[slot]; else swaps[slot] = lift;
  await saveSettings({ swaps });
}

async function startWorkout() {
  if (activeSession()) { location.hash = '#/workout'; return; }
  const s = buildSession(nextWorkoutKey(state.sessions), state.sessions, state.settings, uuid());
  state.sessions.push(s);
  await saveSession(s);
  location.hash = '#/workout';
  keepAwake();
}

async function finishWorkout() {
  const s = activeSession();
  const before = stats(state.sessions, state.settings);
  const beforeBadges = new Set(badges(before, state.settings).filter((b) => b.earned).map((b) => b.id));
  s.status = 'done';
  s.finishedAt = Date.now();
  await saveSession(s);
  const after = stats(state.sessions, state.settings);
  const prev = progression(state.sessions.filter((x) => x.id !== s.id), state.settings);
  const prs = s.exercises.filter((e) => {
    const p = prev[e.lift];
    const ok = !e.skipped && e.sets.every((x) => (x.reps ?? 0) >= e.target);
    return ok && e.weight > 0 && p.best !== null && convert(e.weight, s.unit, unit()) > p.best;
  }).map((e) => e.lift);
  ui.result = {
    xp: after.xp - before.xp,
    prs,
    levelUp: after.level.n > before.level.n,
    weekHit: before.thisWeekCount < before.goal && after.thisWeekCount >= after.goal,
    newBadges: badges(after, state.settings).filter((b) => b.earned && !beforeBadges.has(b.id)),
  };
  ui.rest = null;
  ui.armed = null;
  releaseAwake();
  location.hash = `#/done/${s.id}`;
}

let audio;
function beep() {
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    for (const [t, f] of [[0, 880], [0.18, 1175]]) {
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.frequency.value = f;
      g.gain.setValueAtTime(0.18, audio.currentTime + t);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + t + 0.3);
      o.connect(g).connect(audio.destination);
      o.start(audio.currentTime + t);
      o.stop(audio.currentTime + t + 0.3);
    }
  } catch { /* no audio */ }
  navigator.vibrate?.([200, 100, 200]);
}

function startRest(seconds, nextLabel) {
  // Prime audio inside the tap so iOS allows the later beep.
  try { audio ??= new (window.AudioContext || window.webkitAudioContext)(); audio.resume(); } catch { /* ignore */ }
  ui.rest = { start: Date.now(), goal: seconds, beeped: false, nextLabel };
}

setInterval(() => {
  if (route().name !== 'workout') return;
  const ready = tickWorkout();
  if (ready && ui.rest && !ui.rest.beeped) { ui.rest.beeped = true; beep(); }
}, 250);

let wakeLock = null;
async function keepAwake() {
  try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* not allowed */ }
}
function releaseAwake() { wakeLock?.release?.(); wakeLock = null; }

async function setReminders(on) {
  const r = { ...state.settings.reminders, tz: Intl.DateTimeFormat().resolvedOptions().timeZone };
  if (!on) {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub) {
      await api('/api/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } }).catch(() => {});
      await sub.unsubscribe();
    }
    await saveSettings({ reminders: { ...r, enabled: false } });
    return render();
  }
  try {
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { toast('Notifications not allowed'); return render(); }
    const { key } = await api('/api/push/key');
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription() || await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(key) });
    await api('/api/push/subscribe', { method: 'POST', body: sub.toJSON() });
    await saveSettings({ reminders: { ...r, enabled: true } });
    await store.sync();
    toast('Reminders on');
  } catch (e) {
    toast(navigator.onLine ? `Couldn't turn on reminders: ${e.message}` : 'You need to be online to turn on reminders');
  }
  render();
}

function b64ToBytes(b64) {
  const s = atob((b64 + '='.repeat((4 - (b64.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
}

// Home-screen icon badge: a "1" on training days until you've trained.
function updateBadge() {
  if (!('setAppBadge' in navigator)) return;
  const st = stats(state.sessions, state.settings);
  const due = state.settings.trainingDays.includes(new Date().getDay()) && !st.trainedToday;
  (due ? navigator.setAppBadge(1) : navigator.clearAppBadge()).catch(() => {});
}

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

document.addEventListener('click', async (ev) => {
  const t = ev.target.closest('[data-action]');
  if (!t || t.tagName === 'INPUT' || t.tagName === 'SELECT' || t.disabled) return;
  const a = t.dataset.action;
  const s = activeSession();
  const i = Number(t.dataset.i);

  switch (a) {
    case 'start': return startWorkout();
    case 'unit-set': return setUnit(t.dataset.v);
    case 'range': ui.range = t.dataset.v; return render();
    case 'guide-tab': ui.guideTab = t.dataset.v; return render();
    case 'hist-month': ui.histMonth = t.dataset.v; return render();
    case 'log-all': ui.logAll = true; return render();
    case 'goal': await saveSettings({ weeklyGoal: Number(t.dataset.v) }); return render();
    case 'ob-step': ui.obStep = Number(t.dataset.v); return render();
    case 'goto':
      s.current = i;
      ui.armed = null;
      await saveSession(s);
      return render();
    case 'set-check': {
      const e = s.exercises[i];
      const set = e.sets[Number(t.dataset.s)];
      if (set.reps === null) {
        set.reps = set.planned ?? e.target;
        const allDone = s.exercises.every(exDone);
        if (allDone) ui.rest = null;
        else startRest(EXERCISES[e.lift].rest, nextUpLabel(s, i));
      } else {
        set.planned = set.reps;
        set.reps = null;
      }
      await saveSession(s);
      return render();
    }
    case 'reps': {
      const set = s.exercises[i].sets[Number(t.dataset.s)];
      const d = Number(t.dataset.d);
      if (set.reps !== null) set.reps = clamp(set.reps + d, 0, 99);
      else set.planned = clamp((set.planned ?? s.exercises[i].target) + d, 0, 99);
      await saveSession(s);
      return render();
    }
    case 'weight': {
      const e = s.exercises[i];
      e.weight = Math.max(0, e.weight + Number(t.dataset.d) * incFor(e.lift, unit()));
      await saveSession(s);
      return render();
    }
    case 'warm': {
      const list = ui.warm[t.dataset.k] ||= [];
      const w = Number(t.dataset.w);
      ui.warm[t.dataset.k] = list.includes(w) ? list.filter((x) => x !== w) : [...list, w];
      return render();
    }
    case 'skip':
      s.exercises[i].skipped = true;
      if (i < s.exercises.length - 1) s.current = i + 1;
      await saveSession(s);
      return render();
    case 'unskip': s.exercises[i].skipped = false; await saveSession(s); return render();
    case 'swap-open': ui.swap = { i, remember: true }; return render();
    case 'swap-close': ui.swap = null; return render();
    case 'swap-pick': {
      const e = s.exercises[ui.swap.i];
      const slot = e.slot || SLOT_OF[e.lift];
      const to = t.dataset.lift;
      const prog = progression(state.sessions.filter((x) => x.id !== s.id), state.settings)[to];
      const ex = EXERCISES[to];
      Object.assign(e, { slot, lift: to, weight: prog.weight, target: ex.kind === 'barbell' ? ex.reps : ex.repsMax, fails: prog.fails, sets: Array.from({ length: ex.sets }, () => ({ reps: null })) });
      await saveSession(s);
      const remember = ui.swap.remember;
      if (remember) await saveSwapDefault(slot, to);
      ui.swap = null;
      ui.rest = null;
      toast(remember ? `${ex.name} it is. Saved as your default.` : `${ex.name} for today`);
      return render();
    }
    case 'swap-default':
      await saveSwapDefault(t.dataset.slot, t.dataset.lift);
      toast(`${EXERCISES[t.dataset.lift].name} is now your default`);
      return render();
    case 'finish': {
      const incomplete = s.exercises.some((e) => !e.skipped && e.sets.some((x) => x.reps === null));
      if (incomplete && !armed('finish')) return;
      return finishWorkout();
    }
    case 'discard':
      if (!armed('discard')) return;
      state.sessions = state.sessions.filter((x) => x.id !== s.id);
      await store.remove('session', s.id);
      ui.rest = null;
      releaseAwake();
      location.hash = '#/today';
      return;
    case 'rest-add':
      if (ui.rest) { ui.rest.goal = Math.max(0, ui.rest.goal + Number(t.dataset.d)); ui.rest.beeped = false; }
      return render();
    case 'rest-skip': ui.rest = null; return render();
    case 'delete-session':
      if (!armed(`del:${t.dataset.id}`)) return;
      state.sessions = state.sessions.filter((x) => x.id !== t.dataset.id);
      await store.remove('session', t.dataset.id);
      toast('Workout deleted');
      location.hash = '#/history';
      return;
    case 'day': {
      const d = Number(t.dataset.d);
      const days = state.settings.trainingDays.includes(d) ? state.settings.trainingDays.filter((x) => x !== d) : [...state.settings.trainingDays, d].sort();
      await saveSettings({ trainingDays: days });
      return render();
    }
    case 'rtest':
      try { const r = await api('/api/push/test', { method: 'POST' }); toast(r.sent ? 'Sent. Check your notifications.' : 'No device subscribed yet'); }
      catch (e) { toast(e.message); }
      return;
    case 'sync': await store.sync(); toast(store.syncState.status === 'ok' ? 'Synced' : store.syncState.error || 'Offline'); return render();
    case 'logout':
      await api('/api/auth/logout', { method: 'POST' }).catch(() => {});
      await store.wipe();
      state.user = null;
      await load();
      return render();
    case 'reset':
      if (!armed('reset')) return;
      await store.wipe();
      location.reload();
      return;
    case 'ob-done':
      await saveSettings({ onboarded: true, weeklyGoal: Math.max(2, Math.min(4, state.settings.trainingDays.length || 3)) });
      location.hash = '#/today';
      return render();
  }
});

document.addEventListener('change', async (ev) => {
  const t = ev.target;
  const a = t.dataset.action;
  if (!a) return;
  const s = state.settings;
  switch (a) {
    case 'reminders': return setReminders(t.checked);
    case 'rtime': await saveSettings({ reminders: { ...s.reminders, time: t.value, tz: Intl.DateTimeFormat().resolvedOptions().timeZone } }); toast(`Reminders at ${t.value}`); return;
    case 'rsave': await saveSettings({ reminders: { ...s.reminders, streakSave: t.checked } }); return;
    case 'override': {
      const v = Number(t.value);
      if (!Number.isFinite(v) || v < 0) return render();
      await saveSettings({ overrides: { ...s.overrides, [t.dataset.lift]: { weight: v, unit: s.unit, at: Date.now() } } });
      toast(`${EXERCISES[t.dataset.lift].name}: next time ${weightLabel(t.dataset.lift, v)}`);
      return;
    }
    case 'ob-start': {
      const v = Number(t.value);
      if (Number.isFinite(v) && v >= 0) await saveSettings({ start: { ...s.start, [t.dataset.lift]: v } });
      return;
    }
    case 'swap-remember': if (ui.swap) ui.swap.remember = t.checked; return;
  }
});

document.addEventListener('submit', async (ev) => {
  if (ev.target.id !== 'login') return;
  ev.preventDefault();
  const f = new FormData(ev.target);
  try {
    const r = await api('/api/auth/login', { method: 'POST', body: { username: f.get('username'), password: f.get('password') } });
    await adoptUser(r.user, r.mode);
    await store.meta.set('cursor', 0);
    await store.sync();
    await load();
    location.hash = '#/today';
    render();
  } catch (e) {
    const err = document.getElementById('login-err');
    err.hidden = false;
    err.textContent = e.message;
  }
});

// ---------- confetti ----------

function confetti() {
  const c = document.getElementById('confetti');
  if (!c || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = c.getContext('2d');
  const W = (c.width = innerWidth * devicePixelRatio);
  const H = (c.height = innerHeight * devicePixelRatio);
  const colors = ['#ff6a1a', '#ffb547', '#2fbf71', '#5b8def', '#f4f1ea'];
  const parts = Array.from({ length: 120 }, () => ({
    x: W / 2, y: H / 4, vx: (Math.random() - 0.5) * 20 * devicePixelRatio, vy: (Math.random() * -16 - 6) * devicePixelRatio,
    s: (Math.random() * 5 + 4) * devicePixelRatio, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, c: colors[Math.floor(Math.random() * colors.length)],
  }));
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, W, H);
    for (const p of parts) {
      p.vy += 0.55 * devicePixelRatio; p.vx *= 0.99; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); ctx.restore();
    }
    if (t - t0 < 3200 && c.isConnected) requestAnimationFrame(frame); else ctx.clearRect(0, 0, W, H);
  })(t0);
}

// ---------- boot ----------

window.addEventListener('hashchange', () => {
  ui.armed = null;
  ui.logAll = false;
  ui.swap = null;
  render();
  if (route().name === 'done') confetti();
});

store.onChange(async () => {
  // Re-read after a sync pulled remote changes, without clobbering mid-edit inputs.
  await load();
  const focused = document.activeElement;
  if (focused && ['INPUT', 'SELECT'].includes(focused.tagName)) return;
  render();
});

store.setReauth(async () => {
  try {
    const me = await api('/api/auth/me');
    if (me.mode !== 'single') { state.mode = me.mode; return false; }
    const r = await api('/api/auth/auto', { method: 'POST' });
    await adoptUser(r.user, r.mode);
    return true;
  } catch { return false; }
});

// iOS can ignore user-scalable=no; block pinch gestures directly.
for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(type, (e) => e.preventDefault(), { passive: false });
}
document.addEventListener('touchmove', (e) => { if (e.touches.length > 1) e.preventDefault(); }, { passive: false });

(async function boot() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
  await ensureAuth();
  await load();
  render();
  if (route().name === 'done') confetti();
  store.initSync();
  if (activeSession()) keepAwake();
})();
