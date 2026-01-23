# sprints/utils.py
from django.core.exceptions import PermissionDenied

def require_admin_or_manager(user):
    org_user = user.org_memberships.filter(is_active=True).first()
    if not org_user or org_user.role not in ["ADMIN", "MANAGER"]:
        raise PermissionDenied("Only Admin/Manager allowed")
    return org_user
