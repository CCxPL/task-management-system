from django.urls import path
from .views import (
    create_org_user, 
    current_user, 
    list_organization_members,
    update_org_user,      # ✅ Add this
    delete_org_user,      # ✅ Add this
    set_password, 
    request_password_reset, 
    reset_password
)

urlpatterns = [
    # Current user info
    path("me/", current_user, name="current-user"),
    
    # Team management
    path("create-org-user/", create_org_user, name="create-org-user"),           # POST - Create
    path("team/", list_organization_members, name="list-members"),                # GET - List
    path("team/<int:user_id>/", update_org_user, name="update-member"),          # PATCH - Update ✅
    path("team/<int:user_id>/delete/", delete_org_user, name="delete-member"),   # DELETE - Delete ✅
    
    # Password management
    path("set-password/", set_password, name="set-password"),
    path("request-reset/", request_password_reset, name="request-reset"),
    path("reset-password/", reset_password, name="reset-password"),
]