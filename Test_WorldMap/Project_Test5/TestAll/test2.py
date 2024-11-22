import requests
import random
import socket
import json

def get_location(ip, log_data):
    try:
        response = requests.get(f'http://ip-api.com/json/{ip}')
        data = response.json()

        if data['status'] == 'fail':
            log_data.append({"ip": ip, "error": f"Error: {data['message']}"})
            return

        location_data = {
            "ip": data['query'],
            "address": f"{data['city']}, {data['regionName']}, {data['country']}",
            "location": (data['lat'], data['lon'])
        }

        log_data.append(location_data)

    except Exception as e:
        log_data.append({"ip": ip, "error": f"Error retrieving location data: {e}"})

# List to store the log data
log_data = []

# รับ IP Address จากผู้ใช้งาน
ip = input("Enter any IP address: ")
get_location(ip, log_data)

# ใช้ IP Address ปัจจุบันของเครื่อง
ip = requests.get('https://api.ipify.org').text
get_location(ip, log_data)

# รับ URL จากผู้ใช้งาน และแปลง URL เป็น IP Address
url = input("Enter the URL: ")
ip = socket.gethostbyname(url)
get_location(ip, log_data)

# สุ่ม IPv4 Address
ip = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
print(f"Generated Random IP: {ip}")
get_location(ip, log_data)

# สร้างไฟล์ JSON และบันทึก log data
with open("location_log.json", "w") as json_file:
    json.dump(log_data, json_file, indent=4)

print("\nLog data saved to location_log.json")
