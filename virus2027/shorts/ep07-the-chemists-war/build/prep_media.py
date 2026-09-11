#!/usr/bin/env python3
"""
Media prep for TRANSMISSION 07 — "THE CHEMISTS' WAR".

Six archive photographs and one silent newsreel, nineteen shots. Each
photograph is used wide and then pushed in, which reads as two shots and lets
a forty-second film breathe on a handful of sources.

The newsreel is the only motion in the film and it is spread across four
short cuts rather than played once. A page of stills, however good, reads as
a slideshow after fifteen seconds; four bursts of men swinging axes at
barrels reset the eye without changing the subject. Its cuts are baked into
the 9:16 frame here rather than in the composition, letterboxed onto a
blurred copy of themselves at exactly the geometry the photographic bands
use — same width, same centre — so a viewer cannot tell which shots are
moving until they move.

These are the one set in the series that gets a real tone rather than a
polish. They arrive black and white; leaving them neutral would drop a grey
hole into a warm film, and sepia is what an audience already reads as
"archive", so the grade leans hard into it. That is a period treatment, not
a manipulation — nothing in these frames is changed but their colour
temperature.
"""

import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "src"
OUT = ROOT / "assets" / "broll"
CLIPS = ROOT / "assets" / "clips"

# name -> (source, crop box as fractions or None for the full frame)
STILLS = [
    ("pour",         "pour.webp",    None),
    ("pour_in",      "pour.webp",    (0.02, 0.28, 0.54, 1.00)),
    ("raid",         "raid.jpg",     None),
    ("raid_in",      "raid.jpg",     (0.26, 0.50, 0.70, 0.99)),
    ("dry",          "vote_dry.jpg", None),
    ("dry_in",       "vote_dry.jpg", (0.36, 0.24, 0.66, 0.68)),
    ("nobooze",      "no_booze.jpg", None),
    ("nobooze_in",   "no_booze.jpg", (0.14, 0.32, 0.58, 0.74)),
    ("cheers",       "cheers.jpg",   None),
    ("beer",         "we_want_beer.jpg", None),
]

# Cuts from the newsreel, in seconds. Four of them, spread across the film.
TOUR = Path("/root/.claude/uploads/685963b1-f9b5-55d9-81cf-61d11216ce4a"
            "/c26fcb86-snaptik_7234929813167820074_hd.mov")
CUTS = [("axe1", 0.30, 2.30), ("axe2", 3.20, 2.20),
        ("axe3", 5.60, 1.80), ("axe4", 7.45, 1.90)]

# The photographic bands render 1.22x frame width, centred at y=880. Matching
# that exactly is what makes the footage sit in the same cut as the stills
# instead of interrupting it.
BAND_W = round(1080 * 1.22)
BAND_CENTRE = 880

TONE_VF = ("format=gray,"
           "colorchannelmixer=rr=1.095:gg=0.985:bb=0.845,"
           "eq=contrast=1.09:brightness=-0.035")


def tone(img, keep=0.16, contrast=1.09, brightness=0.94):
    """Warm the frame toward the brand's archive sepia."""
    rgb = img.convert("RGB")
    a = np.asarray(rgb.convert("L").convert("RGB"), np.float32)
    a[..., 0] *= 1.095
    a[..., 1] *= 0.985
    a[..., 2] *= 0.845
    warm = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out = ImageEnhance.Contrast(Image.blend(warm, rgb, keep)).enhance(contrast)
    return ImageEnhance.Brightness(out).enhance(brightness)


def fit(img, w, h):
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(1, round(sw * s)), max(1, round(sh * s))), Image.LANCZOS)
    sw, sh = img.size
    return img.crop(((sw - w) // 2, (sh - h) // 2, (sw - w) // 2 + w, (sh - h) // 2 + h))


def backdrop(img, blur=48, brightness=0.28):
    return ImageEnhance.Brightness(
        fit(img, 1080, 1920).filter(ImageFilter.GaussianBlur(blur))).enhance(brightness)


def cut(name, start, dur):
    """One newsreel cut, letterboxed to match the photographic bands."""
    out = CLIPS / f"{name}.mp4"
    fg_h = "-2"
    vf = (
        f"[0:v]{TONE_VF},scale={BAND_W}:{fg_h},setsar=1[fg];"
        f"[0:v]{TONE_VF},scale=1080:1920:force_original_aspect_ratio=increase,"
        f"crop=1080:1920,gblur=sigma=42,eq=brightness=-0.34[bg];"
        f"[bg][fg]overlay=x=(W-w)/2:y={BAND_CENTRE}-h/2,fps=30"
    )
    subprocess.run([
        "ffmpeg", "-nostdin", "-v", "error", "-y",
        "-ss", f"{start}", "-t", f"{dur}", "-i", str(TOUR),
        "-an", "-filter_complex", vf,
        "-c:v", "libx264", "-crf", "18", "-preset", "slow",
        "-pix_fmt", "yuv420p", str(out),
    ], check=True)
    print(f"clips/{name}.mp4   {start:4.2f}s +{dur:.2f}s")


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    CLIPS.mkdir(parents=True, exist_ok=True)

    for args in CUTS:
        cut(*args)

    for name, src, box in STILLS:
        img = Image.open(SRC / src)
        if box:
            w, h = img.size
            img = img.crop((round(box[0] * w), round(box[1] * h),
                            round(box[2] * w), round(box[3] * h)))
        img = tone(img)
        hh = max(1, round(1080 * img.height / img.width))
        img.resize((1080, hh), Image.LANCZOS).save(OUT / f"{name}.jpg", quality=94)
        backdrop(img).save(OUT / f"{name}_bg.jpg", quality=88)
        print(f"broll/{name}.jpg   1080x{hh}  (+bg)")

    vira = Image.open(SRC / "vira.png").convert("RGBA")
    box = vira.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    vira.crop(box).save(ROOT / "assets" / "mascot-plate.png")
    print(f"mascot-plate.png  {vira.crop(box).size}  supplied alpha, trimmed")


if __name__ == "__main__":
    main()
