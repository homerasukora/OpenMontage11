import React from 'react';
import {
  AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {C, EASE_SIGNAL, H, W, fitSize, rnd} from './theme';

/**
 * Drawn visual elements — the film's only additions to the artwork besides
 * the spoken subtitles. Every one of these is geometry and light:
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

/* ------------------------------------------------------------- pulse rings */

/** Concentric rings breathing out of a point. A heartbeat, not a countdown. */
export const PulseRings: React.FC<{
  dur: number; cx?: number; cy?: number; period?: number; max?: number;
  inward?: boolean;
}> = ({dur, cx = W / 2, cy = 700, period = 52, max = 430, inward = false}) => {
  const {f, p} = useLife(dur, 14, 12);
  const rings = [0, 1, 2].map((k) => {
    const t = ((f + k * (period / 3)) % period) / period;
    // inward rings contract onto the point instead of leaving it — the
    // picture of something being waited for rather than sent
    const tt = inward ? 1 - t : t;
    return {r: 40 + tt * max, o: (1 - t) * 0.55, k};
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

/* ----------------------------------------------------------- brand marks */

/**
 * Vira, dropped in for a beat. He is not narrating and not reacting to the
 * footage — he stands at the edge of the frame the way he does in the
 * gallery, so a found-footage cut still reads as ours.
 *
 * From ep08 the source is a properly matted transparent PNG, so `card` is
 * dead weight: the panel only ever existed to hide the fact that a luma key
 * could not separate his dark legs and the shaded side of his shell from a
 * bright plate. With real alpha he sits on the picture with a drop shadow
 * and nothing else. The prop is kept for older beat sheets and should not
 * be used in new ones.
 */
export const MascotBeat: React.FC<{
  dur: number; x?: number; y?: number; width?: number; flip?: boolean;
  card?: boolean;
}> = ({dur, x = 96, y = 980, width = 300, flip, card}) => {
  const {f, p} = useLife(dur, 12, 10);
  const bob = Math.sin(f / 15) * 6;
  const pad = width * 0.16;
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      {/*
        Over the brand ground he needs nothing. Over bright footage he needs
        a card: this character is modelled against near-black, and however
        good the matte is, his shoes and the shaded side of his shell are
        genuinely dark and read as smudges against a blue sky. Giving him a
        panel is honest about that, and it matches the document language the
        rest of the series uses anyway.
      */}
      {card ? (
        // deprecated — see the note above
        <div style={{
          position: 'absolute',
          left: x - pad, top: y - pad * 0.7 + bob,
          width: width + pad * 2, height: width * 1.17 + pad * 1.5,
          borderRadius: 22,
          background: 'rgba(9,8,6,0.78)',
          border: `1px solid ${C.lineStrong}`,
          boxShadow: '0 22px 60px rgba(0,0,0,0.5)',
        }} />
      ) : null}
      <div style={{
        position: 'absolute', left: x, top: y + bob, width,
        transform: flip ? 'scaleX(-1)' : undefined,
        filter: card ? undefined : 'drop-shadow(0 18px 44px rgba(0,0,0,0.55))',
      }}>
        <Img src={staticFile('mascot-plate.png')} style={{width: '100%', display: 'block'}} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------- information */

/**
 * Where we are.
 *
 * This episode crosses three countries in forty seconds, and the footage
 * alone does not say which is which — a shelter door could be anywhere.
 * The tag answers that in four words and then gets out of the way.
 */
export const LocationTag: React.FC<{dur: number; text: string; y?: number}> = ({
  dur, text, y = 150,
}) => {
  const {f, p} = useLife(dur, 12, 10);
  const slide = interpolate(f, [0, 16], [-18, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const rule = interpolate(f, [6, 26], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <div style={{
      position: 'absolute', left: 62, top: y, opacity: p,
      transform: `translateX(${slide}px)`, pointerEvents: 'none',
    }}>
      <div style={{display: 'flex', alignItems: 'center', gap: 16}}>
        <div style={{width: 3, height: 26, background: C.signal}} />
        <span style={{
          fontFamily: '"IBM Plex Mono", monospace', fontSize: 23, fontWeight: 500,
          letterSpacing: '0.26em', color: C.text, textTransform: 'uppercase',
          textShadow: '0 2px 18px rgba(0,0,0,0.8)',
        }}>{text}</span>
      </div>
      <div style={{
        marginTop: 12, height: 1, width: 320 * rule,
        background: 'rgba(232,227,219,0.34)',
      }} />
    </div>
  );
};

const group = (n: number) => n.toLocaleString('en-US');

/**
 * A number, counted up.
 *
 * The Finnish figures are the whole argument of the middle section and they
 * go past too fast to land as speech alone — fifty thousand and four and a
 * half million are just noises in a sentence. On screen, counting, they are
 * the thing the viewer remembers. The count is eased rather than linear so
 * it settles instead of stopping dead.
 */
export const Figure: React.FC<{
  dur: number; value: number; label: string;
  prefix?: string; suffix?: string; y?: number; plain?: boolean;
}> = ({dur, value, label, prefix = '', suffix = '', y = 248, plain = false}) => {
  const {f, p} = useLife(dur, 10, 10);
  const run = interpolate(f, [2, 24], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });
  const rule = interpolate(f, [16, 34], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0, top: y,
      textAlign: 'center', opacity: p, pointerEvents: 'none',
    }}>
      <div style={{
        fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif',
        fontWeight: 700, fontSize: 152, lineHeight: 1, color: C.text,
        letterSpacing: '-0.01em',
        textShadow: '0 3px 30px rgba(0,0,0,0.78)',
      }}>
        {prefix}{plain ? String(Math.round(value * run)) : group(Math.round(value * run))}{suffix}
      </div>
      <div style={{
        margin: '18px auto 0', height: 3, width: 240 * rule,
        background: C.signal, boxShadow: `0 0 22px ${C.signal}`,
      }} />
      <div style={{
        marginTop: 18,
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 22, fontWeight: 400,
        letterSpacing: '0.24em', color: C.textSoft, textTransform: 'uppercase',
        textShadow: '0 2px 16px rgba(0,0,0,0.8)',
      }}>{label}</div>
    </div>
  );
};

/**
 * A small flag, top right.
 *
 * The script names three countries inside single sentences — Hawaii, New
 * Zealand, Finland go past in under half a second each and the footage
 * cannot say which is which. A flag is the fastest possible caption: it is
 * read before it is looked at.
 *
 * They share one slot rather than accumulating along the top edge. Two
 * chips side by side start to look like a scoreboard, and the point is a
 * quiet label, not a tally.
 */
export const Flag: React.FC<{
  dur: number; src: string; x?: number; y?: number; width?: number;
}> = ({dur, src, x = 918, y = 146, width = 100}) => {
  const {f, p} = useLife(dur, 9, 8);
  const pop = interpolate(f, [0, 12], [0.9, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width,
      opacity: p, transform: `scale(${pop})`, transformOrigin: 'top right',
      pointerEvents: 'none',
    }}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%', display: 'block', borderRadius: 3,
          border: `1px solid ${C.lineStrong}`,
          boxShadow: '0 8px 28px rgba(0,0,0,0.55)',
        }}
      />
    </div>
  );
};

/* ==========================================================================
 * ep08 — the drawn exhibits.
 *
 * This episode has a problem the others did not: its evidence is not
 * photographable. There is no stock shot of "the pulsar map on the Voyager
 * record", and the two things the script actually accuses us of sending —
 * a star chart and a diagram of a human body — exist as line drawings or
 * not at all. So they are drawn here, in the frame, in the brand's own
 * geometry. Each one draws itself on screen while the line is spoken, which
 * is also the honest thing to do: the viewer watches the exhibit being
 * constructed rather than being shown a photograph of something that has
 * no photograph.
 * ======================================================================= */

/**
 * The pulsar map.
 *
 * The real cover of the Voyager record is etched with fourteen rays leaving
 * a single point. Each ray points at a pulsar, and the binary ticks along it
 * give that pulsar's period, written against the hydrogen hyperfine
 * transition so the units decode without knowing anything about us. Together
 * the fourteen fix the Sun's position; a fifteenth, longer, points at the
 * centre of the galaxy.
 *
 * That is reproduced here rather than invented: fourteen rays plus the long
 * one, ticks along each, counting on one at a time. The angles and periods
 * are not the true catalogue values — this is a drawing of the diagram, not
 * a working copy of it — but the structure and the count are right, which is
 * what the line claims.
 */
export const PulsarMap: React.FC<{
  dur: number; cx?: number; cy?: number;
}> = ({dur, cx = W / 2, cy = 772}) => {
  const {f, p} = useLife(dur, 14, 12);
  const N = 14;

  const rays = Array.from({length: N}).map((_, i) => {
    // Spread over the full circle with enough jitter that it reads as a
    // measured sky rather than a spoked wheel.
    const ang = (i / N) * Math.PI * 2 + (rnd(i * 7 + 3) - 0.5) * 0.62;
    const len = 206 + rnd(i * 11 + 5) * 182;
    // Binary ticks: long and short marks in an irregular run, which is what
    // a period written in base two actually looks like along the line.
    const dash = Array.from({length: 9})
      .map((__, k) => (rnd(i * 31 + k * 3) > 0.5 ? '7 9' : '2 9'))
      .join(' ');
    return {ang, len, dash, i};
  });

  // One ray every two frames, so all fourteen are down inside a second.
  // The first lands almost immediately: the line says "on the cover is a
  // map" and the frame cannot be empty while the word "cover" is spoken.
  const drawn = (i: number) =>
    interpolate(f, [2 + i * 2.1, 14 + i * 2.1], [0, 1], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
      easing: Easing.bezier(...EASE_SIGNAL),
    });

  const count = Math.min(N, Math.max(0, Math.floor((f - 2) / 2.1) + 1));
  const galactic = interpolate(f, [2 + N * 2.1, 22 + N * 2.1], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {rays.map((r) => {
          const g = drawn(r.i);
          const x2 = cx + Math.cos(r.ang) * r.len * g;
          const y2 = cy + Math.sin(r.ang) * r.len * g;
          return (
            <g key={r.i}>
              <line
                x1={cx} y1={cy} x2={x2} y2={y2}
                stroke={paper(0.82)} strokeWidth={2} strokeDasharray={r.dash}
              />
              <circle cx={x2} cy={y2} r={g > 0.98 ? 3 : 4}
                      fill={g > 0.98 ? paper(0.78) : orange(1)} />
            </g>
          );
        })}

        {/* the long ray: the galactic centre, the only one in signal orange */}
        <line
          x1={cx} y1={cy}
          x2={cx + 452 * galactic} y2={cy + 96 * galactic}
          stroke={orange(0.95)} strokeWidth={2.6} strokeDasharray="14 7 4 7"
        />

        <circle cx={cx} cy={cy} r={5.5} fill={orange(1)} />
        <circle cx={cx} cy={cy} r={16} fill="none" stroke={orange(0.45)}
                strokeWidth={1.4} />
      </svg>

      <div style={{
        position: 'absolute', left: 0, right: 0, top: cy + 452,
        textAlign: 'center',
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 21, fontWeight: 500,
        letterSpacing: '0.26em', color: C.text, textTransform: 'uppercase',
        textShadow: '0 2px 18px rgba(0,0,0,0.9)',
      }}>
        {String(count).padStart(2, '0')} / {N} pulsars
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: cy + 486,
        textAlign: 'center',
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 17, fontWeight: 400,
        letterSpacing: '0.2em', color: C.textSoft, textTransform: 'uppercase',
        textShadow: '0 2px 18px rgba(0,0,0,0.9)',
      }}>
        golden record cover · sun, located
      </div>
    </AbsoluteFill>
  );
};

