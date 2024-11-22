import requests

api_key = "c8c8313f10c8467fbf476591de4022e9"
response = requests.get(f"https://ipinfo.io/101.0.0.5/json?token={"44e133fb0552d7"}")
print(response.status_code)  # ควรได้ 200
print(response.json())       # ตรวจสอบผลลัพธ์
