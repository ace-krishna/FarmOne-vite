import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
}

// Design is 390px wide; the phone shell is 375px
const UI_SCALE = 375 / 390;

const serif = "'Source Serif 4',Georgia,serif";
const inter = 'Inter,sans-serif';
const RUST = '#A04000';

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
const BODY: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 18, fontSize: 19, lineHeight: 1.6 };
const H2: React.CSSProperties = { margin: '6px 0 0', fontWeight: 700, fontSize: 26, lineHeight: 1.2 };
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: RUST };
const ROW: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', font: `600 14px ${inter}` };

const VACCINES = [
  { d: 1, name: "Marek's disease", when: 'Day 1', note: 'Given at the hatchery or on the first day.' },
  { d: 6, name: 'Newcastle (Lasota)', when: 'Day 5 to 7', note: 'The first Newcastle (Ranikhet) vaccine.' },
  { d: 14, name: 'Gumboro, first dose', when: 'Day 14', note: 'Protects against Gumboro, which attacks young birds.' },
  { d: 24, name: 'Gumboro, second dose', when: 'Day 24', note: 'The second Gumboro dose.' },
  { d: 30, name: 'Lasota booster', when: 'Day 30', note: 'A booster for Newcastle.' },
  { d: 42, name: 'Fowl pox', when: 'Week 6', note: 'Protects against fowl pox.' },
  { d: 63, name: 'R2B', when: 'Week 9', note: 'Another Newcastle protection, given at nine weeks.' },
];

const BIO = [
  'All-in, all-out: one age group per shed',
  'Clean and disinfect before each new batch',
  'Fencing, footbath and handwashing at the door',
  'Keep out pests, wild birds and visitors',
  'Isolate sick birds at once',
  'Dispose of dead birds safely',
];

const CHECKS = [
  'I know the brooder starts near 35°C',
  'I know the first vaccines are Marek’s, then Newcastle',
  'I can work out my FCR',
];

