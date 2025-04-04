import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from PIL import Image
import base64

app = Flask(__name__)
CORS(app)

GENAI_API_KEY = "AIzaSyCV6mvQhiIJaJXqso1uEXGogbreTrqa9xA"
genai.configure(api_key=GENAI_API_KEY)

@app.route("/analyze-image", methods=["POST"])
def analyze_image():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files["image"]
    
    image = Image.open(image_file)
    image.save("temp.jpg")
    with open("temp.jpg", "rb") as img_file:
        image_data = base64.b64encode(img_file.read()).decode("utf-8")

    try:
        model = genai.GenerativeModel("gemini-1.5-pro-vision")
        response = model.generate_content([
            "List the objects present in this image in a comma-separated format.",
            {"mime_type": "image/jpeg", "data": image_data}
        ])

        identified_items = response.text.split(",") if response.text else []

        return jsonify({"items": identified_items})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
