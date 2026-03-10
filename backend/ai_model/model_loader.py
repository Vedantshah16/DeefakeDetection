"""
TrueSight AI - Model Loader (Singleton)

Loads the EfficientNet-B4 deepfake detection model once and caches it.
Architecture is verified against the actual state_dict to prevent size mismatches.

Verified classifier structure (from state_dict inspection):
    classifier.0  →  BatchNorm1d(1792)
    classifier.1  →  Dropout(p=0.5)        [no weights]
    classifier.2  →  Linear(1792, 256)
    classifier.3  →  ReLU()                [no weights]
    classifier.4  →  Dropout(p=0.5)        [no weights]
    classifier.5  →  Linear(256, 1)
"""

import os
import logging
from typing import Tuple, Optional

import torch
import torch.nn as nn
from torchvision import models

logger = logging.getLogger("uvicorn")

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_FILENAME = "truesight_finetuned_model.pth"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

# Optimized threshold from training (maximizes F1‑Real)
DEFAULT_THRESHOLD: float = 0.70

# Device — CPU only for deployment
DEVICE: str = "cpu"

# ---------------------------------------------------------------------------
# Singleton cache
# ---------------------------------------------------------------------------
_cached_model: Optional[nn.Module] = None
_cached_threshold: float = DEFAULT_THRESHOLD


def _build_architecture() -> nn.Module:
    """
    Build EfficientNet-B4 with the EXACT classifier head used during training.

    The architecture must match the saved state_dict keys:
        classifier.0  →  BatchNorm1d(1792)
        classifier.2  →  Linear(1792 → 256)
        classifier.5  →  Linear(256 → 1)
    """
    model = models.efficientnet_b4(weights=None)

    num_features: int = model.classifier[1].in_features  # 1792

    model.classifier = nn.Sequential(
        nn.BatchNorm1d(num_features),       # [0]
        nn.Dropout(p=0.5),                  # [1]  — no weights
        nn.Linear(num_features, 256),       # [2]
        nn.ReLU(),                          # [3]  — no weights
        nn.Dropout(p=0.5),                  # [4]  — no weights
        nn.Linear(256, 1),                  # [5]
    )

    return model


def _verify_state_dict(state_dict: dict) -> None:
    """
    Sanity‑check that the state_dict contains the expected classifier keys.
    Raises RuntimeError with a clear message on mismatch.
    """
    expected_keys = {
        "classifier.0.weight",
        "classifier.0.bias",
        "classifier.2.weight",
        "classifier.2.bias",
        "classifier.5.weight",
        "classifier.5.bias",
    }
    classifier_keys = {k for k in state_dict if k.startswith("classifier.")}

    missing = expected_keys - classifier_keys
    if missing:
        raise RuntimeError(
            f"State‑dict is missing expected classifier keys: {missing}. "
            "The model file may have been trained with a different architecture."
        )

    # Verify shapes
    if state_dict["classifier.2.weight"].shape != torch.Size([256, 1792]):
        raise RuntimeError(
            f"classifier.2.weight shape mismatch: "
            f"expected [256, 1792], got {list(state_dict['classifier.2.weight'].shape)}"
        )
    if state_dict["classifier.5.weight"].shape != torch.Size([1, 256]):
        raise RuntimeError(
            f"classifier.5.weight shape mismatch: "
            f"expected [1, 256], got {list(state_dict['classifier.5.weight'].shape)}"
        )


def _load_model() -> Tuple[nn.Module, float]:
    """
    Internal loader — builds architecture, loads weights, validates.

    Returns:
        (model, threshold)
    """
    if not os.path.exists(MODEL_PATH):
        raise FileNotFoundError(
            f"Model file not found: {MODEL_PATH}. "
            "Ensure truesight_finetuned_model.pth is in backend/ai_model/models/"
        )

    # 1. Load raw state_dict
    logger.info(f"Loading state_dict from {MODEL_PATH} …")
    state_dict = torch.load(MODEL_PATH, map_location=DEVICE, weights_only=False)

    # If it happens to be a checkpoint dict, extract the state_dict
    if isinstance(state_dict, dict) and "model_state_dict" in state_dict:
        logger.info("Detected checkpoint dict — extracting 'model_state_dict'")
        threshold = state_dict.get("threshold", DEFAULT_THRESHOLD)
        state_dict = state_dict["model_state_dict"]
    else:
        threshold = DEFAULT_THRESHOLD

    # 2. Verify keys & shapes before loading
    _verify_state_dict(state_dict)

    # 3. Build architecture and load weights
    model = _build_architecture()
    model.load_state_dict(state_dict, strict=True)
    model.to(DEVICE)
    model.eval()

    # 4. Smoke test — forward pass with dummy tensor
    with torch.no_grad():
        dummy = torch.randn(1, 3, 380, 380, device=DEVICE)
        output = model(dummy)
        assert output.shape == torch.Size([1, 1]), (
            f"Unexpected output shape: {output.shape}"
        )

    logger.info(
        f"✅ Model verified — output shape OK, threshold={threshold:.2f}"
    )
    return model, threshold


def get_model() -> Tuple[nn.Module, float]:
    """
    Public API — returns the cached (model, threshold) singleton.

    First call loads the model; subsequent calls return the cache.
    Thread‑safe for FastAPI's async event loop (loaded once at startup).
    """
    global _cached_model, _cached_threshold

    if _cached_model is None:
        _cached_model, _cached_threshold = _load_model()

    return _cached_model, _cached_threshold
