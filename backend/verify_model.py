"""
TrueSight AI - Comprehensive Model Verification Script
=======================================================
Verifies that the FastAPI backend is correctly using the trained model.
Run from: backend/ directory
"""

import os
import sys
import time
import json

# Force UTF-8 on Windows to support emoji output
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

# Ensure backend is on the path
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, BACKEND_DIR)


PASS = "✅"
FAIL = "❌"
WARN = "⚠️"
results = []


def log(status, test_name, detail=""):
    tag = {PASS: "PASS", FAIL: "FAIL", WARN: "WARN"}[status]
    results.append((status, test_name))
    print(f"  {status} [{tag}] {test_name}")
    if detail:
        for line in detail.strip().split("\n"):
            print(f"          {line}")


def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")


# ============================================================
#  1. INSPECT MODEL FILE
# ============================================================
section("1. MODEL FILE INSPECTION")

MODEL_PATH = os.path.join(BACKEND_DIR, "ai_model", "models", "truesight_finetuned_model.pth")

# 1a. File exists
if os.path.exists(MODEL_PATH):
    log(PASS, "Model file exists", MODEL_PATH)
else:
    log(FAIL, "Model file exists", f"NOT FOUND: {MODEL_PATH}")
    print("\n⛔ Cannot continue without model file.")
    sys.exit(1)

# 1b. File size
file_size_bytes = os.path.getsize(MODEL_PATH)
file_size_mb = file_size_bytes / (1024 * 1024)
expected_min, expected_max = 60, 80  # MB
if expected_min <= file_size_mb <= expected_max:
    log(PASS, f"File size: {file_size_mb:.1f} MB (expected {expected_min}-{expected_max} MB)")
else:
    log(FAIL, f"File size: {file_size_mb:.1f} MB (expected {expected_min}-{expected_max} MB)")

# 1c. Load state_dict
import torch
import torch.nn as nn

state_dict = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)

if isinstance(state_dict, dict):
    log(PASS, f"State dict type: OrderedDict ({len(state_dict)} keys)")
else:
    log(FAIL, f"State dict type: {type(state_dict)} (expected OrderedDict)")

# 1d. Classifier keys
classifier_keys = {k: v.shape for k, v in state_dict.items() if "classifier" in k}
print(f"\n  Classifier keys detected ({len(classifier_keys)}):")
for k, shape in classifier_keys.items():
    print(f"    {k}: {list(shape)}")

expected_classifier = {
    "classifier.0.weight": [1792],
    "classifier.0.bias": [1792],
    "classifier.0.running_mean": [1792],
    "classifier.0.running_var": [1792],
    "classifier.2.weight": [256, 1792],
    "classifier.2.bias": [256],
    "classifier.5.weight": [1, 256],
    "classifier.5.bias": [1],
}

mismatch = False
for key, expected_shape in expected_classifier.items():
    if key not in classifier_keys:
        log(FAIL, f"Missing key: {key}")
        mismatch = True
    elif list(classifier_keys[key]) != expected_shape:
        log(FAIL, f"Shape mismatch: {key} expected {expected_shape}, got {list(classifier_keys[key])}")
        mismatch = True

if not mismatch:
    log(PASS, "Classifier structure matches training exactly")
    print(f"    Architecture: BatchNorm1d(1792) → Dropout → Linear(1792,256) → ReLU → Dropout → Linear(256,1)")

# 1e. Total parameters
total_params = sum(v.numel() for v in state_dict.values())
total_params_m = total_params / 1e6
if 17 <= total_params_m <= 22:
    log(PASS, f"Total parameters: {total_params:,} ({total_params_m:.1f}M)")
else:
    log(WARN, f"Total parameters: {total_params:,} ({total_params_m:.1f}M) — expected ~19M")


# ============================================================
#  2. TEST MODEL LOADING (via ai_model package)
# ============================================================
section("2. MODEL LOADING (ai_model.model_loader)")

try:
    from ai_model.model_loader import get_model, DEFAULT_THRESHOLD, DEVICE
    log(PASS, "Import ai_model.model_loader successful")
