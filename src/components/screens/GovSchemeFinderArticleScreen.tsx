import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

type Level = 'c' | 'm';
const LEVEL_STYLE: Record<Level, { tint: string; ink: string; label: string }> = {
  c: { tint: '#DDEBFF', ink: '#1F4E9A', label: 'CENTRAL' },
  m: { tint: '#DDF4EA', ink: '#0F6B50', label: 'MAHARASHTRA' },
};

type Scheme = { lv: Level; name: string; benefit: (sc: boolean) => string; note: string; portal: string };
const SCHEMES: Record<string, Scheme> = {
  maha: { lv: 'm', name: 'MahaBMS dairy scheme', benefit: (sc) => (sc ? '75% subsidy (SC/ST)' : '50% subsidy (General)'), note: 'For a unit of 2, 4 or 6 milch cows or buffaloes. Also supports sheds and feed for small farmers and landless labourers.', portal: 'ah.mahabms.com' },
  dbt: { lv: 'm', name: 'MahaDBT farmer schemes', benefit: () => '50% to 80% subsidy', note: 'Fodder plot irrigation, chaff cutters, power tillers and solar pumps. You need an Aadhaar-linked bank account and a 7/12 extract.', portal: 'mahadbt.maharashtra.gov.in' },
  cm: { lv: 'm', name: 'Mukhyamantri Dairy Entrepreneurship', benefit: () => 'Interest subsidy on your loan', note: 'For units of 10 to 20 animals, with grants for animals and cold storage. Applicants must be 18 to 45 years old.', portal: 'dahd.maharashtra.gov.in' },
  nabard: { lv: 'c', name: 'NABARD dairy refinance', benefit: (sc) => (sc ? '33.33% capital subsidy' : '25% capital subsidy'), note: 'Small units of 2 to 10 animals, milking machines, milk testers and bulk coolers. The higher rate is for SC/ST and women.', portal: 'nabard.org' },
  nlm: { lv: 'c', name: 'National Livestock Mission', benefit: () => '50% subsidy, up to ₹50 lakh', note: 'Heifer rearing, silage making, fodder seed and fodder blocks, and breed development farms.', portal: 'nlm.udyamimitra.in' },
  rgm: { lv: 'c', name: 'Rashtriya Gokul Mission', benefit: () => '50% subsidy, up to ₹2 crore', note: 'Breed multiplication farms using sexed semen and IVF, for Gir, Sahiwal, Red Sindhi and good crossbreds.', portal: 'dahd.nic.in' },
  ahidf: { lv: 'c', name: 'AHIDF', benefit: () => '3% interest help on loans', note: 'Up to 90% of the project can be a bank loan, repaid over 8 years with a 2-year break. For processing, bulk coolers and feed plants.', portal: 'ahidf.udyamimitra.in' },
  kcc: { lv: 'c', name: 'Kisan Credit Card for dairy', benefit: () => 'Working loan at about 4%', note: 'Up to ₹2 lakh without collateral, up to ₹3 lakh with interest help. Covers feed, fodder, medicine, power and labour.', portal: 'your bank branch' },
};

const PLANS = [
  { id: 'animals', label: 'Buy animals', name: 'buy animals', keys: ['maha', 'nabard', 'cm'] },
  { id: 'shed', label: 'Shed or machines', name: 'shed or machines', keys: ['maha', 'dbt', 'nabard'] },
  { id: 'fodder', label: 'Grow fodder', name: 'grow fodder', keys: ['dbt', 'nlm'] },
  { id: 'run', label: 'Running costs', name: 'running costs', keys: ['kcc'] },
  { id: 'proc', label: 'Process or chill milk', name: 'process or chill milk', keys: ['ahidf', 'nabard'] },
  { id: 'breed', label: 'Breeding farm', name: 'start a breeding farm', keys: ['rgm', 'nlm'] },
];

const LEVELS = [
  { title: 'Central schemes (5)', tint: '#DDEBFF', ink: '#1F4E9A', body: 'Run by the Government of India for the whole country: AHIDF, National Livestock Mission, Rashtriya Gokul Mission, Kisan Credit Card and NABARD. Most are applied for online or through your bank.' },
  { title: 'Maharashtra schemes (3)', tint: '#DDF4EA', ink: '#0F6B50', body: 'Run by the State for farmers who live in Maharashtra: MahaBMS, MahaDBT and the Mukhyamantri Dairy Entrepreneurship scheme. These give the biggest help for buying animals and for fodder and machines.' },
];

