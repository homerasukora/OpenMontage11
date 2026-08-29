import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {C, EASE_SIGNAL, F, FPS, SAFE, W, fitSize, rnd} from './theme';

/* Every element gets the same life curve: a fast signal-eased entrance,
   a hold, and a quicker exit. Passed `dur` in frames. */
export const useLife = (dur: number, inF = 8, outF = 7) => {
  const f = useCurrentFrame();
  const enter = interpolate(f, [0, inF], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const exit = interpolate(f, [dur - outF, dur], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(0.4, 0, 1, 1),
  });
  return {f, p: Math.min(enter, exit), enter};
};

const TAG_Y = 300;      // above a photographic band
const STAMP_Y = 372;
const REDACT_Y = 782;   // across the band
const TOP = 470;        // graphics zone on a void shot
const mono = (size: number): React.CSSProperties => ({
  fontFamily: F.mono, fontSize: size, letterSpacing: '0.2em',
  textTransform: 'uppercase',
});
const display = (size: number): React.CSSProperties => ({
  fontFamily: F.display, fontWeight: 800, fontSize: size,
  lineHeight: 0.88, letterSpacing: '-0.025em', textTransform: 'uppercase',
});

/* ---------------------------------------------------------------- tag */

export const TagLine: React.FC<{
  text: string; dur: number; muted?: boolean; slot?: number; y?: number;
}> = ({text, dur, muted, slot = 0, y}) => {
  const {p, enter} = useLife(dur);
  return (
    <div
      style={{
        position: 'absolute', left: SAFE.left, top: (y ?? TAG_Y) + slot * 46,
        ...mono(23),
        color: muted ? C.textSoft : C.signal,
        opacity: p,
        transform: `translateX(${(1 - enter) * -18}px)`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      <span style={{
        width: 26 * enter, height: 2, background: muted ? C.textSoft : C.signal,
        display: 'inline-block',
      }} />
      {text}
    </div>
  );
};

/* ------------------------------------------------------------- stamp */

export const Stamp: React.FC<{text: string; dur: number}> = ({text, dur}) => {
  const {p, enter} = useLife(dur, 6, 6);
  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: STAMP_Y,
      opacity: p,
      transform: `rotate(-4deg) scale(${0.82 + enter * 0.18})`,
    }}>
      <span style={{
        ...mono(29), letterSpacing: '0.16em', color: C.signal,
        border: `2px solid ${C.signal}`, padding: '13px 22px', display: 'inline-block',
      }}>{text}</span>
    </div>
  );
};

/* ----------------------------------------------------------- bigtext */

export const BigText: React.FC<{
  text: string; dur: number; accent?: boolean; strike?: boolean;
}> = ({text, dur, accent, strike}) => {
  const {f, p, enter} = useLife(dur, 9, 7);
  const words = text.split(' ');
  // headline sets on one line; leave a little more slack than the caption
  const size = fitSize(text, SAFE.right - SAFE.left - 56, 150, 56) * 0.94;
  const strikeP = interpolate(f, [8, 26], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: TOP + 40,
      width: SAFE.right - SAFE.left, opacity: p,
    }}>
      <div style={{overflow: 'hidden'}}>
        <div style={{
          ...display(size),
          color: C.text,
          transform: `translateY(${(1 - enter) * 104}%)`,
          position: 'relative',
          display: 'inline-block',
          whiteSpace: 'nowrap',
        }}>
          {words.map((w, i) => (
            <span key={i} style={{
              color: accent && i === words.length - 1 ? C.signal : C.text,
              marginRight: i === words.length - 1 ? 0 : '0.24em',
            }}>{w}</span>
          ))}
          {strike ? (
            <span style={{
              position: 'absolute', left: -6, top: '54%',
              width: `${strikeP * 104}%`, height: 5, background: C.signal,
            }} />
          ) : null}
        </div>
      </div>
      <div style={{
        height: 3, background: C.signal, marginTop: 22,
        width: `${enter * 62}%`,
      }} />
    </div>
  );
};

/* --------------------------------------------------------------- row */

