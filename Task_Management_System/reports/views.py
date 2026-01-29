from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.timezone import now
from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, Q

from issues.models import Issue
from timelogs.models import TimeLog
from projects.models import Project
from sprints.models import Sprint
from .permissions import IsOrgAdminOrManager


# ============================================================
# PROJECT REPORT (Main comprehensive report)
# ============================================================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_report(request):
    """
    Comprehensive project report
    GET /api/reports/project/?project=1
    """
    project_id = request.query_params.get('project')
    
    if not project_id:
        return Response(
            {"error": "project parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify access
    user = request.user
    org_user = user.org_memberships.filter(is_active=True).first()
    
    if not org_user:
        return Response(
            {"error": "Not part of organization"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    project = get_object_or_404(
        Project,
        id=project_id,
        organization=org_user.organization
    )
    
    issues = Issue.objects.filter(project=project)
    
    # ✅ Status breakdown - Use workflow_status__slug instead of status
    status_breakdown = {
        'BACKLOG': issues.filter(workflow_status__slug='backlog').count(),
        'TO_DO': issues.filter(workflow_status__slug='to-do').count(),
        'IN_PROGRESS': issues.filter(workflow_status__slug='in-progress').count(),
        'REVIEW': issues.filter(workflow_status__slug='review').count(),
        'DONE': issues.filter(workflow_status__slug='done').count(),
    }
    
    # Priority breakdown
    priority_breakdown = {
        'LOW': issues.filter(priority='LOW').count(),
        'MEDIUM': issues.filter(priority='MEDIUM').count(),
        'HIGH': issues.filter(priority='HIGH').count(),
        'CRITICAL': issues.filter(priority='CRITICAL').count(),
    }
    
    # Type breakdown
    type_breakdown = {
        'TASK': issues.filter(issue_type='TASK').count(),
        'BUG': issues.filter(issue_type='BUG').count(),
        'STORY': issues.filter(issue_type='STORY').count(),
        'EPIC': issues.filter(issue_type='EPIC').count(),
    }
    
    # Team performance
    team_performance = []
    members = org_user.organization.members.filter(is_active=True)
    
    for member in members:
        member_issues = issues.filter(assignee=member.user)
        completed = member_issues.filter(workflow_status__slug='done').count()
        in_progress = member_issues.filter(workflow_status__slug='in-progress').count()
        total = member_issues.count()
        
        team_performance.append({
            'member_id': member.user.id,
            'member_name': member.user.username,
            'role': member.role,
            'total_issues': total,
            'completed': completed,
            'in_progress': in_progress,
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 2)
        })
    
    # Sprint statistics
    sprints = Sprint.objects.filter(project=project)
    active_sprint = sprints.filter(status='ACTIVE').first()
    
    sprint_stats = {
        'total_sprints': sprints.count(),
        'active_sprints': sprints.filter(status='ACTIVE').count(),
        'completed_sprints': sprints.filter(status='COMPLETED').count(),
        'planned_sprints': sprints.filter(status='PLANNED').count(),
    }
    
    if active_sprint:
        sprint_issues = issues.filter(sprint=active_sprint)
        sprint_stats['active_sprint'] = {
            'id': active_sprint.id,
            'name': active_sprint.name,
            'total_issues': sprint_issues.count(),
            'completed': sprint_issues.filter(workflow_status__slug='done').count(),
            'in_progress': sprint_issues.filter(workflow_status__slug='in-progress').count(),
            'start_date': active_sprint.start_date,
            'end_date': active_sprint.end_date,
        }
    
    # Overall stats
    total_issues = issues.count()
    completed_issues = issues.filter(workflow_status__slug='done').count()
    
    overall_stats = {
        'total_issues': total_issues,
        'completed_issues': completed_issues,
        'active_issues': issues.exclude(workflow_status__slug='done').count(),
        'completion_rate': round((completed_issues / total_issues * 100) if total_issues > 0 else 0, 2),
    }
    
    print(f"✅ Generated comprehensive report for project: {project.name}")
    
    return Response({
        'project': {
            'id': project.id,
            'name': project.name,
            'key': project.key,
        },
        'overall_stats': overall_stats,
        'status_breakdown': status_breakdown,
        'priority_breakdown': priority_breakdown,
        'type_breakdown': type_breakdown,
        'team_performance': team_performance,
        'sprint_stats': sprint_stats,
        'generated_at': now(),
    }, status=status.HTTP_200_OK)


# ============================================================
# TEAM REPORT
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def team_report(request):
    """
    Team performance report
    GET /api/reports/team/
    """
    user = request.user
    org_user = user.org_memberships.filter(is_active=True).first()
    
    if not org_user:
        return Response(
            {"error": "Not part of organization"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    organization = org_user.organization
    members = organization.members.filter(is_active=True)
    
    team_stats = []
    
    for member in members:
        user_obj = member.user
        issues = Issue.objects.filter(
            assignee=user_obj,
            project__organization=organization
        )
        
        completed = issues.filter(workflow_status__slug='done').count()
        total = issues.count()
        
        team_stats.append({
            'member_id': user_obj.id,
            'member_name': user_obj.username,
            'role': member.role,
            'total_issues': total,
            'completed': completed,
            'in_progress': issues.filter(workflow_status__slug='in-progress').count(),
            'pending': issues.filter(workflow_status__slug__in=['backlog', 'to-do']).count(),
            'completion_rate': round((completed / total * 100) if total > 0 else 0, 2)
        })
    
    print(f"✅ Team report generated for organization: {organization.name}")
    
    return Response({
        'organization': organization.name,
        'team_stats': team_stats,
        'total_members': members.count(),
        'generated_at': now(),
    }, status=status.HTTP_200_OK)


# ============================================================
# EXISTING REPORTS (Keep for backward compatibility)
# ============================================================

@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def project_progress_report(request):
    """
    Simple project progress report
    GET /api/reports/project-progress/?project_id=1
    """
    project_id = request.GET.get('project_id')
    
    if not project_id:
        return Response(
            {"error": "project_id parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    issues = Issue.objects.filter(project_id=project_id)

    # ✅ Use workflow_status__slug
    data = {
        "total": issues.count(),
        "backlog": issues.filter(workflow_status__slug='backlog').count(),
        "todo": issues.filter(workflow_status__slug='to-do').count(),
        "in_progress": issues.filter(workflow_status__slug='in-progress').count(),
        "review": issues.filter(workflow_status__slug='review').count(),
        "done": issues.filter(workflow_status__slug='done').count(),
    }
    
    print(f"✅ Project progress report generated for project {project_id}")

    return Response(data)


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def sprint_burndown_report(request):
    """
    Sprint burndown report
    GET /api/reports/sprint-burndown/?sprint_id=1
    """
    sprint_id = request.GET.get('sprint_id')
    
    if not sprint_id:
        return Response(
            {"error": "sprint_id parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    issues = Issue.objects.filter(sprint_id=sprint_id)

    # ✅ Use workflow_status__slug
    data = {
        "total_tasks": issues.count(),
        "completed": issues.filter(workflow_status__slug='done').count(),
        "remaining": issues.exclude(workflow_status__slug='done').count(),
    }
    
    print(f"✅ Sprint burndown report generated for sprint {sprint_id}")

    return Response(data)


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def user_productivity_report(request):
    """
    User productivity report based on time logs
    GET /api/reports/user-productivity/?project_id=1
    """
    project_id = request.GET.get('project_id')
    
    if not project_id:
        return Response(
            {"error": "project_id parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

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
    
    print(f"✅ User productivity report generated for project {project_id}")

    return Response(response)


@api_view(['GET'])
@permission_classes([IsOrgAdminOrManager])
def overdue_issues_report(request):
    """
    Overdue issues report
    GET /api/reports/overdue/?project_id=1
    """
    project_id = request.GET.get('project_id')
    
    if not project_id:
        return Response(
            {"error": "project_id parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    today = now().date()

    # ✅ Use workflow_status__slug
    issues = Issue.objects.filter(
        project_id=project_id,
        due_date__lt=today
    ).exclude(workflow_status__slug='done')

    data = [
        {
            "issue_key": i.issue_key,
            "title": i.title,
            "assignee": i.assignee.username if i.assignee else None,
            "due_date": i.due_date,
            "priority": i.priority,
            "status": i.workflow_status.slug if i.workflow_status else 'unknown',
        }
        for i in issues
    ]
    
    print(f"✅ Overdue issues report generated for project {project_id}: {len(data)} issues")

    return Response(data)