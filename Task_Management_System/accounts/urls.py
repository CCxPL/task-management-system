from django.urls import path
from .views import create_org_user, current_user, list_organization_members, set_password, request_password_reset, reset_password

urlpatterns = [
    path("me/", current_user),
    path("create-org-user/", create_org_user),
    path("team/", list_organization_members),
    path("set-password/", set_password),
    path("request-reset/", request_password_reset),
    path("reset-password/", reset_password),
]
