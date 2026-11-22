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
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#1F4E9A' };

const HERDS = [
  [1, 'One cow'],
  [5, '5 cows'],
  [10, '10 cows'],
] as const;

const CHECKS = [
  'Every cow has a trough within 15 m',
  'Troughs are cleaned every day',
  'I know how much my cows drink',
];

export const WaterArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [yld, setYld] = useState(12);
  const [herd, setHerd] = useState(1);
  const [chk, setChk] = useState<Record<number, boolean>>({});
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

  // Water calculator: 4 to 5 litres of water per litre of milk
  const low = yld * herd * 4;
  const high = yld * herd * 5;
  const nDrops = Math.min(60, Math.max(1, Math.round(low / 10)));
  const herdText = herd === 1 ? 'one cow' : `${herd} cows`;

  const done = Object.values(chk).filter(Boolean).length;

  const stepBtn: React.CSSProperties = {
    width: 48,
    height: 48,
    border: 0,
    borderRadius: 12,
    background: '#FFFFFF',
    font: `600 24px ${inter}`,
    color: '#1A1F1B',
    cursor: 'pointer',
  };

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
              <span style={{ background: '#DDEBFF', color: '#1F4E9A', borderRadius: 6, padding: '4px 8px' }}>WATER</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>MORE MILK</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Water is the cheapest feed you are not measuring
            </h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              Milk is mostly water. A cow that cannot drink enough cannot make enough.
            </div>
          </div>

          {/* Illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#DDEBFF', position: 'relative', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <path d="M0 120c40-16 80 16 120 0s80-16 120 0 80 16 150 0V190H0z" fill="#9CC3F2" />
              <path d="M0 145c40-14 80 14 120 0s80-14 120 0 80 14 150 0V190H0z" fill="#5E9BE6" />
              <path d="M195 22c26 34 40 54 40 74a40 40 0 0 1-80 0c0-20 14-40 40-74z" fill="#FFFFFF" opacity="0.95" />
            </svg>
          </div>

          {/* Intro copy */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              A litre of milk is close to nine-tenths water. Where does the cow get it? From the trough, mostly.
            </p>
            <p style={{ margin: 0 }}>
              The guide puts the need at <strong>4 to 5 litres of water for every litre of milk</strong>. A cow giving 12 litres a day should be drinking something like 48 to 60 litres. Most farmers never check.
            </p>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Do the sum for your herd</h2>
          </div>

          {/* Daily water calculator */}
          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · DAILY WATER CALCULATOR</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#F2F0E6', borderRadius: 16, padding: 6 }}>
              <button type="button" aria-label="Less milk" onClick={() => setYld((y) => Math.max(1, y - 1))} style={stepBtn}>−</button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ font: `700 30px ${inter}` }}>{yld} L</div>
                <div style={{ font: `500 12px ${inter}`, color: '#44504A' }}>milk per cow per day</div>
              </div>
              <button type="button" aria-label="More milk" onClick={() => setYld((y) => Math.min(40, y + 1))} style={stepBtn}>+</button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {HERDS.map(([v, text]) => {
                const on = v === herd;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setHerd(v)}
                    style={{ flex: 1, minHeight: 44, border: 0, borderRadius: 999, background: on ? '#123B2C' : '#F2F0E6', color: on ? '#FFFFFF' : '#1A1F1B', font: `600 14px ${inter}`, cursor: 'pointer' }}
                  >
                    {text}
                  </button>
                );
              })}
            </div>
            <div style={{ background: '#DDEBFF', borderRadius: 18, padding: 16 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.1em', color: '#1F4E9A' }}>DRINKING WATER PER DAY</div>
              <div style={{ font: `700 34px ${inter}`, marginTop: 4 }}>{low} to {high} L</div>
              <div style={{ display: 'flex', gap: 2, marginTop: 10, flexWrap: 'wrap' }}>
                {Array.from({ length: nDrops }).map((_, i) => (
                  <span key={i} style={{ width: 12, height: 16, borderRadius: '6px 6px 8px 8px', background: '#5E9BE6', display: 'inline-block' }} />
                ))}
              </div>
              <div style={{ font: `400 13px ${inter}`, lineHeight: 1.5, color: '#2F3F39', marginTop: 8 }}>
                Each drop is about 10 litres, using the 4 L low end. For {herdText}.
              </div>
            </div>
          </div>

          {/* Pull quote + trough */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “A trough that is too far away is a feed shortage in disguise.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Where to put the trough</h2>
            <p style={{ margin: 0 }}>
              The guide recommends troughs within <strong>15 metres</strong> of the cows and cleaned <strong>every day</strong>. Stale, dirty water cuts drinking, and drinking drives how much dry feed a cow can eat.
            </p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0', gap: 10 }}>
            <div style={EYEBROW}>SEE IT · DISTANCE TO WATER</div>
            <svg viewBox="0 0 330 110" width="100%" role="img" aria-label="A shed with a trough 15 metres away">
              <rect x="10" y="30" width="150" height="56" rx="8" fill="#F2F0E6" stroke="#DCDACF" />
              <text x="85" y="62" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="13" fontWeight="600" fill="#1A1F1B">Shed</text>
              <path d="M160 58h110" stroke="#1F4E9A" strokeWidth="2" strokeDasharray="5 4" />
              <rect x="270" y="44" width="50" height="28" rx="8" fill="#5E9BE6" />
              <text x="295" y="62" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#FFFFFF">Trough</text>
              <text x="215" y="48" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#1F4E9A">15 m or less</text>
            </svg>
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Plan for 4 to 5 litres of water per litre of milk.</li>
                <li>Keep troughs within 15 m of the cows.</li>
                <li>Clean troughs daily so cows keep drinking.</li>
              </ul>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: '22px 16px 0' }}>
            <div style={{ ...CARD, gap: 6 }}>
              <div style={EYEBROW}>BEFORE YOU MOVE ON · WATER CHECK</div>
              {CHECKS.map((text, i) => {
                const on = !!chk[i];
                return (
                  <button
                    key={text}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => setChk({ ...chk, [i]: !on })}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: 0, background: 'transparent', minHeight: 52, padding: 0, font: `500 15px ${inter}`, color: '#1A1F1B', cursor: 'pointer' }}
                  >
                    <span style={{ flex: 'none', width: 28, height: 28, borderRadius: 8, border: '2px solid #123B2C', background: on ? '#123B2C' : '#FFFFFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}` }}>
                      {on ? '✓' : ''}
                    </span>
                    <span style={{ lineHeight: 1.4 }}>{text}</span>
                  </button>
                );
              })}
              <div style={{ font: `600 13px ${inter}`, color: '#1F4E9A', paddingTop: 4 }}>
                {done === CHECKS.length ? 'Water set for the herd' : `${done} of ${CHECKS.length} done`}
              </div>
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
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Clean milk starts at the teat</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>6 min · Checklist</div>
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${inter}` }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
