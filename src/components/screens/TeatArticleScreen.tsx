import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

// Design is 390px wide; the phone shell is 375px
const UI_SCALE = 375 / 390;

const serif = "'Source Serif 4',Georgia,serif";
const inter = "Inter,sans-serif";

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #DCDACF',
  borderRadius: 24,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  fontFamily: inter,
};

const H2: React.CSSProperties = { margin: 0, fontWeight: 700, fontSize: 26, lineHeight: 1.2 };
const BODY: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 18, fontSize: 19, lineHeight: 1.6 };
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#A3173F' };

const STEPS = [
  ['Pre-dip', 'Dip each teat in 0.5% iodine or chlorhexidine.'],
  ['Wait 30 seconds', 'Give the dip time to work on the skin.'],
  ['Wipe dry', 'One clean, dry cloth or towel per cow.'],
  ['Post-dip barrier', 'After milking, dip again so the open teat canal is sealed.'],
] as const;

const QUIZ = ['10 seconds', '30 seconds', '5 minutes'];
const CORRECT = 1;

const ORDER = [
  { n: '1', label: 'Heifers', bg: '#DDF4EA', ink: '#0F6B50' },
  { n: '2', label: 'Healthy cows', bg: '#FFF2D0', ink: '#7A4E00' },
  { n: '3', label: 'Infected cows', bg: '#FFDDE5', ink: '#A3173F' },
];

