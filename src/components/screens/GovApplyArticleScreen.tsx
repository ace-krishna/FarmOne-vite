import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const STEPS = [
  { t: 'Prepare your project report', b: 'Write down your herd size, shed design, machinery cost, fodder plan and the money you expect. Banks and departments will ask for this first.', w: 'Who acts: you', tint: '#FFE2D3', ink: '#A04000' },
  { t: 'Collect your papers', b: 'Keep your 7/12 land extract or a registered lease, Aadhaar, PAN, passport photos and bank passbook ready.', w: 'Who acts: you', tint: '#FFF2D0', ink: '#7A4E00' },
  { t: 'Register online', b: 'Central schemes such as AHIDF and NLM: apply on udyamimitra.in. Maharashtra schemes: register on ah.mahabms.com or mahadbt.maharashtra.gov.in.', w: 'Who acts: you, on the portal', tint: '#DDEBFF', ink: '#1F4E9A' },
  { t: 'Wait for the Pre-Sanction Order', b: 'Wait for the official approval from the bank or the department, or for your name in the lottery. Do not buy any animals or equipment yet.', w: 'Who acts: the department or bank', tint: '#FFDDE5', ink: '#A3173F' },
  { t: 'Buy, then get it inspected', b: 'Buy animals or machines only from registered or empanelled sellers. The Talathi or Veterinary Officer will inspect and geo-tag what you bought.', w: 'Who acts: you, then the officer', tint: '#DDF4EA', ink: '#0F6B50' },
  { t: 'Receive your subsidy', b: 'After the physical check, the subsidy is sent straight to your Aadhaar-linked bank account, or to your loan account.', w: 'Who acts: the government (DBT)', tint: '#EADDFB', ink: '#5B2E91' },
];

const PORTALS = {
  c: [
    { name: 'AHIDF', site: 'ahidf.udyamimitra.in' },
    { name: 'National Livestock Mission', site: 'nlm.udyamimitra.in' },
    { name: 'Rashtriya Gokul Mission', site: 'dahd.nic.in' },
  ],
  m: [
    { name: 'MahaBMS: animals, sheds', site: 'ah.mahabms.com' },
    { name: 'MahaDBT: fodder, machines', site: 'mahadbt.maharashtra.gov.in' },
    { name: 'Dairy Entrepreneurship scheme', site: 'dahd.maharashtra.gov.in' },
  ],
};

const DOCS = ['Project report (DPR)', '7/12 extract or registered lease', 'Aadhaar card', 'PAN card', 'Passport photos', 'Bank passbook'];

const DPR = [
  { t: 'How many animals (for example, 10 cows)', bg: '#FFE2D3' },
  { t: 'The shed design', bg: '#DDEBFF' },
  { t: 'Machinery and its cost', bg: '#FFF2D0' },
  { t: 'Your fodder plan and the money you expect', bg: '#DDF4EA' },
];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

