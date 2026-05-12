"""
SchoolMS — Auto Git Commit & Push Daemon (with DB sync)
Runs forever. Every 10 minutes:
  1. Dumps the MySQL database to  database/dump.sql
  2. Stages all changes (code + DB dump)
  3. Commits + pushes if anything changed

Run:  python git_push.py
Stop: Ctrl+C

Optional flags:
    --once          Run a single pass and exit (no loop).
    --no-db         Skip the database dump step.
    --interval N    Override the check interval (seconds). Default 600 (10 min).
"""

import os, subprocess, datetime, time, signal, sys, hashlib

ROOT       = os.path.dirname(os.path.abspath(__file__))
DUMP_DIR   = os.path.join(ROOT, "database")
DUMP_FILE  = os.path.join(DUMP_DIR, "dump.sql")
ENV_FILE   = os.path.join(ROOT, "SchoolMS-Backend", ".env")
MYSQL_BIN  = r"C:\xampp\mysql\bin"

G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"; C = "\033[96m"; W = "\033[0m"; B = "\033[1m"; DIM = "\033[2m"

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

# ── Parse args ───────────────────────────────────────────────────────────────
ARGS = sys.argv[1:]
ONCE   = "--once"  in ARGS
NO_DB  = "--no-db" in ARGS
INTERVAL = 600
if "--interval" in ARGS:
    try:    INTERVAL = int(ARGS[ARGS.index("--interval") + 1])
    except: pass

total_commits = 0

def ok(msg):   print(f"  {G}✔{W}  {msg}")
def warn(msg): print(f"  {Y}⚠{W}  {msg}")
def err(msg):  print(f"  {R}✘{W}  {msg}")
def info(msg): print(f"  {C}•{W}  {msg}")
def run(cmd, cwd=ROOT, env=None):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd, env=env)

def handle_exit(sig, frame):
    print(f"\n\n  {Y}{B}Daemon stopped by user (Ctrl+C){W}\n")
    sys.exit(0)
signal.signal(signal.SIGINT, handle_exit)

# ── Read DB credentials from backend .env ────────────────────────────────────
def load_db_config():
    cfg = {"DB_HOST":"127.0.0.1","DB_PORT":"3306","DB_NAME":"school_management_db","DB_USER":"root","DB_PASSWORD":""}
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line: continue
                k, _, v = line.partition("=")
                if k in cfg: cfg[k] = v.strip().strip('"').strip("'")
    return cfg

# ── DB dump ──────────────────────────────────────────────────────────────────
def file_hash(path):
    if not os.path.exists(path): return None
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

def dump_database():
    """Dump MySQL to database/dump.sql. Returns True on success."""
    cfg = load_db_config()
    mysqldump = os.path.join(MYSQL_BIN, "mysqldump.exe")
    if not os.path.exists(mysqldump):
        err(f"mysqldump not found at {mysqldump}")
        return False
    if not os.path.exists(DUMP_DIR):
        os.makedirs(DUMP_DIR, exist_ok=True)

    pre_hash = file_hash(DUMP_FILE)

    cmd = [
        mysqldump,
        f"--host={cfg['DB_HOST']}",
        f"--port={cfg['DB_PORT']}",
        f"--user={cfg['DB_USER']}",
        "--databases", cfg["DB_NAME"],
        "--add-drop-database",
        "--add-drop-table",
        "--single-transaction",
        "--quick",
        "--routines",
        "--triggers",
        "--no-tablespaces",
        "--skip-dump-date",          # stable output → no spurious commits
        "--default-character-set=utf8mb4",
        "--result-file=" + DUMP_FILE,
    ]
    if cfg["DB_PASSWORD"]:
        cmd.insert(4, f"--password={cfg['DB_PASSWORD']}")

    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        err(f"mysqldump failed: {r.stderr.strip()[:200]}")
        return False

    post_hash = file_hash(DUMP_FILE)
    if pre_hash == post_hash:
        info(f"{DIM}DB dump unchanged ({os.path.getsize(DUMP_FILE) // 1024} KB){W}")
    else:
        ok(f"DB dump refreshed ({os.path.getsize(DUMP_FILE) // 1024} KB) → {os.path.basename(DUMP_FILE)}")
    return True

# ── Header ───────────────────────────────────────────────────────────────────
def print_header():
    os.system("cls")
    print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║    SchoolMS — Auto Git Push Daemon           ║
  ║    Checks every {INTERVAL // 60} minutes • Ctrl+C to stop      ║
  ║    {'+ MySQL dump per cycle' if not NO_DB else 'DB dump disabled (--no-db)':<41}  ║
  ╚══════════════════════════════════════════════╝{W}
""")

def try_commit_and_push():
    global total_commits

    now    = datetime.datetime.now()
    time_s = now.strftime("%I:%M %p")
    date_s = now.strftime("%d/%m/%Y")
    commit_msg = f"Auto commit code on {time_s}, {date_s}"

    info(f"Checking for changes at {B}{time_s}{W}...")

    # Step 1: dump DB (so it's included in the commit if anything changed)
    if not NO_DB:
        dump_database()

    # Step 2: stage & check
    status = run("git status --short")
    if not status.stdout.strip():
        warn("No changes detected.")
        return False

    print(f"\n  {Y}Changed files:{W}")
    for line in status.stdout.strip().splitlines():
        print(f"    {DIM}{line}{W}")

    r = run("git add -A")
    if r.returncode != 0:
        err(f"git add failed: {r.stderr.strip()}")
        return False

    r = run(f'git commit -m "{commit_msg}"')
    if r.returncode != 0:
        err(f"git commit failed: {r.stderr.strip()}")
        return False

    r = run("git push")
    if r.returncode != 0:
        branch = run("git branch --show-current").stdout.strip()
        r2 = run(f"git push --set-upstream origin {branch}")
        if r2.returncode != 0:
            err(f"Push failed: {r.stderr.strip()}")
            warn("Check internet / GitHub credentials.")
            return False
        ok(f"Pushed (set upstream: origin/{branch})")
    else:
        ok("Pushed to remote")

    total_commits += 1
    ok(f'{G}{B}Commit #{total_commits}:{W} "{commit_msg}"')
    return True

def countdown(seconds):
    for remaining in range(seconds, 0, -1):
        mins, secs = divmod(remaining, 60)
        next_check = datetime.datetime.now() + datetime.timedelta(seconds=remaining)
        print(
            f"\r  {DIM}Next check in {B}{mins:02d}:{secs:02d}{W}{DIM}"
            f"  (at {next_check.strftime('%I:%M %p')})  "
            f"  Total commits: {G}{B}{total_commits}{W}   {W}",
            end="", flush=True
        )
        time.sleep(1)
    print()

# ── Main loop ────────────────────────────────────────────────────────────────
print_header()
print(f"  {G}Daemon started.{W}  Repo: {B}{ROOT}{W}")
if not NO_DB:
    print(f"  {DIM}DB dump → {DUMP_FILE}{W}")
print()

if ONCE:
    try_commit_and_push()
    print(f"\n  {G}{B}--once mode: exiting after single pass.{W}\n")
    sys.exit(0)

while True:
    now_s = datetime.datetime.now().strftime("%I:%M %p, %d/%m/%Y")
    print(f"\n  {C}{'─'*50}{W}")
    print(f"  {DIM}Check time: {now_s}{W}")
    try_commit_and_push()
    countdown(INTERVAL)
