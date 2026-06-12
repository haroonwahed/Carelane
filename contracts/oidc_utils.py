"""OIDC helpers — canonical redirect_uri for Google OAuth (avoids redirect_uri_mismatch)."""

from django.conf import settings


def oidc_callback_redirect_uri() -> str:
    """Fully qualified OAuth callback URL registered in the IdP (Google Cloud Console)."""
    base = getattr(settings, 'OIDC_PUBLIC_BASE_URL', '').rstrip('/')
    callback_path = '/oidc/callback/'
    return f'{base}{callback_path}'
