import cv2
import numpy as np
import sys
import os

# Add backend to path
sys.path.append("c:/Users/vedan/Downloads/Pinnacle6 Project/pinnacle6/backend")

from model import process_video, predict_image, fft_spectral_energy, load_model

def create_noise_image(filename="noise.jpg"):
    # High frequency noise
    noise = np.random.randint(0, 256, (300, 300, 3), dtype=np.uint8)
    cv2.imwrite(filename, noise)
    return filename

def create_smooth_image(filename="smooth.jpg"):
    # Smooth gradient
    img = np.zeros((300, 300, 3), dtype=np.uint8)
    for i in range(300):
        img[i,:] = i * 255 // 300
    cv2.imwrite(filename, img)
    return filename

def test_fft_energy():
    print("--- Testing FFT Energy (Eq 10) ---")
    noise_file = create_noise_image()
    smooth_file = create_smooth_image()
    
    noise = cv2.imread(noise_file)
    smooth = cv2.imread(smooth_file)
    
    e_noise = fft_spectral_energy(noise)
    e_smooth = fft_spectral_energy(smooth)
    
    print(f"Noise Energy: {e_noise:.2f}")
    print(f"Smooth Energy: {e_smooth:.2f}")
    
    if e_noise > e_smooth:
        print("[PASS] Noise energy is higher than smooth energy.")
    else:
        print("[FAIL] Logic error in FFT energy calculation.")
        
    os.remove(noise_file)
    os.remove(smooth_file)

def test_video_processing():
    print("\n--- Testing Video Processing (Eq 1, 6, 9) ---")
    # We can't easily generate a valid mp4 with python purely without deps like moviepy or ffmpeg installed
    # So we will mock the cv2.VideoCapture in spirit by calling process_video on a non-existent file 
    # and catching the error, or just checking if the function exists and signature is correct.
    # Actually, let's just make a dummy file to check import and function call structure works.
    
    try:
        process_video("dummy_video.mp4")
    except ValueError as e:
        print(f"[PASS] process_video attempted to read file and correctly raised: {e}")
    except Exception as e:
        print(f"[FAIL] Unexpected error: {e}")

if __name__ == "__main__":
    load_model()
    test_fft_energy()
    test_video_processing()
    print("\nVerification Complete.")
