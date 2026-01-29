from django.urls import path
from .views import (
    # NEW comprehensive reports
    project_report,
    team_report,
    
    # EXISTING reports (backward compatible)
    project_progress_report,
    sprint_burndown_report,
    user_productivity_report,
    overdue_issues_report,
)

urlpatterns = [
    # ✅ NEW - Comprehensive reports
    path('project/', project_report, name='project-report'),
    path('team/', team_report, name='team-report'),
    
    # ✅ EXISTING - Keep for backward compatibility
    path('project-progress/', project_progress_report),
    path('sprint-burndown/', sprint_burndown_report),
    path('user-productivity/', user_productivity_report),
    path('overdue/', overdue_issues_report),
]