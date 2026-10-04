#!/usr/bin/env python3
"""
Regenerate platform SRTs from an existing timing file.

Separate from tts_build.py so subtitle wrapping can be re-tuned without
re-synthesising the voiceover. Cues are wrapped to at most two lines of
~42 characters, which is what TikTok, Reels and YouTube expect; longer
single-line cues get re-wrapped by the player in unpredictable places.
"""

import json
import math
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MAX_LINE = 42


def wrap(text, limit=MAX_LINE):
    words = text.split()
    lines, cur = [], ""
    for w in words:
        cand = f"{cur} {w}".strip()
        if len(cand) <= limit or not cur:
            cur = cand
        else:
            lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)

    if len(lines) <= 2:
        return "\n".join(lines)

    # Too long for two lines. Try the most balanced two-way split, but only
    # take it if both halves still fit; otherwise keep the three-line wrap,
    # which reads better than two overlong lines.
    mid = len(text) // 2
    best, gap, pos = None, 10**9, 0
    for w in words[:-1]:
        pos += len(w) + 1
        if abs(pos - mid) < gap:
            gap, best = abs(pos - mid), pos
    a, b = text[:best].strip(), text[best:].strip()
    if max(len(a), len(b)) <= limit:
        return a + "\n" + b
    return "\n".join(lines)


def ts(t):
    ms = int(round((t - math.floor(t)) * 1000))
    s = int(t) % 60
    if ms == 1000:
        s, ms = s + 1, 0
    return f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{s:02d},{ms:03d}"


def build(lang):
    data = json.loads((ROOT / "build" / f"timing_{lang}.json").read_text())
    out = []
    for i, ln in enumerate(data["lines"], 1):
        out.append(f"{i}\n{ts(ln['start'])} --> {ts(ln['end'])}\n{wrap(ln['text'])}\n")
    path = ROOT / "out" / f"subs_{lang}.srt"
    path.write_text("\n".join(out), encoding="utf-8")
    longest = max(
        len(l) for ln in data["lines"] for l in wrap(ln["text"]).split("\n")
    )
    print(f"[{lang}] {len(data['lines'])} cues, longest line {longest} chars -> {path}")


if __name__ == "__main__":
    for lang in (sys.argv[1:] or ["en", "ru"]):
        build(lang)
