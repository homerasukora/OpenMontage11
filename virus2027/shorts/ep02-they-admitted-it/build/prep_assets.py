#!/usr/bin/env python3
"""
Asset prep for TRANSMISSION 02.

Grades the supplied photographs into the VIRUS2027 archive look and produces
the brand plates the composition needs.

The grade is not a flat desaturation: it keeps a little of each photo's own
colour so the b-roll still reads as a real photograph (which is the point of
cutting to it), while pulling everything onto the same warm, grainy, high
contrast ground so the cut-ins do not look like stock dropped into a brand.

Drop any further photographs into assets/broll_src/ and re-run — every file
there is graded with the same chain and written to assets/broll/.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SRC = ASSETS / "broll_src"
OUT = ASSETS / "broll"

# per-image colour retention: 0 = full warm monochrome, 1 = untouched
KEEP_COLOUR = {
    "virus": 0.62,     # the render is already brand orange — let it stay hot
    "medics": 0.10,
    "us": 0.08,
}


def grade(img, keep=0.10, contrast=1.22, brightness=0.86):
    rgb = img.convert("RGB")
    grey = rgb.convert("L").convert("RGB")

    # warm the monochrome toward the brand's paper tone rather than neutral grey
    a = np.asarray(grey, np.float32)
    a[..., 0] *= 1.045
    a[..., 1] *= 0.995
    a[..., 2] *= 0.925
    warm = Image.fromarray(a.clip(0, 255).astype(np.uint8))

    out = Image.blend(warm, rgb, keep)
    out = ImageEnhance.Contrast(out).enhance(contrast)
    out = ImageEnhance.Brightness(out).enhance(brightness)
    return out


def add_grain(img, amount=9.0, seed=2027):
    rng = np.random.default_rng(seed)
    a = np.asarray(img, np.float32)
    n = rng.normal(0, amount, a.shape[:2])[..., None]
    return Image.fromarray((a + n).clip(0, 255).astype(np.uint8))


def vignette(img, strength=0.42):
    w, h = img.size
    yy, xx = np.mgrid[0:h, 0:w]
    cx, cy = w / 2, h / 2
    r = np.sqrt(((xx - cx) / cx) ** 2 + ((yy - cy) / cy) ** 2)
    v = np.clip(1 - strength * np.clip(r - 0.42, 0, None) ** 1.5 * 2.2, 0, 1)
    a = np.asarray(img, np.float32) * v[..., None]
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def fit(img, w, h):
    """Cover-crop to exactly w x h."""
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(1, round(sw * s)), max(1, round(sh * s))), Image.LANCZOS)
    sw, sh = img.size
    return img.crop(((sw - w) // 2, (sh - h) // 2,
                     (sw - w) // 2 + w, (sh - h) // 2 + h))


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
    return Image.fromarray((a * mask + b * (1 - mask)).clip(0, 255).astype(np.uint8), "L").convert("RGB")


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

    # 4:5 is the card aspect the composition frames b-roll in
    for p in sorted(SRC.glob("*")):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        keep = KEEP_COLOUR.get(p.stem, 0.10)
        img = grade(Image.open(p), keep=keep)
        img = vignette(add_grain(fit(img, 1000, 1250)))
        img.save(OUT / f"{p.stem}.jpg", quality=93)
        print(f"broll/{p.stem}.jpg   keep_colour={keep}")

    key = Image.open(ASSETS / "keyart-2027.png").convert("RGB")
    band = key.crop((0, 0, key.width, 372)).resize((1080, 320), Image.LANCZOS)
    wall = Image.new("RGB", (1080, 1920))
    for i in range(6):
        wall.paste(band if i % 2 == 0 else band.transpose(Image.FLIP_LEFT_RIGHT), (0, i * 320))
    wall.filter(ImageFilter.GaussianBlur(2.4)).save(ASSETS / "wall-officials.png")
    print("wall-officials.png")

    seat = Image.open(ASSETS / "eleventh-seat.png").convert("RGB")
    seat = seat.crop((0, 0, seat.width, 772))
    fit(seat, 1000, 1250).save(OUT / "seat.jpg", quality=93)
    print("broll/seat.jpg")

    mascot = Image.open(ASSETS / "mascot.png").convert("RGB")
    feathered_crop(mascot, (232, 168, 1030, 1120)).save(ASSETS / "mascot-plate.png")
    print("mascot-plate.png")

    grain_tile().save(ASSETS / "grain.png")
    print("grain.png")


if __name__ == "__main__":
    main()
