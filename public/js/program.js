// The training plan and everything derived from workout history.
// Pure functions only: this module is shared by the browser and the server
// (the server imports it to word reminder notifications).

export const UNITS = {
  // db: the usual jump between dumbbells on a gym rack.
  kg: { bar: 20, plates: [25, 20, 15, 10, 5, 2.5, 1.25], small: 2.5, big: 5, db: 2, dlStart: 40 },
  lb: { bar: 45, plates: [45, 35, 25, 10, 5, 2.5], small: 5, big: 10, db: 5, dlStart: 95 },
};

// kind: 'barbell' = straight sets, linear progression, warm-ups.
//       'accessory' = double progression inside a rep range; weight may be 0
//       for bodyweight moves (it means "added weight").
// equipment drives plate math (barbell only) and how weight is labelled.
// load: how many of that weight you move (2 = a dumbbell in each hand), for volume.
// motion: workout-motion animation id, or null when the library has none.
export const EXERCISES = {
  squat: {
    name: 'Back Squat', motion: 'squat', kind: 'barbell', equipment: 'barbell', sets: 3, reps: 5, inc: 'small', rest: 180,
    tagline: 'The classic. Biggest strength builder in the plan.',
  },
  bench: {
    name: 'Bench Press', motion: 'bench-press', kind: 'barbell', equipment: 'barbell', sets: 3, reps: 5, inc: 'small', rest: 180,
    tagline: 'Barbell on a flat bench. Always set the safety arms.',
  },
  row: {
    name: 'Barbell Row', motion: 'bent-over-row', kind: 'barbell', equipment: 'barbell', sets: 3, reps: 5, inc: 'small', rest: 120,
    tagline: 'Bent over, unsupported. Demands a strong, braced lower back.',
  },
  ohp: {
    name: 'Overhead Press', motion: 'overhead-press', kind: 'barbell', equipment: 'barbell', sets: 3, reps: 5, inc: 'small', rest: 180,
    tagline: 'Standing barbell press. Whole-body tension.',
  },
  deadlift: {
    name: 'Deadlift', motion: 'conventional-deadlift', kind: 'barbell', equipment: 'barbell', sets: 1, reps: 5, inc: 'big', rest: 180,
    tagline: 'Barbell from the floor. The heaviest lift in the plan.',
  },
  pullup: {
    name: 'Pull-up', motion: 'pull-up', kind: 'accessory', equipment: 'bodyweight', sets: 3, repsMin: 5, repsMax: 10, inc: 'small', rest: 120, bodyweight: true,
    tagline: 'Bodyweight. Add weight once 3 × 10 feels easy.',
  },
  dip: {
    name: 'Dip', motion: 'dip', kind: 'accessory', equipment: 'bodyweight', sets: 3, repsMin: 6, repsMax: 12, inc: 'small', rest: 90, bodyweight: true,
    tagline: 'Bodyweight on parallel bars. Hard on stiff shoulders.',
  },

  // ---- gentler alternatives ----
  goblet: {
    name: 'Goblet Squat', motion: null, kind: 'accessory', equipment: 'dumbbell', sets: 3, repsMin: 8, repsMax: 12, inc: 'db', rest: 90, easy: true,
    tagline: 'One dumbbell held at your chest. Easy to learn, light on the back.',
  },
  lunge: {
    name: 'Reverse Lunge', motion: 'reverse-lunge', kind: 'accessory', equipment: 'dumbbell', sets: 3, repsMin: 8, repsMax: 12, inc: 'db', rest: 90, load: 2, easy: true, perSide: true,
    tagline: 'One leg at a time with light dumbbells. Kind to knees and back.',
  },
  dbincline: {
    name: 'Incline Dumbbell Press', motion: 'incline-dumbbell-press', kind: 'accessory', equipment: 'dumbbell', sets: 3, repsMin: 8, repsMax: 12, inc: 'db', rest: 90, load: 2, easy: true,
    tagline: 'Dumbbells on a low incline. Shoulder-friendly, no spotter needed.',
  },
  cablerow: {
    name: 'Seated Cable Row', motion: 'seated-cable-row', kind: 'accessory', equipment: 'cable', sets: 3, repsMin: 8, repsMax: 12, inc: 'small', rest: 90, easy: true,
    tagline: 'Seated with feet braced. Same back muscles, no lower-back strain.',
  },
  dbrow: {
    name: 'One-arm Dumbbell Row', motion: 'single-arm-dumbbell-row', kind: 'accessory', equipment: 'dumbbell', sets: 3, repsMin: 8, repsMax: 12, inc: 'db', rest: 60, easy: true, perSide: true,
    tagline: 'Braced on a bench, so your back is supported.',
  },
  dbpress: {
    name: 'Dumbbell Shoulder Press', motion: 'dumbbell-shoulder-press', kind: 'accessory', equipment: 'dumbbell', sets: 3, repsMin: 8, repsMax: 12, inc: 'db', rest: 90, load: 2, easy: true,
    tagline: 'Seated with back support. Lighter and easier on the shoulders.',
  },
  rdl: {
    name: 'Romanian Deadlift', motion: 'romanian-deadlift', kind: 'accessory', equipment: 'barbell', sets: 3, repsMin: 8, repsMax: 10, inc: 'small', rest: 120, easy: true,
    tagline: 'Starts standing, lighter loads. Teaches the hip hinge safely.',
  },
  hipthrust: {
    name: 'Hip Thrust', motion: 'hip-thrust', kind: 'accessory', equipment: 'barbell', sets: 3, repsMin: 8, repsMax: 12, inc: 'small', rest: 90, easy: true,
    tagline: 'Back on a bench, almost no load on the spine. Big glute work.',
  },
  pulldown: {
    name: 'Lat Pulldown', motion: 'lat-pulldown', kind: 'accessory', equipment: 'cable', sets: 3, repsMin: 8, repsMax: 12, inc: 'small', rest: 90, easy: true,
    tagline: 'The machine version of a pull-up. Pick any weight.',
  },
  pushdown: {
    name: 'Triceps Pushdown', motion: 'triceps-pushdown', kind: 'accessory', equipment: 'cable', sets: 3, repsMin: 10, repsMax: 15, inc: 'small', rest: 60, easy: true,
    tagline: 'Cable triceps work. Gentle on the shoulders.',
  },
};

