import cv2
import requests
import time
import RPi.GPIO as GPIO
import logging

# Configuration
BACKEND_URL = "http://<YOUR_LAPTOP_IP>:8000/detect"
API_KEY = "pinnacle_sih_2024"
CAMERA_INDEX = 0  # usually 0 for USB cam
INTERVAL = 2.0    # seconds between frames

# GPIO Pins (BCM Mode)
PIN_GREEN_LED = 18 # Real
PIN_RED_LED = 23   # Fake

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("RPi_Client")

def setup_gpio():
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIN_GREEN_LED, GPIO.OUT)
    GPIO.setup(PIN_RED_LED, GPIO.OUT)
    # Turn off initially
    GPIO.output(PIN_GREEN_LED, GPIO.LOW)
    GPIO.output(PIN_RED_LED, GPIO.LOW)

def set_led(status):
    """
    status: 'REAL' -> Green, 'FAKE' -> Red, 'OFF' -> Both Off
    """
    if status == 'REAL':
        GPIO.output(PIN_GREEN_LED, GPIO.HIGH)
        GPIO.output(PIN_RED_LED, GPIO.LOW)
    elif status == 'FAKE':
        GPIO.output(PIN_GREEN_LED, GPIO.LOW)
        GPIO.output(PIN_RED_LED, GPIO.HIGH)
    else:
        GPIO.output(PIN_GREEN_LED, GPIO.LOW)
        GPIO.output(PIN_RED_LED, GPIO.LOW)

def main():
    setup_gpio()
    cap = cv2.VideoCapture(CAMERA_INDEX)
    
    if not cap.isOpened():
        logger.error("Cannot open camera")
        return

    logger.info("Starting Deepfake Detection Client...")
    
    try:
        while True:
            ret, frame = cap.read()
            if not ret:
                logger.error("Failed to capture frame")
                continue
            
            # Encode frame to JPEG
            try:
                _, img_encoded = cv2.imencode('.jpg', frame)
                files = {'file': ('frame.jpg', img_encoded.tobytes(), 'image/jpeg')}
                headers = {'x-api-key': API_KEY}
                
                # Send to Backend
                response = requests.post(BACKEND_URL, files=files, headers=headers, timeout=5)
                
                if response.status_code == 200:
                    result = response.json()
                    label = result.get("label", "UNKNOWN")
                    conf = result.get("confidence", 0)
                    
                    logger.info(f"Result: {label} ({conf}%)")
                    set_led(label)
                else:
                    logger.error(f"Backend Error: {response.text}")
                    set_led("OFF")
                    
            except Exception as e:
                logger.error(f"Connection Error: {e}")
                set_led("OFF")
            
            # Wait for next interval
            time.sleep(INTERVAL)
            
    except KeyboardInterrupt:
        logger.info("Stopping...")
    finally:
        cap.release()
        GPIO.cleanup()

if __name__ == "__main__":
    main()
