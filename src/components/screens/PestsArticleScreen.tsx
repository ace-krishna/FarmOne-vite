import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void; // "Back to" card at the bottom
}

// Design is 390px wide; the phone shell is 375px
const UI_SCALE = 375 / 390;

const serif = "'Source Serif 4',Georgia,serif";
const inter = 'Inter,sans-serif';
const BROWN = '#7A4E00';

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
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: BROWN };

const SPOTS: [string, string][] = [
  ['Wet manure', 'Keep it dry with moving air, treat and dispose of it properly, and cover storage.'],
  ['Spilled feed', 'Sweep up spills and avoid overfilling feeders.'],
  ['Leaking drinkers and pipes', 'Repair leaks quickly and clear standing water.'],
  ['Broken eggs', 'Remove them straight away.'],
  ['Dead birds', 'Take them out promptly and dispose of them within 24 hours.'],
];

const RATS: [string, string][] = [
  ['Close them out', 'Use rodent-proof doors and windows, and seal gaps.'],
  ['Trap the ones inside', 'Use traps and glue boards.'],
  ['Use tracking powder', 'Place it along their runs, where they walk.'],
  ['Keep feed covered', 'Store it so rats cannot get at it.'],
];

const STORE = [
  { big: '2 ft', text: 'Raise the floor at least 2 feet above the ground.', tint: '#DDF4EA', ink: '#0F6B50' },
  { big: 'Concrete', text: 'Use a concrete floor in the feed mill and store.', tint: '#DDEBFF', ink: '#1F4E9A' },
  { big: 'Tyre dip', text: 'Put one at the farm gate so vehicles do not bring in dirt.', tint: '#FFE2D3', ink: '#A04000' },
  { big: 'Dust masks', text: 'Give them to workers, and fit a dust collector on the grinder.', tint: '#EADDFB', ink: '#5B2E91' },
];

const MYTHS = [
  { claim: 'Antibiotics in the feed make birds grow faster, so it pays to add them.', verdict: 'MYTH', why: 'The Indian feed standard says antibiotic growth promoters are not recommended in poultry feed.', ink: '#A3173F', bg: '#FFDDE5' },
  { claim: 'Antibiotics are for sick birds, and for the vet to prescribe.', verdict: 'FACT', why: 'Use them only to treat diseased birds, with a prescription, following the rules of the animal husbandry and health departments.', ink: '#0F6B50', bg: '#DDF4EA' },
  { claim: 'Fewer birds dying means less to dispose of.', verdict: 'FACT', why: 'Good care and disease prevention reduce deaths on the farm, and that cuts waste, smell and pests too.', ink: '#0F6B50', bg: '#DDF4EA' },
];

