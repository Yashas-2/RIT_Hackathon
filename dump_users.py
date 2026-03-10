import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogyamitra.settings')
django.setup()

from django.contrib.auth.models import User

with open('users_dump.txt', 'w') as f:
    for u in User.objects.all():
        has_hospital = hasattr(u, 'hospital_staff')
        has_patient = hasattr(u, 'patient_profile')
        f.write(f"{u.username}: superuser={u.is_superuser}, hospital={has_hospital}, patient={has_patient}\n")
