
@echo off
setlocal

:KILL_LOOP
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    echo Killing PID %%a...
    taskkill /PID %%a /F
    timeout /t 1 >nul
    goto KILL_LOOP
)

echo Port 8000 is clear.
echo Starting server...
cd backend
venv\Scripts\python.exe main.py > startup_log.txt 2>&1
