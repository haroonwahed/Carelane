#!/usr/bin/env bash
# Start Django dev server with local overrides on top of .env
set -a
[ -f .env ] && source .env
[ -f .env.local ] && source .env.local
set +a

trap "kill 0" EXIT

.venv/bin/python manage.py runserver 8000 &
cd client && npm run dev &
wait
