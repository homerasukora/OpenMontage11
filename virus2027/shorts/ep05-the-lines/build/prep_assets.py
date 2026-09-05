#!/usr/bin/env python3
"""
Asset prep for TRANSMISSION 03 — "THE REPLACEMENT".

Every source here is documentary: two press screenshots, an email screenshot,
an Instagram post, a hospital photograph and a before/after comparison. None
of it is brand artwork, so the job is the opposite of the welcome film's —
these have to keep reading as *evidence*, not as design. The grade is
therefore the lightest in the series: enough warmth to sit on the brand
ground, never enough to look retouched. A screenshot that has obviously been
colour-graded stops working as a screenshot.

Three of the sources were lifted out of a phone-shot clip and carry the
uploader's handle in a corner. That watermark is somebody else's credit on
our film, so it is blurred out here rather than cropped around — cropping it
away would take the evidence with it.

Outputs:
  broll/<name>.jpg      plate, native aspect, 1080 wide
  broll/<name>_bg.jpg   blurred 9:16 fill so a plate never floats in black
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
ASSETS = ROOT / "assets"
SRC = ASSETS / "broll_src"
OUT = ASSETS / "broll"

# Dead margin and furniture trimmed before the plate is built, in source px.
CROP = {
    "theory":    (0, 0, 960, 810),      # both faces, no shoulders
    "hospital":  (0, 28, 343, 295),
    "instagram": (0, 0, 402, 344),      # drop the "add a comment" bar
    "news":      (0, 126, 340, 414),    # headline plus the foot of the photo
}

# Plates derived from another source rather than supplied: the tight look at
# the quote line is the same screenshot, zoomed to where the forgery shows.
DERIVE = {"email_quote": ("email.png", (232, 96, 508, 178))}

# Somebody else's handle, as fractions of the cropped image. The hospital
# and Instagram plates lose theirs to the crop already, and so does the
# beauty-mark frame — its window had to move down to bring the mark itself
# into shot, and trimming the right edge took the handle with it. Only the
# news card carries one into frame.
WATERMARK = {
    "news":      (0.876, 0.548, 1.00, 0.722),
    "instagram": (0.745, 0.890, 1.00, 0.968),
}

# keep = how much of the source's own colour survives. Documents stay near 1.
GRADE = {
    "theory":    {"keep": 0.86, "brightness": 0.94, "contrast": 1.05},
    "email":     {"keep": 0.92, "brightness": 0.92, "contrast": 1.02},
    "mole":      {"keep": 0.88, "brightness": 0.90, "contrast": 1.04},
    "hospital":  {"keep": 0.88, "brightness": 0.92, "contrast": 1.04},
    "instagram": {"keep": 0.92, "brightness": 0.90, "contrast": 1.02},
    "news":       {"keep": 0.90, "brightness": 0.95, "contrast": 1.04},
    "email_quote": {"keep": 0.92, "brightness": 0.92, "contrast": 1.02},
    "now":         {"keep": 0.88, "brightness": 0.92, "contrast": 1.05},
}

# Blurring a mostly-white screenshot otherwise hazes the top of the frame.
BACKDROP = {"email": 0.16, "instagram": 0.16, "mole": 0.34,
            "hospital": 0.30, "news": 0.34, "theory": 0.34,
            "email_quote": 0.16, "now": 0.38}


def grade(img, keep=0.90, contrast=1.04, brightness=1.0, warm=1.0):
    rgb = img.convert("RGB")
    a = np.asarray(rgb.convert("L").convert("RGB"), np.float32)
    a[..., 0] *= 1 + 0.045 * warm
    a[..., 1] *= 1 - 0.005 * warm
    a[..., 2] *= 1 - 0.075 * warm
    warm_img = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    out = Image.blend(warm_img, rgb, keep)
    out = ImageEnhance.Contrast(out).enhance(contrast)
    return ImageEnhance.Brightness(out).enhance(brightness)


def add_grain(img, amount=5.0, seed=2027):
    rng = np.random.default_rng(seed)
    a = np.asarray(img, np.float32)
    return Image.fromarray(
        (a + rng.normal(0, amount, a.shape[:2])[..., None]).clip(0, 255).astype(np.uint8))


def scrub(img, box):
    """
    Paint out a rectangle using the pixels immediately to its left.

    A blur leaves a visible rectangle wherever the background is flat, which
    is exactly where these handles sit — over a dark scrim or a bedsheet. So
    each row of the box is filled with the median colour of the strip beside
    it, which follows a gradient and disappears into it.
    """
    w, h = img.size
    x0, y0, x1, y1 = (int(box[0] * w), int(box[1] * h),
                      int(box[2] * w), int(box[3] * h))
    a = np.asarray(img, np.float32).copy()
    ref = max(0, x0 - max(8, (x1 - x0) // 3))
    fill = np.median(a[y0:y1, ref:x0], axis=1, keepdims=True)
    a[y0:y1, x0:x1] = fill
    out = Image.fromarray(a.clip(0, 255).astype(np.uint8))
    # feather the seam so the patch does not read as a pasted block
    soft = out.filter(ImageFilter.GaussianBlur(2.5))
    out.paste(soft.crop((x0, y0, x1, y1)), (x0, y0))
    return out


def fit(img, w, h):
    sw, sh = img.size
    s = max(w / sw, h / sh)
    img = img.resize((max(1, round(sw * s)), max(1, round(sh * s))), Image.LANCZOS)
    sw, sh = img.size
    return img.crop(((sw - w) // 2, (sh - h) // 2, (sw - w) // 2 + w, (sh - h) // 2 + h))


def backdrop(img, blur=46, brightness=0.34):
    bg = fit(img, 1080, 1920).filter(ImageFilter.GaussianBlur(blur))
    return ImageEnhance.Brightness(bg).enhance(brightness)


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


def main():
    OUT.mkdir(parents=True, exist_ok=True)

    for name, (parent, box) in DERIVE.items():
        Image.open(SRC / parent).convert("RGB").crop(box).save(SRC / f"{name}.png")

    for p in sorted(SRC.glob("*")):
        if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp"}:
            continue
        img = Image.open(p).convert("RGB")
        if p.stem in CROP:
            img = img.crop(CROP[p.stem])
        if p.stem in WATERMARK:
            img = scrub(img, WATERMARK[p.stem])
        img = grade(img, **GRADE.get(p.stem, {}))

        h = max(1, round(1080 * img.height / img.width))
        add_grain(img.resize((1080, h), Image.LANCZOS)).save(
            OUT / f"{p.stem}.jpg", quality=94)
        backdrop(img, brightness=BACKDROP.get(p.stem, 0.34)).save(
            OUT / f"{p.stem}_bg.jpg", quality=88)
        print(f"broll/{p.stem}.jpg   1080x{h}  (+bg)")

    grain_tile().save(ASSETS / "grain.png")
    print("grain.png")


if __name__ == "__main__":
    main()
