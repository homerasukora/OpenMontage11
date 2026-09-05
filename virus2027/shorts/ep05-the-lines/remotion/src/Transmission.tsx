import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

import {C, EASE_SIGNAL, FPS} from './theme';
import {Ground} from './ui';
import {Line, Subtitles, buildChunks} from './Subtitles';
import {Band, Clip, CutFlash, Hero, Shot, Void} from './Shots';
import {Pano, PanoMove} from './Pano';
import {BrandEnd, Row} from './elements';
import {
  Brackets, CropMarks, MascotBeat, NodeField, PlaybackBar, PulseRings,
  SupplyBar, TopMark,
} from './Viz';

loadBarlow('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});

export type Timing = {lang: string; total_duration: number; lines: Line[]};
export type Beat = {
  at: string; lead: number; dur: number; type: string;
  text?: string; index?: number; y?: number;
  kind?: string; cx?: number; cy?: number; count?: number;
  period?: number; max?: number;
  top?: number; bottom?: number; x?: number; width?: number; flip?: boolean;
  card?: boolean;
};

export const TAIL_SECONDS = 1.60;
export const CAPTION_BASELINE = 1382;

export const totalFrames = (t: Timing) =>
  Math.ceil((t.total_duration + TAIL_SECONDS) * FPS);

/**
 * The welcome film carries no chrome and no captions of its own. The only
 * words are the spoken subtitles and, once, the three token facts; everything
 * else added to the frame is geometry and light. Nothing darkens the edges
 * either — the artwork already falls off into black at its own borders.
 */
const renderBeat = (b: Beat, dur: number, key: string) => {
  if (b.type === 'row') {
    return <Row key={key} index={b.index!} text={b.text!} dur={dur} y={b.y} />;
  }
  if (b.type !== 'viz') return null;
  switch (b.kind) {
    case 'nodes':
      return <NodeField key={key} dur={dur} count={b.count} />;
    case 'rings':
      return (
        <PulseRings key={key} dur={dur} cx={b.cx} cy={b.cy}
                    period={b.period} max={b.max} />
      );
    case 'supply':
      return <SupplyBar key={key} dur={dur} y={b.y} />;
    case 'brackets':
      return <Brackets key={key} dur={dur} top={b.top} bottom={b.bottom} />;
    case 'mascot':
      return (
        <MascotBeat key={key} dur={dur} x={b.x} y={b.y}
                    width={b.width} flip={b.flip} card={b.card} />
      );
    default:
      return null;
  }
};

export const Transmission: React.FC<{
  timing: Timing;
  beats: {
    shots: Array<Shot & Partial<PanoMove>>;
    beats: Beat[];
    brand_at?: {at: string; lead: number};
  };
  audio: string;
}> = ({timing, beats, audio}) => {
  const byId = Object.fromEntries(timing.lines.map((l) => [l.id, l]));
  const fr = (s: number) => Math.round(s * FPS);
  const total = totalFrames(timing);

  // An episode may end without a brand card. When it does, the last shot
  // simply runs to the end of the film and nothing is laid over it.
  const ba = beats.brand_at;
  const brandFrom = ba && byId[ba.at] ? fr(byId[ba.at].start + ba.lead) : total;

  // Shots tile: each runs until the next begins, so there is never a gap.
  const shotStarts = beats.shots
    .filter((s) => byId[s.at])
    .map((s) => ({s, from: fr(byId[s.at].start + s.lead)}))
    .sort((a, b) => a.from - b.from);
  const shots = shotStarts.map((x, i) => ({
    ...x,
    dur: (i + 1 < shotStarts.length ? shotStarts[i + 1].from : brandFrom) - x.from,
  })).filter((x) => x.dur > 0);

  const placed = beats.beats
    .filter((b) => byId[b.at])
    .map((b, i) => ({
      b,
      from: fr(byId[b.at].start + b.lead),
      dur: Math.max(6, fr(b.dur)),
      key: `${b.at}-${b.type}-${i}`,
    }));

  const frame = useCurrentFrame();
  const brandIn = interpolate(frame, [brandFrom - 5, brandFrom + 10], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Ground />

      {shots.map((x, i) => (
        <Sequence key={`shot${i}`} from={x.from} durationInFrames={x.dur}>
          {x.s.type === 'pano' ? (
            <Pano
              x0={x.s.x0!} x1={x.s.x1!} bw0={x.s.bw0!} bw1={x.s.bw1!}
              centre={x.s.centre} centre0={x.s.centre0} centre1={x.s.centre1}
              dur={x.dur}
            />
          ) : x.s.type === 'hero' ? (
            <Hero src={x.s.src!} dur={x.dur} />
          ) : x.s.type === 'band' ? (
            <Band src={x.s.src!} dur={x.dur} seed={i} centre={x.s.centre}
                  push={x.s.push} width={x.s.width} />
          ) : x.s.type === 'clip' ? (
            <Clip src={x.s.src!} dur={x.dur} />
          ) : (
            <Void dur={x.dur} />
          )}
        </Sequence>
      ))}

      {placed.map(({b, from, dur, key}) => (
        <Sequence key={key} from={from} durationInFrames={dur}>
          {renderBeat(b, dur, key)}
        </Sequence>
      ))}

      <CutFlash at={shots.slice(1).map((x) => x.from)} />

      <AbsoluteFill style={{opacity: 1 - brandIn}}>
        <CropMarks />
        <TopMark />
        <Subtitles chunks={buildChunks(timing.lines)} baseline={CAPTION_BASELINE} />
        <PlaybackBar total={total} />
      </AbsoluteFill>

      {brandFrom < total ? (
        <Sequence from={brandFrom} durationInFrames={total - brandFrom}>
          <BrandEnd dur={total - brandFrom} />
        </Sequence>
      ) : null}

      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
