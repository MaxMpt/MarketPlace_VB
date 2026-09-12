#!/bin/sh
set -eu
cd /workspace
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/; then
  exit 0
fi
export PATH="/workspace/.venv/bin:$PATH"
export DJANGO_SETTINGS_MODULE=config.settings
python manage.py migrate --noinput >>/tmp/app-startup.log 2>&1
python manage.py seed >>/tmp/app-startup.log 2>&1 || true
python manage.py runserver 0.0.0.0:8080 >>/tmp/app-startup.log 2>&1 &
