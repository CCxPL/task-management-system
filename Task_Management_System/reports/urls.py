from django.urls import path
from .views import (
    project_progress_report,
    sprint_burndown_report,
    user_productivity_report,
    overdue_issues_report,
)

urlpatterns = [
    path('project-progress/', project_progress_report),
    path('sprint-burndown/', sprint_burndown_report),
    path('user-productivity/', user_productivity_report),
    path('overdue/', overdue_issues_report),
]
