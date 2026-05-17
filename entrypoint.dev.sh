#!/bin/sh
set -e

echo "Installing dependencies..."
pnpm install --frozen-lockfile

echo "Applying Prisma migrations..."
./node_modules/.bin/prisma migrate deploy

echo "Starting SvelteKit dev server..."
exec ./node_modules/.bin/vite dev --host 0.0.0.0
