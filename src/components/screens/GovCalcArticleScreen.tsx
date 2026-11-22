import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const SCHEMES = {
  maha: { label: 'MahaBMS animals', lo: 50, hi: 75, lowL: 'General 50%', highL: 'SC/ST 75%', cat: true, note: 'MahaBMS pays 50% for General and 75% for SC/ST farmers on a unit of 2, 4 or 6 milch animals.' },
  nabard: { label: 'NABARD dairy unit', lo: 25, hi: 33.33, lowL: 'General 25%', highL: 'SC/ST/Women 33.33%', cat: true, note: 'NABARD pays a back-ended subsidy, which means it comes after the loan is running.' },
  nlm: { label: 'NLM fodder / breeding', lo: 50, hi: 50, lowL: '', highL: '', cat: false, note: 'The National Livestock Mission pays 50%, up to ₹50 lakh.' },
  dbt: { label: 'MahaDBT fodder / machines', lo: 50, hi: 80, lowL: 'Lower rate 50%', highL: 'Higher rate 80%', cat: true, note: 'MahaDBT pays between 50% and 80% depending on the item.' },
} as const;
type SchemeKey = keyof typeof SCHEMES;

const CHECKS = ['I know my own share of the cost', 'I know the subsidy comes after I buy', 'I know the KCC rate is about 4%'];

const fmt = (v: number) => '₹' + Math.round(v * 100) / 100 + ' lakh';

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

const Slider: React.FC<{ id: string; min: number; max: number; step: number; value: number; onChange: (v: number) => void }> = ({ id, min, max, step, value, onChange }) => (
  <input
    id={id}
    type="range"
    min={min}
    max={max}
    step={step}
    value={value}
    onChange={(e) => onChange(Number(e.target.value))}
    className="w-full h-11 m-0 cursor-pointer"
    style={{
      accentColor: '#123B2C',
      background: `linear-gradient(#123B2C, #123B2C) 0 50% / ${((value - min) / (max - min)) * 100}% 4px no-repeat, linear-gradient(#E7E5DA, #E7E5DA) 0 50% / 100% 4px no-repeat`,
    }}
  />
);

