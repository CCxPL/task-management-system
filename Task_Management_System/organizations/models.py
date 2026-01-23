from django.conf import settings
from django.db import models

User = settings.AUTH_USER_MODEL


class Organization(models.Model):
    ORG_TYPE_CHOICES = (
        ("COMPANY", "Company"),
        ("INSTITUTE", "Institute"),
    )

    name = models.CharField(max_length=150)
    type = models.CharField(max_length=20, choices=ORG_TYPE_CHOICES)

    email = models.EmailField()
    phone = models.CharField(max_length=20)
    domain = models.CharField(max_length=100)
    address = models.TextField()

    is_active = models.BooleanField(default=False)   # super admin approval
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class OrganizationUser(models.Model):
    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("MANAGER", "Manager"),
        ("MEMBER", "Member"),
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="org_memberships"
    )
    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name="members"
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_active = models.BooleanField(default=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "organization")
