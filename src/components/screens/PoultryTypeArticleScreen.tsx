import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const PRESETS: [number, string][] = [
  [3000, '3,000'],
  [15000, '15,000'],
  [40000, '40,000'],
  [120000, '1.2 lakh'],
];

const CONSENT_STEPS = [
  { name: 'Consent to establish', note: 'Apply to the State Pollution Control Board before you build.' },
  { name: 'Build to the guidelines', note: 'Follow the siting, shed, manure and waste rules.' },
  { name: 'Consent to operate', note: 'Get this before you start running the farm. It lasts 15 years.' },
];

const TABLE = [
  { who: 'Small farms', what: 'Composting.', key: 'small' },
  { who: 'Medium and large', what: 'Composting or biogas, or a mix of both.', key: 'medium' },
  { who: 'Farms in a cluster', what: 'Shared biogas or composting facilities, or both.', key: 'cluster' },
];

type CatKey = 'backyard' | 'small' | 'medium' | 'large';

const categorise = (count: number) => {
  let key: CatKey = 'medium';
  let name = 'Medium poultry farm';
  let note = 'More than 25,000 and up to 1 lakh birds. You need consent, and can compost or use biogas for manure.';
  let tint = '#FFF2D0';
  let ink = '#7A4E00';
  let consent = 'Yes';
  let cInk = '#A3173F';
  let manure = 'Compost or biogas';
  if (count < 5000) {
    key = 'backyard'; name = 'Backyard flock';
    note = 'A few birds for the family, with very little sold. Keep the shed clean and follow the basic hygiene rules.';
    tint = '#DDF4EA'; ink = '#0F6B50'; consent = 'No'; cInk = '#0F6B50'; manure = 'Composting';
  } else if (count <= 25000) {
    key = 'small'; name = 'Small poultry farm';
    note = '5,000 to 25,000 birds. You must follow the environmental guidelines. Consent is needed above 25,000 birds.';
    tint = '#DDEBFF'; ink = '#1F4E9A'; consent = 'No'; cInk = '#0F6B50'; manure = 'Composting';
  } else if (count > 100000) {
    key = 'large'; name = 'Large poultry farm';
    note = 'More than 1 lakh birds. You need consent, and can compost or use biogas for manure.';
    tint = '#FFE2D3'; ink = '#A04000'; consent = 'Yes'; cInk = '#A3173F'; manure = 'Compost or biogas';
  }
  return { key, name, note, tint, ink, consent, cInk, manure };
};

const countText = (count: number) =>
  count >= 100000
    ? (count / 100000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '') + ' lakh'
    : count.toLocaleString('en-IN');

