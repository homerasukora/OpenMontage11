import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Img, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

import {C, EASE_SIGNAL, FONT_STACKS, H, W, fitSize, rnd, sec} from './theme';
import {
  NODES, PATH, POLY, TICKS, TOTAL_LEN, cameraX, pointAt, progressAt,
} from './geom';
import {
  Coin, CropMarks, Dust, FxDefs, Glitch, Grain, Ground, Logo, Mascot,
  ScanLines, crtGain, fadeBand,
} from './fx';

loadBarlow('normal', {weights: ['600', '700'], subsets: ['latin']});
loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});

export const DURATION = sec(15);

export const CLOSING_LINE = 'All roads lead to 2027';

const display = (size: number, weight = 700) => ({
  fontFamily: FONT_STACKS.en.display,
  fontWeight: weight,
  fontSize: size,
  letterSpacing: '0.01em',
  textTransform: 'uppercase' as const,
  lineHeight: 1.02,
});

const mono = (size: number) => ({
  fontFamily: FONT_STACKS.en.mono,
  fontWeight: 400,
  fontSize: size,
  letterSpacing: '0.2em',
  textTransform: 'uppercase' as const,
});

/**
 * How far along the one line we are, at any frame.
 *
 * Every section is a leg between two nodes, eased so it starts and lands
 * softly — the brief asks for slow and controlled, so nothing here is linear
 * and nothing snaps. The last leg is the exception: once the line touches
 * 2027 it leaves the frame in twelve frames.
 */
const KEYS: Array<[number, number]> = [
  [0, 0],
  [sec(2.6), progressAt(NODES[0])],
  [sec(5.6), progressAt(NODES[1])],
  [sec(8.6), progressAt(NODES[2])],
  [sec(11.6), progressAt(NODES[3])],
  [sec(13.2), progressAt(NODES[4])],
  [sec(13.6), 1],
];

const progress = (f: number) => {
  for (let i = 1; i < KEYS.length; i++) {
    if (f <= KEYS[i][0]) {
      const last = i === KEYS.length - 1;
      return interpolate(f, [KEYS[i - 1][0], KEYS[i][0]], [KEYS[i - 1][1], KEYS[i][1]], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
        easing: last ? Easing.bezier(0.7, 0, 0.9, 0.6) : Easing.bezier(0.42, 0, 0.35, 1),
      });
    }
  }
  return 1;
};

