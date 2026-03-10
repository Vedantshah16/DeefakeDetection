"""
TrueSight AI - Inference Module

Preprocesses uploaded images and runs deepfake detection inference
using the loaded EfficientNet-B4 model.
"""

import io
import logging
from typing import Dict, Union

import torch
from torchvision import transforms
from PIL import Image

from ai_model.model_loader import get_model

logger = logging.getLogger("uvicorn")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif"}
IMG_SIZE = 380

# ImageNet normalisation (must match training)
_TRANSFORM = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# ---------------------------------------------------------------------------
# Public helpers
# ---------------------------------------------------------------------------
def validate_image_format(filename: str) -> bool:
    """Return True if the filename has a supported image extension."""
    import os
    ext = os.path.splitext(filename.lower())[1]
    return ext in ALLOWED_EXTENSIONS


def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """
    Convert raw image bytes to a batched, normalised tensor.

    Args:
        image_bytes: Raw bytes of the uploaded image file.

    Returns:
        Tensor of shape (1, 3, 380, 380).

    Raises:
        ValueError: If the image cannot be opened or converted.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as exc:
        raise ValueError(f"Could not open image: {exc}") from exc

    tensor = _TRANSFORM(image).unsqueeze(0)  # (1, 3, 380, 380)
    return tensor


def run_inference(image_bytes: bytes) -> Dict[str, Union[str, float]]:
    """
    Run deepfake detection on raw image bytes.

    Returns:
        {
            "prediction": "REAL" | "FAKE",
            "confidence": float,   # 0‑100, how confident the model is
            "probability": float,  # 0‑1, raw sigmoid output
            "threshold":   float,  # threshold used for classification
        }

    Raises:
        RuntimeError: If the model is not loaded.
        ValueError:   If the image cannot be processed.
    """
    model, threshold = get_model()

    # Preprocess
    tensor = preprocess_image(image_bytes)
    tensor = tensor.to("cpu")

    # Forward pass
    with torch.no_grad():
        logit = model(tensor)
        probability: float = torch.sigmoid(logit).item()

    # Classification
    # High probability -> REAL, Low probability -> FAKE
    if probability >= threshold:
        label = "REAL"
        confidence = probability * 100
    else:
        label = "FAKE"
        confidence = (1.0 - probability) * 100

    return {
        "prediction": label,
        "confidence": round(confidence, 2),
        "probability": round(probability, 4),
        "threshold": threshold,
    }