/**
 * The double helix.
 *
 * Also on the record, also a line drawing, and the closest thing the disc
 * carries to the sentence being spoken over it. Two strands in antiphase
 * with rungs between them, drawing downward and turning slowly, so the
 * shape is legible as structure rather than as decoration.
 */
export const Helix: React.FC<{
  dur: number; cx?: number; top?: number; bottom?: number; amp?: number;
}> = ({dur, cx = W / 2, top = 452, bottom = 1178, amp = 148}) => {
  // Fast in. This lands on the same frame as a cut to a near-black plate,
  // so anything slower leaves the frame empty except for a subtitle — the
  // one dead second the first cut of this episode had.
  const {f, p} = useLife(dur, 6, 12);
  const grow = interpolate(f, [1, 21], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const spin = f / 22;
  const turns = 2.6;
  const steps = 132;
  const shown = Math.max(2, Math.floor(steps * grow));

  const pt = (k: number, side: number) => {
    const t = k / steps;
    const y = top + (bottom - top) * t;
    const a = t * turns * Math.PI * 2 + spin + (side ? Math.PI : 0);
    return {x: cx + Math.sin(a) * amp, y, depth: Math.cos(a)};
  };

  const path = (side: number) =>
    Array.from({length: shown})
      .map((_, k) => {
        const q = pt(k, side);
        return `${k ? 'L' : 'M'} ${q.x.toFixed(1)} ${q.y.toFixed(1)}`;
      })
      .join(' ');

  // Rungs only every ninth step, and only where the pair is near the plane
  // of the page — drawing them all turns the helix into a ladder.
  const rungs = Array.from({length: shown})
    .map((_, k) => k)
    .filter((k) => k % 9 === 0)
    .map((k) => ({a: pt(k, 0), b: pt(k, 1), k}));

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {rungs.map((r) => (
          <line
            key={r.k} x1={r.a.x} y1={r.a.y} x2={r.b.x} y2={r.b.y}
            stroke={r.k % 27 === 0 ? orange(0.9) : paper(0.34)}
            strokeWidth={r.k % 27 === 0 ? 2 : 1.3}
          />
        ))}
        <path d={path(0)} fill="none" stroke={paper(0.88)} strokeWidth={2.6} />
        <path d={path(1)} fill="none" stroke={paper(0.5)} strokeWidth={2.6} />
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: bottom + 42,
        textAlign: 'center',
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 18, fontWeight: 400,
        letterSpacing: '0.22em', color: C.textSoft, textTransform: 'uppercase',
        textShadow: '0 2px 18px rgba(0,0,0,0.9)',
      }}>
        dna structure · disc image set
      </div>
    </AbsoluteFill>
  );
};

