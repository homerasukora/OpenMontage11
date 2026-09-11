#!/usr/bin/env python3
"""
Media prep for TRANSMISSION 07 — "THE CHEMISTS' WAR".

Five archive photographs, nine shots. No footage: everything here happened
between 1920 and 1933 and the only record is stills, so the cut is built the
way the ep06 middle section was — each photograph used wide and then pushed
in, which reads as two shots and lets a forty-second film breathe on five
sources.

These are the one set in the series that gets a real tone rather than a
polish. They arrive black and white; leaving them neutral would drop a grey
hole into a warm film, and sepia is what an audience already reads as
"archive", so the grade leans hard into it. That is a period treatment, not
a manipulation — nothing in these frames is changed but their colour
temperature.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "src"
OUT = ROOT / "assets" / "broll"

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
]


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


def main():
    OUT.mkdir(parents=True, exist_ok=True)

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