// Each slot in the plan and the gentler variations that can fill it.
export const ALTERNATIVES = {
  squat: ['goblet', 'lunge'],
  bench: ['dbincline'],
  row: ['cablerow', 'dbrow'],
  ohp: ['dbpress'],
  deadlift: ['rdl', 'hipthrust'],
  pullup: ['pulldown'],
  dip: ['pushdown'],
};
export const SLOT_OF = Object.fromEntries(Object.entries(ALTERNATIVES).flatMap(([slot, alts]) => [[slot, slot], ...alts.map((a) => [a, slot])]));
export const optionsFor = (slot) => [slot, ...(ALTERNATIVES[slot] || [])];

// First-time weight for an alternative, as a fraction of the slot's main lift.
// Deliberately conservative: it's a starting point, the plan climbs from there.
const START_RATIO = {
  goblet: 0.3, lunge: 0.15, dbincline: 0.3, cablerow: 0.8, dbrow: 0.35, dbpress: 0.3, rdl: 0.6, hipthrust: 0.7,
};

export const EQUIPMENT_LABEL = { barbell: 'Barbell', dumbbell: 'Dumbbells', cable: 'Cable machine', bodyweight: 'Bodyweight' };

export const WORKOUTS = {
  A: { name: 'Workout A', lifts: ['squat', 'bench', 'row', 'dip'] },
  B: { name: 'Workout B', lifts: ['squat', 'ohp', 'deadlift', 'pullup'] },
};

export const DEFAULT_SETTINGS = {
  unit: 'lb',
  onboarded: false,
  weeklyGoal: 3,
  trainingDays: [1, 3, 5], // 0 = Sunday
  swaps: {}, // slot -> chosen alternative id
  start: {},
  reminders: { enabled: false, time: '17:30', streakSave: true, tz: null },
};

export function withDefaults(settings) {
  const s = { ...DEFAULT_SETTINGS, ...(settings || {}) };
  // Older versions stored { pullup: true }; map those to the matching alternative.
  const legacy = { pullup: 'pulldown', dip: 'pushdown' };
  s.swaps = {};
  for (const [slot, v] of Object.entries(settings?.swaps || {})) {
    const pick = v === true ? legacy[slot] : v;
    if (typeof pick === 'string' && ALTERNATIVES[slot]?.includes(pick)) s.swaps[slot] = pick;
  }
  s.reminders = { ...DEFAULT_SETTINGS.reminders, ...(settings?.reminders || {}) };
  s.start = { ...(settings?.start || {}) };
  s.overrides = { ...(settings?.overrides || {}) };
  return s;
}

