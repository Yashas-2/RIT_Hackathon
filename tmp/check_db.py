
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogyamitra.settings')
django.setup()

from core.models import MedicalReport, AIAnalysis, Subscription

print("--- REPORTS ---")
for r in MedicalReport.objects.all():
    print(f"ID:{r.id} | Analyzed:{r.is_analyzed} | Title:{r.title}")

print("\n--- ANALYSES ---")
for a in AIAnalysis.objects.all():
    print(f"ReportID:{a.report_id} | Lang:{a.language}")

print("\n--- SUBSCRIPTIONS ---")
for s in Subscription.objects.all():
    print(f"User:{s.user.email} | Count:{s.ai_analysis_count}")
