import React from 'react';
import {
  AbsoluteFill,
  Easing,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {C, EASE_SIGNAL, F, FPS, H, SAFE, W, rnd, timecode} from './theme';

/* ------------------------------------------------------------------ *
 * Ground — every frame sits on this. Base, light field, grain,
 * technical circles, vignette, occasional scan sweep.
 * ------------------------------------------------------------------ */

export const Ground: React.FC<{scanEvery?: number; grainOnly?: boolean}> = ({
  scanEvery = 7.5,
  grainOnly = false,
}) => {
  const frame = useCurrentFrame();

  // grain drifts a whole tile-width per frame so it never crawls
  const gx = Math.floor(rnd(frame + 1) * 320);
  const gy = Math.floor(rnd(frame + 991) * 320);

  const cycle = scanEvery * FPS;
  const phase = frame % cycle;
  const scanActive = phase < FPS * 1.1;
  const scanY = interpolate(phase, [0, FPS * 1.1], [-260, H + 260], {
    extrapolateRight: 'clamp',
  });

  // Over live footage the ground must not paint a base colour — only the
  // grain and the scan sweep are wanted, so the plate below stays visible.
  if (grainOnly) {
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        {scanActive ? (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: scanY,
              width: W,
              height: 230,
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.032) 50%, rgba(255,255,255,0) 100%)',
            }}
          />
        ) : null}
        <AbsoluteFill
          style={{
            backgroundImage: `url(${staticFile('grain.png')})`,
            backgroundSize: '320px 320px',
            backgroundPosition: `${gx}px ${gy}px`,
            opacity: 0.085,
            mixBlendMode: 'soft-light',
          }}
        />
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(120% 70% at 50% 34%, rgba(255,120,60,0.055) 0%, rgba(255,120,60,0.014) 38%, rgba(0,0,0,0) 68%)',
        }}
      />

      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{position: 'absolute', opacity: 0.5}}
      >
        {[300, 470, 660, 880].map((r, i) => (
          <circle
            key={r}
            cx={W / 2}
            cy={860}
            r={r}
            fill="none"
            stroke={i === 1 ? 'rgba(255,83,31,0.10)' : 'rgba(232,227,219,0.055)'}
            strokeWidth={1}
            strokeDasharray={i % 2 ? '2 14' : undefined}
          />
        ))}
        <line x1={0} y1={860} x2={W} y2={860} stroke="rgba(232,227,219,0.035)" />
        <line x1={W / 2} y1={0} x2={W / 2} y2={H} stroke="rgba(232,227,219,0.03)" />
      </svg>

      {scanActive ? (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: scanY,
            width: W,
            height: 230,
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.028) 50%, rgba(255,255,255,0) 100%)',
            pointerEvents: 'none',
          }}
        />
      ) : null}

      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile('grain.png')})`,
          backgroundSize: '320px 320px',
          backgroundPosition: `${gx}px ${gy}px`,
          opacity: 0.075,
          mixBlendMode: 'soft-light',
        }}
      />

    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Chrome — the file-number / timecode furniture.
 * ------------------------------------------------------------------ */

export const Chrome: React.FC<{episode?: string}> = ({episode = '01'}) => {
  const frame = useCurrentFrame();
  const blink = frame % 30 < 20;

  const label: React.CSSProperties = {
    fontFamily: F.mono,
    fontSize: 19,
    letterSpacing: '0.20em',
    color: C.textMuted,
    textTransform: 'uppercase',
  };

  return (
    <AbsoluteFill>
      <div
        style={{
          position: 'absolute',
          top: 198,
          left: SAFE.left,
          right: W - SAFE.right,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={label}>
          VIRUS<span style={{color: C.signal}}>2027</span>
        </span>
        <span style={label}>TRANSMISSION {episode}</span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 236,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          height: 1,
          background: C.line,
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 1530,
          left: SAFE.left,
          right: W - SAFE.right,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{...label, fontSize: 17}}>{timecode(frame)}</span>
        <span style={{...label, fontSize: 17}}>
          <span style={{color: blink ? C.signal : 'transparent'}}>●</span>{' '}
          ACCESS: PARTIAL
        </span>
      </div>
      <div
        style={{
          position: 'absolute',
          top: 1518,
          left: SAFE.left,
          width: SAFE.right - SAFE.left,
          height: 1,
          background: C.line,
        }}
      />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ *
 * Primitives
 * ------------------------------------------------------------------ */

/** Section label: small orange mono tag above a heading. */
export const Tag: React.FC<{
  children: React.ReactNode;
  color?: string;
  delay?: number;
  style?: React.CSSProperties;
}> = ({children, color = C.signal, delay = 0, style}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame - delay, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        fontFamily: F.mono,
        fontSize: 21,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        opacity: o,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Condensed display line revealed through a vertical mask. */
export const Display: React.FC<{
  children: React.ReactNode;
  size?: number;
  delay?: number;
  color?: string;
  weight?: number;
  align?: 'left' | 'center';
  lineHeight?: number;
  style?: React.CSSProperties;
}> = ({
  children,
  size = 150,
  delay = 0,
  color = C.text,
  weight = 800,
  align = 'left',
  lineHeight = 0.88,
  style,
}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <div style={{overflow: 'hidden', textAlign: align, ...style}}>
      <div
        style={{
          fontFamily: F.display,
          fontWeight: weight,
          fontSize: size,
          lineHeight,
          letterSpacing: '-0.025em',
          textTransform: 'uppercase',
          color,
          transform: `translateY(${(1 - p) * 108}%)`,
          opacity: p > 0 ? 1 : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
};

/** Black censor bar that wipes in from the left. */
export const Redaction: React.FC<{
  width: number;
  height?: number;
  delay?: number;
  dur?: number;
  bracket?: boolean;
  style?: React.CSSProperties;
}> = ({width, height = 30, delay = 0, dur = 9, bracket = false, style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <div style={{position: 'relative', width, height, ...style}}>
      <div
        style={{
          width: width * p,
          height,
          background: '#000',
          boxShadow: 'inset 0 0 0 1px rgba(232,227,219,0.16)',
        }}
      />
      {bracket && p > 0.98 ? (
        <>
          <div
            style={{
              position: 'absolute',
              left: -9,
              top: -9,
              width: 16,
              height: 16,
              borderLeft: `2px solid ${C.signal}`,
              borderTop: `2px solid ${C.signal}`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: -9,
              bottom: -9,
              width: 16,
              height: 16,
              borderRight: `2px solid ${C.signal}`,
              borderBottom: `2px solid ${C.signal}`,
            }}
          />
        </>
      ) : null}
    </div>
  );
};

/** Orange rule that draws left to right. */
export const SignalRule: React.FC<{
  width: number;
  delay?: number;
  dur?: number;
  color?: string;
  thickness?: number;
  style?: React.CSSProperties;
}> = ({width, delay = 0, dur = 12, color = C.signal, thickness = 3, style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame - delay, [0, dur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <div style={{width: width * p, height: thickness, background: color, ...style}} />
  );
};

/** Hard cut punctuation: a 2-frame flash on a beat. */
export const CutFlash: React.FC<{at: number[]}> = ({at}) => {
  const frame = useCurrentFrame();
  const hit = at.some((f) => frame >= f && frame < f + 2);
  if (!hit) return null;
  return (
    <AbsoluteFill
      style={{background: 'rgba(232,227,219,0.055)', mixBlendMode: 'screen'}}
    />
  );
};

/** Slow push-in / drift for archival plates. */
export const useKenBurns = (
  from: number,
  to: number,
  durFrames: number,
  offset = 0
) => {
  const frame = useCurrentFrame();
  return interpolate(frame - offset, [0, durFrames], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

export const useSceneFade = (durFrames: number, inF = 6, outF = 6) => {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, inF, Math.max(inF + 1, durFrames - outF), durFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
  );
};

export const useSafeDuration = () => useVideoConfig().durationInFrames;