export const TeatArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [pick, setPick] = useState<number | undefined>(undefined);
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // Left-edge swipe = back gesture
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const left = e.currentTarget.getBoundingClientRect().left;
    swipe.current = e.clientX - left < 28 ? { x: e.clientX, y: e.clientY } : null;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (s && e.clientX - s.x > 70 && Math.abs(e.clientY - s.y) < 60) onBack();
  };

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };

  // The first step not yet done is the "current" one
  const first = STEPS.findIndex((_, i) => !done[i]);
  const doneCount = Object.values(done).filter(Boolean).length;
  const answered = pick !== undefined;

  return (
    <div className="h-full w-full overflow-hidden" style={{ background: '#FBFAF6' }}>
      <div
        className="flex flex-col overflow-hidden antialiased"
        style={{
          width: `${100 / UI_SCALE}%`,
          height: `${100 / UI_SCALE}%`,
          transform: `scale(${UI_SCALE})`,
          transformOrigin: 'top left',
          background: '#FBFAF6',
          color: '#1A1F1B',
          fontFamily: serif,
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Top bar + progress */}
        <div className="shrink-0" style={{ background: '#FBFAF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 8px 0 8px' }}>
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              style={{ width: 44, height: 44, border: 0, background: 'transparent', color: '#1A1F1B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <div style={{ font: `700 12px ${inter}`, letterSpacing: '0.1em', color: '#123B2C' }}>I-LEARNING</div>
            <button
              type="button"
              aria-label="Save for later"
              aria-pressed={saved}
              onClick={() => setSaved((s) => !s)}
              style={{ width: 44, height: 44, border: 0, background: 'transparent', color: '#1A1F1B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
            </button>
          </div>
          <div style={{ height: 4, background: '#E7E5DA', margin: '6px 0 0' }}>
            <div style={{ width: `${Math.max(3, progress * 100)}%`, height: '100%', background: '#123B2C', transition: 'width 120ms linear' }} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll}>
          {/* Header */}
          <div style={{ padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', font: `700 11px ${inter}`, letterSpacing: '0.1em' }}>
              <span style={{ background: '#FFDDE5', color: '#A3173F', borderRadius: 6, padding: '4px 8px' }}>HYGIENE</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>BETTER MILK</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Clean milk starts at the teat
            </h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              Four steps, thirty seconds of patience, and a lower cell count.
            </div>
          </div>

          {/* Illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#FFDDE5', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <rect x="150" y="20" width="90" height="70" rx="30" fill="#FFFFFF" />
              <g fill="#F4B6C6">
                <rect x="164" y="82" width="16" height="56" rx="8" />
                <rect x="187" y="82" width="16" height="56" rx="8" />
                <rect x="210" y="82" width="16" height="56" rx="8" />
              </g>
              <g fill="#A3173F">
                <rect x="164" y="118" width="16" height="22" rx="8" />
                <rect x="187" y="118" width="16" height="22" rx="8" />
                <rect x="210" y="118" width="16" height="22" rx="8" />
              </g>
            </svg>
          </div>

          {/* Intro copy */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              Mastitis rarely arrives with a bang. It creeps in through the teat end after milking, when the canal is still open and the barn is full of bacteria.
            </p>
            <p style={{ margin: 0 }}>
              The fix in the guide is simple and repeatable. Dip with <strong>0.5% iodine or chlorhexidine</strong>, wait about <strong>30 seconds</strong>, <strong>wipe dry</strong>, and after milking finish with a <strong>barrier dip</strong>.
            </p>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>The routine, one tap at a time</h2>
            <p style={{ margin: 0 }}>Tap each step as you finish it, the way you would at the shed.</p>
          </div>

          {/* Milking-time stepper */}
          <div style={{ ...CARD, margin: '18px 16px 0', padding: 16, gap: 8 }}>
            <div style={{ ...EYEBROW, padding: '2px 2px 4px' }}>TRY IT · MILKING-TIME STEPPER</div>
            {STEPS.map(([name, note], i) => {
              const dn = !!done[i];
              const cur = i === first;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={dn}
                  onClick={() => setDone({ ...done, [i]: !dn })}
                  style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', border: `2px solid ${cur ? '#123B2C' : '#E7E5DA'}`, background: cur ? '#F2F0E6' : '#FFFFFF', borderRadius: 16, padding: 12, minHeight: 56, fontFamily: inter, color: '#1A1F1B', cursor: 'pointer' }}
                >
                  <span style={{ flex: 'none', width: 32, height: 32, borderRadius: '50%', background: dn ? '#0F8A5F' : cur ? '#123B2C' : '#9DA8A2', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}` }}>
                    {dn ? '✓' : String(i + 1)}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ font: `700 15px ${inter}` }}>{name}</span>
                    <span style={{ font: `400 13px ${inter}`, lineHeight: 1.45, color: '#44504A' }}>{note}</span>
                  </span>
                </button>
              );
            })}
            <div style={{ font: `600 13px ${inter}`, color: '#A3173F', padding: 2 }}>
              {doneCount === STEPS.length ? 'Routine complete for this cow' : `${doneCount} of ${STEPS.length} steps done`}
            </div>
          </div>

          {/* Pull quote + milking order */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “Wiping dry is the step most farmers skip, and the one that matters.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Who gets milked first?</h2>
            <p style={{ margin: 0 }}>
              Order matters. The guide milks <strong>heifers first</strong>, then <strong>healthy cows</strong>, and <strong>infected cows last</strong>, so one sick cow does not pass bacteria down the line.
            </p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>SEE IT · MILKING ORDER</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {ORDER.map((o, i) => (
                <React.Fragment key={o.n}>
                  {i > 0 && (
                    <span aria-hidden="true" style={{ font: `600 18px ${inter}`, color: '#44504A' }}>›</span>
                  )}
                  <div style={{ flex: 1, background: o.bg, borderRadius: 14, padding: '12px 6px', textAlign: 'center' }}>
                    <div style={{ font: `700 20px ${inter}`, color: o.ink }}>{o.n}</div>
                    <div style={{ font: `600 12px ${inter}`, color: o.ink }}>{o.label}</div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Hidden mastitis */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>Find hidden mastitis before it spreads</h2>
            <p style={{ margin: 0 }}>
              Some infections never show in the milk. The guide suggests a California Mastitis Test (CMT) every <strong>fortnight</strong>. Dry cows get their own protection: dry-cow therapy and bismuth teat sealants.
            </p>
          </div>

          <div style={{ margin: '16px 22px 0', background: '#FFF2D0', borderRadius: 16, padding: 14, font: `400 14px ${inter}`, lineHeight: 1.55, color: '#5B3A00' }}>
            <span style={{ fontWeight: 700 }}>Safety:</span> Dry-cow antibiotics should only be used on your vet’s advice, and you must respect the milk withdrawal period.
          </div>

          {/* Quick quiz */}
          <div style={{ ...CARD, margin: '22px 16px 0', gap: 10 }}>
            <div style={EYEBROW}>QUICK QUIZ</div>
            <div style={{ font: `700 16px ${inter}`, lineHeight: 1.4 }}>How long should the pre-dip stay on the teat?</div>
            {QUIZ.map((label, i) => {
              const picked = pick === i;
              const good = answered && i === CORRECT;
              const bad = picked && i !== CORRECT;
              return (
                <button
                  key={label}
                  type="button"
                  aria-pressed={picked}
                  onClick={() => { if (pick === undefined) setPick(i); }}
                  style={{ textAlign: 'left', border: `2px solid ${good ? '#0F8A5F' : bad ? '#E0386A' : '#E7E5DA'}`, background: good ? '#DDF4EA' : bad ? '#FFDDE5' : '#FFFFFF', color: '#1A1F1B', borderRadius: 14, padding: '8px 14px', minHeight: 48, font: `500 15px ${inter}`, cursor: answered ? 'default' : 'pointer' }}
                >
                  {label}
                </button>
              );
            })}
            {answered && (
              <div style={{ font: `600 14px ${inter}`, lineHeight: 1.5, color: pick === CORRECT ? '#0F5F46' : '#A3173F' }}>
                {pick === CORRECT ? 'Correct. About 30 seconds gives the dip time to work.' : 'Not quite. The guide says about 30 seconds.'}
              </div>
            )}
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Pre-dip, wait 30 seconds, wipe dry, post-dip.</li>
                <li>Milk heifers, then healthy cows, then infected cows.</li>
                <li>Test with the CMT every fortnight.</li>
              </ul>
            </div>
          </div>

          {/* Up next */}
          <div style={{ padding: '22px 16px 40px' }}>
            <div
              onClick={onOpenNext}
              style={{ background: '#E1F0F3', borderRadius: 22, padding: 18, display: 'flex', alignItems: 'center', gap: 14, fontFamily: inter, cursor: onOpenNext ? 'pointer' : 'default' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F5F46' }}>UP NEXT</div>
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Fat is a fibre story</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>6 min · Chart</div>
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${inter}` }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
