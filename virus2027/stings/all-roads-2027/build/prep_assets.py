#!/usr/bin/env python3
"""
Asset prep for the ALL ROADS -> 2027 sting.

Two brand marks come in as flat PNGs and have to leave as cutouts that can sit
on the #090806 ground without a visible plate behind them. Neither is
redrawn, recoloured or reproportioned — this stage only removes background.

  logo_v.png   ivory V, already alpha -> source alpha used as-is, trimmed
  mascot.png   Vira on near-black -> feathered crop, background left as is
                                     because it already matches our ground
  coin.png     token on black velvet -> luma key; the coin is an order of
                                     magnitude brighter than its backdrop, and
                                     a rectangular feather would show its own
                                     edge against the velvet texture

Also emits the tiling grain plate the composition scrolls over everything.
"""

from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "src"
OUT = ROOT / "assets"


def trim_to_glyph(im, pad=10, min_run=14):
    """
    Trim to the mark itself.

    The supplied logo already carries a correct alpha channel, so nothing is
    keyed here — touching the colour would recolour the brand. What has to go
    is the scatter of stray specks in the far corners of the plate: a plain
    alpha bbox catches those and never trims. Projecting the alpha onto each
    axis and keeping only rows and columns with a real run of ink finds the
    glyph and leaves the specks outside the crop.
    """
    a = np.asarray(im.getchannel("A"), np.float32) > 90
    cols = np.where(a.sum(0) >= min_run)[0]
    rows = np.where(a.sum(1) >= min_run)[0]
    if not len(cols) or not len(rows):
        return im
    return im.crop((max(0, cols.min() - pad), max(0, rows.min() - pad),
                    min(im.width, cols.max() + pad), min(im.height, rows.max() + pad)))


def feathered(path, box, feather=90):
    im = Image.open(path).convert("RGB").crop(box)
    w, h = im.size
    f = max(1, int(feather))
    ramp = np.linspace(0, 1, f, dtype=np.float32) ** 0.8
    ax = np.ones(w, np.float32); ax[:f], ax[-f:] = ramp, ramp[::-1]
    ay = np.ones(h, np.float32); ay[:f], ay[-f:] = ramp, ramp[::-1]
    out = im.convert("RGBA")
    out.putalpha(Image.fromarray((ay[:, None] * ax[None, :] * 255).astype(np.uint8), "L"))
    return out


def luma_key(path, lo=16, hi=54, feather=1.2):
    """
    Alpha from luminance, for a lit object photographed on black.

    The coin sits on dark velvet that is not quite the film's ground, so a
    feathered rectangle would put a faint square around it. Keying on
    brightness instead follows the coin's actual silhouette, including the
    milled edge. `lo`/`hi` straddle the velvet's brightest speck and the
    coin's darkest shadowed rim; the blur softens the cut without eroding it.
    Colour is untouched.
    """
    im = Image.open(path).convert("RGB")
    lum = np.asarray(im.convert("L"), np.float32)
    a = np.clip((lum - lo) / max(1e-6, hi - lo), 0, 1)
    alpha = Image.fromarray((a * 255).astype(np.uint8), "L")
    alpha = alpha.filter(ImageFilter.GaussianBlur(feather))
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


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
    logo = trim_to_glyph(Image.open(SRC / "logo_v.png").convert("RGBA"))
    logo.save(OUT / "logo-v.png")
    print(f"logo-v.png      {logo.size}  source alpha, colour untouched")

    # the render is centred and square; this window holds the whole character
    # including every spike and both shoes, which the brand manual fixes
    mascot = trim_to_glyph(feathered(SRC / "mascot.png", (250, 190, 1010, 1105)), pad=0)
    mascot.save(OUT / "mascot-plate.png")
    print(f"mascot-plate.png {mascot.size}  feathered, silhouette intact")

    coin = trim_to_glyph(luma_key(SRC / "coin.png"), pad=6, min_run=6)
    coin.save(OUT / "coin.png")
    print(f"coin.png        {coin.size}  luma keyed off the velvet")

    grain_tile().save(OUT / "grain.png")
    print("grain.png")


if __name__ == "__main__":
    main()
