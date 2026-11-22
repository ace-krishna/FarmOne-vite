import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

// Design is 390px wide; the phone shell is 375px
const UI_SCALE = 375 / 390;

const serif = "'Source Serif 4',Georgia,serif";
const inter = 'Inter,sans-serif';
const GREEN = '#0F6B50';

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
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: GREEN };

type System = 'deep' | 'cage';

const ROUTINE: Record<System, { label: string; rows: [string, string][] }> = {
  deep: {
    label: 'Deep litter',
    rows: [
      ['Every 1–2 days', 'Scratch or stir the bedding so it stays loose and dry.'],
      ['All day', 'Keep air moving through the shed. Fix leaking drinkers at once.'],
      ['End of batch', 'Take out the bed with the droppings (usually after 42 to 45 days for broilers) and send it for composting or sale.'],
      ['After clearing', 'Wash the shed, apply lime as a disinfectant, and let it rest before the next chicks.'],
    ],
  },
  cage: {
    label: 'Cages',
    rows: [
      ['Every day', 'Look for wet spots under the cages. Keep air moving to dry the droppings.'],
      ['All day', 'Check the drinker nipples and pipes for leaks.'],
      ['Every 4–6 months', 'Take the manure out and sell it or compost it.'],
      ['Between flocks', 'Clean the sheds, disinfect, and let them rest.'],
    ],
  },
};

const CHECKS = [
  'I stir the litter every day or two',
  'The air moves through the shed all day',
  'Drinkers are checked for leaks',
  'Standing water is cleared',
  'I wash, lime and rest between batches',
];

