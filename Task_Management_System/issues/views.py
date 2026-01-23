

## Complete Fixed Code

### File: `issues/views.py`

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Issue
from .serializers import IssueSerializer
from .utils import generate_issue_key
from workflows.models import WorkflowTransition, WorkflowStatus, Workflow
from projects.models import Project, ProjectMember


# ==========================================
# HELPER FUNCTIONS
# ==========================================

def get_org_user(user):
    """Get active organization membership for user"""
    return user.org_memberships.filter(is_active=True).first()


def require_admin_or_manager(user):
    """Require user to be Admin or Manager"""
    if user.is_superuser:
        raise PermissionDenied("Super Admin blocked")

    org_user = get_org_user(user)
    if not org_user or org_user.role not in ["ADMIN", "MANAGER"]:
        raise PermissionDenied("Only Admin / Manager allowed")

    return org_user


# ==========================================
# MAIN VIEWS
# ==========================================

@swagger_auto_schema(
    method="get",
    tags=["Issues"],
    operation_summary="List Issues",
    manual_parameters=[
        openapi.Parameter("project", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True),
        openapi.Parameter("status", openapi.IN_QUERY, type=openapi.TYPE_STRING),
    ],
    responses={200: IssueSerializer(many=True)}
)
@swagger_auto_schema(
    method="post",
    tags=["Issues"],
    operation_summary="Create Issue",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["project", "title", "issue_type"],
        properties={
            "project": openapi.Schema(type=openapi.TYPE_INTEGER),
            "title": openapi.Schema(type=openapi.TYPE_STRING),
            "issue_type": openapi.Schema(type=openapi.TYPE_STRING, enum=["TASK", "BUG", "STORY"]),
            "priority": openapi.Schema(type=openapi.TYPE_STRING, enum=["LOW", "MEDIUM", "HIGH"]),
            "assignee": openapi.Schema(type=openapi.TYPE_INTEGER),
        }
    ),
    responses={201: "Issue created"}
)
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def issues_list_create(request):
    """GET → List issues | POST → Create issue"""

    # =====================
    # GET → LIST ISSUES
    # =====================
    if request.method == "GET":
        org_user = get_org_user(request.user)
        if not org_user:
            raise PermissionDenied("Not part of organization")

        project_id = request.query_params.get("project")
        if not project_id:
            return Response({"error": "project param required"}, status=status.HTTP_400_BAD_REQUEST)

        project = get_object_or_404(Project, id=project_id, organization=org_user.organization)

        # Check access
        if org_user.role not in ["ADMIN", "MANAGER"]:
            if not ProjectMember.objects.filter(project=project, user=request.user, is_active=True).exists():
                raise PermissionDenied("Not project member")

        # Query issues
        queryset = Issue.objects.filter(project=project).select_related(
            "assignee", "workflow_status", "reporter"
        )

        status_slug = request.query_params.get("status")
        if status_slug:
            queryset = queryset.filter(workflow_status__slug=status_slug)

        serializer = IssueSerializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # =====================
    # POST → CREATE ISSUE
    # =====================
    if request.method == "POST":
        org_user = require_admin_or_manager(request.user)

        project_id = request.data.get("project")
        title = request.data.get("title")
        issue_type = request.data.get("issue_type")
        priority = request.data.get("priority", "MEDIUM")
        assignee_id = request.data.get("assignee")

        if not all([project_id, title, issue_type]):
            return Response(
                {"error": "Missing: project, title, issue_type"},
                status=status.HTTP_400_BAD_REQUEST
            )

        project = get_object_or_404(Project, id=project_id, organization=org_user.organization)

        # Get workflow start status
        start_status = WorkflowStatus.objects.filter(
            workflow__organization=org_user.organization,
            workflow__is_active=True,
            is_start=True
        ).first()

        if not start_status:
            return Response({"error": "Workflow not configured"}, status=status.HTTP_400_BAD_REQUEST)

        # Validate assignee
        assignee = None
        if assignee_id:
            try:
                assignee = ProjectMember.objects.get(
                    project=project, user_id=assignee_id, is_active=True
                ).user
            except ProjectMember.DoesNotExist:
                return Response({"error": "Assignee not in project"}, status=status.HTTP_400_BAD_REQUEST)

        # Create issue
        issue = Issue.objects.create(
            project=project,
            issue_key=generate_issue_key(project),
            title=title,
            issue_type=issue_type,
            priority=priority,
            workflow_status=start_status,
            assignee=assignee,
            reporter=request.user
        )

        serializer = IssueSerializer(issue)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@swagger_auto_schema(
    method="patch",
    tags=["Issues"],
    operation_summary="Update Issue Status",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["status"],
        properties={
            "status": openapi.Schema(
                type=openapi.TYPE_STRING,
                example="IN_PROGRESS",
                description="Frontend status format (BACKLOG, TO_DO, IN_PROGRESS, REVIEW, DONE)"
            )
        }
    ),
    responses={200: "Status updated"}
)
# issues/views.py - update_issue_status

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_issue_status(request, issue_id):
    """Update issue workflow status with transition validation"""
    user = request.user
    new_status_slug = request.data.get("status")

    print(f"\n{'='*60}")
    print(f"📥 Update Status Request")
    print(f"  Issue ID: {issue_id}")
    print(f"  Requested Status: {new_status_slug}")
    print(f"  User: {user.username}")
    print(f"{'='*60}\n")

    if not new_status_slug:
        return Response(
            {"error": "status is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 1️⃣ Fetch issue
    try:
        issue = get_object_or_404(Issue, id=issue_id)
        print(f"✅ Found issue: {issue.issue_key}")
    except Exception as e:
        print(f"❌ Issue not found: {e}")
        return Response(
            {"error": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    # 2️⃣ Org safety
    org_user = get_org_user(user)
    if not org_user:
        print(f"❌ User not in organization")
        return Response(
            {"error": "User not part of any organization"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    if issue.project.organization != org_user.organization:
        print(f"❌ Cross-org access attempt")
        raise PermissionDenied("Cross-organization access denied")
    
    print(f"✅ Organization check passed")

    # 3️⃣ Permission check
    is_project_admin = ProjectMember.objects.filter(
        project=issue.project,
        user=user,
        role="ADMIN",
        is_active=True
    ).exists()
    
    is_assignee = issue.assignee == user
    is_org_admin = org_user.role in ["ADMIN", "MANAGER"]
    
    print(f"📋 Permissions:")
    print(f"  Org role: {org_user.role}")
    print(f"  Is project admin: {is_project_admin}")
    print(f"  Is assignee: {is_assignee}")
    
    can_update = is_org_admin or is_project_admin or is_assignee
    
    if not can_update:
        print(f"❌ Permission denied")
        return Response(
            {"error": "Only Project Admin, Org Admin/Manager, or Assignee can move issue"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    print(f"✅ Permission check passed")

    # 4️⃣ Get current status
    current_status = issue.workflow_status
    if not current_status:
        print(f"❌ No workflow status assigned")
        return Response(
            {"error": "Issue has no workflow status assigned"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    print(f"📍 Current status: {current_status.slug}")

    # 5️⃣ Convert status
    STATUS_MAP = {
        'BACKLOG': 'backlog',
        'TO_DO': 'to-do',
        'IN_PROGRESS': 'in-progress',
        'REVIEW': 'review',
        'DONE': 'done',
    }
    
    backend_slug = STATUS_MAP.get(new_status_slug)
    
    if not backend_slug:
        backend_slug = new_status_slug.lower().replace('_', '-')
    
    print(f"🔄 Status mapping: {new_status_slug} → {backend_slug}")

    # 6️⃣ Get target status
    next_status = WorkflowStatus.objects.filter(
        slug=backend_slug,
        workflow=current_status.workflow
    ).first()

    if not next_status:
        available = list(WorkflowStatus.objects.filter(
            workflow=current_status.workflow
        ).values_list('slug', flat=True))
        
        print(f"❌ Status not found: {backend_slug}")
        print(f"   Available: {available}")
        
        return Response(
            {
                "error": f"Invalid status: {new_status_slug}",
                "mapped_to": backend_slug,
                "available_statuses": available
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    print(f"✅ Target status found: {next_status.slug}")

    # 7️⃣ Check if already in target status
    if current_status == next_status:
        print(f"⏭️ Already in target status")
        return Response(
            {
                "issue_id": issue.id,
                "issue_key": issue.issue_key,
                "status": new_status_slug,
                "message": "Issue already in this status"
            },
            status=status.HTTP_200_OK
        )

    # 8️⃣ Validate transition
    transition = WorkflowTransition.objects.filter(
        workflow=current_status.workflow,
        from_status=current_status,
        to_status=next_status
    ).first()
    
    if not transition:
        print(f"❌ Invalid transition: {current_status.slug} -> {next_status.slug}")
        
        # Show available transitions
        available_transitions = WorkflowTransition.objects.filter(
            workflow=current_status.workflow,
            from_status=current_status
        ).values_list('to_status__slug', flat=True)
        
        print(f"   Available from {current_status.slug}: {list(available_transitions)}")
        
        return Response(
            {
                "error": "Invalid workflow transition",
                "from": current_status.slug,
                "to": next_status.slug,
                "available_transitions": list(available_transitions)
            },
            status=status.HTTP_400_BAD_REQUEST
        )
    
    print(f"✅ Transition valid")

    # 9️⃣ Update issue
    try:
        issue.workflow_status = next_status
        issue.save(update_fields=["workflow_status"])
        print(f"✅ Issue updated successfully")
    except Exception as e:
        print(f"❌ Failed to save: {e}")
        return Response(
            {"error": f"Failed to update issue: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

    print(f"\n{'='*60}")
    print(f"✅ SUCCESS: {current_status.slug} → {next_status.slug}")
    print(f"{'='*60}\n")

    return Response(
        {
            "issue_id": issue.id,
            "issue_key": issue.issue_key,
            "from_status": current_status.slug,
            "to_status": next_status.slug,
            "status": new_status_slug,
            "message": "Issue status updated successfully"
        },
        status=status.HTTP_200_OK
    )


@swagger_auto_schema(
    method="get",
    tags=["Kanban"],
    operation_summary="Kanban Board",
    manual_parameters=[
        openapi.Parameter("project", openapi.IN_QUERY, type=openapi.TYPE_INTEGER, required=True)
    ],
    responses={200: "Issues grouped by status"}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def kanban_board(request):
    """Get issues organized by workflow status for kanban board"""
    user = request.user
    project_id = request.query_params.get("project")

    if not project_id:
        return Response(
            {"error": "project parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    project = get_object_or_404(Project, id=project_id)

    # Org safety
    org_user = get_org_user(user)
    if not org_user or project.organization != org_user.organization:
        raise PermissionDenied("Access denied")

    # Project access
    is_member = ProjectMember.objects.filter(
        project=project,
        user=user,
        is_active=True
    ).exists()

    if not is_member and org_user.role not in ["ADMIN", "MANAGER"]:
        raise PermissionDenied("Not a project member")

    # Fetch workflow
    workflow = Workflow.objects.filter(
        organization=project.organization,
        is_active=True
    ).prefetch_related("statuses").first()

    if not workflow:
        return Response(
            {"error": "Workflow not configured for this organization"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Get all statuses in order
    statuses = workflow.statuses.all().order_by("order")

    # Get all issues for project
    issues = Issue.objects.filter(
        project=project
    ).select_related("workflow_status", "assignee", "reporter")

    # ✅ SLUG TO FRONTEND MAPPING
    SLUG_TO_FRONTEND = {
        'backlog': 'BACKLOG',
        'to-do': 'TO_DO',
        'in-progress': 'IN_PROGRESS',
        'review': 'REVIEW',
        'done': 'DONE',
    }
    
    # Debug logging
    print(f"\n📊 Kanban Board Debug:")
    print(f"   Workflow: {workflow.name} (ID: {workflow.id})")
    print(f"   Statuses in workflow: {[s.slug for s in statuses]}")
    
    kanban_data = {}

    for status_obj in statuses:
        # Convert slug to frontend format
        frontend_key = SLUG_TO_FRONTEND.get(
            status_obj.slug, 
            status_obj.slug.upper().replace('-', '_')
        )
        
        status_issues = []
        for issue in issues:
            if issue.workflow_status_id == status_obj.id:
                status_issues.append({
                    "id": issue.id,
                    "issue_key": issue.issue_key,
                    "title": issue.title,
                    "priority": issue.priority,
                    "issue_type": issue.issue_type,
                    "status": frontend_key,  # ✅ Frontend format
                    "due_date": issue.due_date.isoformat() if issue.due_date else None,
                    "story_points": issue.story_points,
                    "assignee": {
                        "id": issue.assignee.id,
                        "email": issue.assignee.email,
                        "username": issue.assignee.username
                    } if issue.assignee else None,
                })
        
        kanban_data[frontend_key] = status_issues
        print(f"   {frontend_key}: {len(status_issues)} issues")

    print(f"   Total issues: {sum(len(v) for v in kanban_data.values())}")

    return Response(kanban_data, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def resolve_workflow(request):
    """Get workflow configuration with statuses and transitions"""
    org_user = get_org_user(request.user)
    if not org_user:
        raise PermissionDenied("Not part of organization")

    project_id = request.query_params.get("project")
    if not project_id:
        return Response({"error": "project param required"}, status=status.HTTP_400_BAD_REQUEST)

    project = get_object_or_404(Project, id=project_id, organization=org_user.organization)

    workflow = Workflow.objects.filter(
        organization=org_user.organization,
        is_active=True
    ).prefetch_related("statuses", "transitions").first()

    if not workflow:
        return Response({"error": "Workflow not configured"}, status=status.HTTP_400_BAD_REQUEST)

    return Response({
        "workflow": {
            "id": workflow.id,
            "name": workflow.name,
        },
        "statuses": [
            {
                "id": s.id,
                "name": s.name,
                "slug": s.slug,
                "order": s.order,
                "is_start": s.is_start,
                "is_end": s.is_end,
            }
            for s in workflow.statuses.all().order_by("order")
        ],
        "transitions": [
            {
                "from": t.from_status.slug,
                "to": t.to_status.slug,
            }
            for t in workflow.transitions.all()
        ],
    })


# Add these imports at the top
from collections import defaultdict

# ... (keep all your existing code) ...

# ==========================================
# NEW ENDPOINTS - Add these at the end
# ==========================================

# Add these imports at the top
from collections import defaultdict

# ... (keep all your existing code) ...

# ==========================================
# NEW ENDPOINTS - Add these at the end
# ==========================================

@swagger_auto_schema(
    method="get",
    tags=["Issues"],
    operation_summary="Get My Assigned Tasks",
    responses={200: IssueSerializer(many=True)}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_assigned_issues(request):
    """Get all issues assigned to current user"""
    user = request.user
    
    print(f"\n📋 Fetching tasks for user: {user.username}")
    
    # Get user's organization
    org_user = get_org_user(user)
    if not org_user:
        raise PermissionDenied("Not part of organization")
    
    # Get issues assigned to this user
    issues = Issue.objects.filter(
        assignee=user,
        project__organization=org_user.organization
    ).select_related(
        'workflow_status',
        'project',
        'reporter',
        'sprint'
    ).order_by('-created_at')
    
    print(f"✅ Found {issues.count()} assigned tasks")
    
    serializer = IssueSerializer(issues, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


@swagger_auto_schema(
    method="get",
    tags=["Issues"],
    operation_summary="Get Issues Grouped by Assignee",
    manual_parameters=[
        openapi.Parameter("project", openapi.IN_QUERY, type=openapi.TYPE_INTEGER)
    ],
    responses={200: "Issues grouped by assignee"}
)
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def issues_by_assignee(request):
    """Get issues grouped by assignee - For Admin/Manager"""
    user = request.user
    
    org_user = get_org_user(user)
    if not org_user:
        raise PermissionDenied("Not part of organization")
    
    # Only Admin/Manager can see all assignments
    if org_user.role not in ['ADMIN', 'MANAGER']:
        raise PermissionDenied("Only Admin/Manager can view all assignments")
    
    project_id = request.query_params.get('project')
    
    print(f"\n📊 Fetching assignments for organization: {org_user.organization.name}")
    
    # Get all issues in organization/project
    issues_query = Issue.objects.filter(
        project__organization=org_user.organization
    ).select_related('assignee', 'workflow_status', 'project')
    
    if project_id:
        issues_query = issues_query.filter(project_id=project_id)
        print(f"   Filtered by project: {project_id}")
    
    # Group by assignee
    assignments = defaultdict(list)
    
    for issue in issues_query:
        assignee_key = issue.assignee.username if issue.assignee else 'Unassigned'
        assignments[assignee_key].append(IssueSerializer(issue).data)
    
    print(f"✅ Found {len(assignments)} team members with assignments")
    for assignee, tasks in assignments.items():
        print(f"   {assignee}: {len(tasks)} tasks")
    
    return Response(dict(assignments), status=status.HTTP_200_OK)


@swagger_auto_schema(
    method="get",
    tags=["Issues"],
    operation_summary="Get Issue Details",
    responses={200: IssueSerializer()}
)
@api_view(['GET', 'PATCH', 'DELETE'])
@permission_classes([IsAuthenticated])
def issue_detail(request, issue_id):
    """Get, Update, or Delete a specific issue"""
    user = request.user
    org_user = get_org_user(user)
    
    if not org_user:
        raise PermissionDenied("Not part of organization")
    
    try:
        issue = Issue.objects.select_related(
            'workflow_status',
            'project',
            'assignee',
            'reporter',
            'sprint'
        ).get(id=issue_id)
    except Issue.DoesNotExist:
        return Response(
            {"error": "Issue not found"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check organization
    if issue.project.organization != org_user.organization:
        raise PermissionDenied("Access denied")
    
    # GET - View issue details
    if request.method == 'GET':
        print(f"📄 Fetching details for: {issue.issue_key}")
        serializer = IssueSerializer(issue)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # PATCH - Update issue
    elif request.method == 'PATCH':
        # Check permissions
        is_admin = org_user.role in ['ADMIN', 'MANAGER']
        is_assignee = issue.assignee == user
        
        if not (is_admin or is_assignee):
            raise PermissionDenied("Only Admin/Manager or Assignee can update")
        
        # Update allowed fields
        allowed_fields = ['title', 'description', 'priority', 'due_date', 'story_points']
        
        for field in allowed_fields:
            if field in request.data:
                setattr(issue, field, request.data[field])
        
        issue.save()
        
        print(f"✅ Updated issue: {issue.issue_key}")
        serializer = IssueSerializer(issue)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    # DELETE - Delete issue
    elif request.method == 'DELETE':
        # Only Admin can delete
        if org_user.role not in ['ADMIN', 'MANAGER']:
            raise PermissionDenied("Only Admin/Manager can delete issues")
        
        issue_key = issue.issue_key
        issue.delete()
        
        print(f"🗑️ Deleted issue: {issue_key}")
        return Response(
            {"message": f"Issue {issue_key} deleted successfully"},
            status=status.HTTP_200_OK
        )