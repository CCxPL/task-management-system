# workflows/permissions.py

from rest_framework.permissions import BasePermission
from organizations.models import OrganizationUser


class IsOrgAdminOrManager(BasePermission):
    """
    Permission: Only Org Admin or Manager can manage workflows
    """
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # ❌ Platform super admin not allowed in app APIs
        if user.is_superuser:
            return False

        org_user = OrganizationUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not org_user:
            return False

        return org_user.role in ["ADMIN", "MANAGER"]


class CanViewWorkflow(BasePermission):
    """
    Permission: All organization members can VIEW workflows
    Only Admins/Managers can EDIT
    
    Usage:
    - GET requests: All members (ADMIN, MANAGER, MEMBER)
    - POST/PUT/PATCH/DELETE: Only ADMIN, MANAGER
    """
    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # ❌ Platform super admin not allowed in app APIs
        if user.is_superuser:
            return False

        org_user = OrganizationUser.objects.filter(
            user=user,
            is_active=True
        ).first()

        if not org_user:
            return False

        # ✅ Read operations - All organization members can view
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True
        
        # ✅ Write operations - Only Admin/Manager
        return org_user.role in ["ADMIN", "MANAGER"]