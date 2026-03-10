# Deployment Guide

## Prerequisites
- AWS Account (or Azure/GCP)
- Docker (optional but recommended)
- Python 3.9+

## 1. Backend Deployment (AWS EC2)

1. **Launch EC2 Instance**:
   - OS: Ubuntu 22.04 LTS
   - Type: t3.medium (or t3.small if using demo mode only)
   - Security Group: Allow inbound TCP on port 8000.

2. **Setup Environment**:
   ```bash
   sudo apt update && sudo apt install python3-pip python3-venv libgl1
   git clone <YOUR_REPO_URL>
   cd pinnacle6/backend
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run Application**:
   ```bash
   # Run in background using nohup or systemd
   nohup uvicorn main:app --host 0.0.0.0 --port 8000 &
   ```

## 2. Frontend Deployment (Vercel / Netlify)

1. **Build Project**:
   ```bash
   cd pinnacle6/frontend
   npm install
   npm run build
   ```

2. **Deploy**:
   - Drag and drop the `dist` folder to Netlify Drop.
   - OR connect GitHub repo to Vercel and point to `frontend` directory.

## 3. Database (Optional)
- For logging history, connect MongoDB Atlas using `pymongo` in `backend/main.py`.

## 4. Edge Device Setup
- See `hardware/wiring.md` for Raspberry Pi setup.
