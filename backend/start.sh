#!/bin/sh
set -e

# Generate JWT keys if they don't exist
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction || true

# Run migrations
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration || true

# Start PHP server with PORT from Railway
exec php -S 0.0.0.0:${PORT:-8000} -t public
