@echo off
echo ==========================================
echo      Pinnacle 6 - Setup and Run
echo ==========================================

echo [1/4] Installing Backend Dependencies...
cd backend
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install backend dependencies.
    pause
    exit /b %errorlevel%
)
cd ..

echo [2/4] Installing Frontend Dependencies...
cd frontend
if not exist "node_modules" (
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b %errorlevel%
    )
) else (
    echo Node modules found, skipping install...
)
cd ..

echo.
echo ==========================================
echo      Starting Services...
echo ==========================================
echo.
echo Starting Backend (New Window)...
start "Pinnacle 6 Backend" cmd /k "cd backend && venv\Scripts\activate && python main.py"

echo Starting Frontend (New Window)...
start "Pinnacle 6 Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo [SUCCESS] Services started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
timeout /t 5 >nul
start http://localhost:5173
pause
