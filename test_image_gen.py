import cv2
import numpy as np

# Create a random noise image
img = np.random.randint(0, 256, (300, 300, 3), dtype=np.uint8)
# Add a face-like rect (though the detector might fail, fallback is center crop which is fine)
cv2.rectangle(img, (100, 100), (200, 200), (200, 200, 200), -1)

cv2.imwrite("test_image.jpg", img)
print("Created test_image.jpg")
