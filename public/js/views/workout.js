import { EXERCISES, WORKOUTS, UNITS, SLOT_OF, optionsFor, progression, warmups, platesPerSide } from '../program.js';
import { swapSheet } from './swap.js';
import { plateViz } from '../chart.js';
import {
  state, ui, icon, esc, fmt, unit, repsLabel, weightLabel, activeSession,
} from '../core.js';

export const exDone = (x) => x.skipped || x.sets.every((y) => y.reps !== null);
const clock = (sec) => `${Math.floor(sec / 60)}:${String(Math.max(0, sec) % 60).padStart(2, '0')}`;

function failNote(e, ex) {
  if (ex.kind !== 'barbell' || !e.fails) return '';
  const text = e.fails === 1
    ? 'Second go at this weight. Same plan. You know what it feels like now.'
    : 'Third try at this weight. If it doesn\'t move today, it drops 10% next time so you can build back up.';
  return `<p class="soft-note">${icon('info', 'inline')} ${text}</p>`;
}

function setRows(s, e, i, ex, prev) {
  const u = unit();
  const wus = e.skipped ? [] : warmups(e.lift, e.weight, u);
  const wkey = `${s.id}:${e.lift}`;
  const warmDone = ui.warm[wkey] || [];
  const warm = wus.map((w, wi) => {
    const on = warmDone.includes(wi);
    return `<div class="set-row warm ${on ? 'is-done' : ''}">
      <span class="set-no">W</span>
      <span class="set-prev">Warm-up</span>
      <span class="set-reps static">${fmt(w.weight)} × ${w.reps}</span>
      <button class="check" data-action="warm" data-k="${wkey}" data-w="${wi}" aria-pressed="${on}" aria-label="Warm-up ${wi + 1} done">${icon('check')}</button>
    </div>`;
  }).join('');
  const work = e.sets.map((set, si) => {
    const done = set.reps !== null;
    const reps = done ? set.reps : (set.planned ?? e.target);
    const miss = done && set.reps < e.target;
    const p = prev?.sets?.[si];
    const prevText = p != null ? `${ex.bodyweight && !prev.weight ? 'BW' : fmt(prev.weight)} × ${p}` : '—';
    return `<div class="set-row ${done ? 'is-done' : ''} ${miss ? 'is-miss' : ''}">
      <span class="set-no">${si + 1}</span>
      <span class="set-prev">${prevText}</span>
      <span class="set-reps">
        <button class="mini" data-action="reps" data-i="${i}" data-s="${si}" data-d="-1" aria-label="One fewer rep">${icon('minus')}</button>
        <b>${reps}</b>
        <button class="mini" data-action="reps" data-i="${i}" data-s="${si}" data-d="1" aria-label="One more rep">${icon('plus')}</button>
      </span>
      <button class="check" data-action="set-check" data-i="${i}" data-s="${si}" aria-pressed="${done}" aria-label="Set ${si + 1} ${done ? 'done' : 'not done'}">${icon('check')}</button>
    </div>`;
  }).join('');
  return `<div class="set-head"><span>Set</span><span>Previous</span><span>Reps</span><span></span></div>${warm}${work}`;
}

