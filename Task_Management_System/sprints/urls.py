# sprints/urls.py
from django.urls import path
from .views import (
    create_sprint,
    list_sprints,
    list_sprints_by_query,
    start_sprint,
    complete_sprint
)

urlpatterns = [
    # Query param version (MUST be first)
    path("", list_sprints_by_query),  # GET /api/sprints/?project=1
    
    # Path param versions
    path("projects/<int:project_id>/create/", create_sprint),
    path("projects/<int:project_id>/", list_sprints),
    
    # Sprint actions
    path("<int:sprint_id>/start/", start_sprint),
    path("<int:sprint_id>/complete/", complete_sprint),
]