from django.db.models.signals import post_save
from django.dispatch import receiver
from organizations.models import Organization
from .models import Workflow, WorkflowStatus, WorkflowTransition


@receiver(post_save, sender=Organization)
def create_default_workflow(sender, instance, created, **kwargs):
    """
    Auto-create default workflow when a new organization is created
    """
    if created:  # Only for newly created organizations
        print(f'📋 Auto-creating workflow for: {instance.name}')
        
        # Create workflow
        workflow = Workflow.objects.create(
            organization=instance,
            name="Default Workflow",
            is_active=True
        )
        
        # Create statuses
        statuses_data = [
            {"name": "Backlog", "slug": "backlog", "color": "#6B7280", "order": 1, "is_start": True, "is_terminal": False},
            {"name": "To Do", "slug": "to-do", "color": "#3B82F6", "order": 2, "is_start": False, "is_terminal": False},
            {"name": "In Progress", "slug": "in-progress", "color": "#F59E0B", "order": 3, "is_start": False, "is_terminal": False},
            {"name": "Review", "slug": "review", "color": "#8B5CF6", "order": 4, "is_start": False, "is_terminal": False},
            {"name": "Done", "slug": "done", "color": "#10B981", "order": 5, "is_start": False, "is_terminal": True},
        ]
        
        statuses = {}
        for data in statuses_data:
            status = WorkflowStatus.objects.create(
                workflow=workflow,
                name=data["name"],
                slug=data["slug"],
                color=data["color"],
                order=data["order"],
                is_start=data["is_start"],
                is_terminal=data["is_terminal"],
            )
            statuses[data["slug"]] = status
        
        # Create transitions
        transitions_data = [
            ("backlog", "to-do"),
            ("to-do", "in-progress"),
            ("in-progress", "review"),
            ("review", "done"),
            ("review", "in-progress"),
            ("in-progress", "to-do"),
            ("to-do", "backlog"),
            ("backlog", "in-progress"),
            ("in-progress", "done"),
        ]
        
        for from_slug, to_slug in transitions_data:
            WorkflowTransition.objects.create(
                workflow=workflow,
                from_status=statuses[from_slug],
                to_status=statuses[to_slug],
            )
        
        print(f'✅ Workflow created for {instance.name}: {len(statuses)} statuses, {len(transitions_data)} transitions')