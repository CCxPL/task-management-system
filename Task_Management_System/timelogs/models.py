from django.db import models
from django.conf import settings
from issues.models import Issue

User = settings.AUTH_USER_MODEL

class TimeLog(models.Model):
    issue = models.ForeignKey(
        Issue,
        on_delete=models.CASCADE,
        related_name='time_logs'
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE
    )
    date = models.DateField()
    hours_spent = models.DecimalField(max_digits=5, decimal_places=2)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.issue.issue_key} - {self.hours_spent}h"
