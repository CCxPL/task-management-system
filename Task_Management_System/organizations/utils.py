from organizations.models import OrganizationUser

def get_active_org_user(user):
    return OrganizationUser.objects.filter(
        user=user,
        is_active=True
    ).select_related("organization").first()
