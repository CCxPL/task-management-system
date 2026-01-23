from rest_framework.routers import DefaultRouter
from .views import WorkflowViewSet

router = DefaultRouter()
router.register("workflows", WorkflowViewSet, basename="workflows")

urlpatterns = router.urls


