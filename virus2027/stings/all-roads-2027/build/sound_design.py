#!/usr/bin/env python3
"""
Score for the ALL ROADS -> 2027 sting. No voice.

Synthesised rather than sampled: nothing in this environment reaches a sample
library, and a fifteen-second sting only needs four sounds anyway. Cues are
taken from the same node timings the picture uses, so a change to the
composition's KEYS is a one-line change here too.

  bed      low drone, two detuned sines plus filtered noise, breathing
  tick     a node lands  — short filtered click with an orange-ish ring
  riser    the last leg  — noise sweep into the 2027 hit
  hit      2027          — low thump with a short bright transient

Master lands at -14 LUFS, which is where the episodes sit.
"""

import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.io import wavfile

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "audio"
SR = 48000
DUR = 15.0

# node landings, in seconds — mirrors KEYS in Sting.tsx
NODES = [2.6, 5.6, 8.6, 11.6, 13.2]
RISE_AT = 13.6      # the line leaves the frame
CARD_AT = 13.62     # the final card


def t(n):
    return np.arange(n) / SR


def env(n, a, d, curve=2.0):
    e = np.ones(n)
    ai, di = int(a * SR), int(d * SR)
    if ai:
        e[:ai] = np.linspace(0, 1, ai) ** 0.6
    if di:
        e[-di:] = np.linspace(1, 0, di) ** curve
    return e


def place(buf, sig, at):
    i = int(at * SR)
    j = min(len(buf), i + len(sig))
    if i < len(buf):
        buf[i:j] += sig[: j - i]


def bed(dur):
    n = int(dur * SR)
    x = t(n)
    rng = np.random.default_rng(2027)
    # two detuned sines an octave apart, slowly beating against each other
    s = 0.20 * np.sin(2 * np.pi * 41.0 * x) + 0.13 * np.sin(2 * np.pi * 82.3 * x)
    s += 0.055 * np.sin(2 * np.pi * 123.5 * x + np.sin(x / 3) * 0.8)
    # air: noise rolled off hard, wobbling
    nz = rng.normal(0, 1, n)
    k = np.hanning(801); k /= k.sum()
    s += 0.055 * np.convolve(nz, k, "same") * (1 + 0.35 * np.sin(2 * np.pi * 0.14 * x))
    # the bed swells toward the end
    s *= 0.55 + 0.45 * np.clip(x / dur, 0, 1) ** 1.6
    return s


def tick(strength=1.0):
    n = int(0.34 * SR)
    x = t(n)
    rng = np.random.default_rng(11)
    click = rng.normal(0, 1, n) * env(n, 0.001, 0.05, 3.0) * 0.5
    ring = (np.sin(2 * np.pi * 1180 * x) * 0.16 + np.sin(2 * np.pi * 2360 * x) * 0.07)
    ring *= env(n, 0.002, 0.30, 3.2)
    body = np.sin(2 * np.pi * 96 * x) * env(n, 0.002, 0.22, 2.4) * 0.28
    return (click + ring + body) * strength


def riser(dur=1.7):
    n = int(dur * SR)
    x = t(n)
    rng = np.random.default_rng(5)
    nz = rng.normal(0, 1, n)
    # sweep a one-pole lowpass upward by interpolating between smoothed copies
    slow = np.convolve(nz, np.hanning(1201) / np.hanning(1201).sum(), "same")
    fast = np.convolve(nz, np.hanning(121) / np.hanning(121).sum(), "same")
    m = np.clip(x / dur, 0, 1) ** 2.0
    s = (slow * (1 - m) + fast * m) * 0.42
    s += np.sin(2 * np.pi * (70 + 260 * m ** 2) * x) * 0.13
    return s * (np.clip(x / dur, 0, 1) ** 1.7)


def hit():
    n = int(2.0 * SR)
    x = t(n)
    rng = np.random.default_rng(9)
    f = 132 * np.exp(-x * 7.5) + 38
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 1.9, 2.2) * 0.62
    crack = rng.normal(0, 1, n) * env(n, 0.0005, 0.09, 4.0) * 0.22
    tail = np.sin(2 * np.pi * 76 * x) * env(n, 0.01, 1.9, 1.6) * 0.16
    return thump + crack + tail


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    n = int(DUR * SR)
    buf = bed(DUR)[:n].copy()

    for i, at in enumerate(NODES):
        place(buf, tick(0.85 + 0.05 * i), at - 0.02)

    place(buf, riser(1.7), RISE_AT - 1.7)
    place(buf, hit(), CARD_AT)

    # a breath of silence right before the hit makes it land
    g = np.ones(n)
    a, b = int((RISE_AT - 0.16) * SR), int(CARD_AT * SR)
    g[a:b] = np.linspace(1, 0.22, max(1, b - a))
    buf *= g

    buf = np.tanh(buf * 1.25) * 0.86
    raw = OUT / "score.wav"
    wavfile.write(raw, SR, (buf * 32767).clip(-32768, 32767).astype(np.int16))

    # Two-pass loudnorm. One pass only estimates, and on a fifteen-second bed
    # that swells throughout it lands over a loudness unit light every time.
    measure = subprocess.run([
        "ffmpeg", "-nostdin", "-hide_banner", "-i", str(raw),
        "-af", "highpass=f=26,loudnorm=I=-14:TP=-1.2:LRA=8:print_format=json",
        "-f", "null", "-",
    ], capture_output=True, text=True, check=True).stderr
    stats = json.loads(measure[measure.rindex("{"):measure.rindex("}") + 1])

    master = OUT / "mix.wav"
    subprocess.run([
        "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(raw),
        "-af",
        "highpass=f=26,"
        f"loudnorm=I=-14:TP=-1.2:LRA=8:measured_I={stats['input_i']}:"
        f"measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:"
        f"measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:"
        "linear=true:print_format=summary,"
        "alimiter=limit=0.95",
        "-ar", "48000", "-ac", "2", str(master),
    ], check=True)

    # loudnorm's own gating leaves this bed about a unit light no matter how
    # it is driven, so measure what actually came out and close the gap with a
    # plain gain. The limiter above already guarantees the headroom for it.
    def measured(path):
        out = subprocess.run([
            "ffmpeg", "-nostdin", "-hide_banner", "-i", str(path),
            "-af", "ebur128", "-f", "null", "-",
        ], capture_output=True, text=True).stderr
        line = [x for x in out.splitlines() if x.strip().startswith("I:")][-1]
        return float(line.split()[1])

    delta = -14.0 - measured(master)
    if abs(delta) > 0.15:
        trimmed = OUT / "mix_trim.wav"
        subprocess.run([
            "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(master),
            "-af", f"volume={delta:+.2f}dB,alimiter=limit=0.95",
            "-ar", "48000", "-ac", "2", str(trimmed),
        ], check=True)
        trimmed.replace(master)

    print(f"score {DUR:.2f}s  {measured(master):+.1f} LUFS -> {master}")


if __name__ == "__main__":
    main()
