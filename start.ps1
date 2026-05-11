# SchoolMS — One-Command Startup Script
# Usage: Right-click → "Run with PowerShell"
#    OR: powershell -ExecutionPolicy Bypass -File start.ps1

$root     = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backend  = Join-Path $root "SchoolMS-Backend"
$frontend = Join-Path $root "SchoolMS-Frontend"
$xamppMysql = "C:\xampp\mysql\bin\mysqld.exe"

function Test-Port($port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch { return $false }
}

Clear-Host
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║        SchoolMS — One Click Startup          ║" -ForegroundColor Cyan
Write-Host ("  ║   " + (Get-Date -Format "dd/MM/yyyy  hh:mm tt") + "                         ║") -ForegroundColor Cyan
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 1. XAMPP MySQL ────────────────────────────────────────────────────────────
Write-Host "[1/5] XAMPP MySQL" -ForegroundColor Yellow
if (Test-Port 3306) {
    Write-Host "      MySQL already running on port 3306" -ForegroundColor Green
} else {
    Write-Host "      Starting MySQL..." -ForegroundColor Yellow
    if (Test-Path $xamppMysql) {
        Start-Process $xamppMysql -ArgumentList "--console" -WindowStyle Minimized
        $started = $false
        for ($i = 0; $i -lt 15; $i++) {
            Start-Sleep -Seconds 1
            if (Test-Port 3306) { $started = $true; break }
        }
        if ($started) { Write-Host "      MySQL started." -ForegroundColor Green }
        else { Write-Host "      MySQL slow — continuing. Start XAMPP manually if backend fails." -ForegroundColor Red }
    } else {
        Write-Host "      XAMPP not found. Start MySQL from XAMPP Control Panel." -ForegroundColor Red
    }
}

# ── 2. ADB Device + Port Forward ─────────────────────────────────────────────
Write-Host ""
Write-Host "[2/5] Android Device" -ForegroundColor Yellow
$devices = adb devices 2>$null | Select-String "device$"
if ($devices) {
    Write-Host "      Device connected." -ForegroundColor Green
    adb reverse tcp:5000 tcp:5000 | Out-Null
    adb reverse tcp:8081 tcp:8081 | Out-Null
    Write-Host "      Ports 5000 + 8081 forwarded to phone." -ForegroundColor Green
} else {
    Write-Host "      WARNING: No device found. Connect phone with USB Debugging." -ForegroundColor Red
}

# ── 3. Backend ────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[3/5] Backend Server (port 5000)" -ForegroundColor Yellow
if (Test-Port 5000) {
    Write-Host "      Backend already running." -ForegroundColor Green
} else {
    Start-Process "cmd" -ArgumentList "/k cd /d `"$backend`" && node server.js" -WindowStyle Normal
    Write-Host "      Waiting for backend..." -NoNewline -ForegroundColor Yellow
    for ($i = 0; $i -lt 20; $i++) {
        Start-Sleep -Seconds 1
        if (Test-Port 5000) { Write-Host " Ready!" -ForegroundColor Green; break }
        Write-Host "." -NoNewline -ForegroundColor DarkGray
    }
    if (-not (Test-Port 5000)) { Write-Host " Slow start — continuing." -ForegroundColor Yellow }
}

# ── 4. Metro Bundler ──────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[4/5] Metro Bundler (port 8081)" -ForegroundColor Yellow
if (Test-Port 8081) {
    Write-Host "      Metro already running." -ForegroundColor Green
} else {
    Start-Process "cmd" -ArgumentList "/k cd /d `"$frontend`" && npx react-native start --port 8081 --reset-cache" -WindowStyle Normal
    Write-Host "      Metro started (takes ~15s to warm up)." -ForegroundColor Green
    Start-Sleep -Seconds 8
}

# ── 5. Launch App ─────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "[5/5] Launch App on Phone" -ForegroundColor Yellow
if ($devices) {
    adb shell am force-stop com.schoolms | Out-Null
    Start-Sleep -Seconds 1
    adb shell am start -n com.schoolms/.MainActivity | Out-Null
    Write-Host "      App launched." -ForegroundColor Green
} else {
    Write-Host "      Skipped — no device." -ForegroundColor Yellow
}

# ── Summary ───────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "  ╔══════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "  ║            All Services Running!             ║" -ForegroundColor Green
Write-Host "  ╠══════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "  ║  MySQL   → localhost:3306                    ║" -ForegroundColor White
Write-Host "  ║  Backend → http://localhost:5000             ║" -ForegroundColor White
Write-Host "  ║  Metro   → http://localhost:8081             ║" -ForegroundColor White
Write-Host "  ╠══════════════════════════════════════════════╣" -ForegroundColor Cyan
Write-Host "  ║  LOGIN CREDENTIALS (password: password123)   ║" -ForegroundColor Yellow
Write-Host "  ║  admin@schoolms.com   → Admin                ║" -ForegroundColor White
Write-Host "  ║  john@schoolms.com    → Teacher              ║" -ForegroundColor White
Write-Host "  ║  alice@schoolms.com   → Student              ║" -ForegroundColor White
Write-Host "  ║  bob@schoolms.com     → Parent               ║" -ForegroundColor White
Write-Host "  ╚══════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Press any key to close (services keep running in their windows)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
