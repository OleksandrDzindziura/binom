#!/bin/sh
set -e

echo "Running database migrations..."
npx drizzle-kit migrate
echo "Migrations complete."

echo "Starting API server..."
exec node dist/src/main
