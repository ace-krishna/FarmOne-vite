import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

// Design is 390px wide; the phone shell is 375px
const UI_SCALE = 375 / 390;

const serif = "'Source Serif 4',Georgia,serif";
const inter = 'Inter,sans-serif';
const PURPLE = '#5B2E91';

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
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: PURPLE };

type Method = 'bury' | 'compost';

const METHODS: Record<Method, { label: string; intro: string; steps: [string, string][] }> = {
  bury: {
    label: 'Burial',
    intro: 'Best when you have space on the farm, with the ground water far below. Follow these steps for every bird.',
    steps: [
      ['Separate the bird', 'Move it away from the live birds at once.'],
      ['Keep it in a closed container', 'Until you dispose of it, never longer than 24 hours.'],
      ['Drop it in the pit', 'Use the lid. Keep the pit closed otherwise.'],
      ['Cover with soil and lime', 'A layer of soil at least 40 cm deep, with calcium hydroxide (lime).'],
      ['Seal the full pit', 'Pack 0.5 m of soil on top, heaped above ground level.'],
    ],
  },
  compost: {
    label: 'Composting',
    intro: 'Best when you lose birds regularly. It needs a proper bay, but it can turn carcasses into compost.',
    steps: [
      ['Separate the bird', 'Move it away from the live birds at once.'],
      ['Keep it in a closed container', 'Until you dispose of it, never longer than 24 hours.'],
      ['Layer it with a carbon source', 'Mix dead birds with straw or husk at about 20 to 25 parts carbon to 1.'],
      ['Keep it damp, not soggy', 'About 60% moisture. Wetter smells, drier works slowly.'],
      ['Watch the heat', '54 to 66°C is best. If it drops below 49°C after about a week, move it to the second-stage bay.'],
    ],
  },
};

const CHECKS = [
  'I have closed containers for dead birds',
  'Dead birds leave the shed the same day',
  'My burial pit or compost bay is ready',
  'Pits and bays are far from wells and homes',
];

