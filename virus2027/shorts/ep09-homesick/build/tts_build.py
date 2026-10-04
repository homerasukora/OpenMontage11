#!/usr/bin/env python3
"""
VIRUS2027 // TRANSMISSION — voiceover build, Kokoro engine.

Replaces the Piper build from ep00-ep08. Piper's ryan voice reads each line
as an isolated sentence with a near-constant pace, which is what reads as
"synthetic" on short-form: the pitch moves, but not in the places a human
narrator moves it. Kokoro (StyleTTS2-family, 82M parameters, runs on CPU)
models phrase shape — the fall at the end of a statement, the lift into a
question, a breath at a comma — and reads noticeably closer to a person.

Writes the same artifacts as the old build, so nothing downstream changes:

  audio/<lang>/vo_full.wav
  audio/<lang>/lines/*.wav
  build/timing_<lang>.json     per-line and per-word timings
  out/subs_<lang>.srt

Three things are different from the Piper build and are worth knowing about.

1. SPOKEN FORMS.  Kokoro phonemises through espeak-ng, which reads "1973" as
   "one thousand nine hundred and seventy-three". script.json may carry a
   top-level "say" map from a displayed word to the words that are actually
   spoken; captions keep the displayed form.

2. TRIMMED EDGES.  The model leaves 100-300 ms of silence either side of a
   line. That is trimmed to a fixed 40 ms so line start times mean "the first
   syllable", which is what the picture is anchored to.

3. WORD TIMES FROM THE AUDIO.  Words are first placed by syllable weight, then
   each internal boundary is snapped to the quietest point of the real
   waveform within +/-90 ms. Syllable weights alone are good to about 0.1 s
   on a flat read and noticeably worse on a read with real rhythm, and every
   highlight in the film is anchored to a word.

No analog-radio chain here. The old chain (exciter plus a 24 ms echo) put a
comb filter on the voice, which is a metallic edge on exactly the thing that
needed to sound human. What is left is the minimum a voice needs for a phone
speaker: high-pass, a small low-mid cut, a little presence, gentle
compression, loudness.
"""

import json
import math
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
SCRATCH = Path("/tmp/claude-0/-home-user-OpenMontage11/"
               "685963b1-f9b5-55d9-81cf-61d11216ce4a/scratchpad/kokoro")
MODEL = SCRATCH / "kokoro-v1.0.onnx"
VOICES = SCRATCH / "voices-v1.0.bin"

VOICE = "am_adam"
SPEED = 1.0
SR_OUT = 48000
EDGE = 0.040          # seconds of silence kept either side of a line

VOICE_CHAIN = (
    "highpass=f=70,"
    "equalizer=f=260:t=q:w=1.0:g=-2.0,"
    "equalizer=f=3200:t=q:w=1.2:g=2.0,"
    "acompressor=threshold=-20dB:ratio=2.4:attack=8:release=160:makeup=2,"
    "alimiter=limit=0.94,"
    "loudnorm=I=-16:TP=-1.5:LRA=9"
)


def sh(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"{' '.join(map(str, cmd))}\n{r.stderr[-2000:]}")
    return r.stdout


def dur(path):
    return float(sh(["ffprobe", "-v", "error", "-show_entries", "format=duration",
                     "-of", "csv=p=0", str(path)]).strip())


def syllables(spoken):
    """Syllable count of a spoken form. Single letters (D N A) count one each."""
    n = 0
    for tok in re.split(r"[\s-]+", spoken.lower()):
        tok = re.sub(r"[^a-z0-9]", "", tok)
        if not tok:
            continue
        if len(tok) == 1:
            n += 1
            continue
        k = len(re.findall(r"[aeiouy]+", tok))
        if tok.endswith("e") and k > 1:
            k -= 1
        n += max(1, k)
    return n


def key(w):
    return re.sub(r"[^A-Za-z0-9']", "", w)


def weights(words, say):
    out = []
    for w in words:
        sp = say.get(key(w), w)
        s = syllables(sp)
        # punctuation buys a beat of silence after the word
        s += 0.9 if re.search(r"[.:;?!—]$", w) else (0.5 if w.endswith(",") else 0)
        out.append(s)
    return out


def envelope(a, sr, hop=0.005):
    n = int(sr * hop)
    m = len(a) // n
    e = np.sqrt(np.mean(a[: m * n].reshape(m, n) ** 2, axis=1))
    k = np.ones(5) / 5.0
    return np.convolve(e, k, mode="same"), hop