export const PestsArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [spot, setSpot] = useState(0);
  const [rchk, setRchk] = useState<Record<number, boolean>>({ 0: true });
  const [open, setOpen] = useState<Record<number, boolean>>({});
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
              <span style={{ background: '#FFF2D0', color: BROWN, borderRadius: 6, padding: '4px 8px' }}>PESTS</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>BIRD HEALTH</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>Keep flies and rats out, and medicine in its place</h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>Pests are easier to prevent than to chase. So is the misuse of medicine.</div>
          </div>

          {/* Illustration: fly + rat with a "no" sign */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#FFF2D0', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <g fill={BROWN}>
                <ellipse cx="150" cy="100" rx="22" ry="14" />
                <circle cx="178" cy="96" r="9" />
              </g>
              <g stroke={BROWN} strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M132 92l-14-10M140 114l-8 16M158 114l4 18" />
              </g>
              <g fill="#FFFFFF" opacity="0.9">
                <ellipse cx="148" cy="82" rx="18" ry="10" />
                <ellipse cx="164" cy="80" rx="16" ry="9" />
              </g>
              <circle cx="270" cy="95" r="50" fill="none" stroke="#C0392B" strokeWidth="8" />
              <path d="M235 130l70-70" stroke="#C0392B" strokeWidth="8" />
              <g fill={BROWN}>
                <ellipse cx="270" cy="98" rx="20" ry="12" />
                <circle cx="292" cy="94" r="8" />
              </g>
            </svg>
          </div>

          {/* Intro */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              Flies breed in wet manure, spilled feed and rotting waste. Rats come for the feed and the shelter. Both carry disease, and both are a sign that something in the shed is untidy.
            </p>
            <p style={{ margin: 0 }}>The best fix is to take away what they come for.</p>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Where do the flies come from?</h2>
            <p style={{ margin: 0 }}>Tap each spot to see how to stop it.</p>
          </div>

          {/* Fly spots */}
          <div style={{ ...CARD, margin: '18px 16px 0', gap: 8 }}>
            <div style={EYEBROW}>TRY IT · FLY SPOTS</div>
            {SPOTS.map(([name, fix], i) => {
              const on = spot === i;
              return (
                <button
                  key={name}
                  type="button"
                  aria-expanded={on}
                  onClick={() => setSpot(on ? -1 : i)}
                  style={{ width: '100%', textAlign: 'left', border: `2px solid ${on ? BROWN : '#E7E5DA'}`, background: on ? '#FFF2D0' : '#FFFFFF', borderRadius: 16, padding: '10px 14px', minHeight: 52, fontFamily: inter, color: '#1A1F1B', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', font: `700 15px ${inter}` }}>
                    <span>{name}</span>
                    <span aria-hidden="true" style={{ font: `500 20px ${inter}` }}>{on ? '−' : '+'}</span>
                  </span>
                  {on && <span style={{ font: `400 14px ${inter}`, lineHeight: 1.5, color: '#2F3F39' }}>{fix}</span>}
                </button>
              );
            })}
            <div style={{ font: `400 13px ${inter}`, lineHeight: 1.5, color: '#44504A', paddingTop: 4 }}>
              Add wire netting, traps, repellents or insecticides as extra help, but fix the source first.
            </div>
          </div>

          {/* Quote + rats */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “A clean, dry shed gives flies nowhere to breed.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Keep rats out</h2>
            <p style={{ margin: 0 }}>Start with locking them out. Then trap the ones that get in.</p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0', gap: 6 }}>
            <div style={EYEBROW}>YOUR RAT-PROOFING LIST</div>
            {RATS.map(([label, note], i) => {
              const on = !!rchk[i];
              return (
                <button
                  key={label}
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  onClick={() => setRchk({ ...rchk, [i]: !on })}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', border: 0, background: 'transparent', minHeight: 52, padding: '6px 0', font: `500 15px ${inter}`, color: '#1A1F1B', cursor: 'pointer' }}
                >
                  <span style={{ flex: 'none', width: 28, height: 28, borderRadius: 8, border: '2px solid #123B2C', background: on ? '#123B2C' : '#FFFFFF', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}` }}>
                    {on ? '✓' : ''}
                  </span>
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontWeight: 600, lineHeight: 1.35 }}>{label}</span>
                    <span style={{ font: `400 13px ${inter}`, lineHeight: 1.4, color: '#44504A' }}>{note}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feed store */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>Protect the feed store</h2>
            <p style={{ margin: 0 }}>The feed store pulls in pests and carries dust. Build and run it so it stays clean.</p>
          </div>

          <div style={{ margin: '16px 22px 0', display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 10, fontFamily: inter }}>
            {STORE.map((s) => (
              <div key={s.big} style={{ background: s.tint, borderRadius: 18, padding: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ font: `700 22px ${inter}`, color: s.ink }}>{s.big}</div>
                <div style={{ font: `400 13px ${inter}`, lineHeight: 1.45, color: '#1A1F1B' }}>{s.text}</div>
              </div>
            ))}
          </div>

          {/* Medicine */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <h2 style={H2}>Medicine is not a feed additive</h2>
            <p style={{ margin: 0 }}>
              Some farmers mix antibiotics into feed to make birds grow faster. Indian feed standards say not to. Tap each card to check what you know.
            </p>
          </div>

          <div style={{ ...CARD, margin: '18px 16px 0', gap: 10 }}>
            <div style={EYEBROW}>MYTH OR FACT?</div>
            {MYTHS.map((k, i) => {
              const on = !!open[i];
              return (
                <button
                  key={k.claim}
                  type="button"
                  aria-expanded={on}
                  onClick={() => setOpen({ ...open, [i]: !on })}
                  style={{ width: '100%', textAlign: 'left', border: 0, background: on ? k.bg : '#F2F0E6', borderRadius: 16, padding: 14, fontFamily: inter, color: '#1A1F1B', display: 'flex', flexDirection: 'column', gap: 8, minHeight: 56, cursor: 'pointer' }}
                >
                  <span style={{ font: `600 15px ${inter}`, lineHeight: 1.4 }}>“{k.claim}”</span>
                  {on ? (
                    <span style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <span style={{ font: `700 12px ${inter}`, letterSpacing: '0.08em', color: k.ink }}>{k.verdict}</span>
                      <span style={{ font: `400 14px ${inter}`, lineHeight: 1.5, color: '#2F3F39' }}>{k.why}</span>
                    </span>
                  ) : (
                    <span style={{ font: `500 12px ${inter}`, color: '#5C6862' }}>Tap to reveal</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Remove what flies and rats come for: wet manure, spilled feed, dead birds.</li>
                <li>Lock rats out first, then trap.</li>
                <li>Keep the feed store raised, concrete and clean.</li>
                <li>Use antibiotics only for sick birds, and only on a vet’s prescription.</li>
              </ul>
            </div>
          </div>

          {/* Back to */}
          <div style={{ padding: '22px 16px 0' }}>
            <div
              onClick={onOpenNext}
              style={{ background: '#E1F0F3', borderRadius: 22, padding: 18, display: 'flex', alignItems: 'center', gap: 14, fontFamily: inter, cursor: onOpenNext ? 'pointer' : 'default' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F5F46' }}>BACK TO</div>
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Is your manure pile healthy?</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>5 min · Pile checker</div>
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${inter}` }}>›</span>
            </div>
          </div>

          <div style={{ padding: '18px 22px 40px', font: `400 12px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
            Source: Central Pollution Control Board, Environmental Guidelines for Poultry Farms (August 2021), citing Bureau of Indian Standards IS 1374:2007 on poultry feed.
          </div>
        </div>
      </div>
    </div>
  );
};
