/**
 * VIRUS2027 motion tokens.
 * Mirrors the web style guide so shorts and site read as one system.
 */

export const C = {
  bg: '#090806',
  bgElevated: '#11100e',
  surface: '#171512',
  text: '#e8e3db',
  textSoft: '#b8b2aa',
  textMuted: '#77726b',
  signal: '#ff531f',
  signalDeep: '#bd3512',
  line: 'rgba(232, 227, 219, 0.14)',
  lineStrong: 'rgba(232, 227, 219, 0.28)',
  signalLine: 'rgba(255, 83, 31, 0.62)',
} as const;

/**
 * Resolved per composition via CSS variables on the root element.
 * Latin uses Barlow Condensed per the web guide; Cyrillic falls back to
 * Oswald, the closest condensed grotesque on Google Fonts with a
 * Cyrillic cut (Barlow Condensed ships latin only).
 */
export const F = {
  display: 'var(--v27-display)',
  mono: 'var(--v27-mono)',
} as const;

export const FONT_STACKS = {
  en: {
    display: '"Barlow Condensed", "Arial Narrow", sans-serif',
    mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
  },
  ru: {
    display: '"Oswald", "PT Sans Narrow", "Arial Narrow", sans-serif',
    mono: '"IBM Plex Mono", "SFMono-Regular", Consolas, monospace',
  },
} as const;

/** 1080x1920 layout budget after TikTok / Reels / Shorts chrome. */
export const SAFE = {
  top: 240,
  bottom: 1580,
  left: 70,
  right: 1010,
  stageTop: 402,
  stageBottom: 1180,
  captionBaseline: 1400,
} as const;

export const FPS = 30;
export const W = 1080;
export const H = 1080;

/** Signal ease from the guide: cubic-bezier(0.22, 1, 0.36, 1). */
export const EASE_SIGNAL = [0.22, 1, 0.36, 1] as const;
export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const sec = (s: number) => Math.round(s * FPS);

/** Deterministic pseudo-random — Math.random() would break Remotion caching. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
};

export const timecode = (frame: number) => {
  const total = Math.floor(frame / FPS);
  const hh = String(Math.floor(total / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  const ff = String(frame % FPS).padStart(2, '0');
  return `${hh}:${mm}:${ss}:${ff}`;
};

/**
 * Condensed display type has no layout pass available at render time, so
 * size is fitted analytically: Barlow Condensed 800 uppercase averages about
 * 0.62 em of advance per character. Overshooting clips at the safe edge,
 * which is the one failure mode a caption can never have.
 */
export const ADVANCE = 0.62;

export const fitSize = (text: string, width: number, max: number, min = 40) =>
  Math.max(min, Math.min(max, width / (Math.max(1, text.length) * ADVANCE)));
