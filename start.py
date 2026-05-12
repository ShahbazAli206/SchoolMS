"""
SchoolMS — One-Click Startup
Run: python start.py

Optional flags:
    --reset-cache   Pass --reset-cache to Metro (clears the JS bundle cache).
                    Skip on normal runs — saves ~30s startup time.
    --no-app        Don't auto-launch the app on the phone (useful if you just
                    want to keep Metro/Backend running and reload from the phone).
"""

import os, sys, time, socket, subprocess, datetime
import urllib.request, urllib.error

# Force UTF-8 stdout so box-drawing characters render on Windows cmd
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass
os.system("chcp 65001 > nul")

ROOT     = os.path.dirname(os.path.abspath(__file__))
BACKEND  = os.path.join(ROOT, "SchoolMS-Backend")
FRONTEND = os.path.join(ROOT, "SchoolMS-Frontend")
XAMPP    = r"C:\xampp"

ARGS = set(sys.argv[1:])
RESET_CACHE = "--reset-cache" in ARGS
NO_APP      = "--no-app" in ARGS

# ── Colours ──────────────────────────────────────────────────────────────────
G  = "\033[92m";  Y  = "\033[93m";  R  = "\033[91m"
C  = "\033[96m";  W  = "\033[0m";   B  = "\033[1m"

def ok(msg):   print(f"  {G}✔{W}  {msg}")
def warn(msg): print(f"  {Y}⚠{W}  {msg}")
def err(msg):  print(f"  {R}✘{W}  {msg}")
def step(n, msg): print(f"\n{C}{B}[{n}]{W} {B}{msg}{W}")

def port_open(host, port, timeout=1.5):
    try:
        with socket.create_connection((host, port), timeout):
            return True
    except OSError:
        return False

def http_get(url, timeout=2):
    """Return response body or None on failure."""
    try:
        with urllib.request.urlopen(url, timeout=timeout) as r:
            return r.read().decode("utf-8", errors="ignore")
    except (urllib.error.URLError, OSError, socket.timeout):
        return None

def run(cmd, **kw):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, **kw)

def open_terminal(title, cmd, cwd):
    """Open a new cmd window and run cmd inside it. /MAX keeps the window large
    so the user can find it on the taskbar."""
    subprocess.Popen(
        f'start "{title}" /MAX cmd /k "{cmd}"',
        shell=True, cwd=cwd
    )

def metro_ready(timeout=90):
    """Block until Metro's /status returns 'packager-status:running'.
    Just checking the port is open is NOT enough — Metro listens before it can
    serve. This is what fixes the 'Unable to load script' red screen."""
    deadline = time.time() + timeout
    while time.time() < deadline:
        body = http_get("http://127.0.0.1:8081/status")
        if body and "packager-status:running" in body:
            return True
        time.sleep(1)
    return False

# ── Header ───────────────────────────────────────────────────────────────────
os.system("cls")
print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║        SchoolMS — One Click Startup          ║
  ║   {datetime.datetime.now().strftime('%d/%m/%Y  %I:%M %p'):<40}║
  ╚══════════════════════════════════════════════╝{W}
