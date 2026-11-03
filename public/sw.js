// Bump VERSION on every deploy so clients pick up the new shell.
const VERSION = 'lift-v9';
const SHELL = [
  '/',
  '/index.html',
  '/styles.css',
  '/manifest.webmanifest',
  '/js/app.js',
  '/js/store.js',
  '/js/program.js',
  '/js/guides.js',
  '/js/motion.js',
  '/js/chart.js',
  '/js/icons.js',
  '/js/core.js',
  '/js/views/today.js',
  '/js/views/workout.js',
  '/js/views/progress.js',
  '/js/views/rewards.js',
  '/js/views/settings.js',
  '/js/views/other.js',
  '/js/views/swap.js',
  '/vendor/inter/inter-latin-wght.woff2',
  '/vendor/workout-motion/h2.js',
  '/vendor/workout-motion/review.js',
  '/vendor/workout-motion/studies/anatomy.js',
  '/vendor/workout-motion/studies/barbell-curl.js',
  '/vendor/workout-motion/studies/bench.js',
  '/vendor/workout-motion/studies/bent-over-row.js',
  '/vendor/workout-motion/studies/box-jumps.js',
  '/vendor/workout-motion/studies/cable-dip.js',
  '/vendor/workout-motion/studies/character.js',
  '/vendor/workout-motion/studies/clean.js',
  '/vendor/workout-motion/studies/contours.js',
  '/vendor/workout-motion/studies/deadlifts.js',
  '/vendor/workout-motion/studies/draw.js',
  '/vendor/workout-motion/studies/dumbbell-expansion.js',
  '/vendor/workout-motion/studies/feet.js',
  '/vendor/workout-motion/studies/front-squat.js',
  '/vendor/workout-motion/studies/grip.js',
  '/vendor/workout-motion/studies/landmine.js',
  '/vendor/workout-motion/studies/lower-expansion.js',
  '/vendor/workout-motion/studies/overhead.js',
  '/vendor/workout-motion/studies/power-clean.js',
  '/vendor/workout-motion/studies/pullup.js',
  '/vendor/workout-motion/studies/rig.js',
  '/vendor/workout-motion/studies/romanian.js',
  '/vendor/workout-motion/studies/shorts.js',
  '/vendor/workout-motion/studies/squat.js',
  '/vendor/workout-motion/studies/surface-depth.js',
  '/icons/icon.svg',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/api/')) return;
  if (e.request.mode === 'navigate') {
    // Network first for the page so updates arrive; cached shell when offline.
    e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')));
    return;
  }
  // Stale-while-revalidate for everything else (incl. lazily cached animations).
  e.respondWith(caches.open(VERSION).then(async (cache) => {
    const hit = await cache.match(e.request);
    const net = fetch(e.request).then((res) => {
      if (res.ok) cache.put(e.request, res.clone());
      return res;
    }).catch(() => hit || Response.error());
    return hit || net;
  }));
});

self.addEventListener('push', (e) => {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(Promise.all([
    self.registration.showNotification(data.title || 'Lift', {
      body: data.body || '',
      tag: data.tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data: { url: data.url || '/' },
    }),
    data.tag === 'train' && self.navigator.setAppBadge ? self.navigator.setAppBadge(1).catch(() => {}) : null,
  ]));
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const target = e.notification.data?.url || '/';
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((wins) => {
    for (const w of wins) {
      if ('focus' in w) { w.navigate(target).catch(() => {}); return w.focus(); }
    }
    return self.clients.openWindow(target);
  }));
});
