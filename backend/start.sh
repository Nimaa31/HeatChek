#!/bin/sh
echo "Starting PHP server on port ${PORT:-8000}"
exec php -S 0.0.0.0:${PORT:-8000} -t public
