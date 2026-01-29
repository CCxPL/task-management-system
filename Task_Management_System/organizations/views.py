from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model
from django.db import transaction
from django.core.exceptions import PermissionDenied
from django.contrib.auth.hashers import make_password
import secrets
import string

from .models import Organization, OrganizationUser
from accounts.models import PasswordResetToken

User = get_user_model()


# ============================================================
# SUPER ADMIN - ORGANIZATION MANAGEMENT
# ============================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_organizations(request):
    """
    List all organizations with stats (Super Admin only)
    """
    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can view all organizations")
    
    orgs = Organization.objects.all().order_by('-created_at')
    
    data = []
    for org in orgs:
        admins_count = OrganizationUser.objects.filter(
            organization=org,
            role='ADMIN'
        ).count()
        
        members_count = OrganizationUser.objects.filter(
            organization=org
        ).count()
        
        data.append({
            'id': org.id,
            'name': org.name,
            'type': org.type,
            'status': 'ACTIVE' if org.is_active else 'INACTIVE',
            'email': org.email,
            'phone': org.phone,
            'domain': org.domain,
            'address': org.address,
            'admins': admins_count,
            'members': members_count,
            'created_at': org.created_at.isoformat() if org.created_at else None,
        })
    
    return Response(data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_organization_with_admin(request):
    """
    Create organization and admin user in one call
    
    Request body:
    {
        "organization": {
            "name": "Acme Corporation",
            "type": "COMPANY",
            "email": "info@acme.com",
            "phone": "+1234567890",
            "domain": "acme.com",
            "address": "123 Main St"
        },
        "admin": {
            "username": "admin",
            "email": "admin@acme.com",
            "password": "SecurePass123!"  // Optional, will generate if not provided
        }
    }
    """
    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can create organizations")
    
    org_data = request.data.get("organization")
    admin_data = request.data.get("admin")
    
    if not org_data or not admin_data:
        return Response({
            "error": "organization and admin data required"
        }, status=400)
    
    # Validation
    if not org_data.get("name"):
        return Response({"error": "Organization name is required"}, status=400)
    
    if not admin_data.get("email"):
        return Response({"error": "Admin email is required"}, status=400)
    
    # Generate password if not provided
    admin_password = admin_data.get("password")
    if not admin_password:
        alphabet = string.ascii_letters + string.digits + '!@#$%^&*()'
        admin_password = ''.join(secrets.choice(alphabet) for i in range(12))
    
    try:
        with transaction.atomic():
            # 1️⃣ Create Organization
            org = Organization.objects.create(
                name=org_data["name"],
                type=org_data.get("type", "COMPANY"),
                email=org_data.get("email", ""),
                phone=org_data.get("phone", ""),
                domain=org_data.get("domain", ""),
                address=org_data.get("address", ""),
                is_active=True  # ✅ Active by default
            )
            
            # 2️⃣ Create Admin User
            email = admin_data["email"].lower()
            username = admin_data.get("username") or email.split("@")[0]
            
            # Check if user exists
            if User.objects.filter(email=email).exists():
                return Response({
                    "error": f"User with email {email} already exists"
                }, status=400)
            
            if User.objects.filter(username=username).exists():
                # Generate unique username
                base_username = username
                counter = 1
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
            
            user = User.objects.create(
                email=email,
                username=username,
                password=make_password(admin_password),
                is_active=True
            )
            
            # 3️⃣ Create OrganizationUser
            OrganizationUser.objects.create(
                user=user,
                organization=org,
                role="ADMIN",
                is_active=True
            )
            
            return Response({
                "message": "Organization and admin created successfully",
                "organization": {
                    "id": org.id,
                    "name": org.name,
                    "type": org.type,
                    "status": "ACTIVE" if org.is_active else "INACTIVE"
                },
                "admin_credentials": {
                    "username": username,
                    "email": email,
                    "password": admin_password  # ✅ Return for one-time display
                }
            }, status=201)
            
    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)


@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
def update_organization(request, org_id):
    """
    Update organization details
    """
    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can update organizations")
    
    try:
        org = Organization.objects.get(pk=org_id)
    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=404)
    
    # Update fields
    if 'name' in request.data:
        org.name = request.data['name']
    
    if 'type' in request.data:
        org.type = request.data['type']
    
    if 'email' in request.data:
        org.email = request.data['email']
    
    if 'phone' in request.data:
        org.phone = request.data['phone']
    
    if 'domain' in request.data:
        org.domain = request.data['domain']
    
    if 'address' in request.data:
        org.address = request.data['address']
    
    # ✅ Handle status change
    if 'status' in request.data:
        new_status = request.data['status']
        is_active = (new_status == 'ACTIVE')
        org.is_active = is_active
        
        # ✅ Sync all organization users (admins and members)
        OrganizationUser.objects.filter(
            organization=org
        ).update(is_active=is_active)
    
    org.save()
    
    return Response({
        "message": "Organization updated successfully",
        "organization": {
            "id": org.id,
            "name": org.name,
            "type": org.type,
            "status": "ACTIVE" if org.is_active else "INACTIVE",
            "email": org.email,
            "phone": org.phone,
            "domain": org.domain,
            "address": org.address
        }
    })


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_organization(request, org_id):
    """
    Delete organization and all associated data
    """
    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can delete organizations")
    
    try:
        org = Organization.objects.get(pk=org_id)
        org_name = org.name
        
        # ✅ This will cascade delete OrganizationUser, Projects, etc.
        org.delete()
        
        return Response({
            "message": f"Organization '{org_name}' deleted successfully"
        })
        
    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=404)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def toggle_organization_status(request, org_id):
    """
    Toggle organization active/inactive status
    """
    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can change organization status")
    
    try:
        org = Organization.objects.get(pk=org_id)
        
        # Toggle status
        org.is_active = not org.is_active
        org.save()
        
        # ✅ Sync all users
        OrganizationUser.objects.filter(
            organization=org
        ).update(is_active=org.is_active)
        
        return Response({
            "message": f"Organization {'activated' if org.is_active else 'deactivated'} successfully",
            "status": "ACTIVE" if org.is_active else "INACTIVE"
        })
        
    except Organization.DoesNotExist:
        return Response({"error": "Organization not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def organization_stats(request):
    """
    Get super admin dashboard stats
    """
    if not request.user.is_superuser:
        raise PermissionDenied("Only Super Admin can view stats")
    
    total_orgs = Organization.objects.count()
    active_orgs = Organization.objects.filter(is_active=True).count()
    inactive_orgs = total_orgs - active_orgs
    
    total_admins = OrganizationUser.objects.filter(role='ADMIN').count()
    total_members = OrganizationUser.objects.count()
    
    # By type
    companies = Organization.objects.filter(type='COMPANY').count()
    institutes = Organization.objects.filter(type='INSTITUTE').count()
    
    return Response({
        "total_organizations": total_orgs,
        "active_organizations": active_orgs,
        "inactive_organizations": inactive_orgs,
        "total_admins": total_admins,
        "total_members": total_members,
        "by_type": {
            "COMPANY": companies,
            "INSTITUTE": institutes,
        }
    })


# ============================================================
# LEGACY (Keep for backward compatibility)
# ============================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def register_organization(request):
    """
    LEGACY: SUPER ADMIN creates Organization + Admin user
    
    DEPRECATED: Use create_organization_with_admin instead
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