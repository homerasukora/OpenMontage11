#!/usr/bin/env python3
"""
ep08 THE DARK FOREST — picture prep.

Two supplied vertical space reels plus five stills, all pulled onto one
grade so a cut between a 1080-wide reel, a 576-wide reel and a 598-wide
photograph does not announce itself.

The grade is the interesting decision. The series is mono-and-orange, and
the honest reading of that rule here would be to strip these sources to
grey. That would be wrong: this is the one episode whose subject is the
sky, and the sky is the only thing the viewer came for. So saturation
comes down to a little under half and the whole range is pushed warm —
blues fall back to steel, and the two genuinely orange sources in the
footage (the accretion disk, the lava-crack planet) land exactly on the
brand accent without being touched. The result is recognisably this
series and still worth looking at.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path("/root/.claude/uploads/685963b1-f9b5-55d9-81cf-61d11216ce4a")
PUB = ROOT / "remotion" / "public"
W, H = 1080, 1920

VID_A = SRC / "57363e1a-byafterspace__TikTokDownloader.com_15bed"
VID_B = SRC / "35272345-enjoyer.of.the.universe_TikTokDownloader.com_85f4e"

# Saturation down, everything warmed across shadows/mids/highlights. No
# channel mixer here — mixing on top of a saturation pull crushes the few
# reds that are supposed to survive.
def grade(sat=0.46, contrast=1.11, bright=-0.018):
    return (
        f"eq=saturation={sat}:contrast={contrast}:brightness={bright},"
        "colorbalance=rs=0.04:bs=-0.05:rm=0.05:bm=-0.06:rh=0.06:bh=-0.07"
    )


# The two reels do not sit at the same saturation and cannot take the same
# pull. Reel A is hyper-saturated digital nebula art — magenta and electric
# blue — and needs to come almost all the way down before it stops fighting
# the brand. Reel B is already close to natural and only needs half a stop.
# Two shots are exempt in the other direction: the accretion disk and the
# lava-fracture planet are, untouched, almost exactly the brand orange, so
# pulling them with the rest would throw away the one piece of luck in this
# footage. They keep most of their chroma and land on #ff531f by themselves.
GRADE = grade()
GRADE_A = grade(sat=0.30, contrast=1.14)
GRADE_B = grade(sat=0.52)
GRADE_HOT = grade(sat=0.86, contrast=1.13)

# The stills are 397-2576 px wide against a 1080 frame. Sharpening after
# the upscale keeps the small ones from going to soup; the reels are clean
# enough not to need it.
SHARP = "unsharp=5:5:0.55:5:5:0.0"

# Vertical band geometry. Matches the other episodes so a viewer who has
# seen ep06 or ep07 reads these as the same document.
BAND_W = round(W * 1.0)


def sh(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"FAILED {' '.join(map(str, args))}\n{r.stderr[-1800:]}")


# Scene boundaries in the two supplied reels, from
#   ffmpeg -i <reel> -filter:v "select='gt(scene,0.25)',showinfo" -f null -
# A cut that crosses one of these plays two different shots inside what the
# beat sheet thinks is a single shot. That is not a subtle defect — it put a
# third of a second of accretion disk on the end of the Earth-limb shot in
# the first cut of this episode, and nothing in the timing model can catch
# it because the model only knows durations, not content.
SCENES = {
    "A": [0.0, 2.70, 5.55, 8.42, 9.12, 10.55, 11.20, 11.88, 12.55, 13.27,
          14.00, 16.05, 17.92],
    "B": [0.0, 3.96, 6.60, 9.56, 14.00, 14.84, 15.64, 19.16, 23.84, 27.68,
          32.12, 38.28, 41.45],
}
# How close a cut may come to a boundary before it is treated as crossing it.
SCENE_MARGIN = 0.08


def check_window(reel, name, start, dur):
    """Fail the build if a cut spans a scene change in its source reel."""
    end = start + dur
    for b in SCENES[reel]:
        if start + SCENE_MARGIN < b < end - SCENE_MARGIN:
            sys.exit(
                f"SCENE CROSS: {name} ({reel}) {start:.2f}-{end:.2f} spans a "
                f"cut at {b:.2f}. Pick a window inside one scene."
            )
    if not (start >= SCENES[reel][0] and end <= SCENES[reel][-1]):
        sys.exit(f"OUT OF RANGE: {name} ({reel}) {start:.2f}-{end:.2f}")


def clip(src, name, start, dur, crop=None, grade=GRADE, reel=None):
    if reel:
        check_window(reel, name, start, dur)
    """
    A graded vertical cut. Both reels are already 9:16, so nothing is
    reframed by default — cover-scaling to 1080x1920 is a straight
    resample, and the 576-wide source takes a light sharpen on the way up.
    """
    vf = []
    if crop:
        vf.append(crop)
    vf += [
        f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos",
        f"crop={W}:{H}",
        grade,
        SHARP,
        "format=yuv420p",
    ]
    sh([
        "ffmpeg", "-y", "-loglevel", "error",
        "-ss", f"{start}", "-i", str(src), "-t", f"{dur}",
        "-an", "-vf", ",".join(vf),
        "-r", "30", "-c:v", "libx264", "-crf", "17", "-preset", "slow",
        "-pix_fmt", "yuv420p",
        str(PUB / f"{name}.mp4"),
    ])


def band(src, name, width=BAND_W, grade=GRADE):
    """
    A photographic plate plus the blurred cover it sits on. Same pair the
    Band component has expected since ep02.
    """
    sh([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
        "-vf", f"scale={width}:-2:flags=lanczos,{grade},{SHARP}",
        "-q:v", "2", str(PUB / f"{name}.jpg"),
    ])
    sh([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
        "-vf", (
            f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H},{grade},gblur=sigma=30,eq=brightness=-0.09:saturation=0.7"
        ),
        "-q:v", "4", str(PUB / f"{name}_bg.jpg"),
    ])


def hero(src, name, grade=GRADE):
    """Full-bleed plate. Only for sources wide enough to survive the crop."""
    sh([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
        "-vf", (
            f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H},{grade},{SHARP}"
        ),
        "-q:v", "2", str(PUB / f"{name}.jpg"),
    ])


def mascot():
    """
    Trim the supplied Vira to his alpha bbox and export him at 2x.

    The source is a clean RGBA render, so there is no keying to do — the
    only work is cropping the empty margin and giving the renderer a bitmap
    slightly larger than the 300 CSS px he is drawn at. Alpha is projected
    per axis rather than taking a plain bbox: the antialiased tips of his
    spikes leave near-zero pixels that hold a naive bbox open several px on
    every side.
    """
    from PIL import Image
    import numpy as np

    src = Image.open(ROOT / "assets" / "src" / "vira-thinking.png").convert("RGBA")
    a = np.asarray(src)[:, :, 3]
    x0, x1 = np.nonzero(a.max(axis=0) > 10)[0][[0, -1]]
    y0, y1 = np.nonzero(a.max(axis=1) > 10)[0][[0, -1]]
    pad = 2
    cut = src.crop((max(0, x0 - pad), max(0, y0 - pad),
                    min(src.width, x1 + 1 + pad), min(src.height, y1 + 1 + pad)))
    target_w = 620
    out = cut.resize((target_w, round(cut.height * target_w / cut.width)),
                     Image.LANCZOS)
    out.save(ROOT / "assets" / "mascot-plate.png")
    out.save(PUB / "mascot-plate.png")
    print(f"  mascot trimmed {src.size} -> {cut.size} -> {out.size}")


def main():
    PUB.mkdir(parents=True, exist_ok=True)
    mascot()

    # ---------------------------------------------------------- stills
    # 16:9 and big — the only source that can carry a full-bleed crop.
    hero(SRC / "5d676637-image.jpg", "solar")

    # Everything else is 397-1728 px wide and plays as a plate.
    band(SRC / "25e202c8-image.jpg", "beam")      # dish transmitting to a star
    band(SRC / "4ceb1615-image.jpg", "dishes")    # the array, from the air
    band(SRC / "64a9fec5-image.jpg", "earth_far")  # Earth in a starfield
    band(SRC / "c2114ad8-image.jpg", "earthrise", width=round(W * 0.66))

    # ------------------------------------------------------------ reel A
    # High-res vertical nebula plates. Warm ones open the film, the near
    # black ones carry the two lines about silence.
    # Reel A changes scene roughly every two and a half seconds and then
    # speeds up to half-second flashes after 0:12, so only the first three
    # scenes are long enough to hold a shot. The galaxy is taken as a short
    # flash on purpose — it is the one cut in the film under a second.
    clip(VID_A, "neb_warm", 0.15, 2.40, grade=GRADE_A, reel="A")  # tan cloud
    clip(VID_A, "neb_blue", 3.05, 2.35, grade=GRADE_A, reel="A")  # cold pillar
    clip(VID_A, "neb_pink", 6.05, 2.10, grade=GRADE_A, reel="A")  # rose bank

    # ------------------------------------------------------------ reel B
    # 576x1024, so every one of these is a 1.9x upscale. They are smooth
    # gradients and hold it; the grain in Ground does the rest.
    clip(VID_B, "giant", 0.40, 2.80, grade=GRADE_B, reel="B")   # gas giant
    clip(VID_B, "cities", 6.75, 2.70, grade=GRADE_B, reel="B")  # Earth limb
    clip(VID_B, "disk", 10.70, 3.00, grade=GRADE_HOT, reel="B")  # disk
    clip(VID_B, "moons", 14.05, 0.70, grade=GRADE_B, reel="B")  # two moons
    clip(VID_B, "dust", 16.10, 2.85, grade=GRADE_B, reel="B")   # dusty limb
    clip(VID_B, "rust", 24.60, 2.60, grade=GRADE_B, reel="B")   # rust crescent
    clip(VID_B, "ringworld", 28.60, 2.80, grade=GRADE_B, reel="B")  # alone
    clip(VID_B, "gold", 32.30, 2.50, grade=GRADE_B, reel="B")   # crescent
    clip(VID_B, "lava", 35.30, 2.60, grade=GRADE_HOT, reel="B")  # fractures
    clip(VID_B, "blue", 38.42, 2.80, grade=grade(sat=0.52, bright=-0.06),
         reel="B")

    # The void backdrop. The film goes to this twice, both times so a drawn
    # diagram can be read, so it has to be genuinely dark — a blurred nebula
    # at readable brightness is purple fog and the white line work dies in
    # it. Chroma is taken out entirely and the whole thing sits about two
    # stops down: enough texture that the frame is not a dead rectangle,
    # not enough to compete with anything drawn on top.
    sh([
        "ffmpeg", "-y", "-loglevel", "error", "-ss", "9.8", "-i", str(VID_A),
        "-frames:v", "1",
        "-vf", (
            f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H},hue=s=0,gblur=sigma=22,"
            "eq=brightness=-0.16:contrast=0.72"
        ),
        "-q:v", "3", str(PUB / "void_bg.jpg"),
    ])

    for f in sorted(PUB.iterdir()):
        print(f"  {f.name:22s} {f.stat().st_size // 1024:6d} KB")


if __name__ == "__main__":
    main()
