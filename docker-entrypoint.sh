#!/bin/sh
set -e

# Run Prisma migrations
echo "Running database migrations..."
node node_modules/prisma/build/index.js migrate deploy

# Seed initial data if DB is empty (boards + statuses)
echo "Checking seed..."
node node_modules/prisma/build/index.js db seed --schema=./prisma/schema.prisma 2>/dev/null || true

# Start the app
echo "Starting FollowFeat..."
exec node server.js
