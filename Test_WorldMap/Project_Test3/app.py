from flask import Flask, jsonify, request
import requests  # For making external API requests

app = Flask(__name__)

@app.route("/get_ip_details", methods=["GET"])
def get_ip_details():
    ip = request.args.get('ip')  # Get IP from query parameter
    if not ip:
        return jsonify({"error": "IP address is required."}), 400
    
    token = "c8c8313f10c8467fbf476591de4022e9"
    url = f"https://api.findip.net/{ip}/?token={token}"

    try:
        # Make the external API request
        response = requests.get(url)
        data = response.json()

        if 'country' in data:
            return jsonify(data)  # Send back the data in JSON format
        else:
            return jsonify({"error": "Country not found in IP data."}), 404

    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500  # Return error message if the request fails

@app.route("/")
def home():
    return "Hello, Flask!"

if __name__ == "__main__":
    app.run(debug=True)
