
import os
import sys
import torch
import torch.nn as nn
from torchvision import models
from PIL import Image
import io

# Add backend to path so we can import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ai_model.model_loader import MODEL_PATH, DEVICE, _build_architecture, _verify_state_dict

# Redirect stdout to file
log_file = open("diagnostic_results.txt", "w", encoding="utf-8")
def log(msg):
    print(msg)
    log_file.write(msg + "\n")

log("------------------")
log("DIAGNOSTIC CHECK")
log("------------------\n")

# ---------------------------------------------------------------------------
# STEP 1: LOAD MODEL & INSPECT KEYS
# ---------------------------------------------------------------------------
log("--- [STEP 1 & 2] Loading Model & Inspecting Keys ---")
if not os.path.exists(MODEL_PATH):
    log(f"ERROR: Model file not found at: {MODEL_PATH}")
    sys.exit(1)

log(f"Loading from: {MODEL_PATH}")
checkpoint = torch.load(MODEL_PATH, map_location='cpu')

state_dict = None
threshold = 0.5
class_to_idx = None

if isinstance(checkpoint, dict) and "model_state_dict" in checkpoint:
    log("Detected standard checkpoint dictionary.")
    state_dict = checkpoint["model_state_dict"]
    if "threshold" in checkpoint:
        threshold = checkpoint["threshold"]
        log(f"Found saved threshold: {threshold}")
    if "class_to_idx" in checkpoint:
        class_to_idx = checkpoint["class_to_idx"]
        log(f"Found class_to_idx: {class_to_idx}")
    else:
        log("WARNING: 'class_to_idx' NOT found in checkpoint.")
else:
    log("Detected raw state_dict (legacy format).")
    state_dict = checkpoint

log("\nClassifier Keys & Shapes:")
classifier_keys = [k for k in state_dict.keys() if "classifier" in k]
for k in sorted(classifier_keys):
    log(f"  {k}: {state_dict[k].shape}")

# ---------------------------------------------------------------------------
# STEP 3: MANUAL INFERENCE
# ---------------------------------------------------------------------------
log("\n--- [STEP 3] Manual Inference Test (Dummy Image) ---")

# Build model
try:
    model = _build_architecture()
    model.load_state_dict(state_dict, strict=True)
    model.to('cpu')
    model.eval()
    log("Model loaded successfully.")
except Exception as e:
    log(f"FAILED to load model architecture: {e}")
    sys.exit(1)

# Generate Dummy Image (Random Noise mimicking a REAL image structure)
log("Generating dummy image (random noise)...")
dummy_img = Image.fromarray((torch.rand(380, 380, 3) * 255).byte().numpy(), 'RGB')

# Preprocess (Copying exact logic from inference.py)
from torchvision import transforms
IMG_SIZE = 380
_TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])

tensor = _TRANSFORM(dummy_img).unsqueeze(0) # (1, 3, 380, 380)

# Forward Pass
with torch.no_grad():
    logit = model(tensor)
    probability = torch.sigmoid(logit).item()

log(f"\nDiagnostic Output:")
log(f"Raw Logit:        {logit.item():.4f}")
log(f"Sigmoid Prob:     {probability:.4f}")
log(f"Threshold:        {threshold}")

# ---------------------------------------------------------------------------
# STEP 4: DECISION LOGIC
# ---------------------------------------------------------------------------
log("\n--- [STEP 4] Decision Logic Verification ---")

is_fake = probability >= threshold
prediction = "FAKE" if is_fake else "REAL"

log(f"Logic: 'FAKE' if ({probability:.4f} >= {threshold}) else 'REAL'")
log(f"Final Prediction: {prediction}")

if class_to_idx:
    log(f"\nDataset Mapping found: {class_to_idx}")
    # Check if logic matches mapping
    # Usually: 0=First, 1=Second.
    # If mapping is {'FAKE': 0, 'REAL': 1}, then 1=REAL.
    # Our logic assumes 1=FAKE (high prob).
    # This would be a conflict if the mapping is REAL=1.
else:
    log("\nWARNING: Cannot automatically verify logic without 'class_to_idx'.")
    log("Check if training assumed label 1 = FAKE.")

log("\n------------------")
log("DIAGNOSTIC COMPLETE")
log("------------------")
log_file.close()
