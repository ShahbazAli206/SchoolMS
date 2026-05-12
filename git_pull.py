"""
SchoolMS — Git Pull + DB Restore
Pulls latest code from the remote, and if database/dump.sql changed,
imports it into the local MySQL (overwrites the local school_management_db).

Run:  python git_pull.py

Optional flags:
    --no-db         Skip the database import step (just git pull).
    --force-db      Always import even if dump file is unchanged.
    --yes           Don't prompt; auto-confirm DB import.
"""

import os, subprocess, sys, hashlib, datetime

ROOT       = os.path.dirname(os.path.abspath(__file__))
DUMP_DIR   = os.path.join(ROOT, "database")
DUMP_FILE  = os.path.join(DUMP_DIR, "dump.sql")
HASH_FILE  = os.path.join(DUMP_DIR, ".last_imported_hash")
ENV_FILE   = os.path.join(ROOT, "SchoolMS-Backend", ".env")
MYSQL_BIN  = r"C:\xampp\mysql\bin"

G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"; C = "\033[96m"; W = "\033[0m"; B = "\033[1m"; DIM = "\033[2m"

try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except Exception:
    pass

ARGS = sys.argv[1:]
NO_DB      = "--no-db"     in ARGS
FORCE_DB   = "--force-db"  in ARGS
AUTO_YES   = "--yes"       in ARGS

def ok(msg):   print(f"  {G}✔{W}  {msg}")
def warn(msg): print(f"  {Y}⚠{W}  {msg}")
def err(msg):  print(f"  {R}✘{W}  {msg}")
def info(msg): print(f"  {C}•{W}  {msg}")
def step(n, msg): print(f"\n{C}{B}[{n}]{W} {B}{msg}{W}")
def run(cmd, cwd=ROOT):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=cwd)

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

def file_hash(path):
    if not os.path.exists(path): return None
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""): h.update(chunk)
    return h.hexdigest()

def read_text(path):
    try:
        with open(path, "r", encoding="utf-8") as f: return f.read().strip()
    except Exception: return None

def write_text(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f: f.write(content)

def confirm(prompt):
    if AUTO_YES: return True
    try:
        ans = input(f"  {Y}?{W}  {prompt} [y/N]: ").strip().lower()
        return ans in ("y", "yes")
    except (KeyboardInterrupt, EOFError):
        print()
        return False

# ── Header ───────────────────────────────────────────────────────────────────
os.system("cls")
print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║      SchoolMS — Pull Code + Restore DB       ║
  ║    {datetime.datetime.now().strftime('%d/%m/%Y  %I:%M %p'):<40}  ║
  ╚══════════════════════════════════════════════╝{W}
""")

# ── Step 1: git pull ─────────────────────────────────────────────────────────
step(1, "Pulling latest changes")
status = run("git status --short").stdout.strip()
if status:
    warn("You have local uncommitted changes:")
    for line in status.splitlines():
        print(f"    {DIM}{line}{W}")
    if not confirm("Continue with pull? (your local changes will remain unstaged)"):
        err("Aborted.")
        sys.exit(1)

r = run("git pull")
if r.returncode != 0:
    err(f"git pull failed: {r.stderr.strip() or r.stdout.strip()}")
    sys.exit(1)
print(f"  {DIM}{r.stdout.strip()}{W}")
ok("Pull complete")

# ── Step 2: check DB dump status ─────────────────────────────────────────────
step(2, "Checking database/dump.sql")

if NO_DB:
    warn("Skipped — --no-db flag was passed.")
    sys.exit(0)

if not os.path.exists(DUMP_FILE):
    warn(f"No dump file found at {DUMP_FILE} — nothing to import.")
    sys.exit(0)

current_hash = file_hash(DUMP_FILE)
last_hash    = read_text(HASH_FILE)

size_kb = os.path.getsize(DUMP_FILE) // 1024
info(f"Dump file: {os.path.basename(DUMP_FILE)} ({size_kb} KB)")

if last_hash == current_hash and not FORCE_DB:
    ok(f"DB is already in sync (dump unchanged since last import).")
    info(f"{DIM}Use --force-db to re-import anyway.{W}")
    sys.exit(0)

# ── Step 3: confirm + import ─────────────────────────────────────────────────
step(3, "Importing dump into local MySQL")
cfg = load_db_config()
print(f"  Target: {B}{cfg['DB_NAME']}{W} on {cfg['DB_HOST']}:{cfg['DB_PORT']} (user: {cfg['DB_USER']})")
warn(f"This will {R}{B}OVERWRITE{W} your local {B}{cfg['DB_NAME']}{W} database.")

if not confirm("Import now?"):
    err("Aborted by user. Run again with --yes to skip prompt.")
    sys.exit(1)

mysql_exe = os.path.join(MYSQL_BIN, "mysql.exe")
if not os.path.exists(mysql_exe):
    err(f"mysql.exe not found at {mysql_exe}")
    sys.exit(1)

# The dump includes `CREATE DATABASE IF NOT EXISTS` and `USE` because of
# `--databases` in mysqldump, so we don't need to pre-select a DB.
cmd = [mysql_exe, f"--host={cfg['DB_HOST']}", f"--port={cfg['DB_PORT']}",
       f"--user={cfg['DB_USER']}", "--default-character-set=utf8mb4"]
if cfg["DB_PASSWORD"]:
    cmd.insert(4, f"--password={cfg['DB_PASSWORD']}")

info("Importing... (may take 10-60s depending on dump size)")
with open(DUMP_FILE, "r", encoding="utf-8") as f:
    r = subprocess.run(cmd, stdin=f, capture_output=True, text=True)

if r.returncode != 0:
    err(f"Import failed: {r.stderr.strip()[:400]}")
    sys.exit(1)

ok(f"{G}{B}Database imported successfully.{W}")

# Remember which dump we imported so we don't keep re-importing.
write_text(HASH_FILE, current_hash)

print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║              Sync Complete!                  ║
  ╠══════════════════════════════════════════════╣
  ║  ✓ Code pulled                               ║
  ║  ✓ Database restored from dump.sql           ║
  ╚══════════════════════════════════════════════╝{W}
""")