export function defaultStart(lift, unit) {
  const u = UNITS[unit];
  const ex = EXERCISES[lift];
  if (ex.kind === 'barbell') return lift === 'deadlift' ? u.dlStart : u.bar;
  if (ex.bodyweight) return 0;
  if (ex.equipment === 'barbell') return u.bar;
  if (ex.equipment === 'dumbbell') return unit === 'kg' ? 8 : 20;
  return unit === 'kg' ? 20 : 40;
}

export const incFor = (lift, unit) => UNITS[unit][EXERCISES[lift].inc];

// The lightest sensible load, so a suggestion never rounds down to nothing.
function lightest(lift, unit) {
  const eq = EXERCISES[lift].equipment;
  if (eq === 'barbell') return UNITS[unit].bar;
  if (eq === 'dumbbell') return unit === 'kg' ? 4 : 10;
  return unit === 'kg' ? 10 : 20;
}

export const chosenFor = (slot, settings) => settings.swaps?.[slot] || slot;

export function liftsFor(workoutKey, settings) {
  return WORKOUTS[workoutKey].lifts.map((slot) => chosenFor(slot, settings));
}

export function convert(weight, from, to) {
  if (from === to) return weight;
  const factor = from === 'kg' ? 2.20462 : 1 / 2.20462;
  return roundTo(weight * factor, UNITS[to].small / 2);
}

export const roundTo = (v, step) => Math.round(v / step) * step;

const finished = (sessions) => sessions
  .filter((s) => s.status === 'done' && !s.deleted)
  .sort((a, b) => a.finishedAt - b.finishedAt);

function setsSucceeded(entry, ex) {
  const work = entry.sets || [];
  if (work.length < ex.sets) return false;
  const target = ex.kind === 'barbell' ? ex.reps : ex.repsMax;
  return work.every((s) => (s.reps ?? 0) >= target);
}

// Replay history to get what to lift next. Barbell lifts: add weight after a
// clean session, repeat after a miss, deload 10% after three straight misses.
// Accessories: add weight once every set hits the top of the rep range.
export function progression(sessions, settings) {
  const unit = settings.unit;
  const u = UNITS[unit];
  const state = {};
  for (const lift of Object.keys(EXERCISES)) {
    const start = settings.start[lift];
    state[lift] = { weight: start ?? defaultStart(lift, unit), fails: 0, history: [], best: null };
  }
  for (const s of finished(sessions)) {
    for (const entry of s.exercises || []) {
      const ex = EXERCISES[entry.lift];
      const st = state[entry.lift];
      if (!ex || !st || entry.skipped) continue;
      const w = convert(entry.weight, s.unit || unit, unit);
      const ok = setsSucceeded(entry, ex);
      const inc = incFor(entry.lift, unit);
      const bestReps = Math.max(0, ...(entry.sets || []).map((x) => x.reps ?? 0));
      st.history.push({ at: s.finishedAt, weight: w, ok, reps: bestReps, sets: (entry.sets || []).map((x) => x.reps ?? 0), sessionId: s.id });
      if (ok && (st.best === null || w > st.best)) st.best = w;
      if (ok) {
        st.weight = w + inc;
        st.fails = 0;
      } else if (ex.kind === 'barbell') {
        st.fails += 1;
        if (st.fails >= 3) {
          st.weight = Math.max(ex.bodyweight ? 0 : u.bar, roundTo(w * 0.9, inc));
          st.fails = 0;
        } else st.weight = w;
      } else st.weight = w;
    }
  }
  // A manual "next weight" from settings wins until the lift is logged again.
  for (const [lift, o] of Object.entries(settings.overrides || {})) {
    const st = state[lift];
    if (!st || !o) continue;
    const lastAt = st.history.length ? st.history[st.history.length - 1].at : 0;
    if (o.at > lastAt) { st.weight = convert(o.weight, o.unit || unit, unit); st.fails = 0; st.manual = true; }
  }
  // Never-logged alternatives start from a fraction of their slot's main lift,
  // but only when that lift has actually been done; an untested starting
  // weight is a guess, so fall back to a light default instead.
  for (const [lift, ratio] of Object.entries(START_RATIO)) {
    const st = state[lift];
    if (st.history.length || st.manual || settings.start[lift] !== undefined) continue;
    const main = state[SLOT_OF[lift]];
    const inc = incFor(lift, unit);
    st.weight = main.history.length
      ? Math.max(lightest(lift, unit), roundTo(main.history[main.history.length - 1].weight * ratio, inc))
      : defaultStart(lift, unit);
    st.suggested = true;
    st.suggestedFrom = main.history.length ? SLOT_OF[lift] : null;
  }
  for (const lift of ['pulldown', 'pushdown']) if (!state[lift].history.length && !state[lift].manual) state[lift].suggested = true;
  return state;
}

