#!/usr/bin/env python3
"""
Media prep for TRANSMISSION 06 — "THE DOORS".

Six cuts from one long bunker tour, plus four photographs.

The tour carries the uploader's own subtitles in a fixed band across the
bottom fifth of frame, and a title card over the first four seconds. Neither
can be patched — the footage behind them is busy interiors, where any
interpolated patch smears — so both are cropped past instead: every cut
starts after the title clears, and the frame is trimmed to the caption-free
region and re-framed to 9:16 from inside it. That costs about a quarter of
the width and a 1.37x scale on a 1080p source, which is the cheaper of the
two prices.

Two photographs are used twice at different crops. A single still held for
six seconds dies on screen; the same still cut wide-then-tight reads as two
shots, and it is honest — nothing is added, the camera just moves in.
"""

import subprocess
from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "src"
OUT = ROOT / "assets" / "broll"
CLIPS = ROOT / "assets" / "clips"
UP = Path("/root/.claude/uploads/685963b1-f9b5-55d9-81cf-61d11216ce4a")
TOUR = UP / "f80df981-snaptik_7679520817717185805_hd.mp4"

# The uploader's caption band starts around y=1380 of 1920. Trim to 1400 and
# re-frame 9:16 from inside what is left.
KEEP_H = 1368
WIN_W = round(KEEP_H * 9 / 16)          # 787
CROP = (f"crop=1080:{KEEP_H}:0:0,"
        f"crop={WIN_W}:{KEEP_H}:{(1080 - WIN_W) // 2}:0,"
        "scale=1080:1920,fps=30")

# name -> (start, duration).
#
# Two constraints picked these windows. Everything is past 4 s, where the
# uploader's title card clears. And every one is a single full-frame shot:
# the tour cuts to the presenter's face often, and several stretches are a
# stacked two-shot, neither of which belongs in our film.
CUTS = [
    ("silo_field",   87.4, 3.90),
    ("silo_field_2", 91.2, 2.70),
    ("gate",         85.2, 3.60),
    ("hosts_beach",   5.4, 3.20),
    ("condo_living", 38.6, 2.90),
    ("hosts_hall",   70.4, 3.10),
]

# Two of the stills are cut twice: wide, then a push into the detail.
STILLS = [
    ("fi_entrance", "fi_entrance.jpg", None),
    ("fi_rock",     "fi_rock.webp",    None),
    ("fi_hall",     "fi_hall.webp",    None),
    ("fi_hall_in",  "fi_hall.webp",    (0.54, 0.17, 1.00, 0.79)),
    ("ar_domes",    "ar_domes.webp",   None),
    ("ar_domes_in", "ar_domes.webp",   (0.22, 0.24, 0.76, 0.80)),
    ("ar_domes_side", "ar_domes.webp", (0.00, 0.28, 0.44, 0.86)),
]


def cut(name, start, dur):
    out = CLIPS / f"{name}.mp4"
    subprocess.run([
        "ffmpeg", "-nostdin", "-v", "error", "-y",
        "-ss", f"{start}", "-t", f"{dur}", "-i", str(TOUR),
        "-an", "-vf", CROP + ",unsharp=5:5:0.34:5:5:0.0",
        "-c:v", "libx264", "-crf", "18", "-preset", "slow",
        "-pix_fmt", "yuv420p", str(out),
    ], check=True)
    print(f"clips/{name}.mp4   {start:5.1f}s +{dur:.2f}s")


def grade(img, keep=0.90, contrast=1.05, brightness=0.95):
    rgb = img.convert("RGB")
    a = np.asarray(rgb.convert("L").convert("RGB"), np.float32)
    a[..., 0] *= 1.045
    a[..., 1] *= 0.995
    a[..., 2] *= 0.925
    warm = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out = ImageEnhance.Contrast(Image.blend(warm, rgb, keep)).enhance(contrast)
    return ImageEnhance.Brightness(out).enhance(brightness)


def fit(img, w, h):
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(1, round(sw * s)), max(1, round(sh * s))), Image.LANCZOS)
    sw, sh = img.size
    return img.crop(((sw - w) // 2, (sh - h) // 2, (sw - w) // 2 + w, (sh - h) // 2 + h))


def backdrop(img, blur=48, brightness=0.30):
    return ImageEnhance.Brightness(
        fit(img, 1080, 1920).filter(ImageFilter.GaussianBlur(blur))).enhance(brightness)


def main():
    for d in (OUT, CLIPS):
        d.mkdir(parents=True, exist_ok=True)

    for args in CUTS:
        cut(*args)

    for name, src, box in STILLS:
        img = Image.open(SRC / src)
        if box:
            w, h = img.size
            img = img.crop((round(box[0] * w), round(box[1] * h),
                            round(box[2] * w), round(box[3] * h)))
        img = grade(img)
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
