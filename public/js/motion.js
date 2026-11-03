// Exercise animations from workout-motion (PolyForm Noncommercial 1.0.0,
// https://github.com/februarysea/workout-motion), served from /vendor so they
// work offline.
import { icon } from './icons.js';

let lib;
const load = () => (lib ??= import('/vendor/workout-motion/h2.js').catch(() => null));

const players = new Set();

function noAnimation(host, small) {
  host.classList.add('motion-missing');
  host.innerHTML = small ? icon('dumbbell') : `<div class="motion-none">${icon('dumbbell')}<p>No animation for this one yet.<br>The guide walks you through it step by step.</p></div>`;
}

export async function mountMotion(host, motionId, title) {
  if (!motionId || motionId === 'null') return noAnimation(host, false);
  const m = await load();
  if (!host.isConnected) return;
  if (!m) {
    host.classList.add('motion-missing');
    host.innerHTML = `<p class="small muted">Animation unavailable</p>`;
    return;
  }
  const stage = document.createElement('div');
  stage.className = 'motion-stage';
  const btn = document.createElement('button');
  btn.className = 'motion-toggle';
  host.replaceChildren(stage, btn);
  const sync = () => {
    btn.innerHTML = icon(player.playing ? 'pause' : 'play');
    btn.setAttribute('aria-label', player.playing ? `Pause ${title} animation` : `Play ${title} animation`);
  };
  const player = m.createPlayer(stage, motionId, { autoplay: true, title, onStateChange: () => sync() });
  players.add(player);
  sync();
  const toggle = () => { player.playing ? player.pause() : player.play(); sync(); };
  btn.addEventListener('click', toggle);
  stage.addEventListener('click', toggle);
}

// Static mid-rep frame, for list thumbnails (no animation loop).
export async function mountStill(host, motionId, phase = 0.5) {
  if (!motionId || motionId === 'null') return noAnimation(host, true);
  const m = await load();
  if (!m || !host.isConnected) return;
  host.innerHTML = m.renderSvg(motionId, { phase });
}

export function destroyMotions() {
  for (const p of players) p.destroy();
  players.clear();
}
