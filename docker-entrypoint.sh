#!/bin/sh
set -e

# Run Prisma migrations
echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

# Seed initial data if DB is empty (boards, statuses, changelog categories)
echo "Seeding database..."
node prisma/seed.js || true

# Start the app
echo "Starting FollowFeat..."
exec node server.js
