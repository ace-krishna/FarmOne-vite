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
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#A04000' };

const NUMBERS = [
  { n: '20–25 : 1', c: '#A04000', b: 'The mix.', t: ' Mix manure with a carbon-rich material such as paddy straw, husk or wood shavings.' },
  { n: '35–50%', c: '#1F4E9A', b: 'The wetness.', t: ' Damp, not dripping. Too wet gets smelly, too dry stops working.' },
  { n: '54–66°C', c: '#A3173F', b: 'The heat.', t: ' A hot pile means the good bacteria are working.' },
];

const SYSTEMS = {
  deep: [
    'Deep litter shed',
    'Stir the bedding about every two days to keep it dry. When the batch is sold, usually after 42 to 45 days, take out the whole bed with the droppings and send it for composting or sale.',
  ],
  cage: [
    'Cage shed',
    'Droppings fall onto a hard floor under the cages. Keep the air moving so they dry out. Take the manure out about once every four to six months and sell it or compost it.',
  ],
} as const;

const CHECKS = [
  'I mix manure with straw, husk or shavings',
  'I check the heat and wetness',
  'I stir the pile from time to time',
  'The pile is covered and off the ground water',
  'Rain and run-off cannot reach it',
];

export const ManureArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [temp, setTemp] = useState(58);
  const [wet, setWet] = useState(42);
  const [sys, setSys] = useState<'deep' | 'cage'>('deep');
  const [chk, setChk] = useState<Record<number, boolean>>({ 0: true });
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

  // Pile checker logic (same thresholds as the design)
  let tLabel = 'Just right', tBg = '#DDF4EA', tInk = '#0F6B50';
  if (temp < 49) { tLabel = 'Too cool'; tBg = '#DDEBFF'; tInk = '#1F4E9A'; }
  else if (temp < 54) { tLabel = 'Warming up'; tBg = '#FFF2D0'; tInk = '#7A4E00'; }
  else if (temp > 66) { tLabel = 'Too hot'; tBg = '#FFDDE5'; tInk = '#A3173F'; }
  let wLabel = 'Just right', wBg = '#DDF4EA', wInk = '#0F6B50';
  if (wet < 35) { wLabel = 'Too dry'; wBg = '#FFF2D0'; wInk = '#7A4E00'; }
  else if (wet > 50) { wLabel = 'Too wet'; wBg = '#FFDDE5'; wInk = '#A3173F'; }
  const tOk = temp >= 54 && temp <= 66;
  const wOk = wet >= 35 && wet <= 50;
  let advice = 'Healthy pile. Keep stirring it from time to time.';
  if (!tOk || !wOk) {
    const a: string[] = [];
    if (wet < 35) a.push('Add a little water and mix.');
    if (wet > 50) a.push('Add dry straw or husk and turn it, and keep rain off.');
    if (temp < 49) a.push('If it stays cool after a week, move it to a second bay and mix well.');
    else if (temp < 54) a.push('Give it a few days and stir it again.');
    if (temp > 66) a.push('Turn the pile to let heat out.');
    advice = a.join(' ');
  }

  const done = Object.values(chk).filter(Boolean).length;

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
              <span style={{ background: '#FFE2D3', color: '#7A2E00', borderRadius: 6, padding: '4px 8px' }}>MANURE</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>ALL FARM SIZES</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Is your manure pile healthy? Check it in two minutes
            </h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              The right mix, the right wetness and the right heat turn smelly waste into something you can use or sell.
            </div>
          </div>

          {/* Illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#FFE2D3', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <rect y="150" width="390" height="40" fill="#D9B48F" />
              <path d="M70 150c10-60 60-90 125-90s115 30 125 90z" fill="#8A5A36" />
              <path d="M110 150c10-40 40-62 85-62s75 22 85 62z" fill="#A87047" />
              <g stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" opacity="0.85" fill="none">
                <path d="M170 50c-8-10 8-14 0-24" />
                <path d="M200 44c-8-10 8-14 0-24" />
                <path d="M230 50c-8-10 8-14 0-24" />
              </g>
            </svg>
          </div>

          {/* Intro copy */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              Poultry droppings that sit wet and packed in one place go sour. That is where the bad smell comes from, and it brings flies too.
            </p>
            <p style={{ margin: 0 }}>
              Composting fixes this. Small farms compost their manure. Bigger farms can compost it or make biogas. Either way, it starts with a good pile.
            </p>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Three numbers to remember</h2>
          </div>

          {/* Three numbers */}
          <div style={{ margin: '16px 22px 0', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: inter }}>
            {NUMBERS.map((n) => (
              <div key={n.n} style={{ display: 'flex', gap: 10, alignItems: 'center', background: '#FFFFFF', border: '1px solid #DCDACF', borderRadius: 18, padding: 14 }}>
                <div style={{ flex: 'none', width: 98, font: `700 20px ${inter}`, letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: n.c, textAlign: 'center' }}>{n.n}</div>
                <div style={{ font: `400 15px ${inter}`, lineHeight: 1.45 }}>
                  <strong>{n.b}</strong>
                  {n.t}
                </div>
              </div>
            ))}
          </div>

          {/* Pile checker */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <h2 style={H2}>Now check your own pile</h2>
            <p style={{ margin: 0 }}>Take a reading, then move the sliders to match.</p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <style>{`.pile-range{width:100%;accent-color:#123B2C;height:44px;margin:0}`}</style>
            <div style={EYEBROW}>TRY IT · PILE CHECKER</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `600 14px ${inter}` }}>
                <label htmlFor="pile-t">Pile temperature</label>
                <span>{temp} °C</span>
              </div>
              <input id="pile-t" className="pile-range" type="range" min={25} max={75} step={1} value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `600 14px ${inter}` }}>
                <label htmlFor="pile-m">Wetness</label>
                <span>{wet} %</span>
              </div>
              <input id="pile-m" className="pile-range" type="range" min={15} max={75} step={1} value={wet} onChange={(e) => setWet(Number(e.target.value))} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div style={{ flex: 1, background: tBg, borderRadius: 14, padding: 10, textAlign: 'center' }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.08em', color: tInk }}>HEAT</div>
                <div style={{ font: `700 15px ${inter}`, color: tInk, marginTop: 2 }}>{tLabel}</div>
              </div>
              <div style={{ flex: 1, background: wBg, borderRadius: 14, padding: 10, textAlign: 'center' }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.08em', color: wInk }}>WETNESS</div>
                <div style={{ font: `700 15px ${inter}`, color: wInk, marginTop: 2 }}>{wLabel}</div>
              </div>
            </div>
            <div style={{ background: '#E5F27A', borderRadius: 16, padding: 14, font: `600 15px ${inter}`, lineHeight: 1.5, color: '#2A3A00' }}>{advice}</div>
          </div>

          {/* Pull quote + storage */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “A dry pile is a happy pile. Keep rain and run-off out.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Build the storage right</h2>
            <p style={{ margin: 0 }}>Where you keep manure matters as much as how you treat it.</p>
          </div>

          <div style={{ ...CARD, margin: '16px 16px 0' }}>
            <div style={EYEBROW}>SEE IT · A SAFE MANURE STORE</div>
            <svg viewBox="0 0 330 170" width="100%" role="img" aria-label="Manure store with a roof, a hard base, and 2 metres above the water table">
              <rect x="40" y="30" width="250" height="10" fill="#8A5A36" />
              <rect x="50" y="40" width="6" height="64" fill="#8A5A36" />
              <rect x="274" y="40" width="6" height="64" fill="#8A5A36" />
              <path d="M85 104c8-30 40-46 80-46s72 16 80 46z" fill="#A87047" />
              <rect x="40" y="104" width="250" height="12" fill="#B8B4A5" />
              <rect x="0" y="116" width="330" height="22" fill="#D9B48F" />
              <path d="M0 150h330" stroke="#5E9BE6" strokeWidth="3" strokeDasharray="6 4" />
              <text x="10" y="166" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1F4E9A">Water table</text>
              <path d="M300 116v34" stroke="#1A1F1B" strokeWidth="2" />
              <path d="M296 120l4-4 4 4M296 146l4 4 4-4" stroke="#1A1F1B" strokeWidth="2" fill="none" />
              <text x="250" y="138" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1A1F1B">at least 2 m</text>
              <text x="165" y="26" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#7A2E00">Roof or cover</text>
              <text x="165" y="130" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#44504A">Stone slab, concrete or packed clay base</text>
            </svg>
            <div style={{ font: `400 14px ${inter}`, lineHeight: 1.5, color: '#44504A' }}>
              Keep the pile at least 2 m above the water table, on a hard base, under a roof or cover.
            </div>
          </div>

          {/* When does it go out */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>When does it go out?</h2>
            <p style={{ margin: 0 }}>It depends on how your birds live. Tap to see.</p>
          </div>

          <div style={{ ...CARD, margin: '16px 16px 0' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {(['deep', 'cage'] as const).map((k) => {
                const on = sys === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setSys(k)}
                    style={{ flex: 1, minHeight: 44, border: 0, borderRadius: 999, background: on ? '#123B2C' : '#F2F0E6', color: on ? '#FFFFFF' : '#1A1F1B', font: `600 14px ${inter}`, cursor: 'pointer' }}
                  >
                    {k === 'deep' ? 'Deep litter' : 'Cages'}
                  </button>
                );
              })}
            </div>
            <div style={{ background: '#F2F0E6', borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ font: `700 16px ${inter}` }}>{SYSTEMS[sys][0]}</div>
              <div style={{ font: `400 15px ${inter}`, lineHeight: 1.55, color: '#2F3F39' }}>{SYSTEMS[sys][1]}</div>
            </div>
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Mix manure with straw or husk at 20 to 25 parts carbon to 1.</li>
                <li>Keep it 35 to 50% wet and stir it often.</li>
                <li>A pile at 54 to 66°C is working well.</li>
                <li>Store it dry, covered, and 2 m above the water table.</li>
              </ul>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: '22px 16px 0' }}>
            <div style={{ ...CARD, gap: 6 }}>
              <div style={EYEBROW}>BEFORE YOU MOVE ON · CHECK YOUR PILE</div>
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
              <div style={{ font: `600 13px ${inter}`, color: '#A04000', paddingTop: 4 }}>
                {done === CHECKS.length ? 'Pile is in good shape' : `${done} of ${CHECKS.length} done`}
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
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Dead birds: the 24-hour rule</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>5 min · Method picker</div>
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
