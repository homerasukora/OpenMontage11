import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

import {C, EASE_SIGNAL, FPS} from './theme';
import {Chrome, Ground} from './ui';
import {Line, ReadProgress, Subtitles, buildChunks} from './Subtitles';
import {Band, CutFlash, Hero, Shot, ShotMark, Void} from './Shots';
import {
  BigText, BrandEnd, Dossier, Genome, RedactBar, Reticle, Row, Stamp, TagLine,
} from './elements';

loadBarlow('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});

export type Timing = {lang: string; total_duration: number; lines: Line[]};
export type Beat = {
  at: string; lead: number; dur: number; type: string;
  text?: string; label?: string; index?: number;
  accent?: boolean; strike?: boolean; muted?: boolean;
  coords?: string; redact?: string;
  agency?: string; title?: string; date?: string; compact?: boolean;
};

export const TAIL_SECONDS = 2.0;
export const CAPTION_BASELINE = 1382;

export const totalFrames = (t: Timing) =>
  Math.ceil((t.total_duration + TAIL_SECONDS) * FPS);

/** Dark gradient behind the graphics zone so overlays read on any plate. */
const TopScrim: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 9, dur - 8, dur], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  return (
    <AbsoluteFill style={{
      opacity: o,
      background:
        'linear-gradient(to bottom, rgba(7,6,5,0.90) 0%, rgba(7,6,5,0.72) 26%, rgba(7,6,5,0.30) 46%, rgba(7,6,5,0) 62%)',
    }} />
  );
};

/** Caption bed — keeps the type legible over a bright plate. */
const CaptionScrim: React.FC = () => (
  <AbsoluteFill style={{
    background:
      'linear-gradient(to top, rgba(7,6,5,0.92) 0%, rgba(7,6,5,0.80) 12%, rgba(7,6,5,0.42) 27%, rgba(7,6,5,0) 40%)',
  }} />
);

const merge = (spans: Array<[number, number]>) => {
  const s = [...spans].sort((a, b) => a[0] - b[0]);
  const out: Array<[number, number]> = [];
  for (const [a, b] of s) {
    const last = out[out.length - 1];
    if (last && a <= last[1] + 4) last[1] = Math.max(last[1], b);
    else out.push([a, b]);
  }
  return out;
};

const renderBeat = (b: Beat, dur: number, key: string) => {
  switch (b.type) {
    case 'tag':
      return <TagLine key={key} text={b.text!} dur={dur} muted={b.muted} />;
    case 'stamp':
      return <Stamp key={key} text={b.text!} dur={dur} />;
    case 'bigtext':
      return <BigText key={key} text={b.text!} dur={dur} accent={b.accent} strike={b.strike} />;
    case 'row':
      return <Row key={key} index={b.index!} text={b.text!} dur={dur} />;
    case 'reticle':
      return <Reticle key={key} coords={b.coords!} redact={b.redact!} dur={dur} />;
    case 'dossier':
      return (
        <Dossier key={key} agency={b.agency!} title={b.title!} date={b.date!}
                 dur={dur} compact={b.compact} />
      );
    case 'genome':
      return <Genome key={key} label={b.label!} dur={dur} />;
    case 'redact':
      return <RedactBar key={key} label={b.label!} dur={dur} />;
    default:
      return null;
  }
};

export const Transmission: React.FC<{
  timing: Timing; beats: {shots: Shot[]; beats: Beat[]}; audio: string;
}> = ({timing, beats, audio}) => {
  const byId = Object.fromEntries(timing.lines.map((l) => [l.id, l]));
  const fr = (s: number) => Math.round(s * FPS);
  const total = totalFrames(timing);

  const brandFrom = fr(byId.L17.start);

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

  const scrims = merge(placed.map((p) => [p.from, p.from + p.dur] as [number, number]));

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
          {x.s.type === 'hero' ? (
            <Hero src={x.s.src!} dur={x.dur} />
          ) : x.s.type === 'band' ? (
            <>
              <Band src={x.s.src!} dur={x.dur} seed={i} />
              <ShotMark index={i + 1} total={shots.length} />
            </>
          ) : (
            <Void dur={x.dur} />
          )}
        </Sequence>
      ))}

      {scrims.map(([a, b]) => (
        <Sequence key={`s${a}`} from={a} durationInFrames={b - a}>
          <TopScrim dur={b - a} />
        </Sequence>
      ))}

      {placed.map(({b, from, dur, key}) => (
        <Sequence key={key} from={from} durationInFrames={dur}>
          {renderBeat(b, dur, key)}
        </Sequence>
      ))}

      <CutFlash at={shots.slice(1).map((x) => x.from)} />

      <AbsoluteFill style={{opacity: 1 - brandIn}}>
        <CaptionScrim />
        <Chrome />
        <ReadProgress total={total} />
        <Subtitles chunks={buildChunks(timing.lines)} baseline={CAPTION_BASELINE} />
      </AbsoluteFill>

      <Sequence from={brandFrom} durationInFrames={total - brandFrom}>
        <BrandEnd dur={total - brandFrom} />
      </Sequence>

      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
