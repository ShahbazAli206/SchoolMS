"""
SchoolMS — Auto Git Commit & Push Daemon
Runs forever, checks for changes every 10 minutes, commits and pushes automatically.

Run:  python git_push.py
Stop: Ctrl+C
"""

import os, subprocess, datetime, time, signal, sys

ROOT = os.path.dirname(os.path.abspath(__file__))

G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"; C = "\033[96m"; W = "\033[0m"; B = "\033[1m"; DIM = "\033[2m"

INTERVAL = 600   # 10 minutes in seconds

total_commits = 0
running = True

def ok(msg):   print(f"  {G}✔{W}  {msg}")
def warn(msg): print(f"  {Y}⚠{W}  {msg}")
def err(msg):  print(f"  {R}✘{W}  {msg}")
def info(msg): print(f"  {C}•{W}  {msg}")
def run(cmd):  return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=ROOT)

def handle_exit(sig, frame):
    print(f"\n\n  {Y}{B}Daemon stopped by user (Ctrl+C){W}\n")
    sys.exit(0)

signal.signal(signal.SIGINT, handle_exit)

def print_header():
    os.system("cls")
    print(f"""
{C}{B}  ╔══════════════════════════════════════════════╗
  ║    SchoolMS — Auto Git Push Daemon           ║
  ║    Checks every 10 minutes • Ctrl+C to stop  ║
  ╚══════════════════════════════════════════════╝{W}
""")

def try_commit_and_push():
    global total_commits

    now    = datetime.datetime.now()
    time_s = now.strftime("%I:%M %p")
    date_s = now.strftime("%d/%m/%Y")
    commit_msg = f"Auto commit code on {time_s}, {date_s}"

    info(f"Checking for changes at {B}{time_s}{W}...")

    status = run("git status --short")
    if not status.stdout.strip():
        warn("No changes detected.")
        return False

    print(f"\n  {Y}Changed files:{W}")
    for line in status.stdout.strip().splitlines():
        print(f"    {DIM}{line}{W}")

    # Stage
    r = run("git add -A")
    if r.returncode != 0:
        err(f"git add failed: {r.stderr.strip()}")
        return False

    # Commit
    r = run(f'git commit -m "{commit_msg}"')
    if r.returncode != 0:
        err(f"git commit failed: {r.stderr.strip()}")
        return False

    # Push
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
    """Show a live countdown ticker, interruptible by Ctrl+C."""
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
    print()  # newline after countdown ends

# ── Main loop ─────────────────────────────────────────────────────────────────
print_header()
print(f"  {G}Daemon started.{W}  Repo: {B}{ROOT}{W}\n")

while True:
    now_s = datetime.datetime.now().strftime("%I:%M %p, %d/%m/%Y")
    print(f"\n  {C}{'─'*50}{W}")
    print(f"  {DIM}Check time: {now_s}{W}")

    try_commit_and_push()

    countdown(INTERVAL)
