import React from 'react';
import {
  AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {C, EASE_SIGNAL, F, H, W} from './theme';

/** Vertical centre of a photographic band. */
export const BAND_CENTRE = 832;

export type Shot = {
  at: string;
  lead: number;
  type: 'band' | 'hero' | 'void' | 'pano' | 'clip';
  src?: string;
  centre?: number;
  /** How far a band pushes in over its own length. Longer holds need more. */
  push?: number;
  /**
   * Plate width as a fraction of the frame. Most of this episode's sources
   * are phone screenshots 340-580 px wide; rendering them at full frame width
   * is a 2-3x upscale that turns type to mush, so they play smaller and read
   * as pinned evidence rather than as photography.
   */
  width?: number;
};

/**
 * A photograph shown at its native aspect, full frame width, on the brand
 * ground. Every source here is 650-1920 px wide, so a 9:16 cover crop would
 * mean a 2.5-4x upscale; the band keeps it at 1.66x at worst and reads as an
 * archive plate rather than a stretched stock photo.
 */
export const Band: React.FC<{
  src: string; dur: number; seed?: number; centre?: number; push?: number;
  width?: number;
}> = ({src, dur, seed = 0, centre = BAND_CENTRE, push = 0.055, width = 1}) => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, 9], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const zoom = interpolate(f, [0, dur], [1.0, 1 + push], {extrapolateRight: 'clamp'});
  const slide = interpolate(f, [0, dur], [0, seed % 2 ? -10 : 10], {
    extrapolateRight: 'clamp',
  });

  const bg = src.replace(/\.jpg$/, '_bg.jpg');

  return (
    <AbsoluteFill>
      {/* blurred cover of the same frame, so the band never floats in black */}
      <AbsoluteFill style={{opacity: settle * 0.9}}>
        <Img
          src={staticFile(bg)}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${1.04 + zoom * 0.04})`,
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height: H,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: centre,
            left: (W * (1 - width)) / 2,
            width: W * width,
            transform: `translateY(-50%) scale(${0.985 + settle * 0.015})`,
            opacity: settle,
          }}
        >
          <div style={{position: 'relative', overflow: 'hidden', width: '100%'}}>
            <Img
              src={staticFile(src)}
              style={{
                width: '100%',
                display: 'block',
                transform: `scale(${zoom}) translateX(${slide}px)`,
              }}
            />
            {/* one scan pass on entry */}
            {settle < 1 ? (
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: `${settle * 100}%`,
                  width: '100%',
                  height: 3,
                  background: C.signal,
                  boxShadow: `0 0 34px ${C.signal}`,
                }}
              />
            ) : null}
          </div>

          <div style={{height: 1, background: C.lineStrong, opacity: settle}} />
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: -1,
              width: `${settle * 100}%`,
              height: 1,
              background: C.lineStrong,
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** Full-bleed plate, used only where the source has the resolution for it. */
export const Hero: React.FC<{src: string; dur: number}> = ({src, dur}) => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, 8], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const zoom = interpolate(f, [0, dur], [1.05, 1.16], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: settle}}>
      <Img
        src={staticFile(src)}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${zoom})`,
        }}
      />
    </AbsoluteFill>
  );
};

/** A void shot is not flat black — the out-of-focus gallery keeps it alive. */
export const Void: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const drift = interpolate(f, [0, dur], [0, -26], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: settle * 0.22, overflow: 'hidden'}}>
      <Img
        src={staticFile('theory_bg.jpg')}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(1.12) translateY(${drift}px)`,
          filter: 'grayscale(1) sepia(0.12) brightness(0.5) contrast(1.05) blur(5px)',
        }}
      />
    </AbsoluteFill>
  );
};

/** Two-frame lift on every cut. Punctuation, not a glitch effect. */
export const CutFlash: React.FC<{at: number[]}> = ({at}) => {
  const f = useCurrentFrame();
  if (!at.some((x) => f >= x && f < x + 2)) return null;
  return (
    <AbsoluteFill
      style={{background: 'rgba(232,227,219,0.06)', mixBlendMode: 'screen'}}
    />
  );
};

/** Shot index in the corner — quiet evidence that this is a catalogued file. */
export const ShotMark: React.FC<{index: number; total: number}> = ({index, total}) => (
  <div
    style={{
      position: 'absolute',
      right: 70,
      top: 300,
      fontFamily: F.mono,
      fontSize: 17,
      letterSpacing: '0.2em',
      color: C.textMuted,
    }}
  >
    {String(index).padStart(2, '0')} / {String(total).padStart(2, '0')}
  </div>
);

/**
 * A full-bleed video cut-in. Used once, on the last line: after forty seconds
 * of stills being argued over, the only answer to "is she still here" is
 * footage of her being here, so the film ends on motion rather than a plate.
 */
export const Clip: React.FC<{src: string; dur: number; start?: number}> = ({
  src, dur, start = 0,
}) => {
  const f = useCurrentFrame();
  const settle = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const zoom = interpolate(f, [0, dur], [1.02, 1.07], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity: settle}}>
      <OffthreadVideo
        src={staticFile(src)}
        startFrom={start}
        muted
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${zoom})`,
        }}
      />
    </AbsoluteFill>
  );
};