const Tick: React.FC<{ on: boolean; label: string; onClick: () => void; minH: number }> = ({ on, label, onClick, minH }) => (
  <button
    type="button"
    aria-pressed={on}
    onClick={onClick}
    style={{ minHeight: minH, border: 0, background: 'transparent', display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', padding: 0, font: `500 15px ${inter}`, color: '#1A1F1B', cursor: 'pointer' }}
  >
    <span style={{ flex: 'none', width: 26, height: 26, borderRadius: 8, border: '2px solid #123B2C', background: on ? '#123B2C' : '#FFFFFF', color: '#E5F27A', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}` }}>
      {on ? '✓' : ''}
    </span>
    {label}
  </button>
);

export const HealthyChicksArticleScreen: React.FC<Props> = ({ onBack }) => {
  const [week, setWeek] = useState(1);
  const [day, setDay] = useState(14);
  const [feed, setFeed] = useState(3.8);
  const [wt, setWt] = useState(2);
  const [bio, setBio] = useState<boolean[]>(Array(6).fill(false));
  const [checks, setChecks] = useState<boolean[]>(Array(3).fill(false));
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

  // Brooder heat
  const temp = Math.round((35 - (week - 1) * 2.78) * 10) / 10;
  const tempPct = Math.round(((temp - 15) / 22) * 100);

  // Vaccine timeline
  let cur: (typeof VACCINES)[number] | null = null;
  let nxt: (typeof VACCINES)[number] | null = null;
  VACCINES.forEach((v) => { if (v.d <= day) cur = v; });
  VACCINES.forEach((v) => { if (v.d > day && !nxt) nxt = v; });
  const c = cur as (typeof VACCINES)[number] | null;
  const n = nxt as (typeof VACCINES)[number] | null;
  const dueNow = !!c && day - c.d <= 1;
  const vLabel = dueNow ? 'DUE NOW' : c ? 'LAST GIVEN' : 'GETTING STARTED';
  const vTitle = dueNow && c ? c.name : n ? 'Next: ' + n.name : 'All doses given. Repeat in 6 months.';
  const vNote = dueNow && c ? c.note : n ? n.when + '. ' + n.note : 'Repeat doses every 6 months.';

  // FCR
  const fcr = Math.round((feed / wt) * 100) / 100;
  const fGood = fcr <= 2.0;
  const fOk = fcr <= 2.3;
  const fTint = fGood ? '#DDF4EA' : fOk ? '#FFF2D0' : '#FFDDE5';
  const fInk = fGood ? '#0F6B50' : fOk ? '#7A4E00' : '#A3173F';
  const fNote = fGood ? 'In line with a well-run broiler farm.' : fOk ? 'A little high. Check feed waste and bird health.' : 'High. You are using too much feed for the weight gained.';

  const bd = bio.filter(Boolean).length;
  const cd = checks.filter(Boolean).length;
  const toggle = (arr: boolean[], i: number) => arr.map((v, k) => (k === i ? !v : v));

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
        <style>{`.chick-range{width:100%;accent-color:#123B2C;height:44px;margin:0}`}</style>

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
              <span style={{ background: '#FFE2D3', color: '#7A2E00', borderRadius: 6, padding: '4px 8px' }}>HEALTH</span>
              <span style={{ background: '#FFF2D0', color: '#7A4E00', borderRadius: 6, padding: '4px 8px' }}>FEED</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Raising healthy chicks: warmth, vaccines and feed</h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              The first weeks decide the whole flock. Get the heat, the shots and the feed right, and the rest is easier.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderTop: '1px solid #DCDACF', marginTop: 6, paddingTop: 14 }}>
              <span style={{ width: 40, height: 40, borderRadius: '50%', background: '#123B2C', color: '#E5F27A', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}`, flex: 'none' }}>F1</span>
              <span style={{ display: 'flex', flexDirection: 'column', font: `500 13px ${inter}`, color: '#44504A' }}>
                <span style={{ fontWeight: 700, color: '#1A1F1B' }}>Farm One editors</span>
                <span>7 min read · Based on ICAR-DPR, NABARD and state veterinary guidance</span>
              </span>
            </div>
          </div>

          {/* Illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#FFE2D3', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <ellipse cx="195" cy="150" rx="150" ry="22" fill="#FFFFFF" />
              <g fill="#FFFFFF" stroke={RUST} strokeWidth="3">
                <circle cx="150" cy="118" r="22" />
                <circle cx="195" cy="108" r="24" />
                <circle cx="242" cy="118" r="22" />
              </g>
              <g fill={RUST}>
                <circle cx="156" cy="112" r="3" />
                <circle cx="201" cy="102" r="3" />
                <circle cx="248" cy="112" r="3" />
              </g>
              <g fill="#E5F27A" stroke={RUST} strokeWidth="2">
                <path d="M146 122 l-10 4 l10 3 z" />
                <path d="M191 112 l-10 4 l10 3 z" />
                <path d="M238 122 l-10 4 l10 3 z" />
              </g>
              <circle cx="195" cy="38" r="20" fill="#E5F27A" stroke={RUST} strokeWidth="3" />
              <g stroke={RUST} strokeWidth="3" strokeLinecap="round">
                <path d="M195 6v8M195 62v8M163 38h8M219 38h8" />
              </g>
            </svg>
          </div>

          {/* Brooder */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              Day-old chicks cannot keep themselves warm. They also have no protection against the common diseases. So you provide both: heat first, then vaccines on time.
            </p>
            <h2 style={H2}>How warm should the brooder be?</h2>
            <p style={{ margin: 0 }}>
              Heat the brooder 24 hours before the chicks arrive. Start at about 35°C in the first week. Then lower it a little every week, until it reaches about 21°C.
            </p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · BROODER HEAT</div>
            <div style={ROW}>
              <label htmlFor="chick-w">Chick age</label>
              <span>Week {week}</span>
            </div>
            <input id="chick-w" className="chick-range" type="range" min={1} max={6} step={1} value={week} onChange={(e) => setWeek(Number(e.target.value))} />
            <div style={{ background: week <= 2 ? '#FFE2D3' : '#FFF2D0', borderRadius: 18, padding: 16, display: 'flex', alignItems: 'flex-end', gap: 14 }}>
              <div style={{ flex: 'none', width: 36, height: 120, borderRadius: 18, background: '#FFFFFF', border: `2px solid ${RUST}`, display: 'flex', alignItems: 'flex-end', overflow: 'hidden' }}>
                <div style={{ width: '100%', height: `${tempPct}%`, background: RUST, transition: 'height 200ms ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.1em', color: '#7A2E00' }}>BROODER TEMPERATURE</div>
                <div style={{ font: `700 34px ${serif}`, color: '#7A2E00' }}>{temp}°C</div>
                <div style={{ font: `400 13px ${inter}`, lineHeight: 1.45 }}>Drops about 2.8°C each week.</div>
              </div>
            </div>
            <div style={{ font: `400 13px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
              Watch the chicks too. If they huddle under the heater, they are cold. If they scatter to the edges, they are too hot.
            </div>
          </div>

          {/* Quote + vaccines */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: `3px solid ${RUST}`, borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “Dry litter keeps the shed healthy. Wet litter brings ammonia and coccidiosis.”
            </div>
            <p style={{ margin: 0 }}>
              Spread dry rice husk, sawdust or sand about 5 cm deep, and keep it dry. Clean waterers and the right height also help: set each drinker at about the height of the birds' backs.
            </p>
            <h2 style={H2}>The vaccination calendar</h2>
            <p style={{ margin: 0 }}>This is the schedule for backyard birds from ICAR-DPR. Move the slider to a chick's age and see what is due.</p>
          </div>

          <div style={{ ...CARD, margin: '16px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · VACCINE TIMELINE</div>
            <div style={ROW}>
              <label htmlFor="chick-d">Bird age</label>
              <span>Day {day}</span>
            </div>
            <input id="chick-d" className="chick-range" type="range" min={0} max={70} step={1} value={day} onChange={(e) => setDay(Number(e.target.value))} />
            <div style={{ background: dueNow ? '#FFDDE5' : '#F2F0E6', borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.1em', color: dueNow ? '#A3173F' : '#44504A' }}>{vLabel}</div>
              <div style={{ font: `700 22px ${serif}`, lineHeight: 1.2, color: dueNow ? '#A3173F' : '#44504A' }}>{vTitle}</div>
              <div style={{ font: `400 14px ${inter}`, lineHeight: 1.5 }}>{vNote}</div>
            </div>
            {VACCINES.map((v) => {
              const done = v.d <= day;
              return (
                <div key={v.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderTop: '1px solid #E7E5DA' }}>
                  <span style={{ flex: 'none', width: 34, height: 34, borderRadius: '50%', background: done ? '#0F6B50' : '#F2F0E6', color: done ? '#FFFFFF' : '#5C6862', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}` }}>
                    {done ? '✓' : '·'}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ font: `700 14px ${inter}` }}>{v.name}</span>
                    <span style={{ font: `500 12px ${inter}`, color: '#5C6862' }}>{v.when}</span>
                  </span>
                </div>
              );
            })}
            <div style={{ font: `400 13px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
              Repeat doses every 6 months. Commercial broilers and layers follow separate schedules, so confirm timings with your veterinary officer.
            </div>
          </div>

          {/* FCR */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>Is your feed paying off?</h2>
            <p style={{ margin: 0 }}>
              The feed conversion ratio, or FCR, tells you how many kilos of feed it takes to grow one kilo of bird. Lower is better.
            </p>
          </div>

          <div style={{ ...CARD, margin: '16px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · FCR CALCULATOR</div>
            <div style={ROW}>
              <label htmlFor="chick-fd">Feed eaten per bird</label>
              <span>{feed.toFixed(1)} kg</span>
            </div>
            <input id="chick-fd" className="chick-range" type="range" min={2} max={5} step={0.1} value={feed} onChange={(e) => setFeed(Number(e.target.value))} />
            <div style={ROW}>
              <label htmlFor="chick-wt">Live weight per bird</label>
              <span>{wt.toFixed(1)} kg</span>
            </div>
            <input id="chick-wt" className="chick-range" type="range" min={1} max={3} step={0.1} value={wt} onChange={(e) => setWt(Number(e.target.value))} />
            <div style={{ background: fTint, borderRadius: 18, padding: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.1em', color: fInk }}>YOUR FCR</div>
              <div style={{ font: `700 30px ${serif}`, color: fInk }}>{fcr.toFixed(2)}</div>
              <div style={{ font: `400 13px ${inter}`, lineHeight: 1.5 }}>{fNote}</div>
            </div>
            <div style={{ font: `400 13px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>Model broiler farms plan on an FCR of about 1.94 to 2.0.</div>
          </div>

          <div style={{ margin: '12px 16px 0', display: 'flex', gap: 10 }}>
            {[
              ['8.5 kg', 'feed per layer, up to 20 weeks'],
              ['40 kg', 'feed per layer, over the laying year'],
            ].map(([big, small]) => (
              <div key={big} style={{ flex: 1, background: '#FFF2D0', borderRadius: 18, padding: 14 }}>
                <div style={{ font: `700 26px ${serif}`, color: '#7A4E00' }}>{big}</div>
                <div style={{ font: `500 13px ${inter}`, lineHeight: 1.4 }}>{small}</div>
              </div>
            ))}
          </div>

          {/* Biosecurity */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>Keep disease out</h2>
            <p style={{ margin: 0 }}>Biosecurity is simply good habits. Tick the ones you already follow.</p>
          </div>
          <div style={{ ...CARD, margin: '16px 16px 0', gap: 6 }}>
            <div style={{ ...EYEBROW, color: '#5C6862' }}>MY HABITS · {bd} OF 6</div>
            {BIO.map((label, i) => (
              <Tick key={label} on={bio[i]} label={label} minH={52} onClick={() => setBio(toggle(bio, i))} />
            ))}
            <div style={{ font: `700 14px ${inter}`, color: bd === 6 ? '#0F6B50' : '#44504A', paddingTop: 6 }}>
              {bd === 6 ? 'Your farm is well protected.' : bd === 0 ? 'Tick the habits you follow.' : `${6 - bd} habits to add.`}
            </div>
          </div>

          {/* Key takeaways */}
          <div style={{ margin: '28px 16px 0', background: '#E5F27A', borderRadius: 24, padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#123B2C' }}>KEY TAKEAWAYS</div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 6, listStyle: 'disc' }}>
              <li>Heat the brooder a day early. Start near 35°C and step down to about 21°C.</li>
              <li>Vaccinate on time: Marek's on day 1, then Newcastle, Gumboro and the rest.</li>
              <li>Track your FCR. A lower number means more bird from every kilo of feed.</li>
              <li>Rest and clean the shed between batches.</li>
            </ul>
          </div>

          {/* Check before you move on */}
          <div style={{ ...CARD, margin: '16px 16px 0', gap: 10 }}>
            <div style={{ ...EYEBROW, color: '#5C6862' }}>BEFORE YOU MOVE ON · {cd} OF 3</div>
            {CHECKS.map((label, i) => (
              <Tick key={label} on={checks[i]} label={label} minH={48} onClick={() => setChecks(toggle(checks, i))} />
            ))}
          </div>

          {/* Good to know */}
          <div style={{ margin: '16px 16px 0', background: '#E1F0F3', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F5F46' }}>GOOD TO KNOW · FARM SETUP</div>
            <div style={{ fontWeight: 700, fontSize: 20, lineHeight: 1.25 }}>What a poultry farm costs and who funds it</div>
            <div style={{ font: `400 14px ${inter}`, lineHeight: 1.5, color: '#44504A' }}>See real project numbers and the rural poultry subsidy.</div>
          </div>

          <div style={{ padding: '22px 22px 40px', font: `400 13px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
            Source: ICAR-DPR backyard vaccination schedule; NABARD model projects; state veterinary department guidance.
          </div>
        </div>
      </div>
    </div>
  );
};
