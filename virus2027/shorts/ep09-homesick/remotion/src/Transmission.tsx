import React from 'react';
import {
  AbsoluteFill, Audio, Easing, Sequence, interpolate, staticFile, useCurrentFrame,
} from 'remotion';
import {useBrandFonts} from './fonts';
import {C, EASE_SIGNAL, FPS} from './theme';
import {Ground} from './ui';
import {Line, Subtitles, buildChunks} from './Subtitles';
import {Band, Clip, CutFlash, Hero, Shot, Void} from './Shots';
import {Pano, PanoMove} from './Pano';
import {BrandEnd, Row} from './elements';
import {
  AlienMark, BodyScan, Brackets, Constellation, CropMarks, Descent, Figure,
  Flag, Flatline, Helix, HomeGlyph, LocationTag, MascotBeat, NodeField,
  PlaybackBar, PulsarMap, PulseRings, Reticle, Rewind, Scrim, SeedTrail,
  Spine, SupplyBar, TreeOfLife, WordPlate,
} from './Viz';

export type Timing = {lang: string; total_duration: number; lines: Line[]};
export type Beat = {
  at: string; lead: number; dur: number; type: string;
  text?: string; index?: number; y?: number;
  kind?: string; cx?: number; cy?: number; count?: number;
  period?: number; max?: number;
  top?: number; bottom?: number; x?: number; width?: number; flip?: boolean;
  card?: boolean; value?: number; label?: string; prefix?: string; suffix?: string;
  src?: string; size?: number; amp?: number;
  /**
   * Word anchor. When present the beat starts at that word's own start time
   * (plus `lead`) instead of at the start of its line. `nth` picks the nth
   * occurrence of a repeated word. Matching ignores case and punctuation.
   * A word that is not in the line is a hard error: after a script rewrite a
   * silent fallback to the line start would put the visual on the wrong
   * syllable and nobody would notice until the export.
   */
  word?: string; nth?: number;
  strike?: boolean; inward?: boolean; plain?: boolean; opacity?: number;
  sub?: string; scale?: number; at2?: number;
};

/**
 * No end card in this episode either. The tail runs slightly longer than
 * ep07's because the film closes on a question over a still frame — the
 * beat of silence after it is doing work, and cutting to black on the last
 * syllable would throw it away.
 */
export const TAIL_SECONDS = 1.25;
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
                    period={b.period} max={b.max} inward={b.inward} />
      );
    case 'supply':
      return <SupplyBar key={key} dur={dur} y={b.y} />;
    case 'brackets':
      return <Brackets key={key} dur={dur} top={b.top} bottom={b.bottom} />;
    case 'flag':
      return (
        <Flag key={key} dur={dur} src={b.src!} x={b.x} y={b.y} width={b.width} />
      );
    case 'place':
      return <LocationTag key={key} dur={dur} text={b.text!} y={b.y} />;
    case 'figure':
      return (
        <Figure key={key} dur={dur} value={b.value!} label={b.label!}
                prefix={b.prefix} suffix={b.suffix} y={b.y} plain={b.plain} />
      );
    case 'alien':
      return (
        <AlienMark key={key} dur={dur} cx={b.cx} cy={b.cy} scale={b.scale}
                   strike={b.strike} />
      );
    case 'descent':
      return <Descent key={key} dur={dur} />;
    case 'rewind':
      return <Rewind key={key} dur={dur} y={b.y} label={b.label} />;
    case 'bodyscan':
      return (
        <BodyScan key={key} dur={dur} cx={b.cx} cy={b.cy} w={b.width}
                  h={b.size} label={b.label} />
      );
    case 'spine':
      return <Spine key={key} dur={dur} cx={b.cx} />;
    case 'constellation':
      return <Constellation key={key} dur={dur} />;
    case 'home':
      return <HomeGlyph key={key} dur={dur} cx={b.cx} cy={b.cy} flip={b.flip} />;
    case 'wordplate':
      return (
        <WordPlate key={key} dur={dur} text={b.text!} sub={b.sub} y={b.y} />
      );
    case 'seeds':
      return <SeedTrail key={key} dur={dur} />;
    case 'tree':
      return <TreeOfLife key={key} dur={dur} label={b.label} />;
    case 'scrim':
      return <Scrim key={key} dur={dur} opacity={b.opacity} />;
    case 'pulsarmap':
      return <PulsarMap key={key} dur={dur} cx={b.cx} cy={b.cy} />;
    case 'helix':
      return (
        <Helix key={key} dur={dur} cx={b.cx} top={b.top} bottom={b.bottom}
               amp={b.amp} />
      );
    case 'reticle':
      return (
        <Reticle key={key} dur={dur} cx={b.cx} cy={b.cy} size={b.size}
                 label={b.label} />
      );
    case 'flatline':
      return <Flatline key={key} dur={dur} y={b.y} />;
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
  useBrandFonts();

  const byId = Object.fromEntries(timing.lines.map((l) => [l.id, l]));
  const fr = (s: number) => Math.round(s * FPS);
  const total = totalFrames(timing);

  // An episode may end without a brand card. When it does, the last shot
  // simply runs to the end of the film and nothing is laid over it.
  const ba = beats.brand_at;
  const brandFrom = ba && byId[ba.at] ? fr(byId[ba.at].start + ba.lead) : total;

  const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
  /** Absolute start, in seconds, of a shot or beat. */
  const startOf = (x: {at: string; lead?: number; word?: string; nth?: number}) => {
    const ln = byId[x.at];
    let base = ln.start;
    if (x.word) {
      const hits = ln.words.filter((w) => norm(w.word) === norm(x.word!));
      const hit = hits[(x.nth ?? 1) - 1];
      if (!hit) {
        throw new Error(
          `beat anchored to "${x.word}" (#${x.nth ?? 1}) but ${x.at} has no ` +
          `such word: "${ln.text}"`);
      }
      base = hit.start;
    }
    return base + (x.lead ?? 0);
  };

  // Shots tile: each runs until the next begins, so there is never a gap.
  const shotStarts = beats.shots
    .filter((s) => byId[s.at])
    .map((s) => ({s, from: fr(startOf(s))}))
    .sort((a, b) => a.from - b.from);
  const shots = shotStarts.map((x, i) => ({
    ...x,
    dur: (i + 1 < shotStarts.length ? shotStarts[i + 1].from : brandFrom) - x.from,
  })).filter((x) => x.dur > 0);

  const placed = beats.beats
    .filter((b) => byId[b.at])
    .map((b, i) => ({
      b,
      from: fr(startOf(b)),
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
            <Void dur={x.dur} src={x.s.src} />
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