export const Row: React.FC<{index: number; text: string; dur: number}> = ({
  index, text, dur,
}) => {
  const {p, enter} = useLife(dur, 9, 6);
  const y = TOP + 58 + (index - 1) * 118;
  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: y,
      width: SAFE.right - SAFE.left, opacity: p,
      transform: `translateX(${(1 - enter) * 26}px)`,
    }}>
      <div style={{display: 'flex', alignItems: 'baseline', gap: 22}}>
        <span style={{...mono(24), color: C.signal, minWidth: 54}}>
          {String(index).padStart(2, '0')}
        </span>
        <span style={{
          ...display(fitSize(text, SAFE.right - SAFE.left - 80, 72, 44)),
          color: C.text, whiteSpace: 'nowrap',
        }}>{text}</span>
      </div>
      <div style={{height: 1, background: C.line, marginTop: 20, width: `${enter * 100}%`}} />
    </div>
  );
};

/* ----------------------------------------------------------- reticle */

export const Reticle: React.FC<{coords: string; redact: string; dur: number}> = ({
  coords, redact, dur,
}) => {
  const {f, p, enter} = useLife(dur, 10, 7);
  const cx = W / 2, cy = 800;
  const pulse = 0.5 + 0.5 * Math.sin(f / 4.5);
  return (
    <AbsoluteFill style={{opacity: p}}>
      <svg width={W} height={1920}>
        <circle cx={cx} cy={cy} r={150 * enter} fill="none"
                stroke={C.signal} strokeWidth={2} strokeDasharray="7 13" opacity={0.8} />
        <circle cx={cx} cy={cy} r={62 * enter} fill="none" stroke={C.signal} strokeWidth={2} opacity={0.9} />
        <line x1={cx - 210} y1={cy} x2={cx - 84} y2={cy} stroke={C.signal} strokeWidth={2} opacity={0.85} />
        <line x1={cx + 84} y1={cy} x2={cx + 210} y2={cy} stroke={C.signal} strokeWidth={2} opacity={0.85} />
        <line x1={cx} y1={cy - 210} x2={cx} y2={cy - 84} stroke={C.signal} strokeWidth={2} opacity={0.85} />
        <line x1={cx} y1={cy + 84} x2={cx} y2={cy + 210} stroke={C.signal} strokeWidth={2} opacity={0.85} />
        <circle cx={cx} cy={cy} r={12} fill={C.signal} opacity={pulse} />
      </svg>
      <div style={{position: 'absolute', left: SAFE.left, top: TAG_Y, ...mono(21), color: C.textSoft}}>
        {coords}
      </div>
      <div style={{
        position: 'absolute', left: SAFE.left, top: TAG_Y + 46,
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <span style={{...mono(21), color: C.textMuted}}>{redact}:</span>
        <div style={{
          width: 210 * enter, height: 30, background: '#000',
          boxShadow: 'inset 0 0 0 1px rgba(232,227,219,0.18)',
        }} />
      </div>
    </AbsoluteFill>
  );
};

/* ----------------------------------------------------------- dossier */

export const Dossier: React.FC<{
  agency: string; title: string; date: string; dur: number; compact?: boolean;
}> = ({agency, title, date, dur, compact}) => {
  const {f, p, enter} = useLife(dur, 10, 7);
  const bars = compact ? [0.86, 0.6] : [0.9, 0.68, 0.84, 0.54];
  const cw = SAFE.right - SAFE.left;
  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: TOP,
      width: cw, opacity: p,
      transform: `translateY(${(1 - enter) * 20}px)`,
    }}>
      <div style={{
        border: `1px solid ${C.line}`, background: 'rgba(13,12,10,0.88)',
        padding: '26px 30px 32px',
        boxShadow: '0 26px 80px rgba(0,0,0,0.7)',
      }}>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <span style={{...mono(19), color: C.textMuted}}>{agency}</span>
          <span style={{...mono(19), color: C.signal}}>{date}</span>
        </div>
        <div style={{height: 1, background: C.line, margin: '16px 0 20px'}} />
        <div style={{
          ...display(fitSize(title, SAFE.right - SAFE.left - 70, compact ? 100 : 82, 46)),
          color: C.text, whiteSpace: 'nowrap',
        }}>{title}</div>
        <div style={{marginTop: 24, display: 'flex', flexDirection: 'column', gap: 13}}>
          {bars.map((bw, i) => {
            const w = interpolate(f, [12 + i * 5, 20 + i * 5], [0, bw], {
              extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
              easing: Easing.bezier(...EASE_SIGNAL),
            });
            return <div key={i} style={{
              height: 22, width: `${w * 100}%`, background: '#000',
              boxShadow: 'inset 0 0 0 1px rgba(232,227,219,0.16)',
            }} />;
          })}
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ genome */

const BASES = 'ACGT';

export const Genome: React.FC<{label: string; dur: number}> = ({label, dur}) => {
  const {f, p, enter} = useLife(dur, 9, 7);
  const rows = 7, cols = 30;
  const scroll = (f * 2.4) % 42;
  const scanX = interpolate(f % 44, [0, 44], [-0.12, 1.12]);
  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: TOP,
      width: SAFE.right - SAFE.left, opacity: p,
    }}>
      <div style={{...mono(20), color: C.signal, marginBottom: 16}}>{label}</div>
      <div style={{
        position: 'relative', height: rows * 42, overflow: 'hidden',
        border: `1px solid ${C.line}`, background: 'rgba(9,8,6,0.82)',
      }}>
        <div style={{transform: `translateY(${-scroll}px)`}}>
          {Array.from({length: rows + 2}).map((_, r) => (
            <div key={r} style={{
              display: 'flex', gap: 4, padding: '0 16px', height: 42,
              alignItems: 'center', ...mono(23), letterSpacing: '0.05em',
              color: r % 3 === 1 ? C.textSoft : C.textMuted,
            }}>
              {Array.from({length: cols}).map((__, c) => (
                <span key={c} style={{
                  color: Math.abs(c / cols - scanX) < 0.05 ? C.signal : undefined,
                }}>{BASES[Math.floor(rnd(r * 91 + c * 17 + 5) * 4)]}</span>
              ))}
            </div>
          ))}
        </div>
        <div style={{
          position: 'absolute', top: 0, left: `${scanX * 100}%`, width: 3,
          height: '100%', background: C.signal, boxShadow: `0 0 24px ${C.signal}`,
          opacity: 0.85 * enter,
        }} />
      </div>
    </div>
  );
};

