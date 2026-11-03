import { EXERCISES, WORKOUTS, progression, stats, dayKey, weekKey, convert, e1rm, chosenFor } from '../program.js';
import { lineChart, weekBars, sparkline } from '../chart.js';
import {
  state, ui, icon, esc, fmt, unit, compact, repsLabel, weightLabel, doneSessions, dateLabel, relDay, duration,
  pageHeader, sectionHead, segmented,
} from '../core.js';

const RANGES = [['1m', '1M'], ['3m', '3M'], ['1y', '1Y'], ['all', 'All']];
const MAIN_SLOTS = ['squat', 'bench', 'deadlift', 'ohp', 'row'];

// The lifts worth charting: what fills each main slot today, plus anything else you've logged.
function trackedLifts(prog) {
  const out = MAIN_SLOTS.map((slot) => chosenFor(slot, state.settings));
  for (const [lift, p] of Object.entries(prog)) if (p.history.length && !out.includes(lift)) out.push(lift);
  return out;
}

function cutoff(range) {
  const d = new Date();
  if (range === '1m') d.setMonth(d.getMonth() - 1);
  else if (range === '3m') d.setMonth(d.getMonth() - 3);
  else if (range === '1y') d.setFullYear(d.getFullYear() - 1);
  else return 0;
  return d.getTime();
}

function sessionVolume(s) {
  return s.exercises.reduce((a, e) => a + (e.skipped ? 0 : convert(e.weight, s.unit || unit(), unit()) * (EXERCISES[e.lift]?.load || 1) * e.sets.reduce((b, x) => b + (x.reps || 0), 0)), 0);
}

