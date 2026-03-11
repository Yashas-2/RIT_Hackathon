import google.generativeai as genai
import os
from decouple import config

key = "AIzaSyD-8Dd15ryLc1GNA2QZkrD5occaMe8aM3M"
genai.configure(api_key=key)

try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print(f"Error: {e}")
