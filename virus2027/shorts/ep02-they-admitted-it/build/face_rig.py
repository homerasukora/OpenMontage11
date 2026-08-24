#!/usr/bin/env python3
"""
Talking-head rig for a single still photograph.

No lip-sync model is reachable from this environment (every hosted service is
behind an API key and the local checkpoints live on blocked hosts), so the
presenter is animated as a 2D puppet instead:

  * MediaPipe FaceMesh gives 478 landmarks on the still.
  * Those landmarks plus a fixed border ring are Delaunay-triangulated.
  * Poses (jaw open, lip part, blink, brow raise, head turn) are expressed as
    landmark displacements in the face's own local axes, so a tilted head
    still opens its jaw straight down its own face.
  * Each frame warps the triangles by the summed pose deltas, and a soft dark
    oral cavity is composited inside the inner-lip contour so an open mouth
    reads as an opening rather than as stretched teeth.

Jaw motion is driven by a speech-band amplitude envelope of the voiceover.
That is not phoneme-accurate, but at 30 fps behind burned-in captions it
reads as speech, which is what the shot needs.
"""

import argparse
import json
import subprocess
import wave
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent

# --- MediaPipe FaceMesh canonical index groups ---------------------------
LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
              409, 270, 269, 267, 0, 37, 39, 40, 185]
LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308,
              415, 310, 311, 312, 13, 82, 81, 80, 191]
LOWER_INNER = [95, 88, 178, 87, 14, 317, 402, 318, 324]
LOWER_OUTER = [146, 91, 181, 84, 17, 314, 405, 321, 375]
CHIN = [152, 148, 176, 149, 150, 136, 377, 400, 378, 379, 365, 397, 172, 58, 288]
EYE_L_UPPER = [246, 161, 160, 159, 158, 157, 173]
EYE_L_LOWER = [33, 7, 163, 144, 145, 153, 154, 155, 133]
EYE_R_UPPER = [466, 388, 387, 386, 385, 384, 398]
EYE_R_LOWER = [263, 249, 390, 373, 374, 380, 381, 382, 362]
BROW_L = [70, 63, 105, 66, 107]
BROW_R = [300, 293, 334, 296, 336]
HINGE = [234, 454]          # ear-level jaw hinge
TOP = 10                    # forehead
BOTTOM = 152                # chin


def detect_landmarks(bgr):
    import mediapipe as mp
    h, w = bgr.shape[:2]
    with mp.solutions.face_mesh.FaceMesh(
        static_image_mode=True, max_num_faces=1,
        refine_landmarks=True, min_detection_confidence=0.5
    ) as fm:
        res = fm.process(cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB))
    if not res.multi_face_landmarks:
        raise RuntimeError("no face found")
    return np.array([[p.x * w, p.y * h]
                     for p in res.multi_face_landmarks[0].landmark], np.float32)