export function nextWorkoutKey(sessions) {
  const done = finished(sessions);
  const last = done[done.length - 1];
  return last?.workout === 'A' ? 'B' : 'A';
}

export function buildSession(workoutKey, sessions, settings, id) {
  const prog = progression(sessions, settings);
  return {
    id,
    status: 'active',
    workout: workoutKey,
    unit: settings.unit,
    startedAt: Date.now(),
    finishedAt: null,
    exercises: WORKOUTS[workoutKey].lifts.map((slot) => {
      const lift = chosenFor(slot, settings);
      const ex = EXERCISES[lift];
      return {
        slot,
        lift,
        weight: prog[lift].weight,
        target: ex.kind === 'barbell' ? ex.reps : ex.repsMax,
        // reps: null = not attempted yet
        sets: Array.from({ length: ex.sets }, () => ({ reps: null })),
        fails: prog[lift].fails,
      };
    }),
  };
}

// Warm-up ramp for barbell lifts; skipped when the work weight is the empty bar.
export function warmups(lift, weight, unit) {
  const u = UNITS[unit];
  const ex = EXERCISES[lift];
  if (ex.kind !== 'barbell' || weight <= u.bar) return [];
  const steps = lift === 'deadlift'
    ? [[0.4, 5], [0.6, 3], [0.85, 2]]
    : [[0, 5], [0, 5], [0.55, 5], [0.7, 3], [0.85, 2]];
  const out = [];
  for (const [pct, reps] of steps) {
    const w = pct === 0 ? u.bar : Math.max(u.bar, roundTo(weight * pct, u.small));
    if (w >= weight) continue;
    const prev = out[out.length - 1];
    if (prev && prev.weight === w && pct !== 0) continue;
    out.push({ weight: w, reps });
  }
  return out;
}

// Plates for ONE side of the bar, greedy from heaviest.
export function platesPerSide(weight, unit) {
  const u = UNITS[unit];
  let side = (weight - u.bar) / 2;
  if (side <= 0) return [];
  const out = [];
  for (const p of u.plates) {
    while (side >= p - 1e-9) { out.push(p); side -= p; }
  }
  return out;
}

// ---------- calendar helpers (local time) ----------

export function dayKey(ms, tz) {
  const d = new Date(ms);
  if (!tz) return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

// Monday-based week key: the dayKey of that week's Monday.
export function weekKey(day) {
  const d = new Date(`${day}T12:00:00Z`);
  const dow = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - dow);
  return d.toISOString().slice(0, 10);
}

function prevWeek(wk) {
  const d = new Date(`${wk}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 7);
  return d.toISOString().slice(0, 10);
}

// ---------- streaks, stats, rewards ----------

export function stats(sessions, settings, now = Date.now(), tz = null) {
  const done = finished(sessions);
  const goal = settings.weeklyGoal || 3;
  const perWeek = new Map();
  const days = new Set();
  for (const s of done) {
    const day = dayKey(s.finishedAt, tz);
    if (days.has(day)) continue; // two sessions in one day count once
    days.add(day);
    const wk = weekKey(day);
    perWeek.set(wk, (perWeek.get(wk) || 0) + 1);
  }
  const today = dayKey(now, tz);
  const thisWeek = weekKey(today);
  const thisWeekCount = perWeek.get(thisWeek) || 0;

  // Week streak: consecutive weeks that hit the goal. The current week only
  // breaks the streak once it is over, so it is "at risk" rather than lost.
  let streak = 0;
  let wk = thisWeekCount >= goal ? thisWeek : prevWeek(thisWeek);
  while ((perWeek.get(wk) || 0) >= goal) { streak += 1; wk = prevWeek(wk); }

  let best = 0;
  let run = 0;
  const weeks = [...perWeek.keys()].sort();
  if (weeks.length) {
    for (let w = weeks[0]; w <= thisWeek; ) {
      run = (perWeek.get(w) || 0) >= goal ? run + 1 : 0;
      best = Math.max(best, run);
      const d = new Date(`${w}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 7); w = d.toISOString().slice(0, 10);
    }
  }

  // Volume, PRs and XP, replayed in order.
  let volume = 0;
  let xp = 0;
  let prs = 0;
  const bests = {};
  const prSessions = new Map();
  for (const s of done) {
    let sessionPrs = 0;
    for (const e of s.exercises || []) {
      if (e.skipped) continue;
      const w = convert(e.weight, s.unit || settings.unit, settings.unit);
      const reps = (e.sets || []).reduce((a, x) => a + (x.reps || 0), 0);
      volume += w * reps * (EXERCISES[e.lift]?.load || 1);
      const ex = EXERCISES[e.lift];
      if (ex && setsSucceeded(e, ex) && w > 0 && (bests[e.lift] === undefined || w > bests[e.lift])) {
        if (bests[e.lift] !== undefined) sessionPrs += 1;
        bests[e.lift] = w;
      }
      xp += (e.sets || []).filter((x) => (x.reps || 0) > 0).length * 10;
    }
    prs += sessionPrs;
    prSessions.set(s.id, sessionPrs);
    xp += 100 + sessionPrs * 50;
  }
  xp += streak * 25;

  const level = levelFor(xp);
  return {
    total: days.size,
    thisWeekCount,
    goal,
    streak,
    bestStreak: Math.max(best, streak),
    trainedToday: days.has(today),
    volume,
    prs,
    prSessions,
    bests,
    xp,
    level,
    perWeek,
  };
}

