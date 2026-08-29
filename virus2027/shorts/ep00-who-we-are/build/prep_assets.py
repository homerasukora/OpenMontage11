#!/usr/bin/env python3
"""
Asset prep for TRANSMISSION 00 — the pinned welcome film.

Unlike the news episodes, every source here is already brand artwork, so the
grade is almost a no-op: a touch of contrast, matching film grain and a
vignette, nothing that would fight the original render. Desaturating these
would strip the one thing they already have right.

Outputs:
  broll/<name>.jpg      band plate, 1080 wide, native aspect
  broll/<name>_bg.jpg   blurred 9:16 fill so a band never floats in black
  broll/vira_hero.jpg   full-bleed 9:16, used for the mascot beat
  panorama.jpg          the gallery, graded, kept at native width
  panorama_bg.jpg       blurred 9:16 fill for the panorama moves
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SRC = ASSETS / "broll_src"
OUT = ASSETS / "broll"

# These are brand renders, not stock: keep almost all of their own colour.
KEEP_COLOUR = 0.92
BRIGHTNESS = {"burn": 0.96, "theories": 1.04, "vira": 1.0}


def grade(img, keep=KEEP_COLOUR, contrast=1.06, brightness=1.0):
    rgb = img.convert("RGB")
    a = np.asarray(rgb.convert("L").convert("RGB"), np.float32)
    a[..., 0] *= 1.045
    a[..., 1] *= 0.995
    a[..., 2] *= 0.925
    warm = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out = Image.blend(warm, rgb, keep)
    out = ImageEnhance.Contrast(out).enhance(contrast)
    return ImageEnhance.Brightness(out).enhance(brightness)


def add_grain(img, amount=6.5, seed=2027):
    rng = np.random.default_rng(seed)
    a = np.asarray(img, np.float32)
    return Image.fromarray(
        (a + rng.normal(0, amount, a.shape[:2])[..., None]).clip(0, 255).astype(np.uint8))


def vignette(img, strength=0.30):
    w, h = img.size
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w / 2) / (w / 2)) ** 2 + ((yy - h / 2) / (h / 2)) ** 2)
    v = np.clip(1 - strength * np.clip(r - 0.42, 0, None) ** 1.5 * 2.2, 0, 1)
    return Image.fromarray(
        (np.asarray(img, np.float32) * v[..., None]).clip(0, 255).astype(np.uint8))


def fit(img, w, h):
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(1, round(sw * s)), max(1, round(sh * s))), Image.LANCZOS)
    sw, sh = img.size
    return img.crop(((sw - w) // 2, (sh - h) // 2, (sw - w) // 2 + w, (sh - h) // 2 + h))


def backdrop(img, blur=46, brightness=0.52):
    bg = fit(img, 1080, 1920).filter(ImageFilter.GaussianBlur(blur))
    return vignette(ImageEnhance.Brightness(bg).enhance(brightness), strength=0.52)


def grain_tile(size=320, seed=2027):
    rng = np.random.default_rng(seed)
    n = rng.normal(128, 34, (size, size)).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(n, "L").filter(ImageFilter.GaussianBlur(0.4))
    a = np.asarray(im, np.float32)
    b = np.roll(np.roll(a, size // 2, 0), size // 2, 1)
    ramp = np.linspace(0, 1, size, dtype=np.float32)
    m = np.minimum(ramp, ramp[::-1])
    mask = (m[:, None] * m[None, :])
    mask = (mask / mask.max()) ** 0.5
    return Image.fromarray(
        (a * mask + b * (1 - mask)).clip(0, 255).astype(np.uint8), "L").convert("RGB")


def feathered_crop(img, box, feather=148):
    crop = img.crop(box)
    w, h = crop.size
    f = max(1, int(feather))
    ramp = np.linspace(0, 1, f, dtype=np.float32) ** 0.8
    ax = np.ones(w, np.float32); ax[:f], ax[-f:] = ramp, ramp[::-1]
    ay = np.ones(h, np.float32); ay[:f], ay[-f:] = ramp, ramp[::-1]
    out = crop.copy()
    out.putalpha(Image.fromarray((ay[:, None] * ax[None, :] * 255).astype(np.uint8), "L"))
    return out


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    for p in sorted(SRC.glob("*")):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        img = grade(Image.open(p), brightness=BRIGHTNESS.get(p.stem, 1.0))
        h = max(1, round(1080 * img.height / img.width))
        band = vignette(add_grain(img.resize((1080, h), Image.LANCZOS)))
        band.save(OUT / f"{p.stem}.jpg", quality=94)
        backdrop(img).save(OUT / f"{p.stem}_bg.jpg", quality=88)
        print(f"broll/{p.stem}.jpg   1080x{h}  (+bg)")

    # The mascot render is centred and square, so it survives a 9:16 crop and
    # earns a full-bleed beat of its own.
    vira = grade(Image.open(SRC / "vira.png"))
    vignette(add_grain(fit(vira, 1080, 1920)), strength=0.42).save(
        OUT / "vira_hero.jpg", quality=94)
    print("broll/vira_hero.jpg 1080x1920  (full bleed)")

    # The gallery panorama stays at native width; the composition pans a
    # 1080-wide window across it, so upscaling here would only add weight.
    pano = vignette(add_grain(grade(Image.open(ASSETS / "panorama.png")), amount=5.0),
                    strength=0.22)
    pano.save(ASSETS / "panorama.jpg", quality=95)
    backdrop(pano, blur=54, brightness=0.44).save(ASSETS / "panorama_bg.jpg", quality=88)
    print(f"panorama.jpg     {pano.size}  (+bg)")

    mascot = Image.open(ASSETS / "mascot.png").convert("RGB")
    feathered_crop(mascot, (232, 168, 1030, 1120)).save(ASSETS / "mascot-plate.png")
    print("mascot-plate.png")

    grain_tile().save(ASSETS / "grain.png")
    print("grain.png")


if __name__ == "__main__":
    main()
