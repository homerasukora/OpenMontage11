#!/usr/bin/env python3
"""
ep09 HOMESICK — picture prep.

Three supplied clips and one photograph, pulled onto the series grade.

    K  a 720x728 space montage that changes scene every 0.3-2 s.  Far too
       short to hold a shot, so it supplies half-second flashes at keywords,
       slowed 2x so they read as a held beat rather than a strobe.
    D  a 1920x1080 reel with a "DOTFOS" watermark bottom centre.  Long clean
       scenes (1.3-1.8 s) and one 7.9 s binary-star scene.
    N  a 1080x1920 reel: a glowing white silhouette on a galaxy.  One 9.3 s
       scene.  The silhouette is the best prop in the whole kit — the script
       talks about bodies and about something "inside us", and here is a
       body with a galaxy behind it.
    U  the flying-saucer photograph, 1200x574.

Every window is checked against the scene boundaries of its reel and the
build fails if one crosses a cut. See ep08's README for why: the timing
model knows durations, not contents, and a window that straddles a cut plays
two shots inside what the beat sheet thinks is one.
"""

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = Path("/root/.claude/uploads/685963b1-f9b5-55d9-81cf-61d11216ce4a")
PUB = ROOT / "remotion" / "public"
W, H = 1080, 1920

REEL = {
    "K": SRC / "77281513-kristall_111__TikTokDownloader.com_70e52",
    "D": SRC / "0b34819d-dotfos_TikTokDownloader.com_2146e",
    "N": SRC / "b2180280-nickjaykdesign_TikTokDownloader.com_9852c",
}
UFO = SRC / "6a77a899-image.webp"

# Detected with: ffmpeg -i <reel> -filter:v "select='gt(scene,0.10)',showinfo"
#                -f null -        (0.10, not 0.25: this montage dissolves)
SCENES = {
    "K": [0.0, 0.53, 1.00, 1.43, 1.90, 2.43, 3.23, 3.60, 3.93, 4.33, 4.90,
          5.33, 5.80, 6.13, 6.80, 7.20, 7.73, 8.27, 8.67, 9.13, 9.50, 10.10,
          10.60, 11.27, 11.63, 12.30, 12.60, 13.27, 13.67, 13.87, 14.40,
          15.07, 15.93],
    "D": [0.0, 7.88, 8.71, 10.29, 11.62, 13.00, 14.38, 16.21, 17.67, 18.97],
    "N": [0.0, 9.26],
}
SCENE_MARGIN = 0.08

# Same warm-shift as the rest of the series; the saturation differs per
# source because the sources do. D and N are hyper-saturated digital art and
# need to come nearly all the way down; K and the photo are closer to natural.
def grade(sat, contrast=1.11, bright=-0.018):
    return (
        f"eq=saturation={sat}:contrast={contrast}:brightness={bright},"
        "colorbalance=rs=0.04:bs=-0.05:rm=0.05:bm=-0.06:rh=0.06:bh=-0.07"
    )


G_D = grade(0.34, 1.13)
G_N = grade(0.30, 1.08, -0.01)   # white silhouette must stay white
G_K = grade(0.46, 1.12)
G_U = grade(0.58, 1.10, -0.01)
SHARP = "unsharp=5:5:0.5:5:5:0.0"

# Freeze padding on every clip. A shot that runs slightly longer than its
# window holds the last frame instead of going black.
HOLD = 1.0


def sh(args):
    r = subprocess.run(args, capture_output=True, text=True)
    if r.returncode != 0:
        sys.exit(f"FAILED {' '.join(map(str, args))}\n{r.stderr[-1800:]}")


def check_window(reel, name, start, dur):
    end = start + dur
    for b in SCENES[reel][1:-1]:
        if start + SCENE_MARGIN < b < end - SCENE_MARGIN:
            sys.exit(f"SCENE CROSS: {name} ({reel}) {start:.2f}-{end:.2f} "
                     f"spans a cut at {b:.2f}")
    if start < SCENES[reel][0] or end > SCENES[reel][-1] + 0.05:
        sys.exit(f"OUT OF RANGE: {name} ({reel}) {start:.2f}-{end:.2f}")


def clip(reel, name, start, dur, grd, slow=1.0, crop=None, letterbox=False):
    """
    Cut one window to 1080x1920.

    crop       pre-crop of the source, used to remove D's watermark.
    letterbox  composite the footage as a band over a blurred copy of
               itself instead of cover-cropping it. K is near-square and
               720 px wide, so cover-cropping to 9:16 would be a 2.6x
               upscale of the height; as a band it is 1.5x.
    slow       setpts stretch. Used on K's half-second flashes.
    """
    check_window(reel, name, start, dur)
    pre = (crop + ",") if crop else ""
    stretch = f"setpts={slow}*PTS," if slow != 1.0 else ""
    pad = f",tpad=stop_mode=clone:stop_duration={HOLD}"
    out = PUB / f"{name}.mp4"
    common = ["ffmpeg", "-y", "-loglevel", "error",
              "-ss", f"{start}", "-i", str(REEL[reel]), "-t", f"{dur}", "-an"]
    enc = ["-r", "30", "-c:v", "libx264", "-crf", "17", "-preset", "slow",
           "-pix_fmt", "yuv420p", str(out)]
    if letterbox:
        fc = (
            f"[0:v]{pre}{stretch}fps=30,split=2[a][b];"
            f"[a]scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
            f"crop={W}:{H},gblur=sigma=34,eq=brightness=-0.12:saturation=0.8,{grd}[bg];"
            f"[b]scale={W}:-2:flags=lanczos,{grd},{SHARP}[fg];"
            f"[bg][fg]overlay=(W-w)/2:(H-h)/2{pad},format=yuv420p[v]"
        )
        sh(common + ["-filter_complex", fc, "-map", "[v]"] + enc)
    else:
        vf = (f"{pre}{stretch}fps=30,"
              f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
              f"crop={W}:{H},{grd},{SHARP}{pad},format=yuv420p")
        sh(common + ["-vf", vf] + enc)


