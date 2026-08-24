import React from 'react';
import {
  AbsoluteFill, Audio, Easing, OffthreadVideo, Sequence,
  interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

import {C, EASE_SIGNAL, FPS, H, W} from './theme';
import {Chrome, Ground} from './ui';
import {Line, ReadProgress, Subtitles, buildChunks} from './Subtitles';
import {
  BigText, BrandEnd, Card, Dossier, Genome, RedactBar, Reticle, Row, Stamp, TagLine,
} from './elements';

loadBarlow('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
loadMono('normal', {weights: ['400', '500'], subsets: ['latin']});

export type Timing = {lang: string; total_duration: number; lines: Line[]};
export type Beat = {
  at: string; lead: number; dur: number; type: string;
  text?: string; src?: string; label?: string; pos?: 'left' | 'right';
  index?: number; accent?: boolean; strike?: boolean; muted?: boolean;
  coords?: string; redact?: string; agency?: string; title?: string;
  date?: string; compact?: boolean;
};

export const TAIL_SECONDS = 2.6;
export const CAPTION_BASELINE = 1452;

export const totalFrames = (t: Timing) =>
  Math.ceil((t.total_duration + TAIL_SECONDS) * FPS);

/** Union of the frame ranges where any element is on screen. */
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

/** Dark gradient behind the graphics zone so overlays read on any frame. */
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
        'linear-gradient(to bottom, rgba(7,6,5,0.94) 0%, rgba(7,6,5,0.86) 34%, rgba(7,6,5,0.52) 58%, rgba(7,6,5,0) 76%)',
    }} />
  );
};

/** The presenter plate: rig-animated selfie plus a little camera drift. */
const Presenter: React.FC<{dim: number}> = ({dim}) => {
  const f = useCurrentFrame();
  const sway = Math.sin(f / 47) * 9 + Math.sin(f / 19) * 3;
  const rise = Math.cos(f / 61) * 7;
  const zoom = interpolate(f, [0, 1900], [1.0, 1.055], {extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{overflow: 'hidden', backgroundColor: C.bg}}>
      <OffthreadVideo
        src={staticFile('presenter_talk.mp4')}
        muted
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: `scale(${zoom}) translate(${sway}px, ${rise}px)`,
          filter: `saturate(0.86) contrast(1.07) brightness(${0.94 - dim * 0.72})`,
        }}
      />
      <AbsoluteFill style={{
        background:
          'radial-gradient(96% 58% at 50% 42%, rgba(0,0,0,0) 40%, rgba(0,0,0,0.66) 100%)',
      }} />
      <AbsoluteFill style={{
        background:
          'linear-gradient(to top, rgba(7,6,5,0.90) 0%, rgba(7,6,5,0.46) 16%, rgba(7,6,5,0) 34%)',
      }} />
    </AbsoluteFill>
  );
};

const renderBeat = (b: Beat, dur: number, key: string) => {
  switch (b.type) {
    case 'tag':
      return <TagLine key={key} text={b.text!} dur={dur} muted={b.muted} />;
    case 'card':
      return <Card key={key} src={b.src!} label={b.label!} pos={b.pos ?? 'right'} dur={dur} />;
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
  timing: Timing; beats: {beats: Beat[]}; audio: string;
}> = ({timing, beats, audio}) => {
  const byId = Object.fromEntries(timing.lines.map((l) => [l.id, l]));
  const fr = (s: number) => Math.round(s * FPS);
  const total = totalFrames(timing);

  const placed = beats.beats
    .filter((b) => byId[b.at])
    .map((b, i) => {
      const from = fr(byId[b.at].start + b.lead);
      const dur = Math.max(6, fr(b.dur));
      return {b, from, dur, key: `${b.at}-${b.type}-${i}`};
    });

  const scrims = merge(placed.map((p) => [p.from, p.from + p.dur] as [number, number]));

  const brandFrom = fr(byId.L21.start);
  const brandDur = total - brandFrom;

  const frame = useCurrentFrame();
  const dim = interpolate(frame, [brandFrom - 6, brandFrom + 14], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  return (
    <AbsoluteFill style={{backgroundColor: C.bg}}>
      <Presenter dim={dim} />

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

      <Sequence from={brandFrom} durationInFrames={brandDur}>
        <BrandEnd dur={brandDur} />
      </Sequence>

      <AbsoluteFill style={{opacity: 1 - dim}}>
        <Ground grainOnly />
        <Chrome />
        <ReadProgress total={total} />
        <Subtitles chunks={buildChunks(timing.lines)} baseline={CAPTION_BASELINE} />
      </AbsoluteFill>

      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
