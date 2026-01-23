from django.urls import path, include
from rest_framework.permissions import AllowAny
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from django.contrib import admin
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
schema_view = get_schema_view(
    openapi.Info(
        title="Task Management System API",
        default_version='v1',
        description="""
Jira-like Task & Sprint Management System

• Multi-Organization
• Role-based access
• Custom Kanban workflows
• Secure & scalable
""",
        contact=openapi.Contact(email="tech@company.com"),
    ),
    public=True,
    permission_classes=[AllowAny],
)


urlpatterns = [
    path('admin/', admin.site.urls),

 # 🔐 AUTH (JWT)
    path("api/auth/login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/auth/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path('api/accounts/', include('accounts.urls')),
    path('api/common/', include('common.urls')),
    path('api/projects/', include('projects.urls')),
    path('api/sprints/', include('sprints.urls')),
    path('api/issues/', include('issues.urls')),
    path('api/timelogs/', include('timelogs.urls')),
    path('api/comments/', include('comments.urls')),
    path('api/reports/', include('reports.urls')),
    path("api/workflows/", include("workflows.urls")),
    path("api/organizations/", include("organizations.urls")),

    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0)),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0)),

]
