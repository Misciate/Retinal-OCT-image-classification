# Retinal OCT Image Classification

This project is a web application designed for the classification of retinal OCT (Optical Coherence Tomography) images. It utilizes a dataset containing high-quality multi-class OCT images across 8 different retinal conditions. The application aims to assist in the diagnosis and understanding of various retinal diseases through image analysis.

## Project Structure

```
retinal-oct-image-classification
├── src
│   ├── components
│   │   ├── Header.js
│   │   ├── Footer.js
│   │   └── ImageClassifier.js
│   ├── pages
│   │   ├── Home.js
│   │   └── About.js
│   ├── styles
│   │   ├── main.css
│   └── utils
│       └── imageProcessing.js
├── public
│   ├── index.html
│   └── favicon.ico
├── dataset
│   └── RetinalOCTImageClassification-C8
├── package.json
├── .gitignore
└── README.md
```

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd retinal-oct-image-classification
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the application:**
   ```bash
   npm start
   ```

## Usage

- Navigate to the home page to upload and classify OCT images.
- Visit the about page for more information about the project and its objectives.

## Dataset

The dataset used in this project is the "Retinal OCT Image Classification - C8" dataset, which includes images categorized into 8 different retinal conditions. The dataset is located in the `dataset/RetinalOCTImageClassification-C8` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any suggestions or improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.