/* ------------------------------------------------------------ redact */

export const RedactBar: React.FC<{label: string; dur: number}> = ({label, dur}) => {
  const {p, enter} = useLife(dur, 12, 7);
  return (
    <div style={{position: 'absolute', left: SAFE.left, top: REDACT_Y, opacity: p}}>
      <div style={{position: 'relative', width: SAFE.right - SAFE.left, height: 46}}>
        <div style={{
          width: (SAFE.right - SAFE.left) * enter, height: 46, background: '#000',
          boxShadow: 'inset 0 0 0 1px rgba(232,227,219,0.2)',
        }} />
        {enter > 0.97 ? (
          <>
            <div style={{position: 'absolute', left: -9, top: -9, width: 18, height: 18,
              borderLeft: `2px solid ${C.signal}`, borderTop: `2px solid ${C.signal}`}} />
            <div style={{position: 'absolute', right: -9, bottom: -9, width: 18, height: 18,
              borderRight: `2px solid ${C.signal}`, borderBottom: `2px solid ${C.signal}`}} />
          </>
        ) : null}
      </div>
      <div style={{...mono(18), color: C.textMuted, marginTop: 18}}>{label}</div>
    </div>
  );
};

/* -------------------------------------------------------- brand card */

export const BrandEnd: React.FC<{dur: number}> = ({dur}) => {
  const {f, p, enter} = useLife(dur, 12, 1);
  const mascot = interpolate(f, [10, 30], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });
  const tail = interpolate(f, [34, 52], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const bob = Math.sin(f / 11) * 8;

  return (
    <AbsoluteFill style={{opacity: p, alignItems: 'center', justifyContent: 'center'}}>
      <div style={{position: 'relative', display: 'flex', justifyContent: 'center'}}>
        <div style={{
          position: 'absolute', top: -150, left: '50%', width: 236,
          transform: `translateX(-196px) translateY(${(1 - mascot) * 56 + bob}px)`,
          opacity: mascot,
        }}>
          <Img src={staticFile('mascot-plate.png')} style={{width: '100%'}} />
        </div>
        <div style={{
          ...display(336), color: C.text, letterSpacing: '-0.03em',
          transform: `translateY(${(1 - enter) * 26}px)`,
        }}>2027</div>
      </div>

      <div style={{height: 3, background: C.signal, width: 420 * enter, marginTop: 32}} />
      <div style={{...display(78), color: C.text, marginTop: 28}}>Not just a date.</div>

      <div style={{
        marginTop: 54, display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 14, opacity: tail,
      }}>
        <span style={{...mono(29), letterSpacing: '0.22em', color: C.signal}}>@VIRUS2027</span>
        <span style={{...mono(20), letterSpacing: '0.24em', color: C.textMuted}}>
          FOLLOW THE SIGNAL
        </span>
        <div style={{height: 1, width: 300, background: C.line, margin: '10px 0 4px'}} />
        <span style={{...mono(17), letterSpacing: '0.16em', color: C.textMuted}}>
          VIRUS-TOKEN.XYZ
        </span>
        <span style={{
          fontFamily: F.mono, fontSize: 15, letterSpacing: '0.03em',
          color: C.textMuted, opacity: 0.85, maxWidth: 760, textAlign: 'center',
          wordBreak: 'break-all', lineHeight: 1.4,
        }}>
          0xcf25d38c0ADCA458aEa8BD57687A2b33A2d84444
        </span>
      </div>
    </AbsoluteFill>
  );
};


