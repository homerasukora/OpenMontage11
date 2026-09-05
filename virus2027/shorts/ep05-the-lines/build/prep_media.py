#!/usr/bin/env python3
"""
Media prep for TRANSMISSION 05 — "THE LINES".

This episode is footage-led rather than plate-led, so the job here is mostly
cutting: nine shots pulled out of three phone clips and two photographs, all
normalised to 1080x1920 at 30 fps so the composition never has to think about
source formats.

Two things get handled that the other episodes did not need:

**Somebody else's watermark.** The third clip carries a TikTok handle that
alternates between two fixed positions, left-of-centre and right-of-centre.
Both are removed with `delogo`, which rebuilds the patch by interpolating
from its border — on open sky that is invisible, and it beats cropping,
which would have thrown away a third of the frame to save a corner.

**Somebody else's caption.** The wing clip opens with burned-in text for its
first three and a half seconds, so every cut taken from it starts after that.

Vira arrives here as a PNG that already carries a correct alpha channel, so
nothing is keyed or matted — the earlier flood-fill matte is gone along with
the problem it was solving. His colour is untouched; the file is only
trimmed to his silhouette so the composition can position him by his own
edges rather than by a square of empty pixels.

The two photographs are graded like documentary rather than artwork: these
are the sky as it actually looks, and pushing them toward the brand palette
would make them look staged, which is the one thing this subject cannot
afford.
"""

import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "src"
CLIPS = ROOT / "assets" / "clips"
UP = Path("/root/.claude/uploads/685963b1-f9b5-55d9-81cf-61d11216ce4a")

SOURCE = {
    "A": UP / "86ad8e38-snaptik_7623756055482240270_hd.mp4",   # wing, 1080x1920
    "B": UP / "ecd2aa69-snaptik_7315940047138606341_hd.mp4",   # one long trail
    "C": UP / "8349409e-v12044gd0000d09rjt7og65khr21u8j0.mp4",  # many trails
}

# The handle sits in one of two places for the whole of clip C. Both boxes
# are cut wide: a tight one left the "@" showing, and delogo only looks
# seamless when its border sits clear of the glyphs. Every window taken from
# this clip is sky-dominant for the same reason — the patch disappears into
# open sky and smears anything with structure in it.
DELOGO_C = "delogo=x=8:y=452:w=196:h=112,delogo=x=392:y=696:w=182:h=106"

# name -> (source, start, duration, extra filters)
# Clip A is only clean after 3.5 s; everything taken from it starts later.
CUTS = [
    ("b_trail_sun",  "B", 2.00, 4.80, ""),
    ("b_trail_high", "B", 9.20, 2.60, ""),
    ("c_cross",      "C", 11.40, 3.10, DELOGO_C),
    ("c_grid",       "C", 40.60, 2.60, DELOGO_C),
    ("c_wide",       "C", 43.60, 3.60, DELOGO_C),
]

FILL = ("scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920,fps=30")


def cut(name, src, start, dur, extra):
    vf = ",".join(x for x in (extra, FILL, "unsharp=5:5:0.42:5:5:0.0") if x)
    out = CLIPS / f"{name}.mp4"
    subprocess.run([
        "ffmpeg", "-nostdin", "-v", "error", "-y",
        "-ss", f"{start}", "-t", f"{dur}", "-i", str(SOURCE[src]),
        "-an", "-vf", vf,
        "-c:v", "libx264", "-crf", "18", "-preset", "slow",
        "-pix_fmt", "yuv420p", str(out),
    ], check=True)
    print(f"clips/{name}.mp4   {src} {start:5.2f}s +{dur:.2f}s"
          + ("  (delogo)" if extra else ""))


def grade(img, keep=0.90, contrast=1.05, brightness=0.96):
    rgb = img.convert("RGB")
    a = np.asarray(rgb.convert("L").convert("RGB"), np.float32)
    a[..., 0] *= 1.045
    a[..., 1] *= 0.995
    a[..., 2] *= 0.925
    warm = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out = Image.blend(warm, rgb, keep)
    out = ImageEnhance.Contrast(out).enhance(contrast)
    return ImageEnhance.Brightness(out).enhance(brightness)


def fit(img, w, h, xbias=0.5):
    """
    Cover-crop. `xbias` picks which part of the width survives — 0 keeps the
    left edge, 0.5 centres. The sky photograph needs 0: its own uploader's
    handle is burned into the right side, and cropping past it costs nothing
    but a roofline, where scrubbing it would leave a patch in open sky.
    """
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(1, round(sw * s)), max(1, round(sh * s))), Image.LANCZOS)
    sw, sh = img.size
    x = round((sw - w) * xbias)
    y = (sh - h) // 2
    return img.crop((x, y, x + w, y + h))


def backdrop(img, blur=48, brightness=0.34):
    return ImageEnhance.Brightness(
        fit(img, 1080, 1920).filter(ImageFilter.GaussianBlur(blur))).enhance(brightness)


def main():
    CLIPS.mkdir(parents=True, exist_ok=True)
    OUT = ROOT / "assets" / "broll"
    OUT.mkdir(parents=True, exist_ok=True)

    for args in CUTS:
        cut(*args)

    # sky_pine fills the frame; sky_city is square and plays as a band
    # The uploader's handle is burned into the right edge of this photograph;
    # trimming the source before the cover-crop is the only way to lose all
    # of it, and it costs a roofline that was never the subject.
    pine = grade(Image.open(SRC / "sky_pine.webp").crop((0, 0, 764, 1440)))
    fit(pine, 1080, 1920).save(OUT / "sky_pine.jpg", quality=94)
    print("broll/sky_pine.jpg  1080x1920  full bleed")

    vira = Image.open(SRC / "vira.png").convert("RGBA")
    box = vira.getchannel("A").point(lambda v: 255 if v > 20 else 0).getbbox()
    vira.crop(box).save(ROOT / "assets" / "mascot-plate.png")
    print(f"mascot-plate.png  {vira.crop(box).size}  supplied alpha, trimmed")

    # Two exhibits the theory runs on. The cabin is the single most-shared
    # chemtrail photograph; the seeding rig is the real thing planes actually
    # carry. Both are graded like documents rather than artwork.
    for name, src in (("cabin", "cabin.webp"), ("seeding", "seeding.jpg")):
        img = grade(Image.open(SRC / src), keep=0.92, brightness=0.93)
        h = max(1, round(1080 * img.height / img.width))
        img.resize((1080, h), Image.LANCZOS).save(OUT / f"{name}.jpg", quality=94)
        backdrop(img, brightness=0.28).save(OUT / f"{name}_bg.jpg", quality=88)
        print(f"broll/{name}.jpg   1080x{h}  (+bg)")

    city = grade(Image.open(SRC / "sky_city.webp"))
    h = max(1, round(1080 * city.height / city.width))
    city.resize((1080, h), Image.LANCZOS).save(OUT / "sky_city.jpg", quality=94)
    backdrop(city).save(OUT / "sky_city_bg.jpg", quality=88)
    print(f"broll/sky_city.jpg  1080x{h}  (+bg)")


if __name__ == "__main__":
    main()
