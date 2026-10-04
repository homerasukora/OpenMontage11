#!/usr/bin/env python3
"""
Print the cut: every shot with its start, length, and the length of the
clip behind it. Warns when a shot is longer than its clip plus the 1 s
freeze pad, which would mean the picture runs out before the shot does.

Run after any change to the script, the voice, or the beat sheet.
"""
import json, re, subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
timing = json.loads((ROOT / "build" / "timing_en.json").read_text())
beats = json.loads((ROOT / "beats.json").read_text())
lines = {l["id"]: l for l in timing["lines"]}
norm = lambda w: re.sub(r"[^a-z0-9']", "", w.lower())

def when(x):
    ln = lines[x["at"]]; base = ln["start"]
    if x.get("word"):
        hits = [w for w in ln["words"] if norm(w["word"]) == norm(x["word"])]
        base = hits[x.get("nth", 1) - 1]["start"]
    return base + x.get("lead", 0)

def clip_len(src):
    p = ROOT / "remotion" / "public" / src
    if not p.suffix == ".mp4" or not p.exists():
        return None
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                          "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout
    return float(out.strip())

shots = sorted(beats["shots"], key=when)
end = timing["total_duration"] + 1.25
print(f"{'#':>2} {'start':>6} {'len':>5}  {'type':5} {'src':14} clip")
bad = 0
for i, s in enumerate(shots):
    a = when(s); b = when(shots[i + 1]) if i + 1 < len(shots) else end
    cl = clip_len(s.get("src", "")) if s["type"] == "clip" else None
    flag = ""
    if cl is not None and (b - a) > cl + 0.02:
        flag = "  <-- shot runs past the clip's freeze pad"; bad += 1
    print(f"{i+1:>2} {a:6.2f} {b-a:5.2f}  {s['type']:5} {s.get('src','-'):14} "
          f"{'' if cl is None else f'{cl:.2f}'}{flag}")
print(f"\n{len(shots)} shots, mean {(end)/len(shots):.2f}s, {bad} warning(s)")
