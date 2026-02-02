from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate, get_user_model
from rest_framework_simplejwt.tokens import RefreshToken
from organizations.models import OrganizationUser

User = get_user_model()


# ============================================================
# LOGIN (EMAIL / USERNAME BASED)
# ============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    """
    Unified login:
    - Super Admin
    - Organization users
    - Organization + user active checks
    """
    identifier = request.data.get('email') or request.data.get('username')
    password = request.data.get('password')

    if not identifier or not password:
        return Response(
            {'error': 'Email/Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # 🔐 Authenticate (username=email supported if AUTH configured)
    user = authenticate(request, username=identifier, password=password)

    if not user:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # ✅ User active check
    if not user.is_active:
        return Response(
            {'error': 'Account is inactive. Contact administrator.'},
            status=status.HTTP_403_FORBIDDEN
        )

    # ====================================================
    # SUPER ADMIN
    # ====================================================
    if user.is_superuser:
        role = 'SUPER_ADMIN'
        organization_id = None
        organization_name = None
        organization_type = None

    # ====================================================
    # ORGANIZATION USER
    # ====================================================
    else:
        try:
            org_user = OrganizationUser.objects.select_related(
                'organization'
            ).get(user=user)

            # ✅ OrgUser active
            if not org_user.is_active:
                return Response(
                    {'error': 'Your account has been deactivated.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            # ✅ Organization active
            if not org_user.organization.is_active:
                return Response(
                    {'error': 'Your organization is inactive.'},
                    status=status.HTTP_403_FORBIDDEN
                )

            role = org_user.role
            organization_id = org_user.organization.id
            organization_name = org_user.organization.name
            organization_type = org_user.organization.type

        except OrganizationUser.DoesNotExist:
            return Response(
                {'error': 'User not associated with any organization'},
                status=status.HTTP_403_FORBIDDEN
            )

    # ====================================================
    # TOKENS
    # ====================================================
    refresh = RefreshToken.for_user(user)

    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': role,
            'is_superuser': user.is_superuser,
            'organization_id': organization_id,
            'organization_name': organization_name,
            'organization_type': organization_type,
        }
    }, status=status.HTTP_200_OK)


# ============================================================
# GET CURRENT USER
# ============================================================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    user = request.user

    if user.is_superuser:
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': 'SUPER_ADMIN',
            'organization_id': None,
            'organization_name': None,
            'organization_type': None,
        })

    try:
        org_user = OrganizationUser.objects.select_related(
            'organization'
        ).get(user=user)

        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': org_user.role,
            'organization_id': org_user.organization.id,
            'organization_name': org_user.organization.name,
            'organization_type': org_user.organization.type,
        })

    except OrganizationUser.DoesNotExist:
        return Response(
            {'error': 'User not associated with any organization'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# LOGOUT
# ============================================================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get('refresh')
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()

        return Response({'message': 'Logged out successfully'})

    except Exception:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_400_BAD_REQUEST
        )


# ============================================================
# REFRESH TOKEN
# ============================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token(request):
    refresh = request.data.get('refresh')

    if not refresh:
        return Response(
            {'error': 'Refresh token required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        refresh_token = RefreshToken(refresh)
        return Response({
            'access': str(refresh_token.access_token)
        })

    except Exception:
        return Response(
            {'error': 'Invalid refresh token'},
            status=status.HTTP_401_UNAUTHORIZED
        )
