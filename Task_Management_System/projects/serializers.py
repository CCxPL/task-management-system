# projects/serializers.py
from rest_framework import serializers
from .models import Project

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["name", "key", "description"]

    def validate_key(self, value):
        return value.upper()


class ProjectSerializer(serializers.ModelSerializer):
    """Full project details for listing"""
    created_by_username = serializers.CharField(
        source='created_by.username', 
        read_only=True,
        allow_null=True
    )
    
    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'key',
            'description',
            'organization',
            'is_active',
            'created_by',
            'created_by_username',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'created_by', 'organization']