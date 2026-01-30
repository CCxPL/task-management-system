from django.urls import path
from .views import (
    create_org_user, 
    current_user, 
    list_organization_members,
    update_org_user,
    delete_org_user,
    set_password, 
    request_password_reset, 
    reset_password
)
from .auth_views import custom_login  # ✅ Import

urlpatterns = [
    # Current user info
    path("me/", current_user, name="current-user"),
    
    # Team management
    path("create-org-user/", create_org_user, name="create-org-user"),
    path("team/", list_organization_members, name="list-members"),
    path("team/<int:user_id>/", update_org_user, name="update-member"),
    path("team/<int:user_id>/delete/", delete_org_user, name="delete-member"),
    
    # Password management
    path("set-password/", set_password, name="set-password"),
    path("request-reset/", request_password_reset, name="request-reset"),
    path("reset-password/", reset_password, name="reset-password"),
]