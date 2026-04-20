@echo off
REM Setup Script for SchoolMS - Run this as Administrator

echo ===========================================
echo   SchoolMS - Complete Setup Script
echo ===========================================
echo.

REM Start MySQL Service
echo [1/4] Starting MySQL Service...
sc start MySQL84
timeout /t 2 /nobreak

REM Wait for MySQL to be ready
echo [2/4] Waiting for MySQL to be ready...
timeout /t 3 /nobreak

REM Create Database and Load Schema
echo [3/4] Creating Database...
"C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root < schema.sql

if errorlevel 1 (
    echo.
    echo ERROR: Database setup failed. Please check MySQL is running and root password is correct.
    echo.
    echo If you see "Access denied for user 'root'@'localhost'", MySQL might have set a default password.
    echo Try running:
    echo   "C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe" -u root -p
    pause
    exit /b 1
)

echo [4/4] Database setup complete!
echo.
echo ===========================================
echo Setup Complete!
echo ===========================================
echo.
echo Next steps:
echo 1. Start Backend: npm run dev
echo 2. App should auto-install on your phone
echo 3. Login with test credentials
echo.
pause
