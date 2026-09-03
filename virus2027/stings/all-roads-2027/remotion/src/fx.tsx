import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, H, W, rnd} from './theme';

/**
 * The analogue layer. Everything here sits on top of the picture and none of
 * it darkens the edges — the ground is already #090806 and a vignette on top
 * of that only closes the frame in.
 */

/** Scrolling film grain, tiled from a seamless plate. */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.14}) => {
  const f = useCurrentFrame();
  const x = (rnd(Math.floor(f / 2)) - 0.5) * 320;
  const y = (rnd(Math.floor(f / 2) + 91) - 0.5) * 320;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile('grain.png')})`,
        backgroundSize: '320px 320px',
        backgroundPosition: `${x}px ${y}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

/** CRT scan lines, drifting slowly so they never lock to the pixel grid. */
export const ScanLines: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(0,0,0,0.42) 0px, rgba(0,0,0,0.42) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 3px)',
        backgroundPosition: `0px ${(f * 0.35) % 3}px`,
        opacity: 0.5,
        pointerEvents: 'none',
      }}
    />
  );
};

/**
 * Mains-hum flicker: a small continuous wobble plus an occasional deeper dip,
 * as if the signal is being carried by something old.
 */
export const crtGain = (f: number) => {
  const wobble = (rnd(f) - 0.5) * 0.055 + Math.sin(f / 3.1) * 0.012;
  const dip = rnd(Math.floor(f / 7) + 400) > 0.955 ? -0.13 : 0;
  return 1 + wobble + dip;
};

/** Dust specks and the odd hair of a scratch. Sparse on purpose. */
export const Dust: React.FC = () => {
  const f = useCurrentFrame();
  const bucket = Math.floor(f / 4);
  const specks = Array.from({length: 7}).map((_, i) => {
    const s = bucket * 13 + i * 29;
    return {
      x: rnd(s) * W,
      y: rnd(s + 3) * H,
      r: 0.8 + rnd(s + 7) * 1.9,
      o: 0.10 + rnd(s + 11) * 0.22,
      i,
    };
  });
  const scratchOn = rnd(Math.floor(f / 11) + 77) > 0.80;
  const sx = rnd(Math.floor(f / 11) + 5) * W;
  const sTop = rnd(Math.floor(f / 11) + 19) * H * 0.5;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {specks.map((s) => (
          <circle key={s.i} cx={s.x} cy={s.y} r={s.r}
                  fill={`rgba(232,227,219,${s.o})`} />
        ))}
        {scratchOn ? (
          <line x1={sx} y1={sTop} x2={sx + 3} y2={sTop + H * 0.42}
                stroke="rgba(232,227,219,0.16)" strokeWidth={1} />
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};

/**
 * Analogue tear. Slices the frame horizontally and offsets each slice, with a
 * chroma split behind it. Driven by an `amount` so a section can ask for a
 * flicker of it and the 2027 hit can ask for the whole thing.
 */
export const Glitch: React.FC<{amount: number; children: React.ReactNode}> = ({
  amount, children,
}) => {
  const f = useCurrentFrame();
  if (amount <= 0.001) return <>{children}</>;
  const slices = [0, 1, 2, 3, 4].map((i) => {
    const s = Math.floor(f) * 7 + i * 31;
    return {
      top: rnd(s) * H,
      h: 20 + rnd(s + 2) * 130,
      dx: (rnd(s + 5) - 0.5) * 150 * amount,
      i,
    };
  });
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{
        transform: `translateX(${-7 * amount}px)`,
        filter: 'url(#chromaR)', opacity: 0.55 * amount,
      }}>{children}</AbsoluteFill>
      <AbsoluteFill style={{
        transform: `translateX(${7 * amount}px)`,
        filter: 'url(#chromaB)', opacity: 0.55 * amount,
      }}>{children}</AbsoluteFill>
      <AbsoluteFill>{children}</AbsoluteFill>
      {slices.map((s) => (
        <AbsoluteFill
          key={s.i}
          style={{
            clipPath: `inset(${s.top}px 0 ${H - s.top - s.h}px 0)`,
            transform: `translateX(${s.dx}px)`,
          }}
        >
          {children}
        </AbsoluteFill>
      ))}
    </AbsoluteFill>
  );
};

/** Colour matrices the glitch borrows for its chroma split. */
export const FxDefs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      <filter id="chromaR">
        <feColorMatrix type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" />
      </filter>
      <filter id="chromaB">
        <feColorMatrix type="matrix" values="0 0 0 0 0  0 0.3 0 0 0  0 0 1 0 0  0 0 0 1 0" />
      </filter>
      <filter id="signalGlow" x="-80%" y="-80%" width="260%" height="260%">
        <feGaussianBlur stdDeviation="9" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
      <filter id="softGlow" x="-60%" y="-60%" width="220%" height="220%">
        <feGaussianBlur stdDeviation="4" result="b" />
        <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
      </filter>
    </defs>
  </svg>
);

/** Corner registration ticks. The frame reading as a document. */
export const CropMarks: React.FC<{opacity?: number}> = ({opacity = 0.85}) => {
  const m = 52;
  const L = 34;
  const s = `rgba(232,227,219,${0.5 * opacity})`;
  const corner = (x: number, y: number, dx: number, dy: number, k: number) => (
    <g key={k}>
      <line x1={x} y1={y} x2={x + dx * L} y2={y} stroke={s} strokeWidth={2} />
      <line x1={x} y1={y} x2={x} y2={y + dy * L} stroke={s} strokeWidth={2} />
    </g>
  );
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={W} height={H}>
        {corner(m, m, 1, 1, 0)}
        {corner(W - m, m, -1, 1, 1)}
        {corner(m, H - m, 1, -1, 2)}
        {corner(W - m, H - m, -1, -1, 3)}
      </svg>
    </AbsoluteFill>
  );
};

/** Faint background texture so the black is a surface, not a void. */
export const Ground: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{
          background:
            `radial-gradient(120% 80% at 50% ${58 + Math.sin(f / 90) * 4}%, ` +
            'rgba(58,32,20,0.30) 0%, rgba(20,13,9,0.12) 42%, rgba(0,0,0,0) 74%)',
        }}
      />
    </AbsoluteFill>
  );
};

export const Mascot: React.FC<{
  x: number; y: number; width: number; opacity: number;
}> = ({x, y, width, opacity}) => (
  <Img
    src={staticFile('mascot-plate.png')}
    style={{
      position: 'absolute', left: x, top: y, width,
      opacity, pointerEvents: 'none',
    }}
  />
);

export const Logo: React.FC<{
  x?: number; y?: number; width: number; opacity: number; centred?: boolean;
}> = ({x = 0, y = 0, width, opacity, centred}) => (
  <Img
    src={staticFile('logo-v.png')}
    style={{
      position: 'absolute',
      left: centred ? (W - width) / 2 : x,
      top: y,
      width,
      opacity,
      pointerEvents: 'none',
    }}
  />
);

export const fadeBand = (f: number, inF: number, outF: number, ramp = 9) =>
  interpolate(f, [inF, inF + ramp, outF - ramp, outF], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