export const GovCalcArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [sch, setSch] = useState<SchemeKey>('maha');
  const [hi, setHi] = useState(false);
  const [cost, setCost] = useState(8);
  const [kcc, setKcc] = useState(2);
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const d = SCHEMES[sch];
  const pct = hi ? d.hi : d.lo;
  let sub = (cost * pct) / 100;
  if (sch === 'nlm' && sub > 50) sub = 50;
  const you = cost - sub;
  const deg = Math.round((sub / cost) * 360);
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
          <div className={`${sans} text-[12px] font-bold tracking-[0.1em] text-[#123B2C]`}>FARM SETUP · DAIRY</div>
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
            <span className="bg-[#FFF2D0] text-[#7A4E00] rounded-md px-2 py-1">PLAN</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">DAIRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">What will you really get?</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">A subsidy sounds big until you see the rupees. Try your own numbers.</div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#FFF2D0] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g fill="#FFFFFF" stroke="#7A4E00" strokeWidth="3"><circle cx="110" cy="100" r="48" /><circle cx="200" cy="100" r="48" /><circle cx="290" cy="100" r="48" /></g>
            <g fontFamily="Inter,sans-serif" fontWeight="700" fontSize="34" fill="#7A4E00" textAnchor="middle"><text x="110" y="112">₹</text><text x="200" y="112">%</text><text x="290" y="112">₹</text></g>
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Every subsidy has two parts: a percentage and a project cost. Change the cost and the money changes with it. Pick a scheme, set your cost and see who pays what.
          </p>
          <H2>Your project, in rupees</H2>
        </div>

        {/* Subsidy calculator */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#7A4E00] uppercase">Try it · Subsidy calculator</div>
          <div className="text-[14px] font-semibold">Scheme</div>
          <div className="flex gap-2 flex-wrap">
            {(Object.keys(SCHEMES) as SchemeKey[]).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={sch === k}
                onClick={() => setSch(k)}
                className="min-h-11 rounded-full px-3.5 text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ background: sch === k ? '#123B2C' : '#F2F0E6', color: sch === k ? '#FFFFFF' : '#1A1F1B' }}
              >
                {SCHEMES[k].label}
              </button>
            ))}
          </div>
          {d.cat && (
            <div className="flex gap-1.5 bg-[#F2F0E6] rounded-full p-1">
              {([[d.lowL, false], [d.highL, true]] as const).map(([label, val]) => (
                <button
                  key={label}
                  type="button"
                  aria-pressed={hi === val}
                  onClick={() => setHi(val)}
                  className="flex-1 min-h-11 rounded-full text-[13px] font-semibold cursor-pointer transition-colors px-1"
                  style={{ background: hi === val ? '#123B2C' : 'transparent', color: hi === val ? '#FFFFFF' : '#1A1F1B' }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between text-[14px] font-semibold">
            <label htmlFor="projCost">Project cost</label>
            <span>₹{cost} lakh</span>
          </div>
          <Slider id="projCost" min={1} max={30} step={0.5} value={cost} onChange={setCost} />

          <div className="flex items-center gap-[18px] bg-[#F2F0E6] rounded-[18px] p-4">
            <div
              className="shrink-0 w-[112px] h-[112px] rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(#0F6B50 0 ${deg}deg, #E5F27A ${deg}deg 360deg)` }}
            >
              <div className="w-[68px] h-[68px] rounded-full bg-[#F2F0E6] flex flex-col items-center justify-center">
                <div className="text-[20px] font-bold">{Math.round((sub / cost) * 100)}%</div>
                <div className="text-[10px] font-medium text-[#5C6862]">subsidy</div>
              </div>
            </div>
            <div className="flex flex-col gap-2.5 flex-1">
              <div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#0F6B50]"><span className="w-2.5 h-2.5 rounded-[3px] bg-[#0F6B50]" />Government pays</div>
                <div className={`${serif} text-[22px] font-bold`}>{fmt(sub)}</div>
              </div>
              <div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-[#44504A]"><span className="w-2.5 h-2.5 rounded-[3px] bg-[#E5F27A] border border-[#BFCB4A]" />You pay</div>
                <div className={`${serif} text-[22px] font-bold`}>{fmt(you)}</div>
              </div>
            </div>
          </div>
          <div className="text-[14px] leading-normal text-[#44504A]">{d.note}</div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “A subsidy rarely covers the whole cost. Plan for your own share from day one.”
          </div>
          <p className="m-0">
            The subsidy arrives <em>after</em> you buy and after inspection. So you or your bank must first pay the full amount, then wait for the money to come back.
          </p>
          <H2>Running costs: the Kisan Credit Card</H2>
          <p className="m-0">
            Feed, fodder, medicine, power and labour never stop. The Kisan Credit Card gives you a working loan at about 4% a year. Move the slider to see the yearly interest.
          </p>
        </div>

        {/* KCC interest */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#7A4E00] uppercase">Try it · KCC interest</div>
          <div className="flex justify-between text-[14px] font-semibold">
            <label htmlFor="kccLoan">Working loan</label>
            <span>₹{kcc} lakh</span>
          </div>
          <Slider id="kccLoan" min={0.5} max={3} step={0.5} value={kcc} onChange={setKcc} />
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">COLLATERAL</div>
              <div className="text-[16px] font-bold mt-1" style={{ color: kcc <= 2 ? '#0F6B50' : '#7A4E00' }}>{kcc <= 2 ? 'Not needed' : 'Interest help applies'}</div>
            </div>
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">INTEREST IN A YEAR</div>
              <div className="text-[16px] font-bold mt-1">₹{Math.round(kcc * 100000 * 0.04).toLocaleString('en-IN')}</div>
            </div>
          </div>
          <div className="text-[13px] leading-normal text-[#5C6862]">Based on an effective rate of about 4%, if you repay on time.</div>
        </div>

        {/* Takeaways */}
        <div className="mx-3 mt-7 bg-[#E5F27A] rounded-3xl p-4 flex flex-col gap-2.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#123B2C]`}>KEY TAKEAWAYS</div>
          <ul className="m-0 pl-5 text-[17px] leading-[1.5] flex flex-col gap-1.5">
            <li>Subsidy is a percentage of your project cost.</li>
            <li>You pay the rest, and often the full amount first.</li>
            <li>The Kisan Credit Card covers day-to-day costs at about 4%.</li>
            <li>Up to ₹2 lakh needs no collateral.</li>
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
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]`}>UP NEXT</div>
          <div className="font-bold text-[21px] leading-[1.25]">The 10-cow dairy setup guide</div>
          <div className={`${sans} text-[14px] leading-normal text-[#44504A]`}>See the real shed, animal and machine costs to put in your project report.</div>
        </button>

        <div className={`px-4 pt-[22px] pb-4 ${sans} text-[13px] leading-normal text-[#5C6862]`}>
          Source: Government Subsidies Directory for Dairy Farming in India. Figures are illustrations of the stated percentages; your sanctioned amount may differ.
        </div>
      </div>
    </div>
  );
};
