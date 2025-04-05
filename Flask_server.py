from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
from PIL import Image
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)

# Load model
model = tf.keras.models.load_model(r"./retinal_oct_model.h5")
print(model.summary())
print(model.input_shape)
# Define the preprocess_image function
def preprocess_image(image):
    if image.mode != 'RGB':
        image = image.convert('RGB')  # Ensure the image is in RGB format
    
    # Resize the image to the input size expected by the model
    target_size = (150, 150)  # Replace with your model's input size
    image = image.resize(target_size)

    # Convert the image to a numpy array and normalize pixel values
    image = np.array(image, dtype=np.float32) / 255.0  # Normalize to [0, 1]

    # Add a batch dimension to the image
    image = np.expand_dims(image, axis=0)  # Shape: (1, 128, 128, 3)
    return image

@app.route('/')
def home():
    return render_template('index.html')  # Serve index.html from the templates folder

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    try:
        # Xử lý ảnh
        image = Image.open(file.stream)
        image = preprocess_image(image)

        # Dự đoán
        predictions = model.predict(image)[0]  # Lấy mảng kết quả đầu ra
        
        # Lấy danh sách class và confidence
        class_indices = np.argsort(predictions)[::-1]  # Sắp xếp index theo confidence giảm dần
        sorted_predictions = [{"class": int(i), "confidence": round(float(predictions[i]) * 100, 2)} for i in class_indices]
        return jsonify({"predictions": sorted_predictions})
    
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 400


if __name__ == '__main__':
    app.run(debug=True)