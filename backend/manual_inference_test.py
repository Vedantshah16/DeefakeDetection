
import os
import sys
import torch
from PIL import Image
from torchvision import transforms

# Add backend to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_model.model_loader import _build_architecture, MODEL_PATH

# ---------------------------------------------------------------------------
# CONFIGURATION
# ---------------------------------------------------------------------------
# REPLACE THESE PATHS WITH YOUR ACTUAL IMAGE PATHS
test_image_paths = [
    # "C:/path/to/real1.jpg",
    # "C:/path/to/real2.jpg",
    # "C:/path/to/real3.jpg",
    # "C:/path/to/fake1.jpg",
    # "C:/path/to/fake2.jpg",
    # "C:/path/to/fake3.jpg",
]

# ---------------------------------------------------------------------------
# MODEL LOADING
# ---------------------------------------------------------------------------
print("Loading model...")
if not os.path.exists(MODEL_PATH):
    print(f"Error: Model not found at {MODEL_PATH}")
    sys.exit(1)

device = "cpu"
checkpoint = torch.load(MODEL_PATH, map_location=device)
state_dict = checkpoint["model_state_dict"] if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint else checkpoint

model = _build_architecture()
model.load_state_dict(state_dict, strict=True)
model.to(device)
model.eval()
print("Model loaded.")

# ---------------------------------------------------------------------------
# PREPROCESSING
# ---------------------------------------------------------------------------
IMG_SIZE = 380
_TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

# ---------------------------------------------------------------------------
# INFERENCE LOOP
# ---------------------------------------------------------------------------
print("\nStarting Inference...\n")

if not test_image_paths:
    print("No images in 'test_image_paths' list. Please add them.")

for img_path in test_image_paths:
    if not os.path.exists(img_path):
        print(f"Image not found: {img_path}")
        print("-----------------------------")
        continue
        
    try:
        # Load and verify image
        img = Image.open(img_path).convert("RGB")
        
        # Transform
        tensor = _TRANSFORM(img).unsqueeze(0).to(device)
        
        # Inference
        with torch.no_grad():
            logit = model(tensor).item()
            prob = torch.sigmoid(torch.tensor(logit)).item()
            
        # Output
        print("=====================================")
        print(f"Image: {os.path.basename(img_path)}")
        print(f"Raw Logit: {logit:.6f}")
        print(f"Sigmoid Probability: {prob:.6f}")
        print("=====================================")
        
    except Exception as e:
        print(f"Error processing {img_path}: {e}")
        print("-----------------------------")