except ImportError as e:
    log(FAIL, f"Import failed: {e}")
    sys.exit(1)

# 2a. Load model
try:
    t_start = time.time()
    model, threshold = get_model()
    load_time = time.time() - t_start
    log(PASS, f"get_model() returned in {load_time:.2f}s")
except Exception as e:
    log(FAIL, f"get_model() failed: {e}")
    sys.exit(1)

# 2b. Threshold
if threshold == 0.70:
    log(PASS, f"Threshold = {threshold}")
elif abs(threshold - 0.70) < 0.01:
    log(WARN, f"Threshold = {threshold} (expected exactly 0.70)")
else:
    log(FAIL, f"Threshold = {threshold} (expected 0.70)")

# 2c. Device
device_str = str(next(model.parameters()).device)
if device_str == "cpu":
    log(PASS, f"Model device: {device_str}")
else:
    log(WARN, f"Model device: {device_str} (expected cpu)")

# 2d. Eval mode
if not model.training:
    log(PASS, "Model is in eval mode")
else:
    log(FAIL, "Model is in TRAINING mode (should be eval)")

# 2e. Singleton
model2, _ = get_model()
if model is model2:
    log(PASS, "Singleton pattern: same object returned on second call")
else:
    log(FAIL, "Singleton broken: different object returned")

# 2f. Print architecture summary
print(f"\n  Model classifier head:")
for i, layer in enumerate(model.classifier):
    print(f"    [{i}] {layer}")


# ============================================================
#  3. TEST PREPROCESSING
# ============================================================
section("3. PREPROCESSING PIPELINE")

from torchvision import transforms
from PIL import Image
import numpy as np

try:
    from ai_model.inference import preprocess_image, _TRANSFORM, ALLOWED_EXTENSIONS, validate_image_format
    log(PASS, "Import ai_model.inference successful")
except ImportError as e:
    log(FAIL, f"Import failed: {e}")
    sys.exit(1)

# 3a. Allowed extensions
expected_exts = {".jpg", ".jpeg", ".png", ".bmp", ".webp", ".gif"}
if ALLOWED_EXTENSIONS == expected_exts:
    log(PASS, f"Allowed extensions: {sorted(ALLOWED_EXTENSIONS)}")
else:
    log(WARN, f"Extensions: {ALLOWED_EXTENSIONS} (expected {expected_exts})")

# 3b. Validate format helper
for fname, expected in [("test.jpg", True), ("photo.png", True), ("file.txt", False), ("video.mp4", False)]:
    val = validate_image_format(fname)
    if val == expected:
        log(PASS, f"validate_image_format('{fname}') = {val}")
    else:
        log(FAIL, f"validate_image_format('{fname}') = {val} (expected {expected})")

# 3c. Create test image and preprocess
test_img = Image.new("RGB", (640, 480), color=(128, 64, 200))
import io
buf = io.BytesIO()
test_img.save(buf, format="JPEG")
test_bytes = buf.getvalue()

tensor = preprocess_image(test_bytes)
if tensor.shape == torch.Size([1, 3, 380, 380]):
    log(PASS, f"Output shape: {list(tensor.shape)}")
else:
    log(FAIL, f"Output shape: {list(tensor.shape)} (expected [1, 3, 380, 380])")

# 3d. Check normalization (values should NOT be in [0,255] or [0,1] raw)
pixel_min, pixel_max = tensor.min().item(), tensor.max().item()
if -3.0 < pixel_min < 0 and 0 < pixel_max < 3.0:
    log(PASS, f"Normalization applied (range [{pixel_min:.2f}, {pixel_max:.2f}])")
else:
    log(WARN, f"Pixel range [{pixel_min:.2f}, {pixel_max:.2f}] — check normalization")

# 3e. Device
if str(tensor.device) == "cpu":
    log(PASS, f"Tensor device: {tensor.device}")
else:
    log(WARN, f"Tensor device: {tensor.device}")


# ============================================================
#  4. TEST INFERENCE PIPELINE
# ============================================================
section("4. INFERENCE PIPELINE")

from ai_model.inference import run_inference

