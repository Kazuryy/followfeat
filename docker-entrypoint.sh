#!/bin/sh
set -e

# Run database migrations (custom runner, no @prisma/engines needed)
echo "Running database migrations..."
node scripts/migrate.mjs

# Seed initial data if DB is empty (boards, statuses, changelog categories)
echo "Seeding database..."
node prisma/seed.js || true

# Start the app
echo "Starting FollowFeat..."
exec node server.js
