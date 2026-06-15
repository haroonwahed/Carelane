"""
Simple per-user rate limiting for expensive API endpoints.
Uses Django's cache backend — LocMemCache in dev, configure Redis/DB in production.
"""
import logging
from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse

logger = logging.getLogger(__name__)


def throttle(*, rate: int, period: int):
    """
    Sliding-window rate limiter decorator.

    Args:
        rate:   Maximum number of requests allowed in the window.
        period: Window size in seconds.

    Usage:
        @throttle(rate=10, period=60)
        @login_required
        def my_view(request): ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped(request, *args, **kwargs):
            user_key = str(getattr(request.user, "pk", None) or "anon")
            cache_key = f"throttle:{view_func.__name__}:{user_key}"
            try:
                hits = cache.get(cache_key, 0)
                if hits >= rate:
                    logger.warning(
                        "throttle_exceeded endpoint=%s user=%s hits=%d rate=%d",
                        view_func.__name__, user_key, hits, rate,
                    )
                    return JsonResponse(
                        {
                            "error": "Te veel verzoeken. Probeer het over een minuut opnieuw.",
                            "retry_after": period,
                        },
                        status=429,
                    )
                cache.set(cache_key, hits + 1, period)
            except Exception:
                # Cache unavailable — fail open (don't block the request).
                logger.exception("throttle_cache_error endpoint=%s", view_func.__name__)
            return view_func(request, *args, **kwargs)
        return wrapped
    return decorator
