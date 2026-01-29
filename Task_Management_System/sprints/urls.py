from django.urls import path
from .views import (
    create_sprint,
    list_sprints,
    list_sprints_by_query,
    get_sprint,           # ✅ NEW
    update_sprint,        # ✅ NEW
    delete_sprint,        # ✅ NEW
    start_sprint,
    complete_sprint
)

urlpatterns = [
    # Query param version (MUST be first)
    path("", list_sprints_by_query),  # GET /api/sprints/?project=1
    
    # Path param versions for projects
    path("projects/<int:project_id>/create/", create_sprint),
    path("projects/<int:project_id>/", list_sprints),
    
    # Single sprint operations (MUST be after query param route)
    path("<int:sprint_id>/", get_sprint),           # ✅ GET /api/sprints/1/
    path("<int:sprint_id>/update/", update_sprint), # ✅ PATCH /api/sprints/1/update/
    path("<int:sprint_id>/delete/", delete_sprint), # ✅ DELETE /api/sprints/1/delete/
    
    # Sprint actions
    path("<int:sprint_id>/start/", start_sprint),
    path("<int:sprint_id>/complete/", complete_sprint),
]