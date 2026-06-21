"""
Unit tests for resolve_actor_role security properties.

Verifies:
  - A user with no membership in the specified organisation never receives
    GEMEENTE (the fail-open bug fixed in workflow_state_machine.py).
  - A user with OrganisationMembership.Role.MEMBER in the org still resolves
    to GEMEENTE (the legitimate path that must not regress).
  - A user with OrganisationMembership.Role.OWNER resolves to ADMIN.
  - strict=True does not change behaviour for the non-member case (UNRESOLVED
    was already the correct answer, regardless of strict mode).
  - Without an organisation argument the default GEMEENTE is preserved.

Run:
  python manage.py test tests.test_resolve_actor_role_security
"""

from django.contrib.auth import get_user_model
from django.test import TestCase

from contracts.models import Organization, OrganizationMembership
from contracts.workflow_state_machine import WorkflowRole, resolve_actor_role

User = get_user_model()


class ResolveActorRoleNonMemberTest(TestCase):
    """
    A user who has no active membership in the target organisation must never
    be elevated to GEMEENTE, regardless of the strict flag.
    """

    def setUp(self):
        self.org_a = Organization.objects.create(name='Org Alpha', slug='org-alpha')
        self.org_b = Organization.objects.create(name='Org Beta', slug='org-beta')

        # user_a is a MEMBER of org_a only.
        self.user_a = User.objects.create_user(username='rr_user_a', password='p')
        OrganizationMembership.objects.create(
            organization=self.org_a,
            user=self.user_a,
            role=OrganizationMembership.Role.MEMBER,
            is_active=True,
        )

        # user_b is a non-member (no membership anywhere).
        self.user_b = User.objects.create_user(username='rr_user_b', password='p')

    # ------------------------------------------------------------------
    # Cross-tenant non-member cases (the security fix)
    # ------------------------------------------------------------------

    def test_member_of_other_org_gets_unresolved(self):
        """user_a is a MEMBER of org_a, but NOT of org_b → must not get GEMEENTE for org_b."""
        role = resolve_actor_role(user=self.user_a, organization=self.org_b)
        self.assertEqual(role, WorkflowRole.UNRESOLVED,
                         "Non-member must receive UNRESOLVED, not GEMEENTE")

    def test_member_of_other_org_strict_gets_unresolved(self):
        role = resolve_actor_role(user=self.user_a, organization=self.org_b, strict=True)
        self.assertEqual(role, WorkflowRole.UNRESOLVED)

    def test_user_with_no_membership_anywhere_gets_unresolved(self):
        """user_b has no membership at all; must not get GEMEENTE for org_a."""
        role = resolve_actor_role(user=self.user_b, organization=self.org_a)
        self.assertEqual(role, WorkflowRole.UNRESOLVED,
                         "Completely unaffiliated user must receive UNRESOLVED")

    def test_inactive_membership_gets_unresolved(self):
        """An inactive membership must not confer GEMEENTE rights."""
        OrganizationMembership.objects.create(
            organization=self.org_b,
            user=self.user_a,
            role=OrganizationMembership.Role.MEMBER,
            is_active=False,
        )
        role = resolve_actor_role(user=self.user_a, organization=self.org_b)
        self.assertEqual(role, WorkflowRole.UNRESOLVED)

    # ------------------------------------------------------------------
    # Same-tenant member cases (regression — must NOT break)
    # ------------------------------------------------------------------

    def test_member_role_in_own_org_gets_gemeente(self):
        """user_a is a MEMBER of org_a → should still resolve to GEMEENTE."""
        role = resolve_actor_role(user=self.user_a, organization=self.org_a)
        self.assertEqual(role, WorkflowRole.GEMEENTE,
                         "Active MEMBER in own org must still get GEMEENTE")

    def test_owner_role_in_own_org_gets_admin(self):
        owner = User.objects.create_user(username='rr_owner', password='p')
        OrganizationMembership.objects.create(
            organization=self.org_a,
            user=owner,
            role=OrganizationMembership.Role.OWNER,
            is_active=True,
        )
        role = resolve_actor_role(user=owner, organization=self.org_a)
        self.assertEqual(role, WorkflowRole.ADMIN)

    def test_admin_role_in_own_org_gets_admin(self):
        admin = User.objects.create_user(username='rr_admm', password='p')
        OrganizationMembership.objects.create(
            organization=self.org_a,
            user=admin,
            role=OrganizationMembership.Role.ADMIN,
            is_active=True,
        )
        role = resolve_actor_role(user=admin, organization=self.org_a)
        self.assertEqual(role, WorkflowRole.ADMIN)

    # ------------------------------------------------------------------
    # No-organisation argument (backward-compat — must not change)
    # ------------------------------------------------------------------

    def test_no_org_argument_still_returns_gemeente(self):
        """organisation=None: no tenant check, function falls through to GEMEENTE."""
        role = resolve_actor_role(user=self.user_a, organization=None)
        self.assertEqual(role, WorkflowRole.GEMEENTE,
                         "organisation=None path must remain unchanged (GEMEENTE)")
