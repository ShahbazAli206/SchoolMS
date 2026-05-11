"""
SchoolMS — Auto Git Commit & Push
Run: python git_push.py
Or:  python git_push.py "optional custom message"

Commit message format: "Auto commit code on 5:45 PM, 11/05/2026"
"""

import os, sys, subprocess, datetime

ROOT = os.path.dirname(os.path.abspath(__file__))

G = "\033[92m"; Y = "\033[93m"; R = "\033[91m"; C = "\033[96m"; W = "\033[0m"; B = "\033[1m"

def ok(msg):   print(f"  {G}✔{W}  {msg}")
def warn(msg): print(f"  {Y}⚠{W}  {msg}")
def err(msg):  print(f"  {R}✘{W}  {msg}")
def run(cmd):  return subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=ROOT)

os.system("cls")

now     = datetime.datetime.now()
time_s  = now.strftime("%I:%M %p")          # e.g. 05:45 PM
date_s  = now.strftime("%d/%m/%Y")          # e.g. 11/05/2026

# Custom message from CLI arg, or default timestamp message
if len(sys.argv) > 1:
    commit_msg = " ".join(sys.argv[1:])
else:
    commit_msg = f"Auto commit code on {time_s}, {date_s}"

print(f"""
{C}{B}  ╔══════════════════════════════════════════╗
  ║      SchoolMS — Auto Git Push            ║
  ╚══════════════════════════════════════════╝{W}

  Message : {B}{commit_msg}{W}
  Time    : {time_s}  |  Date: {date_s}
""")

# ── 1. Git status ─────────────────────────────────────────────────────────────
print(f"{C}{B}[1]{W} Checking for changes...")
status = run("git status --short")
if not status.stdout.strip():
    warn("No changes detected. Nothing to commit.")
    input("\n  Press Enter to exit...")
    sys.exit(0)

print(f"\n  Changed files:")
for line in status.stdout.strip().splitlines():
    print(f"    {Y}{line}{W}")

# ── 2. Stage all ──────────────────────────────────────────────────────────────
print(f"\n{C}{B}[2]{W} Staging all changes...")
r = run("git add -A")
if r.returncode != 0:
    err(f"git add failed: {r.stderr}")
    input("\n  Press Enter to exit...")
    sys.exit(1)
ok("All changes staged")

# ── 3. Commit ─────────────────────────────────────────────────────────────────
print(f"\n{C}{B}[3]{W} Committing...")
r = run(f'git commit -m "{commit_msg}"')
if r.returncode != 0:
    err(f"git commit failed: {r.stderr.strip()}")
    input("\n  Press Enter to exit...")
    sys.exit(1)
ok(f'Committed: "{commit_msg}"')

# ── 4. Push ───────────────────────────────────────────────────────────────────
print(f"\n{C}{B}[4]{W} Pushing to remote...")
r = run("git push")
if r.returncode != 0:
    # Try setting upstream if first push
    branch = run("git branch --show-current").stdout.strip()
    r2 = run(f"git push --set-upstream origin {branch}")
    if r2.returncode != 0:
        err(f"Push failed: {r.stderr.strip()}")
        warn("Check your internet connection or GitHub credentials.")
        input("\n  Press Enter to exit...")
        sys.exit(1)
    ok(f"Pushed (set upstream: origin/{branch})")
else:
    ok("Pushed to remote")

# ── Summary ───────────────────────────────────────────────────────────────────
print(f"""
{G}{B}  ╔══════════════════════════════════════════╗
  ║           Done! Push Successful          ║
  ╠══════════════════════════════════════════╣
  ║  Commit : {commit_msg[:38]:<38}║
  ║  Time   : {time_s:<38}║
  ║  Date   : {date_s:<38}║
  ╚══════════════════════════════════════════╝{W}
""")
input("  Press Enter to close...")
