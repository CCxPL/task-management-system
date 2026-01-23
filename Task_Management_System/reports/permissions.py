from rest_framework.permissions import BasePermission

class IsOrgAdminOrManager(BasePermission):
    def has_permission(self, request, view):
        org_user = getattr(request.user, 'org_user', None)
        if not org_user:
            return False
        return org_user.role in ['ADMIN', 'MANAGER']