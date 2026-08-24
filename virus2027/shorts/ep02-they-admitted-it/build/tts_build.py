#!/usr/bin/env python3
"""
VIRUS2027 // TRANSMISSION — voiceover build.

Synthesises each script line with Piper, applies the "analog transmission"
processing chain, measures real durations, and writes:

  audio/<lang>/vo_full.wav   — the assembled dub track
  audio/<lang>/lines/*.wav   — per-line stems (for re-timing in an NLE)
  build/timing_<lang>.json   — per-line + per-word timings for the animator
  out/subs_<lang>.srt        — platform subtitle file

Word timings are proportional-by-syllable inside each line. That is accurate
enough for karaoke captions because every line is synthesised in isolation,
so line boundaries are exact and only intra-line drift is estimated.
"""

import json
import math
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VOICES = Path("/tmp/claude-0/-home-user-OpenMontage11/"
              "685963b1-f9b5-55d9-81cf-61d11216ce4a/scratchpad/voices")
PY = "/home/user/OpenMontage11/.venv/bin/python"

VOICE = {
    "en": {"model": VOICES / "en-us-ryan-high.onnx", "length_scale": 0.94,
           "gap_scale": 1.0},
    "ru": {"model": VOICES / "ru-irinia-medium.onnx", "length_scale": 0.80,
           "gap_scale": 0.78},
}

# Analog-transmission chain: roll off the boxy low-mids, lift presence,
# gentle compression, a touch of tape saturation, tight room.
TRANSMISSION_CHAIN = (
    "highpass=f=85,"
    "equalizer=f=240:t=q:w=1.1:g=-3.2,"
    "equalizer=f=2600:t=q:w=1.4:g=2.6,"
    "equalizer=f=7200:t=q:w=1.6:g=1.4,"
    "acompressor=threshold=-19dB:ratio=3.4:attack=6:release=140:makeup=2.2,"
    "aexciter=level_in=1:level_out=1:amount=1.1:drive=3.2:blend=0.4,"
    "aecho=0.82:0.85:24:0.11,"
    "alimiter=limit=0.94,"
    "loudnorm=I=-16:TP=-1.5:LRA=9"
)


def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd))}\n{r.stderr[-2000:]}")
    return r.stdout


def dur(path):
    return float(sh(["ffprobe", "-v", "error", "-show_entries",
                     "format=duration", "-of", "csv=p=0", str(path)]).strip())


def syllables(word, lang):
    w = word.lower()
    if lang == "ru":
        n = len(re.findall(r"[аеёиоуыэюя]", w))
    else:
        w = re.sub(r"[^a-z]", "", w)
        n = len(re.findall(r"[aeiouy]+", w))
        if w.endswith("e") and n > 1:
            n -= 1
    return max(1, n)


def word_timings(text, lang, start, length):
    """Distribute a line's duration across its words by syllable weight."""
    words = [w for w in re.split(r"\s+", text.strip()) if w]
    if not words:
        return []
    weights = []
    for w in words:
        s = syllables(w, lang)
        # punctuation buys a beat of silence after the word
        s += 0.9 if re.search(r"[.:;—]$", w) else (0.5 if w.endswith(",") else 0)
        weights.append(s)
    total = sum(weights)
    out, t = [], start
    for w, wt in zip(words, weights):
        d = length * wt / total
        out.append({"word": w, "start": round(t, 3), "end": round(t + d, 3)})
        t += d
    return out


def srt_ts(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = int(t % 60)
    ms = int(round((t - math.floor(t)) * 1000))
    if ms == 1000:
        s, ms = s + 1, 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def build(lang):
    script = json.loads((ROOT / "script.json").read_text())
    cfg = VOICE[lang]
    lines_dir = ROOT / "audio" / lang / "lines"
    lines_dir.mkdir(parents=True, exist_ok=True)

    timeline, t = [], 0.0
    concat = []

    for ln in script["lines"]:
        text = ln[lang]
        raw = lines_dir / f"{ln['id']}_raw.wav"
        wet = lines_dir / f"{ln['id']}.wav"

        p = subprocess.run(
            [PY, "-m", "piper", "-m", str(cfg["model"]),
             "--length-scale", str(cfg["length_scale"]),
             "--noise-scale", "0.60", "--noise-w-scale", "0.75",
             "--sentence-silence", "0.16",
             "-f", str(raw)],
            input=text, text=True, capture_output=True)
        if p.returncode != 0:
            raise RuntimeError(f"piper failed on {ln['id']}: {p.stderr[-800:]}")

        sh(["ffmpeg", "-y", "-v", "error", "-i", str(raw),
            "-af", TRANSMISSION_CHAIN, "-ar", "48000", "-ac", "1", str(wet)])
        raw.unlink()

        d = dur(wet)
        gap = round(ln["gap_after"] * cfg.get("gap_scale", 1.0), 3)
        timeline.append({
            "id": ln["id"], "beat": ln["beat"], "text": text,
            "start": round(t, 3), "end": round(t + d, 3), "dur": round(d, 3),
            "gap_after": gap,
            "words": word_timings(text, lang, t, d),
        })
        concat.append((wet, gap))
        t += d + gap

    # assemble: line, silence, line, silence ...
    parts = []
    for i, (wav, gap) in enumerate(concat):
        parts.append(f"[{i}:a]")
    inputs = []
    for wav, _ in concat:
        inputs += ["-i", str(wav)]

    filt = []
    idx = 0
    seq = []
    for i, (wav, gap) in enumerate(concat):
        filt.append(f"[{i}:a]apad=pad_dur={gap}[p{i}]")
        seq.append(f"[p{i}]")
        idx += 1
    filt.append("".join(seq) + f"concat=n={len(concat)}:v=0:a=1[out]")

    full = ROOT / "audio" / lang / "vo_full.wav"
    sh(["ffmpeg", "-y", "-v", "error", *inputs,
        "-filter_complex", ";".join(filt), "-map", "[out]",
        "-ar", "48000", "-ac", "1", str(full)])

    total = dur(full)
    (ROOT / "build" / f"timing_{lang}.json").write_text(json.dumps(
        {"lang": lang, "total_duration": round(total, 3), "lines": timeline},
        ensure_ascii=False, indent=2))

    # SRT — one cue per line, which is what platforms want for uploaded subs
    srt = []
    for i, ln in enumerate(timeline, 1):
        srt.append(f"{i}\n{srt_ts(ln['start'])} --> {srt_ts(ln['end'])}\n"
                   f"{ln['text']}\n")
    (ROOT / "out" / f"subs_{lang}.srt").write_text("\n".join(srt),
                                                   encoding="utf-8")

    print(f"[{lang}] {len(timeline)} lines · VO total {total:.2f}s -> {full}")
    for ln in timeline:
        print(f"   {ln['id']}  {ln['start']:6.2f}–{ln['end']:6.2f}  "
              f"({ln['dur']:4.2f}s)  {ln['text'][:58]}")
    return total


if __name__ == "__main__":
    for lang in (sys.argv[1:] or ["en", "ru"]):
        build(lang)
