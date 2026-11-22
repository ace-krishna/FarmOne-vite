import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const FARMS = {
  b: { total: 31.8, capital: 20.4, margin: 7.95, loan: 23.85, note: 'For broilers the margin is 25% of the project cost, and the bank lends the rest.' },
  l: { total: 111, capital: 66, margin: 27.7, loan: 83.2, note: 'The layer unit needs far more money and takes longer to start earning, but income comes every day.' },
} as const;

const fmt = (v: number) =>
  v >= 100 ? '₹' + (Math.round(v) / 100).toFixed(2) + ' cr' : '₹' + Math.round(v * 10) / 10 + ' lakh';

const NLM_LABELS = [
  'I own or lease land for the unit',
  'I have KYC documents ready',
  'I can put in at least 10% margin money',
  'I can commit for three years',
  'I plan at least 1,000 parent layers of low-input breeds',
];

const OTHER = [
  { title: 'Bank loan with NABARD refinance', tint: '#FFF2D0', body: 'Margin money is 10% to 25%. Broiler loans are repaid over 6 to 8 years. Layer loans run 7 to 9 years, with a grace period.' },
  { title: 'PMEGP', tint: '#DDEBFF', body: 'Poultry counts as a farm-linked activity under the Prime Minister Employment Generation Programme.' },
  { title: 'CGTMSE cover', tint: '#DDF4EA', body: 'A guarantee that lets eligible micro and small units borrow without collateral.' },
  { title: 'Kisan Credit Card', tint: '#EADDFB', body: 'Working capital for animal husbandry. The terms are set by government notices that change from time to time.' },
];

const CHECKS = [
  'I know how much margin money a bank expects',
  'I know feed is the biggest cost',
  'I know NLM is for rural breeding units',
];

const INCOME = 83.7;
const BASE_SPEND = 71.0;
const FEED = BASE_SPEND * 0.66;

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

const Tick: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    className="shrink-0 w-[26px] h-[26px] rounded-lg border-2 border-[#123B2C] text-[#E5F27A] flex items-center justify-center text-[14px] font-bold"
    style={{ background: on ? '#123B2C' : '#FFFFFF' }}
  >
    {on ? '✓' : ''}
  </span>
);

