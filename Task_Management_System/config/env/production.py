from .base import *
import os

DEBUG = False

ALLOWED_HOSTS = [
    "task.yourdesk.cloud",
    "www.task.yourdesk.cloud",

    "127.0.0.1",
    "localhost",
]
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "taskdb",
        "USER": "taskuser",
        "PASSWORD": "PrakharShreyans.CCPL@123",
        "HOST": "localhost",
        "PORT": "5432",
    }
}

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOWED_ORIGINS = [
    "https://www.task.yourdesk.cloud",

]

CSRF_TRUSTED_ORIGINS = [
    "https://task.yourdesk.cloud",
]


STATIC_ROOT = BASE_DIR / "staticfiles"

STATIC_ROOT = BASE_DIR / "staticfiles"
