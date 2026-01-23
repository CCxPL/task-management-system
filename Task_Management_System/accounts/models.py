import uuid
from datetime import timedelta
from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class PasswordResetToken(models.Model):
    PURPOSE_CHOICES = (
        ("SET_PASSWORD", "Set Password"),
        ("RESET_PASSWORD", "Reset Password"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    purpose = models.CharField(max_length=20, choices=PURPOSE_CHOICES)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def is_valid(self):
        return (not self.used) and (self.expires_at > timezone.now())

    @classmethod
    def generate(cls, user, purpose, minutes=30):
        return cls.objects.create(
            user=user,
            purpose=purpose,
            expires_at=timezone.now() + timedelta(minutes=minutes),
        )
