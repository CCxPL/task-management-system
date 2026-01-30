from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from organizations.models import OrganizationUser

@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    """Custom login with role detection"""
    username = request.data.get('username')
    password = request.data.get('password')
    
    if not username or not password:
        return Response(
            {'error': 'Username and password required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    user = authenticate(username=username, password=password)
    
    if not user:
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not user.is_active:
        return Response(
            {'error': 'Account is disabled'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Generate tokens
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    refresh_token = str(refresh)
    
    # ✅ DJANGO SUPERUSER
    if user.is_superuser:
        role = 'SUPER_ADMIN'
        organization = None
        print(f'🔑 Django Superuser login: {user.username}')
        print(f'🎭 Role: {role}')
        
    else:
        # ✅ ORGANIZATION USER
        org_user = OrganizationUser.objects.filter(
            user=user,
            is_active=True
        ).select_related('organization').first()
        
        if not org_user:
            return Response(
                {'error': 'User not associated with any active organization'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if not org_user.organization.is_active:
            return Response(
                {'error': 'Organization is inactive'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        role = org_user.role
        organization = {
            'id': org_user.organization.id,
            'name': org_user.organization.name,
            'type': org_user.organization.type,
        }
        print(f'🔑 Organization user login: {user.username}')
        print(f'🎭 Role: {role}')
        print(f'🏢 Organization: {organization["name"]}')
    
    # ✅ Build user data
    user_data = {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'role': role,  # ✅ Always present
        'is_superuser': user.is_superuser,
        'organization': organization,
    }
    
    print(f'✅ Login successful - User data: {user_data}')
    
    return Response({
        'access': access_token,
        'refresh': refresh_token,
        'user': user_data,
    }, status=status.HTTP_200_OK)