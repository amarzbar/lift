import { EXERCISES, WORKOUTS, UNITS, ALTERNATIVES, chosenFor, progression } from '../program.js';
import { slotName } from './swap.js';
import { GENERAL_SAFETY } from '../guides.js';
import * as store from '../store.js';
import {
  state, ui, icon, esc, num, DAYS, isStandalone, isIOS, pageHeader, segmented, toggle, syncText,
} from '../core.js';

const row = ({ ic, color = 'gray', label, desc = '', end = '', href = '', cls = '' }) => {
  const inner = `<span class="row-icon ${color}">${icon(ic)}</span>
    <span class="row-label">${label}${desc ? `<small>${desc}</small>` : ''}</span>
    <span class="row-end">${end}${href ? icon('chevron-right', 'chev') : ''}</span>`;
  return href ? `<a class="srow ${cls}" href="${href}">${inner}</a>` : `<div class="srow ${cls}">${inner}</div>`;
};
const group = (title, rows, foot = '') => `<section class="sgroup">${title ? `<p class="sgroup-title">${title}</p>` : ''}<div class="sgroup-body">${rows.join('')}</div>${foot ? `<p class="sgroup-foot">${foot}</p>` : ''}</section>`;

export const dayPicker = (days) => `<div class="daypick">${[1, 2, 3, 4, 5, 6, 0].map((d) =>
  `<button class="dp ${days.includes(d) ? 'on' : ''}" data-action="day" data-d="${d}" aria-pressed="${days.includes(d)}">${DAYS[d].slice(0, 2)}</button>`).join('')}</div>`;

export const unitPicker = (u) => segmented('unit-set', [['lb', 'Imperial (lb)'], ['kg', 'Metric (kg)']], u, 'Units');

