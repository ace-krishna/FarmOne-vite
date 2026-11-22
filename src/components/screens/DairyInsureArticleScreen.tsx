import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const inr = (n: number) => '₹' + n.toLocaleString('en-IN');

const CASES = [
  { t: 'Your cow dies of an infection that started after the policy began.', v: 'Covered, after the 15-day waiting period for disease.', ok: true },
  { t: 'The animal had an illness before the policy started.', v: 'Not covered. Existing illness is excluded.', ok: false },
  { t: 'The ear tag is missing at the time of the claim.', v: 'Not covered. Claims without an intact tag are refused.', ok: false },
  { t: 'Death from flood, fire or lightning (commercial policy).', v: 'Usually covered under commercial cattle policies.', ok: true },
  { t: 'You lose milk income while the animal is sick.', v: 'Not covered. Losses that follow from the death are excluded.', ok: false },
  { t: 'Death caused by neglect or overloading the animal.', v: 'Not covered. Wilful injury, neglect and overloading are excluded.', ok: false },
];

const ENROL = [
  { text: 'Open the 1962 / NDLM app and find the livestock insurance link.', tint: '#DDEBFF', ink: '#1F4E9A' },
  { text: 'Register with your NDLM mobile number and one ear tag number.', tint: '#FFF2D0', ink: '#7A4E00' },
  { text: 'Confirm your address and choose your animals by tag number.', tint: '#DDF4EA', ink: '#0F6B50' },
  { text: 'Submit, then log in again to track the status.', tint: '#EADDFB', ink: '#5B2E91' },
];

const CLAIM = [
  { t: 'Tell the insurer the same day', b: 'Call or message the insurer on the day the animal dies. Waiting makes a claim harder.' },
  { t: 'Get a vet to examine the animal', b: 'The vet checks the animal and gives a death certificate.' },
  { t: 'Get the post-mortem done', b: 'Keep the report. Do not dispose of the carcass before the inspection is done.' },
  { t: 'Photograph the animal and the tag', b: 'Take clear photos, and keep the ear tag safe. You will need both.' },
  { t: 'Fill the claim form online', b: 'Log in, open My Claims, fill the form and upload your documents.' },
  { t: 'Save the claim number', b: 'Keep the claim number and every SMS confirmation until you are paid.' },
];

const CHECKS = [
  'I know I pay only 15% of the premium',
  'I know the subsidy stops at 10 cattle units',
  'I know every animal needs an intact ear tag',
  'I know to inform the insurer on the same day',
];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