export const DryLitterArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [phase, setPhase] = useState<'start' | 'grown'>('start');
  const [sys, setSys] = useState<System>('deep');
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

  const grown = phase === 'grown';
  const cn = Object.values(chk).filter(Boolean).length;
  const pill = (on: boolean): React.CSSProperties => ({
    flex: 1,
    minHeight: 44,
    border: 0,
    borderRadius: 999,
    background: on ? '#123B2C' : '#F2F0E6',
    color: on ? '#FFFFFF' : '#1A1F1B',
    cursor: 'pointer',
  });

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
              <span style={{ background: '#DDF4EA', color: GREEN, borderRadius: 6, padding: '4px 8px' }}>SHED CARE</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>DAILY ROUTINE</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Dry litter, fresh air: the daily shed routine</h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              A dry shed with moving air is a healthier shed. Here is what to do every day, every batch and every few months.
            </div>
          </div>

          {/* Shed illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#DDF4EA', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <rect x="40" y="70" width="310" height="90" fill="#FFFFFF" />
              <path d="M30 74l165-48 165 48z" fill="#1B7F5F" />
              <rect x="40" y="140" width="310" height="20" fill="#E5C58A" />
              <g fill="#F5B73B">
                <circle cx="90" cy="130" r="9" />
                <circle cx="140" cy="134" r="9" />
                <circle cx="200" cy="130" r="9" />
                <circle cx="260" cy="134" r="9" />
                <circle cx="310" cy="130" r="9" />
              </g>
              <g stroke="#1B7F5F" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M64 96c14-8 28 8 42 0" />
                <path d="M164 96c14-8 28 8 42 0" />
                <path d="M264 96c14-8 28 8 42 0" />
              </g>
            </svg>
          </div>

          {/* Intro */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>Wet bedding is the start of most shed problems. It turns sour, gives off a sharp smell and gases that bother both birds and workers.</p>
            <p style={{ margin: 0 }}>The cure is not complicated. Keep the litter dry, and keep fresh air moving over it.</p>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Build the bed right</h2>
            <p style={{ margin: 0 }}>
              In a deep litter shed, birds live on a bed of rice husk, sawdust, groundnut hulls, wood shavings or dried leaves. Use whatever is easy to get near you.
            </p>
          </div>

          {/* Litter depth */}
          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · LITTER DEPTH</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {([['start', 'Day one'], ['grown', 'As birds grow']] as const).map(([k, label]) => (
                <button key={k} type="button" aria-pressed={phase === k} onClick={() => setPhase(k)} style={{ ...pill(phase === k), font: `600 13px ${inter}` }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ background: '#F2F0E6', borderRadius: 16, padding: 14, display: 'flex', alignItems: 'flex-end', gap: 16, height: 150 }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%' }}>
                <div style={{ height: grown ? 40 : 0, background: '#E5B94A', borderRadius: '6px 6px 0 0', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 12px ${inter}`, color: '#3F2A00', overflow: 'hidden', transition: 'height 250ms ease' }}>
                  {grown ? 'Top-up 5 to 6 cm' : ''}
                </div>
                <div style={{ height: 40, background: '#C9A878', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 12px ${inter}`, color: '#3F2A00' }}>First layer 5 to 6 cm</div>
                <div style={{ height: 8, background: '#8A8576', borderRadius: '0 0 4px 4px' }} />
              </div>
              <div style={{ flex: 'none', width: 120, font: `700 28px ${inter}`, textAlign: 'center', color: GREEN }}>
                {grown ? '10–12 cm' : '5–6 cm'}
                <div style={{ font: `500 12px ${inter}`, color: '#44504A' }}>total depth</div>
              </div>
            </div>
            <div style={{ font: `400 14px ${inter}`, lineHeight: 1.5, color: '#44504A' }}>
              {grown ? 'As the birds get bigger, add another 5 to 6 cm of dry bedding on top.' : 'Start the batch with 5 to 6 cm of clean, dry bedding.'}
            </div>
          </div>

          {/* Quote + routine planner */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “Stir the bedding every day or two. Wet bedding in a corner is a problem waiting.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Your routine, by system</h2>
            <p style={{ margin: 0 }}>Pick the way your birds are housed. Then tap through the routine.</p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>TRY IT · ROUTINE PLANNER</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(Object.keys(ROUTINE) as System[]).map((k) => (
                <button key={k} type="button" aria-pressed={sys === k} onClick={() => setSys(k)} style={{ ...pill(sys === k), font: `600 14px ${inter}` }}>
                  {ROUTINE[k].label}
                </button>
              ))}
            </div>
            {ROUTINE[sys].rows.map(([when, what], i) => (
              <div key={`${sys}-${i}`} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: i % 2 === 0 ? '#F2F0E6' : '#FBFAF6', borderRadius: 16, padding: 12 }}>
                <span style={{ flex: 'none', minWidth: 78, textAlign: 'center', background: '#FFFFFF', borderRadius: 999, font: `700 12px ${inter}`, padding: '6px 10px', color: GREEN }}>{when}</span>
                <span style={{ font: `400 15px ${inter}`, lineHeight: 1.5 }}>{what}</span>
              </div>
            ))}
          </div>

          {/* Water */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>Water: use less, spill less</h2>
            <p style={{ margin: 0 }}>
              Leaks and spills wet the litter. Fix drinkers that overflow, use well-kept self-watering drinkers, and clear standing water around the shed, because mosquitoes and flies love it.
            </p>
            <p style={{ margin: 0 }}>
              When you wash the shed between batches, try dry cleaning first. If you need water, hot water or a pressure pump uses less than plain cold water. Collect the wash water in a holding tank and use it on your garden or green belt.
            </p>
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Start with 5 to 6 cm of dry bedding and top up as birds grow.</li>
                <li>Stir the bed at least once every two days.</li>
                <li>Keep air moving and fix leaks fast.</li>
                <li>Between batches: clear out, wash, apply lime, and rest the shed.</li>
              </ul>
            </div>
          </div>

          {/* Checklist */}
          <div style={{ padding: '22px 16px 0' }}>
            <div style={{ ...CARD, gap: 6 }}>
              <div style={EYEBROW}>BEFORE YOU MOVE ON · SHED CHECK</div>
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
              <div style={{ font: `600 13px ${inter}`, color: GREEN, paddingTop: 4 }}>
                {cn === CHECKS.length ? 'Shed routine in place' : `${cn} of ${CHECKS.length} done`}
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
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Keep flies and rats out, and medicine in its place</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>5 min · Checklist</div>
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
