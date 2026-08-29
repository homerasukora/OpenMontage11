import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, EASE_SIGNAL, W} from './theme';
import {BAND_CENTRE} from './Shots';

/** Native aspect of assets/panorama.jpg (1942 x 809). */
export const PANO_ASPECT = 1942 / 809;

/**
 * A camera that pans and zooms across the brand gallery panorama.
 *
 * `bw` is the panorama's rendered width in frame pixels, so it doubles as the
 * zoom control: bw = 1080 shows the whole gallery, bw = 3600 is a tight look
 * at one painting. `x` is the normalised point of the panorama (0 = far left,
 * 1 = far right) parked at the centre of the frame.
 *
 * Anchors in this artwork: Vira 0.165, the 2027 frame 0.495, Mona Lisa 0.845.
 *
 * The source is only 1942 px wide, so bw is kept at or under ~3900 — past
 * that the upscale starts to show, and the film would rather move than
 * magnify.
 */
export type PanoMove = {
  x0: number; x1: number; bw0: number; bw1: number; centre?: number;
};

export const Pano: React.FC<PanoMove & {dur: number}> = ({
  x0, x1, bw0, bw1, dur, centre = BAND_CENTRE,
}) => {
  const f = useCurrentFrame();

  const settle = interpolate(f, [0, 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  // ease the move itself so a travel starts and lands softly
  const t = interpolate(f, [0, Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.36, 0, 0.28, 1),
  });

  const bw = bw0 + (bw1 - bw0) * t;
  const x = x0 + (x1 - x0) * t;
  const bh = bw / PANO_ASPECT;

  const left = W / 2 - x * bw;
  const top = centre - bh / 2;
  const framed = bh < 1830;   // small enough to read as a plate on the ground

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: settle * 0.92}}>
        <Img
          src={staticFile('panorama_bg.jpg')}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: `scale(${1.05 + t * 0.05})`,
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill style={{overflow: 'hidden', opacity: settle}}>
        <div style={{position: 'absolute', left, top, width: bw, height: bh}}>
          <Img
            src={staticFile('panorama.jpg')}
            style={{width: '100%', height: '100%', display: 'block'}}
          />
        </div>

        {framed ? (
          <>
            <div style={{
              position: 'absolute', left: 0, top: top - 1,
              width: `${settle * 100}%`, height: 1, background: C.lineStrong,
            }} />
            <div style={{
              position: 'absolute', left: 0, top: top + bh,
              width: `${settle * 100}%`, height: 1, background: C.lineStrong,
            }} />
          </>
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
