#!/bin/sh
# Run from cron on malamar every few minutes. Pulls the latest image from GHCR
# (built by .github/workflows/docker.yml on push to main) and restarts onto it.
# `docker compose up -d` only recreates the container when the image changed,
# so most runs do nothing. The compose file is maintained on the box; this
# script deliberately does NOT git-pull, so malamar needs no repo access.
set -e
cd "$(dirname "$0")/.."
exec 9>/tmp/lift-auto-update.lock
flock -n 9 || exit 0

docker compose pull -q
docker compose up -d --remove-orphans 2>&1 | grep -v -E 'Running|up-to-date' || true
docker image prune -f >/dev/null
