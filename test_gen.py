import google.generativeai as genai
import os

key = "AIzaSyD-8Dd15ryLc1GNA2QZkrD5occaMe8aM3M"
genai.configure(api_key=key)

model = genai.GenerativeModel('gemini-2.5-flash')

try:
    response = model.generate_content("Say hello")
    print(response.text)
except Exception as e:
    print(f"Error: {e}")