export const PoultryCostArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [farm, setFarm] = useState<'b' | 'l'>('b');
  const [rise, setRise] = useState(10);
  const [nlm, setNlm] = useState<boolean[]>([false, false, false, false, false]);
  const [open, setOpen] = useState(-1);
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const f = FARMS[farm];
  const marginDeg = Math.round((f.margin / f.total) * 360);

  const spend = BASE_SPEND + (FEED * rise) / 100;
  const surplus = INCOME - spend;
  const neg = surplus < 0;
  const low = surplus < 6;
  const sTint = neg ? '#FFDDE5' : low ? '#FFF2D0' : '#DDF4EA';
  const sInk = neg ? '#A3173F' : low ? '#7A4E00' : '#0F6B50';

  const nDone = nlm.filter(Boolean).length;
  const nInk = nDone === 5 ? '#0F6B50' : '#7A4E00';
  const nMsg = nDone === 5 ? 'Ready to apply' : nDone === 0 ? 'Tick what is true' : `${5 - nDone} to go`;
  const doneCount = checks.filter(Boolean).length;

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
            <span className="bg-[#FFF2D0] text-[#7A4E00] rounded-md px-2 py-1">FUNDING</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">POULTRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">What a poultry farm costs, and who can fund it</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            Real project numbers for a broiler unit and a layer unit, and the one subsidy built for rural poultry.
          </div>
          <div className="flex items-center gap-2.5 border-t border-[#DCDACF] mt-1.5 pt-3.5">
            <span className={`w-10 h-10 shrink-0 rounded-full bg-[#123B2C] text-[#E5F27A] flex items-center justify-center ${sans} font-bold text-[14px]`}>F1</span>
            <span className={`flex flex-col ${sans} font-medium text-[13px] text-[#44504A]`}>
              <span className="font-bold text-[#1A1F1B]">Farm One editors</span>
              <span>6 min read · Based on NABARD model projects and the National Livestock Mission</span>
            </span>
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#FFF2D0] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g fill="#FFFFFF" stroke="#7A4E00" strokeWidth="3"><rect x="50" y="60" width="130" height="90" rx="10" /><rect x="210" y="40" width="130" height="110" rx="10" /></g>
            <g fill="#7A4E00">
              <circle cx="85" cy="108" r="9" /><circle cx="115" cy="108" r="9" /><circle cx="145" cy="108" r="9" />
              <circle cx="245" cy="92" r="9" /><circle cx="275" cy="92" r="9" /><circle cx="305" cy="92" r="9" />
              <circle cx="245" cy="122" r="9" /><circle cx="275" cy="122" r="9" /><circle cx="305" cy="122" r="9" />
            </g>
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Most poultry farms are funded by a bank loan, with some of your own money put in first. That own money is called <strong>margin money</strong>. Let us see how it looks for two common farms.
          </p>
          <H2>Pick a farm</H2>
        </div>

        {/* Project cost */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#7A4E00] uppercase">Try it · Project cost</div>
          <div className="flex gap-1.5 bg-[#F2F0E6] rounded-full p-1">
            {([['b', '10,000 broilers'], ['l', '20,000 layers']] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={farm === k}
                onClick={() => setFarm(k)}
                className="flex-1 min-h-11 rounded-full text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ background: farm === k ? '#123B2C' : 'transparent', color: farm === k ? '#FFFFFF' : '#1A1F1B' }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-[18px] bg-[#F2F0E6] rounded-[18px] p-4">
            <div
              className="shrink-0 w-[112px] h-[112px] rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(#7A4E00 0 ${marginDeg}deg, #E5F27A ${marginDeg}deg 360deg)` }}
            >
              <div className="w-[68px] h-[68px] rounded-full bg-[#F2F0E6] flex flex-col items-center justify-center text-center">
                <div className="text-[16px] font-bold leading-tight">{fmt(f.total)}</div>
                <div className="text-[10px] font-medium text-[#5C6862]">total</div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#7A4E00]"><span className="w-2.5 h-2.5 rounded-[3px] bg-[#7A4E00]" />Your margin money</div>
                <div className={`${serif} text-[20px] font-bold`}>{fmt(f.margin)}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#44504A]"><span className="w-2.5 h-2.5 rounded-[3px] bg-[#E5F27A] border border-[#BFCB4A]" />Bank loan</div>
                <div className={`${serif} text-[20px] font-bold`}>{fmt(f.loan)}</div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">SHED + EQUIPMENT</div>
              <div className="text-[17px] font-bold mt-1">{fmt(f.capital)}</div>
            </div>
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">FIRST BATCH, FEED</div>
              <div className="text-[17px] font-bold mt-1">{fmt(Math.round((f.total - f.capital) * 10) / 10)}</div>
            </div>
          </div>
          <div className="text-[13px] leading-normal text-[#5C6862]">{f.note}</div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#7A4E00] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “On a broiler farm, feed is about two-thirds of every rupee you spend.”
          </div>
          <H2>What if feed gets dearer?</H2>
          <p className="m-0">
            A 10,000-bird broiler unit earns about ₹83.7 lakh a year and spends about ₹71.0 lakh. Move the slider to see what a rise in feed price does to your surplus.
          </p>
        </div>

        {/* Feed price shock */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#7A4E00] uppercase">Try it · Feed price shock</div>
          <div className="flex justify-between text-[14px] font-semibold">
            <label htmlFor="feedRise">Feed price rise</label>
            <span>+{rise}%</span>
          </div>
          <input
            id="feedRise"
            type="range"
            min={0}
            max={30}
            step={1}
            value={rise}
            onChange={(e) => setRise(Number(e.target.value))}
            className="w-full h-11 m-0 cursor-pointer"
            style={{
              accentColor: '#123B2C',
              background: `linear-gradient(#123B2C, #123B2C) 0 50% / ${(rise / 30) * 100}% 4px no-repeat, linear-gradient(#E7E5DA, #E7E5DA) 0 50% / 100% 4px no-repeat`,
            }}
          />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-[13px] font-medium text-[#44504A]"><span>Yearly income</span><span>₹83.7 lakh</span></div>
            <div className="h-3.5 rounded-[7px] bg-[#DDF4EA] overflow-hidden"><div className="w-full h-full bg-[#0F6B50]" /></div>
            <div className="flex justify-between text-[13px] font-medium text-[#44504A]"><span>Yearly spending</span><span>₹{spend.toFixed(1)} lakh</span></div>
            <div className="h-3.5 rounded-[7px] bg-[#FFE2D3] overflow-hidden">
              <div className="h-full bg-[#A04000] transition-[width] duration-200" style={{ width: `${Math.min(100, Math.round((spend / INCOME) * 100))}%` }} />
            </div>
          </div>
          <div className="rounded-[18px] p-4 flex flex-col gap-1 transition-colors" style={{ background: sTint }}>
            <div className="text-[11px] font-bold tracking-[0.1em]" style={{ color: sInk }}>YEARLY SURPLUS</div>
            <div className={`${serif} text-[26px] font-bold`} style={{ color: sInk }}>{neg ? '−' : ''}₹{Math.abs(surplus).toFixed(1)} lakh</div>
            <div className="text-[13px] leading-normal">
              {neg
                ? 'The farm now loses money. Around a 27% rise wipes out the whole surplus.'
                : low
                  ? 'Very thin. One bad batch could push you into loss.'
                  : 'Still healthy, but see how fast it shrinks as feed gets dearer.'}
            </div>
          </div>
          <div className="text-[13px] leading-normal text-[#5C6862]">A simple illustration: only feed changes. Bird prices and deaths matter too.</div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>The subsidy for rural poultry</H2>
          <p className="m-0">
            The National Livestock Mission pays <strong>50%</strong> of the cost, up to <strong>₹25 lakh</strong>. It is for breeding units that supply chicks to villages, not for ordinary broiler sheds. Check each point that is true for you.
          </p>
        </div>

        {/* Am I ready */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-1.5 ${sans}`}>
          <div className="flex items-center justify-between gap-2">
            <div className="text-[11px] font-bold tracking-[0.12em] text-[#5C6862] uppercase">Am I ready? · {nDone} of 5</div>
            <div className="text-[14px] font-bold text-right" style={{ color: nInk }}>{nMsg}</div>
          </div>
          <div className="h-2 rounded bg-[#E7E5DA] overflow-hidden">
            <div className="h-full transition-[width] duration-200" style={{ width: `${nDone * 20}%`, background: nInk }} />
          </div>
          {NLM_LABELS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={nlm[i]}
              onClick={() => setNlm((a) => a.map((v, j) => (j === i ? !v : v)))}
              className="min-h-[52px] flex items-center gap-3 text-left text-[15px] font-medium cursor-pointer"
            >
              <Tick on={nlm[i]} />
              {label}
            </button>
          ))}
        </div>
        <div className={`mx-3 mt-3 bg-[#E1F0F3] rounded-[18px] p-3.5 text-[14px] font-medium leading-normal ${sans}`}>
          The money comes through SIDBI in two parts: after you spend 25%, and after the unit is complete. Land, working capital and vehicles are not covered. Apply at nlm.udyamimitra.in.
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Other ways to fund a farm</H2>
          <p className="m-0">Tap to read more.</p>
        </div>
        <div className={`mx-3 mt-3.5 flex flex-col gap-2.5 ${sans}`}>
          {OTHER.map((o, i) => {
            const isOpen = open === i;
            return (
              <div key={o.title} className="bg-white border border-[#DCDACF] rounded-[18px] overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full min-h-14 px-4 flex items-center justify-between text-left text-[15px] font-bold cursor-pointer"
                  style={{ background: o.tint }}
                >
                  <span>{o.title}</span>
                  <span className="text-[20px]">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <div className="px-4 py-3.5 text-[14px] leading-[1.55]">{o.body}</div>}
              </div>
            );
          })}
        </div>

        {/* Takeaways */}
        <div className="mx-3 mt-7 bg-[#E5F27A] rounded-3xl p-4 flex flex-col gap-2.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#123B2C]`}>KEY TAKEAWAYS</div>
          <ul className="m-0 pl-5 text-[17px] leading-[1.5] flex flex-col gap-1.5">
            <li>A 10,000-broiler unit costs about ₹31.8 lakh in all. A 20,000-layer unit costs about ₹1.11 crore.</li>
            <li>Banks usually want about a quarter of the cost from you as margin money.</li>
            <li>Feed is the biggest cost, so small price changes decide your profit.</li>
            <li>NLM pays 50% up to ₹25 lakh, but only for rural breeding units.</li>
          </ul>
        </div>

        {/* Before you move on */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-2.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#5C6862] uppercase">Before you move on · {doneCount} of 3</div>
          {CHECKS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={checks[i]}
              onClick={() => setChecks((a) => a.map((v, j) => (j === i ? !v : v)))}
              className="min-h-12 flex items-center gap-3 text-left text-[15px] font-medium cursor-pointer"
            >
              <Tick on={checks[i]} />
              {label}
            </button>
          ))}
        </div>

        {/* Up next */}
        <button
          type="button"
          onClick={onOpenNext}
          className={`mx-3 mt-4 w-[calc(100%-1.5rem)] text-left bg-[#E1F0F3] rounded-[22px] p-4 flex flex-col gap-1.5 ${onOpenNext ? 'cursor-pointer active:scale-[0.99] transition-transform' : 'cursor-default'}`}
        >
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]`}>UP NEXT · I-LEARNING</div>
          <div className="font-bold text-[21px] leading-[1.25]">Choosing and using a chaff cutter</div>
          <div className={`${sans} text-[14px] leading-normal text-[#44504A]`}>How to pick one, work out the hours, and stay safe.</div>
        </button>

        <div className={`px-4 pt-[22px] pb-4 ${sans} text-[13px] leading-normal text-[#5C6862]`}>
          Source: NABARD model projects for broiler and layer units; National Livestock Mission, rural poultry guidelines (Jan 2025).
        </div>
      </div>
    </div>
  );
};
