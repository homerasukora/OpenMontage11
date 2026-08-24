#!/usr/bin/env python3
"""
Sound design for TRANSMISSION 02.

No sample library and no audio API are reachable here, so every layer is
synthesised from noise and sine: a sub drone bed, tape hiss, an impact per
graphic hit, a shutter tick per stamp, a whoosh per card, one riser into the
payoff, and a hard mute just before the last line.

Cue times come from the same timing/beat files the picture uses, so the mix
re-derives whenever the read changes.
"""

import json
import subprocess
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000


# ------------------------------------------------------------- generators

def env(n, attack, decay, curve=2.2):
    a = max(1, int(attack * SR))
    d = max(1, int(decay * SR))
    e = np.zeros(n, np.float32)
    e[:a] = np.linspace(0, 1, a) ** 0.6
    tail = min(n - a, d)
    if tail > 0:
        e[a:a + tail] = np.linspace(1, 0, tail) ** curve
    return e


def noise(n, rng):
    return rng.normal(0, 1, n).astype(np.float32)


def lowpass(x, cutoff):
    """One-pole low pass, cutoff in Hz."""
    a = np.exp(-2 * np.pi * cutoff / SR)
    out = np.empty_like(x)
    y = 0.0
    for i, v in enumerate(x):
        y = (1 - a) * v + a * y
        out[i] = y
    return out


def highpass(x, cutoff):
    return x - lowpass(x, cutoff)


