# projects/urls.py
from django.urls import path
from .views import (
    create_project, 
    list_projects,
    list_project_members, 
    add_project_member, 
    remove_project_member
)

urlpatterns = [
    # ✅ IMPORTANT: 'create/' MUST come BEFORE ''
    path('create/', create_project, name='create-project'),  # POST /api/projects/create/
    path('', list_projects, name='list-projects'),           # GET /api/projects/
    
    # Project member management
    path("<int:project_id>/members/", list_project_members, name='list-members'),
    path("<int:project_id>/members/add/", add_project_member, name='add-member'),
    path("<int:project_id>/members/remove/", remove_project_member, name='remove-member'),
]