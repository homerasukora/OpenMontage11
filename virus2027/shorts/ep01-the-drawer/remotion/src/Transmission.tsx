import React from 'react';
import {AbsoluteFill, Audio, Sequence, staticFile} from 'remotion';
import {loadFont as loadBarlow} from '@remotion/google-fonts/BarlowCondensed';
import {loadFont as loadOswald} from '@remotion/google-fonts/Oswald';
import {loadFont as loadMono} from '@remotion/google-fonts/IBMPlexMono';

import {C, FONT_STACKS, FPS} from './theme';
import {Lang, LangContext} from './copy';
import {Chrome, CutFlash, Ground} from './ui';
import {Line, ReadProgress, Subtitles, buildChunks} from './Subtitles';
import {
  SceneBrand,
  SceneDossier,
  SceneDrawer,
  SceneFacts,
  SceneGenome,
  SceneHonesty,
  SceneHook,
  SceneQuestion,
  SceneSeat,
  SceneTarget,
} from './scenes';

loadBarlow('normal', {weights: ['600', '700', '800'], subsets: ['latin']});
loadOswald('normal', {weights: ['500', '600', '700'], subsets: ['latin', 'cyrillic']});
loadMono('normal', {weights: ['400', '500'], subsets: ['latin', 'cyrillic']});

export type Timing = {lang: string; total_duration: number; lines: Line[]};

export const TAIL_SECONDS = 2.8;

export const totalFrames = (t: Timing) =>
  Math.ceil((t.total_duration + TAIL_SECONDS) * FPS);

/** Scene cut points, expressed as the line each scene opens on. */
const CUTS = [
  'L01', // hook
  'L02', // dossier
  'L05', // target
  'L06', // three facts
  'L09', // genome
  'L11', // the empty seat
  'L13', // honesty
  'L15', // the drawer
  'L16', // the question
  'L18', // brand
] as const;

export const Transmission: React.FC<{timing: Timing; audio: string}> = ({
  timing,
  audio,
}) => {
  const byId = Object.fromEntries(timing.lines.map((l) => [l.id, l]));
  const at = (id: string) => byId[id].start;
  const fr = (s: number) => Math.round(s * FPS);

  const total = totalFrames(timing);
  const bounds = CUTS.map((id, i) => {
    const from = fr(at(id));
    const to = i === CUTS.length - 1 ? total : fr(at(CUTS[i + 1]));
    return {id, from, len: Math.max(1, to - from)};
  });
  const B = Object.fromEntries(bounds.map((b) => [b.id, b]));

  const rel = (target: string, base: string) => fr(at(target) - at(base));
  const chunks = buildChunks(timing.lines);
  const lang: Lang = timing.lang === 'ru' ? 'ru' : 'en';
  const stack = FONT_STACKS[lang];

  return (
    <LangContext.Provider value={lang}>
    <AbsoluteFill
      style={
        {
          backgroundColor: C.bg,
          '--v27-display': stack.display,
          '--v27-mono': stack.mono,
        } as React.CSSProperties
      }
    >
      <Ground />

      <Sequence from={B.L01.from} durationInFrames={B.L01.len}>
        <SceneHook />
      </Sequence>

      <Sequence from={B.L02.from} durationInFrames={B.L02.len}>
        <SceneDossier />
      </Sequence>

      <Sequence from={B.L05.from} durationInFrames={B.L05.len}>
        <SceneTarget />
      </Sequence>

      <Sequence from={B.L06.from} durationInFrames={B.L06.len}>
        <SceneFacts marks={[0, rel('L07', 'L06'), rel('L08', 'L06')]} />
      </Sequence>

      <Sequence from={B.L09.from} durationInFrames={B.L09.len}>
        <SceneGenome verdictAt={rel('L10', 'L09')} />
      </Sequence>

      <Sequence from={B.L11.from} durationInFrames={B.L11.len}>
        <SceneSeat wipeAt={rel('L12', 'L11')} dur={B.L11.len} />
      </Sequence>

      <Sequence from={B.L13.from} durationInFrames={B.L13.len}>
        <SceneHonesty mascotAt={Math.round(FPS * 1.1)} />
      </Sequence>

      <Sequence from={B.L15.from} durationInFrames={B.L15.len}>
        <SceneDrawer />
      </Sequence>

      <Sequence from={B.L16.from} durationInFrames={B.L16.len}>
        <SceneQuestion secondAt={rel('L17', 'L16')} />
      </Sequence>

      <Sequence from={B.L18.from} durationInFrames={B.L18.len}>
        <SceneBrand dur={B.L18.len} />
      </Sequence>

      <CutFlash at={bounds.slice(1).map((b) => b.from)} />

      <Chrome />
      <ReadProgress total={total} />
      <Subtitles chunks={chunks} />

      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
    </LangContext.Provider>
  );
};
