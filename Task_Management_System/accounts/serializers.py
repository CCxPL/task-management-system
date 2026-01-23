from rest_framework import serializers
from django.contrib.auth import get_user_model
from organizations.models import Organization

User = get_user_model()

from rest_framework import serializers


class CreateOrgUserSerializer(serializers.Serializer):
    email = serializers.EmailField()
    role = serializers.ChoiceField(choices=["ADMIN", "MANAGER", "MEMBER"])
    username = serializers.CharField(required=False, allow_blank=True)

class OrganizationRegistrationSerializer(serializers.Serializer):
    # Organization
    org_name = serializers.CharField()
    org_type = serializers.ChoiceField(choices=Organization.ORG_TYPE_CHOICES)
    org_email = serializers.EmailField()
    org_phone = serializers.CharField()
    org_address = serializers.CharField(required=False, allow_blank=True)

    # Admin
    admin_email = serializers.EmailField()
    admin_name = serializers.CharField()

    def validate_admin_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Admin user already exists")
        return value
