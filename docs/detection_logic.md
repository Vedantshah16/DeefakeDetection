# Deepfake Detection Logic & Algorithms

## 1. Core Architecture: XceptionNet
The primary detection engine is based on **XceptionNet** (Extreme Inception), a Deep Convolutional Neural Network (CNN).

### Why XceptionNet?
Deepfakes often leave "mesoscopic" artifacts—subtle irregularities at the pixel level that are invisible to the naked eye but detectable by CNNs.
- **Face Boundary Artifacts**: Inconsistencies where the swapped face meets the original background.
- **Compression Artifacts**: GANs (Generative Adversarial Networks) leave specific noise footprints.
- **Inconsistent Illumination**: Mismatches in lighting direction between the face and the scene.

### The Pipeline
1.  **Frame Extraction**: The video is split into individual frames (or the uploaded image is used).
2.  **Preprocessing**:
    - The image is resized to **299x299** pixels.
    - Pixel values are normalized to a specific range [-1, 1].
3.  **Inference**:
    - The image is passed through the XceptionNet layers.
    - The model outputs a probability score (0.0 to 1.0).
4.  **Classification**:
    - Score > 0.5: Classified as **FAKE**.
    - Score <= 0.5: Classified as **REAL**.

## 2. Hybrid Deployment (Edge + Cloud)
To ensure low latency and scalability:
- **Edge (Raspberry Pi)**: Handles video acquisition and immediate user feedback (LEDs). It does *not* run the heavy model. It sends compressed JPEGs to the cloud.
- **Cloud (FastAPI Backend)**: Receives the frame, runs the heavy XceptionNet inference, and returns the result.

## 3. Demo / Fallback Mode
For demonstration purposes where the 500MB+ trained model weights file (`deepfake_xception.h5`) might be missing, the system employs a **Deterministic Simulation Mode**:
- **Logic**: It calculates a hash based on the image's pixel intensity and entropy.
- **Purpose**: Ensures the UI, API, and Hardware indicators can be fully tested and demonstrated without needing the heavy ML model loaded.
- **Behavior**: It consistently returns the same result for the same image, allowing you to demonstrate "Real" vs "Fake" alerts reliably by toggling between different test images.