export function viewWorkout() {
  const s = activeSession();
  if (!s) { location.hash = '#/today'; return ''; }
  const u = unit();
  const n = s.exercises.length;
  const i = Math.min(Math.max(s.current || 0, 0), n - 1);
  const e = s.exercises[i];
  const ex = EXERCISES[e.lift];
  const complete = exDone(e);
  const last = i === n - 1;
  const next = s.exercises[i + 1];
  const slot = e.slot || SLOT_OF[e.lift];
  const canSwap = optionsFor(slot).length > 1;
  const progNow = progression(state.sessions.filter((x) => x.id !== s.id), state.settings)[e.lift];
  const prev = progNow.history.length ? progNow.history[progNow.history.length - 1] : null;
  const allDone = s.exercises.every(exDone);

  const tabs = s.exercises.map((x, xi) => `<button class="ex-tab ${xi === i ? 'on' : ''} ${exDone(x) ? 'done' : ''}" data-action="goto" data-i="${xi}">
      <span class="ex-tab-n">${exDone(x) ? icon('check') : xi + 1}</span>${EXERCISES[x.lift].name}</button>`).join('');

  const plates = ex.equipment === 'barbell' ? platesPerSide(e.weight, u) : [];
  const unitNote = ex.bodyweight && e.weight === 0 ? 'bodyweight'
    : ex.equipment === 'dumbbell' ? (ex.load === 2 ? `${u} per dumbbell` : `${u} dumbbell`)
      : ex.equipment === 'cable' ? `${u} on the stack` : u;
  const firstTime = !prev && progNow.suggested && slot !== e.lift
    ? `<p class="soft-note">${icon('info', 'inline')} First time on this one. ${progNow.suggestedFrom ? `This start is worked out from your ${EXERCISES[slot].name.toLowerCase()}.` : 'This is a light starting weight.'} Use − / + until every rep feels solid but clean; it progresses from there.</p>` : '';
  const weightCard = e.skipped ? '' : `<section class="card weight-card">
      <p class="overline">${ex.bodyweight ? 'Added weight' : 'Working weight'}</p>
      <div class="weight-row">
        <button class="round-btn" data-action="weight" data-i="${i}" data-d="-1" aria-label="Less weight">${icon('minus')}</button>
        <div class="weight-val"><b>${ex.bodyweight && e.weight === 0 ? 'BW' : fmt(e.weight)}</b><span>${unitNote}</span></div>
        <button class="round-btn" data-action="weight" data-i="${i}" data-d="1" aria-label="More weight">${icon('plus')}</button>
      </div>
      ${ex.equipment === 'barbell' ? `${plateViz(plates, u, UNITS[u].bar)}
        <p class="plate-caption">${plates.length ? `${UNITS[u].bar} ${u} bar + <b>${plates.map(fmt).join(' · ')}</b> each side` : `Just the ${UNITS[u].bar} ${u} bar`}</p>` : ''}
      ${failNote(e, ex)}${firstTime}
    </section>`;

  const restMins = ex.rest >= 120 ? `${ex.rest / 60} min` : `${ex.rest}s`;

  return `<div class="focus-bar">
      <a class="icon-btn" href="#/today" aria-label="Back to Today">${icon('chevron-left')}</a>
      <div class="focus-title"><b>${WORKOUTS[s.workout].name}</b><span id="elapsed">${clock(Math.floor((Date.now() - s.startedAt) / 1000))}</span></div>
      <button class="pill-btn ${allDone ? 'primary' : ''}" data-action="finish">${ui.armed === 'finish' ? 'Sure?' : 'Finish'}</button>
    </div>
    ${ui.armed === 'finish' ? '<p class="armed-note">Some sets aren\'t logged. Tap Finish again to end anyway.</p>' : ''}
    <div class="ex-tabs" role="tablist" aria-label="Exercises">${tabs}</div>

    <p class="soft-note center-block">${icon('info', 'inline')} ~2 reps in reserve · knees out over the toes · discomfort 0–3/10 is OK — ease off if it's sharp or sore the next morning.</p>

    <section class="card ex-card ${complete ? 'complete' : ''}">
      <div class="motion" data-motion="${ex.motion || ''}" data-title="${esc(ex.name)}"></div>
      ${slot !== e.lift ? `<p class="swapped-from">${icon('repeat', 'inline')} In place of ${esc(EXERCISES[slot].name)}</p>` : ''}
      <div class="ex-card-head">
        <div><h2>${ex.name}</h2><p>${repsLabel(ex)} · rest ${restMins}${ex.kind === 'accessory' ? ` · add weight at ${ex.repsMax} reps` : ''}</p></div>
        <a class="guide-btn" href="#/ex/${e.lift}">${icon('info', 'inline')} Guide</a>
      </div>
    </section>

    ${e.skipped ? `<section class="card skipped-card"><p>You skipped ${ex.name}.</p><button class="btn secondary" data-action="unskip" data-i="${i}">Undo skip</button></section>` : `
    ${weightCard}
    <section class="card sets-card">
      ${setRows(s, e, i, ex, prev)}
      <div class="sets-actions">
        ${canSwap ? `<button class="text-btn" data-action="swap-open" data-i="${i}">${icon('repeat', 'inline')} Swap exercise</button>` : ''}
        <button class="text-btn" data-action="skip" data-i="${i}">${icon('skip-forward', 'inline')} Skip exercise</button>
      </div>
    </section>`}

    <button class="text-btn danger center-block" data-action="discard">${ui.armed === 'discard' ? 'Tap again to discard this workout' : 'Discard workout'}</button>

    <div class="action-bar">
      ${i > 0 ? `<button class="btn secondary square" data-action="goto" data-i="${i - 1}" aria-label="Previous exercise">${icon('chevron-left')}</button>` : ''}
      ${last
        ? `<button class="btn ${complete ? 'primary' : 'secondary'} grow" data-action="finish">${icon('trophy', 'inline')} Finish workout</button>`
        : `<button class="btn ${complete ? 'primary' : 'secondary'} grow" data-action="goto" data-i="${i + 1}"><span class="btn-stack"><small>Next</small>${EXERCISES[next.lift].name}</span>${icon('chevron-right', 'inline')}</button>`}
    </div>
    ${restSheet(s)}
    ${swapSheet()}`;
}

