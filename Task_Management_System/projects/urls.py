from django.urls import path
from .views import (
    list_projects,
    create_project,
    get_project,
    update_project,
    delete_project,
    list_project_members,
    add_project_member,
    remove_project_member,
)

urlpatterns = [
    # ✅ Project CRUD - Make sure these exist
    path('', list_projects, name='list-projects'),                           # GET
    path('create/', create_project, name='create-project'),                         # POST (same URL, different method)
    path('<int:project_id>/', get_project, name='get-project'),             # GET
    path('<int:project_id>/update/', update_project, name='update-project'), # PATCH ✅ THIS MUST EXIST
    path('<int:project_id>/delete/', delete_project, name='delete-project'), # DELETE
    
    # Project Members
    path('<int:project_id>/members/', list_project_members),
    path('<int:project_id>/members/add/', add_project_member),
    path('<int:project_id>/members/remove/', remove_project_member),
]