import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_SIGNAL, H, W, rnd} from './theme';

/**
 * Drawn visual elements — the film's only additions to the artwork besides
 * the spoken subtitles. Every one of these is geometry and light: traces,
 * rings, nodes, brackets, a contracting bar. None of them carry a word.
 *
 * The vocabulary is taken from the brand artwork itself, which already runs
 * a thin orange signal line from Vira through the 2027 frame to the coin.
 */

const orange = (a: number) => `rgba(255, 83, 31, ${a})`;
const paper = (a: number) => `rgba(232, 227, 219, ${a})`;

const useLife = (dur: number, inF = 12, outF = 10) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, inF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const exit = interpolate(f, [dur - outF, dur], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return {f, p: Math.min(enter, exit), enter};
};

/* ------------------------------------------------------------ crop marks */

/**
 * Registration ticks just inside the safe area. Pure furniture — it makes the
 * frame feel composed and catalogued without saying anything.
 */
export const CropMarks: React.FC<{opacity?: number}> = ({opacity = 1}) => {
  const f = useCurrentFrame();
  const live = 0.5 + 0.5 * Math.sin(f / 26);
  const m = 44, len = 34;
  const corners: Array<[number, number, number, number]> = [
    [m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1],
  ];
  return (
    <AbsoluteFill style={{opacity: opacity * 0.85, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {corners.map(([x, y, sx, sy], i) => (
          <g key={i} stroke={paper(0.36)} strokeWidth={2}>
            <line x1={x} y1={y} x2={x + sx * len} y2={y} />
            <line x1={x} y1={y} x2={x} y2={y + sy * len} />
          </g>
        ))}
        <circle cx={m} cy={m} r={3.5} fill={orange(0.35 + live * 0.4)} />
      </svg>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- node field */

/** A drifting constellation. Reads as background chatter, not as data. */
export const NodeField: React.FC<{dur: number; count?: number}> = ({
  dur, count = 26,
}) => {
  const {f, p} = useLife(dur, 20, 14);
  const nodes = Array.from({length: count}).map((_, i) => {
    const bx = rnd(i * 7 + 1) * W;
    const by = 200 + rnd(i * 13 + 5) * (H - 620);
    const sp = 0.25 + rnd(i * 3 + 2) * 0.5;
    return {
      x: bx + Math.sin(f / (70 / sp) + i) * 16,
      y: by + Math.cos(f / (86 / sp) + i * 1.7) * 12,
      hot: rnd(i * 29 + 11) > 0.82,
      i,
    };
  });

  const links: Array<[number, number]> = [];
  for (let a = 0; a < nodes.length; a++) {
    for (let b = a + 1; b < nodes.length; b++) {
      const d = Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y);
      if (d < 240) links.push([a, b]);
    }
  }

  return (
    <AbsoluteFill style={{opacity: p * 0.8, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {links.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
            stroke={paper(0.11)} strokeWidth={1.2}
          />
        ))}
        {nodes.map((n) => (
          <circle
            key={n.i} cx={n.x} cy={n.y} r={n.hot ? 3.2 : 2}
            fill={n.hot ? orange(0.75) : paper(0.3)}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------- signal traces */

/**
 * Curved traces drawn in from the frame edges, all landing on one point.
 * This is the film's argument in a graphic: separate conversations, one date.
 */
export const SignalTraces: React.FC<{
  dur: number; tx?: number; ty?: number; count?: number; draw?: number;
}> = ({dur, tx = W / 2, ty = 700, count = 5, draw = 34}) => {
  const {f, p} = useLife(dur, 10, 12);

  const traces = Array.from({length: count}).map((_, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const sx = side < 0 ? -140 : W + 140;
    const sy = 220 + rnd(i * 17 + 3) * (H - 700);
    const c1x = sx + side * -260;
    const c1y = sy + (rnd(i * 5 + 9) - 0.5) * 320;
    const c2x = tx + side * (220 + rnd(i * 11 + 2) * 180);
    const c2y = ty + (rnd(i * 23 + 7) - 0.5) * 300;
    const delay = i * 5;
    const prog = interpolate(f, [delay, delay + draw], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.bezier(...EASE_SIGNAL),
    });
    return {d: `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`, prog, i};
  });

  const land = interpolate(f, [draw, draw + 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <defs>
          <filter id="tglow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        {traces.map((t) => (
          <path
            key={t.i}
            d={t.d}
            fill="none"
            stroke={orange(0.66)}
            strokeWidth={2.4}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - t.prog}
            filter="url(#tglow)"
          />
        ))}
        <circle cx={tx} cy={ty} r={5 + land * 4} fill={orange(0.9 * land)} filter="url(#tglow)" />
        <circle
          cx={tx} cy={ty} r={26 + land * 60}
          fill="none" stroke={orange(0.5 * (1 - land * 0.5))} strokeWidth={2}
        />
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- pulse rings */

/** Concentric rings breathing out of a point. A heartbeat, not a countdown. */
export const PulseRings: React.FC<{
  dur: number; cx?: number; cy?: number; period?: number; max?: number;
}> = ({dur, cx = W / 2, cy = 700, period = 52, max = 430}) => {
  const {f, p} = useLife(dur, 14, 12);
  const rings = [0, 1, 2].map((k) => {
    const t = ((f + k * (period / 3)) % period) / period;
    return {r: 40 + t * max, o: (1 - t) * 0.55, k};
  });
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {rings.map((r) => (
          <circle
            key={r.k} cx={cx} cy={cy} r={r.r}
            fill="none" stroke={orange(r.o)} strokeWidth={2}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- supply bar */

/**
 * A bar that contracts in discrete steps. Paired with the plate that already
 * says the supply only shrinks, it needs no label of its own.
 */
export const SupplyBar: React.FC<{dur: number; y?: number}> = ({dur, y = 372}) => {
  const {f, p, enter} = useLife(dur, 12, 10);
  const x0 = 70, width = 940;
  const steps = [1, 0.88, 0.74, 0.63, 0.55, 0.5];
  const idx = Math.min(steps.length - 1, Math.floor(interpolate(
    f, [16, dur - 12], [0, steps.length - 1],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})));
  const settle = interpolate(f % 12, [0, 5], [1, 0], {
    extrapolateRight: 'clamp',
  });
  const frac = steps[idx];

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <line x1={x0} y1={y} x2={x0 + width} y2={y} stroke={paper(0.22)} strokeWidth={2} />
        <rect
          x={x0} y={y - 9} width={width * frac * enter} height={18}
          fill={orange(0.72)}
        />
        <rect
          x={x0 + width * frac * enter - 2} y={y - 16} width={3} height={32}
          fill={orange(0.85 + settle * 0.15)}
        />
        {steps.map((s, i) => (
          <line
            key={i}
            x1={x0 + width * s} y1={y + 18} x2={x0 + width * s} y2={y + 30}
            stroke={i <= idx ? orange(0.75) : paper(0.18)} strokeWidth={2}
          />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- brackets */

/** Framing brackets that close around the plate on screen. */
export const Brackets: React.FC<{
  dur: number; top?: number; bottom?: number; inset?: number;
}> = ({dur, top = 300, bottom = 1360, inset = 44}) => {
  const {p, enter} = useLife(dur, 12, 10);
  const len = 46 * enter;
  const L = inset, R = W - inset;
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <g stroke={orange(0.85)} strokeWidth={3} fill="none">
          <path d={`M ${L} ${top + len} L ${L} ${top} L ${L + len} ${top}`} />
          <path d={`M ${R} ${top + len} L ${R} ${top} L ${R - len} ${top}`} />
          <path d={`M ${L} ${bottom - len} L ${L} ${bottom} L ${L + len} ${bottom}`} />
          <path d={`M ${R} ${bottom - len} L ${R} ${bottom} L ${R - len} ${bottom}`} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ scan sweep */

/** One bright bar crossing the frame. Used as punctuation on a hard cut. */
export const ScanSweep: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [-0.2, 1.2], {extrapolateRight: 'clamp'});
  const fade = interpolate(f, [0, 6, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  return (
    <AbsoluteFill style={{opacity: fade * 0.5, pointerEvents: 'none'}}>
      <div style={{
        position: 'absolute', left: 0, top: t * H, width: W, height: 220,
        background:
          'linear-gradient(to bottom, rgba(255,83,31,0) 0%, rgba(255,83,31,0.09) 48%, rgba(232,227,219,0.06) 52%, rgba(255,83,31,0) 100%)',
      }} />
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- playback line */

/** The playback bar. Sits below the captions, clear of platform chrome. */
export const PlaybackBar: React.FC<{total: number}> = ({total}) => {
  const f = useCurrentFrame();
  const p = Math.min(1, f / Math.max(1, total));
  const x0 = 70, width = 940, y = 1548;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <line x1={x0} y1={y} x2={x0 + width} y2={y} stroke={paper(0.2)} strokeWidth={4} />
        <line x1={x0} y1={y} x2={x0 + width * p} y2={y} stroke={orange(1)} strokeWidth={4} />
        <circle cx={x0 + width * p} cy={y} r={6} fill={orange(1)} />
      </svg>
    </AbsoluteFill>
  );
};
