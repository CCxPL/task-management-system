from rest_framework import serializers
from .models import Issue
from django.contrib.auth import get_user_model

User = get_user_model()

from rest_framework import serializers
from .models import Issue
from django.contrib.auth import get_user_model

User = get_user_model()


from rest_framework import serializers
from .models import Issue
from django.contrib.auth import get_user_model

User = get_user_model()


class IssueSerializer(serializers.ModelSerializer):
    assignee_name = serializers.CharField(
        source="assignee.username", 
        read_only=True,
        allow_null=True
    )
    project_name = serializers.CharField(
        source="project.name", 
        read_only=True
    )
    
    # ✅ Custom status field - converts backend slug to frontend format
    status = serializers.SerializerMethodField()
    
    # ✅ Keep workflow_status for debugging
    workflow_status_slug = serializers.CharField(
        source="workflow_status.slug",
        read_only=True,
        allow_null=True
    )
    
    # ✅ Add assignee details
    assignee = serializers.SerializerMethodField()
    
    # ✅ Add reporter details
    reporter = serializers.SerializerMethodField()
    
    # ✅ Add sprint details
    sprint_name = serializers.CharField(
        source="sprint.name",
        read_only=True,
        allow_null=True
    )

    class Meta:
        model = Issue
        fields = [
            "id",
            "issue_key",
            "project",
            "project_name",
            "sprint",
            "sprint_name",
            "title",
            "description",
            "issue_type",
            "priority",
            "status",  # ✅ Frontend format (TO_DO, IN_PROGRESS, etc.)
            "workflow_status_slug",  # ✅ Backend format for debugging (to-do, in-progress, etc.)
            "assignee",
            "assignee_name",
            "reporter",
            "due_date",
            "story_points",
            "created_at",
        ]
        read_only_fields = ["id", "issue_key", "created_at"]
    
    def get_status(self, obj):
        """Convert backend workflow_status slug to frontend format"""
        if not obj.workflow_status:
            return "BACKLOG"  # Default

        # ✅ SLUG TO FRONTEND MAPPING
        SLUG_TO_FRONTEND = {
            "backlog": "BACKLOG",
            "to-do": "TO_DO",
            "todo": "TODO",
            "in-progress": "IN_PROGRESS",
            "review": "REVIEW",
            "done": "DONE",
        }

        frontend_status = SLUG_TO_FRONTEND.get(
            obj.workflow_status.slug,
            obj.workflow_status.slug.upper().replace('-', '_')
        )
        
        return frontend_status
    
    def get_assignee(self, obj):
        """Return assignee details"""
        if not obj.assignee:
            return None
        
        return {
            "id": obj.assignee.id,
            "username": obj.assignee.username,
            "email": obj.assignee.email,
        }
    
    def get_reporter(self, obj):
        """Return reporter details"""
        if not obj.reporter:
            return None
        
        return {
            "id": obj.reporter.id,
            "username": obj.reporter.username,
            "email": obj.reporter.email,
        }


# =============================
# ISSUE CREATE SERIALIZER
# =============================
class IssueCreateSerializer(serializers.Serializer):
    project = serializers.IntegerField()
    sprint = serializers.IntegerField(required=False, allow_null=True)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    issue_type = serializers.ChoiceField(choices=["TASK", "BUG", "STORY"])
    priority = serializers.ChoiceField(
        choices=["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        required=False,
        default="MEDIUM"
    )
    assignee = serializers.IntegerField(required=False, allow_null=True)
    due_date = serializers.DateField(required=False, allow_null=True)
    story_points = serializers.IntegerField(required=False, allow_null=True)
    status = serializers.ChoiceField(
        choices=["TO_DO", "IN_PROGRESS", "REVIEW", "DONE", "BACKLOG"],
        required=False,
        allow_null=True
    )