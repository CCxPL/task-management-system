# workflows/permissions.py

from rest_framework.permissions import BasePermission
from organizations.models import OrganizationUser


class IsOrgAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # ❌ Platform super admin not allowed in app APIs
        if user.is_superuser:
            return False

        # ✅ FIX: org_memberships is a queryset, not a single object
        org_user = OrganizationUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not org_user:
            return False

        return org_user.role in ["ADMIN", "MANAGER"]
