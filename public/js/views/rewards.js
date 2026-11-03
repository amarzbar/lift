import { EXERCISES, WORKOUTS, progression, stats, badges, titleFor, dayKey, weekKey, convert } from '../program.js';
import {
  state, ui, icon, esc, fmt, unit, compact, weightLabel, duration, pageHeader, sectionHead, progressBar, ring,
} from '../core.js';

const BADGE_ICON = { workouts: 'dumbbell', streak: 'flame', pr: 'trophy', strength: 'award' };

function streakCopy(st) {
  const left = st.goal - st.thisWeekCount;
  if (!st.streak && !st.total) return 'Hit your weekly goal to start a streak.';
  if (!st.streak) return left > 0 ? `${left} more this week starts a new streak.` : 'Streak starts now. Keep it going next week.';
  if (left <= 0) return 'This week is locked in.';
  return `${left} more this week keeps it alive.`;
}

export function viewRewards() {
  const st = stats(state.sessions, state.settings);
  const bs = badges(st, state.settings);
  const { level } = st;
  const earned = bs.filter((b) => b.earned);
  // The closest unearned badge, by fraction complete.
  const nextBadge = bs.filter((b) => !b.earned).sort((a, b) => b.cur / b.target - a.cur / a.target)[0];

  const thisWeek = weekKey(dayKey(Date.now()));
  const weeks = [];
  for (let i = 15; i >= 0; i--) {
    const d = new Date(`${thisWeek}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i * 7);
    const k = d.toISOString().slice(0, 10);
    const n = st.perWeek.get(k) || 0;
    weeks.push(`<i class="wk ${n >= st.goal ? 'hit' : n > 0 ? 'some' : ''} ${i === 0 ? 'now' : ''}" title="Week of ${k}: ${n} workout${n === 1 ? '' : 's'}"></i>`);
  }

  return `${pageHeader('Rewards')}
    <section class="streak-hero ${st.streak ? '' : 'cold'}">
      <div class="streak-flame">${icon('flame')}</div>
      <div class="streak-num"><b>${st.streak}</b><span>week streak</span></div>
      <p class="streak-copy">${streakCopy(st)}</p>
      <div class="streak-week">
        ${ring(st.thisWeekCount / st.goal, `<b>${st.thisWeekCount}/${st.goal}</b>`, 52, 5)}
        <div class="ring-text"><small>This week</small><b>${st.bestStreak ? `Best streak: ${st.bestStreak} week${st.bestStreak === 1 ? '' : 's'}` : 'No streak yet'}</b></div>
      </div>
    </section>

    ${nextBadge ? `<section class="card next-goal">
      <div class="badge-medal locked">${icon(BADGE_ICON[nextBadge.kind])}</div>
      <div class="next-goal-body"><p class="overline">Next badge</p><b>${esc(nextBadge.name)}</b>
        ${progressBar(nextBadge.cur / nextBadge.target)}
        <small>${fmt(nextBadge.cur)} of ${fmt(nextBadge.target)} · ${esc(nextBadge.desc)}</small></div>
    </section>` : ''}

    <section class="card level-card">
      <div class="level-top">
        <div class="level-badge">${level.n}</div>
        <div><p class="overline">Level ${level.n}</p><b>${titleFor(level.n)}</b></div>
      </div>
      ${progressBar(level.into / level.span, 'xp')}
      <div class="level-foot"><small>${fmt(st.xp)} XP</small><small>${fmt(level.span - level.into)} to level ${level.n + 1}</small></div>
      <details class="explain"><summary>How XP works</summary>
        <p>Every workout earns 100 XP, plus 10 per completed set, 50 per personal record, and 25 for each week of your current streak.</p></details>
    </section>

    <section class="card">
      <div class="card-head"><div><h3>Last 16 weeks</h3><p class="card-sub">Each square is a week</p></div></div>
      <div class="weeks">${weeks.join('')}</div>
      <div class="legend"><span><i class="wk hit"></i>Goal hit</span><span><i class="wk some"></i>Trained</span><span><i class="wk"></i>Missed</span></div>
    </section>

    ${sectionHead(`Badges <span class="count">${earned.length}/${bs.length}</span>`)}
    <div class="badge-grid">${bs.map((b) => `<div class="badge ${b.earned ? 'earned' : ''}">
      <div class="badge-medal ${b.earned ? '' : 'locked'}">${icon(b.earned ? BADGE_ICON[b.kind] : 'lock')}</div>
      <b>${esc(b.name)}</b>
      ${b.earned ? `<small>${esc(b.desc)}</small>` : `${progressBar(b.cur / b.target, 'thin')}<small>${fmt(b.cur)}/${fmt(b.target)}</small>`}
    </div>`).join('')}</div>`;
}

export function viewDone(id) {
  const s = state.sessions.find((x) => x.id === id);
  if (!s) { location.hash = '#/today'; return ''; }
  const r = ui.result || {};
  const st = stats(state.sessions, state.settings);
  const prog = progression(state.sessions, state.settings);
  const w = (e) => convert(e.weight, s.unit || unit(), unit());
  const vol = s.exercises.reduce((a, e) => a + (e.skipped ? 0 : w(e) * (EXERCISES[e.lift]?.load || 1) * e.sets.reduce((b, x) => b + (x.reps || 0), 0)), 0);
  const sets = s.exercises.reduce((a, e) => a + (e.skipped ? 0 : e.sets.filter((x) => x.reps).length), 0);

  return `<div class="done-screen">
    <canvas id="confetti" aria-hidden="true"></canvas>
    <div class="done-hero">
      <div class="trophy">${icon('trophy')}</div>
      <p class="overline">${WORKOUTS[s.workout].name} complete</p>
      <h1>${(r.prs || []).length ? 'Stronger than last time.' : 'Workout done.'}</h1>
      ${r.xp ? `<span class="xp-chip">+${r.xp} XP</span>` : ''}
    </div>

    <section class="stat-grid">
      <div class="stat"><small>Time</small><b>${duration(s.finishedAt - s.startedAt)}</b></div>
      <div class="stat"><small>Volume</small><b>${compact(vol)}</b><span>${unit()}</span></div>
      <div class="stat"><small>Sets</small><b>${sets}</b></div>
    </section>

    ${(r.prs || []).length ? `<section class="card pr-card"><div class="pr-icon">${icon('award')}</div>
      <div class="pr-body"><p class="overline">${r.prs.length > 1 ? `${r.prs.length} personal records` : 'Personal record'}</p>
      ${r.prs.map((p) => `<p class="pr-line"><span>${EXERCISES[p].name}</span><b>${esc(weightLabel(p, w(s.exercises.find((e) => e.lift === p))))}</b></p>`).join('')}</div></section>` : ''}

    <section class="card done-streak">
      ${ring(st.thisWeekCount / st.goal, `<b>${st.thisWeekCount}/${st.goal}</b>`, 56, 6)}
      <div class="ring-text"><b>${r.weekHit ? 'Week goal hit' : st.thisWeekCount >= st.goal ? 'Week already locked in' : `${st.goal - st.thisWeekCount} more this week`}</b>
        <small>${st.streak ? `${icon('flame', 'inline accent')} ${st.streak}-week streak` : 'Hit the weekly goal to start a streak'}</small></div>
    </section>

    ${r.levelUp ? `<section class="card levelup"><div class="level-badge">${st.level.n}</div><div><p class="overline">Level up</p><b>${titleFor(st.level.n)}</b></div></section>` : ''}

    ${(r.newBadges || []).length ? `<section class="card"><p class="overline">Badges unlocked</p><div class="badge-row">${r.newBadges.map((b) => `<div class="badge earned pop"><div class="badge-medal">${icon(BADGE_ICON[b.kind])}</div><b>${esc(b.name)}</b></div>`).join('')}</div></section>` : ''}

    ${sectionHead('Next time')}
    <section class="card list-card"><ul class="next-list">
      ${s.exercises.filter((e) => !e.skipped).map((e) => {
        const next = prog[e.lift].weight;
        const diff = next - w(e);
        return `<li><span>${EXERCISES[e.lift].name}</span><span class="next-val ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}">${esc(weightLabel(e.lift, next))}${diff ? `<em>${diff > 0 ? '+' : ''}${fmt(diff)}</em>` : '<em>same</em>'}</span></li>`;
      }).join('')}
    </ul></section>
    <a class="btn primary lg" href="#/today">Done</a>
  </div>`;
}
