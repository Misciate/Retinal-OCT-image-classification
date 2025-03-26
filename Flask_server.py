from flask import Flask, request, jsonify, send_from_directory  # Add send_from_directory here
from flask_cors import CORS
from PIL import Image
import numpy as np
import tensorflow as tf
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Load mô hình từ file .h5
model = tf.keras.models.load_model(r"C:\DSA-Project\TEST11\model.h5")

#print(model.summary())
#print(f"Model input shape: {model.input_shape}")

# Hàm xử lý ảnh đầu vào
def preprocess_image(image):
    if image.mode != 'RGB':
        image = image.convert('RGB')  
    
    # Resize về đúng kích thước model yêu cầu (128, 128)
    target_size = (128, 128)  
    image = image.resize(target_size)

    # Chuyển đổi sang numpy array và chuẩn hóa
    image = np.array(image, dtype=np.float32) / 255.0  

    # Đảm bảo đúng shape (batch_size, height, width, channels)
    image = np.expand_dims(image, axis=0)  # Shape: (1, 128, 128, 3)
    return image
 
@app.route('/')
def home():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/predict', methods=['POST'])
def predict():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files['file']
    try:
        image = Image.open(file.stream)
        image = preprocess_image(image)
        prediction = model.predict(image)
        predicted_class = np.argmax(prediction, axis=1)[0]
        return jsonify({"prediction": int(predicted_class)})
    except Exception as e:
        return jsonify({"error": f"Error processing image: {str(e)}"}), 400

if __name__ == '__main__':
    app.run(debug=True)