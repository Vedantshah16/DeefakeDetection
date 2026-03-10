"""
TrueSight AI Model Package

Provides deepfake detection inference via a pre-trained EfficientNet-B4 model.
"""

from ai_model.model_loader import get_model
from ai_model.inference import run_inference, validate_image_format

__all__ = ["get_model", "run_inference", "validate_image_format"]
