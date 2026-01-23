from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.utils.timezone import now
from issues.models import Issue
from timelogs.models import TimeLog
from projects.models import Project
from .permissions import IsOrgAdminOrManager


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def project_progress_report(request):
    project_id = request.GET.get('project_id')

    issues = Issue.objects.filter(project_id=project_id)

    data = {
        "total": issues.count(),
        "backlog": issues.filter(status='BACKLOG').count(),
        "todo": issues.filter(status='TODO').count(),
        "in_progress": issues.filter(status='IN_PROGRESS').count(),
        "done": issues.filter(status='DONE').count(),
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def sprint_burndown_report(request):
    sprint_id = request.GET.get('sprint_id')

    issues = Issue.objects.filter(sprint_id=sprint_id)

    data = {
        "total_tasks": issues.count(),
        "completed": issues.filter(status='DONE').count(),
        "remaining": issues.exclude(status='DONE').count(),
    }

    return Response(data)


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def user_productivity_report(request):
    project_id = request.GET.get('project_id')

    logs = TimeLog.objects.filter(issue__project_id=project_id)

    result = {}
    for log in logs:
        user = log.user.username
        result.setdefault(user, 0)
        result[user] += float(log.hours_spent)

    response = [
        {"user": user, "total_hours": hours}
        for user, hours in result.items()
    ]

    return Response(response)


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def overdue_issues_report(request):
    project_id = request.GET.get('project_id')
    today = now().date()

    issues = Issue.objects.filter(
        project_id=project_id,
        due_date__lt=today
    ).exclude(status='DONE')

    data = [
        {
            "issue_key": i.issue_key,
            "title": i.title,
            "assignee": i.assignee.username if i.assignee else None,
            "due_date": i.due_date,
        }
        for i in issues
    ]

    return Response(data)
