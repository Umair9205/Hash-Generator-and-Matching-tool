from flask import Flask, request, jsonify, send_from_directory
import hashlib
import smtplib
from email.message import EmailMessage
import os

# -----------------------------
# Flask App
# -----------------------------
app = Flask(__name__, static_folder="frontend")

# -----------------------------
# CORS for JS fetch
# -----------------------------
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS"
    return response

# -----------------------------
# Hashing algorithms
# -----------------------------
ALGORITHMS = {
    'md5': hashlib.md5,
    'sha1': hashlib.sha1,
    'sha224': hashlib.sha224,
    'sha256': hashlib.sha256,
    'sha384': hashlib.sha384,
    'sha512': hashlib.sha512,
    'blake2b': hashlib.blake2b,
    'blake2s': hashlib.blake2s,
}

def generate_hash(data: str, algorithm: str) -> str:
    h = ALGORITHMS[algorithm]()
    h.update(data.encode('utf-8'))
    return h.hexdigest()

# -----------------------------
# Hash API
# -----------------------------
@app.route("/hash", methods=["POST"])
def hash_api():
    try:
        data = request.json
        text = data.get("text")
        algorithm = data.get("algorithm", "md5")
        match_hash = data.get("match")  # optional

        if not text:
            return jsonify({"error": "No text provided"}), 400

        # --- Match mode ---
        if match_hash:
            for algo in ALGORITHMS:
                digest = generate_hash(text, algo)
                if digest.lower() == match_hash.lower():
                    return jsonify({"match": True, "algorithm": algo.upper(), "hash": digest})
            return jsonify({"match": False, "message": "No match found"})

        # --- Normal hash generation ---
        if algorithm not in ALGORITHMS:
            return jsonify({"error": "Invalid algorithm"}), 400
        digest = generate_hash(text, algorithm)
        return jsonify({"algorithm": algorithm.upper(), "hash": digest})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Newsletter / Subscribe
# -----------------------------
EMAIL = os.getenv("SMTP_EMAIL")
PASSWORD = os.getenv("SMTP_PASSWORD")
      # <-- Gmail App Password
SUBSCRIBER_FILE = "subscribers.txt"

@app.route("/subscribe", methods=["POST"])
def subscribe():
    try:
        data = request.json
        email = data.get("email")
        if not email:
            return jsonify({"error": "Email is required"}), 400

        # Save email to file
        with open(SUBSCRIBER_FILE, "a") as f:
            f.write(email + "\n")

        # Send confirmation email
        msg = EmailMessage()
        msg["Subject"] = "Subscription Successful ✅"
        msg["From"] = EMAIL
        msg["To"] = email
        msg.set_content(
            f"Hello!\n\nThank you for subscribing to our HashUtility newsletter.\n"
            "You will receive updates on new tools and projects.\n\n"
            "– HashUtility Team"
        )

        # Connect to Gmail SMTP
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(EMAIL, PASSWORD)
            smtp.send_message(msg)

        return jsonify({"success": True, "message": "Subscription successful!"})

    except Exception as e:
        print("Error sending email:", e)
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Serve frontend files
# -----------------------------
@app.route("/", methods=["GET"])
def index():
    return send_from_directory(app.static_folder, "index.html")

@app.route("/<path:path>", methods=["GET"])
def static_files(path):
    return send_from_directory(app.static_folder, path)

# -----------------------------
# Run Flask
# -----------------------------
if __name__ == "__main__":
    app.run()