// Level n needs 250 * n * (n + 1) / 2 XP: ~2 workouts for level 2, slower after.
export function levelFor(xp) {
  let n = 1;
  while (250 * n * (n + 1) / 2 <= xp) n += 1;
  const floor = 250 * (n - 1) * n / 2;
  const ceil = 250 * n * (n + 1) / 2;
  return { n, into: xp - floor, span: ceil - floor };
}

export const TITLES = ['Rookie', 'Regular', 'Grinder', 'Iron Regular', 'Plate Collector', 'Barbell Veteran', 'Strong', 'Very Strong', 'Unreasonably Strong', 'Legend'];
export const titleFor = (n) => TITLES[Math.min(TITLES.length - 1, Math.floor((n - 1) / 2))];

// Epley estimate of a one-rep max from a set of `reps` at `weight`.
export const e1rm = (weight, reps) => (reps > 0 ? weight * (1 + reps / 30) : 0);

// Rough session length: every work set plus its rest, warm-ups at ~1 min each.
export function estimateMinutes(lifts, weights, unit) {
  let sec = 0;
  for (const l of lifts) {
    const ex = EXERCISES[l];
    sec += ex.sets * (ex.rest + 45) + warmups(l, weights[l] ?? 0, unit).length * 60;
  }
  return Math.max(15, Math.round(sec / 60 / 5) * 5);
}

export function badges(st, settings) {
  const u = settings.unit;
  const big = u === 'kg' ? [60, 100, 140] : [135, 225, 315];
  const b = st.bests;
  // [id, name, description, kind, current, target]
  const list = [
    ['first', 'First Rep', 'Finish your first workout', 'workouts', st.total, 1],
    ['w5', 'Showing Up', '5 workouts', 'workouts', st.total, 5],
    ['w10', 'Habit Forming', '10 workouts', 'workouts', st.total, 10],
    ['w25', 'Committed', '25 workouts', 'workouts', st.total, 25],
    ['w50', 'Half Century', '50 workouts', 'workouts', st.total, 50],
    ['w100', 'Centurion', '100 workouts', 'workouts', st.total, 100],
    ['s2', 'Two in a Row', '2-week streak', 'streak', st.bestStreak, 2],
    ['s4', 'A Full Month', '4-week streak', 'streak', st.bestStreak, 4],
    ['s12', 'Quarter Year', '12-week streak', 'streak', st.bestStreak, 12],
    ['s26', 'Half Year', '26-week streak', 'streak', st.bestStreak, 26],
    ['pr1', 'New Territory', 'Your first PR', 'pr', st.prs, 1],
    ['pr25', 'PR Machine', '25 PRs', 'pr', st.prs, 25],
    ['bench1', `${big[0]} Bench`, `Bench ${big[0]} ${u}`, 'strength', b.bench || 0, big[0]],
    ['squat1', `${big[1]} Squat`, `Squat ${big[1]} ${u}`, 'strength', b.squat || 0, big[1]],
    ['dl1', `${big[2]} Deadlift`, `Deadlift ${big[2]} ${u}`, 'strength', b.deadlift || 0, big[2]],
  ];
  return list.map(([id, name, desc, kind, cur, target]) => ({
    id, name, desc, kind, cur: Math.min(cur, target), target, earned: cur >= target,
  }));
}
