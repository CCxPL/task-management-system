from .models import Issue

def generate_issue_key(project):
    last_issue = Issue.objects.filter(project=project).order_by("-id").first()

    if not last_issue:
        return f"{project.id}-1"   # simple & safe

    try:
        num = int(last_issue.issue_key.split("-")[-1])
    except:
        num = last_issue.id

    return f"{project.id}-{num + 1}"