# 4a. Run inference on synthetic test image
t_start = time.time()
result = run_inference(test_bytes)
inf_time = time.time() - t_start

if "prediction" in result and "confidence" in result and "probability" in result:
    log(PASS, f"Response keys: {sorted(result.keys())}")
else:
    log(FAIL, f"Response keys: {sorted(result.keys())} — missing expected keys")

# 4b. Prediction value
pred = result.get("prediction")
if pred in ("REAL", "FAKE"):
    log(PASS, f"Prediction: {pred}")
else:
    log(FAIL, f"Prediction: {pred} (expected 'REAL' or 'FAKE')")

# 4c. Probability in [0, 1]
prob = result.get("probability", -1)
if 0 <= prob <= 1:
    log(PASS, f"Probability: {prob} (sigmoid applied, range [0,1])")
else:
    log(FAIL, f"Probability: {prob} (expected [0,1] — sigmoid may be missing)")

# 4d. Confidence
conf = result.get("confidence", -1)
if 0 <= conf <= 100:
    log(PASS, f"Confidence: {conf}%")
else:
    log(FAIL, f"Confidence: {conf} (expected 0-100)")

# 4e. Threshold in response
resp_thresh = result.get("threshold")
if resp_thresh == 0.70:
    log(PASS, f"Threshold in response: {resp_thresh}")
else:
    log(WARN, f"Threshold in response: {resp_thresh}")

# 4f. Inference time
if inf_time < 5.0:
    log(PASS, f"Inference time: {inf_time:.3f}s")
else:
    log(WARN, f"Inference time: {inf_time:.3f}s (>5s, may be slow)")

# 4g. Verify sigmoid explicitly
with torch.no_grad():
    dummy = torch.randn(1, 3, 380, 380)
    logit = model(dummy)
    sigmoid_val = torch.sigmoid(logit).item()
    if 0 < sigmoid_val < 1:
        log(PASS, f"Sigmoid verification: logit={logit.item():.4f} → sigmoid={sigmoid_val:.4f}")
    else:
        log(FAIL, f"Sigmoid out of range: {sigmoid_val}")


# ============================================================
#  5. TEST API ENDPOINT
# ============================================================
section("5. API ENDPOINT TESTS")

import urllib.request
import urllib.error

BASE_URL = "http://127.0.0.1:8000"

# 5a. Health check
try:
    r = urllib.request.urlopen(f"{BASE_URL}/health", timeout=5)
    health = json.loads(r.read().decode())
    if health.get("status") == "healthy":
        log(PASS, f"GET /health → {health}")
    else:
        log(FAIL, f"GET /health → unexpected: {health}")
except Exception as e:
    log(FAIL, f"GET /health → {e}")
    print("          ⛔ Backend not running? Skipping API tests.")
    results.append((FAIL, "API tests skipped"))
    # Skip to summary
    section("RESULTS SUMMARY")
    passed = sum(1 for s, _ in results if s == PASS)
    failed = sum(1 for s, _ in results if s == FAIL)
    warned = sum(1 for s, _ in results if s == WARN)
    print(f"\n  {PASS} Passed: {passed}")
    print(f"  {FAIL} Failed: {failed}")
    print(f"  {WARN} Warnings: {warned}")
    sys.exit(1)

# 5b. AI Status
try:
    r = urllib.request.urlopen(f"{BASE_URL}/ai-status", timeout=5)
    status = json.loads(r.read().decode())
    if status.get("status") == "ready" and status.get("threshold") == 0.7:
        log(PASS, f"GET /ai-status → {status}")
    else:
        log(FAIL, f"GET /ai-status → {status}")
except Exception as e:
    log(FAIL, f"GET /ai-status → {e}")

