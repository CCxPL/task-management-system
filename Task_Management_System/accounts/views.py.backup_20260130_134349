from urllib import request
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.hashers import make_password  # ✅ ADD THIS
from django.utils import timezone
from django.core.exceptions import PermissionDenied, ValidationError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    """
    Get current authenticated user with role and organization info
    Works for both Django superusers and organization users
    """
    user = request.user
    
    print(f'📥 /me endpoint called for user: {user.username}')
    print(f'🔍 Is Django superuser: {user.is_superuser}')
    
    # ✅ DJANGO SUPERUSER - Return immediately
    if user.is_superuser:
        print(f'✅ Django Superuser detected: {user.username}')
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": "SUPER_ADMIN",  # ✅ Hard-coded SUPER_ADMIN role
            "is_superuser": True,
            "organization": None
        })

    # ✅ ORGANIZATION USER - Check membership
    org_user = (
        OrganizationUser.objects
        .select_related("organization")
        .filter(user=user, is_active=True)
        .first()
    )

    if not org_user:
        print(f'⚠️ Regular user {user.username} not part of any organization')
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": None,
            "is_superuser": False,
            "organization": None
        })
    
    print(f'✅ Organization user: {user.username} - Role: {org_user.role}')
    
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "role": org_user.role,
        "is_superuser": False,
        "organization": {
            "id": org_user.organization.id,
            "name": org_user.organization.name,
            "type": org_user.organization.type
        }
    })


# ✅ UPDATED: Add password parameter
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_org_user(request):
    """Create organization user with password"""
    org_user = _require_org_admin_or_manager(request.user)
    org = org_user.organization

    # ✅ Get password from request
    password = request.data.get("password")
    
    serializer = CreateOrgUserSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)

    email = serializer.validated_data["email"].lower().strip()
    role = serializer.validated_data["role"]
    username = serializer.validated_data.get("username") or email.split("@")[0]

    # ✅ Check if user already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {"error": "User with this email already exists"},
            status=status.HTTP_400_BAD_REQUEST
        )

    # ✅ Validate password if provided
    if password:
        try:
            # Create temporary user for validation
            temp_user = User(username=username, email=email)
            validate_password(password, temp_user)
        except ValidationError as e:
            return Response(
                {"error": "Weak password", "details": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

    # ✅ Create user with password
    if password:
        user = User.objects.create(
            email=email,
            username=username,
            password=make_password(password),  # ✅ Hash password
            is_active=True
        )
        print(f"✅ Created user with password: {email}")
    else:
        # Create user without password (will use token setup)
        user = User.objects.create(
            email=email,
            username=username,
            is_active=True
        )
        print(f"✅ Created user without password: {email}")

    # Check if user already in another org
    existing_map = OrganizationUser.objects.filter(user=user).first()
    if existing_map and existing_map.organization_id != org.id:
        user.delete()  # Rollback user creation
        return Response(
            {"error": "User already belongs to another organization."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Create org membership
    org_user_obj, _ = OrganizationUser.objects.get_or_create(
        user=user,
        organization=org,
        defaults={"role": role},
    )

    if org_user_obj.role != role:
        org_user_obj.role = role
        org_user_obj.save(update_fields=["role"])

    # ✅ Generate token only if no password provided
    if not password:
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
    else:
        # ✅ Return credentials if password was set
        return Response(
            {
                "user_id": user.id,
                "email": user.email,
                "username": user.username,
                "organization": org.id,
                "role": org_user_obj.role,
                "credentials": {
                    "email": email,
                    "password": password  # Return for admin to share
                }
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
        }
        for member in members
    ]
    
    print(f"✅ Found {len(data)} members in organization: {org_user.organization.name}")
    
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


# ✅ UPDATE TEAM MEMBER
@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_org_user(request, user_id):
    """
    Update organization user details
    PATCH /api/accounts/team/<user_id>/
    """
    org_user = _require_org_admin_or_manager(request.user)
    
    # Get target organization user
    target_org_user = OrganizationUser.objects.filter(
        id=user_id,
        organization=org_user.organization,
        is_active=True
    ).select_related('user').first()
    
    if not target_org_user:
        return Response(
            {"error": "User not found in your organization"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Update username
    if "username" in request.data:
        username = request.data["username"].strip()
        if username:
            # Check if username is taken by another user
            if User.objects.filter(username=username).exclude(id=target_org_user.user.id).exists():
                return Response(
                    {"error": "Username already taken"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            target_org_user.user.username = username
            target_org_user.user.save(update_fields=["username"])
            print(f"✅ Updated username: {username}")
    
    # Update role
    if "role" in request.data:
        role = request.data["role"]
        if role in ["ADMIN", "MANAGER", "MEMBER", "STUDENT", "TEACHER"]:
            target_org_user.role = role
            target_org_user.save(update_fields=["role"])
            print(f"✅ Updated role: {role}")
        else:
            return Response(
                {"error": "Invalid role"},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    # Update password (optional)
    if "password" in request.data and request.data["password"]:
        password = request.data["password"]
        try:
            validate_password(password, target_org_user.user)
            target_org_user.user.set_password(password)
            target_org_user.user.save(update_fields=["password"])
            print(f"✅ Updated password for: {target_org_user.user.username}")
        except ValidationError as e:
            return Response(
                {"error": "Weak password", "details": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    print(f"✅ User updated: {target_org_user.user.username}")
    
    return Response({
        "id": target_org_user.id,
        "user_id": target_org_user.user.id,
        "name": target_org_user.user.username,
        "username": target_org_user.user.username,
        "email": target_org_user.user.email,
        "role": target_org_user.role,
        "is_active": target_org_user.is_active,
    }, status=status.HTTP_200_OK)


# ✅ DELETE TEAM MEMBER (Soft Delete)
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_org_user(request, user_id):
    """
    Soft delete organization user
    DELETE /api/accounts/team/<user_id>/delete/
    """
    org_user = _require_org_admin_or_manager(request.user)
    
    # Only ADMIN can delete (not MANAGER)
    if org_user.role not in ["ADMIN", "ORG_ADMIN"]:
        return Response(
            {"error": "Only Admin can delete members"},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Get target organization user
    target_org_user = OrganizationUser.objects.filter(
        id=user_id,
        organization=org_user.organization,
        is_active=True
    ).select_related('user').first()
    
    if not target_org_user:
        return Response(
            {"error": "User not found in your organization"},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Prevent self-deletion
    if target_org_user.user.id == request.user.id:
        return Response(
            {"error": "Cannot delete yourself"},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Soft delete
    target_org_user.is_active = False
    target_org_user.save(update_fields=['is_active'])
    
    print(f"🗑️  User soft-deleted: {target_org_user.user.username}")
    
    return Response(
        {"message": f"User '{target_org_user.user.username}' deleted successfully"},
        status=status.HTTP_200_OK
    )