const Card: React.FC<{ label: string; children: React.ReactNode; gap?: string }> = ({ label, children, gap = 'gap-3' }) => (
  <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col ${gap} ${sans}`}>
    <div className="text-[11px] font-bold tracking-[0.12em] text-[#A04000] uppercase">{label}</div>
    {children}
  </div>
);

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

export const PoultryTypeArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [count, setCount] = useState(40000);
  const [done, setDone] = useState<Record<number, boolean>>({});

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const cat = categorise(count);
  const firstPending = CONSENT_STEPS.findIndex((_, i) => !done[i]);
  const doneCount = Object.values(done).filter(Boolean).length;
  const pct = (count / 150000) * 100;

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
          <div className={`${sans} text-[12px] font-bold tracking-[0.1em] text-[#123B2C]`}>FARM SETUP · POULTRY</div>
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
            <span className="bg-[#FFE2D3] text-[#7A2E00] rounded-md px-2 py-1">REGISTER</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">POULTRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Which kind of poultry farm are you?</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            The number of birds you keep decides the permission you need and how you handle your manure.
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#FFE2D3] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g fill="#FFFFFF"><circle cx="70" cy="130" r="14" /><circle cx="104" cy="136" r="14" /></g>
            <g fill="#FFFFFF"><circle cx="170" cy="110" r="16" /><circle cx="206" cy="118" r="16" /><circle cx="188" cy="144" r="16" /><circle cx="150" cy="140" r="16" /></g>
            <g fill="#FFFFFF"><circle cx="270" cy="90" r="18" /><circle cx="308" cy="100" r="18" /><circle cx="290" cy="130" r="18" /><circle cx="252" cy="126" r="18" /><circle cx="326" cy="136" r="18" /><circle cx="296" cy="160" r="18" /></g>
            <g fill="#A04000"><circle cx="75" cy="127" r="3" /><circle cx="175" cy="107" r="3" /><circle cx="275" cy="87" r="3" /></g>
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">Poultry farms in India fall into three sizes, plus the small backyard flocks kept by village families. Where you sit changes what you must do.</p>
          <H2>Find your category</H2>
          <p className="m-0">Move the slider to the number of birds you plan to keep at one place.</p>
        </div>

        {/* Bird counter */}
        <Card label="Try it · Bird counter">
          <div className="flex justify-between text-[14px] font-semibold">
            <label htmlFor="birds">Birds at one location</label>
            <span>{countText(count)}</span>
          </div>
          <input
            id="birds"
            type="range"
            min={0}
            max={150000}
            step={1000}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="w-full h-11 m-0 cursor-pointer"
            style={{
              accentColor: '#123B2C',
              background: `linear-gradient(#123B2C, #123B2C) 0 50% / ${pct}% 4px no-repeat, linear-gradient(#E7E5DA, #E7E5DA) 0 50% / 100% 4px no-repeat`,
            }}
          />
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(([v, label]) => (
              <button
                key={v}
                type="button"
                aria-pressed={count === v}
                onClick={() => setCount(v)}
                className={`min-h-11 rounded-full px-4 text-[13px] font-semibold cursor-pointer transition-colors ${count === v ? 'bg-[#123B2C] text-white' : 'bg-[#F2F0E6] text-[#1A1F1B]'}`}
              >
                {label} birds
              </button>
            ))}
          </div>
          <div className="rounded-[18px] p-4 flex flex-col gap-1.5 transition-colors" style={{ background: cat.tint }}>
            <div className="text-[11px] font-bold tracking-[0.1em]" style={{ color: cat.ink }}>YOUR FARM</div>
            <div className={`${serif} text-[24px] font-bold leading-[1.2]`} style={{ color: cat.ink }}>{cat.name}</div>
            <div className="text-[14px] leading-normal text-[#1A1F1B]">{cat.note}</div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">CONSENT NEEDED?</div>
              <div className="text-[16px] font-bold mt-1" style={{ color: cat.cInk }}>{cat.consent}</div>
            </div>
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">MANURE ROUTE</div>
              <div className="text-[16px] font-bold mt-1">{cat.manure}</div>
            </div>
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Every poultry farm follows the guidelines. Bigger farms also need written consent.”
          </div>
          <H2>What “consent” means</H2>
          <p className="m-0">
            Farms with more than 25,000 birds at one place need two permissions from the State Pollution Control Board, under the Water Act 1974 and the Air Act 1981.
          </p>
        </div>

        {/* Consent steps */}
        <Card label="Try it · The consent steps" gap="gap-2">
          {CONSENT_STEPS.map((st, i) => {
            const isDone = !!done[i];
            const current = i === firstPending;
            return (
              <button
                key={st.name}
                type="button"
                aria-pressed={isDone}
                onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                className="w-full flex items-start gap-3 text-left rounded-2xl p-3 min-h-14 cursor-pointer"
                style={{ border: `2px solid ${current ? '#123B2C' : '#E7E5DA'}`, background: current ? '#F2F0E6' : '#FFFFFF' }}
              >
                <span
                  className="shrink-0 w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-[14px]"
                  style={{ background: isDone ? '#0F8A5F' : current ? '#123B2C' : '#9DA8A2' }}
                >
                  {isDone ? '✓' : i + 1}
                </span>
                <span className="flex flex-col gap-[3px]">
                  <span className="text-[15px] font-bold">{st.name}</span>
                  <span className="text-[13px] leading-[1.45] text-[#44504A]">{st.note}</span>
                </span>
              </button>
            );
          })}
          <div className="text-[13px] font-semibold text-[#A04000] px-0.5">
            {doneCount === 3 ? 'All three steps done' : `${doneCount} of 3 steps done`}
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">Good news: poultry farms are in the “Green” category of industries, so consent stays valid for <strong>15 years</strong>.</p>
          <H2>Farms that share</H2>
          <p className="m-0">
            Several farms close together can share one manure facility, either composting, biogas, or both. If you are in a cluster, this can save each farm money.
          </p>
        </div>

        {/* Manure options */}
        <Card label="Compare · Manure options by size" gap="gap-2.5">
          {TABLE.map((r) => {
            const on = r.key === cat.key || (r.key === 'medium' && cat.key === 'large') || (r.key === 'small' && cat.key === 'backyard');
            return (
              <div
                key={r.key}
                className="flex gap-3 items-center rounded-[14px] p-3 transition-colors"
                style={{ background: on ? '#FFF2D0' : '#F2F0E6', border: `2px solid ${on ? '#A04000' : 'transparent'}` }}
              >
                <span className="shrink-0 w-[92px] text-[13px] font-bold text-[#A04000]">{r.who}</span>
                <span className="text-[14px] leading-[1.45]">{r.what}</span>
              </div>
            );
          })}
        </Card>

        {/* Takeaways */}
        <div className="px-4 pt-7">
          <div className="bg-[#E5F27A] rounded-[22px] p-4 flex flex-col gap-2">
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#2A3A00]`}>KEY TAKEAWAYS</div>
            <ul className="m-0 pl-5 text-[17px] leading-[1.55]">
              <li>Small: 5,000 to 25,000 birds. Medium: up to 1 lakh. Large: above 1 lakh.</li>
              <li>Above 25,000 birds, get consent to establish and consent to operate.</li>
              <li>Consent for poultry farms lasts 15 years.</li>
              <li>Small farms compost manure. Bigger farms can also use biogas.</li>
            </ul>
          </div>
        </div>

        {/* Up next */}
        <div className="px-3 pt-[22px]">
          <button
            type="button"
            onClick={onOpenNext}
            className={`w-full text-left bg-[#E1F0F3] rounded-[22px] p-[18px] flex items-center gap-3.5 ${sans} ${onOpenNext ? 'cursor-pointer active:scale-[0.99] transition-transform' : 'cursor-default'}`}
          >
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]">UP NEXT</div>
              <div className={`${serif} text-[18px] font-bold leading-[1.25] mt-1`}>Build it right: the farm rule book</div>
              <div className="text-[13px] font-medium text-[#44504A] mt-1">7 min · Build checklist</div>
            </div>
            <span aria-hidden className="shrink-0 w-11 h-11 rounded-full bg-[#123B2C] text-white flex items-center justify-center text-[20px] font-semibold">›</span>
          </button>
        </div>

        <div className={`px-4 pt-[18px] pb-4 ${sans} text-[12px] leading-normal text-[#5C6862]`}>
          Source: Central Pollution Control Board, Environmental Guidelines for Poultry Farms (August 2021).
        </div>
      </div>
    </div>
  );
};
