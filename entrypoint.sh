#!/bin/sh
set -eu
mkdir -p /app/data /app/media /app/staticfiles
python manage.py migrate --noinput
python manage.py seed
python manage.py refresh_highlight || true
python manage.py collectstatic --noinput
if [ "${1:-web}" = "bot" ]; then
  exec python manage.py runbot
fi
python manage.py setwebhook || true
exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 1 --threads 4 --timeout 60