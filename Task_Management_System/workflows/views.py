# workflows/views.py

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.utils.text import slugify
from rest_framework.exceptions import PermissionDenied
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from organizations.utils import get_active_org_user
from projects.models import Project
from .models import Workflow, WorkflowStatus, WorkflowTransition
from .serializers import (
    WorkflowSerializer,
    WorkflowStatusSerializer,
    WorkflowTransitionSerializer
)
from .permissions import IsOrgAdminOrManager


class WorkflowViewSet(viewsets.ModelViewSet):
    """
    Complete Kanban Workflow Management
    - Create/Update/Delete workflows
    - Manage statuses (kanban columns)
    - Manage transitions (status flow rules)
    - Auto-create default workflows
    """
    serializer_class = WorkflowSerializer
    permission_classes = [IsOrgAdminOrManager]

    def get_queryset(self):
        """Get workflows for user's organization"""
        org_user = get_active_org_user(self.request.user)
        if not org_user:
            raise PermissionDenied("User not part of any organization")

        org = org_user.organization
        return Workflow.objects.filter(
            organization=org,
            is_active=True
        ).select_related('organization', 'created_by', 'project')

    def perform_create(self, serializer):
        """
        Create workflow with default kanban statuses and transitions
        """
        workflow = serializer.save()
        
        # Create default kanban statuses
        default_statuses = [
            {
                'name': 'Backlog',
                'slug': 'backlog',
                'order': 1,
                'is_start': True,
                'is_terminal': False,
                'color': '#6B7280'  # Gray
            },
            {
                'name': 'To Do',
                'slug': 'to-do',
                'order': 2,
                'is_start': False,
                'is_terminal': False,
                'color': '#3B82F6'  # Blue
            },
            {
                'name': 'In Progress',
                'slug': 'in-progress',
                'order': 3,
                'is_start': False,
                'is_terminal': False,
                'color': '#F59E0B'  # Orange
            },
            {
                'name': 'Review',
                'slug': 'review',
                'order': 4,
                'is_start': False,
                'is_terminal': False,
                'color': '#8B5CF6'  # Purple
            },
            {
                'name': 'Done',
                'slug': 'done',
                'order': 5,
                'is_start': False,
                'is_terminal': True,
                'color': '#10B981'  # Green
            },
        ]
        
        created_statuses = []
        with transaction.atomic():
            for status_data in default_statuses:
                status = WorkflowStatus.objects.create(
                    workflow=workflow,
                    **status_data
                )
                created_statuses.append(status)
            
            # Auto-create ALL transitions (full kanban flexibility)
            for from_status in created_statuses:
                for to_status in created_statuses:
                    if from_status.id != to_status.id:
                        WorkflowTransition.objects.create(
                            workflow=workflow,
                            from_status=from_status,
                            to_status=to_status
                        )
        
        print(f"✅ Created workflow '{workflow.name}' with {len(created_statuses)} statuses and {workflow.transitions.count()} transitions")
        
        return workflow

    # ============================================================
    # STATUS MANAGEMENT (Kanban Columns)
    # ============================================================

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Add Kanban Column",
        operation_description="Add a new status (column) to workflow",
        request_body=WorkflowStatusSerializer,
        responses={201: WorkflowStatusSerializer}
    )
    @action(detail=True, methods=["post"], url_path="statuses")
    def add_status(self, request, pk=None):
        """Add new status to workflow"""
        workflow = self.get_object()
        serializer = WorkflowStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        name = serializer.validated_data["name"]
        order = serializer.validated_data.get("order", workflow.statuses.count() + 1)
        is_start = bool(serializer.validated_data.get("is_start", False))
        is_terminal = bool(serializer.validated_data.get("is_terminal", False))
        color = serializer.validated_data.get("color", "")

        # Auto-generate unique slug
        base_slug = slugify(name)
        slug = base_slug
        counter = 1

        while WorkflowStatus.objects.filter(
            workflow=workflow, slug=slug
        ).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        with transaction.atomic():
            # Ensure only one start status
            if is_start:
                WorkflowStatus.objects.filter(
                    workflow=workflow, is_start=True
                ).update(is_start=False)

            # Ensure only one terminal status
            if is_terminal:
                WorkflowStatus.objects.filter(
                    workflow=workflow, is_terminal=True
                ).update(is_terminal=False)

            status_obj = WorkflowStatus.objects.create(
                workflow=workflow,
                name=name,
                slug=slug,
                order=order,
                is_start=is_start,
                is_terminal=is_terminal,
                color=color
            )

        return Response(
            WorkflowStatusSerializer(status_obj).data,
            status=status.HTTP_201_CREATED
        )

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="List Statuses",
        operation_description="Get all statuses for a workflow",
        responses={200: WorkflowStatusSerializer(many=True)}
    )
    @action(detail=True, methods=["get"], url_path="statuses/list")
    def list_statuses(self, request, pk=None):
        """List all statuses for workflow"""
        workflow = self.get_object()
        statuses = workflow.statuses.all().order_by('order')
        serializer = WorkflowStatusSerializer(statuses, many=True)
        return Response(serializer.data, status=200)

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Update Status",
        operation_description="Update a workflow status",
        request_body=WorkflowStatusSerializer,
        responses={200: WorkflowStatusSerializer}
    )
    @action(detail=True, methods=["patch"], url_path="statuses/(?P<status_id>[^/.]+)")
    def update_status(self, request, pk=None, status_id=None):
        """Update a status"""
        workflow = self.get_object()
        status_obj = get_object_or_404(
            WorkflowStatus,
            id=status_id,
            workflow=workflow
        )
        
        serializer = WorkflowStatusSerializer(
            status_obj,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            # Handle is_start flag
            if serializer.validated_data.get('is_start'):
                WorkflowStatus.objects.filter(
                    workflow=workflow,
                    is_start=True
                ).exclude(id=status_id).update(is_start=False)
            
            # Handle is_terminal flag
            if serializer.validated_data.get('is_terminal'):
                WorkflowStatus.objects.filter(
                    workflow=workflow,
                    is_terminal=True
                ).exclude(id=status_id).update(is_terminal=False)
            
            serializer.save()
        
        return Response(serializer.data, status=200)

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Delete Status",
        operation_description="Delete a workflow status",
        responses={204: "Status deleted"}
    )
    @action(detail=True, methods=["delete"], url_path="statuses/(?P<status_id>[^/.]+)/delete")
    def delete_status(self, request, pk=None, status_id=None):
        """Delete a status"""
        workflow = self.get_object()
        status_obj = get_object_or_404(
            WorkflowStatus,
            id=status_id,
            workflow=workflow
        )
        
        # Check if any issues are using this status
        if status_obj.issues.exists():
            return Response(
                {"error": "Cannot delete status that has issues assigned to it"},
                status=400
            )
        
        status_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Reorder Kanban Columns",
        operation_description="Reorder workflow statuses",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["order"],
            properties={
                "order": openapi.Schema(
                    type=openapi.TYPE_ARRAY,
                    items=openapi.Schema(type=openapi.TYPE_INTEGER),
                    description="Array of status IDs in desired order",
                    example=[1, 3, 2, 4, 5]
                )
            }
        ),
        responses={200: "Order updated"}
    )
    @action(detail=True, methods=["patch"], url_path="statuses/reorder")
    def reorder_statuses(self, request, pk=None):
        """Reorder workflow statuses"""
        workflow = self.get_object()
        order_list = request.data.get("order")

        if not isinstance(order_list, list) or not order_list:
            return Response(
                {"error": "order must be a non-empty list of status IDs"},
                status=400
            )

        statuses = WorkflowStatus.objects.filter(
            workflow=workflow, id__in=order_list
        )

        if statuses.count() != len(order_list):
            return Response(
                {"error": "One or more status IDs are invalid"},
                status=400
            )

        with transaction.atomic():
            for index, status_id in enumerate(order_list, start=1):
                WorkflowStatus.objects.filter(
                    id=status_id, workflow=workflow
                ).update(order=index)

        return Response(
            {"message": "Statuses reordered successfully"},
            status=200
        )

    # ============================================================
    # TRANSITION MANAGEMENT (Workflow Rules)
    # ============================================================

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Add Status Transition",
        operation_description="Create a new status transition rule",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["from_status", "to_status"],
            properties={
                "from_status": openapi.Schema(type=openapi.TYPE_INTEGER, description="Source status ID"),
                "to_status": openapi.Schema(type=openapi.TYPE_INTEGER, description="Target status ID"),
            }
        ),
        responses={201: WorkflowTransitionSerializer}
    )
    @action(detail=True, methods=["post"], url_path="transitions")
    def add_transition(self, request, pk=None):
        """Add a new transition"""
        workflow = self.get_object()
        from_id = request.data.get("from_status")
        to_id = request.data.get("to_status")

        if not from_id or not to_id:
            return Response(
                {"error": "from_status and to_status are required"},
                status=400
            )

        from_status = get_object_or_404(
            WorkflowStatus, workflow=workflow, id=from_id
        )
        to_status = get_object_or_404(
            WorkflowStatus, workflow=workflow, id=to_id
        )

        if from_status.id == to_status.id:
            return Response(
                {"error": "Cannot create self-transition"},
                status=400
            )

        transition, created = WorkflowTransition.objects.get_or_create(
            workflow=workflow,
            from_status=from_status,
            to_status=to_status
        )

        return Response(
            WorkflowTransitionSerializer(transition).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="List Transitions",
        operation_description="Get all transitions for a workflow",
        responses={200: WorkflowTransitionSerializer(many=True)}
    )
    @action(detail=True, methods=["get"], url_path="transitions/list")
    def list_transitions(self, request, pk=None):
        """List all transitions for workflow"""
        workflow = self.get_object()
        transitions = workflow.transitions.all().select_related('from_status', 'to_status')
        serializer = WorkflowTransitionSerializer(transitions, many=True)
        return Response(serializer.data, status=200)

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Delete Transition",
        operation_description="Delete a workflow transition",
        responses={204: "Transition deleted"}
    )
    @action(detail=True, methods=["delete"], url_path="transitions/(?P<transition_id>[^/.]+)/delete")
    def delete_transition(self, request, pk=None, transition_id=None):
        """Delete a transition"""
        workflow = self.get_object()
        transition = get_object_or_404(
            WorkflowTransition,
            id=transition_id,
            workflow=workflow
        )
        
        transition.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Auto-create All Transitions",
        operation_description="""
        Automatically creates transitions between ALL statuses.
        This gives maximum flexibility for kanban drag-and-drop.
        
        Example: For 5 statuses, creates 20 transitions (5x4).
        """,
        responses={200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "message": openapi.Schema(type=openapi.TYPE_STRING),
                "created_count": openapi.Schema(type=openapi.TYPE_INTEGER),
                "total_transitions": openapi.Schema(type=openapi.TYPE_INTEGER),
                "statuses": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_STRING))
            }
        )}
    )
    @action(detail=True, methods=["post"], url_path="transitions/auto-create")
    def auto_create_transitions(self, request, pk=None):
        """
        Auto-create all possible transitions for maximum kanban flexibility.
        Creates bidirectional transitions between all statuses.
        """
        workflow = self.get_object()
        
        statuses = list(workflow.statuses.all())
        
        if len(statuses) < 2:
            return Response(
                {"error": "Workflow needs at least 2 statuses to create transitions"},
                status=400
            )
        
        created_count = 0
        
        with transaction.atomic():
            # Create transition from each status to every other status
            for from_status in statuses:
                for to_status in statuses:
                    if from_status.id == to_status.id:
                        continue  # Skip self-transitions
                    
                    _, created = WorkflowTransition.objects.get_or_create(
                        workflow=workflow,
                        from_status=from_status,
                        to_status=to_status
                    )
                    
                    if created:
                        created_count += 1
        
        return Response({
            "message": f"Successfully created {created_count} new transitions",
            "created_count": created_count,
            "total_transitions": workflow.transitions.count(),
            "statuses": [s.slug for s in statuses]
        }, status=200)

    # ============================================================
    # WORKFLOW RESOLUTION (For Kanban Rendering)
    # ============================================================

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Resolve Workflow for Project",
        operation_description="""
        Returns the workflow to use for a project's kanban board.
        
        Resolution priority:
        1️⃣ Project-specific workflow (if assigned)
        2️⃣ Organization default workflow
        
        Returns workflow with all statuses and transitions.
        """,
        manual_parameters=[
            openapi.Parameter(
                "project",
                openapi.IN_QUERY,
                type=openapi.TYPE_INTEGER,
                required=True,
                description="Project ID"
            )
        ],
        responses={200: openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                "workflow": openapi.Schema(type=openapi.TYPE_OBJECT),
                "statuses": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT)),
                "transitions": openapi.Schema(type=openapi.TYPE_ARRAY, items=openapi.Schema(type=openapi.TYPE_OBJECT))
            }
        )}
    )
    @action(detail=False, methods=["get"], url_path="resolve")
    def resolve(self, request):
        """
        Resolve workflow for a project.
        Used by frontend to render kanban board.
        """
        project_id = request.query_params.get("project")
        
        if not project_id:
            return Response(
                {"error": "project query param is required"},
                status=400
            )

        org_user = get_active_org_user(request.user)
        if not org_user:
            raise PermissionDenied("User not part of any organization")

        org = org_user.organization
        
        # Get project
        project = get_object_or_404(
            Project,
            id=project_id,
            organization=org
        )

        # Resolution: Project workflow > Org default workflow
        workflow = getattr(project, "workflow", None)
        
        if not workflow:
            workflow = Workflow.objects.filter(
                organization=org,
                is_default=True,
                is_active=True
            ).first()

        if not workflow:
            return Response(
                {
                    "error": "No workflow configured",
                    "message": "Please create a default workflow for your organization"
                },
                status=404
            )

        # Get statuses and transitions
        statuses = list(
            workflow.statuses.all().values(
                "id", "name", "slug", "order",
                "is_start", "is_terminal", "color"
            )
        )
        
        transitions = list(
            workflow.transitions.all().values(
                "id", "from_status_id", "to_status_id"
            )
        )

        return Response({
            "workflow": {
                "id": workflow.id,
                "name": workflow.name,
                "project_id": workflow.project_id,
                "is_default": workflow.is_default,
                "is_active": workflow.is_active
            },
            "statuses": statuses,
            "transitions": transitions
        }, status=200)

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Set Default Workflow",
        operation_description="Mark a workflow as the organization's default",
        responses={200: "Workflow set as default"}
    )
    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        """Set this workflow as organization default"""
        workflow = self.get_object()
        
        with transaction.atomic():
            # Remove default flag from other workflows
            Workflow.objects.filter(
                organization=workflow.organization,
                is_default=True
            ).update(is_default=False)
            
            # Set this as default
            workflow.is_default = True
            workflow.save(update_fields=['is_default'])
        
        return Response(
            {"message": f"Workflow '{workflow.name}' is now the default"},
            status=200
        )

    @swagger_auto_schema(
        tags=["Kanban Workflow"],
        operation_summary="Assign Workflow to Project",
        operation_description="Assign this workflow to a specific project",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=["project_id"],
            properties={
                "project_id": openapi.Schema(type=openapi.TYPE_INTEGER, description="Project ID")
            }
        ),
        responses={200: "Workflow assigned to project"}
    )
    @action(detail=True, methods=["post"], url_path="assign-to-project")
    def assign_to_project(self, request, pk=None):
        """Assign workflow to a project"""
        workflow = self.get_object()
        project_id = request.data.get("project_id")
        
        if not project_id:
            return Response(
                {"error": "project_id is required"},
                status=400
            )
        
        project = get_object_or_404(
            Project,
            id=project_id,
            organization=workflow.organization
        )
        
        with transaction.atomic():
            # Remove workflow from other projects
            Workflow.objects.filter(project=project).update(project=None)
            
            # Assign to this project
            workflow.project = project
            workflow.save(update_fields=['project'])
        
        return Response(
            {"message": f"Workflow '{workflow.name}' assigned to project '{project.name}'"},
            status=200
        )