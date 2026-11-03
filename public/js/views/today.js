import {
  EXERCISES, WORKOUTS, progression, nextWorkoutKey, liftsFor, stats, dayKey, weekKey, estimateMinutes,
  chosenFor,
} from '../program.js';
import { GENERAL_SAFETY } from '../guides.js';
import {
  state, icon, esc, fmt, unit, repsLabel, weightLabel, activeSession, doneSessions, DAYS, DAYS_LONG,
  pageHeader, sectionHead, syncText, duration,
} from '../core.js';

// When is the next scheduled training day (today counts if not trained yet)?
function nextTrainingDay(st) {
  const days = state.settings.trainingDays;
  if (!days.length) return null;
  const now = new Date();
  for (let i = st.trainedToday ? 1 : 0; i < 8; i++) {
    const d = new Date(now); d.setDate(now.getDate() + i);
    if (days.includes(d.getDay())) return { offset: i, dow: d.getDay() };
  }
  return null;
}

function whenLabel(next) {
  if (!next) return 'Next workout';
  if (next.offset === 0) return "Today's workout";
  if (next.offset === 1) return 'Tomorrow';
  return DAYS_LONG[next.dow];
}

function weekCard(st) {
  const today = dayKey(Date.now());
  const monday = weekKey(today);
  const doneDays = new Set(doneSessions().map((s) => dayKey(s.finishedAt)));
  let cells = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(`${monday}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    const key = d.toISOString().slice(0, 10);
    const dow = d.getUTCDay();
    const done = doneDays.has(key);
    const sched = state.settings.trainingDays.includes(dow);
    const cls = [done ? 'done' : '', sched ? 'sched' : '', key === today ? 'today' : '', key < today && sched && !done ? 'missed' : ''].join(' ');
    cells += `<div class="wday ${cls}"><span class="wday-l">${DAYS[dow].slice(0, 1)}</span><span class="wday-dot">${done ? icon('check') : ''}</span></div>`;
  }
  const left = st.goal - st.thisWeekCount;
  const msg = left <= 0
    ? `${icon('shield-check', 'inline')} Week goal hit. Your streak is safe.`
    : st.streak
      ? `${left} more workout${left > 1 ? 's' : ''} keeps your ${st.streak}-week streak going.`
      : `${left} more workout${left > 1 ? 's' : ''} to hit this week's goal.`;
  return `<section class="card week-card">
    <div class="week-top">
      <div><p class="overline">This week</p><p class="week-count"><b>${st.thisWeekCount}</b> of ${st.goal} workouts</p></div>
      <a class="streak-pill ${st.streak ? '' : 'cold'}" href="#/rewards" aria-label="${st.streak}-week streak">${icon('flame')}<b>${st.streak}</b><span>wk</span></a>
    </div>
    <div class="wdays">${cells}</div>
    <p class="week-msg">${msg}</p>
  </section>`;
}

function exerciseRows(items) {
  return `<ul class="ex-list">${items.map(({ lift, weight, done }) => {
    const ex = EXERCISES[lift];
    return `<li><a href="#/ex/${lift}" class="ex-row">
      <span class="thumb" data-still="${ex.motion}"></span>
      <span class="ex-row-main"><b>${ex.name}</b><small>${repsLabel(ex)}</small></span>
      <span class="ex-row-end">${done ? `<span class="done-tick">${icon('check')}</span>` : `<b>${esc(weightLabel(lift, weight))}</b>`}</span>
    </a></li>`;
  }).join('')}</ul>`;
}

function strengthStrip(prog) {
  const lifts = ['squat', 'bench', 'deadlift', 'ohp'].map((slot) => chosenFor(slot, state.settings));
  const cards = lifts.map((l) => {
    const h = prog[l].history;
    if (!h.length) return '';
    const first = h[0].weight;
    const gain = prog[l].weight - first;
    return `<a class="mini-stat" href="#/lift/${l}">
      <small>${EXERCISES[l].name}</small>
      <b>${fmt(prog[l].weight)}<span>${unit()}</span></b>
      <em class="${gain > 0 ? 'up' : ''}">${gain > 0 ? `${icon('trending-up', 'inline')} +${fmt(gain)} since start` : 'Next session'}</em>
    </a>`;
  }).join('');
  return cards ? `${sectionHead('Your lifts', `<a class="see-all" href="#/progress">Progress ${icon('chevron-right', 'inline')}</a>`)}<div class="hscroll">${cards}</div>` : '';
}

export function viewToday() {
  const s = state.settings;
  const st = stats(state.sessions, s);
  const active = activeSession();
  const key = nextWorkoutKey(state.sessions);
  const prog = progression(state.sessions, s);
  const lifts = liftsFor(key, s);
  const hour = new Date().getHours();
  const greet = hour < 5 ? 'Late night' : hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const eyebrow = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  const next = nextTrainingDay(st);
  const weights = Object.fromEntries(lifts.map((l) => [l, prog[l].weight]));
  const mins = estimateMinutes(lifts, weights, unit());

  let hero;
  if (active) {
    const doneEx = active.exercises.filter((e) => e.skipped || e.sets.every((x) => x.reps !== null)).length;
    hero = `<section class="hero-card live">
      <div class="hero-top"><span class="live-dot"></span><p class="overline">In progress · ${duration(Date.now() - active.startedAt)}</p></div>
      <h2>${WORKOUTS[active.workout].name}</h2>
      <p class="hero-meta">${doneEx} of ${active.exercises.length} exercises done</p>
      ${exerciseRows(active.exercises.map((e) => ({ lift: e.lift, weight: e.weight, done: e.skipped || e.sets.every((x) => x.reps !== null) })))}
      <a class="btn primary lg" href="#/workout">${icon('play', 'inline')} Resume workout</a>
    </section>`;
  } else if (st.trainedToday) {
    const last = doneSessions()[0];
    hero = `<section class="hero-card rested">
      <div class="hero-badge">${icon('circle-check')}</div>
      <p class="overline">Done for today</p>
      <h2>Nice work.</h2>
      <p class="hero-meta">${WORKOUTS[last.workout].name} · ${duration(last.finishedAt - last.startedAt)}. Recover, eat well, sleep.</p>
      <div class="hero-next"><p class="overline">${next ? `Up next · ${whenLabel(next)}` : 'Up next'}</p>
        <p><b>${WORKOUTS[key].name}</b> · ${lifts.map((l) => EXERCISES[l].name).join(', ')}</p></div>
      <button class="btn subtle" data-action="start">Train again anyway</button>
    </section>`;
  } else {
    const restDay = next && next.offset > 0;
    hero = `<section class="hero-card">
      <p class="overline">${restDay ? `Rest day · next: ${whenLabel(next)}` : "Today's workout"}</p>
      <h2>${WORKOUTS[key].name}</h2>
      <p class="hero-meta"><span>${icon('dumbbell', 'inline')} ${lifts.length} exercises</span><span>${icon('timer', 'inline')} ~${mins} min</span></p>
      ${exerciseRows(lifts.map((l) => ({ lift: l, weight: prog[l].weight })))}
      <button class="btn ${restDay ? 'secondary' : 'primary'} lg" data-action="start">${restDay ? 'Train anyway' : `${icon('play', 'inline')} Start workout`}</button>
    </section>`;
  }

  const tip = GENERAL_SAFETY[Math.floor(Date.now() / 864e5) % GENERAL_SAFETY.length];
  const sync = syncText();
  return `${pageHeader(greet, { eyebrow })}
    ${hero}
    ${weekCard(st)}
    ${strengthStrip(prog)}
    <section class="tip-card">${icon('info')}<div><p class="overline">Coach's note</p><p>${esc(tip)}</p></div></section>
    ${sync ? `<p class="sync-note">${esc(sync)}</p>` : ''}`;
}
