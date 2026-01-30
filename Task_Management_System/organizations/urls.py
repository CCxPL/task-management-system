from django.urls import path
from . import views

urlpatterns = [
    # Super Admin - Organization Management
    path('super-admin/stats/', views.organization_stats, name='organization-stats'),
    path('super-admin/organizations/', views.list_organizations, name='list-organizations'),
    path('super-admin/create/', views.create_organization_with_admin, name='create-organization'),  # ✅ Matches frontend
    path('super-admin/organizations/<int:org_id>/', views.update_organization, name='update-organization'),
    path('super-admin/organizations/<int:org_id>/delete/', views.delete_organization, name='delete-organization'),
    path('super-admin/organizations/<int:org_id>/toggle-status/', views.toggle_organization_status, name='toggle-organization-status'),
    
    # Legacy
    path('register/', views.register_organization, name='register-organization'),
]