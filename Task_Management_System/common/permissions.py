from rest_framework.permissions import BasePermission
from organizations.models import OrganizationUser
from rest_framework.permissions import BasePermission

class IsNotSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return not request.user.is_superuser

class IsOrgAdmin(BasePermission):
    def has_permission(self, request, view):
        if request.user.is_superuser:
            return False
        return OrganizationUser.objects.filter(
            user=request.user,
            role='ADMIN',
            is_active=True
        ).exists()


class IsOrgManager(BasePermission):
    def has_permission(self, request, view):
        return OrganizationUser.objects.filter(
            user=request.user,
            role__in=['ADMIN', 'MANAGER'],
            is_active=True
        ).exists()


class IsOrgMember(BasePermission):
    def has_permission(self, request, view):
        return OrganizationUser.objects.filter(
            user=request.user,
            is_active=True
        ).exists()
