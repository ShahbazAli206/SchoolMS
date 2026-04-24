@echo off
title SchoolMS — Startup
color 0A

echo ================================================
echo   SchoolMS — Starting All Services
echo ================================================
echo.

:: ── Check adb device ────────────────────────────────────────────────────────
echo [1/4] Checking connected Android device...
adb devices 2>nul | findstr /V "List" | findstr "device" >nul
if errorlevel 1 (
    echo   WARNING: No Android device detected via USB.
    echo   Connect your phone and enable USB Debugging, then re-run.
    echo.
) else (
    echo   Device found.
)

:: ── Forward Metro port to phone (8081 = RN default) ─────────────────────────
echo [2/4] Forwarding Metro port to phone...
adb reverse tcp:8081 tcp:8081 >nul 2>&1
echo   Done. (port 8081)

:: ── Start Backend ────────────────────────────────────────────────────────────
echo [3/4] Starting Backend API on port 5000...
start "SchoolMS Backend" cmd /k "cd /d "%~dp0SchoolMS-Backend" && node server.js"

:: Wait for backend to be ready
timeout /t 4 /nobreak >nul

:: ── Start Metro Bundler ──────────────────────────────────────────────────────
echo [4/4] Starting Metro Bundler on port 8081...
start "SchoolMS Metro" cmd /k "cd /d "%~dp0SchoolMS" && npx react-native start --port 8081 --reset-cache"

:: Wait for Metro to warm up, then launch app
timeout /t 15 /nobreak >nul

echo.
echo Launching app on connected phone...
adb shell am force-stop com.schoolms >nul 2>&1
timeout /t 1 /nobreak >nul
adb shell am start -n com.schoolms/.MainActivity >nul 2>&1

echo.
echo ================================================
echo   All services started!
echo.
echo   Backend : http://localhost:5000
echo   Metro   : http://localhost:8081
echo   App     : Launching on phone...
echo.
echo   LOGIN CREDENTIALS (password: School@123)
echo   Admin    : admin
echo   Teachers : ali_teacher / ayesha_teacher / bilal_teacher
echo   Students : zain_student / sara_student / omar_student
echo              fatima_student / hamza_student
echo   Parents  : tariq_parent / nadia_parent / kamran_parent
echo ================================================
echo.
echo   Close this window whenever you want to stop.
pause
