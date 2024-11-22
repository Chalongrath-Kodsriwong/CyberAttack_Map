from flask import Flask, render_template, request, jsonify
import requests
import socket
import json
import os

app = Flask(__name__, static_folder='Font-End/static', template_folder='Font-End/templates')

def get_location(ip):
    """ดึงข้อมูลตำแหน่งจาก IP"""
    try:
        response = requests.get(f'http://ip-api.com/json/{ip}')
        data = response.json()

        if data['status'] == 'fail':
            return {"ip": ip, "error": f"Error: {data['message']}"}

        return {
            "ip": data['query'],
            "address": f"{data['city']}, {data['regionName']}, {data['country']}",
            "location": (data['lat'], data['lon'])
        }
    except Exception as e:
        return {"ip": ip, "error": f"Error retrieving location data: {e}"}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/initialize_location', methods=['GET'])
def initialize_location():
    """ส่งตำแหน่ง IP ปัจจุบันของผู้ใช้งานเมื่อเริ่มโปรแกรม"""
    try:
        response = requests.get('https://api64.ipify.org?format=json')  # ดึง IP ของผู้ใช้งาน
        ip = response.json().get('ip')
        if ip:
            location_data = get_location(ip)
            return jsonify(location_data), 200
    except Exception as e:
        return jsonify({"error": f"Failed to initialize location: {e}"}), 500

    return jsonify({"error": "Unable to determine current location"}), 500

@app.route('/get_location', methods=['POST'])
def get_location_route():
    ip = request.form.get('ip')
    url = request.form.get('url')

    if ip:
        location_data = get_location(ip)
    elif url:
        try:
            ip = socket.gethostbyname(url)
            location_data = get_location(ip)
        except socket.gaierror:
            return jsonify({"error": "Invalid URL"}), 400
    else:
        return jsonify({"error": "No IP or URL provided"}), 400

    if location_data:
        log_file_path = "Font-End/static/json/location_log.json"
        if os.path.exists(log_file_path):
            with open(log_file_path, "r") as json_file:
                log_data = json.load(json_file)
        else:
            log_data = []

        log_data.append(location_data)

        with open(log_file_path, "w") as json_file:
            json.dump(log_data, json_file, indent=4)

        return jsonify(location_data), 200
    else:
        return jsonify({"error": "Failed to retrieve location data"}), 500

if __name__ == '__main__':
    app.run(debug=True)