export function viewSettings() {
  const s = state.settings;
  const r = s.reminders;
  const pushOk = 'PushManager' in window && 'serviceWorker' in navigator;
  const perm = 'Notification' in window ? Notification.permission : 'unsupported';
  const ss = store.syncState;
  const dot = { ok: 'ok', syncing: 'busy', offline: 'warn', error: 'bad', 'signed-out': 'warn' }[ss.status] || 'warn';

  const install = !isStandalone() ? `<section class="install-card">${icon('bell')}<div><b>Install Lift</b>
    <p>${isIOS() ? 'In Safari tap <b>Share</b>, then <b>Add to Home Screen</b>. Reminders only work from the installed app.' : 'Use your browser\'s <b>Install app</b> option for offline use and reminders.'}</p></div></section>` : '';

  const reminderRows = !pushOk
    ? [row({ ic: 'bell', color: 'red', label: 'Gym reminders', desc: isIOS() && !isStandalone() ? 'Add the app to your Home Screen first' : 'Not supported in this browser' })]
    : [
      row({ ic: 'bell', color: 'red', label: 'Gym reminders', desc: perm === 'denied' ? 'Blocked. Allow in iOS Settings › Notifications › Lift' : 'On your training days', end: toggle('reminders', r.enabled && perm === 'granted', 'Gym reminders') }),
      row({ ic: 'timer', color: 'orange', label: 'Remind me at', end: `<input type="time" data-action="rtime" value="${r.time}" aria-label="Reminder time">` }),
      row({ ic: 'flame', color: 'orange', label: 'Streak saver', desc: 'A heads-up on off days if the week is slipping', end: toggle('rsave', r.streakSave, 'Streak saver') }),
      ...(r.enabled ? [`<button class="srow action" data-action="rtest"><span class="row-icon blue">${icon('bell')}</span><span class="row-label">Send a test notification</span></button>`] : []),
    ];

  return `${pageHeader('Settings')}
    ${install}
    ${group('Training', [
      `<div class="srow stack"><span class="row-label">Units</span>${unitPicker(s.unit)}</div>`,
      `<div class="srow stack"><span class="row-label">Training days<small>Reminders go out on these days</small></span>${dayPicker(s.trainingDays)}</div>`,
      `<div class="srow stack"><span class="row-label">Weekly goal<small>Hit it to keep your streak</small></span>${segmented('goal', [[2, '2× a week'], [3, '3× a week'], [4, '4× a week']], s.weeklyGoal, 'Weekly goal')}</div>`,
    ])}
    ${group('Reminders', reminderRows)}
    ${group('Exercises', [
      ...Object.keys(ALTERNATIVES).map((slot) => {
        const pick = chosenFor(slot, s);
        return row({ ic: 'repeat', color: pick === slot ? 'gray' : 'blue', label: slotName(slot), desc: pick === slot ? EXERCISES[slot].name : `${EXERCISES[pick].name} (gentler)`, href: `#/swap/${slot}` });
      }),
      row({ ic: 'dumbbell', color: 'green', label: 'Adjust next weights', href: '#/weights' }),
    ], 'Getting back into it? The gentler options build the same muscles with less risk. Switch back whenever you feel ready.')}
    ${group('Account', [
      row({ ic: 'shield-check', color: 'green', label: 'Signed in', end: `<span class="row-value">${esc(state.user?.username || 'Offline')}</span>` }),
      `<div class="srow"><span class="row-icon gray">${icon('repeat')}</span><span class="row-label">Sync<small><i class="status-dot ${dot}"></i>${esc(syncText() || 'Waiting')}</small></span><span class="row-end"><button class="chip-btn" data-action="sync">Sync now</button></span></div>`,
      ...(state.mode === 'multi' && state.user ? [`<button class="srow action danger" data-action="logout"><span class="row-label">Sign out</span></button>`] : []),
    ])}
    ${group('About', [
      row({ ic: 'info', color: 'blue', label: 'How the plan works', href: '#/plan' }),
      row({ ic: 'award', color: 'gray', label: 'Credits & licenses', href: '#/credits' }),
    ])}
    <button class="text-btn danger center-block" data-action="reset">${ui.armed === 'reset' ? 'Tap again: erase data on this phone (the server copy stays)' : 'Clear data on this phone'}</button>`;
}

export function viewWeights() {
  const s = state.settings;
  const prog = progression(state.sessions, s);
  return `${pageHeader('Next weights', { back: '#/settings' })}
    <p class="page-intro">The app picks these for you. Change one only if it's clearly wrong. Your number is used until you log that lift again.</p>
    ${group('', Object.keys(EXERCISES).map((l) => `<label class="srow"><span class="row-label">${EXERCISES[l].name}${EXERCISES[l].bodyweight ? '<small>Added weight, 0 = bodyweight</small>' : ''}</span>
      <span class="row-end num-input"><input type="number" inputmode="decimal" step="${UNITS[s.unit].small / 2}" min="0" data-action="override" data-lift="${l}" value="${num(prog[l].weight)}"><em>${s.unit}</em></span></label>`))}`;
}

export function viewPlan() {
  const s = state.settings;
  const u = UNITS[s.unit];
  const card = (k) => `<section class="card plan-card"><p class="overline">${WORKOUTS[k].name}</p>
    <ul>${WORKOUTS[k].lifts.map((slot) => chosenFor(slot, s)).map((l) => `<li><span>${EXERCISES[l].name}</span><small>${EXERCISES[l].kind === 'barbell' ? `${EXERCISES[l].sets} × ${EXERCISES[l].reps}` : `${EXERCISES[l].sets} × ${EXERCISES[l].repsMin}–${EXERCISES[l].repsMax}`}</small></li>`).join('')}</ul></section>`;
  const step = (ic, title, body) => `<div class="explain-row"><span class="row-icon orange">${icon(ic)}</span><div><b>${title}</b><p>${body}</p></div></div>`;
  return `${pageHeader('How the plan works', { back: '#/settings' })}
    <div class="plan-cards">${card('A')}${card('B')}</div>
    <section class="card">
      ${step('repeat', 'Alternate A and B', `Train ${s.weeklyGoal}× a week with a rest day between sessions when you can.`)}
      ${step('trending-up', 'Hit every rep, add weight', `Main lifts go up ${u.small} ${s.unit} each session (deadlift ${u.big} ${s.unit}). That adds up fast.`)}
      ${step('repeat', 'Miss, repeat', 'Missed reps? Same weight next time. No penalty.')}
      ${step('arrow-down', 'Stuck three times, step back', 'Miss the same weight three sessions in a row and it drops 10% so you can build momentum again.')}
      ${step('dumbbell', 'Accessories climb by reps', 'Pull-ups, dips and similar add reps until every set hits the top of the range, then add weight.')}
    </section>
    <section class="card"><h3>Ground rules</h3><ul class="bullets">${GENERAL_SAFETY.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></section>`;
}

export function viewCredits() {
  return `${pageHeader('Credits', { back: '#/settings' })}
    ${group('Exercise animations', [`<div class="srow text"><p>Animations by <a class="link" href="https://github.com/februarysea/workout-motion" target="_blank" rel="noopener">workout-motion</a>, used under the
      <a class="link" href="https://polyformproject.org/licenses/noncommercial/1.0.0" target="_blank" rel="noopener">PolyForm Noncommercial License 1.0.0</a>.</p>
      <p class="fine">Required Notice: Copyright (c) 2026 februarysea and workout-motion contributors (https://github.com/februarysea/workout-motion)</p></div>`])}
    ${group('Icons & type', [`<div class="srow text"><p><a class="link" href="https://lucide.dev" target="_blank" rel="noopener">Lucide</a> icons, ISC License. Copyright (c) Lucide Icons and Contributors.</p>
      <p><a class="link" href="https://rsms.me/inter/" target="_blank" rel="noopener">Inter</a> typeface, SIL Open Font License 1.1. Copyright 2016 The Inter Project Authors.</p></div>`])}
    <p class="page-intro">Lift gives general training guidance, not medical advice.</p>`;
}
