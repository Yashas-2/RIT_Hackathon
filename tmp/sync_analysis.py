
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogyamitra.settings')
django.setup()

from core.models import MedicalReport, AIAnalysis, Subscription

# 1. Clear the 'is_analyzed' flag for reports that don't have analysis records
reports_to_fix = MedicalReport.objects.filter(is_analyzed=True)
count = 0
for r in reports_to_fix:
    if not AIAnalysis.objects.filter(report=r).exists():
        r.is_analyzed = False
        r.save()
        count += 1
        print(f"Fixed report ID:{r.id} - {r.title}")

print(f"Synchronized {count} reports.")

# 2. Reset the user's subscription count to give them a fresh start (optional but helpful for testing)
# This will allow them to analyze these reports properly now.
for s in Subscription.objects.all():
    s.ai_analysis_count = 0
    s.save()
    print(f"Reset analysis count for {s.user.email}")
