from rest_framework import serializers
from django.utils.text import slugify
from organizations.models import OrganizationUser
from .models import Workflow, WorkflowStatus, WorkflowTransition


class WorkflowSerializer(serializers.ModelSerializer):
    # ✅ Add read-only fields for frontend
    statuses_count = serializers.SerializerMethodField()
    transitions_count = serializers.SerializerMethodField()
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = Workflow
        fields = [
            "id", 
            "name", 
            "is_default", 
            "is_active",
            "organization_name",  # ✅ For display
            "statuses_count",     # ✅ For dashboard
            "transitions_count",  # ✅ For dashboard
            "created_at",
            "updated_at"
        ]
        read_only_fields = ["created_at", "updated_at"]
    
    def get_statuses_count(self, obj):
        return obj.statuses.count()
    
    def get_transitions_count(self, obj):
        return obj.transitions.count()

    def create(self, validated_data):
        request = self.context["request"]

        org_user = OrganizationUser.objects.filter(
            user=request.user,
            is_active=True
        ).first()

        if not org_user:
            raise serializers.ValidationError("User is not part of any organization")

        validated_data["organization"] = org_user.organization
        validated_data["created_by"] = request.user

        return super().create(validated_data)


class WorkflowStatusSerializer(serializers.ModelSerializer):
    # ✅ Add helpful fields
    issues_count = serializers.SerializerMethodField()
    
    class Meta:
        model = WorkflowStatus
        fields = [
            "id",
            "name",
            "slug",
            "order",
            "is_start",
            "is_terminal",
            "color",
            "issues_count",  # ✅ Show how many issues in this status
            "created_at"
        ]
        read_only_fields = ["slug", "created_at"]  # ✅ slug is auto-generated
    
    def get_issues_count(self, obj):
        return obj.issues.count() if hasattr(obj, 'issues') else 0

    def create(self, validated_data):
        # Get workflow from context (set in view)
        workflow = self.context.get('workflow')
        if not workflow:
            raise serializers.ValidationError("Workflow context required")
        
        validated_data["workflow"] = workflow
        name = validated_data["name"]

        # 🔥 AUTO SLUG
        base_slug = slugify(name)
        slug = base_slug
        counter = 1

        while WorkflowStatus.objects.filter(
            workflow=workflow,
            slug=slug
        ).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1

        validated_data["slug"] = slug
        return super().create(validated_data)


class WorkflowTransitionSerializer(serializers.ModelSerializer):
    # ✅ Add readable names
    from_status_name = serializers.CharField(source='from_status.name', read_only=True)
    from_status_slug = serializers.CharField(source='from_status.slug', read_only=True)
    to_status_name = serializers.CharField(source='to_status.name', read_only=True)
    to_status_slug = serializers.CharField(source='to_status.slug', read_only=True)
    
    class Meta:
        model = WorkflowTransition
        fields = [
            "id", 
            "from_status", 
            "to_status",
            "from_status_name",   # ✅ For display
            "from_status_slug",   # ✅ For frontend matching
            "to_status_name",     # ✅ For display
            "to_status_slug",     # ✅ For frontend matching
            "created_at"
        ]
        read_only_fields = ["created_at"]