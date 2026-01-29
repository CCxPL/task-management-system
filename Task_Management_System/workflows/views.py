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
from .permissions import IsOrgAdminOrManager, CanViewWorkflow


class WorkflowViewSet(viewsets.ModelViewSet):
    """
    Complete Kanban Workflow Management
    - All members can VIEW workflows
    - Only Admin/Manager can CREATE/UPDATE/DELETE
    """
    serializer_class = WorkflowSerializer
    # ✅ CHANGED: Use CanViewWorkflow instead of IsOrgAdminOrManager
    permission_classes = [CanViewWorkflow]

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
        """Create workflow with default kanban statuses and transitions"""
        workflow = serializer.save()
        
        # Create default kanban statuses
        default_statuses = [
            {'name': 'Backlog', 'slug': 'backlog', 'order': 1, 'is_start': True, 'is_terminal': False, 'color': '#6B7280'},
            {'name': 'To Do', 'slug': 'to-do', 'order': 2, 'is_start': False, 'is_terminal': False, 'color': '#3B82F6'},
            {'name': 'In Progress', 'slug': 'in-progress', 'order': 3, 'is_start': False, 'is_terminal': False, 'color': '#F59E0B'},
            {'name': 'Review', 'slug': 'review', 'order': 4, 'is_start': False, 'is_terminal': False, 'color': '#8B5CF6'},
            {'name': 'Done', 'slug': 'done', 'order': 5, 'is_start': False, 'is_terminal': True, 'color': '#10B981'},
        ]
        
        created_statuses = []
        with transaction.atomic():
            for status_data in default_statuses:
                status = WorkflowStatus.objects.create(workflow=workflow, **status_data)
                created_statuses.append(status)
            
            # Auto-create ALL transitions
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
    # STATUS MANAGEMENT
    # ============================================================

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

        while WorkflowStatus.objects.filter(workflow=workflow, slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        with transaction.atomic():
            if is_start:
                WorkflowStatus.objects.filter(workflow=workflow, is_start=True).update(is_start=False)
            if is_terminal:
                WorkflowStatus.objects.filter(workflow=workflow, is_terminal=True).update(is_terminal=False)

            status_obj = WorkflowStatus.objects.create(
                workflow=workflow,
                name=name,
                slug=slug,
                order=order,
                is_start=is_start,
                is_terminal=is_terminal,
                color=color
            )

        return Response(WorkflowStatusSerializer(status_obj).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["get"], url_path="statuses/list")
    def list_statuses(self, request, pk=None):
        """List all statuses for workflow"""
        workflow = self.get_object()
        statuses = workflow.statuses.all().order_by('order')
        serializer = WorkflowStatusSerializer(statuses, many=True)
        return Response(serializer.data, status=200)

    @action(detail=True, methods=["patch"], url_path="statuses/(?P<status_id>[^/.]+)")
    def update_status(self, request, pk=None, status_id=None):
        """Update a status"""
        workflow = self.get_object()
        status_obj = get_object_or_404(WorkflowStatus, id=status_id, workflow=workflow)
        
        serializer = WorkflowStatusSerializer(status_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        
        with transaction.atomic():
            if serializer.validated_data.get('is_start'):
                WorkflowStatus.objects.filter(workflow=workflow, is_start=True).exclude(id=status_id).update(is_start=False)
            if serializer.validated_data.get('is_terminal'):
                WorkflowStatus.objects.filter(workflow=workflow, is_terminal=True).exclude(id=status_id).update(is_terminal=False)
            serializer.save()
        
        return Response(serializer.data, status=200)

    @action(detail=True, methods=["delete"], url_path="statuses/(?P<status_id>[^/.]+)/delete")
    def delete_status(self, request, pk=None, status_id=None):
        """Delete a status"""
        workflow = self.get_object()
        status_obj = get_object_or_404(WorkflowStatus, id=status_id, workflow=workflow)
        
        if status_obj.issues.exists():
            return Response({"error": "Cannot delete status that has issues assigned to it"}, status=400)
        
        status_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["patch"], url_path="statuses/reorder")
    def reorder_statuses(self, request, pk=None):
        """Reorder workflow statuses - FIXED for CHECK constraint"""
        workflow = self.get_object()
        order_list = request.data.get("order")

        print(f"🔄 Reorder request received: {order_list}")

        if not isinstance(order_list, list) or not order_list:
            return Response({"error": "order must be a non-empty list of status IDs"}, status=400)

        statuses = WorkflowStatus.objects.filter(workflow=workflow, id__in=order_list)

        if statuses.count() != len(order_list):
            return Response({"error": "One or more status IDs are invalid"}, status=400)

        try:
            with transaction.atomic():
                # ✅ Step 1: Set all to large temporary values (1000+) to avoid conflicts
                print("📥 Step 1: Setting temporary large values...")
                for idx, status_id in enumerate(order_list):
                    temp_order = 1000 + idx  # Start from 1000 to avoid conflicts
                    WorkflowStatus.objects.filter(
                        id=status_id,
                        workflow=workflow
                    ).update(order=temp_order)
                
                # ✅ Step 2: Set actual order values
                print("📥 Step 2: Setting final order values...")
                for index, status_id in enumerate(order_list, start=1):
                    WorkflowStatus.objects.filter(
                        id=status_id,
                        workflow=workflow
                    ).update(order=index)
                
                print("✅ Reorder completed successfully")

            return Response({"message": "Statuses reordered successfully"}, status=200)
        
        except Exception as e:
            print(f"❌ Error during reorder: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response({"error": f"Failed to reorder: {str(e)}"}, status=500)

    # ============================================================
    # TRANSITION MANAGEMENT
    # ============================================================

    @action(detail=True, methods=["post"], url_path="transitions")
    def add_transition(self, request, pk=None):
        """Add a new transition"""
        workflow = self.get_object()
        from_id = request.data.get("from_status")
        to_id = request.data.get("to_status")

        if not from_id or not to_id:
            return Response({"error": "from_status and to_status are required"}, status=400)

        from_status = get_object_or_404(WorkflowStatus, workflow=workflow, id=from_id)
        to_status = get_object_or_404(WorkflowStatus, workflow=workflow, id=to_id)

        if from_status.id == to_status.id:
            return Response({"error": "Cannot create self-transition"}, status=400)

        transition, created = WorkflowTransition.objects.get_or_create(
            workflow=workflow,
            from_status=from_status,
            to_status=to_status
        )

        return Response(
            WorkflowTransitionSerializer(transition).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )

    @action(detail=True, methods=["get"], url_path="transitions/list")
    def list_transitions(self, request, pk=None):
        """List all transitions for workflow"""
        workflow = self.get_object()
        transitions = workflow.transitions.all().select_related('from_status', 'to_status')
        serializer = WorkflowTransitionSerializer(transitions, many=True)
        return Response(serializer.data, status=200)

    @action(detail=True, methods=["delete"], url_path="transitions/(?P<transition_id>[^/.]+)/delete")
    def delete_transition(self, request, pk=None, transition_id=None):
        """Delete a transition"""
        workflow = self.get_object()
        transition = get_object_or_404(WorkflowTransition, id=transition_id, workflow=workflow)
        transition.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=["post"], url_path="transitions/auto-create")
    def auto_create_transitions(self, request, pk=None):
        """Auto-create all possible transitions"""
        workflow = self.get_object()
        statuses = list(workflow.statuses.all())
        
        if len(statuses) < 2:
            return Response({"error": "Workflow needs at least 2 statuses"}, status=400)
        
        created_count = 0
        
        with transaction.atomic():
            for from_status in statuses:
                for to_status in statuses:
                    if from_status.id == to_status.id:
                        continue
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
    # WORKFLOW RESOLUTION
    # ============================================================

    @action(detail=False, methods=["get"], url_path="resolve")
    def resolve(self, request):
        """Resolve workflow for a project"""
        project_id = request.query_params.get("project")
        
        if not project_id:
            return Response({"error": "project query param is required"}, status=400)

        org_user = get_active_org_user(request.user)
        if not org_user:
            raise PermissionDenied("User not part of any organization")

        org = org_user.organization
        project = get_object_or_404(Project, id=project_id, organization=org)

        workflow = getattr(project, "workflow", None)
        if not workflow:
            workflow = Workflow.objects.filter(organization=org, is_default=True, is_active=True).first()

        if not workflow:
            return Response({"error": "No workflow configured"}, status=404)

        statuses = list(workflow.statuses.all().values("id", "name", "slug", "order", "is_start", "is_terminal", "color"))
        transitions = list(workflow.transitions.all().values("id", "from_status_id", "to_status_id"))

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

    @action(detail=True, methods=["post"], url_path="set-default")
    def set_default(self, request, pk=None):
        """Set workflow as organization default"""
        workflow = self.get_object()
        
        with transaction.atomic():
            Workflow.objects.filter(organization=workflow.organization, is_default=True).update(is_default=False)
            workflow.is_default = True
            workflow.save(update_fields=['is_default'])
        
        return Response({"message": f"Workflow '{workflow.name}' is now the default"}, status=200)

    @action(detail=True, methods=["post"], url_path="assign-to-project")
    def assign_to_project(self, request, pk=None):
        """Assign workflow to a project"""
        workflow = self.get_object()
        project_id = request.data.get("project_id")
        
        if not project_id:
            return Response({"error": "project_id is required"}, status=400)
        
        project = get_object_or_404(Project, id=project_id, organization=workflow.organization)
        
        with transaction.atomic():
            Workflow.objects.filter(project=project).update(project=None)
            workflow.project = project
            workflow.save(update_fields=['project'])
        
        return Response({"message": f"Workflow '{workflow.name}' assigned to project '{project.name}'"}, status=200)