def word_timings(text, say, start, audio, sr):
    words = [w for w in re.split(r"\s+", text.strip()) if w]
    if not words:
        return []
    wt = weights(words, say)
    total = sum(wt)
    length = len(audio) / sr
    env, hop = envelope(audio, sr)

    # first pass: proportional boundaries
    bounds, acc = [0.0], 0.0
    for x in wt:
        acc += x
        bounds.append(length * acc / total)

    # second pass: snap every internal boundary to the quietest frame nearby,
    # never closer than 60 ms to a neighbour
    for i in range(1, len(bounds) - 1):
        lo = max(bounds[i - 1] + 0.06, bounds[i] - 0.09)
        hi = min(bounds[i + 1] - 0.06, bounds[i] + 0.09)
        if hi <= lo:
            continue
        a, b = int(lo / hop), int(hi / hop)
        if b > a:
            bounds[i] = (a + int(np.argmin(env[a:b]))) * hop

    return [{"word": w, "start": round(start + bounds[i], 3),
             "end": round(start + bounds[i + 1], 3)}
            for i, w in enumerate(words)]


def srt_ts(t):
    h = int(t // 3600)
    m = int(t % 3600 // 60)
    s = int(t % 60)
    ms = int(round((t - math.floor(t)) * 1000))
    if ms == 1000:
        s, ms = s + 1, 0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def trim(a, sr):
    thr = 10 ** (-46 / 20)
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    pad = int(EDGE * sr)
    return a[max(0, idx[0] - pad): min(len(a), idx[-1] + pad)]


def build(lang="en"):
    from kokoro_onnx import Kokoro
    script = json.loads((ROOT / "script.json").read_text())
    say = script.get("say", {})
    k = Kokoro(str(MODEL), str(VOICES))
    lines_dir = ROOT / "audio" / lang / "lines"
    lines_dir.mkdir(parents=True, exist_ok=True)

    timeline, concat, t = [], [], 0.0
    for ln in script["lines"]:
        text = ln[lang]
        spoken = " ".join(say.get(key(w), w) if key(w) in say else w
                          for w in text.split())
        speed = ln.get("vo_speed", SPEED)
        voice = ln.get("vo_voice", VOICE)
        samples, sr = k.create(spoken, voice=voice, speed=speed, lang="en-us")
        samples = trim(np.asarray(samples, dtype=np.float32), sr)

        raw = lines_dir / f"{ln['id']}_raw.wav"
        wet = lines_dir / f"{ln['id']}.wav"
        sf.write(raw, samples, sr)
        sh(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", VOICE_CHAIN,
            "-ar", str(SR_OUT), "-ac", "1", str(wet)])
        raw.unlink()

        # word times come from the processed audio, so they match what is heard
        proc, psr = sf.read(wet, dtype="float32")
        d = len(proc) / psr
        gap = round(ln["gap_after"], 3)
        timeline.append({
            "id": ln["id"], "beat": ln["beat"], "text": text,
            "start": round(t, 3), "end": round(t + d, 3), "dur": round(d, 3),
            "gap_after": gap,
            "words": word_timings(text, say, t, proc, psr),
        })
        concat.append((wet, gap))
        t += d + gap

    inputs, filt, seq = [], [], []
    for i, (wav, gap) in enumerate(concat):
        inputs += ["-i", str(wav)]
        filt.append(f"[{i}:a]apad=pad_dur={gap}[p{i}]")
        seq.append(f"[p{i}]")
    filt.append("".join(seq) + f"concat=n={len(concat)}:v=0:a=1[out]")
    full = ROOT / "audio" / lang / "vo_full.wav"
    sh(["ffmpeg", "-y", "-v", "error", *inputs, "-filter_complex", ";".join(filt),
        "-map", "[out]", "-ar", str(SR_OUT), "-ac", "1", str(full)])

    total = dur(full)
    (ROOT / "build" / f"timing_{lang}.json").write_text(json.dumps(
        {"lang": lang, "voice": VOICE, "total_duration": round(total, 3),
         "lines": timeline}, ensure_ascii=False, indent=2))
    srt = []
    for i, ln in enumerate(timeline, 1):
        srt.append(f"{i}\n{srt_ts(ln['start'])} --> {srt_ts(ln['end'])}\n{ln['text']}\n")
    (ROOT / "out" / f"subs_{lang}.srt").write_text("\n".join(srt), encoding="utf-8")

    print(f"[{lang}] {len(timeline)} lines · VO {total:.2f}s · voice {VOICE}")
    for ln in timeline:
        print(f"   {ln['id']}  {ln['start']:6.2f}-{ln['end']:6.2f}  "
              f"({ln['dur']:4.2f}s)  {ln['text'][:56]}")
    return total


if __name__ == "__main__":
    if len(sys.argv) > 2:
        VOICE = sys.argv[2]
    build(sys.argv[1] if len(sys.argv) > 1 else "en")
