from django.shortcuts import get_object_or_404
from django.core.exceptions import PermissionDenied
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .serializers import ProjectCreateSerializer, ProjectSerializer, ProjectUpdateSerializer
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from .models import Project, ProjectMember
from organizations.models import OrganizationUser
from django.contrib.auth import get_user_model

User = get_user_model()

def get_org_user(user):
    return OrganizationUser.objects.filter(user=user, is_active=True).first()

def _require_admin_or_manager(user):
    if user.is_superuser:
        raise PermissionDenied("Super Admin cannot manage project members via app APIs")

    org_user = user.org_memberships.filter(is_active=True).first()

    if not org_user or org_user.role not in ["ADMIN", "MANAGER"]:
        raise PermissionDenied("Only Admin/Manager can manage project members")

    return org_user

def _get_project_for_user_org(user, project_id):
    org_user = user.org_memberships.filter(is_active=True).first()
    return get_object_or_404(
        Project,
        id=project_id,
        organization=org_user.organization
    )

def _require_org_admin_or_manager(user):
    if user.is_superuser:
        raise PermissionDenied("Super Admin cannot create projects")

    org_user = OrganizationUser.objects.filter(
        user=user,
        is_active=True
    ).select_related("organization").first()

    if not org_user or org_user.role not in ["ADMIN", "MANAGER"]:
        raise PermissionDenied("Only Admin/Manager can create projects")

    return org_user


# ---------------------------------------------------------
# LIST PROJECTS
# GET /api/projects/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="get",
    tags=["Projects"],
    operation_summary="List Projects",
    responses={200: ProjectSerializer(many=True)}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_projects(request):
    """
    List all projects based on user role:
    - Admin/Manager: All projects in organization
    - Member: Only projects they're assigned to
    """
    user = request.user
    
    org_user = get_org_user(user)
    if not org_user:
        raise PermissionDenied("Not part of any organization")
    
    organization = org_user.organization
    
    print(f"\n📂 Project List Request:")
    print(f"   User: {user.username}")
    print(f"   Role: {org_user.role}")
    print(f"   Organization: {organization.name}")
    
    # Base query
    projects = Project.objects.filter(
        organization=organization,
        is_active=True
    ).select_related('organization', 'created_by')
    
    # Role-based filtering
    if org_user.role in ["ADMIN", "MANAGER", "ORG_ADMIN"]:
        print(f"   ✅ Showing ALL projects in organization")
    else:
        # Member sees only assigned projects
        member_project_ids = ProjectMember.objects.filter(
            user=user,
            is_active=True
        ).values_list('project_id', flat=True)
        
        projects = projects.filter(id__in=member_project_ids)
        print(f"   ✅ Showing ONLY assigned projects")
    
    project_count = projects.count()
    print(f"   Total projects found: {project_count}")
    
    serializer = ProjectSerializer(projects, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# CREATE PROJECT
# POST /api/projects/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="post",
    tags=["Projects"],
    operation_summary="Create Project",
    request_body=ProjectCreateSerializer,
    responses={201: ProjectSerializer}
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_project(request):
    org_user = _require_org_admin_or_manager(request.user)

    serializer = ProjectCreateSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    project = Project.objects.create(
        organization=org_user.organization,
        name=serializer.validated_data["name"],
        key=serializer.validated_data["key"],
        description=serializer.validated_data.get("description", ""),
        created_by=request.user,
    )

    # Add creator as admin
    ProjectMember.objects.create(
        project=project,
        user=request.user,
        role="ADMIN"
    )

    print(f"✅ Project created: {project.name} (ID: {project.id})")

    return Response(
        ProjectSerializer(project).data,
        status=status.HTTP_201_CREATED
    )


# ---------------------------------------------------------
# GET SINGLE PROJECT
# GET /api/projects/<id>/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="get",
    tags=["Projects"],
    operation_summary="Get Project Details",
    responses={200: ProjectSerializer}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_project(request, project_id):
    """Get single project details"""
    user = request.user
    
    org_user = get_org_user(user)
    if not org_user:
        raise PermissionDenied("Not part of any organization")
    
    # Get project in user's organization
    project = get_object_or_404(
        Project,
        id=project_id,
        organization=org_user.organization,
        is_active=True
    )
    
    # Check access
    if org_user.role not in ["ADMIN", "MANAGER", "ORG_ADMIN"]:
        # Member must be assigned to project
        if not ProjectMember.objects.filter(project=project, user=user, is_active=True).exists():
            raise PermissionDenied("You don't have access to this project")
    
    print(f"✅ Project retrieved: {project.name} (ID: {project.id})")
    
    serializer = ProjectSerializer(project)
    return Response(serializer.data, status=status.HTTP_200_OK)


# ---------------------------------------------------------
# UPDATE PROJECT
# PATCH /api/projects/<id>/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="patch",
    tags=["Projects"],
    operation_summary="Update Project",
    request_body=ProjectUpdateSerializer,
    responses={200: ProjectSerializer}
)
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_project(request, project_id):
    """Update project details (Admin/Manager only)"""
    org_user = _require_org_admin_or_manager(request.user)
    
    project = get_object_or_404(
        Project,
        id=project_id,
        organization=org_user.organization
    )
    
    serializer = ProjectUpdateSerializer(project, data=request.data, partial=True)
    serializer.is_valid(raise_exception=True)
    serializer.save()
    
    print(f"✅ Project updated: {project.name} (ID: {project.id})")
    
    return Response(
        ProjectSerializer(project).data,
        status=status.HTTP_200_OK
    )


