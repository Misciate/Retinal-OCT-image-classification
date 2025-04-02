const class_names = {
    0: "AMD",
    1: "CNV",
    2: "CSR",
    3: "DME",
    4: "DR",
    5: "DRUSEN",
    6: "MH",
    7: "NORMAL",
};

let croppedImageData = null; // Lưu ảnh crop để predict 
// new change
let isCropping = false;
let startX, startY, endX, endY;

// 👉 Hàm hiển thị ảnh preview (cho cả upload và paste)
function displayImage(input) {
    let file;
    if (input instanceof Event) {
        // Trường hợp upload
        console.log("Upload event:", input.target);
        file = input.target.files ? input.target.files[0] : null;
    } else {
        // Trường hợp paste (input là blob)
        console.log("Paste blob:", input);
        file = input;
    }

    if (!file) {
        console.error("Không có file để hiển thị");
        return;
    }

    let reader = new FileReader();
    reader.onload = function (e) {
        let img = document.getElementById("preview");
        if (!img) {
            console.error("Không tìm thấy element #preview");
            return;
        }
        img.src = e.target.result;
        img.style.display = "block";
        console.log("Image loaded:", img.src);
        croppedImageData = e.target.result;
    };
    reader.onerror = function () {
        console.error("Lỗi khi đọc file ảnh");
    };
    reader.readAsDataURL(file);
}

// 👉 Sự kiện chọn file ảnh
document.getElementById("imageInput").addEventListener("change", function (event) {
    let file = event.target.files[0];
    if (file) {
        displayImage(file);
    }
});

// 👉 Sự kiện paste ảnh
document.addEventListener("paste", (event) => {
    console.log("Pasting image...");
    let items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
            let blob = items[i].getAsFile();
            if (blob) {
                console.log("Blob found:", blob);
                displayImage(blob);
            } else {
                console.error("Không thể lấy blob từ clipboard");
            }
        } else {
            console.log("Item không phải ảnh:", items[i].type);
        }
    }
});

// 👉 Xử lý Crop Ảnh
function setupCropper() {
    let img = document.getElementById("preview");
    let canvas = document.getElementById("cropCanvas");
    let ctx = canvas.getContext("2d");

    // Định vị canvas trong imagePreview
    let imagePreview = document.getElementById("imagePreview");
    canvas.style.position = "absolute";
    canvas.style.top = "0";
    canvas.style.left = "0";
    canvas.width = img.width;
    canvas.height = img.height;
    canvas.style.display = "block";

    // Gỡ bỏ các sự kiện cũ (nếu có)
    canvas.removeEventListener("mousedown", handleMouseDown);
    canvas.removeEventListener("mousemove", handleMouseMove);
    canvas.removeEventListener("mouseup", handleMouseUp);

    // Gắn sự kiện mới
    function handleMouseDown(event) {
        isCropping = true;
        let rect = canvas.getBoundingClientRect();
        startX = event.clientX - rect.left;
        startY = event.clientY - rect.top;
    }

    function handleMouseMove(event) {
        if (!isCropping) return;

        let rect = canvas.getBoundingClientRect();
        endX = event.clientX - rect.left;
        endY = event.clientY - rect.top;

        // Chuẩn hóa tọa độ để vùng crop luôn hợp lệ
        let x = Math.min(startX, endX);
        let y = Math.min(startY, endY);
        let width = Math.abs(endX - startX);
        let height = Math.abs(endY - startY);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "red";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);
    }

    function handleMouseUp() {
        isCropping = false;
        let cropWidth = Math.abs(endX - startX);
        let cropHeight = Math.abs(endY - startY);
        let x = Math.min(startX, endX);
        let y = Math.min(startY, endY);

        if (cropWidth > 0 && cropHeight > 0) {
            let tempCanvas = document.createElement("canvas");
            let tempCtx = tempCanvas.getContext("2d");

            tempCanvas.width = cropWidth;
            tempCanvas.height = cropHeight;
            tempCtx.drawImage(img, x, y, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);

            croppedImageData = tempCanvas.toDataURL();
            img.src = croppedImageData;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.style.display = "none";
    }

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
}


// 👉 Chuyển ảnh sang grayscale
function convertToGrayscale() {
    let img = document.getElementById("preview");
    let canvas = document.createElement("canvas");
    let ctx = canvas.getContext("2d");

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0, img.width, img.height);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let pixels = imageData.data;

    for (let i = 0; i < pixels.length; i += 4) {
        let avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        pixels[i] = avg;
        pixels[i + 1] = avg;
        pixels[i + 2] = avg;
    }

    ctx.putImageData(imageData, 0, 0);
    croppedImageData = canvas.toDataURL();
    img.src = croppedImageData;
}

// 👉 Predict ảnh sau khi đã crop hoặc grayscale
function predictImage() {
    if (!croppedImageData) {
        alert("Hãy crop hoặc chuyển ảnh về grayscale trước khi predict!");
        return;
    }

    fetch(croppedImageData)
        .then(res => res.blob())
        .then(blob => {
            let formData = new FormData();
            formData.append("file", blob, "edited_image.png");

            return fetch("/predict", {
                method: "POST",
                body: formData
            });
        })
        .then(response => response.json())
        .then(data => {
            let resultDiv = document.getElementById("result");
            resultDiv.innerHTML = "<h4>Prediction Results:</h4>";

            if (data.predictions) {
                let ul = document.createElement("ul");
                ul.style.listStyleType = "none";
                ul.style.padding = "0";

                let maxConfidence = Math.max(...data.predictions.map(pred => pred.confidence));

                data.predictions.forEach(pred => {
                    let li = document.createElement("li");
                    li.textContent = `${class_names[pred.class]} - Confidence: ${pred.confidence}%`;
                    li.style.border = "1px solid #ccc";
                    li.style.padding = "5px 0";

                    // Xác định màu dựa trên confidence
                    if (pred.confidence === maxConfidence) {
                        li.style.color = "green";
                        li.style.fontWeight = "bold";
                    } else if (pred.confidence >= 30) {
                        li.style.color = "orange";
                    } else {
                        li.style.color = "red";
                        li.style.fontWeight = "bold";
                    }

                    ul.appendChild(li);
                });

                resultDiv.appendChild(ul);
            } else {
                resultDiv.innerHTML += `<p style='color: red;'>${data.error}</p>`;
            }
        })
        .catch(error => console.error("Error:", error));
}
