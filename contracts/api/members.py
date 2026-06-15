"""
Members API views: organization member management.
"""
import json
import logging
from datetime import timedelta

from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.decorators import login_required
from django.utils import timezone

from contracts.middleware import log_action
from contracts.models import (
    AuditLog,
    OrganizationMembership,
    OrganizationInvitation,
)
from contracts.tenancy import get_user_organization
from contracts.permissions import can_manage_organization

logger = logging.getLogger(__name__)


def _serialize_member(m):
    return {
        'id': m.pk,
        'userId': m.user_id,
        'username': m.user.username,
        'fullName': m.user.get_full_name() or m.user.username,
        'email': m.user.email,
        'role': m.role,
        'isActive': m.is_active,
        'joinedAt': m.created_at.isoformat(),
    }


def _serialize_invitation(i):
    return {
        'id': i.pk,
        'email': i.email,
        'role': i.role,
        'status': i.status,
        'invitedBy': i.invited_by.get_full_name() or i.invited_by.username if i.invited_by else '',
        'expiresAt': i.expires_at.isoformat() if i.expires_at else None,
        'createdAt': i.created_at.isoformat(),
    }


def _require_org_admin(request):
    """Returns (organization, None) for org admins/owners; (None, error response) otherwise."""
    organization = get_user_organization(request.user)
    if not organization:
        return None, JsonResponse({'error': 'Geen organisatie gevonden.'}, status=403)
    if not can_manage_organization(request.user, organization):
        return None, JsonResponse({'error': 'Alleen organisatiebeheerders kunnen gebruikers beheren.'}, status=403)
    return organization, None


@login_required
@require_http_methods(["GET", "POST"])
def members_api(request):
    """List members + pending invites (GET) or invite a new member (POST)."""
    organization, err = _require_org_admin(request)
    if err:
        return err

    if request.method == 'POST':
        try:
            payload = json.loads(request.body or '{}')
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Ongeldige JSON payload.'}, status=400)

        email = (payload.get('email') or '').strip().lower()
        role = (payload.get('role') or OrganizationMembership.Role.MEMBER).strip()

        if not email:
            return JsonResponse({'error': 'E-mailadres is verplicht.'}, status=400)
        if role not in OrganizationMembership.Role.values:
            return JsonResponse({'error': f'Ongeldige rol: {role}.'}, status=400)

        existing = (
            OrganizationMembership.objects
            .filter(organization=organization, user__email__iexact=email, is_active=True)
            .first()
        )
        if existing:
            return JsonResponse({'error': f'{email} is al een actief lid van deze organisatie.'}, status=409)

        pending = (
            OrganizationInvitation.objects
            .filter(organization=organization, email__iexact=email, status=OrganizationInvitation.Status.PENDING)
            .order_by('-created_at')
            .first()
        )
        if pending and (not pending.expires_at or pending.expires_at > timezone.now()):
            return JsonResponse({'error': f'Er bestaat al een actieve uitnodiging voor {email}.'}, status=409)

        invitation = OrganizationInvitation.objects.create(
            organization=organization,
            email=email,
            role=role,
            invited_by=request.user,
            expires_at=timezone.now() + timedelta(days=7),
        )
        log_action(
            request.user,
            AuditLog.Action.CREATE,
            'OrganizationInvitation',
            object_id=invitation.id,
            object_repr=invitation.email,
            changes={'organization_id': organization.id, 'email': invitation.email, 'role': invitation.role},
            request=request,
        )
        return JsonResponse({'invitation': _serialize_invitation(invitation)}, status=201)

    memberships = (
        OrganizationMembership.objects.filter(organization=organization)
        .select_related('user')
        .order_by('role', 'user__username')
    )
    invitations = (
        OrganizationInvitation.objects
        .filter(organization=organization, status=OrganizationInvitation.Status.PENDING)
        .select_related('invited_by')
        .order_by('-created_at')
    )
    return JsonResponse({
        'members': [_serialize_member(m) for m in memberships],
        'invitations': [_serialize_invitation(i) for i in invitations],
    })


