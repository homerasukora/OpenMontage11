import React from 'react';
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import {C, EASE_SIGNAL, F, FPS, H, SAFE, W, rnd} from '../theme';
import {useCopy, useDisplayScale, useHookGap} from '../copy';
import {Display, Redaction, SignalRule, Tag} from '../ui';

const stage: React.CSSProperties = {
  position: 'absolute',
  left: SAFE.left,
  width: SAFE.right - SAFE.left,
  top: SAFE.stageTop,
  height: SAFE.stageBottom - SAFE.stageTop,
};

const ease = (f: number, a: number, b: number) =>
  interpolate(f, [a, b], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.bezier(...EASE_SIGNAL),
  });

/* ================================================================== *
 * 01 · HOOK — 16 days
 * ================================================================== */

export const SceneHook: React.FC = () => {
  const f = useCurrentFrame();
  const push = interpolate(f, [0, 130], [1, 1.055], {extrapolateRight: 'clamp'});
  const t = useCopy();
  const ds = useDisplayScale();
  const hookGap = useHookGap();

  return (
    <AbsoluteFill>
      <div
        style={{
          ...stage,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${push})`,
        }}
      >
        <Tag delay={2} style={{marginBottom: 26, letterSpacing: '0.3em'}}>
          {t.hookTag}
        </Tag>

        <Display size={430} delay={5} align="center" lineHeight={0.8}>
          16
        </Display>

        <div style={{display: 'flex', alignItems: 'baseline', gap: 22, marginTop: hookGap}}>
          <Display size={104 * ds} delay={11} align="center" color={C.textSoft}>
            {t.hookUnit}
          </Display>
          <Display size={104 * ds} delay={14} align="center">
            {t.hookAfter}
          </Display>
        </div>

        <SignalRule width={340} delay={20} dur={16} style={{marginTop: 34}} />

        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            opacity: ease(f, 26, 38),
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 22,
              letterSpacing: '0.2em',
              color: C.textMuted,
            }}
          >
            {t.hookSuspect}
          </span>
          <Redaction width={300} height={34} delay={32} bracket />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 02 · DOSSIER — the document
 * ================================================================== */

export const SceneDossier: React.FC = () => {
  const f = useCurrentFrame();
  const bars = [
    {w: 0.92, d: 34},
    {w: 0.71, d: 39},
    {w: 0.86, d: 44},
    {w: 0.55, d: 49},
    {w: 0.79, d: 54},
    {w: 0.63, d: 59},
  ];
  const cardW = SAFE.right - SAFE.left;
  const stampIn = ease(f, 96, 110);

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{opacity: 0.42}}>
        <Img
          src={staticFile('wall-officials.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) sepia(0.1) contrast(1.1) brightness(0.5) blur(3px)',
          }}
        />
      </AbsoluteFill>

      <div style={stage}>
        <div
          style={{
            border: `1px solid ${C.line}`,
            background: 'rgba(17,16,14,0.86)',
            padding: '34px 38px 42px',
            opacity: ease(f, 0, 10),
            transform: `translateY(${(1 - ease(f, 0, 12)) * 22}px)`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}
          >
            <Tag color={C.textMuted} delay={3}>
              U.S. DEFENSE INTELLIGENCE AGENCY
            </Tag>
            <Tag color={C.signal} delay={6}>
              27 MAR 2020
            </Tag>
          </div>

          <div style={{height: 1, background: C.line, margin: '20px 0 26px'}} />

          <Display size={104} delay={12} lineHeight={0.86}>
            Authoritative
            <br />
            Assessment
          </Display>

          <div style={{marginTop: 34, display: 'flex', flexDirection: 'column', gap: 16}}>
            {bars.map((b, i) => (
              <Redaction
                key={i}
                width={(cardW - 76) * b.w}
                height={26}
                delay={b.d}
                dur={7}
              />
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 46,
            display: 'flex',
            justifyContent: 'center',
            opacity: stampIn,
            transform: `rotate(-3.5deg) scale(${0.86 + stampIn * 0.14})`,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 27,
              letterSpacing: '0.16em',
              color: C.signal,
              border: `2px solid ${C.signal}`,
              padding: '12px 22px',
            }}
          >
            INTERNAL DISTRIBUTION ONLY
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 03 · TARGET — one lab
 * ================================================================== */

export const SceneTarget: React.FC = () => {
  const f = useCurrentFrame();
  const grow = ease(f, 4, 26);
  const pulse = 0.55 + 0.45 * Math.sin(f / 5);
  const cx = (SAFE.right - SAFE.left) / 2;
  const cy = (SAFE.stageBottom - SAFE.stageTop) / 2 - 40;
  const t = useCopy();
  const ds = useDisplayScale();

  return (
    <AbsoluteFill>
      <div style={stage}>
        <svg width={SAFE.right - SAFE.left} height={SAFE.stageBottom - SAFE.stageTop}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * 118 + 20}
              x2={SAFE.right - SAFE.left}
              y2={i * 118 + 20}
              stroke="rgba(232,227,219,0.05)"
            />
          ))}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line
              key={`v${i}`}
              x1={i * 118 + 12}
              y1={0}
              x2={i * 118 + 12}
              y2={SAFE.stageBottom - SAFE.stageTop}
              stroke="rgba(232,227,219,0.05)"
            />
          ))}

          <circle
            cx={cx}
            cy={cy}
            r={168 * grow}
            fill="none"
            stroke={C.signalLine}
            strokeWidth={1.5}
            strokeDasharray="6 12"
          />
          <circle cx={cx} cy={cy} r={72 * grow} fill="none" stroke={C.signalLine} />
          <line x1={cx - 250} y1={cy} x2={cx - 96} y2={cy} stroke={C.signalLine} />
          <line x1={cx + 96} y1={cy} x2={cx + 250} y2={cy} stroke={C.signalLine} />
          <line x1={cx} y1={cy - 250} x2={cx} y2={cy - 96} stroke={C.signalLine} />
          <line x1={cx} y1={cy + 96} x2={cx} y2={cy + 250} stroke={C.signalLine} />
          <circle cx={cx} cy={cy} r={11} fill={C.signal} opacity={pulse} />
        </svg>

        <div
          style={{
            position: 'absolute',
            top: cy - 250,
            left: 0,
            opacity: ease(f, 14, 26),
          }}
        >
          <Tag color={C.textMuted}>30.5428° N / 114.3428° E</Tag>
        </div>

        <div
          style={{
            position: 'absolute',
            top: cy + 230,
            left: 0,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}
        >
          <Display size={92 * ds} delay={22} align="center">
            {t.targetLead}
          </Display>
          <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
            <span
              style={{
                fontFamily: F.mono,
                fontSize: 21,
                letterSpacing: '0.2em',
                color: C.textMuted,
                opacity: ease(f, 34, 44),
              }}
            >
              {t.targetResearcher}
            </span>
            <Redaction width={210} height={28} delay={38} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 04 · FACTS — three quiet facts
 * ================================================================== */

export const SceneFacts: React.FC<{marks: number[]}> = ({marks}) => {
  const f = useCurrentFrame();
  const t = useCopy();
  const ds = useDisplayScale();
  const rows = t.facts;

  return (
    <AbsoluteFill>
      <div
        style={{
          ...stage,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 8,
        }}
      >
        <Tag delay={0} style={{marginBottom: 34}}>
          {t.factsTag}
        </Tag>

        {rows.map((r, i) => {
          const d = marks[i] ?? i * 26;
          const p = ease(f, d, d + 13);
          return (
            <div key={r} style={{opacity: p}}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 26,
                  transform: `translateX(${(1 - p) * 26}px)`,
                }}
              >
                <span
                  style={{
                    fontFamily: F.mono,
                    fontSize: 25,
                    letterSpacing: '0.16em',
                    color: C.signal,
                    paddingTop: 22,
                    minWidth: 62,
                  }}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <Display size={78 * ds} delay={d} lineHeight={0.94}>
                  {r}
                </Display>
              </div>
              <div
                style={{
                  height: 1,
                  background: C.line,
                  margin: '20px 0 22px',
                  width: `${p * 100}%`,
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 05 · GENOME — the readout
 * ================================================================== */

const BASES = 'ACGT';

export const SceneGenome: React.FC<{verdictAt: number}> = ({verdictAt}) => {
  const f = useCurrentFrame();
  const rows = 9;
  const cols = 34;
  const scroll = (f * 2.6) % 44;
  const verdict = ease(f, verdictAt, verdictAt + 12);
  const scanX = interpolate(f % 46, [0, 46], [-0.15, 1.15]);
  const t = useCopy();
  const ds = useDisplayScale();

  return (
    <AbsoluteFill>
      <div style={{...stage, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Tag delay={0}>NCMI · GENOMIC ASSESSMENT · JUN 2020</Tag>

        <div
          style={{
            position: 'relative',
            marginTop: 30,
            height: rows * 44,
            overflow: 'hidden',
            border: `1px solid ${C.line}`,
            background: 'rgba(9,8,6,0.6)',
            opacity: 1 - verdict * 0.55,
          }}
        >
          <div style={{transform: `translateY(${-scroll}px)`}}>
            {Array.from({length: rows + 2}).map((_, r) => (
              <div
                key={r}
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: '0 16px',
                  height: 44,
                  alignItems: 'center',
                  fontFamily: F.mono,
                  fontSize: 25,
                  letterSpacing: '0.06em',
                  color: r % 3 === 1 ? C.textSoft : C.textMuted,
                  opacity: 0.85,
                }}
              >
                {Array.from({length: cols}).map((__, c) => {
                  const hot = Math.abs(c / cols - scanX) < 0.05;
                  return (
                    <span key={c} style={{color: hot ? C.signal : undefined}}>
                      {BASES[Math.floor(rnd(r * 97 + c * 13 + 7) * 4)]}
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: `${scanX * 100}%`,
              width: 3,
              height: '100%',
              background: C.signal,
              boxShadow: `0 0 26px ${C.signal}`,
              opacity: 0.8,
            }}
          />
        </div>

        <div style={{marginTop: 44, opacity: verdict}}>
          <Display size={132 * ds} delay={verdictAt} lineHeight={0.86}>
            {t.verdict}
          </Display>
          <SignalRule width={SAFE.right - SAFE.left} delay={verdictAt + 6} dur={14} />
          <div style={{marginTop: 20}}>
            <Tag color={C.textMuted} delay={verdictAt + 10}>
              {t.verdictSub}
            </Tag>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 06 · SEAT — the briefing nobody heard
 * ================================================================== */

export const SceneSeat: React.FC<{wipeAt: number; dur: number}> = ({wipeAt, dur}) => {
  const f = useCurrentFrame();
  const zoom = interpolate(f, [0, dur], [1.02, 1.15], {extrapolateRight: 'clamp'});
  const t = useCopy();
  const ds = useDisplayScale();

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{overflow: 'hidden'}}>
        <Img
          src={staticFile('seat-916.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            filter: 'grayscale(1) sepia(0.08) contrast(1.22) brightness(0.72)',
          }}
        />
      </AbsoluteFill>

      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to bottom, rgba(9,8,6,0.97) 0%, rgba(9,8,6,0.60) 17%, rgba(9,8,6,0.10) 34%, rgba(9,8,6,0.42) 66%, rgba(9,8,6,0.98) 84%)',
        }}
      />

      <div style={{position: 'absolute', left: SAFE.left, top: 268}}>
        <Tag delay={4}>{t.seatTag}</Tag>
        <div style={{marginTop: 14}}>
          <Display size={84 * ds} delay={8} lineHeight={0.9}>
            {t.seatLine[0]}
            <br />
            {t.seatLine[1]}
          </Display>
        </div>
      </div>

      <div style={{position: 'absolute', left: SAFE.left, top: 1112}}>
        <Redaction
          width={SAFE.right - SAFE.left}
          height={42}
          delay={wipeAt}
          dur={14}
          bracket
        />
        <div style={{marginTop: 22}}>
          <Tag color={C.textMuted} delay={wipeAt + 12}>
            {t.seatSource}
          </Tag>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 07 · HONESTY — the self-aware beat
 * ================================================================== */

export const SceneHonesty: React.FC<{mascotAt: number}> = ({mascotAt}) => {
  const f = useCurrentFrame();
  const strike = ease(f, 16, 34);
  const mp = ease(f, mascotAt, mascotAt + 18);
  const bob = Math.sin((f - mascotAt) / 9) * 7;
  const t = useCopy();
  const ds = useDisplayScale();

  return (
    <AbsoluteFill>
      <div style={{...stage, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
        <Tag color={C.textMuted} delay={0}>
          {t.honestTag}
        </Tag>

        <div style={{position: 'relative', marginTop: 18, alignSelf: 'flex-start'}}>
          <Display size={122 * ds} delay={4} color={C.textSoft} lineHeight={0.88}>
            {t.honestHead[0]}
            <br />
            {t.honestHead[1]}
          </Display>
          <div
            style={{
              position: 'absolute',
              top: '52%',
              left: -10,
              width: `${strike * 104}%`,
              height: 4,
              background: C.signal,
              opacity: 0.9,
            }}
          />
        </div>

        <div style={{height: 1, background: C.line, margin: '34px 0 26px'}} />

        <Tag color={C.textMuted} delay={30}>
          CIA · DOE · FBI · ODNI
        </Tag>

        <div style={{marginTop: 30}}>
          <Display size={64 * ds} delay={38} color={C.textMuted} lineHeight={0.98}>
            {t.honestSub[0]}
            <br />
            {t.honestSub[1]}
          </Display>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          right: 148,
          top: 944,
          width: 232,
          opacity: mp,
          transform: `translateY(${(1 - mp) * 130 + bob}px)`,
        }}
      >
        <Img src={staticFile('mascot-plate.png')} style={{width: '100%'}} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 08 · DRAWER — six years in a drawer
 * ================================================================== */

export const SceneDrawer: React.FC = () => {
  const f = useCurrentFrame();
  const open = ease(f, 22, 48);
  const stamp = ease(f, 58, 70);
  const t = useCopy();
  const ds = useDisplayScale();

  return (
    <AbsoluteFill>
      <div
        style={{
          ...stage,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Display size={182 * ds} delay={0} align="center" lineHeight={0.84}>
          {t.drawerHead}
        </Display>
        <Tag color={C.textMuted} delay={10} style={{marginTop: 14, letterSpacing: '0.3em'}}>
          {t.drawerTag}
        </Tag>

        <div style={{position: 'relative', width: 540, height: 236, marginTop: 54}}>
          {/* cabinet face */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              border: `1px solid ${C.lineStrong}`,
              background: C.bgElevated,
            }}
          />
          {/* tray sliding out toward the viewer */}
          <div
            style={{
              position: 'absolute',
              left: 22,
              right: 22,
              top: 22 + open * 92,
              height: 176,
              border: `1px solid ${C.line}`,
              background: C.surface,
              boxShadow: '0 26px 64px rgba(0,0,0,0.85)',
            }}
          >
            {[0.84, 0.62, 0.74].map((w, i) => (
              <div
                key={i}
                style={{
                  height: 18,
                  margin: i === 0 ? '26px 28px 0' : '16px 28px 0',
                  width: `calc(${w * 100}% - 56px)`,
                  background: '#000',
                  opacity: open,
                }}
              />
            ))}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: -3,
                width: 88,
                height: 3,
                background: C.signal,
                transform: 'translateX(-50%)',
                opacity: open,
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: 128,
            opacity: stamp,
            transform: `rotate(-4deg) scale(${0.9 + stamp * 0.1})`,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 30,
              letterSpacing: '0.16em',
              color: C.signal,
              border: `2px solid ${C.signal}`,
              padding: '13px 24px',
            }}
          >
            RELEASED 2026
          </span>
        </div>

        <Tag color={C.textMuted} delay={76} style={{marginTop: 26}}>
          {t.drawerSource}
        </Tag>
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 09 · QUESTION — the landing
 * ================================================================== */

export const SceneQuestion: React.FC<{secondAt: number}> = ({secondAt}) => {
  const f = useCurrentFrame();
  const t = useCopy();
  const ds = useDisplayScale();
  return (
    <AbsoluteFill>
      <div
        style={{
          ...stage,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Display size={78 * ds} delay={2} color={C.textMuted} lineHeight={0.96}>
          {t.questionA[0]}
          <br />
          {t.questionA[1]}
        </Display>

        <div style={{height: 1, background: C.line, margin: '52px 0' }} />

        <Display size={132 * ds} delay={secondAt} lineHeight={0.86}>
          {t.questionB[0]}
          <br />
          {t.questionB[1]}
          <span style={{color: C.signal}}>{t.questionKey}</span>
        </Display>

        <SignalRule width={260} delay={secondAt + 16} dur={18} style={{marginTop: 40}} />
      </div>
    </AbsoluteFill>
  );
};

/* ================================================================== *
 * 10 · BRAND — the anchor
 * ================================================================== */

export const SceneBrand: React.FC<{dur: number}> = ({dur}) => {
  const f = useCurrentFrame();
  const y = ease(f, 0, 18);
  const mascot = ease(f, 12, 32);
  const bob = Math.sin(f / 11) * 8;
  const tail = ease(f, 40, 56);
  const drift = interpolate(f, [0, dur], [0, -14], {extrapolateRight: 'clamp'});
  const t = useCopy();
  const ds = useDisplayScale();

  return (
    <AbsoluteFill>
      {/* the boardroom returns, out of focus — the ending answers the seat */}
      <AbsoluteFill style={{opacity: 0.5}}>
        <Img
          src={staticFile('seat-916.png')}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.14)',
            filter: 'grayscale(1) sepia(0.1) contrast(1.1) brightness(0.34) blur(11px)',
          }}
        />
      </AbsoluteFill>

      <div
        style={{
          ...stage,
          top: SAFE.stageTop - 40,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          transform: `translateY(${drift}px)`,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -152,
              left: '50%',
              width: 250,
              transform: `translateX(-206px) translateY(${(1 - mascot) * 60 + bob}px)`,
              opacity: mascot,
            }}
          >
            <Img src={staticFile('mascot-plate.png')} style={{width: '100%'}} />
          </div>

          <div
            style={{
              fontFamily: F.display,
              fontWeight: 800,
              fontSize: 352,
              lineHeight: 0.8,
              letterSpacing: '-0.03em',
              color: C.text,
              opacity: y,
              transform: `translateY(${(1 - y) * 30}px)`,
            }}
          >
            2027
          </div>
        </div>

        <SignalRule width={430} delay={22} dur={18} style={{marginTop: 34}} />

        <div style={{marginTop: 30}}>
          <Display size={82 * ds} delay={26} align="center">
            {t.brandLine}
          </Display>
        </div>

        <div
          style={{
            marginTop: 58,
            opacity: tail,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 30,
              letterSpacing: '0.22em',
              color: C.signal,
            }}
          >
            @VIRUS2027
          </span>
          <span
            style={{
              fontFamily: F.mono,
              fontSize: 21,
              letterSpacing: '0.24em',
              color: C.textMuted,
            }}
          >
            {t.brandCta}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
