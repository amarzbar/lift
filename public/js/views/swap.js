// Choosing between a plan slot's main lift and its gentler alternatives:
// a bottom sheet mid-workout, and a page in Settings for the default.
import {
  EXERCISES, EQUIPMENT_LABEL, SLOT_OF, optionsFor, chosenFor, progression,
} from '../program.js';
import { state, ui, icon, esc, weightLabel, repsLabel, activeSession, pageHeader } from '../core.js';

const SLOT_NAMES = { squat: 'Squat', bench: 'Bench press', row: 'Row', ohp: 'Overhead press', deadlift: 'Deadlift', pullup: 'Pull-up', dip: 'Dip' };
export const slotName = (slot) => SLOT_NAMES[slot] || EXERCISES[slot].name;

function weightHint(lift, p) {
  if (p.history.length) return `<b>${esc(weightLabel(lift, p.weight))}</b><small>next</small>`;
  return `<b>${esc(weightLabel(lift, p.weight))}</b><small>${p.suggested ? 'suggested start' : 'start'}</small>`;
}

function optionBody(lift, p, tag) {
  const ex = EXERCISES[lift];
  return `<span class="thumb lg" data-still="${ex.motion || ''}"></span>
    <span class="opt-main">
      <span class="opt-title"><b>${ex.name}</b>${tag}</span>
      <small>${EQUIPMENT_LABEL[ex.equipment]} · ${repsLabel(ex)}</small>
      <span class="opt-why">${esc(ex.tagline)}</span>
    </span>
    <span class="opt-weight">${weightHint(lift, p)}</span>`;
}

// Explains the one thing people get confused by: weights don't transfer.
function carryNote(slot, currentLift, prog) {
  const cur = EXERCISES[currentLift];
  const curP = prog[currentLift];
  return `<div class="carry-note">${icon('info')}<div>
    <b>How weights carry over</b>
    <p>They don't, on purpose. Each exercise keeps its own weight and progress${curP.history.length ? `, so ${cur.name} stays at ${esc(weightLabel(currentLift, curP.weight))} for when you switch back` : ''}.
    The first time you try an alternative, it starts at a conservative weight: a fraction of what you last lifted on ${EXERCISES[slot].name.toLowerCase()}, or a light default if you haven't done it yet. If it feels too light or heavy, adjust it with − / +; from then on it moves up on its own.</p>
  </div></div>`;
}

export function swapSheet() {
  const s = activeSession();
  if (!ui.swap || !s) return '';
  const e = s.exercises[ui.swap.i];
  const slot = e.slot || SLOT_OF[e.lift];
  const prog = progression(state.sessions.filter((x) => x.id !== s.id), state.settings);
  const opts = optionsFor(slot).map((lift) => {
    const cur = lift === e.lift;
    const tag = cur ? '<span class="tag">Current</span>' : EXERCISES[lift].easy ? '<span class="tag easy">Gentler</span>' : '<span class="tag">Main lift</span>';
    return `<button class="opt ${cur ? 'current' : ''}" ${cur ? 'disabled' : ''} data-action="swap-pick" data-lift="${lift}">${optionBody(lift, prog[lift], tag)}</button>`;
  }).join('');
  return `<div class="sheet-backdrop" data-action="swap-close"></div>
  <div class="sheet" role="dialog" aria-modal="true" aria-label="Swap ${esc(slotName(slot))}">
    <div class="sheet-grab"></div>
    <div class="sheet-head"><div><p class="overline">Swap exercise</p><h2>${esc(slotName(slot))} options</h2></div>
      <button class="icon-btn" data-action="swap-close" aria-label="Close">${icon('x')}</button></div>
    <div class="opt-list">${opts}</div>
    <label class="remember">${`<span><b>Use it every time</b><small>Make it the default for this slot. Change it in Settings.</small></span>`}
      <span class="switch"><input type="checkbox" role="switch" data-action="swap-remember" ${ui.swap.remember ? 'checked' : ''} aria-label="Use it every time"><span></span></span></label>
    ${carryNote(slot, e.lift, prog)}
  </div>`;
}

export function viewSwapSlot(slot) {
  if (!optionsFor(slot) || !SLOT_NAMES[slot]) { location.hash = '#/settings'; return ''; }
  const prog = progression(state.sessions, state.settings);
  const chosen = chosenFor(slot, state.settings);
  const opts = optionsFor(slot).map((lift) => {
    const on = lift === chosen;
    const tag = lift === slot ? '<span class="tag">Main lift</span>' : '<span class="tag easy">Gentler</span>';
    return `<div class="opt-wrap ${on ? 'selected' : ''}">
      <button class="opt" data-action="swap-default" data-slot="${slot}" data-lift="${lift}" aria-pressed="${on}">
        ${optionBody(lift, prog[lift], tag)}
        <span class="opt-radio">${on ? icon('check') : ''}</span>
      </button>
      <a class="opt-guide" href="#/ex/${lift}">${icon('info', 'inline')} How to do it</a>
    </div>`;
  }).join('');
  return `${pageHeader(`${esc(slotName(slot))}`, { back: '#/settings', eyebrow: 'Exercise options' })}
    <p class="page-intro">Pick what you'll do in this slot. You can still swap for a single workout from the workout screen.</p>
    <div class="opt-list">${opts}</div>
    ${carryNote(slot, chosen, prog)}`;
}
