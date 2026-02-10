#!/bin/sh
set -e

# Force production environment
export APP_ENV=prod
export APP_DEBUG=0

echo "=== HeatCheck Backend Starting ==="
echo "PORT variable: ${PORT}"
PORT="${PORT:-8000}"
echo "Using port: ${PORT}"

# Run migrations if DATABASE_URL is set
if [ -n "$DATABASE_URL" ]; then
    echo "Running migrations..."
    php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true
fi

echo "Starting PHP built-in server on 0.0.0.0:${PORT}"
exec php -S "0.0.0.0:${PORT}" -t public