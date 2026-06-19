from django.shortcuts import render, redirect
from django.views.generic import CreateView
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.urls import reverse_lazy, reverse
from django.utils.http import url_has_allowed_host_and_scheme
import json
import logging

from ..models import UserProfile
from ..forms import RegistrationForm, UserProfileForm
from ..tenancy import ensure_user_organization, get_user_organization
from django.contrib.auth import login

from ._utils import _disable_response_caching

logger = logging.getLogger(__name__)

DESIGN_MODE_SESSION_KEY = 'carelane_design_mode'
DESIGN_MODE_SPA = 'spa'
VALID_DESIGN_MODES = {DESIGN_MODE_SPA}


def get_or_create_profile(user):
    from contracts.user_profile_provisioning import ensure_user_profile_exists

    profile, _ = ensure_user_profile_exists(user)
    return profile


def _normalize_design_mode(value):
    candidate = str(value or '').strip().lower()
    # Legacy mode is retired; keep backward-compatible coercion to SPA.
    if candidate in {DESIGN_MODE_SPA, 'legacy'}:
        return DESIGN_MODE_SPA
    return None


class SignUpView(CreateView):
    form_class = RegistrationForm
    success_url = reverse_lazy('dashboard')
    template_name = 'registration/register.html'

    def form_valid(self, form):
        response = super().form_valid(form)
        try:
            UserProfile.objects.get_or_create(user=self.object)
        except Exception:
            logger.exception("Registration profile bootstrap failed for user_id=%s", getattr(self.object, "id", None))

        try:
            ensure_user_organization(self.object)
        except Exception:
            from django.contrib import messages
            logger.exception("Registration tenancy bootstrap failed for user_id=%s", getattr(self.object, "id", None))
            messages.warning(
                self.request,
                "Account is aangemaakt, maar organisatie-instellingen worden nog voorbereid. Log opnieuw in als dit zichtbaar blijft.",
            )

        try:
            login(self.request, self.object, backend='django.contrib.auth.backends.ModelBackend')
        except Exception:
            logger.exception("Post-registration auto login failed for user_id=%s", getattr(self.object, "id", None))
        return response


@login_required
def design_mode_settings(request):
    if request.method == 'GET':
        return JsonResponse({'ok': True, 'design_mode': DESIGN_MODE_SPA})

    requested_mode = request.POST.get('design_mode')
    if not requested_mode and request.content_type and 'application/json' in request.content_type:
        try:
            payload = json.loads(request.body.decode('utf-8') or '{}')
        except json.JSONDecodeError:
            payload = {}
        requested_mode = payload.get('design_mode')

    design_mode = _normalize_design_mode(requested_mode)
    if design_mode is None:
        return JsonResponse(
            {
                'ok': False,
                'error': 'Invalid design mode. Use "spa".',
            },
            status=400,
        )

    request.session[DESIGN_MODE_SESSION_KEY] = DESIGN_MODE_SPA
    request.session.modified = True

    wants_json = (
        request.headers.get('X-Requested-With') == 'XMLHttpRequest'
        or 'application/json' in request.headers.get('Accept', '')
        or (request.content_type and 'application/json' in request.content_type)
    )
    if wants_json:
        return JsonResponse({'ok': True, 'design_mode': DESIGN_MODE_SPA})

    next_url = request.POST.get('next') or request.GET.get('next') or reverse('settings_hub')
    if not url_has_allowed_host_and_scheme(next_url, {request.get_host()}, require_https=request.is_secure()):
        next_url = reverse('settings_hub')
    return redirect(next_url)


def profile(request):
    profile_obj = get_or_create_profile(request.user) if request.user.is_authenticated else None
    form = UserProfileForm(instance=profile_obj) if profile_obj else None
    return render(request, 'profile.html', {'form': form, 'profile': profile_obj})


@login_required
def settings_hub(request):
    return render(
        request,
        'settings_hub.html',
        {
            'design_mode': DESIGN_MODE_SPA,
        },
    )
