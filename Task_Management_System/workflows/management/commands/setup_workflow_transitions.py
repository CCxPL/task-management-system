from django.core.management.base import BaseCommand
from workflows.models import Workflow, WorkflowStatus, WorkflowTransition
from organizations.models import Organization


class Command(BaseCommand):
    help = 'Setup default workflow with transitions for all organizations'

    def add_arguments(self, parser):
        parser.add_argument(
            '--org-id',
            type=int,
            help='Create workflow for specific organization ID',
        )

    def handle(self, *args, **options):
        org_id = options.get('org_id')
        
        if org_id:
            # Create for specific org
            try:
                org = Organization.objects.get(id=org_id)
                self.create_workflow_for_org(org)
            except Organization.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'❌ Organization with ID {org_id} not found!'))
        else:
            # Create for all orgs
            orgs = Organization.objects.all()
            
            if not orgs.exists():
                self.stdout.write(self.style.ERROR('❌ No organizations found!'))
                self.stdout.write('Please create an organization first.')
                return
            
            self.stdout.write(f'Found {orgs.count()} organization(s)\n')
            
            for org in orgs:
                self.stdout.write(self.style.SUCCESS(f'\n{'='*60}'))
                self.stdout.write(self.style.SUCCESS(f'🏢 Organization: {org.name}'))
                self.stdout.write(self.style.SUCCESS(f'{'='*60}'))
                self.create_workflow_for_org(org)

    def create_workflow_for_org(self, org):
        # Get or create workflow
        workflow, created = Workflow.objects.get_or_create(
            organization=org,
            name="Default Workflow",
            defaults={"is_active": True}
        )
        
        if created:
            self.stdout.write(self.style.SUCCESS(f'✅ Created workflow: {workflow.name}'))
        else:
            self.stdout.write(f'⏭️  Found existing workflow: {workflow.name}')
        
        # Create statuses
        statuses_data = [
            {"name": "Backlog", "slug": "backlog", "color": "#6B7280", "order": 1, "is_start": True, "is_terminal": False},
            {"name": "To Do", "slug": "to-do", "color": "#3B82F6", "order": 2, "is_start": False, "is_terminal": False},
            {"name": "In Progress", "slug": "in-progress", "color": "#F59E0B", "order": 3, "is_start": False, "is_terminal": False},
            {"name": "Review", "slug": "review", "color": "#8B5CF6", "order": 4, "is_start": False, "is_terminal": False},
            {"name": "Done", "slug": "done", "color": "#10B981", "order": 5, "is_start": False, "is_terminal": True},
        ]
        
        statuses = {}
        self.stdout.write('\n📊 Creating Statuses:')
        for data in statuses_data:
            status, created = WorkflowStatus.objects.get_or_create(
                workflow=workflow,
                slug=data["slug"],
                defaults={
                    "name": data["name"],
                    "color": data.get("color", "#6B7280"),
                    "order": data["order"],
                    "is_start": data.get("is_start", False),
                    "is_terminal": data.get("is_terminal", False),
                }
            )
            statuses[data["slug"]] = status
            
            status_icon = '✅' if created else '⏭️ '
            flags = []
            if status.is_start:
                flags.append('START')
            if status.is_terminal:
                flags.append('END')
            flags_str = f' [{", ".join(flags)}]' if flags else ''
            
            self.stdout.write(f'  {status_icon} {status.order}. {status.name} ({status.slug}){flags_str}')
        
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
        
        self.stdout.write('\n🔄 Creating Transitions:')
        created_count = 0
        for from_slug, to_slug in transitions_data:
            transition, created = WorkflowTransition.objects.get_or_create(
                workflow=workflow,
                from_status=statuses[from_slug],
                to_status=statuses[to_slug],
            )
            if created:
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'  ✅ {statuses[from_slug].name} → {statuses[to_slug].name}'))
            else:
                self.stdout.write(f'  ⏭️  {statuses[from_slug].name} → {statuses[to_slug].name}')
        
        # Summary
        total_transitions = WorkflowTransition.objects.filter(workflow=workflow).count()
        self.stdout.write(self.style.SUCCESS(f'\n🎉 Workflow setup complete!'))
        self.stdout.write(f'   Organization: {org.name}')
        self.stdout.write(f'   Workflow: {workflow.name}')
        self.stdout.write(f'   Statuses: {len(statuses)}')
        self.stdout.write(f'   Transitions: {total_transitions} ({created_count} new)')