class Rig:
    def __init__(self, image_path):
        self.bgr = cv2.imread(str(image_path))
        if self.bgr is None:
            raise FileNotFoundError(image_path)
        self.h, self.w = self.bgr.shape[:2]
        self.pts = detect_landmarks(self.bgr)

        # face-local axes: "up" runs chin -> forehead
        up = self.pts[TOP] - self.pts[BOTTOM]
        self.up = up / np.linalg.norm(up)
        self.right = np.array([-self.up[1], self.up[0]], np.float32)
        self.face_h = float(np.linalg.norm(up))

        # how far down the face each landmark sits, 0 at the jaw hinge, 1 at chin
        origin = self.pts[HINGE].mean(axis=0)
        depth = (self.pts - origin) @ (-self.up)
        chin_depth = float((self.pts[BOTTOM] - origin) @ (-self.up))
        self.jaw_w = np.clip(depth / max(chin_depth, 1e-3), 0, 1) ** 1.25

        self._build_mesh()

    # -- mesh ------------------------------------------------------------
    def _build_mesh(self):
        pad = 0.42
        x0, y0 = self.pts.min(axis=0)
        x1, y1 = self.pts.max(axis=0)
        bw, bh = x1 - x0, y1 - y0
        self.roi = (
            max(0, int(x0 - bw * pad)), max(0, int(y0 - bh * pad)),
            min(self.w, int(x1 + bw * pad)), min(self.h, int(y1 + bh * pad)),
        )
        rx0, ry0, rx1, ry1 = self.roi

        border = []
        for t in np.linspace(0, 1, 9):
            border += [[rx0 + t * (rx1 - rx0), ry0], [rx0 + t * (rx1 - rx0), ry1 - 1],
                       [rx0, ry0 + t * (ry1 - ry0)], [rx1 - 1, ry0 + t * (ry1 - ry0)]]
        self.border = np.array(border, np.float32)
        self.src = np.vstack([self.pts, self.border])

        # Subdiv2D needs slack around the point cloud, and it returns vertex
        # coordinates that differ from the inserted ones by a hair — so match
        # triangle corners back to landmarks by nearest neighbour, not equality.
        pad_rect = 8
        sub = cv2.Subdiv2D((rx0 - pad_rect, ry0 - pad_rect,
                            (rx1 - rx0) + pad_rect * 2, (ry1 - ry0) + pad_rect * 2))
        for p in self.src:
            sub.insert((float(p[0]), float(p[1])))

        tris = []
        for t in sub.getTriangleList():
            corners = t.reshape(3, 2)
            if (corners[:, 0] < rx0 - pad_rect).any() or (corners[:, 0] > rx1 + pad_rect).any():
                continue
            if (corners[:, 1] < ry0 - pad_rect).any() or (corners[:, 1] > ry1 + pad_rect).any():
                continue
            d = np.linalg.norm(self.src[None, :, :] - corners[:, None, :], axis=2)
            ids = d.argmin(axis=1)
            if d[np.arange(3), ids].max() > 1.5 or len(set(ids.tolist())) != 3:
                continue
            tris.append(ids.tolist())
        self.tris = np.array(tris, np.int32)

    # -- poses -----------------------------------------------------------
    def pose(self, jaw=0.0, part=0.0, blink=0.0, brow=0.0, turn=0.0, nod=0.0):
        """Return displaced landmark positions for a set of pose weights."""
        d = np.zeros_like(self.src)
        down = -self.up
        drop = self.face_h * 0.155 * jaw

        # jaw + everything hanging off it
        d[: len(self.pts)] += np.outer(self.jaw_w, down) * drop

        # lips separate a little faster than the chin so a gap actually opens
        for grp, k in ((LOWER_INNER, 0.55), (LOWER_OUTER, 0.30)):
            d[grp] += down * (drop * k)
        d[LIPS_INNER] += down * (self.face_h * 0.012 * part)

        # blink: upper lid travels to the lower lid
        for up_ids, low_ids in ((EYE_L_UPPER, EYE_L_LOWER), (EYE_R_UPPER, EYE_R_LOWER)):
            lid = self.pts[low_ids].mean(axis=0)
            for i in up_ids:
                d[i] += (lid - self.pts[i]) * 0.92 * blink

        d[BROW_L + BROW_R] += self.up * (self.face_h * 0.022 * brow)

        # micro head motion, strongest at the crown so the neck stays put
        if turn or nod:
            neck = self.pts[BOTTOM] + down * (self.face_h * 0.30)
            reach = np.linalg.norm(self.pts - neck, axis=1)
            wgt = np.clip(reach / max(reach.max(), 1e-3), 0, 1) ** 1.4
            d[: len(self.pts)] += np.outer(wgt, self.right) * (self.face_h * 0.030 * turn)
            d[: len(self.pts)] += np.outer(wgt, self.up) * (self.face_h * 0.018 * nod)

        return self.src + d

    # -- render ----------------------------------------------------------
    def render(self, dst, jaw=0.0):
        rx0, ry0, rx1, ry1 = self.roi
        src_roi = self.bgr[ry0:ry1, rx0:rx1]
        out = src_roi.copy()
        off = np.array([rx0, ry0], np.float32)
        S, D = self.src - off, dst - off

        for a, b, c in self.tris:
            s = S[[a, b, c]]
            t = D[[a, b, c]]
            r = cv2.boundingRect(t.astype(np.float32))
            if r[2] <= 0 or r[3] <= 0:
                continue
            sr = cv2.boundingRect(s.astype(np.float32))
            if sr[2] <= 0 or sr[3] <= 0:
                continue
            s_loc = s - np.array([sr[0], sr[1]], np.float32)
            t_loc = t - np.array([r[0], r[1]], np.float32)
            patch = src_roi[sr[1]:sr[1] + sr[3], sr[0]:sr[0] + sr[2]]
            if patch.size == 0:
                continue
            M = cv2.getAffineTransform(s_loc.astype(np.float32), t_loc.astype(np.float32))
            warped = cv2.warpAffine(patch, M, (r[2], r[3]),
                                    flags=cv2.INTER_LINEAR,
                                    borderMode=cv2.BORDER_REFLECT_101)
            mask = np.zeros((r[3], r[2]), np.uint8)
            cv2.fillConvexPoly(mask, np.int32(t_loc), 255, cv2.LINE_AA)
            roi = out[r[1]:r[1] + r[3], r[0]:r[0] + r[2]]
            if roi.shape[:2] != mask.shape:
                continue
            m3 = (mask.astype(np.float32) / 255.0)[..., None]
            out[r[1]:r[1] + r[3], r[0]:r[0] + r[2]] = (
                roi * (1 - m3) + warped * m3).astype(np.uint8)

        if jaw > 0.06:
            out = self._oral_cavity(out, D, jaw)

        full = self.bgr.copy()
        full[ry0:ry1, rx0:rx1] = out
        return full

    def _oral_cavity(self, roi_img, D, jaw):
        """Darken inside the inner lip so an open mouth reads as an opening."""
        poly = np.int32(D[LIPS_INNER])
        m = np.zeros(roi_img.shape[:2], np.uint8)
        cv2.fillPoly(m, [poly], 255, cv2.LINE_AA)
        m = cv2.erode(m, np.ones((5, 5), np.uint8), iterations=1)
        m = cv2.GaussianBlur(m, (0, 0), 5.0)

        # keep the top of the mouth (upper teeth) bright, shade the throat
        ys, xs = np.nonzero(m)
        if len(ys) == 0:
            return roi_img
        top, bot = ys.min(), ys.max()
        grad = np.zeros_like(m, np.float32)
        if bot > top:
            ramp = np.clip((np.arange(roi_img.shape[0]) - top) / (bot - top), 0, 1)
            grad = np.repeat(ramp[:, None], roi_img.shape[1], axis=1).astype(np.float32)
        alpha = (m.astype(np.float32) / 255.0) * grad * float(np.clip(jaw, 0, 1)) * 0.78
        dark = np.array([14, 10, 12], np.float32)
        return (roi_img * (1 - alpha[..., None])
                + dark * alpha[..., None]).astype(np.uint8)


