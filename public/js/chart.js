// Small, dependency-free SVG charts. Every chart is single-series (no legend;
// the card title names it), uses one accent hue, and gets a hover/tap readout.

const fmtDate = (ms) => new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
const W = 340;

// 1, 2, 2.5 or 5 times a power of ten: axis steps people can read at a glance.
function niceStep(raw) {
  const p = 10 ** Math.floor(Math.log10(raw || 1));
  const f = raw / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

function frame(points, el) {
  const data = JSON.stringify(points).replace(/'/g, '&#39;');
  return `<div class="chart" data-points='${data}'>${el}<div class="tip" hidden></div></div>`;
}

// Working weight over time. Hollow dots mark sessions with missed reps.
export function lineChart(points, unit, { height = 180 } = {}) {
  if (points.length < 2) {
    return `<div class="chart-empty">${points.length ? `Logged once at ${points[0].weight} ${unit}.` : 'No sessions yet.'} The trend shows up after your next one.</div>`;
  }
  const H = height, L = 34, R = 8, T = 14, B = 22;
  const xs = points.map((p) => p.at);
  const ys = points.map((p) => p.weight);
  const x0 = Math.min(...xs), x1 = Math.max(...xs);
  let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y0 === y1) { y0 -= 10; y1 += 10; }
  const step = niceStep((y1 - y0) / 2);
  y0 = Math.max(0, Math.floor((y0 - step * 0.3) / step) * step);
  y1 = Math.ceil((y1 + step * 0.3) / step) * step;
  const sx = (v) => L + ((v - x0) / (x1 - x0 || 1)) * (W - L - R);
  const sy = (v) => T + (1 - (v - y0) / (y1 - y0)) * (H - T - B);
  const ticks = [];
  for (let v = y0; v <= y1 + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  const line = points.map((p, i) => `${i ? 'L' : 'M'}${sx(p.at).toFixed(1)},${sy(p.weight).toFixed(1)}`).join('');
  const area = `${line}L${sx(x1).toFixed(1)},${H - B}L${sx(x0).toFixed(1)},${H - B}Z`;
  const showDots = points.length <= 24;
  const pts = points.map((p) => [sx(p.at), sy(p.weight), `${p.weight} ${unit}`, `${fmtDate(p.at)}${p.ok ? '' : ' · missed reps'}`]);
  return frame(pts, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Working weight from ${points[0].weight} to ${points[points.length - 1].weight} ${unit}">
    <defs><linearGradient id="fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--chart)" stop-opacity=".22"/><stop offset="1" stop-color="var(--chart)" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map((t) => `<line class="grid" x1="${L}" x2="${W - R}" y1="${sy(t)}" y2="${sy(t)}"/><text class="axis" x="${L - 6}" y="${sy(t) + 3.5}" text-anchor="end">${t}</text>`).join('')}
    <text class="axis" x="${L}" y="${H - 5}">${fmtDate(x0)}</text>
    <text class="axis" x="${W - R}" y="${H - 5}" text-anchor="end">${fmtDate(x1)}</text>
    <path d="${area}" fill="url(#fade)"/>
    <path class="line" d="${line}"/>
    ${showDots ? points.map((p) => `<circle class="${p.ok ? 'dot' : 'dot miss'}" cx="${sx(p.at)}" cy="${sy(p.weight)}" r="4"/>`).join('') : ''}
    <line class="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/>
    <circle class="focus" r="5" visibility="hidden"/>
  </svg>`);
}

// Workouts per week, with the weekly goal as a dashed reference line.
export function weekBars(weeks, goal) {
  const H = 150, L = 22, R = 8, T = 12, B = 20;
  const n = weeks.length;
  const max = Math.max(goal + 1, ...weeks.map((w) => w.count));
  const slot = (W - L - R) / n;
  const bw = Math.max(4, Math.min(22, slot - 6));
  const sy = (v) => T + (1 - v / max) * (H - T - B);
  const pts = [];
  const bars = weeks.map((w, i) => {
    const cx = L + slot * i + slot / 2;
    pts.push([cx, sy(w.count), `${w.count} workout${w.count === 1 ? '' : 's'}`, `Week of ${fmtDate(w.at)}`]);
    if (!w.count) return `<rect class="bar empty" x="${cx - bw / 2}" y="${H - B - 3}" width="${bw}" height="3" rx="1.5"/>`;
    const y = sy(w.count);
    const h = H - B - y;
    // Rounded top only: path with 4px radius at the data end, square at the baseline.
    const r = Math.min(4, bw / 2, h);
    return `<path class="bar ${w.count >= goal ? 'hit' : ''}" d="M${cx - bw / 2},${H - B}V${y + r}Q${cx - bw / 2},${y} ${cx - bw / 2 + r},${y}H${cx + bw / 2 - r}Q${cx + bw / 2},${y} ${cx + bw / 2},${y + r}V${H - B}Z"/>`;
  }).join('');
  const labelEvery = Math.ceil(n / 6);
  const labels = weeks.map((w, i) => ((n - 1 - i) % labelEvery === 0)
    ? `<text class="axis" x="${L + slot * i + slot / 2}" y="${H - 5}" text-anchor="middle">${new Date(w.at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</text>` : '').join('');
  return frame(pts, `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Workouts per week against a goal of ${goal}">
    <line class="goal" x1="${L}" x2="${W - R}" y1="${sy(goal)}" y2="${sy(goal)}"/>
    <text class="axis goal-label" x="${L - 6}" y="${sy(goal) + 3.5}" text-anchor="end">${goal}</text>
    <line class="baseline" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/>
    ${bars}${labels}
    <line class="cross" x1="0" x2="0" y1="${T}" y2="${H - B}" visibility="hidden"/>
  </svg>`);
}

// Tiny trend line for stat cards. Decorative: the card shows the numbers.
export function sparkline(values, { w = 120, h = 36 } = {}) {
  if (values.length < 2) return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><line class="spark-flat" x1="2" x2="${w - 2}" y1="${h / 2}" y2="${h / 2}"/></svg>`;
  const min = Math.min(...values), max = Math.max(...values);
  const sx = (i) => 2 + (i / (values.length - 1)) * (w - 4);
  const sy = (v) => (max === min ? h / 2 : 3 + (1 - (v - min) / (max - min)) * (h - 6));
  const d = values.map((v, i) => `${i ? 'L' : 'M'}${sx(i).toFixed(1)},${sy(v).toFixed(1)}`).join('');
  const last = values.length - 1;
  return `<svg class="spark" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}"/><circle cx="${sx(last)}" cy="${sy(values[last])}" r="3"/></svg>`;
}

// One side of a loaded barbell: sleeve plus plates, sized by plate weight.
export function plateViz(plates, unit, barWeight) {
  const H = 64, mid = H / 2;
  const biggest = unit === 'kg' ? 25 : 45;
  let x = 70;
  const rects = plates.map((p) => {
    const ph = 18 + (p / biggest) * 42;
    const pw = p >= biggest * 0.4 ? 11 : 7;
    const r = `<rect class="plate-r" x="${x}" y="${mid - ph / 2}" width="${pw}" height="${ph}" rx="2"/>`;
    x += pw + 2;
    return r;
  }).join('');
  return `<svg class="plateviz" viewBox="0 0 260 ${H}" role="img" aria-label="${plates.length ? `Each side: ${plates.join(', ')} ${unit}` : `Empty ${barWeight} ${unit} bar`}">
    <rect class="bar-shaft" x="0" y="${mid - 3}" width="62" height="6" rx="2"/>
    <rect class="bar-collar" x="60" y="${mid - 9}" width="8" height="18" rx="2"/>
    <rect class="bar-sleeve" x="68" y="${mid - 5}" width="${Math.max(x - 68 + 22, 90)}" height="10" rx="3"/>
    ${rects}
  </svg>`;
}

// One handler per chart: nearest point to the pointer gets a crosshair + tip.
export function bindCharts(root) {
  root.querySelectorAll('.chart').forEach((el) => {
    const pts = JSON.parse(el.dataset.points);
    const svg = el.querySelector('svg');
    const cross = el.querySelector('.cross');
    const focus = el.querySelector('.focus');
    const tip = el.querySelector('.tip');
    const move = (ev) => {
      const box = svg.getBoundingClientRect();
      const x = ((ev.clientX - box.left) / box.width) * W;
      let best = pts[0];
      for (const p of pts) if (Math.abs(p[0] - x) < Math.abs(best[0] - x)) best = p;
      cross.setAttribute('x1', best[0]); cross.setAttribute('x2', best[0]);
      cross.setAttribute('visibility', 'visible');
      if (focus) { focus.setAttribute('cx', best[0]); focus.setAttribute('cy', best[1]); focus.setAttribute('visibility', 'visible'); }
      tip.hidden = false;
      tip.innerHTML = `<b>${best[2]}</b><span>${best[3]}</span>`;
      tip.style.left = `${Math.min(Math.max((best[0] / W) * 100, 18), 82)}%`;
    };
    const leave = () => { cross.setAttribute('visibility', 'hidden'); focus?.setAttribute('visibility', 'hidden'); tip.hidden = true; };
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerdown', move);
    svg.addEventListener('pointerleave', leave);
  });
}