export const GovApplyArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [step, setStep] = useState(0);
  const [lvl, setLvl] = useState<'c' | 'm'>('c');
  const [docs, setDocs] = useState<boolean[]>(DOCS.map(() => false));

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const cur = STEPS[step];
  const done = docs.filter(Boolean).length;
  const pct = Math.round((done * 100) / DOCS.length);
  const docMsg = done === 6 ? 'You are ready to register.' : done === 0 ? 'Tick what you already have.' : `${6 - done} more to collect.`;

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
            <span className="bg-[#DDF4EA] text-[#0F6B50] rounded-md px-2 py-1">APPLY</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">DAIRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Apply in six steps, in the right order</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            The order matters more than anything else. Buy first, and you can lose the subsidy.
          </div>
        </div>

        {/* Illustration: six numbered stops */}
        <div className="mt-4 h-[190px] bg-[#DDF4EA] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <g stroke="#0F6B50" strokeWidth="3" strokeLinecap="round">
              <path d="M57 100h13M124 100h13M191 100h13M258 100h13M325 100h13" />
            </g>
            <g fill="#FFFFFF" stroke="#0F6B50" strokeWidth="3">
              {[35, 102, 169, 236, 303, 370].map((x) => (<circle key={x} cx={x} cy="100" r="22" />))}
            </g>
            <g fontFamily="Inter,sans-serif" fontWeight="700" fontSize="18" fill="#0F6B50" textAnchor="middle">
              {[35, 102, 169, 236, 303, 370].map((x, i) => (<text key={x} x={x} y="106">{i + 1}</text>))}
            </g>
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Government subsidies are paid <em>after</em> you buy, and only if the department has approved the purchase first. That one idea explains the whole process.
          </p>
          <H2>Walk through it</H2>
          <p className="m-0">Tap Next to move step by step.</p>
        </div>

        {/* Step guide */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#0F6B50] uppercase">Try it · Step guide</div>
          <div className="flex gap-1.5">
            {STEPS.map((s, i) => (
              <button key={s.t} type="button" aria-label={`Go to step ${i + 1}`} onClick={() => setStep(i)} className="flex-1 min-h-11 flex items-center p-0 cursor-pointer">
                <span className="w-full h-2 rounded transition-colors" style={{ background: i <= step ? '#0F6B50' : '#E7E5DA' }} />
              </button>
            ))}
          </div>
          <div className="rounded-[18px] p-[18px] flex flex-col gap-2 transition-colors" style={{ background: cur.tint }}>
            <div className="text-[11px] font-bold tracking-[0.1em]" style={{ color: cur.ink }}>STEP {step + 1} OF 6</div>
            <div className={`${serif} text-[24px] font-bold leading-[1.2]`} style={{ color: cur.ink }}>{cur.t}</div>
            <div className="text-[15px] leading-[1.55]">{cur.b}</div>
            <div className="text-[13px] font-semibold" style={{ color: cur.ink }}>{cur.w}</div>
          </div>
          <div className="flex gap-2.5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="flex-1 min-h-12 border border-[#DCDACF] bg-white rounded-full text-[14px] font-semibold cursor-pointer"
              style={{ opacity: step === 0 ? 0.4 : 1 }}
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setStep((s) => (s === 5 ? 0 : s + 1))}
              className="flex-[2] min-h-12 bg-[#123B2C] rounded-full text-[14px] font-semibold text-white cursor-pointer"
            >
              {step === 5 ? 'Start again' : 'Next'}
            </button>
          </div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#A3173F] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Do not buy cattle or equipment before you receive the Pre-Sanction Order.”
          </div>
          <p className="m-0">
            This is the rule that costs farmers the most money. If you buy first, the department has nothing to inspect and nothing to approve. Wait for the letter, then go shopping.
          </p>
          <H2>Where do you register?</H2>
          <p className="m-0">It depends on the scheme. Pick one.</p>
        </div>

        {/* Portals */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3 ${sans}`}>
          <div className="flex gap-1.5 bg-[#F2F0E6] rounded-full p-1">
            {([['c', 'Central'], ['m', 'Maharashtra']] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={lvl === k}
                onClick={() => setLvl(k)}
                className="flex-1 min-h-11 rounded-full text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ background: lvl === k ? '#123B2C' : 'transparent', color: lvl === k ? '#FFFFFF' : '#1A1F1B' }}
              >
                {label}
              </button>
            ))}
          </div>
          {PORTALS[lvl].map((p) => (
            <div key={p.name} className="bg-[#F2F0E6] rounded-[14px] px-3.5 py-3 flex flex-col gap-0.5">
              <div className="text-[14px] font-bold">{p.name}</div>
              <div className="text-[13px] font-medium text-[#1F4E9A]">{p.site}</div>
            </div>
          ))}
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Keep these ready</H2>
          <p className="m-0">Most delays come from one missing paper. Tick off what you already have.</p>
        </div>

        {/* Documents */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-1.5 ${sans}`}>
          <div className="flex items-center justify-between">
            <div className="text-[11px] font-bold tracking-[0.12em] text-[#5C6862] uppercase">Documents · {done} of 6</div>
            <div className="text-[14px] font-bold text-[#0F6B50]">{pct}%</div>
          </div>
          <div className="h-2 rounded bg-[#E7E5DA] overflow-hidden">
            <div className="h-full bg-[#0F6B50] transition-[width] duration-200" style={{ width: `${pct}%` }} />
          </div>
          {DOCS.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={docs[i]}
              onClick={() => setDocs((a) => a.map((v, j) => (j === i ? !v : v)))}
              className="min-h-[52px] flex items-center gap-3 text-left text-[15px] font-medium cursor-pointer"
            >
              <span
                className="shrink-0 w-[26px] h-[26px] rounded-lg border-2 border-[#123B2C] text-[#E5F27A] flex items-center justify-center text-[14px] font-bold"
                style={{ background: docs[i] ? '#123B2C' : '#FFFFFF' }}
              >
                {docs[i] ? '✓' : ''}
              </span>
              {label}
            </button>
          ))}
          <div className="text-[14px] font-semibold pt-1.5" style={{ color: done === 6 ? '#0F6B50' : '#44504A' }}>{docMsg}</div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>What goes in your project report?</H2>
          <p className="m-0">The report is called a DPR. It is simply your farm plan on paper. It should say:</p>
        </div>
        <div className={`mx-3 mt-3.5 grid grid-cols-2 gap-2.5 ${sans}`}>
          {DPR.map((d) => (
            <div key={d.t} className="rounded-[18px] p-3.5 text-[15px] font-semibold leading-[1.35]" style={{ background: d.bg }}>{d.t}</div>
          ))}
        </div>

        {/* Takeaways */}
        <div className="mx-3 mt-7 bg-[#E5F27A] rounded-3xl p-4 flex flex-col gap-2.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#123B2C]`}>KEY TAKEAWAYS</div>
          <ul className="m-0 pl-5 text-[17px] leading-[1.5] flex flex-col gap-1.5">
            <li>Plan, papers, register, wait, buy, then receive the subsidy.</li>
            <li>Do not buy before the Pre-Sanction Order.</li>
            <li>An officer will inspect and geo-tag what you bought.</li>
            <li>The subsidy goes to your Aadhaar-linked bank account.</li>
          </ul>
        </div>

        {/* Up next */}
        <button
          type="button"
          onClick={onOpenNext}
          className={`mx-3 mt-4 w-[calc(100%-1.5rem)] text-left bg-[#E1F0F3] rounded-[22px] p-4 flex flex-col gap-1.5 ${onOpenNext ? 'cursor-pointer active:scale-[0.99] transition-transform' : 'cursor-default'}`}
        >
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]`}>UP NEXT</div>
          <div className="font-bold text-[21px] leading-[1.25]">What will you really get?</div>
          <div className={`${sans} text-[14px] leading-normal text-[#44504A]`}>Try the subsidy calculator with your own numbers.</div>
        </button>

        <div className={`px-4 pt-[22px] pb-4 ${sans} text-[13px] leading-normal text-[#5C6862]`}>
          Source: Government Subsidies Directory for Dairy Farming in India, section on how to apply.
        </div>
      </div>
    </div>
  );
};
