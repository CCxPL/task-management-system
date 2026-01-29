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
    "https://task.yourdesk.cloud",
<<<<<<< HEAD
=======
    "https://www.task.yourdesk.cloud",
>>>>>>> 49d0503cec7151ab9e29775c6ecb2a0d48c67810
]

CSRF_TRUSTED_ORIGINS = [
    "https://task.yourdesk.cloud",
]

<<<<<<< HEAD
STATIC_ROOT = BASE_DIR / "staticfiles"
=======
STATIC_ROOT = BASE_DIR / "staticfiles"
>>>>>>> 49d0503cec7151ab9e29775c6ecb2a0d48c67810
