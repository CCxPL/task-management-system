# sprints/views.py
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404

from .models import Sprint
from .serializers import SprintCreateSerializer, SprintSerializer
from projects.models import Project
from .utils import require_admin_or_manager


# -----------------------------
# LIST SPRINTS (Query Param Version)
# GET /api/sprints/?project=1
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_sprints_by_query(request):
    """List sprints filtered by project query parameter"""
    project_id = request.query_params.get('project')
    
    if not project_id:
        return Response(
            {"error": "project parameter is required"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify user has access
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
    
    sprints = Sprint.objects.filter(project=project).order_by("-created_at")
    serializer = SprintSerializer(sprints, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


# -----------------------------
# CREATE SPRINT
# POST /api/sprints/projects/<id>/create/
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_sprint(request, project_id):
    org_user = require_admin_or_manager(request.user)

    project = get_object_or_404(
        Project,
        id=project_id,
        organization=org_user.organization
    )

    serializer = SprintCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    sprint = Sprint.objects.create(
        project=project,
        **serializer.validated_data
    )

    return Response(
        {
            "sprint_id": sprint.id,
            "name": sprint.name,
            "status": sprint.status
        },
        status=status.HTTP_201_CREATED
    )


# -----------------------------
# LIST SPRINTS (Path Param Version)
# GET /api/sprints/projects/<id>/
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_sprints(request, project_id):
    project = get_object_or_404(Project, id=project_id)
    sprints = Sprint.objects.filter(project=project).order_by("-created_at")
    serializer = SprintSerializer(sprints, many=True)
    return Response(serializer.data, status=200)


# -----------------------------
# START SPRINT
# POST /api/sprints/<id>/start/
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def start_sprint(request, sprint_id):
    require_admin_or_manager(request.user)
    sprint = get_object_or_404(Sprint, id=sprint_id)

    if Sprint.objects.filter(
        project=sprint.project,
        status="ACTIVE"
    ).exists():
        return Response(
            {"error": "Another sprint is already active"},
            status=400
        )

    sprint.status = "ACTIVE"
    sprint.save(update_fields=["status"])
    return Response({"message": "Sprint started"})


# -----------------------------
# COMPLETE SPRINT
# POST /api/sprints/<id>/complete/
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def complete_sprint(request, sprint_id):
    require_admin_or_manager(request.user)
    sprint = get_object_or_404(Sprint, id=sprint_id)
    sprint.status = "COMPLETED"
    sprint.save(update_fields=["status"])
    return Response({"message": "Sprint completed"})