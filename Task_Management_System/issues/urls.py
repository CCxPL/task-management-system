from django.urls import path
from .views import (
    kanban_board,
    update_issue_status,
    resolve_workflow,
    issues_list_create,
    my_assigned_issues,      # ✅ NEW
    issues_by_assignee,      # ✅ NEW
    issue_detail,            # ✅ NEW
)

urlpatterns = [
    path("", issues_list_create, name="issues-list-create"),
    
    # ✅ NEW ENDPOINTS
    path("my-tasks/", my_assigned_issues, name="my-tasks"),
    path("assignments/", issues_by_assignee, name="assignments"),
    path("<int:issue_id>/", issue_detail, name="issue-detail"),
    
    # EXISTING
    path("<int:issue_id>/status/", update_issue_status, name="update-status"),
    path("kanban/", kanban_board, name="kanban"),
    path("resolve-workflow/", resolve_workflow, name="resolve-workflow"),
]