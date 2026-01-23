from rest_framework import serializers
from django.utils.text import slugify
from .models import Workflow, WorkflowStatus, WorkflowTransition

# workflows/serializers.py

from organizations.models import OrganizationUser
from rest_framework import serializers
from django.utils.text import slugify
from .models import WorkflowStatus
from rest_framework import serializers
from organizations.models import OrganizationUser
from .models import Workflow

class WorkflowSerializer(serializers.ModelSerializer):

    class Meta:
        model = Workflow
        fields = ["id", "name"]   # ❗ organization removed from input

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

    class Meta:
        model = WorkflowStatus
        exclude = ('workflow',)
        # fields = [
        #     "id",
        #     "name",
        #     "order",
        #     "is_start",
        #     "is_terminal",
        #     "color",
        # ]

    def create(self, validated_data):
        workflow = validated_data["workflow"]
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
    class Meta:
        model = WorkflowTransition
        fields = ["id", "workflow", "from_status", "to_status", "created_at"]
        read_only_fields = ["workflow", "created_at"]
