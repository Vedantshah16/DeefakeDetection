import requests
import json

try:
    url = "http://localhost:8000/register"
    payload = {
        "username": "debug_user_1",
        "password": "password123"
    }
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Testing {url} with payload {payload}")
    response = requests.post(url, json=payload, headers=headers)
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"Error: {e}")