/**
 * The lock.
 *
 * Forty seconds of the film are spent laying out what we transmitted. This
 * is the one beat that takes the theory's point of view, and it only gets
 * two and a bit seconds: four brackets close on the planet, a ring settles,
 * and it holds. No flashing, no alarm, no red — the whole argument is that
 * being found is quiet.
 */
export const Reticle: React.FC<{
  dur: number; cx?: number; cy?: number; size?: number; label?: string;
}> = ({dur, cx = W / 2, cy = 800, size = 190, label = 'held'}) => {
  const {f, p} = useLife(dur, 8, 10);
  const close = interpolate(f, [2, 24], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const locked = f >= 24;
  const s = size * (1 + close * 1.25);
  const arm = size * 0.42;
  const spin = f * 0.55;
  const tick = locked
    ? interpolate(f, [24, 30], [0, 1], {extrapolateRight: 'clamp'})
    : 0;

  const corner = (sx: number, sy: number) =>
    `M ${cx + sx * s} ${cy + sy * s - sy * arm} L ${cx + sx * s} ${cy + sy * s} ` +
    `L ${cx + sx * s - sx * arm} ${cy + sy * s}`;

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <g stroke={orange(0.9)} strokeWidth={3} fill="none"
           strokeLinecap="square">
          <path d={corner(-1, -1)} />
          <path d={corner(1, -1)} />
          <path d={corner(-1, 1)} />
          <path d={corner(1, 1)} />
        </g>

        <circle
          cx={cx} cy={cy} r={size * 0.72} fill="none"
          stroke={orange(0.34 + tick * 0.2)} strokeWidth={1.6}
          strokeDasharray="3 13"
          transform={`rotate(${spin} ${cx} ${cy})`}
        />

        {/* crosshair, broken at the centre so the planet stays readable */}
        <g stroke={paper(0.4 + tick * 0.2)} strokeWidth={1.6}>
          <line x1={cx - size * 0.72} y1={cy} x2={cx - size * 0.26} y2={cy} />
          <line x1={cx + size * 0.26} y1={cy} x2={cx + size * 0.72} y2={cy} />
          <line x1={cx} y1={cy - size * 0.72} x2={cx} y2={cy - size * 0.26} />
          <line x1={cx} y1={cy + size * 0.26} x2={cx} y2={cy + size * 0.72} />
        </g>
      </svg>

      <div style={{
        position: 'absolute', left: cx + size + 22, top: cy - 13,
        opacity: tick,
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 20, fontWeight: 500,
        letterSpacing: '0.3em', color: C.signal, textTransform: 'uppercase',
        textShadow: '0 2px 18px rgba(0,0,0,0.9)',
      }}>
        {label}
      </div>
    </AbsoluteFill>
  );
};

