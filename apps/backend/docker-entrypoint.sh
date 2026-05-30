#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Seeding reference data..."
npx prisma db seed

echo "Starting backend..."
exec node dist/server.js