/* --------------------------------------------------------------- quote */

/**
 * Two lines of display type for a brand line. Split at the most balanced
 * word break so neither line dominates, then fitted to the safe width.
 */
export const Quote: React.FC<{
  text: string; dur: number; accentWord?: string; y?: number;
}> = ({text, dur, accentWord, y}) => {
  const {p, enter} = useLife(dur, 11, 8);
  let rows: string[];
  if (text.includes('\n')) {
    rows = text.split('\n');
  } else {
    const words = text.split(' ');
    let best = 1, gap = 1e9;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ').length;
      const b = words.slice(i).join(' ').length;
      if (Math.abs(a - b) < gap) {gap = Math.abs(a - b); best = i;}
    }
    rows = [words.slice(0, best).join(' '), words.slice(best).join(' ')];
  }
  const size = fitSize(rows.reduce((a, b) => (a.length > b.length ? a : b)),
                       SAFE.right - SAFE.left - 30, 106, 48);

  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: y ?? TOP + 30,
      width: SAFE.right - SAFE.left, opacity: p,
    }}>
      {rows.map((row, i) => (
        <div key={i} style={{overflow: 'hidden'}}>
          <div style={{
            ...display(size), color: C.text, whiteSpace: 'nowrap',
            transform: `translateY(${(1 - enter) * 104}%)`,
            transitionDelay: `${i * 40}ms`,
          }}>
            {row.split(' ').map((w, j) => (
              <span key={j} style={{
                color: accentWord && w.replace(/[^\w]/g, '') === accentWord ? C.signal : C.text,
                marginRight: '0.24em',
              }}>{w}</span>
            ))}
          </div>
        </div>
      ))}
      <div style={{height: 3, background: C.signal, marginTop: 20, width: `${enter * 46}%`}} />
    </div>
  );
};

/* ------------------------------------------------------------ contract */

/** The one place a hard fact is allowed to be the hero: the address. */
export const Contract: React.FC<{label: string; address: string; dur: number}> = ({
  label, address, dur,
}) => {
  const {p, enter} = useLife(dur, 10, 8);
  return (
    <div style={{
      position: 'absolute', left: SAFE.left, top: TOP + 40,
      width: SAFE.right - SAFE.left, opacity: p,
    }}>
      <div style={{...mono(21), color: C.signal, marginBottom: 18}}>{label}</div>
      <div style={{
        border: `1px solid ${C.lineStrong}`,
        background: 'rgba(13,12,10,0.9)',
        padding: '20px 22px',
        transform: `translateY(${(1 - enter) * 16}px)`,
      }}>
        <span style={{
          fontFamily: F.mono, fontSize: 25, letterSpacing: '0.045em',
          color: C.text, wordBreak: 'break-all', lineHeight: 1.35,
        }}>{address}</span>
      </div>
    </div>
  );
};