def band(src, name, width=W):
    """A photographic plate plus the blurred cover it sits on."""
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
        "-vf", f"scale={width}:-2:flags=lanczos,{G_U},{SHARP}",
        "-q:v", "2", str(PUB / f"{name}.jpg")])
    sh(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src),
        "-vf", (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
                f"crop={W}:{H},{G_U},gblur=sigma=30,eq=brightness=-0.09:saturation=0.7"),
        "-q:v", "4", str(PUB / f"{name}_bg.jpg")])


def void(reel, t, name, grd):
    """
    A dark exhibit backdrop. Chroma out, blurred, about two stops down —
    dark enough that thin white line work reads on it, textured enough that
    the frame is not a dead rectangle. Three variants so the film's several
    diagram shots do not all sit on the same wallpaper.
    """
    sh(["ffmpeg", "-y", "-loglevel", "error", "-ss", f"{t}", "-i", str(REEL[reel]),
        "-frames:v", "1",
        "-vf", (f"scale={W}:{H}:force_original_aspect_ratio=increase:flags=lanczos,"
                f"crop={W}:{H},hue=s=0,gblur=sigma=22,eq=brightness=-0.16:contrast=0.72"),
        "-q:v", "3", str(PUB / f"{name}.jpg")])


def mascot():
    """Trim the supplied Vira to his alpha bbox and export at 2x."""
    from PIL import Image
    import numpy as np
    src = Image.open(ROOT / "assets" / "src" / "vira-thinking.png").convert("RGBA")
    a = np.asarray(src)[:, :, 3]
    x0, x1 = np.nonzero(a.max(axis=0) > 10)[0][[0, -1]]
    y0, y1 = np.nonzero(a.max(axis=1) > 10)[0][[0, -1]]
    cut = src.crop((max(0, x0 - 2), max(0, y0 - 2),
                    min(src.width, x1 + 3), min(src.height, y1 + 3)))
    out = cut.resize((620, round(cut.height * 620 / cut.width)), Image.LANCZOS)
    out.save(ROOT / "assets" / "mascot-plate.png")
    out.save(PUB / "mascot-plate.png")


# D's watermark sits in the bottom ~7% of the frame, centred. Cropping it out
# removes it entirely, which a delogo patch over a nebula never would.
NO_MARK = "crop=iw:ih*0.915:0:0"


def main():
    PUB.mkdir(parents=True, exist_ok=True)
    mascot()

    band(UFO, "ufo")

    # ---- D : long clean scenes, watermark cropped out
    clip("D", "twin",      4.90, 2.10, G_D, crop=NO_MARK)    # binary star, far
    clip("D", "merge",     0.90, 1.60, G_D, crop=NO_MARK)    # binary star, close
    clip("D", "clouds",   10.29, 1.33, G_D, crop=NO_MARK)    # pink cloud bank
    clip("D", "milky",     8.71, 1.58, G_D, slow=1.25, crop=NO_MARK)
    clip("D", "blue",     14.38, 1.83, G_D, crop=NO_MARK)    # blue nebula
    clip("D", "lightning", 11.62, 1.38, G_D, crop=NO_MARK)   # dark, thin lines
    clip("D", "white",    13.00, 1.38, G_D, crop=NO_MARK)    # white cloud
    clip("D", "edge",     16.21, 1.46, G_D, slow=1.4, crop=NO_MARK)  # galaxy edge-on
    clip("D", "red",      17.67, 1.30, G_D, crop=NO_MARK)    # red nebula

    # ---- N : the silhouette. Three non-overlapping windows of one scene.
    clip("N", "sil_a", 3.40, 3.00, G_N)
    clip("N", "sil_b", 0.00, 1.50, G_N)
    clip("N", "sil_c", 6.00, 3.10, G_N)

    # ---- K : half-second flashes, slowed 2x, letterboxed
    clip("K", "earth", 10.60, 0.67, G_K, slow=2.0, letterbox=True)
    clip("K", "sun",   13.87, 0.53, G_K, slow=2.0, letterbox=True)

    # ---- exhibit backdrops
    void("D", 12.0, "void_a", G_D)
    void("N", 4.0,  "void_b", G_N)
    void("K", 9.6,  "void_c", G_K)

    for f in sorted(PUB.iterdir()):
        if f.suffix in (".mp4", ".jpg"):
            print(f"  {f.name:20s} {f.stat().st_size // 1024:6d} KB")


if __name__ == "__main__":
    main()
