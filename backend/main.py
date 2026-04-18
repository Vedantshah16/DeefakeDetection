from fastapi import FastAPI, UploadFile, File, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import cv2
import numpy as np
import logging
import tempfile
import shutil
import os
from typing import Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import logging
import secrets
from dotenv import load_dotenv

load_dotenv()

# TrueSight AI model imports
try:
    from ai_model import get_model, run_inference
    from ai_model.inference import validate_image_format
    AI_MODEL_AVAILABLE = True
except ImportError:
    AI_MODEL_AVAILABLE = False


# Import our model logic
try:
    from . import model, database
except ImportError:
    import model
    import database

app = FastAPI(title="Pinnacle 6 Deepfake Detector")

# Configure CORS for Frontend
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize logging
logger = logging.getLogger("uvicorn")



# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")
# AUTO_ERROR=False allows us to handle missing tokens gracefully in our own dependency
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)



# --- Auth Helpers ---

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = database.get_user_by_username(username)
    if user is None:
        raise credentials_exception
    return user

async def get_current_user_or_guest(token: Optional[str] = Depends(oauth2_scheme)):
    """
    Returns the authenticated user if token is valid.
    Otherwise, returns a default 'guest' user for testing/demo purposes.
    """
    if token:
        try:
            return await get_current_user(token)
        except HTTPException:
            pass # Fallback to guest on invalid token
            
    # Fallback to guest
    guest = database.get_user_by_username("guest")
    if not guest:
        # Should have been created on startup, but just in case
        database.create_user("guest", get_password_hash("guest"))
        guest = database.get_user_by_username("guest")
    return guest

@app.on_event("startup")
async def startup_event():
    database.init_db()
    model.load_model()
    
    # Ensure guest user exists for demo/testing
    if not database.get_user_by_username("guest"):
        hashed_pw = get_password_hash("guest")
        database.create_user("guest", hashed_pw)
        logger.info("Created 'guest' user for demo mode.")
        
    logger.info("Model loaded/initialized.")

    # Load TrueSight AI EfficientNet-B4 model
    if AI_MODEL_AVAILABLE:
        try:
            ai_model_instance, ai_threshold = get_model()
            logger.info(f"🚀 TrueSight AI model loaded and ready (threshold={ai_threshold:.2f})")
        except Exception as e:
            logger.warning(f"⚠ TrueSight AI model could not be loaded: {e}")
    else:
        logger.warning("⚠ ai_model package not available — AI endpoints disabled")