const SHORTCUTS = [
  { tag: 'SMALL FARMER, 2 TO 6 ANIMALS', text: 'Start with MahaBMS for the animals, and the Kisan Credit Card for feed and medicine money.', bg: '#DDF4EA', ink: '#0F6B50' },
  { tag: 'YOUNG ENTREPRENEUR, 18 TO 45, 10 TO 20 ANIMALS', text: 'Look at the Mukhyamantri Dairy Entrepreneurship scheme for interest help on your loan.', bg: '#FFF2D0', ink: '#7A4E00' },
  { tag: 'PLANNING TO PROCESS OR CHILL MILK', text: 'AHIDF is built for you: processing, value-added products, bulk coolers and feed plants.', bg: '#EADDFB', ink: '#5B2E91' },
];

const CHECKS = ['I know what I want to do this year', 'I know my category (General or SC/ST)', 'I have noted the portal for my scheme'];

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

export const GovSchemeFinderArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [plan, setPlan] = useState('animals');
  const [sc, setSc] = useState(false);
  const [open, setOpen] = useState(0);
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const cur = PLANS.find((p) => p.id === plan)!;
  const results = cur.keys.map((k) => SCHEMES[k]);
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
            <span className="bg-[#DDEBFF] text-[#1F4E9A] rounded-md px-2 py-1">CHOOSE</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">DAIRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Eight schemes, one question: which one is yours?</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            You do not need to read all eight. Tell us what you want to do, and we will show only the ones that fit.
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#DDEBFF] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g fill="#FFFFFF"><rect x="40" y="110" width="70" height="50" rx="8" /><rect x="150" y="90" width="90" height="70" rx="8" /><rect x="280" y="70" width="70" height="90" rx="8" /></g>
            <g fill="#1F4E9A"><circle cx="75" cy="92" r="10" /><circle cx="195" cy="70" r="12" /><circle cx="315" cy="50" r="14" /></g>
            <g fill="none" stroke="#1F4E9A" strokeWidth="2.5" strokeLinecap="round"><path d="M195 82v8M315 64v6" /></g>
            <text x="75" y="97" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="12" fill="#FFFFFF">₹</text>
            <text x="195" y="75" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="14" fill="#FFFFFF">₹</text>
            <text x="315" y="55" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="16" fill="#FFFFFF">₹</text>
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Dairy farmers in Maharashtra can draw on schemes from the Centre and from the State. Some pay part of the cost directly. Some make your bank loan cheaper. Some only help with fodder or machines.
          </p>
          <p className="m-0">
            The trick is not finding a scheme. It is finding the right one for what you want to do <em>this year</em>.
          </p>
          <H2>Find yours</H2>
          <p className="m-0">Pick your plan, then your category.</p>
        </div>

        {/* Scheme finder */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#1F4E9A] uppercase">Try it · Scheme finder</div>
          <div className="text-[14px] font-semibold">What do you want to do?</div>
          <div className="flex gap-2 flex-wrap">
            {PLANS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={plan === p.id}
                onClick={() => setPlan(p.id)}
                className="min-h-11 rounded-full px-3.5 text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ background: plan === p.id ? '#123B2C' : '#F2F0E6', color: plan === p.id ? '#FFFFFF' : '#1A1F1B' }}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="text-[14px] font-semibold">Your category</div>
          <div className="flex gap-1.5 bg-[#F2F0E6] rounded-full p-1">
            {([['General', false], ['SC / ST', true]] as const).map(([label, val]) => (
              <button
                key={label}
                type="button"
                aria-pressed={sc === val}
                onClick={() => setSc(val)}
                className="flex-1 min-h-11 rounded-full text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ background: sc === val ? '#123B2C' : 'transparent', color: sc === val ? '#FFFFFF' : '#1A1F1B' }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-baseline justify-between border-t border-[#E7E5DA] pt-3">
            <div className="text-[16px] font-bold">{results.length === 1 ? '1 scheme fits' : `${results.length} schemes fit`}</div>
            <div className="text-[12px] font-medium text-[#5C6862]">for “{cur.name}”</div>
          </div>
          {results.map((r) => {
            const st = LEVEL_STYLE[r.lv];
            return (
              <div key={r.name} className="rounded-[18px] p-4 flex flex-col gap-2" style={{ background: st.tint }}>
                <div className="flex gap-2 flex-wrap text-[10px] font-bold tracking-[0.08em]">
                  <span className="bg-white rounded-md px-[7px] py-[3px]" style={{ color: st.ink }}>{st.label}</span>
                </div>
                <div className={`${serif} text-[20px] font-bold leading-[1.2]`} style={{ color: st.ink }}>{r.name}</div>
                <div className="text-[17px] font-bold">{r.benefit(sc)}</div>
                <div className="text-[14px] leading-normal">{r.note}</div>
                <div className="text-[12px] font-medium text-[#44504A]">Apply at {r.portal}</div>
              </div>
            );
          })}
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Your category changes the number. A 50% subsidy can become 75%.”
          </div>
          <H2>Two kinds of help</H2>
          <p className="m-0">
            <strong>Money you do not repay.</strong> This is a capital subsidy. The government pays part of the cost, for example 50% of a new set of milch animals.
          </p>
          <p className="m-0">
            <strong>A cheaper loan.</strong> This is interest help. You still repay the bank, but at a lower rate. The Kisan Credit Card and the AHIDF scheme work this way.
          </p>
          <H2>Central or Maharashtra?</H2>
          <p className="m-0">Tap each one to see how it differs.</p>
        </div>

        <div className={`mx-3 mt-4 flex flex-col gap-2.5 ${sans}`}>
          {LEVELS.map((l, i) => {
            const isOpen = open === i;
            return (
              <div key={l.title} className="bg-white border border-[#DCDACF] rounded-[20px] overflow-hidden">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  className="w-full min-h-14 px-[18px] flex items-center justify-between text-left text-[16px] font-bold cursor-pointer"
                  style={{ background: l.tint, color: l.ink }}
                >
                  <span>{l.title}</span>
                  <span className="text-[20px]">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && <div className="px-[18px] py-4 text-[15px] leading-[1.55]">{l.body}</div>}
              </div>
            );
          })}
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Who are you, in short?</H2>
          <p className="m-0">A few shortcuts for the most common farmers.</p>
        </div>
        <div className={`mx-3 mt-3.5 flex flex-col gap-2.5 ${sans}`}>
          {SHORTCUTS.map((s) => (
            <div key={s.tag} className="rounded-[20px] p-4 flex flex-col gap-1" style={{ background: s.bg }}>
              <div className="text-[11px] font-bold tracking-[0.1em]" style={{ color: s.ink }}>{s.tag}</div>
              <div className="text-[16px] leading-normal">{s.text}</div>
            </div>
          ))}
        </div>

        {/* Takeaways */}
        <div className="mx-3 mt-7 bg-[#E5F27A] rounded-3xl p-4 flex flex-col gap-2.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#123B2C]`}>KEY TAKEAWAYS</div>
          <ul className="m-0 pl-5 text-[17px] leading-[1.5] flex flex-col gap-1.5">
            <li>Choose by what you want to do this year, not by scheme name.</li>
            <li>SC/ST farmers get a higher subsidy on MahaBMS (75%) and NABARD (33.33%).</li>
            <li>Some schemes pay you; some make your loan cheaper.</li>
            <li>Central and Maharashtra schemes can be used for different parts of your farm.</li>
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
          <div className="font-bold text-[21px] leading-[1.25]">Apply in six steps, in the right order</div>
          <div className={`${sans} text-[14px] leading-normal text-[#44504A]`}>One mistake with the order can cost you the subsidy.</div>
        </button>

        <div className={`px-4 pt-[22px] pb-4 ${sans} text-[13px] leading-normal text-[#5C6862]`}>
          Source: Government Subsidies Directory for Dairy Farming in India (Central and Maharashtra schemes).
        </div>
      </div>
    </div>
  );
};
