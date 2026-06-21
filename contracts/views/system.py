from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, HttpResponseForbidden, JsonResponse
from django.conf import settings
from django.utils.cache import patch_cache_control
from django.db import connection, DatabaseError

from ..error_pages import render_safe_error_page
from ..build_info import gather_ops_cockpit
from ._utils import _disable_response_caching
from ..tenancy import get_user_organization
from ..models import CareCase, Client, CareConfiguration, Document


def _render_spa_shell_response():
    spa_index_path = settings.BASE_DIR / 'theme' / 'static' / 'spa' / 'index.html'
    if spa_index_path.exists():
        response = HttpResponse(spa_index_path.read_text(encoding='utf-8'), content_type='text/html')
        return _disable_response_caching(response)

    response = HttpResponse(
        (
            '<!DOCTYPE html>'
            '<html lang="nl">'
            '<head>'
            '<meta charset="UTF-8" />'
            '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
            '<title>SaaS Carelane</title>'
            '<style>html, body { height: 100%; margin: 0; } #root { height: 100%; }</style>'
            '</head>'
            '<body>'
            '<div id="root"></div>'
            '</body>'
            '</html>'
        ),
        content_type='text/html',
    )
    return _disable_response_caching(response)


@ensure_csrf_cookie
def dashboard(request):
    # Dashboard is SPA-first: always serve the React frontend shell.
    # Legacy coördinatie backend pages are retired; workspace always loads the SPA.
    return _render_spa_shell_response()


def index(request):
    return dashboard(request)


def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute('SELECT 1')
    except DatabaseError:
        return HttpResponse('DATABASE ERROR', status=503, content_type='text/plain')
    return HttpResponse("OK", content_type="text/plain")


@login_required
@require_GET
def build_info(request):
    """Deployment truth for operators (commit, env, seed manifest, migrations). Staff-only."""
    user = request.user
    if not user.is_active or not user.is_staff:
        return JsonResponse({'detail': 'Staff account required.'}, status=403)
    response = JsonResponse(gather_ops_cockpit())
    patch_cache_control(response, private=True, no_store=True)
    return response


@login_required
@require_GET
def ops_system_state(request):
    """HTML cockpit + optional JSON (?format=json). Staff-only."""
    user = request.user
    if not user.is_active or not user.is_staff:
        return HttpResponseForbidden("Staff account required.")

    payload = gather_ops_cockpit()
    wants_json = request.GET.get("format") == "json" or (
        "application/json" in (request.headers.get("Accept") or "").lower()
        and request.GET.get("format") != "html"
    )
    if wants_json:
        response = JsonResponse(payload)
        patch_cache_control(response, private=True, no_store=True)
        return response
    response = render(request, "ops/system_state.html", {"ops": payload})
    patch_cache_control(response, private=True, no_store=True)
    return response


def favicon(request):
    """Serve favicon.ico to avoid 404 errors. Returns 204 No Content."""
    return HttpResponse(status=204)


@ensure_csrf_cookie
def workflow_case_spa_shell(request, pk):  # noqa: ARG001
    """Serve the SPA shell for workflow case dossier URLs (/care/cases/<id>/)."""
    return _render_spa_shell_response()


@login_required
def global_search(request):
    from django.db.models import Q
    from ..tenancy import scope_queryset_for_organization

    q = request.GET.get('q', '').strip()
    results = {}
    org = get_user_organization(request.user)
    if q:
        case_qs = scope_queryset_for_organization(CareCase.objects.all(), org) if org else CareCase.objects.none()
        client_qs = scope_queryset_for_organization(Client.objects.all(), org) if org else Client.objects.none()
        configuration_qs = scope_queryset_for_organization(CareConfiguration.objects.all(), org) if org else CareConfiguration.objects.none()
        document_qs = scope_queryset_for_organization(Document.objects.all(), org) if org else Document.objects.none()

        case_records = case_qs.filter(
            Q(title__icontains=q) | Q(preferred_provider__icontains=q) | Q(content__icontains=q)
        )[:10]
        configurations = configuration_qs.filter(
            Q(title__icontains=q) | Q(configuration_id__icontains=q) | Q(description__icontains=q)
        )[:10]

        results['case_records'] = case_records
        results['clients'] = client_qs.filter(
            Q(name__icontains=q) | Q(email__icontains=q) | Q(industry__icontains=q)
        )[:10]
        results['configurations'] = configurations
        results['documents'] = document_qs.filter(
            Q(title__icontains=q) | Q(description__icontains=q) | Q(tags__icontains=q)
        )[:10]
    return render(request, 'contracts/search_results.html', {'q': q, 'results': results})


def handler400(request, exception=None):  # noqa: ARG001
    return render_safe_error_page(request, 400, '400.html')


def handler403(request, exception=None):  # noqa: ARG001
    accept = request.META.get('HTTP_ACCEPT', '')
    if 'text/html' in accept and not request.path.startswith('/care/api/'):
        from ..error_pages import spa_error_redirect

        return spa_error_redirect(request, status_code=403)
    return render_safe_error_page(request, 403, '403.html')


def handler404(request, exception=None):  # noqa: ARG001
    return render_safe_error_page(request, 404, '404.html')


def handler500(request):
    return render_safe_error_page(request, 500, '500.html')
