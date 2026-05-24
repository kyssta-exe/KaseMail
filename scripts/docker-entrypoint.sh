#!/bin/sh
set -e

echo "==> Running database migrations..."
if [ -d "./prisma/migrations" ] && [ "$(ls -A ./prisma/migrations 2>/dev/null)" ]; then
  ./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma 2>&1 || echo "Migration deploy failed"
else
  ./node_modules/.bin/prisma db push --accept-data-loss --schema=./prisma/schema.prisma 2>&1 || echo "Schema push failed"
fi

echo "==> Starting KaseMail..."
exec node server.js