function restSheet(s) {
  if (!ui.rest) return '';
  const r = ui.rest;
  const left = r.goal - Math.floor((Date.now() - r.start) / 1000);
  const size = 76, stroke = 6, rad = (size - stroke) / 2, c = 2 * Math.PI * rad;
  return `<div class="rest-sheet ${left <= 0 ? 'ready' : ''}" id="rest" role="timer" aria-live="off">
    <div class="rest-ring">
      <svg viewBox="0 0 ${size} ${size}" aria-hidden="true"><circle class="ring-track" cx="${size / 2}" cy="${size / 2}" r="${rad}" stroke-width="${stroke}"/>
      <circle class="ring-fill" id="rest-arc" cx="${size / 2}" cy="${size / 2}" r="${rad}" stroke-width="${stroke}" stroke-dasharray="${c}" stroke-dashoffset="0" transform="rotate(-90 ${size / 2} ${size / 2})" data-c="${c}"/></svg>
      <b id="rest-time">${clock(Math.max(0, left))}</b>
    </div>
    <div class="rest-body">
      <p class="overline" id="rest-label">${left <= 0 ? 'Time to go' : 'Rest'}</p>
      <p class="rest-next">${esc(r.nextLabel || '')}</p>
      <div class="rest-actions">
        <button class="chip-btn" data-action="rest-add" data-d="-15">−15s</button>
        <button class="chip-btn" data-action="rest-add" data-d="15">+15s</button>
        <button class="chip-btn strong" data-action="rest-skip">Skip</button>
      </div>
    </div>
  </div>`;
}

// What comes after the set that was just logged, for the rest sheet.
export function nextUpLabel(s, i) {
  const e = s.exercises[i];
  const idx = e.sets.findIndex((x) => x.reps === null);
  if (idx >= 0) return `Next: set ${idx + 1} of ${e.sets.length} · ${e.sets[idx].planned ?? e.target} reps`;
  const nextEx = s.exercises.slice(i + 1).find((x) => !exDone(x));
  return nextEx ? `Next: ${EXERCISES[nextEx.lift].name} · ${weightLabel(nextEx.lift, nextEx.weight)}` : 'Last set done. Finish when ready.';
}

// Called every 250ms by the app: keeps the timers live without re-rendering.
export function tickWorkout() {
  const s = activeSession();
  const el = document.getElementById('elapsed');
  if (s && el) el.textContent = clock(Math.floor((Date.now() - s.startedAt) / 1000));
  if (!ui.rest) return false;
  const t = document.getElementById('rest-time');
  if (!t) return false;
  const left = ui.rest.goal - Math.floor((Date.now() - ui.rest.start) / 1000);
  t.textContent = left >= 0 ? clock(left) : `+${clock(-left)}`;
  const arc = document.getElementById('rest-arc');
  const c = Number(arc.dataset.c);
  arc.setAttribute('stroke-dashoffset', String(c * (1 - Math.max(0, left) / ui.rest.goal)));
  const ready = left <= 0;
  document.getElementById('rest').classList.toggle('ready', ready);
  document.getElementById('rest-label').textContent = ready ? 'Time to go' : 'Rest';
  return ready;
}