def impact(rng, dur=0.55, f0=58.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    sweep = f0 * np.exp(-t * 5.0) + 32
    body = np.sin(2 * np.pi * np.cumsum(sweep) / SR) * env(n, 0.002, dur, 3.0)
    click = highpass(noise(n, rng), 2500) * env(n, 0.0005, 0.035, 4.0) * 0.35
    return (body * 0.9 + click).astype(np.float32)


def tick(rng, dur=0.12):
    n = int(dur * SR)
    body = highpass(noise(n, rng), 3200) * env(n, 0.0004, dur, 5.0)
    return (body * 0.7).astype(np.float32)


def whoosh(rng, dur=0.5):
    n = int(dur * SR)
    base = noise(n, rng)
    # band sweeps upward by blending a dark and a bright copy over time
    dark, bright = lowpass(base, 700), highpass(base, 1800)
    mix = np.linspace(0, 1, n, dtype=np.float32)
    body = dark * (1 - mix) + bright * mix
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.6
    return (body * shape * 0.5).astype(np.float32)


def riser(rng, dur=2.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    base = noise(n, rng)
    body = highpass(base, 400) * (np.linspace(0, 1, n) ** 2.4)
    tone = np.sin(2 * np.pi * np.cumsum(np.linspace(70, 240, n)) / SR)
    tone *= np.linspace(0, 1, n) ** 3.0
    return ((body * 0.45 + tone * 0.30)).astype(np.float32)


def drone(n, rng):
    t = np.arange(n) / SR
    swell = 0.55 + 0.45 * np.clip(t / max(t[-1], 1e-6), 0, 1)
    a = np.sin(2 * np.pi * 46 * t) * 0.55
    b = np.sin(2 * np.pi * 69.5 * t + 0.7) * 0.22
    c = np.sin(2 * np.pi * 92 * t + 1.9) * 0.13
    wobble = 1 + 0.05 * np.sin(2 * np.pi * 0.11 * t)
    hiss = lowpass(noise(n, rng), 6500) * 0.02
    return ((a + b + c) * swell * wobble * 0.16 + hiss).astype(np.float32)


# ------------------------------------------------------------------ build

def place(track, clip, at_s, gain=1.0):
    i = int(at_s * SR)
    if i < 0:
        clip, i = clip[-i:], 0
    j = min(len(track), i + len(clip))
    if j > i:
        track[i:j] += clip[: j - i] * gain


def read_wav(path):
    with wave.open(str(path), "rb") as w:
        sr, n, ch = w.getframerate(), w.getnframes(), w.getnchannels()
        a = np.frombuffer(w.readframes(n), np.int16).astype(np.float32) / 32768.0
    if ch == 2:
        a = a.reshape(-1, 2).mean(axis=1)
    assert sr == SR, f"expected {SR} Hz, got {sr}"
    return a


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def main():
    timing = json.loads((ROOT / "build" / "timing_en.json").read_text())
    track = json.loads((ROOT / "beats.json").read_text())
    beats = track["beats"]
    shots = track.get("shots", [])
    start = {l["id"]: l["start"] for l in timing["lines"]}

    vo = read_wav(ROOT / "audio" / "en" / "vo_full.wav")
    total = len(vo) + int(2.0 * SR)
    rng = np.random.default_rng(2027)

    bed = drone(total, rng)
    fx = np.zeros(total, np.float32)

    # one hit per graphic, chosen by what the graphic is
    for b in beats:
        if b["at"] not in start:
            continue
        t = start[b["at"]] + b["lead"]
        kind = b["type"]
        if kind == "card":
            place(fx, whoosh(rng), t - 0.16, 0.42)
            place(fx, impact(rng, 0.42), t, 0.30)
        elif kind == "stamp":
            place(fx, tick(rng), t, 0.85)
            place(fx, impact(rng, 0.30, 74), t, 0.34)
        elif kind == "bigtext":
            place(fx, impact(rng, 0.75, 52), t, 0.62)
        elif kind == "row":
            place(fx, tick(rng, 0.08), t, 0.42)
        elif kind in ("dossier", "genome", "reticle"):
            place(fx, whoosh(rng, 0.38), t - 0.12, 0.26)
            place(fx, tick(rng), t, 0.4)
        elif kind == "redact":
            place(fx, whoosh(rng, 0.55), t, 0.34)
        elif kind == "tag":
            place(fx, tick(rng, 0.07), t, 0.3)

    # every picture cut gets a short transient so the edit is felt, not just seen
    for i, sh in enumerate(shots):
        if i == 0 or sh["at"] not in start:
            continue
        t = start[sh["at"]] + sh["lead"]
        place(fx, whoosh(rng, 0.34), t - 0.14, 0.30)
        place(fx, impact(rng, 0.34, 66), t, 0.26)

    # riser into the payoff, and the brand punctuation. Line ids come from
    # the script, so a re-cut moves these with everything else.
    ids = [l["id"] for l in timing["lines"]]
    payoff, last_line, brand = ids[-3], ids[-2], ids[-1]
    place(fx, riser(rng, 1.7), start[payoff] - 1.7, 0.5)
    place(fx, impact(rng, 1.1, 46), start[brand], 0.6)
    place(fx, tick(rng), start[brand] + 0.85, 0.5)

    # the hard mute: 0.36 s of nothing before the last spoken line
    gap_end = start[last_line] - 0.04
    gap_start = gap_end - 0.36
    duck = np.ones(total, np.float32)
    a, b_ = int(gap_start * SR), int(gap_end * SR)
    fade = int(0.05 * SR)
    duck[a:b_] = 0.0
    duck[max(0, a - fade):a] = np.linspace(1, 0, min(fade, a))
    duck[b_:b_ + fade] = np.linspace(0, 1, fade)

    mix = np.zeros(total, np.float32)
    mix[: len(vo)] += vo
    mix += (bed * 0.20 + fx * 0.42) * duck

    out = ROOT / "audio" / "en" / "mix.wav"
    write_wav(out, mix * 0.92)

    # platform loudness: -14 LUFS with a bed under the voice
    final = ROOT / "audio" / "en" / "mix_master.wav"
    subprocess.run(
        ["ffmpeg", "-y", "-v", "error", "-i", str(out),
         "-af", "alimiter=limit=0.96,loudnorm=I=-14:TP=-1.2:LRA=9",
         "-ar", str(SR), "-ac", "1", str(final)], check=True)
    print(f"mixed {total / SR:.2f}s -> {final}")


if __name__ == "__main__":
    main()
