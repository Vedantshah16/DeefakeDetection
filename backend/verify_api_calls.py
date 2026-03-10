import os
import cv2
import numpy as np
import logging
from model import predict_image, predict_audio

# Configure logging to capture model.py logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("verify_api_calls")

def create_dummy_image():
    # Create a simple 100x100 white image
    img = np.zeros((100, 100, 3), dtype=np.uint8)
    img.fill(255)
    success, encoded_img = cv2.imencode('.png', img)
    return encoded_img.tobytes()

def create_dummy_audio():
    # Create random bytes mimicking audio
    return os.urandom(1024)

def verify_apis():
    print("--- Verifying Reality Defender API Call ---")
    try:
        dummy_img = create_dummy_image()
        # This should trigger "Scanning image with Reality Defender..." log in model.py
        result = predict_image(dummy_img)
        print("Image Prediction Result:", result['message'])
        if "Reality Defender" in result['message'] or "Reality Defender" in str(result.get('reasons', [])):
             print("SUCCESS: Reality Defender API was attempted/called.")
        else:
             print("WARNING: Reality Defender API might not have been called. Check logs.")
    except Exception as e:
        print(f"Error testing Image API: {e}")

    print("\n--- Verifying Audio API Call ---")
    try:
        dummy_audio = create_dummy_audio()
        # This will likely fall back to simulation due to missing key, but we check if logic runs
        result = predict_audio(dummy_audio, "test_audio.wav")
        print("Audio Prediction Result:", result['message'])
        print("Audio Reasons:", result.get('reasons', []))
        
        # Check environment variable directly to confirm
        if os.getenv("AUDIO_DEEPFAKE_API_KEY"):
             print("Audio Key found. API verify logic should have run.")
        else:
             print("Audio Key MISSING. Confirmed fallback to simulation.")
            
    except Exception as e:
        print(f"Error testing Audio API: {e}")

if __name__ == "__main__":
    verify_apis()