# ---------------------------------------------------------
# DELETE PROJECT
# DELETE /api/projects/<id>/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="delete",
    tags=["Projects"],
    operation_summary="Delete Project",
    responses={200: "Project deleted"}
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_project(request, project_id):
    """Soft delete project (Admin/Manager only)"""
    org_user = _require_org_admin_or_manager(request.user)
    
    project = get_object_or_404(
        Project,
        id=project_id,
        organization=org_user.organization
    )
    
    # Soft delete
    project.is_active = False
    project.save(update_fields=['is_active'])
    
    print(f"🗑️  Project deleted: {project.name} (ID: {project.id})")
    
    return Response(
        {"message": f"Project '{project.name}' deleted successfully"},
        status=status.HTTP_200_OK
    )


# ---------------------------------------------------------
# LIST PROJECT MEMBERS
# GET /api/projects/<id>/members/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="get",
    tags=["Projects"],
    operation_summary="List Project Members",
    responses={200: "Members list"}
)
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_project_members(request, project_id):
    user = request.user
    if user.is_superuser:
        raise PermissionDenied("Super Admin blocked")

    project = _get_project_for_user_org(user, project_id)

    members = ProjectMember.objects.filter(project=project, is_active=True).select_related("user")

    data = [
        {
            "id": pm.user.id,
            "username": pm.user.username,
            "email": pm.user.email,
            "project_role": pm.role,
        }
        for pm in members
    ]
    return Response({"project": project.id, "members": data}, status=200)


# ---------------------------------------------------------
# ADD PROJECT MEMBER
# POST /api/projects/<id>/members/add/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="post",
    tags=["Projects"],
    operation_summary="Add Member to Project",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["user_id"],
        properties={
            "user_id": openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
            "role": openapi.Schema(type=openapi.TYPE_STRING, enum=["ADMIN", "MEMBER"], default="MEMBER"),
        },
    ),
    responses={201: "Member added"}
)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_project_member(request, project_id):
    user = request.user
    _require_admin_or_manager(user)

    project = _get_project_for_user_org(user, project_id)

    user_id = request.data.get("user_id")
    role = request.data.get("role", "MEMBER")

    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    if role not in ["ADMIN", "MEMBER"]:
        return Response({"error": "Invalid role"}, status=400)

    target_user = get_object_or_404(User, id=user_id)

    # Ensure user belongs to same organization
    org_user = OrganizationUser.objects.filter(
        user=target_user,
        organization=project.organization,
        is_active=True
    ).first()

    if not org_user:
        return Response({"error": "User does not belong to this organization"}, status=400)

    pm, created = ProjectMember.objects.get_or_create(
        project=project,
        user=target_user,
        defaults={"role": role, "is_active": True}
    )

    if not created:
        updated = False
        if not pm.is_active:
            pm.is_active = True
            updated = True
        if pm.role != role:
            pm.role = role
            updated = True
        if updated:
            pm.save(update_fields=["is_active", "role"])

    return Response(
        {
            "project": project.id,
            "user_id": target_user.id,
            "role": pm.role,
            "message": "Member added"
        },
        status=status.HTTP_201_CREATED
    )


# ---------------------------------------------------------
# REMOVE PROJECT MEMBER
# DELETE /api/projects/<id>/members/remove/
# ---------------------------------------------------------
@swagger_auto_schema(
    method="delete",
    tags=["Projects"],
    operation_summary="Remove Member from Project",
    request_body=openapi.Schema(
        type=openapi.TYPE_OBJECT,
        required=["user_id"],
        properties={
            "user_id": openapi.Schema(type=openapi.TYPE_INTEGER, example=5),
        },
    ),
    responses={200: "Removed"}
)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def remove_project_member(request, project_id):
    user = request.user
    _require_admin_or_manager(user)

    project = _get_project_for_user_org(user, project_id)

    user_id = request.data.get("user_id")
    if not user_id:
        return Response({"error": "user_id is required"}, status=400)

    pm = ProjectMember.objects.filter(project=project, user_id=user_id).first()
    if not pm:
        return Response({"error": "User is not a project member"}, status=400)

    # Soft remove
    pm.is_active = False
    pm.save(update_fields=["is_active"])

    return Response({"message": "Member removed"}, status=200)