const Card: React.FC<{ label: string; children: React.ReactNode; gap?: string }> = ({ label, children, gap = 'gap-3.5' }) => (
  <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col ${gap} ${sans}`}>
    <div className="text-[11px] font-bold tracking-[0.12em] text-[#A3173F] uppercase">{label}</div>
    {children}
  </div>
);

const Tick: React.FC<{ on: boolean }> = ({ on }) => (
  <span
    className="shrink-0 w-[26px] h-[26px] rounded-lg border-2 border-[#123B2C] text-[#E5F27A] flex items-center justify-center text-[14px] font-bold"
    style={{ background: on ? '#123B2C' : '#FFFFFF' }}
  >
    {on ? '✓' : ''}
  </span>
);

const Stepper: React.FC<{ label: React.ReactNode; value: number; onMinus: () => void; onPlus: () => void; aria: string }> = ({ label, value, onMinus, onPlus, aria }) => (
  <div className="flex items-center justify-between gap-2 min-h-11">
    <span className="text-[14px] font-semibold">{label}</span>
    <span className="flex items-center gap-2.5 shrink-0">
      <button type="button" aria-label={`Fewer ${aria}`} onClick={onMinus} className="w-11 h-11 rounded-full border border-[#DCDACF] bg-white text-[20px] font-semibold cursor-pointer active:scale-95 transition">−</button>
      <span className="min-w-[22px] text-center text-[16px] font-bold">{value}</span>
      <button type="button" aria-label={`More ${aria}`} onClick={onPlus} className="w-11 h-11 rounded-full border border-[#DCDACF] bg-white text-[20px] font-semibold cursor-pointer active:scale-95 transition">+</button>
    </span>
  </div>
);

export const DairyInsureArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [animal, setAnimal] = useState<'cow' | 'buf'>('cow');
  const [milk, setMilk] = useState(10);
  const [cows, setCows] = useState(4);
  const [goats, setGoats] = useState(20);
  const [open, setOpen] = useState(-1);
  const [step, setStep] = useState(0);
  const [checks, setChecks] = useState<boolean[]>([false, false, false, false]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const rate = animal === 'cow' ? 3000 : 4000;
  const value = milk * rate;
  const prem = Math.round(value * 0.045);
  const you = Math.round(prem * 0.15);
  const units = Math.round((cows + goats / 10) * 10) / 10;
  const over = units > 10;
  const barColor = over ? '#A3173F' : '#0F6B50';
  const doneCount = checks.filter(Boolean).length;
  const cur = CLAIM[step];

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
            <span className="bg-[#FFDDE5] text-[#A3173F] rounded-md px-2 py-1">PROTECT</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">DAIRY · GOAT</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Insure your cow or buffalo for less than you think</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            The government pays most of the premium. Here is what it costs you, and what you must do so a claim is never refused.
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#FFDDE5] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <path d="M195 26 L290 56 V106 C290 146 246 166 195 180 C144 166 100 146 100 106 V56 Z" fill="#FFFFFF" stroke="#A3173F" strokeWidth="4" strokeLinejoin="round" />
            <path d="M160 104 l26 26 l46 -52" fill="none" stroke="#A3173F" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            One cow dying can wipe out a year of income. Under the government's livestock insurance, the farmer pays only <strong>15%</strong> of the premium. The Centre and the State pay the other <strong>85%</strong>.
          </p>
          <H2>What will it cost you?</H2>
          <p className="m-0">Enter your animal's daily milk. We work out its minimum insured value and your share of the premium.</p>
        </div>

        {/* Premium calculator */}
        <Card label="Try it · Premium calculator">
          <div className="flex gap-1.5 bg-[#F2F0E6] rounded-full p-1">
            {([['cow', 'Cow'], ['buf', 'Buffalo']] as const).map(([k, label]) => (
              <button
                key={k}
                type="button"
                aria-pressed={animal === k}
                onClick={() => setAnimal(k)}
                className="flex-1 min-h-11 rounded-full text-[13px] font-semibold cursor-pointer transition-colors"
                style={{ background: animal === k ? '#123B2C' : 'transparent', color: animal === k ? '#FFFFFF' : '#1A1F1B' }}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[14px] font-semibold">
            <label htmlFor="dailyMilk">Daily milk</label>
            <span>{milk} litres</span>
          </div>
          <input
            id="dailyMilk"
            type="range"
            min={2}
            max={25}
            step={1}
            value={milk}
            onChange={(e) => setMilk(Number(e.target.value))}
            className="w-full h-11 m-0 cursor-pointer"
            style={{
              accentColor: '#123B2C',
              background: `linear-gradient(#123B2C, #123B2C) 0 50% / ${((milk - 2) / 23) * 100}% 4px no-repeat, linear-gradient(#E7E5DA, #E7E5DA) 0 50% / 100% 4px no-repeat`,
            }}
          />
          <div className="bg-[#FFDDE5] rounded-[18px] p-4 flex flex-col gap-1.5">
            <div className="text-[11px] font-bold tracking-[0.1em] text-[#A3173F]">MINIMUM INSURED VALUE</div>
            <div className={`${serif} text-[28px] font-bold text-[#A3173F]`}>{inr(value)}</div>
            <div className="text-[13px]">₹{rate.toLocaleString('en-IN')} per litre of daily milk</div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">FULL PREMIUM, 1 YEAR</div>
              <div className="text-[17px] font-bold mt-1">{inr(prem)}</div>
            </div>
            <div className="flex-1 bg-[#DDF4EA] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#0F6B50]">YOU PAY (15%)</div>
              <div className="text-[17px] font-bold mt-1 text-[#0F6B50]">{inr(you)}</div>
            </div>
          </div>
          <div className="text-[13px] leading-normal text-[#5C6862]">Uses the highest allowed rate of 4.5% a year. Your state insurer may charge less.</div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#A3173F] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “No ear tag, no claim. Keep the tag safe, and replace it at once if it is lost.”
          </div>
          <H2>How many animals get the subsidy?</H2>
          <p className="m-0">
            The subsidy covers up to <strong>10 cattle units</strong> per family. Animals above that are still insured, but at the full premium. Different animals count differently.
          </p>
        </div>

        {/* Cattle units */}
        <Card label="Try it · Cattle units" gap="gap-3">
          <Stepper
            aria="cows or buffaloes"
            value={cows}
            onMinus={() => setCows((c) => Math.max(0, c - 1))}
            onPlus={() => setCows((c) => Math.min(20, c + 1))}
            label={<>Cows or buffaloes <span className="text-[#5C6862] font-medium">(1 unit each)</span></>}
          />
          <Stepper
            aria="goats or sheep"
            value={goats}
            onMinus={() => setGoats((g) => Math.max(0, g - 5))}
            onPlus={() => setGoats((g) => Math.min(100, g + 5))}
            label={<>Goats or sheep <span className="text-[#5C6862] font-medium">(10 = 1 unit)</span></>}
          />
          <div className="h-3 rounded-md bg-[#E7E5DA] overflow-hidden">
            <div className="h-full transition-[width,background-color] duration-200" style={{ width: `${Math.min(100, units * 10)}%`, background: barColor }} />
          </div>
          <div className="flex justify-between text-[15px] font-bold">
            <span>{units} of 10 units</span>
            <span style={{ color: barColor }}>{over ? 'Extra animals at full premium' : 'All with subsidy'}</span>
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Is it covered?</H2>
          <p className="m-0">Tap each case to find out whether an insurer will pay.</p>
        </div>
        <div className={`mx-3 mt-3.5 flex flex-col gap-2.5 ${sans}`}>
          {CASES.map((c, i) => {
            const isOpen = open === i;
            return (
              <button
                key={c.t}
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className="rounded-[18px] px-4 py-3.5 text-left flex flex-col gap-1.5 min-h-14 cursor-pointer transition-colors"
                style={{ background: isOpen ? (c.ok ? '#DDF4EA' : '#FFDDE5') : '#F2F0E6' }}
              >
                <span className="text-[15px] font-semibold">{c.t}</span>
                {isOpen && <span className="text-[14px] font-bold" style={{ color: c.ok ? '#0F6B50' : '#A3173F' }}>{c.v}</span>}
              </button>
            );
          })}
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Sign up in four steps</H2>
          <p className="m-0">Use the 1962 / NDLM app. Keep your phone and your animal's ear tag number handy.</p>
        </div>
        <div className="mx-3 mt-3.5 flex flex-col gap-2.5">
          {ENROL.map((s, i) => (
            <div key={s.text} className="flex gap-3 items-start rounded-[18px] p-3.5" style={{ background: s.tint }}>
              <span className={`shrink-0 w-[34px] h-[34px] rounded-full bg-white flex items-center justify-center ${sans} font-bold text-[15px]`} style={{ color: s.ink }}>{i + 1}</span>
              <span className={`${sans} text-[15px] font-semibold leading-[1.4]`}>{s.text}</span>
            </div>
          ))}
        </div>
        <div className={`mx-3 mt-3 bg-[#FFF2D0] rounded-[18px] p-3.5 text-[14px] font-medium leading-normal ${sans}`}>
          A vet will examine the animal and agree its value. You also need two photos: you with the animal, and a close-up of the ear tag.
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>If an animal dies</H2>
          <p className="m-0">Follow the order. Tap Next.</p>
        </div>

        {/* Claim guide */}
        <Card label="Try it · Claim guide">
          <div className="flex gap-1.5">
            {CLAIM.map((c, i) => (
              <button key={c.t} type="button" aria-label={`Go to step ${i + 1}`} onClick={() => setStep(i)} className="flex-1 min-h-11 flex items-center p-0 cursor-pointer">
                <span className="w-full h-2 rounded transition-colors" style={{ background: i <= step ? '#A3173F' : '#E7E5DA' }} />
              </button>
            ))}
          </div>
          <div className="bg-[#FFDDE5] rounded-[18px] p-[18px] flex flex-col gap-2">
            <div className="text-[11px] font-bold tracking-[0.1em] text-[#A3173F]">STEP {step + 1} OF 6</div>
            <div className={`${serif} text-[22px] font-bold leading-[1.2]`}>{cur.t}</div>
            <div className="text-[15px] leading-[1.55]">{cur.b}</div>
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
          <div className="text-[13px] font-medium leading-normal text-[#44504A]">
            Claims are usually settled within 21 to 25 days of the last document. Late payment earns you 12% interest a year.
          </div>
        </Card>

        {/* Takeaways */}
        <div className="mx-3 mt-7 bg-[#E5F27A] rounded-3xl p-4 flex flex-col gap-2.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#123B2C]`}>KEY TAKEAWAYS</div>
          <ul className="m-0 pl-5 text-[17px] leading-[1.5] flex flex-col gap-1.5">
            <li>You pay 15% of the premium. The government pays 85%.</li>
            <li>The subsidy covers up to 10 cattle units per family.</li>
            <li>Every animal needs a 12-digit ear tag. No tag, no claim.</li>
            <li>Tell the insurer the same day, and do not dispose of the carcass before inspection.</li>
          </ul>
        </div>

        {/* Before you move on */}
        <Card label={`Before you move on · ${doneCount} of 4`} gap="gap-2.5">
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
        </Card>

        {/* Up next */}
        <button
          type="button"
          onClick={onOpenNext}
          className={`mx-3 mt-4 w-[calc(100%-1.5rem)] text-left bg-[#E1F0F3] rounded-[22px] p-4 flex flex-col gap-1.5 ${onOpenNext ? 'cursor-pointer active:scale-[0.99] transition-transform' : 'cursor-default'}`}
        >
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]`}>UP NEXT</div>
          <div className="font-bold text-[21px] leading-[1.25]">Poultry: what it costs and who funds it</div>
          <div className={`${sans} text-[14px] leading-normal text-[#44504A]`}>Real project numbers for a 10,000-bird unit, and the subsidy for rural poultry.</div>
        </button>

        <div className={`px-4 pt-[22px] pb-4 ${sans} text-[13px] leading-normal text-[#5C6862]`}>
          Source: National Livestock Mission livestock insurance (Pashudhan Bima Yojana) and the DAHD portal FAQ.
        </div>
      </div>
    </div>
  );
};
