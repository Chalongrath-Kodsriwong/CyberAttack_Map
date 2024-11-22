import requests
import random
import socket

def get_location(ip):
    try:
        response = requests.get(f'http://ip-api.com/json/{ip}')
        data = response.json()

        if data['status'] == 'fail':
            print(f"Error: {data['message']}")
            return

        print()
        print("Location Data")
        print("-------------")
        print(f"IP: {data['query']}")
        print(f"Address: {data['city']}, {data['regionName']}, {data['country']}")
        print(f"Location: ({data['lat']}, {data['lon']})")
    except Exception as e:
        print(f"Error retrieving location data: {e}")

# รับ IP Address จากผู้ใช้งาน
ip = input("Enter any IP address: ")
get_location(ip)

# ใช้ IP Address ปัจจุบันของเครื่อง
ip = requests.get('https://api.ipify.org').text
get_location(ip)

# รับ URL จากผู้ใช้งาน และแปลง URL เป็น IP Address
url = input("Enter the URL: ")
ip = socket.gethostbyname(url)
get_location(ip)

# สุ่ม IPv4 Address
ip = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
print(f"Generated Random IP: {ip}")
get_location(ip)
