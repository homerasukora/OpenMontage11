/**
 * The single timeline the whole sting is built on.
 *
 * One polyline lives in a wide world space; the camera slides along it and the
 * stroke is revealed by dash offset, so there is literally one line from the
 * first frame to the last — never a new line per section. Nodes are indices
 * into the same point list, which is what keeps the copy, the camera and the
 * sound cues agreeing with each other: everything is addressed as "node 3",
 * not as a frame number or an x coordinate.
 *
 * The path deliberately undulates by a few dozen pixels. A dead-straight line
 * would read as a chart axis, and the brief rules that out.
 */

import {H} from './theme';

export type Pt = {x: number; y: number};

/**
 * Where the line sits in the frame, and how far each point strays from it.
 *
 * The path is stored as offsets from one baseline rather than as absolute y
 * values, so retargeting the film to another aspect is a single number. In
 * 9:16 the line rides at 60% of frame height and the empty lower third is
 * part of the look; a square frame has no third to spare, so it sits at 72%
 * and the copy stack tightens above it.
 */
export const BASE_Y = H >= 1600 ? 1150 : Math.round(H * 0.724);

const OFF = [0, 0, -18, 12, -42, 0, -30, 42, -4, 26, -32, 2, -10, 0];

const XS = [120, 760, 1180, 1620, 2100, 2560, 3000, 3440, 3900, 4340, 4780,
            5240, 5640, 6000];
//                1 · signal origin        4 · on-chain trace
//                7 · prediction layer    10 · convergence   13 · 2027

export const PATH: Pt[] = [
  ...XS.map((x, i) => ({x, y: BASE_Y + OFF[i]})),
  {x: 6000, y: BASE_Y - (H + 460)},  // 14 · out of frame, straight up
];

/** Indices in PATH that carry a node marker and a section of copy. */
export const NODES = [1, 4, 7, 10, 13] as const;

const seg = (a: Pt, b: Pt) => Math.hypot(b.x - a.x, b.y - a.y);

/** Cumulative length at each point, and the total. */
export const CUM: number[] = PATH.reduce<number[]>((acc, p, i) => {
  acc.push(i === 0 ? 0 : acc[i - 1] + seg(PATH[i - 1], p));
  return acc;
}, []);

export const TOTAL_LEN = CUM[CUM.length - 1];

/** Normalised progress (0..1) at a given point index. */
export const progressAt = (index: number) => CUM[index] / TOTAL_LEN;

/** The point sitting at normalised progress p along the whole polyline. */
export const pointAt = (p: number): Pt => {
  const target = Math.max(0, Math.min(1, p)) * TOTAL_LEN;
  for (let i = 1; i < PATH.length; i++) {
    if (CUM[i] >= target) {
      const t = (target - CUM[i - 1]) / Math.max(1e-6, CUM[i] - CUM[i - 1]);
      return {
        x: PATH[i - 1].x + (PATH[i].x - PATH[i - 1].x) * t,
        y: PATH[i - 1].y + (PATH[i].y - PATH[i - 1].y) * t,
      };
    }
  }
  return PATH[PATH.length - 1];
};

export const POLY = PATH.map((p) => `${p.x},${p.y}`).join(' ');

/**
 * Where the camera parks the head of the line. Horizontal only: when the line
 * turns vertical at the last node the camera holds, which is what lets the
 * stroke shoot out of the top of the frame instead of the frame chasing it.
 */
export const HEAD_X = 620;
export const CAMERA_MAX = PATH[13].x - HEAD_X;

export const cameraX = (p: number) =>
  Math.min(CAMERA_MAX, pointAt(p).x - HEAD_X);

/**
 * Measure ticks along the path — short perpendicular marks every `STEP` world
 * pixels, taller on every fifth. They carry no numbers: the only type in this
 * film is the copy the brief specifies. Their job is to make the stroke read
 * as a measured timeline rather than a drawn squiggle, and to give the lower
 * third something to hold while the copy sits high.
 */
const STEP = 96;

export const TICKS = (() => {
  const out: Array<{x: number; y: number; h: number; major: boolean; i: number}> = [];
  const horizontalEnd = CUM[13];
  let i = 0;
  for (let d = 0; d <= horizontalEnd; d += STEP, i++) {
    const pt = pointAt(d / TOTAL_LEN);
    const major = i % 5 === 0;
    out.push({x: pt.x, y: pt.y, h: major ? 15 : 7, major, i});
  }
  return out;
})();
