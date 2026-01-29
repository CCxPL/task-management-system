from rest_framework import serializers
from .models import Project

class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ["name", "key", "description"]

    def validate_key(self, value):
        return value.upper()


class ProjectUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating projects"""
    class Meta:
        model = Project
        fields = ["name", "description", "is_active"]


class ProjectSerializer(serializers.ModelSerializer):
    """Full project details for listing"""
    created_by_username = serializers.CharField(
        source='created_by.username', 
        read_only=True,
        allow_null=True
    )
    project_lead = serializers.CharField(
        source='created_by.username',
        read_only=True,
        allow_null=True
    )
    status = serializers.SerializerMethodField()
    start_date = serializers.DateTimeField(source='created_at', read_only=True)
    end_date = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id',
            'name',
            'key',
            'description',
            'organization',
            'is_active',
            'status',
            'project_lead',
            'start_date',
            'end_date',
            'created_by',
            'created_by_username',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'created_by', 'organization']
    
    def get_status(self, obj):
        """Return project status based on is_active"""
        return "ACTIVE" if obj.is_active else "INACTIVE"
    
    def get_end_date(self, obj):
        """Mock end date - 30 days from start"""
        from datetime import timedelta
        return obj.created_at + timedelta(days=30)