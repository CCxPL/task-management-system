from django.db import models
from projects.models import Project
from django.conf import settings
from django.core.exceptions import ValidationError
User = settings.AUTH_USER_MODEL

# sprints/models.py
from django.db import models
from projects.models import Project

class Sprint(models.Model):
    STATUS_CHOICES = (
        ("PLANNED", "Planned"),
        ("ACTIVE", "Active"),
        ("COMPLETED", "Completed"),
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name="sprints"
    )
    name = models.CharField(max_length=100)
    goal = models.TextField(blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PLANNED"
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.project.name} - {self.name}"



def clean(self):
    if self.is_active:
        active_exists = Sprint.objects.filter(
            project=self.project,
            is_active=True
        ).exclude(id=self.id).exists()

        if active_exists:
            raise ValidationError(
                "Only one active sprint is allowed per project."
            )