# ---------------------------------------------------------------- drivers

def speech_envelope(wav_path, fps, n_frames):
    """Speech-band RMS per video frame, with fast attack and slower release."""
    with wave.open(str(wav_path), "rb") as w:
        sr, n = w.getframerate(), w.getnframes()
        raw = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32)
        if w.getnchannels() == 2:
            raw = raw.reshape(-1, 2).mean(axis=1)
    raw /= 32768.0

    # crude 300 Hz-3 kHz band pass: difference of two moving averages
    def ma(x, k):
        k = max(1, int(k))
        c = np.cumsum(np.insert(x, 0, 0))
        return (c[k:] - c[:-k]) / k
    lo = np.pad(ma(raw, sr / 3000), (0, len(raw) - len(ma(raw, sr / 3000))), "edge")
    hi = np.pad(ma(raw, sr / 300), (0, len(raw) - len(ma(raw, sr / 300))), "edge")
    band = lo - hi

    step = sr / fps
    env = np.zeros(n_frames, np.float32)
    for i in range(n_frames):
        a, b = int(i * step), int((i + 1) * step)
        seg = band[a:b]
        env[i] = float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0

    p95 = np.percentile(env, 95) or 1.0
    env = np.clip(env / p95, 0, 1.35)

    out = np.zeros_like(env)
    lvl = 0.0
    for i, v in enumerate(env):
        lvl = max(v, lvl * 0.62) if v > lvl else lvl * 0.62 + v * 0.38
        out[i] = lvl
    return np.clip(out, 0, 1)


