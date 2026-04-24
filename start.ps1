# SchoolMS — One-Command Startup Script
# Usage: Right-click → "Run with PowerShell"  OR  powershell -ExecutionPolicy Bypass -File start.ps1

$root    = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend = Join-Path $root "SchoolMS-Backend"
$frontend= Join-Path $root "SchoolMS"

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SchoolMS — Starting All Services" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. ADB check & port forward ────────────────────────────────────────────
Write-Host "[1/4] Checking Android device..." -ForegroundColor Yellow
$devices = adb devices 2>$null | Select-String "device$"
if ($devices) {
    Write-Host "      Device connected." -ForegroundColor Green
    adb reverse tcp:8081 tcp:8081 | Out-Null
    Write-Host "      Port 8081 forwarded to phone." -ForegroundColor Green
} else {
    Write-Host "      WARNING: No device found. Connect phone + enable USB Debugging." -ForegroundColor Red
}

# ── 2. Backend ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[2/4] Starting Backend (port 5000)..." -ForegroundColor Yellow
Start-Process "cmd" -ArgumentList "/k cd /d `"$backend`" && node server.js" -WindowStyle Normal

# Wait until backend responds
$backendReady = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $r = Invoke-WebRequest "http://localhost:5000/api/auth/login" -Method POST `
             -ContentType "application/json" -Body '{}' -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -lt 500) { $backendReady = $true; break }
    } catch {}
}
if ($backendReady) {
    Write-Host "      Backend ready." -ForegroundColor Green
} else {
    Write-Host "      Backend slow to start — continuing anyway." -ForegroundColor Yellow
}

# ── 3. Metro Bundler ───────────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/4] Starting Metro Bundler (port 8081)..." -ForegroundColor Yellow
Start-Process "cmd" -ArgumentList "/k cd /d `"$frontend`" && npx react-native start --port 8081 --reset-cache" -WindowStyle Normal

# Wait until Metro responds
$metroReady = $false
for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 2
    try {
        $r = Invoke-WebRequest "http://localhost:8081/status" -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.Content -like "*running*") { $metroReady = $true; break }
    } catch {}
    Write-Host "      Waiting for Metro... ($([int](($i+1)*2))s)" -ForegroundColor DarkGray
}
if ($metroReady) {
    Write-Host "      Metro ready." -ForegroundColor Green
} else {
    Write-Host "      Metro slow to start — launching app anyway." -ForegroundColor Yellow
}

# ── 4. Launch app on phone ─────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/4] Launching app on phone..." -ForegroundColor Yellow
adb shell am force-stop com.schoolms | Out-Null
Start-Sleep -Seconds 1
adb shell am start -n com.schoolms/.MainActivity | Out-Null
Write-Host "      App launched." -ForegroundColor Green

# ── Summary ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "  All services running!" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend  : http://localhost:5000" -ForegroundColor White
Write-Host "  Metro    : http://localhost:8081" -ForegroundColor White
Write-Host "  App      : Running on phone" -ForegroundColor White
Write-Host ""
Write-Host "  CREDENTIALS  (password: School@123)" -ForegroundColor Yellow
Write-Host "  Admin    : admin" -ForegroundColor White
Write-Host "  Teachers : ali_teacher / ayesha_teacher / bilal_teacher" -ForegroundColor White
Write-Host "  Students : zain_student / sara_student / omar_student" -ForegroundColor White
Write-Host "             fatima_student / hamza_student" -ForegroundColor White
Write-Host "  Parents  : tariq_parent / nadia_parent / kamran_parent" -ForegroundColor White
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit this window (services keep running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
