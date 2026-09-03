#!/usr/bin/env python3
"""
Score for the ALL ROADS -> 2027 sting. No voice.

Synthesised rather than sampled: nothing in this environment reaches a sample
library, and a fifteen-second sting only needs four sounds anyway. Cues are
taken from the same node timings the picture uses, so a change to the
composition's KEYS is a one-line change here too.

  bed      low drone, three detuned sines beating against each other
  tick     a node lands  — soft wooden knock, a damped low sine plus one
                           quiet upper partial
  riser    the last leg  — a tonal glide up through a harmonic stack
  hit      2027          — pitch-dropping thump with a mid-range transient

**Everything here is tonal. There is no broadband noise anywhere in this
file, deliberately.** The first version built its air, its node clicks, its
riser and the crack on the hit all out of white noise, and stacked like that
it read as hiss — fifteen seconds of it, right across the range the ear is
most sensitive in. Every one of those four is now a tuned partial instead,
and the master is rolled off above 8 kHz so nothing can creep back in. If a
future cue needs grit, shape it from a low partial and distortion, not from
a noise generator.

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
    """
    Three sines an octave apart, each detuned a fraction of a hertz so they
    beat slowly against one another. The beating is what makes it feel alive;
    the old version used filtered noise for that and paid for it in hiss.
    """
    n = int(dur * SR)
    x = t(n)
    s = 0.22 * np.sin(2 * np.pi * 41.0 * x)
    s += 0.14 * np.sin(2 * np.pi * 82.3 * x + 0.7)
    s += 0.062 * np.sin(2 * np.pi * 123.1 * x + np.sin(x / 3) * 0.8)
    # a fifth, very quiet, drifting in and out of phase with the root
    s += 0.030 * np.sin(2 * np.pi * 61.6 * x) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.09 * x))
    s *= 0.55 + 0.45 * np.clip(x / dur, 0, 1) ** 1.6
    return s


def tick(strength=1.0):
    """
    A node landing: a wooden knock, not a click. A heavily damped low sine
    carries it, one quiet partial at 430 Hz gives it a surface, and nothing
    above 1 kHz is in it at all.
    """
    n = int(0.34 * SR)
    x = t(n)
    # the pitch drops a little as it decays, which is what reads as "wood"
    f = 150 * np.exp(-x * 26) + 88
    knock = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.0015, 0.20, 3.0) * 0.44
    surface = np.sin(2 * np.pi * 430 * x) * env(n, 0.001, 0.055, 4.0) * 0.10
    return (knock + surface) * strength


def riser(dur=1.7):
    """
    A tonal glide rather than a noise sweep. The root climbs about an octave
    and a half while its harmonics fade up one after another, so the sound
    gets brighter without ever getting hissy. The top partial stops at 6 kHz.
    """
    n = int(dur * SR)
    x = t(n)
    m = np.clip(x / dur, 0, 1)
    root = 74 * (1 + 1.6 * m ** 2.1)
    phase = 2 * np.pi * np.cumsum(root) / SR
    s = np.sin(phase) * 0.30
    for k, amp, onset in ((2, 0.18, 0.10), (3, 0.12, 0.34), (5, 0.075, 0.56),
                          (8, 0.040, 0.74)):
        if root.max() * k > 6000:
            amp *= 0.35
        fade = np.clip((m - onset) / max(1e-6, 1 - onset), 0, 1) ** 1.4
        s += np.sin(phase * k) * amp * fade
    # a slight shudder as it climbs, so it is not a clean synth sweep
    s *= 1 + 0.10 * np.sin(2 * np.pi * (5 + 26 * m) * x)
    return s * (m ** 1.7)


def hit():
    """
    The 2027 landing. Pitch-dropping thump with a short mid transient where
    the old version had a noise crack — same attack, none of the spit.
    """
    n = int(2.0 * SR)
    x = t(n)
    f = 132 * np.exp(-x * 7.5) + 38
    thump = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 1.9, 2.2) * 0.62
    fm = 620 * np.exp(-x * 42) + 150
    transient = np.sin(2 * np.pi * np.cumsum(fm) / SR) * env(n, 0.0008, 0.11, 4.0) * 0.20
    tail = np.sin(2 * np.pi * 76 * x) * env(n, 0.01, 1.9, 1.6) * 0.16
    return thump + transient + tail


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
        "-af", "highpass=f=26,lowpass=f=8200,equalizer=f=3400:t=q:w=1.2:g=-2.0,loudnorm=I=-14:TP=-1.2:LRA=8:print_format=json",
        "-f", "null", "-",
    ], capture_output=True, text=True, check=True).stderr
    stats = json.loads(measure[measure.rindex("{"):measure.rindex("}") + 1])

    master = OUT / "mix.wav"
    subprocess.run([
        "ffmpeg", "-nostdin", "-v", "error", "-y", "-i", str(raw),
        "-af",
        "highpass=f=26,lowpass=f=8200,equalizer=f=3400:t=q:w=1.2:g=-2.0,"
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
