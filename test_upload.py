import os
import django
import requests

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arogyamitra.settings')
django.setup()

from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

# Get Sakshi's user
u = User.objects.get(username='Sakshi')
refresh = RefreshToken.for_user(u)
token = str(refresh.access_token)

print(f"Generated token for: {u.username} (ID: {u.id})")
print(f"Token: {token[:30]}...")

# Now make a request to the local server
url = 'http://localhost:8000/api/hospital/upload-report/'
headers = {
    'Authorization': f'Bearer {token}'
}
data = {
    'patient_phone': '7676190723',
    'title': 'Test Report via Script',
    'scan_type': 'Blood'
}

# dummy file
files = {'report_file': ('dummy.pdf', b'dummy content', 'application/pdf')}

response = requests.post(url, headers=headers, data=data, files=files)
print("Status Code:", response.status_code)
print("Response JSON:", response.text)