/** The line itself, plus its nodes, drawn in world space under the camera. */
const Timeline: React.FC<{p: number; camX: number}> = ({p, camX}) => {
  const f = useCurrentFrame();
  const revealed = TOTAL_LEN * p;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        <g transform={`translate(${-camX}, 0)`}>
          {/* the road ahead, barely there — it is what makes the frame feel
              composed before the stroke has arrived, and it tells you the
              line is going somewhere specific */}
          <polyline points={POLY} fill="none"
                    stroke="rgba(255,83,31,0.085)" strokeWidth={1.5} />

          {/* measure ticks: a timeline, not a stroke. No numbers on them —
              the only type in this film is the copy the brief specifies */}
          {TICKS.map((tk) => (
            <line key={tk.i} x1={tk.x} y1={tk.y - tk.h} x2={tk.x} y2={tk.y + tk.h}
                  stroke={`rgba(232,227,219,${tk.major ? 0.13 : 0.06})`}
                  strokeWidth={1} />
          ))}

          {/* the one continuous line — dash offset is the only thing that moves */}
          <polyline
            points={POLY}
            fill="none"
            stroke="rgba(255,83,31,0.30)"
            strokeWidth={7}
            strokeDasharray={TOTAL_LEN}
            strokeDashoffset={TOTAL_LEN - revealed}
            filter="url(#signalGlow)"
          />
          <polyline
            points={POLY}
            fill="none"
            stroke={C.signal}
            strokeWidth={2.4}
            strokeDasharray={TOTAL_LEN}
            strokeDashoffset={TOTAL_LEN - revealed}
          />

          {NODES.map((idx, k) => {
            const np = progressAt(idx);
            const on = interpolate(p, [np - 0.006, np + 0.004], [0, 1], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
            });
            if (on <= 0) return null;
            const pt = PATH[idx];
            const last = k === NODES.length - 1;
            const beat = last ? (Math.sin(f / 5) + 1) / 2 : (Math.sin(f / 11 + k) + 1) / 2;
            return (
              <g key={idx} opacity={on}>
                <circle cx={pt.x} cy={pt.y} r={16 + beat * (last ? 16 : 6)}
                        fill="none" stroke={`rgba(255,83,31,${0.16 + beat * (last ? 0.3 : 0.1)})`}
                        strokeWidth={1.5} />
                <circle cx={pt.x} cy={pt.y} r={last ? 7 + beat * 2 : 5}
                        fill={C.signal} filter="url(#signalGlow)" />
              </g>
            );
          })}
        </g>

        {/* the head of the line, always at the same place in frame */}
        {p < 0.999 ? (
          <circle
            cx={pointAt(p).x - camX} cy={pointAt(p).y}
            r={3.5 + (Math.sin(f / 4) + 1) * 1.2}
            fill={C.text} filter="url(#signalGlow)" opacity={0.9}
          />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/** Section 4 only: other signals leaning in toward the line. */
const Convergence: React.FC<{camX: number; amount: number}> = ({camX, amount}) => {
  if (amount <= 0.001) return null;
  const target = PATH[NODES[3]];
  const tx = target.x - camX;
  const ty = target.y;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {Array.from({length: 7}).map((_, i) => {
          const side = i % 2 === 0 ? -1 : 1;
          const sx = side < 0 ? -160 : W + 160;
          const sy = 180 + rnd(i * 17 + 3) * (H - 620);
          const grow = interpolate(amount, [0, 1], [0, 1]);
          return (
            <line
              key={i}
              x1={sx} y1={sy}
              x2={sx + (tx - sx) * grow} y2={sy + (ty - sy) * grow}
              stroke={`rgba(255,83,31,${0.17 * amount})`}
              strokeWidth={1}
            />
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Head: React.FC<{text: string; size?: number; o: number; y: number; dy: number}> = ({
  text, size = 96, o, y, dy,
}) => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center',
    ...display(size), color: C.text, opacity: o,
    transform: `translateY(${dy}px)`,
    textShadow: '0 2px 26px rgba(0,0,0,0.65)',
  }}>{text}</div>
);

const Sub: React.FC<{children: React.ReactNode; o: number; y: number; colour?: string}> = ({
  children, o, y, colour = C.textMuted,
}) => (
  <div style={{
    position: 'absolute', left: 0, right: 0, top: y, textAlign: 'center',
    ...mono(26), color: colour, opacity: o,
  }}>{children}</div>
);

export const Sting: React.FC = () => {
  const f = useCurrentFrame();
  const p = progress(f);
  const camX = cameraX(p);

  // sections
  const s1 = fadeBand(f, sec(0.4), sec(2.9));
  const s2 = fadeBand(f, sec(3.2), sec(5.9));
  const s3 = fadeBand(f, sec(6.2), sec(8.9));
  const s4a = fadeBand(f, sec(9.3), sec(10.9), 7);
  const s4b = fadeBand(f, sec(10.7), sec(11.9), 7);
  const s5 = fadeBand(f, sec(12.1), sec(13.35), 7);
  const card = interpolate(f, [sec(13.62), sec(13.95)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  // everything but the line steps back for the last leg
  const worldOut = interpolate(f, [sec(12.0), sec(12.7)], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const lineOut = interpolate(f, [sec(13.62), sec(13.9)], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const tear = Math.max(
    interpolate(f, [sec(13.40), sec(13.52), sec(13.66)], [0, 1, 0], {
      extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    }),
    rnd(Math.floor(f / 6) + 210) > 0.965 ? 0.16 : 0,
  );

  const rise = interpolate(f, [sec(0), sec(0.7)], [26, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  const n1 = PATH[NODES[0]];
  const n4 = PATH[NODES[3]];
  const predIn = fadeBand(f, sec(6.45), sec(8.9), 8);
  const predScan = interpolate(f, [sec(6.7), sec(8.1)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const scan = interpolate(f, [sec(3.7), sec(5.3)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });

  const stage = (
    <AbsoluteFill>
      <Ground />

      <AbsoluteFill style={{opacity: worldOut}}>
        <Convergence camX={camX} amount={s4a * 0.9 + s4b * 0.9} />

        {/* 0:00–0:03 · the token itself at the first node. The line is
            about $VIRUS2027 arriving on-chain, so the thing that arrives is
            the coin; Vira gets the convergence beat instead. */}
        <Coin
          x={n1.x - camX - 342} y={n1.y - 348} width={296}
          opacity={s1 * 0.97}
        />

        {/* 0:03–0:06 · the mark, being read */}
        {/* The mark, being read.
            Anchored to the frame rather than to the node's world position:
            section two spends its whole length travelling *toward* node two,
            so a world-anchored plate would sit off the right edge for all but
            the last half-second. Parked just ahead of the head of the line
            instead, it rides along with the scan and stays in shot. */}
        <div style={{
          position: 'absolute', left: 690, top: 852, width: 232, opacity: s2,
        }}>
          <Logo x={26} y={22} width={180} opacity={0.94} />
          <div style={{
            position: 'absolute', left: 0, top: 154 * scan, width: 232, height: 2,
            background: C.signal, boxShadow: `0 0 22px ${C.signal}`,
            opacity: scan > 0.01 && scan < 0.99 ? 0.9 : 0,
          }} />
          <svg width={232} height={156} style={{position: 'absolute', left: 0, top: 0}}>
            {[[1, 1, 1, 1], [231, 1, -1, 1], [1, 155, 1, -1], [231, 155, -1, -1]].map(
              ([x, y, dx, dy], i) => (
                <g key={i} opacity={0.85}>
                  <line x1={x} y1={y} x2={x + dx * 24} y2={y} stroke={C.signal} strokeWidth={2} />
                  <line x1={x} y1={y} x2={x} y2={y + dy * 24} stroke={C.signal} strokeWidth={2} />
                </g>
              ))}
          </svg>
        </div>

        {/* 0:09–0:12 · Vira again, watching it come together */}
        <Mascot
          x={n4.x - camX + 148} y={n4.y - 226} width={196}
          opacity={(s4a * 0.5 + s4b * 0.5) * 0.9}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{opacity: lineOut}}>
        <Timeline p={p} camX={camX} />
      </AbsoluteFill>

      {/* ── copy ───────────────────────────────────────────────── */}
      <AbsoluteFill style={{opacity: worldOut}}>
        <Head text="08.2026 // Signal Origin" size={78} o={s1} y={640} dy={rise} />
        <Sub o={s1} y={752}>$VIRUS2027 appears on-chain</Sub>

        <Head text="On-chain trace" o={s2} y={598} dy={0} />
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 726, textAlign: 'center',
          opacity: s2,
        }}>
          {['Fixed supply', 'No mint', 'Burn active'].map((t, i) => (
            <div key={t} style={{
              ...mono(25), color: C.textSoft, marginBottom: 12,
              opacity: interpolate(f, [sec(3.5) + i * 7, sec(3.9) + i * 7], [0, 1], {
                extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
              }),
            }}>{t}</div>
          ))}
        </div>

        <Head text="Predictions go on-chain" size={82} o={s3} y={584} dy={0} />
        <Sub o={s3} y={716} colour={C.signal}>Pulse // multiple markets</Sub>

        {/* A live market, on the line that says predictions go on-chain.
            It lands a beat after the headline so the words arrive first, and
            it takes the empty band above them rather than displacing
            anything. A hairline rule frames it as a placed document; the
            screenshot itself is barely graded, because one that looks
            colour-graded stops reading as a screenshot. */}
        <div style={{
          position: 'absolute', left: (W - 536) / 2, top: 88,
          width: 536, opacity: predIn,
          transform: `translateY(${(1 - predIn) * 16}px)`,
        }}>
          <Img
            src={staticFile('prediction.jpg')}
            style={{
              width: '100%', display: 'block', borderRadius: 14,
              border: `1px solid rgba(232,227,219,0.16)`,
            }}
          />
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 484 * predScan,
            height: 2, background: C.signal, boxShadow: `0 0 22px ${C.signal}`,
            opacity: predScan > 0.02 && predScan < 0.98 ? 0.55 : 0,
          }} />
        </div>

        {/* possibilities, not predictions — they stay faint and never resolve */}
        {['AI?', 'Markets?', 'Disclosure?', '2027?'].map((t, i) => {
          const a = interpolate(
            f,
            [sec(6.6) + i * 11, sec(7.0) + i * 11, sec(8.2) + i * 9, sec(8.7) + i * 9],
            [0, 1, 1, 0],
            {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
          );
          // in the margins either side of the copy, clear of the market plate
          const xs = [58, 742, 48, 762];
          const ys = [826, 872, 944, 1000];
          return (
            <div key={t} style={{
              position: 'absolute', left: xs[i], top: ys[i],
              ...display(64), color: C.text,
              opacity: a * 0.16 * s3,
            }}>{t}</div>
          );
        })}

        <Head text="Different signals." size={88} o={s4a} y={612} dy={0} />
        <Head text="Same date." size={88} o={s4b} y={612} dy={0} />
      </AbsoluteFill>

      {/* No arrow, and "lead" not "leads" — the subject is plural. Fitted to
          940 px because the line is long enough to reach the safe edge at 92. */}
      <Head
        text={CLOSING_LINE}
        size={fitSize(CLOSING_LINE, 940, 92, 58)}
        o={s5} y={606} dy={0}
      />

      {/* ── final card ─────────────────────────────────────────── */}
      <AbsoluteFill style={{opacity: card}}>
        <Logo centred width={188} y={548} opacity={0.94} />
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 786, textAlign: 'center',
          ...display(292), color: C.text, letterSpacing: '-0.03em',
        }}>2027</div>
        <div style={{
          position: 'absolute', left: (W - 380) / 2, top: 1128,
          width: 396 * card, height: 4, background: C.signal,
          boxShadow: `0 0 26px ${C.signal}`,
        }} />
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 1180, textAlign: 'center',
          ...display(64), color: C.text,
        }}>Something is coming.</div>
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 1300, textAlign: 'center',
          ...mono(28), color: C.signal,
        }}>$VIRUS2027</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <FxDefs />
      <AbsoluteFill style={{opacity: crtGain(f)}}>
        <Glitch amount={tear}>{stage}</Glitch>
      </AbsoluteFill>
      <Dust />
      <ScanLines />
      <Grain />
      <CropMarks opacity={0.85 * (1 - card * 0.25)} />
      <Audio src={staticFile('mix.wav')} />
    </AbsoluteFill>
  );
};
