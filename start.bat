@echo off
title SchoolMS — One Click Start
color 0A
cls

echo.
echo  =====================================================
echo    SchoolMS — One Click Startup
echo  =====================================================
echo.

:: ── Check Python ─────────────────────────────────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found. Running legacy bat startup...
    goto LEGACY
)

:: ── Run Python launcher ───────────────────────────────────────────────────────
python "%~dp0start.py"
goto END

:LEGACY
:: ── Fallback: plain bat startup ──────────────────────────────────────────────
echo  [1/5] Starting XAMPP MySQL...
net start mysql >nul 2>&1
if errorlevel 1 (
    start "" "C:\xampp\mysql\bin\mysqld.exe" --console
    timeout /t 4 /nobreak >nul
)
echo       MySQL started.

echo  [2/5] Checking ADB device...
adb devices 2>nul | findstr /V "List" | findstr "device" >nul
if not errorlevel 1 (
    adb reverse tcp:5000 tcp:5000 >nul 2>&1
    adb reverse tcp:8081 tcp:8081 >nul 2>&1
    echo       Device found. Ports forwarded.
) else (
    echo       WARNING: No device. Connect phone with USB Debugging.
)

echo  [3/5] Starting Backend...
start "SchoolMS Backend" cmd /k "cd /d "%~dp0SchoolMS-Backend" && node server.js"
timeout /t 4 /nobreak >nul

echo  [4/5] Starting Metro Bundler...
start "SchoolMS Metro" cmd /k "cd /d "%~dp0SchoolMS-Frontend" && npx react-native start --port 8081 --reset-cache"
timeout /t 15 /nobreak >nul

echo  [5/5] Launching app on phone...
adb shell am force-stop com.schoolms >nul 2>&1
timeout /t 1 /nobreak >nul
adb shell am start -n com.schoolms/.MainActivity >nul 2>&1

echo.
echo  =====================================================
echo    All services started!
echo    Backend : http://localhost:5000
echo    Metro   : http://localhost:8081
echo    Login   : admin@schoolms.com / password123
echo  =====================================================
echo.
pause

:END
