from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.exceptions import PermissionDenied

from .models import Organization, OrganizationUser
from accounts.models import PasswordResetToken

User = get_user_model()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_organization(request):
    """
    SUPER ADMIN creates:
    - Organization
    - Admin user (linked to org)
    """

    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can create organization")

    org_data = request.data.get("organization")
    admin_data = request.data.get("admin")

    if not org_data or not admin_data:
        return Response({"error": "organization and admin data required"}, status=400)

    with transaction.atomic():

        # 1️⃣ Create Organization
        org = Organization.objects.create(
            name=org_data["name"],
            type=org_data["type"],
            email=org_data.get("email"),
            phone=org_data.get("phone"),
            domain=org_data.get("domain"),
            address=org_data.get("address"),
        )

        # 2️⃣ Create Admin User
        email = admin_data["email"].lower()
        username = admin_data.get("username") or email.split("@")[0]

        user = User.objects.create(
            email=email,
            username=username,
            is_active=True
        )

        # 3️⃣ Map Admin to Organization
        OrganizationUser.objects.create(
            user=user,
            organization=org,
            role="ADMIN"
        )

        # 4️⃣ Password setup token
        token = PasswordResetToken.generate(
            user=user,
            purpose="SET_PASSWORD",
            minutes=60
        )

    return Response(
        {
            "organization_id": org.id,
            "admin_user_id": user.id,
            "set_password_token": token.token
        },
        status=status.HTTP_201_CREATED
    )



