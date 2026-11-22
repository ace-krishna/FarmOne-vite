import React, { useRef, useState } from 'react';
import { CowFigure } from './DairyHeroArt';

interface Props {
  onBack: () => void;
  /** Scroll straight to a section when the article opens (from the Follow the journey list) */
  initialSection?: 'shed' | 'paperwork' | 'yield';
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const ITEMS = [
  { name: 'Livestock', color: '#1B7F5F', low: 6.5, high: 8.5, note: '10 high-yielding cows at ₹65,000 to ₹85,000 each.' },
  { name: 'Shed and civil work', color: '#E07B00', low: 1.8, high: 2.5, note: '600 sq. ft. shed, paddock fencing and manger.' },
  { name: 'Machinery', color: '#2F6FD0', low: 0.9, high: 1.3, note: 'Chaff cutter, milking machine, cans and mats.' },
  { name: 'Water and electrics', color: '#8A4FD0', low: 0.35, high: 0.5, note: 'Submersible pump, piping, drinking bowls and lights.' },
  { name: 'Working capital and vet', color: '#E0386A', low: 0.6, high: 0.8, note: 'One month of feed stock, first vaccines and medicine.' },
];

const BREEDS = [
  { name: 'Indigenous (Gir, Sahiwal, Red Sindhi)', lo: 10, hi: 16, color: '#1B7F5F', note: 'High climate tolerance, tick-resistant, and A2 milk can fetch a premium in city markets.' },
  { name: 'Crossbred (HF cross, Jersey cross)', lo: 15, hi: 25, color: '#E07B00', note: 'Higher volume, but needs cool housing, mist sprinklers and high-energy feed.' },
];

const CHECKS = [
  { label: 'Gram Panchayat or ward NOC', note: 'A basic permission letter is standard.' },
  { label: 'FSSAI basic registration', note: 'Needed if you sell raw milk to households, shops or under your own brand.' },
  { label: 'Kisan Credit Card', note: 'Working-capital loan at subsidised interest.' },
  { label: 'AHIDF or state mission subsidy', note: 'Interest subvention and capital subsidy through banks. Confirm current terms.' },
  { label: 'Vaccination schedule', note: 'FMD, HS and BQ through the local government veterinary centre.' },
];

const fmt = (n: number) => n.toFixed(2).replace(/0$/, '');

const Card: React.FC<{ label: string; children: React.ReactNode; gap?: string }> = ({ label, children, gap = 'gap-3' }) => (
  <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col ${gap} ${sans}`}>
    <div className="text-[11px] font-bold tracking-[0.12em] text-[#7A2E00] uppercase">{label}</div>
    {children}
  </div>
);

const Toggle: React.FC<{ options: string[]; value: number; onChange: (i: number) => void; size?: number }> = ({ options, value, onChange, size = 14 }) => (
  <div className="flex gap-2">
    {options.map((o, i) => (
      <button
        key={o}
        type="button"
        aria-pressed={value === i}
        onClick={() => onChange(i)}
        style={{ fontSize: size }}
        className={`flex-1 min-h-[44px] rounded-full font-semibold cursor-pointer transition-colors ${value === i ? 'bg-[#123B2C] text-white' : 'bg-[#F2F0E6] text-[#1A1F1B]'}`}
      >
        {o}
      </button>
    ))}
  </div>
);

const H2: React.FC<{ children: React.ReactNode; className?: string; id?: string }> = ({ children, className = '', id }) => (
  <h2 data-section={id} className={`m-0 font-bold text-[26px] leading-[1.2] ${className}`}>{children}</h2>
);

const R_OUT = 95;
const R_IN = 59;
const POP = 7;
const POP_SCALE = 1.08;
const pt = (r: number, a: number) => `${(95 + r * Math.cos(a)).toFixed(2)} ${(95 + r * Math.sin(a)).toFixed(2)}`;
/** Ring sector from fraction `from` to `to` (0..1), starting at 12 o'clock. */
const sector = (from: number, to: number) => {
  const a0 = from * 2 * Math.PI - Math.PI / 2;
  const a1 = to * 2 * Math.PI - Math.PI / 2;
  const large = to - from > 0.5 ? 1 : 0;
  return `M${pt(R_OUT, a0)} A${R_OUT} ${R_OUT} 0 ${large} 1 ${pt(R_OUT, a1)} L${pt(R_IN, a1)} A${R_IN} ${R_IN} 0 ${large} 0 ${pt(R_IN, a0)} Z`;
};

/** A feed alley (yellow, with hay) or a dung channel (brown) running across the shed. */
const Strip: React.FC<{ kind: 'feed' | 'dung'; tall?: boolean }> = ({ kind, tall }) => {
  const feed = kind === 'feed';
  return (
    <div
      className={`relative ${tall ? 'h-[28px]' : 'h-[22px]'} rounded-md overflow-hidden flex items-center justify-center text-[11px] font-semibold`}
      style={{
        background: feed ? '#F6DD6B' : '#8A5A36',
        color: feed ? '#5A4300' : '#FFF3E6',
        boxShadow: feed ? 'inset 0 -2px 0 rgba(160,120,0,0.25)' : 'inset 0 2px 3px rgba(0,0,0,0.3)',
        transition: 'background-color 450ms ease, color 450ms ease',
      }}
    >
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 120 20" aria-hidden>
        {feed
          ? [6, 22, 38, 54, 70, 86, 102, 116].map((x) => (
              <g key={x} stroke="#C9A02A" strokeWidth="1.2" strokeLinecap="round" opacity="0.8">
                <path d={`M${x} 17 L${x - 3} 9`} />
                <path d={`M${x} 17 L${x} 7`} />
                <path d={`M${x} 17 L${x + 3} 9`} />
              </g>
            ))
          : [10, 28, 47, 66, 83, 101].map((x, i) => (
              <ellipse key={x} cx={x} cy={i % 2 ? 6 : 14} rx="4" ry="1.6" fill="#6B4026" opacity="0.7" />
            ))}
      </svg>
      <span className={`relative px-2 rounded ${feed ? 'bg-[#F6DD6B]/85' : 'bg-[#8A5A36]/80'}`}>{feed ? 'Feed alley' : 'Dung channel'}</span>
    </div>
  );
};

export const DairyCostArticleScreen: React.FC<Props> = ({ onBack, initialSection }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [mode, setMode] = useState(0); // 0 low, 1 high
  const [sel, setSel] = useState(0);
  const [layout, setLayout] = useState(0); // 0 head, 1 tail
  const [bsel, setBsel] = useState(0);
  const [chk, setChk] = useState<Record<number, boolean>>({});

  // Jump to the requested section once the page has laid out
  React.useEffect(() => {
    if (!initialSection) return;
    const t = window.setTimeout(() => {
      const root = scrollRef.current;
      const target = root?.querySelector<HTMLElement>(`[data-section="${initialSection}"]`);
      if (root && target) root.scrollTop = target.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 16;
    }, 60);
    return () => window.clearTimeout(t);
  }, [initialSection]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const vals = ITEMS.map((it) => (mode === 0 ? it.low : it.high));
  const total = vals.reduce((a, b) => a + b, 0);
  let acc = 0;
  const slices = ITEMS.map((it, i) => {
    const from = acc / total;
    acc += vals[i];
    const to = acc / total;
    const mid = ((from + to) / 2) * 2 * Math.PI - Math.PI / 2;
    return { it, from, to, dx: Math.cos(mid) * POP, dy: Math.sin(mid) * POP };
  });

  const head = layout === 0;
  const rowA = [1, 2, 3, 4, 5];
  const rowB = head ? [10, 9, 8, 7, 6] : [6, 7, 8, 9, 10];
  const doneCount = Object.values(chk).filter(Boolean).length;

  return (
    <div className={`h-full flex flex-col bg-[#FBFAF6] text-[#1A1F1B] ${serif}`}>
      {/* Top bar */}
      <div className="shrink-0 bg-[#FBFAF6] z-10">
        <div className="flex items-center justify-between px-2 pt-3.5">
          <button type="button" aria-label="Back" onClick={onBack} className="w-11 h-11 flex items-center justify-center cursor-pointer">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className={`${sans} text-[12px] font-bold tracking-[0.1em] text-[#123B2C]`}>FARM SETUP</div>
          <button
            type="button"
            aria-label="Save for later"
            aria-pressed={saved}
            onClick={() => setSaved((s) => !s)}
            className="w-11 h-11 flex items-center justify-center cursor-pointer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 3h12v18l-6-4-6 4z" />
            </svg>
          </button>
        </div>
        <div className="h-1 bg-[#E7E5DA] mt-1.5">
          <div className="h-full bg-[#123B2C] transition-[width] duration-100" style={{ width: `${Math.max(progress, 2)}%` }} />
        </div>
      </div>

      <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto scrollbar-none pb-10">
        {/* Header */}
        <div className="px-4 pt-5 flex flex-col gap-3">
          <div className={`flex gap-2 flex-wrap ${sans} text-[11px] font-bold tracking-[0.1em]`}>
            <span className="bg-[#FFE2D3] text-[#7A2E00] rounded-md px-2 py-1">DAIRY · PLAN</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">What a 10-cow dairy really costs, and where the money goes</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">A first dairy unit in India, from land to licence, in one honest read.</div>
          <div className="flex items-center gap-2.5 border-t border-[#DCDACF] mt-1.5 pt-3.5">
            <span className={`w-10 h-10 rounded-full bg-[#123B2C] text-[#E5F27A] flex items-center justify-center ${sans} font-bold text-[14px]`}>F1</span>
            <span className={`flex flex-col ${sans} font-medium text-[13px] text-[#44504A]`}>
              <span className="font-bold text-[#1A1F1B]">Farm One editors</span>
              <span>8 min read · last verified 24 November</span>
            </span>
          </div>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            A 10-cow unit is one of the most workable ways into commercial farming: small enough to run yourself, big enough to earn. The guide puts the whole bill at <strong>₹10.15 to ₹13.6 lakh</strong>.
          </p>
          <p className="m-0">Where does it go? Flip the chart.</p>
        </div>

        {/* Cost breakdown */}
        <Card label="Try it · Cost breakdown" gap="gap-3.5">
          <Toggle options={['Low estimate', 'High estimate']} value={mode} onChange={setMode} />
          <div className="flex justify-center py-1">
            <div className="relative w-[222px] h-[222px]">
              <svg viewBox="-16 -16 222 222" className="absolute inset-0 w-full h-full" role="img" aria-label="Cost breakdown chart">
                {slices.map((sl, i) => {
                  const on = sel === i;
                  return (
                    <path
                      key={sl.it.name}
                      d={sector(sl.from, sl.to)}
                      fill={sl.it.color}
                      stroke="#FFFFFF"
                      strokeWidth={on ? 2 : 1.5}
                      strokeLinejoin="round"
                      onClick={() => setSel(i)}
                      className="cursor-pointer"
                      style={{
                        transform: on ? `translate(${sl.dx}px, ${sl.dy}px) scale(${POP_SCALE})` : 'translate(0,0) scale(1)',
                        transformOrigin: '95px 95px',
                        transition: 'transform 260ms cubic-bezier(0.34,1.56,0.64,1)',
                        filter: on ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.32))' : 'none',
                        opacity: sel === i ? 1 : 0.92,
                      }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[11px] font-semibold text-[#44504A]">TOTAL</div>
                <div className="text-[22px] font-bold">₹{fmt(total)} L</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            {ITEMS.map((it, i) => {
              const on = sel === i;
              return (
                <button
                  key={it.name}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setSel(i)}
                  className="flex items-center gap-2.5 text-left rounded-[14px] px-3 py-1.5 min-h-12 cursor-pointer"
                  style={{ border: `2px solid ${on ? '#123B2C' : '#E7E5DA'}`, background: on ? '#F2F0E6' : '#FFFFFF' }}
                >
                  <span className="shrink-0 w-3.5 h-3.5 rounded" style={{ background: it.color }} />
                  <span className="flex-1 text-[14px] font-semibold">{it.name}</span>
                  <span className="text-[14px] font-bold">₹{fmt(vals[i])} L</span>
                  <span className="w-[42px] text-right text-[12px] font-medium text-[#44504A]">{Math.round((vals[i] / total) * 100)}%</span>
                </button>
              );
            })}
          </div>
          <div className="bg-[#FFF2D0] rounded-[14px] p-3 text-[14px] leading-normal text-[#3F2A00]">
            {ITEMS[sel].name}: {ITEMS[sel].note}
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Stagger your purchases: buy 5 cows first and 5 more after 5 to 6 months.”
          </div>
          <p className="m-0">That is the guide’s own procurement tip. Cows go dry at different times, and two rounds keep milk, and cash, flowing all year.</p>
          <H2 id="shed" className="mt-1.5">Lay out the shed</H2>
          <p className="m-0">
            Each adult cow needs <strong>40 to 50 sq. ft.</strong> under cover. A 40 × 15 ft shed (600 sq. ft.) fits ten in either arrangement. Run its long side <strong>east to west</strong> so afternoon sun stays out.
          </p>
        </div>

        {/* Stall layout */}
        <Card label="See it · Stall layout">
          <Toggle options={['Head-to-head', 'Tail-to-tail']} value={layout} onChange={setLayout} size={13} />
          <div className="bg-[#F2F0E6] rounded-2xl p-3 flex flex-col gap-1.5">
            <Strip kind={head ? 'dung' : 'feed'} />
            {[rowA, null, rowB].map((row, ri) =>
              row ? (
                <div key={ri} className="flex gap-1">
                  {row.map((n) => {
                    // Top row faces down (towards the middle) when head-to-head; bottom row faces up
                    const towardsMiddle = ri === 0 ? 90 : -90;
                    const angle = head ? towardsMiddle : -towardsMiddle;
                    return (
                      <span key={n} className="flex-1 h-[58px] rounded-lg bg-white border border-[#DCDACF] flex items-center justify-center overflow-hidden">
                        <span
                          aria-label={`Cow ${n}`}
                          style={{ transform: `rotate(${angle}deg)`, transition: 'transform 450ms cubic-bezier(0.4,0,0.2,1)', display: 'block', lineHeight: 0 }}
                        >
                          <CowFigure inPlace width={44} height={31} />
                        </span>
                      </span>
                    );
                  })}
                </div>
              ) : (
                <Strip key={ri} kind={head ? 'feed' : 'dung'} tall />
              ),
            )}
            <Strip kind={head ? 'dung' : 'feed'} />
          </div>
          <div className="text-[14px] leading-normal text-[#44504A]">
            {head
              ? 'Head-to-head: cows face each other across a central feed alley, with a dung channel along each outer wall.'
              : 'Tail-to-tail: cows face the outer walls, where the feed alleys run, and share a central dung channel.'}
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2 id="yield">Desi or crossbred?</H2>
          <p className="m-0">Breed decides your feed bill, your housing and your market. Tap a breed type to compare.</p>
        </div>

        {/* Breeds */}
        <Card label="Compare · Daily milk yield">
          {BREEDS.map((b, i) => {
            const on = bsel === i;
            return (
              <button
                key={b.name}
                type="button"
                aria-pressed={on}
                onClick={() => setBsel(i)}
                className="text-left rounded-2xl p-3 flex flex-col gap-2 min-h-11 cursor-pointer"
                style={{ border: `2px solid ${on ? '#123B2C' : '#E7E5DA'}`, background: on ? '#F2F0E6' : '#FFFFFF' }}
              >
                <span className="flex justify-between gap-3 text-[15px] font-bold">
                  <span>{b.name}</span>
                  <span className="shrink-0 whitespace-nowrap">{b.lo} to {b.hi} L</span>
                </span>
                <span className="relative block h-6 rounded-md bg-[#EFEDE3] overflow-hidden">
                  {[20, 40, 60, 80].map((g) => (
                    <span key={g} className="absolute top-0 bottom-0 w-px bg-[#D9D6C8]" style={{ left: `${g}%` }} />
                  ))}
                  <span
                    className="absolute top-0 bottom-0 rounded-md flex items-center justify-center text-[11px] font-bold text-white"
                    style={{ left: `${(b.lo / 25) * 100}%`, width: `${((b.hi - b.lo) / 25) * 100}%`, background: b.color }}
                  >
                    {b.lo}–{b.hi}
                  </span>
                </span>
                {on && <span className="text-[14px] leading-normal text-[#2F3F39]">{b.note}</span>}
              </button>
            );
          })}
          {/* Shared scale so both ranges can be compared directly */}
          <div className="px-[14px] -mt-1">
            <div className="relative h-4 text-[11px] font-medium text-[#44504A]">
              {[0, 5, 10, 15, 20, 25].map((v) => (
                <span key={v} className="absolute -translate-x-1/2" style={{ left: `${(v / 25) * 100}%` }}>
                  {v}
                </span>
              ))}
            </div>
            <div className="text-center text-[11px] text-[#44504A] mt-0.5">litres per cow per day</div>
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2 id="paperwork">The paperwork, without the panic</H2>
          <p className="m-0">No heavy industrial licence is needed for 10 cows. The guide lists a short set of basics.</p>
        </div>

        {/* Checklist */}
        <Card label="Before you move on · My paperwork" gap="gap-1.5">
          {CHECKS.map((c, i) => {
            const on = !!chk[i];
            return (
              <button
                key={c.label}
                type="button"
                role="checkbox"
                aria-checked={on}
                onClick={() => setChk((s) => ({ ...s, [i]: !s[i] }))}
                className="flex items-start gap-3 text-left min-h-[52px] py-1.5 cursor-pointer"
              >
                <span
                  className="shrink-0 w-7 h-7 rounded-lg border-2 border-[#123B2C] text-white flex items-center justify-center font-bold text-[14px]"
                  style={{ background: on ? '#123B2C' : '#FFFFFF' }}
                >
                  {on ? '✓' : ''}
                </span>
                <span className="flex flex-col gap-0.5">
                  <span className="text-[15px] leading-[1.35] font-semibold">{c.label}</span>
                  <span className="text-[13px] leading-[1.4] text-[#44504A]">{c.note}</span>
                </span>
              </button>
            );
          })}
          <div className="text-[13px] font-semibold text-[#7A2E00] pt-1">{doneCount} of 5 sorted</div>
        </Card>

        {/* Takeaways */}
        <div className="px-4 pt-7">
          <div className="bg-[#E5F27A] rounded-[22px] p-4 flex flex-col gap-2">
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#2A3A00]`}>KEY TAKEAWAYS</div>
            <ul className="m-0 pl-5 text-[17px] leading-[1.55]">
              <li>Budget ₹10.15 to ₹13.6 lakh for a turnkey 10-cow unit.</li>
              <li>Livestock is the biggest slice, so buy in two rounds.</li>
              <li>Choose breed by climate, feed and market.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
