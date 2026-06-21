"""
Staging environment settings.

Inherits all production hardening (HTTPS, secure cookies, HSTS, Sentry) but
allows the staging hostname. Set STAGING_HOST to the Render-assigned hostname
(e.g. carelane-staging.onrender.com) so ALLOWED_HOSTS and CSRF_TRUSTED_ORIGINS
are populated without hard-coding.

Sentry environment is controlled by the SENTRY_ENVIRONMENT env var (default
'staging') — no code change needed when promoting to production.
"""
import os

from django.core.exceptions import ImproperlyConfigured

from .settings_production import *  # noqa: F401,F403


_STAGING_HOST = os.getenv('STAGING_HOST', '').strip()

if _STAGING_HOST:
    ALLOWED_HOSTS = list({*ALLOWED_HOSTS, _STAGING_HOST})  # noqa: F405
    CSRF_TRUSTED_ORIGINS = list({*CSRF_TRUSTED_ORIGINS, f'https://{_STAGING_HOST}'})  # noqa: F405

if not ALLOWED_HOSTS or '*' in ALLOWED_HOSTS:  # noqa: F405
    raise ImproperlyConfigured('ALLOWED_HOSTS must be set for staging (set STAGING_HOST or ALLOWED_HOSTS).')
if DATABASES['default']['ENGINE'] == 'django.db.backends.sqlite3':  # noqa: F405
    raise ImproperlyConfigured('DATABASE_URL must point to PostgreSQL in staging.')
