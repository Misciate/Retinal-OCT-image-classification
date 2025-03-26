const class_names = {
    0: "Cataract",
    1: "Diabetic Retinopathy",
    2: "Glaucoma",
    3: "Normal"
};

async function predictImage() {
    const imageInput = document.getElementById('imageInput');
    const predictionText = document.getElementById('predictionText');

    // Kiểm tra xem có file được chọn không
    if (!imageInput.files || imageInput.files.length === 0) {
        predictionText.textContent = "Please select an image first.";
        return;
    }

    const file = imageInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Gửi request tới API
        const response = await fetch('http://localhost:5000/predict', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Hiển thị kết quả
        if (data.error) {
            predictionText.textContent = `Error: ${data.error}`;
        } else {
            const className = class_names[data.prediction];
            const confidence = data.confidence;
            predictionText.textContent = `Predicted class: ${className} (Confidence: ${confidence}%)`;
        }
    } catch (error) {
        predictionText.textContent = `Error: ${error.message}`;
    }
}

function previewImage(event) {
    const input = event.target;
    const preview = document.getElementById('preview');
    const reader = new FileReader();

    reader.onload = function () {
        preview.src = reader.result;
        preview.style.display = 'block';
    };

    if (input.files && input.files[0]) {
        reader.readAsDataURL(input.files[0]);
    }
}