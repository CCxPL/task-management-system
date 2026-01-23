from django.urls import path
from .views import register_organization

urlpatterns = [
    path("register/", register_organization),
]
