from urllib import request
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.utils import timezone
from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from organizations.models import OrganizationUser
from .models import PasswordResetToken
from .serializers import CreateOrgUserSerializer
from rest_framework.permissions import AllowAny

from organizations.models import OrganizationUser
from .models import PasswordResetToken
from .serializers import CreateOrgUserSerializer

User = get_user_model()


def _require_org_admin_or_manager(user):
    if user.is_superuser:
        raise PermissionDenied("Super Admin cannot manage org users via app APIs")

    org_user = user.org_memberships.filter(is_active=True).first()
    if not org_user or org_user.role not in ["ADMIN", "MANAGER"]:
        raise PermissionDenied("Only Admin/Manager can manage users")

    return org_user


from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from organizations.models import OrganizationUser

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    user = request.user

    org_user = (
        OrganizationUser.objects
        .select_related("organization")
        .filter(user=user, is_active=True)
        .first()
    )

    if not org_user:
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": None,
            "organization": None
        })

    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": org_user.role,
        "organization": {
            "id": org_user.organization.id,
            "name": org_user.organization.name,
            "type": org_user.organization.type
        }
    })


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_org_user(request):
    org_user = _require_org_admin_or_manager(request.user)
    org = org_user.organization

    serializer = CreateOrgUserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower().strip()
    role = serializer.validated_data["role"]
    username = serializer.validated_data.get("username") or email.split("@")[0]

    user, created = User.objects.get_or_create(
        email=email,
        defaults={"username": username, "is_active": True},
    )

    existing_map = OrganizationUser.objects.filter(user=user).first()
    if existing_map and existing_map.organization_id != org.id:
        return Response(
            {"error": "User already belongs to another organization."},
            status=status.HTTP_400_BAD_REQUEST
        )

    org_user_obj, _ = OrganizationUser.objects.get_or_create(
        user=user,
        organization=org,
        defaults={"role": role},
    )

    if org_user_obj.role != role:
        org_user_obj.role = role
        org_user_obj.save(update_fields=["role"])

    token_obj = PasswordResetToken.generate(
        user=user, purpose="SET_PASSWORD", minutes=60
    )

    return Response(
        {
            "user_id": user.id,
            "email": user.email,
            "organization": org.id,
            "role": org_user_obj.role,
            "set_password_token": token_obj.token,
            "expires_at": token_obj.expires_at,
        },
        status=status.HTTP_201_CREATED
    )


@api_view(["POST"])
@permission_classes([AllowAny]) 
def set_password(request):
    """
    User sets password for the first time using token.
    """
    token = request.data.get("token")
    password = request.data.get("password")

    if not token or not password:
        return Response({"error": "token and password are required"}, status=400)

    token_obj = PasswordResetToken.objects.filter(token=token, purpose="SET_PASSWORD").select_related("user").first()
    if not token_obj or not token_obj.is_valid():
        return Response({"error": "Invalid or expired token"}, status=400)

    try:
        validate_password(password, token_obj.user)
    except ValidationError as e:
        return Response({"error": "Weak password", "details": e.messages}, status=400)

    user = token_obj.user
    user.set_password(password)
    user.save(update_fields=["password"])

    token_obj.used = True
    token_obj.save(update_fields=["used"])

    return Response({"message": "Password set successfully"}, status=200)


@api_view(["POST"])
@permission_classes([AllowAny]) 
def request_password_reset(request):
    """
    Request reset token (email will be integrated later).
    """
    email = (request.data.get("email") or "").lower().strip()
    if not email:
        return Response({"error": "email is required"}, status=400)

    user = User.objects.filter(email=email).first()

    # security: don't reveal whether user exists
    if not user:
        return Response({"message": "If the account exists, reset instructions will be sent."}, status=200)

    token_obj = PasswordResetToken.generate(user=user, purpose="RESET_PASSWORD", minutes=30)

    # Return token for now (email later)
    return Response(
        {"reset_token": token_obj.token, "expires_at": token_obj.expires_at},
        status=200
    )

# accounts/views.py

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_organization_members(request):
    """List all members in user's organization"""
    user = request.user
    
    # Get user's org membership
    org_user = OrganizationUser.objects.filter(
        user=user,
        is_active=True
    ).select_related('organization').first()
    
    if not org_user:
        return Response(
            {"error": "Not part of any organization"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Get all members in the same organization
    members = OrganizationUser.objects.filter(
        organization=org_user.organization,
        is_active=True
    ).select_related('user', 'organization')
    
    # ✅ Format response
    data = [
        {
            "id": member.id,
            "user_id": member.user.id,
            "name": member.user.username,
            "username": member.user.username,
            "email": member.user.email,
            "role": member.role,
            "is_active": member.is_active,
            # "created_at": member.created_at,
        }
        for member in members
    ]
    
    return Response(data, status=status.HTTP_200_OK)

@api_view(["POST"])
@permission_classes([AllowAny]) 
def reset_password(request):
    """
    Reset password using reset token.
    """
    token = request.data.get("token")
    password = request.data.get("password")
    if not token or not password:
        return Response({"error": "token and password are required"}, status=400)

    token_obj = PasswordResetToken.objects.filter(token=token, purpose="RESET_PASSWORD").select_related("user").first()
    if not token_obj or not token_obj.is_valid():
        return Response({"error": "Invalid or expired token"}, status=400)

    try:
        validate_password(password, token_obj.user)
    except ValidationError as e:
        return Response({"error": "Weak password", "details": e.messages}, status=400)

    user = token_obj.user
    user.set_password(password)
    user.save(update_fields=["password"])

    token_obj.used = True
    token_obj.save(update_fields=["used"])

    return Response({"message": "Password reset successfully"}, status=200)
