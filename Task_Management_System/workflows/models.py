from django.db import models
from django.conf import settings
from organizations.models import Organization
from projects.models import Project

User = settings.AUTH_USER_MODEL

class Workflow(models.Model):
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name="workflows")
    project = models.OneToOneField(Project, on_delete=models.CASCADE, null=True, blank=True, related_name="workflow")
    name = models.CharField(max_length=120)
    is_default = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="created_workflows")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["organization"],
                condition=models.Q(is_default=True),
                name="uniq_default_workflow_per_org",
            )
        ]

    def __str__(self):
        return self.name


class WorkflowStatus(models.Model):
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name="statuses")
    name = models.CharField(max_length=50)
    slug = models.SlugField(max_length=60)
    order = models.PositiveIntegerField()
    is_start = models.BooleanField(default=False)
    is_terminal = models.BooleanField(default=False)
    color = models.CharField(max_length=16, blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["order"]
        constraints = [
            models.UniqueConstraint(fields=["workflow", "slug"], name="uniq_status_slug_per_workflow"),
            models.UniqueConstraint(fields=["workflow", "order"], name="uniq_status_order_per_workflow"),
        ]

    def __str__(self):
        return f"{self.workflow_id}:{self.name}"


class WorkflowTransition(models.Model):
    workflow = models.ForeignKey(Workflow, on_delete=models.CASCADE, related_name="transitions")
    from_status = models.ForeignKey(WorkflowStatus, on_delete=models.CASCADE, related_name="outgoing_transitions")
    to_status = models.ForeignKey(WorkflowStatus, on_delete=models.CASCADE, related_name="incoming_transitions")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["workflow", "from_status", "to_status"], name="uniq_transition"),
        ]

    def __str__(self):
        return f"{self.from_status_id} -> {self.to_status_id}"
