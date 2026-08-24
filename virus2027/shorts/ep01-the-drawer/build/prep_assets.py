#!/usr/bin/env python3
"""
Asset preparation for TRANSMISSION 01.

  1. mascot-cut.png     — mascot matted off its near-black plate (alpha)
  2. seat-916.png       — "The Eleventh Seat" re-framed to 9:16 on the empty chair
  3. grain.png          — seamless monochrome film grain tile
  4. keyart-916.png     — 2027 key art re-framed to 9:16

Matting uses a border flood fill rather than a luma threshold, so the
mascot's dark grey legs and shoes survive.
"""

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ASSETS = Path(__file__).resolve().parent.parent / "assets"


def keep_large_components(mask, min_frac=0.002):
    """Drop specks: keep only blobs bigger than min_frac of the frame."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    out = np.zeros_like(mask)
    limit = int(h * w * min_frac)
    for sy in range(h):
        for sx in range(w):
            if not mask[sy, sx] or seen[sy, sx]:
                continue
            q = deque([(sy, sx)])
            seen[sy, sx] = True
            comp = []
            while q:
                y, x = q.popleft()
                comp.append((y, x))
                for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
            if len(comp) >= limit:
                for y, x in comp:
                    out[y, x] = True
    return out


def frame_seat(seat, scale=1.42, chair=(0.50, 0.72), place=(0.50, 0.52)):
    """
    Re-frame "The Eleventh Seat" to 1080x1920 with the empty chair as hero.

    The burned-in title is dropped, and because the chair sits low in the
    source there is not enough plate below it to cover a 9:16 frame — so the
    top and bottom edge rows are smeared outward and darkened instead of
    leaving a hard cut.
    """
    src = seat.crop((0, 0, seat.width, 772))
    w, h = int(src.width * scale), int(src.height * scale)
    img = src.resize((w, h), Image.LANCZOS)

    cx, cy = int(chair[0] * w), int(chair[1] * h)
    left = int(cx - place[0] * 1080)
    top = int(cy - place[1] * 1920)

    canvas = Image.new("RGB", (1080, 1920), (9, 8, 6))
    canvas.paste(img, (-left, -top))

    a = np.asarray(canvas).astype(np.float32)
    y0, y1 = max(0, -top), min(1920, -top + h)
    if y0 > 0:                                    # extend upward
        a[:y0] = a[y0]
    if y1 < 1920:                                 # extend downward
        a[y1:] = a[y1 - 1]
    # fade the smeared bands into the ground so no band edge reads
    ramp_top = np.clip(np.linspace(0.18, 1.0, max(1, y0)), 0, 1)[:, None, None]
    ramp_bot = np.clip(np.linspace(1.0, 0.05, max(1, 1920 - y1)), 0, 1)[:, None, None]
    if y0 > 0:
        a[:y0] *= ramp_top
    if y1 < 1920:
        a[y1:] *= ramp_bot
    return Image.fromarray(a.clip(0, 255).astype(np.uint8))


def feathered_crop(img, box, feather=70):
    """Crop and fade the edges to alpha 0 so the plate melts into the ground."""
    crop = img.crop(box)
    w, h = crop.size
    ax = np.ones(w, dtype=np.float32)
    ay = np.ones(h, dtype=np.float32)
    f = max(1, int(feather))
    ramp = np.linspace(0, 1, f, dtype=np.float32) ** 0.8
    ax[:f], ax[-f:] = ramp, ramp[::-1]
    ay[:f], ay[-f:] = ramp, ramp[::-1]
    alpha = (ay[:, None] * ax[None, :] * 255).astype(np.uint8)
    out = crop.copy()
    out.putalpha(Image.fromarray(alpha, mode="L"))
    return out


def matte_from_border(img, tol=26, feather=1.6):
    """Alpha = everything not reachable from the border as 'background'."""
    lum = np.asarray(img.convert("L"), dtype=np.int16)
    h, w = lum.shape
    bg = np.zeros((h, w), dtype=bool)
    q = deque()

    for x in range(w):
        for y in (0, h - 1):
            if not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        base = lum[y, x]
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            ny, nx = y + dy, x + dx
            if 0 <= ny < h and 0 <= nx < w and not bg[ny, nx]:
                # background is dark and locally flat; stop at any real edge
                if lum[ny, nx] <= tol and abs(int(lum[ny, nx]) - int(base)) <= 10:
                    bg[ny, nx] = True
                    q.append((ny, nx))

    fg = ~bg
    fg = keep_large_components(fg, min_frac=0.002)
    alpha = Image.fromarray((fg * 255).astype(np.uint8))
    alpha = alpha.filter(ImageFilter.MaxFilter(3))          # close pinholes
    alpha = alpha.filter(ImageFilter.GaussianBlur(feather))  # soften the edge
    out = img.convert("RGB").copy()
    out.putalpha(alpha)
    return out


def crop_916(img, center_x_frac=0.5, center_y_frac=0.5, zoom=1.0):
    w, h = img.size
    ch = int(h / zoom)
    cw = int(ch * 9 / 16)
    if cw > w:
        cw = w
        ch = int(cw * 16 / 9)
    cx = int(w * center_x_frac)
    cy = int(h * center_y_frac)
    left = max(0, min(w - cw, cx - cw // 2))
    top = max(0, min(h - ch, cy - ch // 2))
    return img.crop((left, top, left + cw, top + ch))


def grain_tile(size=320, seed=2027):
    rng = np.random.default_rng(seed)
    n = rng.normal(128, 34, (size, size)).clip(0, 255).astype(np.uint8)
    im = Image.fromarray(n, mode="L").filter(ImageFilter.GaussianBlur(0.4))
    # make it tile without a visible seam
    a = np.asarray(im, dtype=np.float32)
    b = np.roll(np.roll(a, size // 2, 0), size // 2, 1)
    ramp = np.linspace(0, 1, size, dtype=np.float32)
    mask = np.minimum(ramp, ramp[::-1])[:, None] * np.minimum(ramp, ramp[::-1])[None, :]
    mask = (mask / mask.max()) ** 0.5
    merged = (a * mask + b * (1 - mask)).clip(0, 255).astype(np.uint8)
    return Image.fromarray(merged, mode="L").convert("RGB")


def main():
    # The mascot's own plate is #0a0a0b — within a hair of the video ground
    # (#090806) — so a feathered crop blends invisibly and keeps the dark
    # legs and shoes that a luma matte destroys.
    mascot = Image.open(ASSETS / "mascot.png").convert("RGB")
    cut = feathered_crop(mascot, (232, 168, 1030, 1120), feather=148)
    cut.save(ASSETS / "mascot-plate.png")
    print(f"mascot-plate.png {cut.size}  (feathered plate)")

    # Drop the burned-in "THE ELEVENTH SEAT" title; Remotion frames and
    # pushes in on the empty chair itself.
    seat = Image.open(ASSETS / "eleventh-seat.png").convert("RGB")
    seat916 = frame_seat(seat)
    seat916.save(ASSETS / "seat-916.png")
    print(f"seat-916.png     {seat916.size}  (chair framed, edges extended)")

    # Archive wall for the dossier scene. The key art's big numerals occupy
    # x 157-1041, so any 9:16 slice of it drags a ghost "2027" into frame.
    # Instead: take the type-free top band (UFO, eye, dossiers, redacted
    # portraits) and stack it, flipping alternate courses so it reads as a
    # dense wall rather than an obvious repeat.
    key = Image.open(ASSETS / "keyart-2027.png").convert("RGB")
    band = key.crop((0, 0, key.width, 372)).resize((1080, 320), Image.LANCZOS)
    wall = Image.new("RGB", (1080, 1920))
    for i in range(6):
        course = band if i % 2 == 0 else band.transpose(Image.FLIP_LEFT_RIGHT)
        wall.paste(course, (0, i * 320))
    wall = wall.filter(ImageFilter.GaussianBlur(2.4))
    wall.save(ASSETS / "wall-officials.png")
    print(f"wall-officials.png {wall.size}  (stacked type-free band)")

    g = grain_tile()
    g.save(ASSETS / "grain.png")
    print(f"grain.png        {g.size}")


if __name__ == "__main__":
    main()
