#!/bin/sh
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Applying Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Generating SvelteKit types..."
./node_modules/.bin/svelte-kit sync
# Allow the host user to run svelte-kit sync locally (Docker writes as root)
chmod -R a+rw .svelte-kit 2>/dev/null || true

echo "Starting SvelteKit dev server..."
exec ./node_modules/.bin/vite dev --host 0.0.0.0
