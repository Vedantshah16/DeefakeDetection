# System Architecture

## Overview
Pinnacle 6 is a hybrid Edge-Cloud Deepfake Detection System. It leverages edge devices (Raspberry Pi) for video acquisition and immediate hardware feedback, while offloading heavy ML inference to a scalable cloud backend.

## Architecture Diagram (Textual)

```mermaid
graph TD
    subgraph "Edge Layer (Raspberry Pi)"
        Camera[USB Camera] -->|Frames| Script[rpi_client.py]
        Script -->|GPIO| LED_G[Green LED (REAL)]
        Script -->|GPIO| LED_R[Red LED (FAKE)]
    end

    subgraph "Cloud Layer (Virtual Machine / Container)"
        API[FastAPI Backend] -->|Decode| Preprocess[Frame Preprocessing]
        Preprocess -->|Tensor| Model[XceptionNet Model]
        Model -->|Prediction| API
    end

    subgraph "Frontend Layer"
        User[User / Admin] -->|Upload Video| ReactApp[React Dashboard]
        ReactApp -->|REST API| API
    end

    Script -->|HTTP POST| API
```

## Data Flow
1. **Input**:
   - **Edge Mode**: Raspberry Pi captures frames every 2 seconds.
   - **Web Mode**: User uploads an image/video via React Dashboard.
2. **Transmission**:
   - Frames are sent to the `/detect` endpoint via HTTP POST (multipart/form-data).
   - Requests are authenticated using `x-api-key`.
3. **Processing**:
   - Backend decodes image using OpenCV.
   - Frame is resized to 299x299 (for XceptionNet).
   - Model predicts probability of "Deepfake".
4. **Output**:
   - Backend returns JSON `{label: "FAKE", confidence: 99.5}`.
   - **Edge**: `rpi_client.py` lights up Red LED.
   - **Web**: React App displays "FAKE CONTENT" alert.

## Innovation Points
- **Hybrid Approach**: Low-cost edge devices for surveillance/monitoring, high-power cloud for analysis.
- **Real-time Feedback**: Immediate visual indicators (LEDs) for physical security checkpoints.
- **Scalability**: Backend can be containerized (Docker) and scaled horizontally on Kubernetes.
