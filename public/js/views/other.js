import { EXERCISES, UNITS, progression, defaultStart } from '../program.js';
import { GUIDES } from '../guides.js';
import { state, ui, icon, esc, num, repsLabel, weightLabel, pageHeader, segmented } from '../core.js';
import { dayPicker, unitPicker } from './settings.js';

export function viewExercise(lift) {
  const ex = EXERCISES[lift];
  if (!ex) { location.hash = '#/today'; return ''; }
  // Fall back to a minimal guide built from the tagline, so an exercise
  // without a full write-up never crashes this screen.
  const g = GUIDES[lift] || { muscles: ex.name, cues: [], setup: [ex.tagline || ''], steps: [], mistakes: [], safety: [] };
  const p = progression(state.sessions, state.settings)[lift];
  const tab = ui.guideTab;
  const numbered = (arr, start = 1) => arr.map((x, i) => `<li><span class="step-n">${i + start}</span><p>${esc(x)}</p></li>`).join('');

  let body;
  if (tab === 'mistakes') {
    body = `<ul class="fix-list">${g.mistakes.map(([m, fix]) => `<li><div class="fix-x">${icon('x')}</div><div><b>${esc(m)}</b><p>${esc(fix)}</p></div></li>`).join('')}</ul>`;
  } else if (tab === 'safety') {
    body = `<ul class="safe-list">${g.safety.map((x) => `<li>${icon('shield-check')}<p>${esc(x)}</p></li>`).join('')}</ul>`;
  } else {
    body = `<h3 class="sub-h">Set up</h3><ol class="steps">${numbered(g.setup)}</ol>
      <h3 class="sub-h">Each rep</h3><ol class="steps">${numbered(g.steps)}</ol>`;
  }

  return `${pageHeader(ex.name, { back: 'javascript:history.back()' })}
    <section class="card guide-hero">
      <div class="motion" data-motion="${ex.motion || ''}" data-title="${esc(ex.name)}"></div>
      <div class="guide-meta">
        <div><small>Works</small><b>${esc(g.muscles)}</b></div>
      </div>
      <div class="cues">${g.cues.map((c) => `<span class="cue">${esc(c)}</span>`).join('')}</div>
    </section>
    ${segmented('guide-tab', [['steps', 'How to'], ['mistakes', 'Mistakes'], ['safety', 'Safety']], tab, 'Guide section')}
    <section class="card guide-body">${body}</section>
    <a class="card link-card" href="#/lift/${lift}">
      <span class="row-icon orange">${icon('trending-up')}</span>
      <span class="row-label">Your ${ex.name.toLowerCase()}<small>Next: ${esc(weightLabel(lift, p.weight))} · ${repsLabel(ex)}</small></span>
      ${icon('chevron-right', 'chev')}
    </a>`;
}

export function viewOnboarding() {
  const s = state.settings;
  const step = ui.obStep;
  const dots = `<div class="ob-dots">${[0, 1, 2].map((i) => `<i class="${i === step ? 'on' : i < step ? 'past' : ''}"></i>`).join('')}</div>`;
  const back = step > 0 ? `<button class="icon-btn" data-action="ob-step" data-v="${step - 1}" aria-label="Back">${icon('chevron-left')}</button>` : '<span></span>';

  if (step === 0) {
    const feat = (ic, title, body) => `<li><span class="row-icon orange">${icon(ic)}</span><div><b>${title}</b><p>${body}</p></div></li>`;
    return `<div class="onboard">
      <div class="ob-mark">${icon('dumbbell')}</div>
      <h1>Strength training, minus the guesswork.</h1>
      <p class="lead">Show up, do what the app says, and watch the numbers go up.</p>
      <ul class="feature-list">
        ${feat('repeat', 'A proven plan', 'Two full-body workouts, alternated. The app picks every weight for you.')}
        ${feat('info', 'Coaching built in', 'Animations, step-by-step form cues and safety notes for every lift.')}
        ${feat('flame', 'Streaks that reward you', 'Hit your weekly goal, build a streak, unlock badges.')}
      </ul>
      <div class="ob-foot">${dots}<button class="btn primary lg" data-action="ob-step" data-v="1">Get started</button></div>
    </div>`;
  }
  if (step === 1) {
    return `<div class="onboard">
      <div class="ob-top">${back}${dots}<span></span></div>
      <h1>Your week</h1>
      <p class="lead">Pick the days you can usually train. You can change this anytime.</p>
      <section class="card"><p class="field-label">Units</p>${unitPicker(s.unit)}
        <p class="field-label">Training days</p>${dayPicker(s.trainingDays)}
        <p class="hint">${s.trainingDays.length >= 2 ? `${s.trainingDays.length} days a week. ${s.trainingDays.length === 3 ? 'Perfect for this plan.' : ''}` : 'Pick at least two days.'}</p></section>
      <div class="ob-foot"><button class="btn primary lg" data-action="ob-step" data-v="2" ${s.trainingDays.length < 2 ? 'disabled' : ''}>Continue</button></div>
    </div>`;
  }
  const lifts = ['squat', 'bench', 'row', 'ohp', 'deadlift'];
  return `<div class="onboard">
    <div class="ob-top">${back}${dots}<span></span></div>
    <h1>Starting weights</h1>
    <p class="lead">New to lifting? Keep these. Everyone starts with the empty bar (${UNITS[s.unit].bar} ${s.unit}) and the plan adds weight quickly.</p>
    <section class="card start-list">${lifts.map((l) => `<label class="start-row"><span class="thumb" data-still="${EXERCISES[l].motion}"></span>
      <span class="row-label">${EXERCISES[l].name}<small>${repsLabel(EXERCISES[l])}</small></span>
      <span class="num-input"><input type="number" inputmode="decimal" min="0" step="${UNITS[s.unit].small}" data-action="ob-start" data-lift="${l}" value="${num(s.start[l] ?? defaultStart(l, s.unit))}"><em>${s.unit}</em></span></label>`).join('')}</section>
    <p class="hint">Already lift? Use a weight you can do for 5 clean reps.</p>
    <div class="ob-foot"><button class="btn primary lg" data-action="ob-done">Start lifting</button></div>
  </div>`;
}

export function viewLogin() {
  return `<div class="onboard login">
    <div class="ob-mark">${icon('dumbbell')}</div>
    <h1>Welcome back</h1>
    <form class="card" id="login">
      <label class="field"><span>Username</span><input name="username" autocomplete="username" required></label>
      <label class="field"><span>Password</span><input name="password" type="password" autocomplete="current-password" required></label>
      <button class="btn primary lg">Sign in</button>
      <p class="form-error" id="login-err" hidden></p>
    </form>
  </div>`;
}
