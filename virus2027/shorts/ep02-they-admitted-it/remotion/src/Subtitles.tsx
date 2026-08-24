import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, EASE_SIGNAL, F, FPS, SAFE, W, fitSize} from './theme';

export type Word = {word: string; start: number; end: number};
export type Line = {
  id: string;
  beat: string;
  text: string;
  start: number;
  end: number;
  dur: number;
  words: Word[];
};

export type Chunk = {words: Word[]; start: number; end: number; text: string};

const MAX_WORDS = 3;
const MAX_CHARS = 20;

/**
 * Split each line into caption chunks. Chunks never cross a line boundary,
 * so a chunk can never straddle a pause in the read.
 */
export const buildChunks = (lines: Line[]): Chunk[] => {
  const out: Chunk[] = [];
  for (const line of lines) {
    let cur: Word[] = [];
    const flush = () => {
      if (!cur.length) return;
      out.push({
        words: cur,
        start: cur[0].start,
        end: cur[cur.length - 1].end,
        text: cur.map((w) => w.word).join(' '),
      });
      cur = [];
    };
    for (const w of line.words) {
      const next = [...cur, w];
      const chars = next.map((x) => x.word).join(' ').length;
      cur = next;
      const breaks = /[.,:;!?—]$/.test(w.word);
      if (breaks || cur.length >= MAX_WORDS || chars >= MAX_CHARS) flush();
    }
    flush();
  }
  return out;
};

/** Drop wrapping quotes but never the apostrophe inside a contraction. */
const strip = (s: string) => s.replace(/[«»"“”]/g, '').replace(/’/g, "'");

/** Burned-in karaoke captions: chunk in view, active word in signal orange. */
export const Subtitles: React.FC<{chunks: Chunk[]; baseline?: number}> = ({
  chunks,
  baseline = SAFE.captionBaseline,
}) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;

  const idx = chunks.findIndex((c) => t >= c.start - 0.06 && t < c.end + 0.14);
  if (idx === -1) return null;
  const chunk = chunks[idx];

  const inP = interpolate(t, [chunk.start - 0.06, chunk.start + 0.08], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  // fit to the safe width so a caption can never run off the frame
  const size = fitSize(chunk.text, (SAFE.right - SAFE.left) - 40, 94, 46);

  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        width: SAFE.right - SAFE.left,
        top: baseline - 120,
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontFamily: F.display,
          fontWeight: 800,
          fontSize: size,
          lineHeight: 0.94,
          letterSpacing: '-0.012em',
          whiteSpace: 'nowrap',
          textTransform: 'uppercase',
          textShadow: '0 4px 26px rgba(0,0,0,0.92), 0 0 2px rgba(0,0,0,0.9)',
          opacity: inP,
          transform: `translateY(${(1 - inP) * 14}px)`,
        }}
      >
        {chunk.words.map((w, i) => {
          const active = t >= w.start - 0.02 && t < w.end;
          return (
            <span
              key={`${w.word}-${i}`}
              style={{
                color: active ? C.signal : C.text,
                marginRight: i === chunk.words.length - 1 ? 0 : '0.26em',
              }}
            >
              {strip(w.word)}
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Thin progress hairline tied to the read — a quiet retention cue. */
export const ReadProgress: React.FC<{total: number}> = ({total}) => {
  const frame = useCurrentFrame();
  const p = Math.min(1, frame / total);
  return (
    <div
      style={{
        position: 'absolute',
        left: SAFE.left,
        top: 1508,
        width: (SAFE.right - SAFE.left) * p,
        height: 2,
        background: C.signal,
        opacity: 0.75,
      }}
    />
  );
};

export const stageWidth = SAFE.right - SAFE.left;
export const frameWidth = W;