def blink_track(n_frames, fps, seed=2027):
    """Blinks every 2.4-4.6 s, 5 frames each, plus a double blink now and then."""
    rng = np.random.default_rng(seed)
    track = np.zeros(n_frames, np.float32)
    shape = np.array([0.35, 0.85, 1.0, 0.7, 0.25], np.float32)
    t = int(fps * 1.1)
    while t < n_frames - len(shape):
        for k, v in enumerate(shape):
            track[t + k] = max(track[t + k], v)
        if rng.random() < 0.22:
            t2 = t + len(shape) + int(fps * 0.16)
            if t2 < n_frames - len(shape):
                for k, v in enumerate(shape):
                    track[t2 + k] = max(track[t2 + k], v * 0.8)
        t += int(fps * rng.uniform(2.4, 4.6))
    return track


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--image", required=True)
    ap.add_argument("--audio")
    ap.add_argument("--out", required=True)
    ap.add_argument("--fps", type=int, default=30)
    ap.add_argument("--seconds", type=float)
    ap.add_argument("--test", action="store_true",
                    help="render a pose contact sheet instead of a clip")
    a = ap.parse_args()

    rig = Rig(a.image)
    print(f"landmarks {len(rig.pts)}  triangles {len(rig.tris)}  roi {rig.roi}")

    if a.test:
        cols = []
        for jaw, blink, brow, turn in [(0, 0, 0, 0), (0.35, 0, 0.2, .3),
                                       (0.7, 0, 0.4, -.3), (1.0, 0, .5, 0),
                                       (0, 1.0, 0, 0)]:
            f = rig.render(rig.pose(jaw=jaw, part=jaw, blink=blink,
                                    brow=brow, turn=turn), jaw=jaw)
            cols.append(cv2.resize(f, (330, int(330 * rig.h / rig.w))))
        cv2.imwrite(a.out, np.hstack(cols))
        print("wrote pose sheet", a.out)
        return

    dur = a.seconds or 4.0
    n = int(dur * a.fps)
    env = (speech_envelope(a.audio, a.fps, n) if a.audio
           else np.abs(np.sin(np.arange(n) / 3.0)))
    blinks = blink_track(n, a.fps)

    tmp = Path(a.out).with_suffix(".raw")
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "bgr24",
         "-s", f"{rig.w}x{rig.h}", "-r", str(a.fps), "-i", "-",
         "-an", "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p", a.out],
        stdin=subprocess.PIPE)

    for i in range(n):
        t = i / a.fps
        jaw = float(env[i]) ** 0.82
        # idle life: slow sway, a faster breath, and brows that lift on peaks
        turn = 0.55 * np.sin(t * 0.62) + 0.22 * np.sin(t * 1.7 + 1.1)
        nod = 0.42 * np.sin(t * 0.83 + 0.4) + 0.18 * np.sin(t * 2.3)
        brow = 0.28 * np.sin(t * 0.5) + 0.55 * max(0.0, jaw - 0.55)
        frame = rig.render(
            rig.pose(jaw=jaw, part=jaw, blink=float(blinks[i]),
                     brow=brow, turn=turn, nod=nod), jaw=jaw)
        proc.stdin.write(frame.tobytes())
        if i % 60 == 0:
            print(f"  frame {i}/{n}", flush=True)

    proc.stdin.close()
    proc.wait()
    if tmp.exists():
        tmp.unlink()
    print("wrote", a.out)


if __name__ == "__main__":
    main()
