from flask import Flask, render_template, request, jsonify
import requests
import socket
import json
import os

app = Flask(__name__, static_folder='Font-End/static', template_folder='Font-End/templates')

# ตัวแปร global สำหรับ IP Address ของเครื่องและ log เริ่มต้น
local_ip_data = None

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

def initialize_local_ip():
    """ ดึง IP Address ของเครื่องครั้งแรกเมื่อโปรแกรมเริ่มต้น """
    global local_ip_data

    # อ่าน log จากไฟล์ถ้ามี
    if os.path.exists("Font-End/static/json/location_log.json"):
        with open("Font-End/static/json/location_log.json", "r") as json_file:
            log_data = json.load(json_file)
    else:
        log_data = []

    # ใช้ IP Address ปัจจุบันของเครื่อง
    ip = requests.get('https://api.ipify.org').text

    # ตรวจสอบว่าตำแหน่งนี้มีอยู่ใน log แล้วหรือไม่
    if not any(entry.get("ip") == ip for entry in log_data):
        get_location(ip, log_data)

    # บันทึก log เริ่มต้นใน global และไฟล์
    local_ip_data = log_data
    with open("Font-End/static/json/location_log.json", "w") as json_file:
        json.dump(log_data, json_file, indent=4)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_location', methods=['POST'])
def get_location_route():
    global local_ip_data

    ip = request.form.get('ip')
    url = request.form.get('url')

    # อ่าน log เดิม
    if os.path.exists("Font-End/static/json/location_log.json"):
        with open("Font-End/static/json/location_log.json", "r") as json_file:
            log_data = json.load(json_file)
    else:
        log_data = local_ip_data or []

    # รับข้อมูลจากผู้ใช้ (IP หรือ URL)
    if ip:
        get_location(ip, log_data)
    elif url:
        ip = socket.gethostbyname(url)
        get_location(ip, log_data)
    else:
        return jsonify({"error": "No IP or URL provided"}), 400

    # บันทึกข้อมูลที่อัปเดต
    with open("Font-End/static/json/location_log.json", "w") as json_file:
        json.dump(log_data, json_file, indent=4)

    return jsonify(log_data)

if __name__ == '__main__':
    # เรียก initialize_local_ip() เพื่อรันเมื่อเซิร์ฟเวอร์เริ่มต้น
    initialize_local_ip()
    app.run(debug=True)
