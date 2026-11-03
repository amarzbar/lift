// Shared state, formatting helpers and small UI building blocks used by every view.
import * as store from './store.js';
import { EXERCISES, withDefaults } from './program.js';
import { icon } from './icons.js';

export { icon };

export const state = { user: null, mode: 'single', settings: withDefaults(null), sessions: [] };
// Ephemeral UI state (never synced).
export const ui = { warm: {}, rest: null, armed: null, range: '3m', guideTab: 'steps', obStep: 0, result: null, histMonth: null, logAll: false, swap: null };

let renderFn = () => {};
export const setRenderer = (fn) => { renderFn = fn; };
export const rerender = () => renderFn();

export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fmt = (w) => (Math.round(w * 100) / 100).toLocaleString(undefined, { maximumFractionDigits: 2 });
// Plain number for form inputs (no thousands separators).
export const num = (w) => String(Math.round(w * 100) / 100);
export const unit = () => state.settings.unit;
export const uuid = () => crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
export const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
export const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
export const activeSession = () => state.sessions.find((s) => s.status === 'active');
export const doneSessions = () => state.sessions.filter((s) => s.status === 'done').sort((a, b) => b.finishedAt - a.finishedAt);

export function repsLabel(ex) {
  return ex.kind === 'barbell' ? `${ex.sets} × ${ex.reps}` : `${ex.sets} × ${ex.repsMin}–${ex.repsMax}`;
}

export function weightLabel(lift, w, u = unit()) {
  const ex = EXERCISES[lift];
  if (ex.bodyweight) return w > 0 ? `BW + ${fmt(w)} ${u}` : 'Bodyweight';
  if (ex.load === 2) return `${fmt(w)} ${u} each`;
  return `${fmt(w)} ${u}`;
}

export function compact(n) {
  if (n >= 1e6) return `${fmt(Math.round(n / 1e5) / 10)}M`;
  if (n >= 1e4) return `${fmt(Math.round(n / 100) / 10)}k`;
  return fmt(Math.round(n));
}

export function dateLabel(ms, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  return new Date(ms).toLocaleDateString(undefined, opts);
}

export function relDay(ms) {
  const d = new Date(ms); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((t - d) / 864e5);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return dateLabel(ms, { month: 'short', day: 'numeric' });
}

export function duration(ms) {
  const m = Math.max(1, Math.round(ms / 60000));
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m} min`;
}

// ---------- persistence ----------

export async function load() {
  state.settings = withDefaults(await store.get('settings'));
  state.sessions = await store.all('session');
}

export async function saveSettings(patch) {
  state.settings = withDefaults({ ...state.settings, ...patch });
  await store.put('settings', 'settings', state.settings);
}

export async function saveSession(s) {
  await store.put('session', s.id, s);
}

export async function api(path, opts = {}) {
  const res = await fetch(path, {
    credentials: 'same-origin',
    headers: opts.body ? { 'Content-Type': 'application/json' } : {},
    ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || `HTTP ${res.status}`), { status: res.status });
  return body;
}

// ---------- feedback ----------

export function toast(msg, kind = '') {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = `toast ${kind}`;
  el.setAttribute('role', 'status');
  el.textContent = msg;
  document.body.append(el);
  setTimeout(() => el.remove(), 2600);
}

// Two-tap confirm instead of a blocking confirm() dialog.
export function armed(key) {
  if (ui.armed === key) { ui.armed = null; return true; }
  ui.armed = key;
  setTimeout(() => { if (ui.armed === key) { ui.armed = null; rerender(); } }, 3000);
  rerender();
  return false;
}

// ---------- building blocks ----------

export function pageHeader(title, { eyebrow = '', right = '', back = '' } = {}) {
  return `<header class="page-head">
    ${back ? `<a class="back" href="${back}" aria-label="Back">${icon('chevron-left')}</a>` : ''}
    <div class="page-title">${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}<h1>${title}</h1></div>
    ${right ? `<div class="page-right">${right}</div>` : ''}
  </header>`;
}

export function sectionHead(title, link = '') {
  return `<div class="section-head"><h2>${title}</h2>${link}</div>`;
}

export function segmented(action, options, current, label) {
  return `<div class="segmented" role="group" aria-label="${esc(label)}">${options.map(([v, text]) =>
    `<button data-action="${action}" data-v="${v}" class="${String(current) === String(v) ? 'on' : ''}" aria-pressed="${String(current) === String(v)}">${text}</button>`).join('')}</div>`;
}

export function toggle(action, checked, label, extra = '') {
  return `<label class="switch"><input type="checkbox" role="switch" data-action="${action}" ${checked ? 'checked' : ''} ${extra} aria-label="${esc(label)}"><span></span></label>`;
}

export function progressBar(fraction, cls = '') {
  return `<div class="pbar ${cls}"><i style="width:${Math.round(Math.min(1, Math.max(0, fraction)) * 100)}%"></i></div>`;
}

export function ring(fraction, inner, size = 64, stroke = 7) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return `<div class="ring" style="width:${size}px;height:${size}px">
    <svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/>
    <circle class="ring-fill" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="${c * (1 - Math.min(1, fraction))}" transform="rotate(-90 ${size / 2} ${size / 2})"/></svg>
    <div class="ring-inner">${inner}</div></div>`;
}

export function syncText() {
  const ss = store.syncState;
  return {
    syncing: 'Syncing…',
    ok: `Synced ${ss.lastSync ? relTime(ss.lastSync) : ''}`,
    offline: ss.pending ? `Offline · ${ss.pending} change${ss.pending === 1 ? '' : 's'} saved on this phone` : 'Offline',
    error: 'Sync failed · will retry',
    'signed-out': 'Signed out · data is safe on this phone',
    idle: '',
  }[ss.status] || '';
}

function relTime(ms) {
  const s = Math.round((Date.now() - ms) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.round(s / 60)} min ago`;
  return new Date(ms).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}
