import os

ENV = os.getenv("DJANGO_ENV", "local")

if ENV == "production":
    from .env.production import *
else:
    from .env.local import *

