from django.db import models
from django.conf import settings
from workflows.models import WorkflowStatus
from projects.models import Project
from sprints.models import Sprint

User = settings.AUTH_USER_MODEL

class Issue(models.Model):

    ISSUE_TYPE_CHOICES = (
        ('TASK', 'Task'),
        ('BUG', 'Bug'),
        ('STORY', 'Story'),
    )

    PRIORITY_CHOICES = (
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
        ('CRITICAL', 'Critical'),
    )

    STATUS_CHOICES = (
        ('BACKLOG', 'Backlog'),
        ('TODO', 'To Do'),
        ('IN_PROGRESS', 'In Progress'),
        ('REVIEW', 'Review'),
        ('DONE', 'Done'),
    )

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='issues'
    )

    sprint = models.ForeignKey(
        Sprint,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='issues'
    )

    issue_key = models.CharField(max_length=20, unique=True)

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)

    issue_type = models.CharField(
        max_length=10,
        choices=ISSUE_TYPE_CHOICES
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default='MEDIUM'
    )


    workflow_status = models.ForeignKey(
        WorkflowStatus,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='issues'
    )

    assignee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_issues'
    )

    reporter = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='reported_issues'
    )

    due_date = models.DateField(null=True, blank=True)
    story_points = models.IntegerField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.issue_key