/**
 * The listening trace.
 *
 * A strip, not a heads-up display. It sits under the opening line and does
 * one thing: stays flat. The small kicks in it never become a signal, which
 * is the whole content of the sentence it plays under.
 */
export const Flatline: React.FC<{dur: number; y?: number}> = ({
  dur, y = 596,
}) => {
  const {f, p} = useLife(dur, 12, 12);
  const x0 = 90, width = 900;
  const draw = interpolate(f, [4, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const n = 150;
  const pts = Array.from({length: n}).map((_, i) => {
    const x = x0 + (width * i) / (n - 1);
    // Noise only — nothing here is ever allowed to look like a carrier.
    const jit = (rnd(i * 5 + Math.floor(f / 3) * 97) - 0.5) * 3.4;
    return `${i ? 'L' : 'M'} ${x.toFixed(1)} ${(y + jit).toFixed(1)}`;
  });
  const cut = Math.max(2, Math.floor(n * draw));
  const head = x0 + (width * (cut - 1)) / (n - 1);

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <line x1={x0} y1={y} x2={x0 + width} y2={y}
              stroke={paper(0.1)} strokeWidth={1} />
        <path d={pts.slice(0, cut).join(' ')} fill="none"
              stroke={paper(0.62)} strokeWidth={2} />
        <circle cx={head} cy={y} r={4} fill={orange(0.95)} />
      </svg>
      <div style={{
        position: 'absolute', left: x0, top: y - 46, display: 'flex',
        width, justifyContent: 'space-between',
        fontFamily: '"IBM Plex Mono", monospace', fontSize: 18, fontWeight: 500,
        letterSpacing: '0.26em', color: C.textMuted, textTransform: 'uppercase',
        textShadow: '0 2px 18px rgba(0,0,0,0.9)',
      }}>
        <span>listening</span>
        <span>no carrier</span>
      </div>
    </AbsoluteFill>
  );
};

/* ==========================================================================
 * ep09 — highlights that belong to a word.
 *
 * Everything below is anchored to the spoken word it illustrates (see
 * `word` on a beat). The idea is that a viewer hears "aliens" and sees one
 * drawn, hears "backwards" and watches a progress bar run in reverse, hears
 * "homesick" and watches a house being drawn under a star. None of them
 * carries a sentence of its own — the voice and the captions do the saying —
 * and each is built from the same strokes as the rest of the series:
 * hairlines, signal orange, mono labels, and nothing filled except where the
 * object is genuinely dark (an eye, a lit window).
 * ======================================================================= */

const ease = Easing.bezier(...EASE_SIGNAL);
const clampBoth = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const MONO = '"IBM Plex Mono", monospace';
const monoLabel = (size: number, color: string, spacing = '0.26em'): React.CSSProperties => ({
  fontFamily: MONO, fontSize: size, fontWeight: 500, letterSpacing: spacing,
  color, textTransform: 'uppercase', textShadow: '0 2px 18px rgba(0,0,0,0.92)',
});

/** Draw-on helper for a path normalised with pathLength={1}. */
const drawn = (p: number) => ({
  pathLength: 1 as const, strokeDasharray: 1, strokeDashoffset: 1 - p,
});

/** A dark scrim, so thin line work reads over bright footage. */
export const Scrim: React.FC<{dur: number; opacity?: number}> = ({dur, opacity = 0.5}) => {
  const {p} = useLife(dur, 10, 10);
  return (
    <AbsoluteFill style={{background: `rgba(5,4,3,${opacity * p})`, pointerEvents: 'none'}} />
  );
};

/* ---------------------------------------------------------------- alien */

/**
 * The grey. Everyone's first picture of an alien, drawn in outline: a wide
 * skull tapering to a small chin, two slanted almond eyes, the barest
 * nose and mouth. It draws itself, gets scanned once, and pulses.
 *
 * `strike` draws a slash through it. That is the sixth line's whole job —
 * "none of that makes us aliens" — and it is the only place in the series
 * a drawn element is allowed to be crossed out.
 */
export const AlienMark: React.FC<{
  dur: number; cx?: number; cy?: number; scale?: number; strike?: boolean;
}> = ({dur, cx = W / 2, cy = 760, scale = 1.25, strike = false}) => {
  const {f, p} = useLife(dur, 6, 12);
  const at = (a: number, b: number) =>
    interpolate(f, [a, b], [0, 1], {...clampBoth, easing: ease});
  const head = at(0, 16);
  const eyes = at(10, 24);
  const face = at(18, 30);
  const scan = interpolate(f, [3, 30], [0, 1], clampBoth);
  const slash = strike ? at(26, 40) : 0;
  const dim = strike ? interpolate(f, [28, 44], [1, 0.42], clampBoth) : 1;
  const pulse = (f % 40) / 40;

  const HEAD =
    'M200 20 C300 20 362 112 354 214 C348 306 284 384 234 468 ' +
    'C222 490 178 490 166 468 C116 384 52 306 46 214 C38 112 100 20 200 20 Z';
  const EYE_L = 'M86 214 C108 186 172 212 186 266 C150 280 100 262 86 214 Z';
  const EYE_R = 'M314 214 C292 186 228 212 214 266 C250 280 300 262 314 214 Z';

  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <defs>
          <clipPath id="alien-head"><path d={HEAD} /></clipPath>
        </defs>
        <g transform={`translate(${cx - 200 * scale} ${cy - 255 * scale}) scale(${scale})`}>
          <g opacity={dim}>
            {/* two rings leaving the head: this is a contact, not a portrait */}
            {[0, 0.5].map((o, i) => {
              const u = (pulse + o) % 1;
              return (
                <circle key={i} cx={200} cy={250} r={170 + u * 150} fill="none"
                        stroke={orange((1 - u) * 0.4 * head)} strokeWidth={2} />
              );
            })}

            <path d={HEAD} fill={orange(0.07 * head)} />
            <path d={HEAD} fill="none" stroke={paper(0.94)} strokeWidth={3.4}
                  strokeLinejoin="round" {...drawn(head)} />

            <g opacity={eyes}>
              <path d={EYE_L} fill="#0a0805" stroke={orange(0.95)} strokeWidth={3} />
              <path d={EYE_R} fill="#0a0805" stroke={orange(0.95)} strokeWidth={3} />
              <ellipse cx={146} cy={236} rx={11} ry={6} fill={paper(0.9)}
                       transform="rotate(14 146 236)" />
              <ellipse cx={254} cy={236} rx={11} ry={6} fill={paper(0.9)}
                       transform="rotate(-14 254 236)" />
            </g>

            <g opacity={face} stroke={paper(0.7)} strokeWidth={2.6} fill="none"
               strokeLinecap="round">
              <path d="M190 330 L190 340" />
              <path d="M210 330 L210 340" />
              <path d="M178 398 Q200 408 222 398" />
            </g>

            {/* one scan pass, clipped to the skull */}
            <g clipPath="url(#alien-head)">
              <line x1={30} x2={370} y1={20 + scan * 470} y2={20 + scan * 470}
                    stroke={orange(0.85 * (1 - scan * 0.4))} strokeWidth={4} />
              <rect x={30} y={20 + scan * 470 - 34} width={340} height={34}
                    fill={orange(0.12 * (1 - scan))} />
            </g>
          </g>

          {strike ? (
            <g strokeLinecap="round">
              <line x1={20} y1={30} x2={20 + 360 * slash} y2={30 + 450 * slash}
                    stroke="rgba(9,8,6,0.8)" strokeWidth={22} />
              <line x1={20} y1={30} x2={20 + 360 * slash} y2={30 + 450 * slash}
                    stroke={orange(0.98)} strokeWidth={9} />
            </g>
          ) : null}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------- descent */

/** Chevrons falling down the frame: something coming in from above. */
export const Descent: React.FC<{dur: number}> = ({dur}) => {
  const {f, p} = useLife(dur, 8, 10);
  const cx = W / 2, top = 470, bottom = 1130, gap = 112;
  const off = (f * 7) % gap;
  const chevrons = Array.from({length: 7}).map((_, k) => {
    const y = top + k * gap + off;
    const a = y < top || y > bottom ? 0 : Math.sin(Math.PI * (y - top) / (bottom - top));
    return {y, a, k};
  });
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {chevrons.map((c) => (
          <polyline key={c.k}
                    points={`${cx - 74},${c.y - 28} ${cx},${c.y + 12} ${cx + 74},${c.y - 28}`}
                    fill="none" stroke={orange(c.a * 0.9)} strokeWidth={6}
                    strokeLinejoin="miter" strokeLinecap="square" />
        ))}
        {Array.from({length: 18}).map((_, i) => {
          const y = top + i * 40 + ((f * 7) % 40);
          return (
            <line key={i} x1={86} x2={i % 3 === 0 ? 130 : 108} y1={y} y2={y}
                  stroke={paper(y > bottom ? 0 : 0.28)} strokeWidth={2} />
          );
        })}
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: bottom + 46,
                   textAlign: 'center', ...monoLabel(19, C.textSoft)}}>
        inbound
      </div>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------------- rewind */

/**
 * A playback bar running backwards. Used twice: on "backwards" and on
 * "flips the question". The same gesture twice is the point — the film is
 * about turning one idea around, and it turns it around on screen.
 */
export const Rewind: React.FC<{dur: number; y?: number; label?: string}> = ({
  dur, y = 520, label = 'rewind',
}) => {
  const {f, p} = useLife(dur, 8, 10);
  const x0 = 150, w = 780;
  const fill = interpolate(f, [4, dur - 6], [1, 0.1], {
    ...clampBoth, easing: Easing.bezier(0.5, 0, 0.2, 1),
  });
  const head = x0 + w * fill;
  const tri = (ox: number) =>
    `${ox + 30},${y - 74} ${ox},${y - 58} ${ox + 30},${y - 42}`;
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <polygon points={tri(W / 2 - 40)} fill={orange(0.95)} />
        <polygon points={tri(W / 2 - 4)} fill={orange(0.95)} />
        <line x1={x0} x2={x0 + w} y1={y} y2={y} stroke={paper(0.22)} strokeWidth={4} />
        <line x1={x0} x2={head} y1={y} y2={y} stroke={orange(1)} strokeWidth={4} />
        {Array.from({length: 21}).map((_, i) => (
          <line key={i} x1={x0 + (w * i) / 20} x2={x0 + (w * i) / 20}
                y1={y + 12} y2={y + (i % 5 === 0 ? 30 : 20)}
                stroke={paper(x0 + (w * i) / 20 <= head ? 0.55 : 0.16)} strokeWidth={2} />
        ))}
        <circle cx={head} cy={y} r={8} fill={orange(1)} />
      </svg>
      <div style={{position: 'absolute', left: 0, right: 0, top: y + 48,
                   textAlign: 'center', ...monoLabel(20, C.textSoft, '0.34em')}}>
        {label}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- bodyscan */

/** Corner brackets closing on a figure, one scan line, a ruler. */
export const BodyScan: React.FC<{
  dur: number; cx?: number; cy?: number; w?: number; h?: number; label?: string;
}> = ({dur, cx = 500, cy = 930, w = 330, h = 560, label = 'body scan'}) => {
  const {f, p} = useLife(dur, 8, 10);
  const close = interpolate(f, [0, 16], [1.5, 1], {...clampBoth, easing: ease});
  const hw = (w / 2) * close, hh = (h / 2) * close, arm = 46;
  const sweep = interpolate(f, [0, dur / 2, dur], [0, 1, 0], clampBoth);
  const sy = cy - h / 2 + sweep * h;
  const corner = (sx: number, sy2: number) =>
    `M ${cx + sx * hw} ${cy + sy2 * hh - sy2 * arm} L ${cx + sx * hw} ${cy + sy2 * hh} ` +
    `L ${cx + sx * hw - sx * arm} ${cy + sy2 * hh}`;
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <g stroke={orange(0.92)} strokeWidth={3} fill="none" strokeLinecap="square">
          <path d={corner(-1, -1)} /><path d={corner(1, -1)} />
          <path d={corner(-1, 1)} /><path d={corner(1, 1)} />
        </g>
        <line x1={cx - w / 2} x2={cx + w / 2} y1={sy} y2={sy}
              stroke={orange(0.8)} strokeWidth={3} />
        <rect x={cx - w / 2} y={sy - 40} width={w} height={40} fill={orange(0.1)} />
        {Array.from({length: 11}).map((_, i) => (
          <line key={i} x1={cx + w / 2 + 22} x2={cx + w / 2 + (i % 5 === 0 ? 52 : 38)}
                y1={cy - h / 2 + (h * i) / 10} y2={cy - h / 2 + (h * i) / 10}
                stroke={paper(0.4)} strokeWidth={2} />
        ))}
      </svg>
      <div style={{position: 'absolute', left: cx - w / 2, top: cy - h / 2 - 44,
                   ...monoLabel(19, C.textSoft)}}>
        {label}
      </div>
    </AbsoluteFill>
  );
};

/* ---------------------------------------------------------------- spine */

/**
 * A spine, drawn vertebra by vertebra from the top, with the lumbar curve
 * picked out in orange. That is where backs actually give out, and it is the
 * only part of the diagram with a label.
 */
export const Spine: React.FC<{dur: number; cx?: number}> = ({dur, cx = W / 2}) => {
  const {f, p} = useLife(dur, 8, 10);
  const top = 480, bottom = 1130, n = 24;
  const shown = Math.floor(interpolate(f, [2, 26], [0, n], clampBoth));
  const vert = Array.from({length: n}).map((_, k) => {
    const u = k / (n - 1);
    const x = cx + Math.sin(u * Math.PI * 1.7 + 0.4) * 46 - u * 12;
    const y = top + u * (bottom - top);
    const dx = Math.cos(u * Math.PI * 1.7 + 0.4) * 46 * Math.PI * 1.7 - 12;
    const ang = (Math.atan2(dx, bottom - top) * 180) / Math.PI;
    return {k, x, y, ang, w: 46 + u * 60, h: 18 + u * 9, lumbar: k >= 15 && k <= 19};
  });
  const hot = vert[17];
  const ping = interpolate(f, [26, dur], [0, 1], clampBoth);
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <polyline points={vert.slice(0, shown).map((v) => `${v.x},${v.y}`).join(' ')}
                  fill="none" stroke={paper(0.2)} strokeWidth={3} />
        {vert.slice(0, shown).map((v) => (
          <rect key={v.k} x={v.x - v.w / 2} y={v.y - v.h / 2} width={v.w} height={v.h}
                rx={8} transform={`rotate(${v.ang} ${v.x} ${v.y})`}
                fill={v.lumbar ? orange(0.2) : paper(0.1)}
                stroke={v.lumbar ? orange(0.98) : paper(0.74)} strokeWidth={2.4} />
        ))}
        {shown >= 20 ? (
          <>
            <circle cx={hot.x} cy={hot.y} r={58 + ping * 26} fill="none"
                    stroke={orange(0.7 * (1 - ping * 0.6))} strokeWidth={2.4} />
            <line x1={hot.x + 90} y1={hot.y} x2={hot.x + 210} y2={hot.y}
                  stroke={orange(0.8)} strokeWidth={2} />
          </>
        ) : null}
      </svg>
      {shown >= 20 ? (
        <div style={{position: 'absolute', left: hot.x + 222, top: hot.y - 14,
                     ...monoLabel(21, C.text)}}>lumbar</div>
      ) : null}
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- constellation */

export const Constellation: React.FC<{dur: number}> = ({dur}) => {
  const {f, p} = useLife(dur, 8, 10);
  const pts: Array<[number, number]> = [
    [150, 760], [292, 640], [430, 690], [566, 560], [706, 650], [836, 584], [938, 716],
  ];
  const seg = (i: number) =>
    interpolate(f, [4 + i * 4, 14 + i * 4], [0, 1], {...clampBoth, easing: ease});
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {pts.slice(1).map((q, i) => {
          const a = pts[i], g = seg(i);
          return (
            <line key={i} x1={a[0]} y1={a[1]} x2={a[0] + (q[0] - a[0]) * g}
                  y2={a[1] + (q[1] - a[1]) * g} stroke={paper(0.55)} strokeWidth={2}
                  strokeDasharray="3 8" />
          );
        })}
        {pts.map((q, i) => {
          const on = i === 0 ? 1 : seg(i - 1);
          const r = (8 + Math.sin(f / 6 + i * 1.7) * 1.5) * on;
          const last = i === pts.length - 1;
          const col = last ? orange(1) : paper(0.95);
          return (
            <g key={i} opacity={on}>
              <circle cx={q[0]} cy={q[1]} r={r + 10} fill={last ? orange(0.18) : paper(0.1)} />
              <circle cx={q[0]} cy={q[1]} r={r * 0.55} fill={col} />
              <line x1={q[0] - r * 2.6} x2={q[0] + r * 2.6} y1={q[1]} y2={q[1]}
                    stroke={col} strokeWidth={1.6} />
              <line y1={q[1] - r * 2.6} y2={q[1] + r * 2.6} x1={q[0]} x2={q[0]}
                    stroke={col} strokeWidth={1.6} />
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------------- home */

/** A house, drawn in one pass, with its window lit and a dotted line up to a star. */
export const HomeGlyph: React.FC<{
  dur: number; cx?: number; cy?: number; flip?: boolean;
}> = ({dur, cx = 540, cy = 860, flip = false}) => {
  const {f, p} = useLife(dur, 8, 10);
  const at = (a: number, b: number) =>
    interpolate(f, [a, b], [0, 1], {...clampBoth, easing: ease});
  const wall = at(0, 14), roof = at(8, 22), door = at(16, 24), arc = at(18, 40);
  const lit = at(24, 34);
  const dir = flip ? -1 : 1;
  const sx = cx + 262 * dir, sy = cy - 330;
  const win = {x: cx + 22, y: cy + 4, w: 46, h: 44};
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <g fill="none" stroke={paper(0.94)} strokeWidth={4} strokeLinejoin="round"
           strokeLinecap="round">
          <path d={`M${cx - 92} ${cy + 94} V${cy - 8} H${cx + 92} V${cy + 94} Z`} {...drawn(wall)} />
          <path d={`M${cx - 122} ${cy - 8} L${cx} ${cy - 112} L${cx + 122} ${cy - 8}`} {...drawn(roof)} />
          <path d={`M${cx - 54} ${cy + 94} V${cy + 28} H${cx - 12} V${cy + 94}`} {...drawn(door)} />
        </g>
        <rect x={win.x} y={win.y} width={win.w} height={win.h}
              fill={orange(0.85 * lit)} stroke={orange(lit)} strokeWidth={3} />
        <rect x={win.x - 16} y={win.y - 16} width={win.w + 32} height={win.h + 32}
              fill={orange(0.14 * lit)} />
        <path d={`M${win.x + win.w / 2} ${win.y - 24} Q${cx + 40 * dir} ${cy - 330} ${sx} ${sy + 24}`}
              fill="none" stroke={orange(0.8)} strokeWidth={2.4} strokeDasharray="4 10"
              {...{pathLength: 1}} strokeDashoffset={0} opacity={arc} />
        <g opacity={arc}>
          <circle cx={sx} cy={sy} r={9} fill={orange(1)} />
          <line x1={sx - 30} x2={sx + 30} y1={sy} y2={sy} stroke={orange(0.95)} strokeWidth={2} />
          <line y1={sy - 30} y2={sy + 30} x1={sx} x2={sx} stroke={orange(0.95)} strokeWidth={2} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------ wordplate */

/**
 * The word itself, large, letter by letter, with its two Greek halves under
 * it. "Panspermia" is the one term in the film a viewer might want to look
 * up, and showing what it is made of does most of the explaining.
 */
export const WordPlate: React.FC<{
  dur: number; text: string; sub?: string; y?: number;
}> = ({dur, text, sub, y = 600}) => {
  const {f, p} = useLife(dur, 6, 12);
  const size = fitSize(text, 940, 200, 80);
  const rule = interpolate(f, [8, 30], [0, 1], {...clampBoth, easing: ease});
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center',
                 opacity: p, pointerEvents: 'none'}}>
      <div style={{
        fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif', fontWeight: 800,
        fontSize: size, lineHeight: 1, letterSpacing: '0.01em', color: C.text,
        textShadow: '0 4px 34px rgba(0,0,0,0.9)',
      }}>
        {text.split('').map((ch, i) => {
          const a = interpolate(f, [i * 1.3, i * 1.3 + 7], [0, 1], clampBoth);
          return (
            <span key={i} style={{display: 'inline-block', opacity: a,
                                  transform: `translateY(${(1 - a) * 22}px)`}}>
              {ch}
            </span>
          );
        })}
      </div>
      <div style={{margin: '22px auto 0', height: 3, width: 300 * rule, background: C.signal,
                   boxShadow: `0 0 22px ${C.signal}`}} />
      {sub ? (
        <div style={{marginTop: 22, ...monoLabel(22, C.textSoft, '0.22em'),
                     opacity: interpolate(f, [18, 32], [0, 1], clampBoth)}}>
          {sub}
        </div>
      ) : null}
    </div>
  );
};

/* ----------------------------------------------------------- seed trail */

/** Seeds crossing from a small world to a larger one along a single arc. */
export const SeedTrail: React.FC<{dur: number}> = ({dur}) => {
  const {f, p} = useLife(dur, 8, 12);
  const A = {x: 200, y: 640}, C1 = {x: 560, y: 470}, B = {x: 860, y: 1010};
  const bez = (u: number) => ({
    x: (1 - u) ** 2 * A.x + 2 * (1 - u) * u * C1.x + u * u * B.x,
    y: (1 - u) ** 2 * A.y + 2 * (1 - u) * u * C1.y + u * u * B.y,
  });
  const N = 20, travel = 34;
  const seeds = Array.from({length: N}).map((_, i) => {
    const u = (f - (4 + i * 1.7)) / travel;
    return {i, u};
  });
  const hit = seeds.filter((s) => s.u >= 1 && s.u < 1.3).length;
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <path d={`M${A.x} ${A.y} Q${C1.x} ${C1.y} ${B.x} ${B.y}`} fill="none"
              stroke={paper(0.12)} strokeWidth={2} strokeDasharray="2 12" />
        <circle cx={A.x} cy={A.y} r={36} fill="none" stroke={paper(0.7)} strokeWidth={3} />
        <ellipse cx={A.x} cy={A.y} rx={58} ry={14} fill="none" stroke={paper(0.4)}
                 strokeWidth={2} transform={`rotate(-18 ${A.x} ${A.y})`} />
        <circle cx={B.x} cy={B.y} r={66} fill="none" stroke={paper(0.9)} strokeWidth={3.4} />
        <circle cx={B.x} cy={B.y} r={66 + hit * 7} fill="none"
                stroke={orange(Math.min(0.8, hit * 0.2))} strokeWidth={2.4} />
        {seeds.map((s) =>
          s.u > 0 && s.u < 1
            ? [0, 1, 2, 3].map((k) => {
                const q = bez(Math.max(0, s.u - k * 0.035));
                return (
                  <circle key={`${s.i}-${k}`} cx={q.x} cy={q.y} r={7 - k * 1.5}
                          fill={orange(1 - k * 0.27)} />
                );
              })
            : null,
        )}
      </svg>
    </AbsoluteFill>
  );
};

/* --------------------------------------------------------- tree of life */

/**
 * Earth's family tree. Branches split by depth, each depth drawing a few
 * frames after the one below, so it grows rather than appears. One leaf is
 * ours, and it is the only orange thing on it — which is the argument: we
 * are on the tree, not beside it.
 */
export const TreeOfLife: React.FC<{dur: number; label?: string}> = ({
  dur, label = 'us',
}) => {
  const {f, p} = useLife(dur, 8, 12);
  const cx = W / 2, base = 1140;
  type Br = {x1: number; y1: number; x2: number; y2: number; d: number};
  const brs: Br[] = [];
  const leaves: Array<[number, number]> = [];
  const grow = (x: number, y: number, ang: number, len: number, d: number, seed: number) => {
    const x2 = x + Math.sin(ang) * len, y2 = y - Math.cos(ang) * len;
    brs.push({x1: x, y1: y, x2, y2, d});
    if (d >= 5) { leaves.push([x2, y2]); return; }
    const spread = 0.42 + (rnd(seed * 3.1) - 0.5) * 0.18;
    grow(x2, y2, ang - spread, len * 0.76, d + 1, seed * 2 + 1);
    grow(x2, y2, ang + spread, len * 0.76, d + 1, seed * 2 + 2);
  };
  grow(cx, base, 0, 190, 0, 1);
  const ours = leaves[Math.floor(leaves.length * 0.64)];
  const ping = interpolate(f, [40, dur], [0, 1], clampBoth);
  return (
    <AbsoluteFill style={{opacity: p, pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {brs.map((b, i) => {
          const g = interpolate(f, [2 + b.d * 5, 12 + b.d * 5], [0, 1], {...clampBoth, easing: ease});
          return (
            <line key={i} x1={b.x1} y1={b.y1} x2={b.x1 + (b.x2 - b.x1) * g}
                  y2={b.y1 + (b.y2 - b.y1) * g} stroke={paper(0.82)}
                  strokeWidth={Math.max(2, 9 - b.d * 1.5)} strokeLinecap="round" />
          );
        })}
        {leaves.map((l, i) => {
          const a = interpolate(f, [34, 44], [0, 1], clampBoth);
          const mine = l === ours;
          return (
            <circle key={i} cx={l[0]} cy={l[1]} r={mine ? 11 : 4.5}
                    fill={mine ? orange(1) : paper(0.8)} opacity={a} />
          );
        })}
        <circle cx={ours[0]} cy={ours[1]} r={22 + ping * 22} fill="none"
                stroke={orange(0.75 * (1 - ping))} strokeWidth={2.4}
                opacity={interpolate(f, [36, 46], [0, 1], clampBoth)} />
      </svg>
      <div style={{position: 'absolute', left: ours[0] + 28, top: ours[1] - 40,
                   opacity: interpolate(f, [38, 50], [0, 1], clampBoth),
                   ...monoLabel(24, C.signal, '0.3em')}}>
        {label}
      </div>
    </AbsoluteFill>
  );
};
