from flask import Flask, render_template, request, jsonify
import requests
import random
import socket
import json
import os

app = Flask(__name__)

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


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/get_location', methods=['POST'])
def get_location_route():
    ip = request.form.get('ip')
    url = request.form.get('url')
    log_data = []

    # อ่านไฟล์ JSON ถ้ามีอยู่
    if os.path.exists("location_log.json"):
        with open("location_log.json", "r") as json_file:
            log_data = json.load(json_file)

    # รับข้อมูลจากผู้ใช้ (IP หรือ URL)
    if ip:
        get_location(ip, log_data)
    elif url:
        ip = socket.gethostbyname(url)
        get_location(ip, log_data)
    else:
        return jsonify({"error": "No IP or URL provided"}), 400

    # ใช้ IP Address ปัจจุบันของเครื่อง
    ip = requests.get('https://api.ipify.org').text
    get_location(ip, log_data)

    # สุ่ม IPv4 Address
    ip = f"{random.randint(1, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}.{random.randint(0, 255)}"
    get_location(ip, log_data)

    # บันทึกข้อมูลทั้งหมดลงไฟล์ JSON
    with open("location_log.json", "w") as json_file:
        json.dump(log_data, json_file, indent=4)

    return render_template('result.html', log_data=log_data)


if __name__ == '__main__':
    app.run(debug=True)
