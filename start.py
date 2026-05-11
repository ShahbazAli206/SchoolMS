"""
SchoolMS — One-Click Startup
Run: python start.py
"""

import os, sys, time, socket, subprocess, datetime

ROOT     = os.path.dirname(os.path.abspath(__file__))
BACKEND  = os.path.join(ROOT, "SchoolMS-Backend")
FRONTEND = os.path.join(ROOT, "SchoolMS-Frontend")
XAMPP    = r"C:\xampp"

# ── Colours ──────────────────────────────────────────────────────────────────
G  = "\033[92m"   # green
Y  = "\033[93m"   # yellow
R  = "\033[91m"   # red
C  = "\033[96m"   # cyan
W  = "\033[0m"    # reset
B  = "\033[1m"    # bold

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

def run(cmd, **kw):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, **kw)

def open_terminal(title, cmd, cwd):
    """Open a new cmd window and run cmd inside it."""
    subprocess.Popen(
        f'start "{title}" cmd /k "{cmd}"',
        shell=True, cwd=cwd
    )

# ── Header ────────────────────────────────────────────────────────────────────
os.system("cls")
print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║        SchoolMS — One Click Startup          ║
  ║   {datetime.datetime.now().strftime('%d/%m/%Y  %I:%M %p'):<40}║
  ╚══════════════════════════════════════════════╝{W}
""")

# ── Step 1: XAMPP MySQL ───────────────────────────────────────────────────────
step(1, "XAMPP MySQL")
if port_open("127.0.0.1", 3306):
    ok("MySQL already running on port 3306")
else:
    warn("MySQL not running — starting XAMPP MySQL...")
    mysql_start = os.path.join(XAMPP, "mysql", "bin", "mysqld.exe")
    if os.path.exists(mysql_start):
        subprocess.Popen([mysql_start, "--console"],
                         cwd=os.path.join(XAMPP, "mysql", "bin"))
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

# ── Step 3: Backend ───────────────────────────────────────────────────────────
step(3, "Backend Server (port 5000)")
if port_open("127.0.0.1", 5000):
    ok("Backend already running on port 5000")
else:
    open_terminal("SchoolMS-Backend", "node server.js", BACKEND)
    print("     Waiting for backend to start...", end="", flush=True)
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

# ── Step 4: Metro Bundler ─────────────────────────────────────────────────────
step(4, "Metro Bundler (port 8081)")
if port_open("127.0.0.1", 8081):
    warn("Metro already running — using existing instance")
else:
    open_terminal("SchoolMS-Metro", "npx react-native start --port 8081 --reset-cache", FRONTEND)
    ok("Metro started in new window (takes ~15s to warm up)")

# ── Step 5: Launch app ────────────────────────────────────────────────────────
step(5, "Launch App on Phone")
if lines:
    time.sleep(6)
    run("adb shell am force-stop com.schoolms")
    time.sleep(1)
    r = run("adb shell am start -n com.schoolms/.MainActivity")
    if "Error" in r.stderr or "Error" in r.stdout:
        warn("Could not launch app — open it manually on your phone.")
    else:
        ok("App launched on phone")
else:
    warn("Skipped — no device connected")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║            All Services Running!             ║
  ╠══════════════════════════════════════════════╣
  ║  MySQL   → localhost:3306                    ║
  ║  Backend → http://localhost:5000             ║
  ║  Metro   → http://localhost:8081             ║
  ╠══════════════════════════════════════════════╣
  ║  LOGIN CREDENTIALS                           ║
  ║  admin@schoolms.com    / password123  (Admin)║
  ║  john@schoolms.com     / password123  (Teacher)
  ║  alice@schoolms.com    / password123  (Student)
  ║  bob@schoolms.com      / password123  (Parent)║
  ╚══════════════════════════════════════════════╝{W}
""")
input("  Press Enter to close this window (services keep running)...")