@login_required
@require_http_methods(["PATCH"])
def member_role_api(request, membership_id):
    """Update a member's role."""
    organization, err = _require_org_admin(request)
    if err:
        return err
    try:
        membership = OrganizationMembership.objects.select_related('user').get(
            pk=membership_id, organization=organization
        )
    except OrganizationMembership.DoesNotExist:
        return JsonResponse({'error': 'Lid niet gevonden.'}, status=404)
    if membership.user_id == request.user.pk:
        return JsonResponse({'error': 'Je kunt je eigen rol niet wijzigen.'}, status=400)
    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Ongeldige JSON payload.'}, status=400)
    role = (payload.get('role') or '').strip()
    if role not in OrganizationMembership.Role.values:
        return JsonResponse({'error': f'Ongeldige rol: {role}.'}, status=400)
    old_role = membership.role
    membership.role = role
    membership.save(update_fields=['role'])
    log_action(
        request.user, AuditLog.Action.UPDATE, 'OrganizationMembership',
        object_id=membership.pk, object_repr=membership.user.email,
        changes={'role': {'from': old_role, 'to': role}}, request=request,
    )
    return JsonResponse({'member': _serialize_member(membership)})


@login_required
@require_http_methods(["POST"])
def member_deactivate_api(request, membership_id):
    """Deactivate or reactivate a member."""
    organization, err = _require_org_admin(request)
    if err:
        return err
    try:
        membership = OrganizationMembership.objects.select_related('user').get(
            pk=membership_id, organization=organization
        )
    except OrganizationMembership.DoesNotExist:
        return JsonResponse({'error': 'Lid niet gevonden.'}, status=404)
    if membership.user_id == request.user.pk:
        return JsonResponse({'error': 'Je kunt je eigen account niet deactiveren.'}, status=400)
    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Ongeldige JSON payload.'}, status=400)
    activate = bool(payload.get('activate', False))
    membership.is_active = activate
    membership.save(update_fields=['is_active'])
    action = 'reactivated' if activate else 'deactivated'
    log_action(
        request.user, AuditLog.Action.UPDATE, 'OrganizationMembership',
        object_id=membership.pk, object_repr=membership.user.email,
        changes={'is_active': activate, 'event': action}, request=request,
    )
    return JsonResponse({'member': _serialize_member(membership)})


@login_required
@require_http_methods(["POST"])
def invitation_action_api(request, invitation_id):
    """Revoke or resend a pending invitation."""
    organization, err = _require_org_admin(request)
    if err:
        return err
    try:
        invitation = OrganizationInvitation.objects.get(
            pk=invitation_id,
            organization=organization,
            status=OrganizationInvitation.Status.PENDING,
        )
    except OrganizationInvitation.DoesNotExist:
        return JsonResponse({'error': 'Uitnodiging niet gevonden of niet meer actief.'}, status=404)
    try:
        payload = json.loads(request.body or '{}')
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Ongeldige JSON payload.'}, status=400)
    action = (payload.get('action') or '').strip()
    if action == 'revoke':
        invitation.status = OrganizationInvitation.Status.REVOKED
        invitation.save(update_fields=['status'])
        log_action(
            request.user, AuditLog.Action.UPDATE, 'OrganizationInvitation',
            object_id=invitation.pk, object_repr=invitation.email,
            changes={'status': 'REVOKED'}, request=request,
        )
        return JsonResponse({'ok': True})
    if action == 'resend':
        invitation.expires_at = timezone.now() + timedelta(days=7)
        invitation.save(update_fields=['expires_at'])
        log_action(
            request.user, AuditLog.Action.UPDATE, 'OrganizationInvitation',
            object_id=invitation.pk, object_repr=invitation.email,
            changes={'event': 'resend'}, request=request,
        )
        return JsonResponse({'invitation': _serialize_invitation(invitation)})
    return JsonResponse({'error': 'Ongeldige actie. Gebruik "revoke" of "resend".'}, status=400)
