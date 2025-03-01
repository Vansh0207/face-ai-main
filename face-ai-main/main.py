from flask import Flask, request, jsonify, render_template
import face_recognition
import cv2
import numpy as np
import os
import requests
from flask_cors import CORS

app = Flask(__name__, template_folder=".")  # Set root directory for templates
CORS(app)

UPLOAD_FOLDER = "./images"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def get_face_encodings_from_image(image):
    """Extract face encodings from a given image (as a numpy array)."""
    if image is None:
        return None, "Error: Could not read image."
    
    rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    encodings = face_recognition.face_encodings(rgb_image)
    
    if not encodings:
        return None, "Error: No faces found."
    
    return encodings, None

@app.route("/")
def index():
    """Serve the index.html page."""
    return render_template("index.html")

@app.route("/encode", methods=["POST"])
def encode_image():
    """
    Receives a JSON payload with an 'image_url' key, fetches the image from that URL,
    extracts face encodings, and returns them as JSON.
    """
    data = request.get_json()
    if not data or "image_url" not in data:
        return jsonify({"error": "No image URL provided"}), 400
    
    image_url = data["image_url"]
    
    # Fetch image from URL
    try:
        response = requests.get(image_url)
        response.raise_for_status()  # Raises an error for bad status codes
    except Exception as e:
        return jsonify({"error": f"Error fetching image: {str(e)}"}), 400
    
    # Convert downloaded content to an OpenCV image
    image_array = np.asarray(bytearray(response.content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)
    
    encodings, error = get_face_encodings_from_image(image)
    if error:
        return jsonify({"error": error}), 400
    
    return jsonify({
        "num_faces": len(encodings),
        "encodings": [encoding.tolist() for encoding in encodings]
    })

@app.route("/compare", methods=["POST"])
def compare_faces():
    """Compares a selfie encoding with stored encodings."""
    data = request.get_json()
    selfie_encoding = np.array(data.get("selfie_encoding"))
    event_encodings = [np.array(enc) for enc in data.get("event_encodings", [])]
    
    if not selfie_encoding.any() or not event_encodings:
        return jsonify({"error": "Invalid encodings provided"}), 400

    results = [face_recognition.compare_faces([enc], selfie_encoding)[0] for enc in event_encodings]
    
    return jsonify({"match_found": any(results)})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
