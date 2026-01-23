from organizations.models import OrganizationUser
from projects.models import ProjectMember

def is_project_member(user, project):
    return ProjectMember.objects.filter(
        project=project,
        user=user
    ).exists()

def get_user_organization(user):
    org_user = OrganizationUser.objects.filter(
        user=user,
        is_active=True
    ).first()
    return org_user.organization if org_user else None
