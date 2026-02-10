#!/bin/bash
set -e

# Generate JWT keys if they don't exist
php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction

# Run migrations
php bin/console doctrine:migrations:migrate --no-interaction --allow-no-migration

# Start PHP server
php -S 0.0.0.0:${PORT:-8000} -t public