@app.get("/")
def read_root():
    return {"message": "Pinnacle 6 Backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "Pinnacle 6 Backend"}

@app.get("/stats/summary")
def get_stats(current_user: dict = Depends(get_current_user_or_guest)):
    return database.get_summary_stats(user_id=current_user['id'])

@app.get("/detections/history")
def get_history(limit: int = 50, media_type: Optional[str] = None, current_user: dict = Depends(get_current_user_or_guest)):
    return database.get_recent_detections(limit, media_type, user_id=current_user['id'])

@app.delete("/detections/history")
def clear_history(current_user: dict = Depends(get_current_user)):
    success = database.soft_delete_user_history(current_user['id'])
    if not success:
        raise HTTPException(status_code=500, detail="Failed to clear history")
    return {"message": "History cleared successfully"}

# --- Auth Models & Endpoints ---

# File size limits
MAX_IMAGE_SIZE = int(os.getenv("MAX_IMAGE_SIZE_MB", "10")) * 1024 * 1024  # 10MB default
MAX_VIDEO_SIZE = int(os.getenv("MAX_VIDEO_SIZE_MB", "100")) * 1024 * 1024  # 100MB default
MAX_AUDIO_SIZE = int(os.getenv("MAX_AUDIO_SIZE_MB", "50")) * 1024 * 1024  # 50MB default

class UserCreate(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

@app.post("/register")
def register(user: UserCreate):
    # Input validation
    if not user.username or len(user.username) < 3 or len(user.username) > 32:
        raise HTTPException(status_code=400, detail="Username must be 3-32 characters")
    if not user.username.isalnum():
        raise HTTPException(status_code=400, detail="Username must be alphanumeric")
    if not user.password or len(user.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    db_user = database.get_user_by_username(user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    success = database.create_user(user.username, hashed_password)
    if not success:
         raise HTTPException(status_code=500, detail="Failed to create user")
    return {"message": "User created successfully"}

@app.post("/login", response_model=Token)
def login(user: UserLogin):
    db_user = database.get_user_by_username(user.username)
    if not db_user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    if not verify_password(user.password, db_user['password_hash']):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/users/me")
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return {"username": current_user['username']}

class DetectionResponse(BaseModel):
    label: str
    confidence: float
    message: str
    confidence_band: Optional[str] = None
    variance: Optional[float] = None
    fft_energy: Optional[float] = None
    frames_processed: Optional[int] = None
    reasons: Optional[list[str]] = None
    synthetic_likelihood: Optional[float] = None
    human_likelihood: Optional[float] = None

@app.post("/detect", response_model=DetectionResponse)
async def detect_deepfake(
    file: UploadFile = File(...), 
    current_user: dict = Depends(get_current_user_or_guest)
):
    """
    Receives an image or video file, processes it using the Mathematical Model, and returns REAL/FAKE verdict.
    """
    try:
        # Determine file type
        filename = file.filename.lower()
        is_video = filename.endswith(('.mp4', '.avi', '.mov', '.webm', '.mkv'))
        is_audio = filename.endswith(('.wav', '.mp3', '.flac', '.ogg', '.m4a'))

        # File size validation
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)

        if is_video and file_size > MAX_VIDEO_SIZE:
            raise HTTPException(status_code=413, detail=f"Video file too large. Max {MAX_VIDEO_SIZE // (1024*1024)}MB")
        elif is_audio and file_size > MAX_AUDIO_SIZE:
            raise HTTPException(status_code=413, detail=f"Audio file too large. Max {MAX_AUDIO_SIZE // (1024*1024)}MB")
        elif not is_video and not is_audio and file_size > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=413, detail=f"Image file too large. Max {MAX_IMAGE_SIZE // (1024*1024)}MB")
        
        if is_video:
            # Save video to temp file for OpenCV processing
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(filename)[1]) as tmp:
                shutil.copyfileobj(file.file, tmp)
                tmp_path = tmp.name
            
            try:
                # Process Video (Eq 1, 6, 7, 9)
                result = model.process_video(tmp_path)
            finally:
                # Cleanup
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
            
            # Extract FFT energy from message if possible (hacky but quick for demo mode integration)
            # Better: if model.process_video returns it. 
            # Note: model.process_video currently doesn't return raw energy list, only in message.
            # But process_video DOES return 'variance'.
            
            # Save to DB
            db_record = {
                "file_name": filename,
                "media_type": "video",
                "result_label": result["label"],
                "confidence": round(result["confidence"] * 100, 2),
                "confidence_band": result.get("confidence_band"),
                "synthetic_likelihood": result.get("synthetic_likelihood"),
                "human_likelihood": result.get("human_likelihood"),
                "frames_analyzed": result.get("frames_analyzed"),
                "faces_detected": 0,
                "audio_duration": 0.0,
                "user_id": current_user['id']
            }
            database.insert_detection(db_record)

            return {
                "label": result["label"],
                "confidence": round(result["confidence"] * 100, 2),
                "confidence_band": result.get("confidence_band"),
                "message": result["message"],
                "variance": result.get("variance"),
                "frames_processed": result.get("frames_processed"),
                "reasons": result.get("reasons", []),
                "synthetic_likelihood": result.get("synthetic_likelihood"),
                "human_likelihood": result.get("human_likelihood")
            }
            
        elif filename.endswith(('.wav', '.mp3', '.flac', '.ogg', '.m4a')):
            # Process Audio
            contents = await file.read()
            result = model.predict_audio(contents, filename)
            
            # Save to DB
            db_record = {
                "file_name": filename,
                "media_type": "audio",
                "result_label": result["label"],
                "confidence": round(result["confidence"] * 100, 2),
                "confidence_band": result.get("confidence_band"),
                "synthetic_likelihood": result.get("synthetic_likelihood"),
                "human_likelihood": result.get("human_likelihood"),
                "frames_analyzed": 0,
                "faces_detected": 0,
                "audio_duration": 0.0,
                "user_id": current_user['id']
            }
            database.insert_detection(db_record)

            return {
                "label": result["label"],
                "confidence": round(result["confidence"] * 100, 2),
                "confidence_band": result.get("confidence_band"),
                "message": result["message"],
                "variance": 0.0,
                "frames_processed": 0,
                "reasons": result.get("reasons", []),
                "synthetic_likelihood": result.get("synthetic_likelihood"),
                "human_likelihood": result.get("human_likelihood")
            }

        else:
            # Process Image (Eq 2, 3, 4, 5, 10, 11)
            contents = await file.read()
            result = model.predict_image(contents)
            
            # Predict image doesn't return energy explicitly in dict either, just in message
            # Let's extract it or return it from model.py?
            # For now, we will leave it null or parse it?
            # Actually, let's update model.py to return it properly first.
            # But wait, I can edit model.py too.
            # Let's proceed with main.py update assuming model.py returns it, 
            # and then I'll quickly patch model.py to return 'energy' in the dict.
            
            # Save to DB
            db_record = {
                "file_name": filename,
                "media_type": "image",
                "result_label": result["label"],
                "confidence": round(result["confidence"] * 100, 2),
                "confidence_band": result.get("confidence_band"),
                "synthetic_likelihood": result.get("synthetic_likelihood"),
                "human_likelihood": result.get("human_likelihood"),
                "frames_analyzed": 1,
                "faces_detected": 1,
                "audio_duration": 0.0,
                "user_id": current_user['id']
            }
            database.insert_detection(db_record)
            
            return {
                "label": result["label"],
                "confidence": round(result["confidence"] * 100, 2),
                "confidence_band": result.get("confidence_band"),
                "message": result["message"],
                "variance": result.get("variance"), # Will be 0.0
                "fft_energy": result.get("fft_energy"),
                "reasons": result.get("reasons", []),
                "synthetic_likelihood": result.get("synthetic_likelihood"),
                "human_likelihood": result.get("human_likelihood")
            }
        
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# TrueSight AI Endpoints
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

@app.get("/ai-status")
def ai_model_status():
    """Check if the TrueSight AI model is loaded and ready."""
    if not AI_MODEL_AVAILABLE:
        return {"status": "unavailable", "reason": "ai_model package not installed"}
    try:
        _, threshold = get_model()
        return {
            "status": "ready",
            "model": "TrueSight AI - EfficientNet-B4",
            "threshold": threshold,
        }
    except Exception as e:
        return {"status": "error", "reason": str(e)}


@app.post("/ai-detect", response_model=DetectionResponse)
async def ai_detect_deepfake(file: UploadFile = File(...), current_user: dict = Depends(get_current_user_or_guest)):
    """
    Detect deepfakes using the TrueSight AI EfficientNet-B4 model.
    Returns the same DetectionResponse format as /detect for frontend compatibility.
    """
    if not AI_MODEL_AVAILABLE:
        raise HTTPException(status_code=503, detail="AI model not available")

    # Validate file format
    if not validate_image_format(file.filename or ""):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format. Allowed: {', '.join(sorted(('.jpg', '.jpeg', '.png', '.bmp', '.webp', '.gif')))}",
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="Empty file uploaded")

        ai_result = run_inference(image_bytes)

        # Map AI result → DetectionResponse format
        label = ai_result["prediction"]  # "REAL" or "FAKE"
        confidence_pct = ai_result["confidence"]  # 0-100
        probability = ai_result["probability"]  # 0-1

        # Derive confidence band
        if confidence_pct >= 80:
            confidence_band = "High"
        elif confidence_pct >= 50:
            confidence_band = "Medium"
        else:
            confidence_band = "Low"

        # Derive likelihood
        # probability is P(REAL)
        human_likelihood = round(probability * 100, 2)
        synthetic_likelihood = round((1 - probability) * 100, 2)

        # Build descriptive message
        if label == "FAKE":
            message = f"TrueSight AI detected synthetic artifacts with {confidence_pct:.1f}% confidence. The image shows signs of AI generation or manipulation."
        else:
            message = f"TrueSight AI classified this as authentic with {confidence_pct:.1f}% confidence. No significant synthetic artifacts detected."

        # Save to database
        db_record = {
            "file_name": (file.filename or "unknown").lower(),
            "media_type": "image",
            "result_label": label,
            "confidence": round(confidence_pct, 2),
            "confidence_band": confidence_band,
            "synthetic_likelihood": synthetic_likelihood,
            "human_likelihood": human_likelihood,
            "frames_analyzed": 1,
            "faces_detected": 1,
            "audio_duration": 0.0,
            "user_id": current_user['id']
        }
        database.insert_detection(db_record)

        return {
            "label": label,
            "confidence": round(confidence_pct, 2),
            "confidence_band": confidence_band,
            "message": message,
            "variance": 0.0,
            "fft_energy": None,
            "reasons": [],
            "synthetic_likelihood": synthetic_likelihood,
            "human_likelihood": human_likelihood,
            "probability": probability,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"AI detection error: {e}")
        raise HTTPException(status_code=500, detail=f"Inference failed: {e}")



if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
