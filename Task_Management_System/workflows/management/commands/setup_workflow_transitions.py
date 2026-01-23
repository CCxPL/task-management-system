from django.core.management.base import BaseCommand
from workflows.models import Workflow, WorkflowStatus, WorkflowTransition
from organizations.models import Organization


class Command(BaseCommand):
    help = 'Setup default workflow with transitions'

    def handle(self, *args, **options):
        org = Organization.objects.first()
        
        if not org:
            self.stdout.write(self.style.ERROR('No organization found!'))
            return
        
        # Get or create workflow
        workflow, created = Workflow.objects.get_or_create(
            organization=org,
            name="Default Workflow",
            defaults={"is_active": True}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created workflow: {workflow.name}'))
        else:
            self.stdout.write(f'Found existing workflow: {workflow.name}')
        
        # Create statuses
        statuses_data = [
            {"name": "Backlog", "slug": "backlog", "order": 1, "is_start": True},
            {"name": "To Do", "slug": "to-do", "order": 2},
            {"name": "In Progress", "slug": "in-progress", "order": 3},
            {"name": "Review", "slug": "review", "order": 4},
            {"name": "Done", "slug": "done", "order": 5, "is_end": True},
        ]
        
        statuses = {}
        self.stdout.write('\n📊 Statuses:')
        for data in statuses_data:
            status, created = WorkflowStatus.objects.get_or_create(
                workflow=workflow,
                slug=data["slug"],
                defaults={
                    "name": data["name"],
                    "order": data["order"],
                    "is_start": data.get("is_start", False),
                    "is_end": data.get("is_end", False),
                }
            )
            statuses[data["slug"]] = status
            
            status_icon = '✅' if created else '⏭️ '
            self.stdout.write(f'  {status_icon} {status.slug}')
        
        # Create transitions
        transitions_data = [
            ("backlog", "to-do", "Move to To Do"),
            ("to-do", "in-progress", "Start work"),
            ("in-progress", "review", "Submit for review"),
            ("review", "done", "Approve and complete"),
            
            # Backward transitions
            ("review", "in-progress", "Send back for changes"),
            ("in-progress", "to-do", "Move back to To Do"),
            ("to-do", "backlog", "Move back to Backlog"),
        ]
        
        self.stdout.write('\n🔄 Transitions:')
        created_count = 0
        for from_slug, to_slug, description in transitions_data:
            transition, created = WorkflowTransition.objects.get_or_create(
                workflow=workflow,
                from_status=statuses[from_slug],
                to_status=statuses[to_slug],
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ {from_slug} → {to_slug}'))
            else:
                self.stdout.write(f'  ⏭️  {from_slug} → {to_slug}')
        
        # Summary
        total_transitions = WorkflowTransition.objects.filter(workflow=workflow).count()
        self.stdout.write(self.style.SUCCESS(f'\n✅ Setup complete!'))
        self.stdout.write(f'   Workflow: {workflow.name}')
        self.stdout.write(f'   Statuses: {len(statuses)}')
        self.stdout.write(f'   Transitions: {total_transitions} ({created_count} new)')
        self.stdout.write(self.style.SUCCESS('\n🎉 You can now drag & drop issues on Kanban board!'))
        