export const DeadBirdsArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [method, setMethod] = useState<Method>('bury');
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [chk, setChk] = useState<Record<number, boolean>>({});
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

  const m = METHODS[method];
  const first = m.steps.findIndex((_, i) => !done[i]);
  const doneCount = Object.values(done).filter(Boolean).length;
  const checkCount = Object.values(chk).filter(Boolean).length;

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
            <div style={{ font: `700 12px ${inter}`, letterSpacing: '0.1em', color: '#123B2C' }}>I-LEARNING · POULTRY</div>
            <div style={{ width: 44, height: 44 }} aria-hidden="true" />
          </div>
          <div style={{ height: 4, background: '#E7E5DA', margin: '6px 0 0' }}>
            <div style={{ width: `${Math.max(3, progress * 100)}%`, height: '100%', background: '#123B2C', transition: 'width 120ms linear' }} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll}>
          {/* Header */}
          <div style={{ padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', font: `700 11px ${inter}`, letterSpacing: '0.1em' }}>
              <span style={{ background: '#EADDFB', color: PURPLE, borderRadius: 6, padding: '4px 8px' }}>DEAD BIRDS</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>DISEASE CONTROL</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Dead birds: the 24-hour rule</h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              Some birds will die on any farm. What you do in the next day decides whether it stays a small loss.
            </div>
          </div>

          {/* Clock illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#EADDFB', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <circle cx="195" cy="95" r="62" fill="#FFFFFF" />
              <path d="M195 55v42l28 16" stroke={PURPLE} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <text x="195" y="170" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="14" fontWeight="700" fill={PURPLE}>24 HOURS</text>
            </svg>
          </div>

          {/* Intro copy + quote */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>A dead bird left in the shed spreads disease and draws flies, rats and stray dogs. It also smells.</p>
            <p style={{ margin: 0 }}>
              So the rule is simple. <strong>Take dead birds away from the live ones right away</strong>, keep them in a closed container, and dispose of them{' '}
              <strong>within 24 hours</strong>.
            </p>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “Fewer birds die when you look after them well. Prevention is the first step.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Pick a method</h2>
            <p style={{ margin: 0 }}>Burying and composting are both safe when done right. Tap each to see what it takes.</p>
          </div>

          {/* Method picker */}
          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · METHOD PICKER</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.keys(METHODS) as Method[]).map((k) => {
                const on = method === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      setMethod(k);
                      setDone({});
                    }}
                    style={{ flex: 1, minHeight: 44, border: 0, borderRadius: 999, background: on ? '#123B2C' : '#F2F0E6', color: on ? '#FFFFFF' : '#1A1F1B', font: `600 14px ${inter}`, cursor: 'pointer' }}
                  >
                    {METHODS[k].label}
                  </button>
                );
              })}
            </div>
            <div style={{ background: '#F2F0E6', borderRadius: 16, padding: 14, font: `400 14px ${inter}`, lineHeight: 1.5, color: '#2F3F39' }}>{m.intro}</div>
            <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {m.steps.map(([name, note], i) => {
                const dn = !!done[i];
                const cur = i === first;
                return (
                  <li key={`${method}-${i}`}>
                    <button
                      type="button"
                      aria-pressed={dn}
                      onClick={() => setDone({ ...done, [i]: !dn })}
                      style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', border: `2px solid ${cur ? '#123B2C' : '#E7E5DA'}`, background: cur ? '#F2F0E6' : '#FFFFFF', borderRadius: 16, padding: '10px 12px', minHeight: 56, fontFamily: inter, color: '#1A1F1B', cursor: 'pointer' }}
                    >
                      <span style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: dn ? '#0F8A5F' : cur ? '#123B2C' : '#9DA8A2', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 13px ${inter}` }}>
                        {dn ? '✓' : String(i + 1)}
                      </span>
                      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <span style={{ font: `700 15px ${inter}` }}>{name}</span>
                        <span style={{ font: `400 13px ${inter}`, lineHeight: 1.45, color: '#44504A' }}>{note}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>
            <div style={{ font: `600 13px ${inter}`, color: PURPLE }}>{doneCount === 5 ? 'All steps done' : `${doneCount} of 5 steps done`}</div>
          </div>

          {/* Burial pit */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>What a burial pit looks like</h2>
            <p style={{ margin: 0 }}>A good pit is deep, narrow and covered. The lid keeps flies and rats out.</p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0', gap: 10 }}>
            <div style={EYEBROW}>SEE IT · BURIAL PIT</div>
            <svg viewBox="0 0 330 260" width="100%" role="img" aria-label="Burial pit 3 to 4 metres deep with a lid, a soil and lime layer, and 3 metres to the water table">
              <rect x="0" y="40" width="330" height="190" fill="#E9D8BE" />
              <rect x="115" y="40" width="100" height="150" fill="#8A5A36" />
              <rect x="105" y="30" width="120" height="12" fill="#B8B4A5" />
              <rect x="150" y="22" width="30" height="8" rx="3" fill="#5C6862" />
              <rect x="115" y="40" width="100" height="26" fill="#C9A878" />
              <text x="165" y="58" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1A1F1B">40 cm soil + lime</text>
              <text x="165" y="130" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#FFFFFF">carcasses</text>
              <path d="M240 40v150" stroke="#1A1F1B" strokeWidth="2" />
              <path d="M236 46l4-6 4 6M236 184l4 6 4-6" stroke="#1A1F1B" strokeWidth="2" fill="none" />
              <text x="250" y="120" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#1A1F1B">3 to 4 m</text>
              <text x="250" y="136" fontFamily="Inter,sans-serif" fontSize="11" fill="#1A1F1B">deep</text>
              <path d="M0 225h330" stroke="#5E9BE6" strokeWidth="3" strokeDasharray="6 4" />
              <text x="8" y="246" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1F4E9A">Water table: pit bottom stays at least 3 m above</text>
              <text x="110" y="16" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill={PURPLE}>Fly-proof lid</text>
            </svg>
            <div style={{ font: `400 14px ${inter}`, lineHeight: 1.5, color: '#44504A' }}>
              Pit width: 0.8 to 1.2 m. When it is full, cover it with 0.5 m of packed soil, heaped above ground. Keep pits at least 1 m apart.
            </div>
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Remove dead birds at once and dispose of them within 24 hours.</li>
                <li>Keep them in a closed container until then.</li>
                <li>Bury them deep and covered, or compost them in a roofed, fenced bay.</li>
                <li>Used vaccine vials and syringes follow the solid-waste rules, not the carcass pit.</li>
              </ul>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: '22px 16px 0' }}>
            <div style={{ ...CARD, gap: 6 }}>
              <div style={EYEBROW}>BEFORE YOU MOVE ON · MY FARM</div>
              {CHECKS.map((label, i) => {
                const on = !!chk[i];
                return (
                  <button
                    key={label}
                    type="button"
                    role="checkbox"
                    aria-checked={on}
                    onClick={() => setChk({ ...chk, [i]: !on })}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: 0, background: 'transparent', minHeight: 52, padding: 0, font: `500 15px ${inter}`, color: '#1A1F1B', cursor: 'pointer' }}
                  >
                    <span style={{ flex: 'none', width: 28, height: 28, borderRadius: 8, border: '2px solid #123B2C', background: on ? '#123B2C' : '#FFFFFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}` }}>
                      {on ? '✓' : ''}
                    </span>
                    <span style={{ lineHeight: 1.4 }}>{label}</span>
                  </button>
                );
              })}
              <div style={{ font: `600 13px ${inter}`, color: PURPLE, paddingTop: 4 }}>
                {checkCount === CHECKS.length ? 'Ready for the 24-hour rule' : `${checkCount} of ${CHECKS.length} done`}
              </div>
            </div>
          </div>

          {/* Up next */}
          <div style={{ padding: '22px 16px 0' }}>
            <div
              onClick={onOpenNext}
              style={{ background: '#E1F0F3', borderRadius: 22, padding: 18, display: 'flex', alignItems: 'center', gap: 14, fontFamily: inter, cursor: onOpenNext ? 'pointer' : 'default' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F5F46' }}>UP NEXT</div>
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Dry litter, fresh air: the daily shed routine</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>5 min · Routine planner</div>
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${inter}` }}>›</span>
            </div>
          </div>

          <div style={{ padding: '18px 22px 40px', font: `400 12px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
            Source: Central Pollution Control Board, Environmental Guidelines for Poultry Farms (August 2021).
          </div>
        </div>
      </div>
    </div>
  );
};
