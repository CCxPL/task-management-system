from django.db import models
from projects.models import Project
from issues.models import Issue
from django.db.models import Count, Q
from django.utils import timezone

# Reports don't need models, we'll use aggregation queries
# But keep this file for future extensions