""")
if RESET_CACHE: print(f"  {Y}--reset-cache{W} mode: Metro cache will be cleared (slower)")
if NO_APP:      print(f"  {Y}--no-app{W} mode: app will not be auto-launched")

# ── Step 1: XAMPP MySQL ──────────────────────────────────────────────────────
step(1, "XAMPP MySQL")
if port_open("127.0.0.1", 3306):
    ok("MySQL already running on port 3306")
else:
    warn("MySQL not running — starting XAMPP MySQL...")
    mysql_start = os.path.join(XAMPP, "mysql", "bin", "mysqld.exe")
    if os.path.exists(mysql_start):
        subprocess.Popen([mysql_start, "--console"], cwd=os.path.join(XAMPP, "mysql", "bin"))
        for i in range(15):
            time.sleep(1)
            if port_open("127.0.0.1", 3306):
                ok("MySQL started")
                break
            print(f"     Waiting... ({i+1}s)", end="\r")
        else:
            err("MySQL did not start. Open XAMPP Control Panel and start MySQL manually.")
            input("\nPress Enter to continue anyway...")
    else:
        err(f"XAMPP not found at {XAMPP}. Start MySQL manually.")
        input("\nPress Enter to continue anyway...")

# ── Step 2: ADB device + port forward ────────────────────────────────────────
step(2, "Android Device")
adb_result = run("adb devices")
lines = [l for l in adb_result.stdout.splitlines() if l.strip() and "List" not in l and "device" in l]
if lines:
    device_id = lines[0].split()[0]
    ok(f"Device connected: {device_id}")
    run("adb reverse tcp:5000 tcp:5000")
    run("adb reverse tcp:8081 tcp:8081")
    ok("ADB reverse tunnels set  (5000 + 8081)")
else:
    warn("No device found. Connect phone via USB with USB Debugging ON.")
    warn("App will NOT launch automatically — start it manually after Metro loads.")

# ── Step 3: Backend ──────────────────────────────────────────────────────────
step(3, "Backend Server (port 5000)")
if port_open("127.0.0.1", 5000):
    ok("Backend already running on port 5000")
else:
    open_terminal("SchoolMS-Backend", "node server.js", BACKEND)
    print("     Waiting for backend to start", end="", flush=True)
    for i in range(20):
        time.sleep(1)
        if port_open("127.0.0.1", 5000):
            print("")
            ok("Backend ready at http://localhost:5000")
            break
        print(".", end="", flush=True)
    else:
        print("")
        warn("Backend slow to start — continuing anyway.")

# ── Step 4: Metro Bundler ────────────────────────────────────────────────────
step(4, "Metro Bundler (port 8081)")
metro_cmd = "npx react-native start --port 8081"
if RESET_CACHE:
    metro_cmd += " --reset-cache"

if port_open("127.0.0.1", 8081):
    warn("Metro already running — reusing existing instance")
else:
    open_terminal("SchoolMS-Metro", metro_cmd, FRONTEND)
    print(f"  {Y}→{W}  Metro window opened (titled {B}SchoolMS-Metro{W}). If you don't see it,")
    print(f"     check your taskbar. It's normal for it to be busy compiling for 20-40s.")

# Now actively wait until Metro can serve bundles.
print("     Waiting for Metro to be ready", end="", flush=True)
ready_at = time.time()
if metro_ready(timeout=90):
    elapsed = int(time.time() - ready_at)
    print("")
    ok(f"Metro is serving bundles  ({elapsed}s)")
else:
    print("")
    err("Metro did not become ready within 90s. Check the SchoolMS-Metro window for errors.")
    warn("If you see 'Unable to load script' on the phone, wait for Metro to finish")
    warn("compiling, then press R+R (or shake → Reload) on the phone.")

# ── Step 5: Launch app ───────────────────────────────────────────────────────
step(5, "Launch App on Phone")
if NO_APP:
    warn("Skipped — --no-app flag was passed.")
elif lines:
    # Small grace period for Metro to be fully steady-state
    time.sleep(2)
    run("adb shell am force-stop com.schoolms")
    time.sleep(1)
    r = run("adb shell am start -n com.schoolms/.MainActivity")
    if "Error" in r.stderr or "Error" in r.stdout:
        warn("Could not launch app — open it manually on your phone.")
    else:
        ok("App launched on phone")
else:
    warn("Skipped — no device connected")

# ── Summary ──────────────────────────────────────────────────────────────────
print(f"""
{C}{B}  ╔══════════════════════════════════════════════════════════════╗
  ║                  All Services Running!                       ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  MySQL    → localhost:3306                                   ║
  ║  Backend  → http://localhost:5000   (window: SchoolMS-Backend)
  ║  Metro    → http://localhost:8081   (window: SchoolMS-Metro)
  ╠══════════════════════════════════════════════════════════════╣
  ║  LOGIN CREDENTIALS                                           ║
  ║  admin@schoolms.com    / School@123  (Admin)                 ║
  ║  john@schoolms.com     / School@123  (Teacher)               ║
  ║  alice@schoolms.com    / School@123  (Student)               ║
  ║  bob@schoolms.com      / School@123  (Parent)                ║
  ╠══════════════════════════════════════════════════════════════╣
  ║  TIPS                                                        ║
  ║  • To restart Metro:    close SchoolMS-Metro window, then    ║
  ║                         re-run:  python start.py             ║
  ║  • To clear Metro cache: python start.py --reset-cache       ║
  ║  • If phone shows red 'Unable to load script', tap RELOAD    ║
  ║    (R, R) — Metro is up but the app loaded too early.        ║
  ╚══════════════════════════════════════════════════════════════╝{W}
""")
input("  Press Enter to close this window (services keep running)...")