function weekSeries(sessions, from) {
  const thisWeek = weekKey(dayKey(Date.now()));
  const first = sessions.length ? weekKey(dayKey(Math.min(...sessions.map((s) => s.finishedAt)))) : thisWeek;
  let start = from ? weekKey(dayKey(from)) : first;
  // Cap at one year of bars so they stay readable.
  const cap = new Date(`${thisWeek}T12:00:00Z`); cap.setUTCDate(cap.getUTCDate() - 7 * 51);
  if (start < cap.toISOString().slice(0, 10)) start = cap.toISOString().slice(0, 10);
  const counts = new Map();
  const seen = new Set();
  for (const s of sessions) {
    const day = dayKey(s.finishedAt);
    if (seen.has(day)) continue;
    seen.add(day);
    const wk = weekKey(day);
    counts.set(wk, (counts.get(wk) || 0) + 1);
  }
  const out = [];
  for (let w = start; w <= thisWeek;) {
    out.push({ at: new Date(`${w}T12:00:00Z`).getTime(), count: counts.get(w) || 0 });
    const d = new Date(`${w}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 7); w = d.toISOString().slice(0, 10);
  }
  return out;
}

function sessionCard(s) {
  const lifts = s.exercises.filter((e) => !e.skipped);
  return `<a class="session-card" href="#/session/${s.id}">
    <div class="session-date"><b>${new Date(s.finishedAt).getDate()}</b><small>${dateLabel(s.finishedAt, { month: 'short' })}</small></div>
    <div class="session-main">
      <b>${WORKOUTS[s.workout].name}</b>
      <small>${lifts.map((e) => EXERCISES[e.lift].name).join(' · ')}</small>
    </div>
    <div class="session-end"><small>${duration(s.finishedAt - s.startedAt)}</small>${icon('chevron-right')}</div>
  </a>`;
}

function emptyState(title, body) {
  return `<section class="empty">
    <div class="empty-icon">${icon('trending-up')}</div>
    <h2>${title}</h2><p>${body}</p>
    <a class="btn primary" href="#/today">Go to today's workout</a>
  </section>`;
}

export function viewProgress() {
  const all = doneSessions();
  const range = ui.range;
  const from = cutoff(range);
  const inRange = all.filter((s) => s.finishedAt >= from);
  const prog = progression(state.sessions, state.settings);
  const st = stats(state.sessions, state.settings);
  const head = `${pageHeader('Progress')}${segmented('range', RANGES, range, 'Time range')}`;
  if (!all.length) return `${head}${emptyState('Nothing to chart yet', 'Finish your first workout and your lifts, streaks and records will show up here.')}`;

  const volume = inRange.reduce((a, s) => a + sessionVolume(s), 0);
  // Weight added across the main lifts within the range: first logged -> next session.
  const MAIN = trackedLifts(prog);
  const gained = MAIN.reduce((a, l) => {
    const h = prog[l].history.filter((x) => x.at >= from);
    return a + (h.length ? prog[l].weight - h[0].weight : 0);
  }, 0);
  const weeks = weekSeries(all, from);
  const avg = weeks.length ? inRange.length / weeks.length : 0;

  const liftCards = MAIN.map((l) => {
    const h = prog[l].history.filter((x) => x.at >= from);
    const startW = h.length ? h[0].weight : null;
    const gain = startW !== null ? prog[l].weight - startW : 0;
    return `<a class="lift-card" href="#/lift/${l}">
      <div class="lift-card-top"><span>${EXERCISES[l].name}</span>${icon('chevron-right')}</div>
      <b class="lift-card-val">${fmt(prog[l].weight)}<small>${unit()}</small></b>
      <span class="delta ${gain > 0 ? 'up' : gain < 0 ? 'down' : ''}">${h.length ? (gain > 0 ? `+${fmt(gain)} ${unit()}` : gain < 0 ? `${fmt(gain)} ${unit()}` : 'Holding') : 'Not logged yet'}</span>
      ${sparkline(h.map((x) => x.weight))}
    </a>`;
  }).join('');

  const records = MAIN.map((l) => {
    const best = prog[l].history.filter((x) => x.ok).reduce((b, x) => (!b || x.weight > b.weight ? x : b), null);
    return best ? `<li><a href="#/lift/${l}"><span class="rec-icon">${icon('award')}</span><span class="rec-main"><b>${EXERCISES[l].name}</b><small>${relDay(best.at)}</small></span><b class="rec-val">${fmt(best.weight)} ${unit()}</b></a></li>` : '';
  }).join('');

  return `${head}
    <section class="stat-grid">
      <div class="stat"><small>Workouts</small><b>${inRange.length}</b><span>${fmt(Math.round(avg * 10) / 10)} / week</span></div>
      <div class="stat"><small>Volume</small><b>${compact(volume)}</b><span>${unit()} lifted</span></div>
      <div class="stat"><small>Strength</small><b>${gained > 0 ? '+' : ''}${fmt(gained)}</b><span>${unit()} on main lifts</span></div>
    </section>

    <section class="card">
      <div class="card-head"><div><h3>Consistency</h3><p class="card-sub">Workouts per week · goal ${st.goal}</p></div></div>
      ${weekBars(weeks, st.goal)}
    </section>

    ${sectionHead('Strength')}
    <div class="lift-grid">${liftCards}</div>

    ${records ? `${sectionHead('Personal records')}<section class="card list-card"><ul class="rec-list">${records}</ul></section>` : ''}

    ${sectionHead('Recent workouts', `<a class="see-all" href="#/history">See all ${icon('chevron-right', 'inline')}</a>`)}
    <div class="session-list">${all.slice(0, 3).map(sessionCard).join('')}</div>`;
}

export function viewLift(lift) {
  const ex = EXERCISES[lift];
  if (!ex) { location.hash = '#/progress'; return ''; }
  const p = progression(state.sessions, state.settings)[lift];
  const from = cutoff(ui.range);
  const h = p.history.filter((x) => x.at >= from);
  const best1rm = p.history.reduce((m, x) => Math.max(m, ...x.sets.map((r) => e1rm(x.weight, r))), 0);
  const fullLog = [...p.history].reverse();
  const log = ui.logAll ? fullLog : fullLog.slice(0, 8);
  return `${pageHeader(ex.name, { back: '#/progress', eyebrow: 'Lift' })}
    <section class="hero-card compact">
      <p class="overline">Next session</p>
      <p class="hero-number">${ex.bodyweight && !p.weight ? 'BW' : fmt(p.weight)}<small>${ex.bodyweight && !p.weight ? '' : unit()}</small></p>
      <p class="hero-meta">${repsLabel(ex)}${p.fails ? ` · attempt ${p.fails + 1} at this weight` : ''}</p>
      <a class="btn secondary" href="#/ex/${lift}">${icon('info', 'inline')} How to do it</a>
    </section>
    <section class="stat-grid">
      <div class="stat"><small>Best</small><b>${p.best !== null ? fmt(p.best) : '—'}</b><span>${p.best !== null ? unit() : 'no clean session yet'}</span></div>
      <div class="stat"><small>Est. 1-rep max</small><b>${best1rm ? fmt(Math.round(best1rm)) : '—'}</b><span>${best1rm ? unit() : '—'}</span></div>
      <div class="stat"><small>Sessions</small><b>${p.history.length}</b><span>logged</span></div>
    </section>
    <section class="card">
      <div class="card-head"><div><h3>Working weight</h3><p class="card-sub">Hollow dots: missed reps</p></div></div>
      ${segmented('range', RANGES, ui.range, 'Time range')}
      ${lineChart(h, unit())}
    </section>
    ${log.length ? `${sectionHead('Log')}<section class="card list-card"><ul class="log-list">${log.map((x) => `<li>
      <a href="#/session/${x.sessionId}"><span class="log-date">${dateLabel(x.at)}</span>
      <span class="log-w">${ex.bodyweight && !x.weight ? 'BW' : `${fmt(x.weight)} ${unit()}`}</span>
      <span class="log-sets">${x.sets.map((r) => `<i class="${r < (ex.kind === 'barbell' ? ex.reps : ex.repsMax) ? 'miss' : ''}">${r}</i>`).join('')}</span></a></li>`).join('')}</ul>
      ${fullLog.length > log.length ? `<button class="text-btn center-block show-all" data-action="log-all">Show all ${fullLog.length} sessions</button>` : ''}</section>` : ''}`;
}

export function viewHistory() {
  const all = doneSessions();
  const now = new Date();
  const ym = ui.histMonth || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [y, m] = ym.split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const daysIn = new Date(y, m, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const byDay = new Map();
  for (const s of all) { const k = dayKey(s.finishedAt); if (!byDay.has(k)) byDay.set(k, s); }
  const today = dayKey(Date.now());
  let cells = '<span class="cal-h">M</span><span class="cal-h">T</span><span class="cal-h">W</span><span class="cal-h">T</span><span class="cal-h">F</span><span class="cal-h">S</span><span class="cal-h">S</span>';
  cells += '<span></span>'.repeat(lead);
  for (let d = 1; d <= daysIn; d++) {
    const k = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const s = byDay.get(k);
    cells += s ? `<a class="cal-d on ${k === today ? 'today' : ''}" href="#/session/${s.id}">${d}</a>` : `<span class="cal-d ${k === today ? 'today' : ''}">${d}</span>`;
  }
  const shift = (delta) => { const d = new Date(y, m - 1 + delta, 1); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; };
  const monthCount = all.filter((s) => { const d = new Date(s.finishedAt); return d.getFullYear() === y && d.getMonth() === m - 1; }).length;

  const groups = new Map();
  for (const s of all) {
    const label = dateLabel(s.finishedAt, { month: 'long', year: 'numeric' });
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(s);
  }
  return `${pageHeader('History', { back: '#/progress' })}
    <section class="card cal-card">
      <div class="cal-top">
        <button class="icon-btn" data-action="hist-month" data-v="${shift(-1)}" aria-label="Previous month">${icon('chevron-left')}</button>
        <div><b>${first.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</b><small>${monthCount} workout${monthCount === 1 ? '' : 's'}</small></div>
        <button class="icon-btn" data-action="hist-month" data-v="${shift(1)}" aria-label="Next month">${icon('chevron-right')}</button>
      </div>
      <div class="cal-grid">${cells}</div>
    </section>
    ${all.length ? [...groups].map(([label, list]) => `${sectionHead(label)}<div class="session-list">${list.map(sessionCard).join('')}</div>`).join('') : '<p class="muted center">No workouts yet.</p>'}`;
}

export function viewSession(id) {
  const s = state.sessions.find((x) => x.id === id && x.status === 'done');
  if (!s) { location.hash = '#/history'; return ''; }
  const sets = s.exercises.reduce((a, e) => a + (e.skipped ? 0 : e.sets.filter((x) => x.reps).length), 0);
  const st = stats(state.sessions, state.settings);
  const prs = st.prSessions.get(s.id) || 0;
  return `${pageHeader(WORKOUTS[s.workout].name, { back: '#/history', eyebrow: dateLabel(s.finishedAt, { weekday: 'long', month: 'long', day: 'numeric' }) })}
    <section class="stat-grid">
      <div class="stat"><small>Duration</small><b>${duration(s.finishedAt - s.startedAt)}</b></div>
      <div class="stat"><small>Volume</small><b>${compact(sessionVolume(s))}</b><span>${unit()}</span></div>
      <div class="stat"><small>${prs ? 'PRs' : 'Sets'}</small><b>${prs || sets}</b></div>
    </section>
    ${s.exercises.map((e) => {
      const ex = EXERCISES[e.lift];
      const w = convert(e.weight, s.unit || unit(), unit());
      return `<section class="card ex-summary ${e.skipped ? 'is-skipped' : ''}">
        <div class="ex-summary-top"><span class="thumb" data-still="${ex.motion}"></span>
          <div><b>${ex.name}</b><small>${e.skipped ? 'Skipped' : esc(weightLabel(e.lift, w))}</small></div></div>
        ${e.skipped ? '' : `<div class="rep-chips">${e.sets.map((x, i) => `<span class="${(x.reps ?? 0) < e.target ? 'miss' : ''}"><small>Set ${i + 1}</small>${x.reps ?? '–'}</span>`).join('')}</div>`}
      </section>`;
    }).join('')}
    <button class="text-btn danger center-block" data-action="delete-session" data-id="${s.id}">${ui.armed === `del:${s.id}` ? 'Tap again to delete this workout' : 'Delete workout'}</button>`;
}
