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
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F5F46' };

const LEVERS = [
  ['Fans', 'Moving air across the cow takes heat off her skin. Switch them on before the THI climbs past 72, not after.'],
  ['Misters', 'A light spray plus fans cools the cow as the water evaporates. The guide pairs misters with fans.'],
  ['Shade and dry bedding', 'Keep the resting area shaded and dry so she lies down for 12 to 14 hours.'],
] as const;

const LIE_OPTIONS = [
  [8, '8 h'],
  [10, '10 h'],
  [13, '13 h'],
] as const;

const CHECKS = [
  'I know today’s THI before the afternoon',
  'Fans run over the stalls',
  'Shade covers the resting area',
  'Clean water is within 15 m of every cow',
];

export const HeatStressArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [temp, setTemp] = useState(33);
  const [rh, setRh] = useState(70);
  const [open, setOpen] = useState(0);
  const [lie, setLie] = useState(13);
  const [chk, setChk] = useState<Record<number, boolean>>({ 0: true });
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

  // THI gauge logic (same thresholds as the design)
  const thi = Math.round(0.8 * temp + (rh / 100) * (temp - 14.4) + 46.4);
  let label = 'COMFORTABLE';
  let bg = '#DDF4EA';
  let ink = '#0F6B50';
  let advice = 'No heat-stress action needed. Keep clean water within reach.';
  if (thi > 72 && thi <= 78) {
    label = 'HEAT STRESS BEGINS';
    bg = '#FFF2D0';
    ink = '#7A4E00';
    advice = 'Above 72 milk can drop. Switch on fans and give shade.';
  }
  if (thi > 78) {
    label = 'ACT NOW';
    bg = '#FFDDE5';
    ink = '#A3173F';
    advice = 'Run fans and misters together, shade the shed and offer cool water.';
  }
  const pct = Math.max(0, Math.min(100, Math.round(((thi - 60) / 40) * 100)));

  const lieNote =
    lie >= 12
      ? 'In the 12 to 14 hour range. This is the target in the guide, with udder blood flow up by 25 to 30%.'
      : 'Below the 12 to 14 hour target. Check stall comfort, bedding and heat.';

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
              <span style={{ background: '#FFF2D0', color: '#7A4E00', borderRadius: 6, padding: '4px 8px' }}>COMFORT AND HEAT</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>MORE MILK</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Why your cows give less milk in summer, and what to do by noon
            </h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              Heat quietly takes a tenth to a quarter of your milk. Here is how to see it coming.
            </div>
          </div>

          {/* Illustration */}
          <div style={{ margin: '16px 0 0', height: 210, background: '#FFF2D0', position: 'relative', overflow: 'hidden' }}>
            <svg width="390" height="210" viewBox="0 0 390 210" aria-hidden="true" style={{ display: 'block' }}>
              <circle cx="316" cy="56" r="34" fill="#F5B73B" />
              <g stroke="#F5B73B" strokeWidth="4" strokeLinecap="round">
                <path d="M316 6v12M316 94v12M266 56h12M354 56h12M281 21l8 8M343 83l8 8M281 91l8-8M343 29l8-8" />
              </g>
              <rect x="0" y="150" width="390" height="60" fill="#E6D3A0" />
              <g fill="#1A1F1B">
                <rect x="70" y="112" width="110" height="46" rx="14" />
                <rect x="164" y="92" width="34" height="34" rx="10" />
                <rect x="78" y="150" width="9" height="34" />
                <rect x="98" y="150" width="9" height="34" />
                <rect x="150" y="150" width="9" height="34" />
                <rect x="168" y="150" width="9" height="34" />
              </g>
              <g fill="#FFFFFF">
                <circle cx="100" cy="126" r="9" />
                <circle cx="130" cy="132" r="11" />
              </g>
              <path d="M60 120c-14 2-18 14-14 26" stroke="#1A1F1B" strokeWidth="4" fill="none" strokeLinecap="round" />
            </svg>
          </div>

          {/* Intro copy */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              It is two in the afternoon. Your best cow is standing, breathing fast, not eating. Nothing is wrong with her feed or her health. She is simply too hot.
            </p>
            <p style={{ margin: 0 }}>
              According to the guide this lesson is built on, once the temperature-humidity index (THI) goes <strong>above 72</strong>, milk output can fall by <strong>10 to 25%</strong>. You will not see a sick cow. You will just see a smaller milk can.
            </p>

            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “The cow does not feel the thermometer. She feels heat and humidity together.”
            </div>

            <h2 style={{ ...H2, margin: '6px 0 0' }}>Meet the THI</h2>
            <p style={{ margin: 0 }}>
              THI blends air temperature and humidity into one number. A dry 35°C day and a sticky 30°C day can feel equally cruel to a cow, and THI shows why.
            </p>
            <p style={{ margin: 0 }}>Try your own shed. Move the sliders to today’s weather.</p>
          </div>

          {/* Heat-stress gauge */}
          <div style={{ ...CARD, margin: '20px 16px 0' }}>
            <style>{`.thi-range{width:100%;accent-color:#123B2C;height:44px;margin:0}`}</style>
            <div style={EYEBROW}>TRY IT · HEAT-STRESS GAUGE</div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `600 14px ${inter}` }}>
                <label htmlFor="thi-t">Air temperature</label>
                <span>{temp} °C</span>
              </div>
              <input id="thi-t" className="thi-range" type="range" min={20} max={42} step={1} value={temp} onChange={(e) => setTemp(Number(e.target.value))} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `600 14px ${inter}` }}>
                <label htmlFor="thi-rh">Humidity</label>
                <span>{rh} %</span>
              </div>
              <input id="thi-rh" className="thi-range" type="range" min={20} max={100} step={5} value={rh} onChange={(e) => setRh(Number(e.target.value))} />
            </div>
            <div style={{ background: bg, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                <span style={{ font: `700 44px ${inter}`, color: ink }}>{thi}</span>
                <span style={{ font: `700 12px ${inter}`, letterSpacing: '0.08em', color: ink }}>{label}</span>
              </div>
              <div
                style={{
                  position: 'relative',
                  height: 14,
                  borderRadius: 7,
                  background: 'linear-gradient(90deg,#9ED9BF 0%,#9ED9BF 30%,#F5D77A 30%,#F5D77A 55%,#F2A07A 55%,#F2A07A 100%)',
                }}
              >
                <div style={{ position: 'absolute', top: -4, left: `${pct}%`, width: 6, height: 22, borderRadius: 3, background: '#1A1F1B', transform: 'translateX(-3px)' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', font: `500 11px ${inter}`, color: '#44504A' }}>
                <span>60</span>
                <span>72 limit</span>
                <span>85</span>
                <span>100</span>
              </div>
              <div style={{ font: `400 15px ${inter}`, lineHeight: 1.5, color: '#1A1F1B' }}>{advice}</div>
            </div>
            <div style={{ font: `400 12px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
              Formula: THI = 0.8 × T + (RH ÷ 100) × (T − 14.4) + 46.4. The 72 threshold is from the guide.
            </div>
          </div>

          {/* Levers */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>What to do when the needle moves</h2>
            <p style={{ margin: 0 }}>The guide gives three levers. None needs a big investment.</p>
          </div>

          <div style={{ margin: '16px 22px 0', display: 'flex', flexDirection: 'column', gap: 10, fontFamily: inter }}>
            {LEVERS.map((l, i) => {
              const o = open === i;
              return (
                <button
                  key={l[0]}
                  type="button"
                  aria-expanded={o}
                  onClick={() => setOpen(o ? -1 : i)}
                  style={{ width: '100%', textAlign: 'left', border: 0, background: o ? '#E1F0F3' : '#FFFFFF', borderRadius: 18, padding: '14px 16px', fontFamily: inter, color: '#1A1F1B', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 56, cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', font: `700 14px ${inter}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                    <span style={{ flex: 1, font: `700 16px ${inter}` }}>{l[0]}</span>
                    <span aria-hidden="true" style={{ font: `500 20px ${inter}` }}>{o ? '−' : '+'}</span>
                  </span>
                  {o && (
                    <span style={{ font: `400 15px ${inter}`, lineHeight: 1.55, color: '#2F3F39', paddingLeft: 44 }}>{l[1]}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Lying time */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>The number that surprises people: lying time</h2>
            <p style={{ margin: 0 }}>
              A cow that lies down for 12 to 14 hours a day sends about <strong>25 to 30% more blood</strong> through her udder, according to the guide. More blood flow means more milk. Hot, wet or hard stalls steal that rest.
            </p>
          </div>

          <div style={{ ...CARD, margin: '16px 16px 0' }}>
            <div style={EYEBROW}>SEE IT · A COW’S 24 HOURS</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, height: 44 }}>
              <div style={{ flex: lie, background: '#123B2C', borderRadius: '10px 4px 4px 10px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', font: `700 13px ${inter}`, whiteSpace: 'nowrap', transition: 'flex 200ms ease' }}>
                Lying {lie} h
              </div>
              <div style={{ flex: 24 - lie, background: '#DCDACF', borderRadius: '4px 10px 10px 4px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 13px ${inter}`, color: '#1A1F1B', whiteSpace: 'nowrap', transition: 'flex 200ms ease' }}>
                Up {24 - lie} h
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {LIE_OPTIONS.map(([v, text]) => {
                const on = v === lie;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setLie(v)}
                    style={{ flex: 1, minHeight: 44, border: 0, borderRadius: 999, background: on ? '#123B2C' : '#F2F0E6', color: on ? '#FFFFFF' : '#1A1F1B', font: `600 13px ${inter}`, cursor: 'pointer' }}
                  >
                    {text}
                  </button>
                );
              })}
            </div>
            <div style={{ font: `400 15px ${inter}`, lineHeight: 1.5 }}>{lieNote}</div>
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, color: '#1A1F1B', listStyle: 'disc' }}>
                <li>THI above 72 can cut milk by 10 to 25%.</li>
                <li>Fans and misters are the first line of defence.</li>
                <li>Protect 12 to 14 hours of lying time.</li>
              </ul>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: '22px 16px 0' }}>
            <div style={{ ...CARD, gap: 6 }}>
              <div style={EYEBROW}>BEFORE YOU MOVE ON · CHECK YOUR SHED</div>
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
              <div style={{ font: `600 13px ${inter}`, color: '#0F5F46', paddingTop: 4 }}>
                {done === CHECKS.length ? 'Shed ready for summer' : `${done} of ${CHECKS.length} done`}
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
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Water is the cheapest feed you are not measuring</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>5 min · Calculator</div>
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${inter}` }}>›</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