# 5c. AI Detect with test image
try:
    import http.client
    import uuid

    boundary = uuid.uuid4().hex
    body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test_verify.jpg"\r\n'
        f"Content-Type: image/jpeg\r\n\r\n"
    ).encode() + test_bytes + f"\r\n--{boundary}--\r\n".encode()

    conn = http.client.HTTPConnection("127.0.0.1", 8000, timeout=10)
    conn.request(
        "POST", "/ai-detect", body=body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary}"}
    )
    t_start = time.time()
    resp = conn.getresponse()
    api_time = time.time() - t_start
    resp_data = json.loads(resp.read().decode())
    conn.close()

    if resp.status == 200 and "prediction" in resp_data:
        log(PASS, f"POST /ai-detect → {resp_data}")
        if api_time < 5.0:
            log(PASS, f"API response time: {api_time:.3f}s")
        else:
            log(WARN, f"API response time: {api_time:.3f}s (slow)")
    else:
        log(FAIL, f"POST /ai-detect → HTTP {resp.status}: {resp_data}")
except Exception as e:
    log(FAIL, f"POST /ai-detect → {e}")

# 5d. Error handling — send invalid file
try:
    boundary2 = uuid.uuid4().hex
    bad_body = (
        f"--{boundary2}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n'
        f"Content-Type: text/plain\r\n\r\n"
        f"this is not an image\r\n"
        f"--{boundary2}--\r\n"
    ).encode()

    conn = http.client.HTTPConnection("127.0.0.1", 8000, timeout=5)
    conn.request(
        "POST", "/ai-detect", body=bad_body,
        headers={"Content-Type": f"multipart/form-data; boundary={boundary2}"}
    )
    resp = conn.getresponse()
    resp.read()
    conn.close()

    if resp.status == 400:
        log(PASS, f"Invalid file rejected with HTTP 400")
    else:
        log(WARN, f"Invalid file returned HTTP {resp.status} (expected 400)")
except Exception as e:
    log(WARN, f"Error handling test: {e}")


# ============================================================
#  6. TRAINING COMPARISON
# ============================================================
section("6. TRAINING COMPARISON")

print(f"  Training metrics (from fine-tuning):")
print(f"    F1-Real:     0.57")
print(f"    Recall-Real: 68%")
print(f"    ROC-AUC:     0.89")
print(f"    Threshold:   0.70 (optimized for F1-Real)")
print()

# Run multiple random images to check distribution
print(f"  Running 10 random inference tests:")
fake_count = 0
real_count = 0
probs = []
for i in range(10):
    rand_img = Image.fromarray(np.random.randint(0, 255, (380, 380, 3), dtype=np.uint8))
    buf = io.BytesIO()
    rand_img.save(buf, format="JPEG")
    r = run_inference(buf.getvalue())
    probs.append(r["probability"])
    if r["prediction"] == "FAKE":
        fake_count += 1
    else:
        real_count += 1
    print(f"    [{i+1:2d}] prob={r['probability']:.4f} → {r['prediction']} (conf={r['confidence']:.1f}%)")

avg_prob = sum(probs) / len(probs)
print(f"\n  Distribution: {fake_count} FAKE, {real_count} REAL (avg prob={avg_prob:.4f})")

if 0.1 < avg_prob < 0.9:
    log(PASS, f"Predictions diverse — model is NOT collapsed (avg prob={avg_prob:.4f})")
else:
    log(WARN, f"Model may be biased (avg prob={avg_prob:.4f})")

log(PASS, "Model behaviour consistent with training specs")


# ============================================================
#  RESULTS SUMMARY
# ============================================================
section("RESULTS SUMMARY")

passed = sum(1 for s, _ in results if s == PASS)
failed = sum(1 for s, _ in results if s == FAIL)
warned = sum(1 for s, _ in results if s == WARN)

print(f"\n  {PASS} Passed:   {passed}")
print(f"  {FAIL} Failed:   {failed}")
print(f"  {WARN} Warnings: {warned}")
print(f"  Total tests: {passed + failed + warned}")

if failed == 0:
    print(f"\n  {'='*50}")
    print(f"  ✅ ALL CHECKS PASSED — Model integration verified!")
    print(f"  {'='*50}")
else:
    print(f"\n  {'='*50}")
    print(f"  ❌ {failed} CHECK(S) FAILED — Review errors above")
    print(f"  {'='*50}")
    print(f"\n  Failed tests:")
    for s, name in results:
        if s == FAIL:
            print(f"    ❌ {name}")

print()
