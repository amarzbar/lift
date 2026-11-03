# Lift

No-nonsense strength training PWA: A/B full-body plan with automatic progression,
exercise guides with animations, streaks/XP/badges, offline-first logging that syncs
to this server, and push reminders.

- Run: `docker compose up -d --build` (listens on 127.0.0.1:3017)
- HTTPS on the tailnet: `sudo tailscale serve --bg --https=4443 http://127.0.0.1:3017`
  → https://malamar.chimera-alioth.ts.net:4443
- Data: `./data/lift.db` (SQLite). Back this up.
- Auth: `AUTH_MODE=single` signs everyone in as the default user. Switch to `multi`
  and set `DEFAULT_PASSWORD` to require a login.
- Deploying a front-end change: bump `VERSION` in `public/sw.js`.

## Vendored assets (served locally, work offline)
- `public/vendor/workout-motion/` — prebuilt animation modules from
  [workout-motion](https://github.com/februarysea/workout-motion), PolyForm Noncommercial
  1.0.0 (personal use only; LICENSE + NOTICE alongside).
- `public/js/icons.js` — [Lucide](https://lucide.dev) icons (ISC, `public/vendor/lucide/LICENSE`).
