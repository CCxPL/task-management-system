# sprints/serializers.py
from rest_framework import serializers
from .models import Sprint

class SprintSerializer(serializers.ModelSerializer):
    # ✅ IMPORTANT: Declare status as SerializerMethodField
    status = serializers.SerializerMethodField()
    
    class Meta:
        model = Sprint
        fields = [
            "id",
            "name",
            "goal",
            "status",  # This will use get_status method
            "start_date",
            "end_date",
            "project",
            "created_at",
        ]
    
    # ✅ Method to uppercase status
    def get_status(self, obj):
        return obj.status.upper() if obj.status else 'PLANNING'


class SprintCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sprint
        fields = ["name", "goal", "start_date", "end_date"]