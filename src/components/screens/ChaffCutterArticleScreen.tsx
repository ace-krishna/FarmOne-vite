import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

type Tab = 'hand' | 'elec' | 'pto';
const MACHINES: Record<Tab, { label: string; name: string; capacity: string; note: string; chop: string }> = {
  hand: { label: 'Hand', name: 'Hand or hand-and-pedal', capacity: 'About 300 kg of green fodder an hour', note: 'No power needed. Good for a few animals, or where electricity is unreliable.', chop: 'about 1 to 4 cm' },
  elec: { label: 'Electric', name: 'Electric motor', capacity: '1.5 HP: 1.6 to 3.2 tonnes a day', note: 'Fed by a chute or a conveyor. The usual choice for a growing herd.', chop: 'about 25 mm' },
  pto: { label: 'Tractor PTO', name: 'Tractor-driven (PTO)', capacity: 'Needs a tractor of 30 HP or more, at 540 rpm', note: 'For large herds and big fodder volumes where a tractor is already on the farm.', chop: '5 to 10 mm' },
};

const SAFETY = [
  'Flywheel locking pin',
  'Front guard on each knife',
  'Feed chute at least 900 mm long, with a cover or warning roller',
  'Blade cover and guards on gears and blower',
  'Operator manual in my local language',
  'Passed a 5-minute idle run',
];

const MAINT = {
  daily: ['Check the guards and the locking pin before starting.', 'Keep the feed chute and the area around the machine clear.', 'Switch off and wait for the blades to stop before you clear a jam.'],
  weekly: ['Check the belts and tighten the bolts.', 'Look at the blades for wear, and sharpen or replace them.', 'Check that every guard is firmly fixed.'],
};

const CHECKS = ['I know the three machine types', 'I can work out my daily hours', 'I know the six safety features to look for'];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

const Card: React.FC<{ label?: string; children: React.ReactNode; gap?: string }> = ({ label, children, gap = 'gap-3.5' }) => (
  <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col ${gap} ${sans}`}>
    {label && <div className="text-[11px] font-bold tracking-[0.12em] text-[#0F6B50] uppercase">{label}</div>}
    {children}
  </div>
);

const Segmented: React.FC<{ options: string[]; value: number; onChange: (i: number) => void; size?: number }> = ({ options, value, onChange, size = 13 }) => (
  <div className="flex gap-1.5 bg-[#F2F0E6] rounded-full p-1">
    {options.map((o, i) => (
      <button
        key={o}
        type="button"
        aria-pressed={value === i}
        onClick={() => onChange(i)}
        style={{ fontSize: size, background: value === i ? '#123B2C' : 'transparent', color: value === i ? '#FFFFFF' : '#1A1F1B' }}
        className="flex-1 min-h-11 rounded-full font-semibold cursor-pointer transition-colors"
      >
        {o}
      </button>
    ))}
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

export const ChaffCutterArticleScreen: React.FC<Props> = ({ onBack }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<Tab>('hand');
  const [kg, setKg] = useState(800);
  const [sf, setSf] = useState<boolean[]>(SAFETY.map(() => false));
  const [when, setWhen] = useState<'daily' | 'weekly'>('daily');
  const [checks, setChecks] = useState<boolean[]>([false, false, false]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const cur = MACHINES[tab];
  const hours = kg / 300;
  const hh = Math.round(hours * 10) / 10;
  const elLow = Math.round((kg / 1600) * 100);
  const elHigh = Math.round((kg / 3200) * 100);
  const done = sf.filter(Boolean).length;
  const ringInk = done === 6 ? '#0F6B50' : '#A3173F';
  const ringDeg = Math.round((done / 6) * 360);
  const sMsg = done === 6 ? 'Safe to buy' : done === 0 ? 'Tick what you can see' : `${6 - done} still missing`;
  const doneCount = checks.filter(Boolean).length;
  const tabs: Tab[] = ['hand', 'elec', 'pto'];

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
          <div className={`${sans} text-[12px] font-bold tracking-[0.1em] text-[#123B2C]`}>I-LEARNING · DAIRY</div>
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
            <span className="bg-[#DDF4EA] text-[#0F6B50] rounded-md px-2 py-1">FEED &amp; FODDER</span>
            <span className="bg-[#FFDDE5] text-[#A3173F] rounded-md px-2 py-1">SAFETY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Choosing and using a chaff cutter, safely</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            Chopped fodder means less waste and more milk. A chaff cutter is also one of the most dangerous machines on a farm.
          </div>
          <div className="flex items-center gap-2.5 border-t border-[#DCDACF] mt-1.5 pt-3.5">
            <span className={`w-10 h-10 shrink-0 rounded-full bg-[#123B2C] text-[#E5F27A] flex items-center justify-center ${sans} font-bold text-[14px]`}>F1</span>
            <span className={`flex flex-col ${sans} font-medium text-[13px] text-[#44504A]`}>
              <span className="font-bold text-[#1A1F1B]">Farm One editors</span>
              <span>6 min read · Based on TNAU data and BIS safety standards</span>
            </span>
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#DDF4EA] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <rect x="70" y="110" width="250" height="40" rx="8" fill="#FFFFFF" stroke="#0F6B50" strokeWidth="3" />
            <path d="M110 110 L150 56 H250 L290 110" fill="#FFFFFF" stroke="#0F6B50" strokeWidth="3" strokeLinejoin="round" />
            <circle cx="285" cy="130" r="28" fill="#E5F27A" stroke="#0F6B50" strokeWidth="3" />
            <g stroke="#0F6B50" strokeWidth="3" strokeLinecap="round"><path d="M285 130 l16 -10 M285 130 l-14 14 M285 130 l-4 -18" /></g>
            <g stroke="#0F6B50" strokeWidth="4" strokeLinecap="round"><path d="M96 86 l32 14 M92 100 l30 6" /></g>
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Cows eat more when fodder is cut short, and they waste less of it. Mixing green and dry fodder is easier too. A chaff cutter does this in minutes instead of hours.
          </p>
          <H2>Three kinds of machine</H2>
          <p className="m-0">Tap each one to compare.</p>
        </div>

        {/* Machine types */}
        <Card label="Try it · Machine types">
          <Segmented options={tabs.map((t) => MACHINES[t].label)} value={tabs.indexOf(tab)} onChange={(i) => setTab(tabs[i])} size={12} />
          <div className="bg-[#DDF4EA] rounded-[18px] p-4 flex flex-col gap-2">
            <div className={`${serif} text-[22px] font-bold text-[#0F6B50] leading-[1.2]`}>{cur.name}</div>
            <div className="text-[16px] font-bold">{cur.capacity}</div>
            <div className="text-[14px] leading-normal">{cur.note}</div>
            <div className="text-[13px] font-semibold text-[#0F6B50]">Chop length: {cur.chop}</div>
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Will it keep up with your herd?</H2>
          <p className="m-0">Divide the fodder you cut each day by the machine's hourly capacity. That gives your working hours.</p>
        </div>

        {/* Working hours */}
        <Card label="Try it · Working hours" gap="gap-3">
          <div className="flex justify-between text-[14px] font-semibold">
            <label htmlFor="fodderKg">Fodder cut per day</label>
            <span>{kg} kg</span>
          </div>
          <input
            id="fodderKg"
            type="range"
            min={100}
            max={3000}
            step={100}
            value={kg}
            onChange={(e) => setKg(Number(e.target.value))}
            className="w-full h-11 m-0 cursor-pointer"
            style={{
              accentColor: '#123B2C',
              background: `linear-gradient(#123B2C, #123B2C) 0 50% / ${((kg - 100) / 2900) * 100}% 4px no-repeat, linear-gradient(#E7E5DA, #E7E5DA) 0 50% / 100% 4px no-repeat`,
            }}
          />
          <div className="flex gap-2">
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">HAND MACHINE</div>
              <div className="text-[20px] font-bold mt-1" style={{ color: hours > 8 ? '#A3173F' : '#0F6B50' }}>{hh} hours</div>
              <div className="text-[12px] font-medium text-[#44504A]">{hours > 8 ? 'More than a working day' : 'Doable in a day'}</div>
            </div>
            <div className="flex-1 bg-[#F2F0E6] rounded-[14px] p-3">
              <div className="text-[11px] font-bold tracking-[0.08em] text-[#5C6862]">1.5 HP ELECTRIC</div>
              <div className="text-[20px] font-bold mt-1" style={{ color: elLow > 100 ? '#A3173F' : '#0F6B50' }}>{elHigh}% to {elLow}%</div>
              <div className="text-[12px] font-medium text-[#44504A]">{elLow > 100 ? 'May need a bigger machine' : 'of a day’s capacity'}</div>
            </div>
          </div>
          <div className="text-[13px] leading-normal text-[#5C6862]">
            Hand machine: about 300 kg of green fodder an hour. 1.5 HP electric: about 1.6 to 3.2 tonnes a day.
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#A3173F] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Most chaff cutter accidents happen when you are tired, between 3 and 6 in the evening.”
          </div>
          <p className="m-0">
            A study in Gurdaspur, Punjab linked chaff cutters to most amputation injuries. Of those, 45% happened between 3 and 6 PM, and 30% were linked to fatigue.
          </p>
          <H2>Check before you buy or use</H2>
          <p className="m-0">A safe machine meets the BIS standard. Tick each feature you can see.</p>
        </div>

        {/* Safety checklist */}
        <Card gap="gap-1.5">
          <div className="flex items-center gap-3.5">
            <div
              className="shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
              style={{ background: `conic-gradient(${ringInk} 0 ${ringDeg}deg, #E7E5DA ${ringDeg}deg 360deg)` }}
            >
              <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center text-[14px] font-bold">{done}/6</div>
            </div>
            <div className="text-[15px] font-bold" style={{ color: ringInk }}>{sMsg}</div>
          </div>
          {SAFETY.map((label, i) => (
            <button
              key={label}
              type="button"
              aria-pressed={sf[i]}
              onClick={() => setSf((a) => a.map((v, j) => (j === i ? !v : v)))}
              className="min-h-[52px] flex items-center gap-3 text-left text-[15px] font-medium cursor-pointer"
            >
              <Tick on={sf[i]} />
              {label}
            </button>
          ))}
        </Card>
        <div className={`mx-3 mt-3 bg-[#FFF2D0] rounded-[18px] p-3.5 text-[14px] font-medium leading-normal ${sans}`}>
          Run the machine empty for 5 minutes before first use. Ask the seller for a test report and a manual in your local language.
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <H2>Keep it in shape</H2>
          <p className="m-0">A few minutes of care keeps the machine safe and the blades sharp.</p>
        </div>

        {/* Maintenance */}
        <Card>
          <Segmented options={['Every day', 'Every week']} value={when === 'daily' ? 0 : 1} onChange={(i) => setWhen(i === 0 ? 'daily' : 'weekly')} />
          {MAINT[when].map((m) => (
            <div key={m} className="flex gap-2.5 items-start text-[15px] font-medium leading-[1.45]">
              <span className="shrink-0 w-2 h-2 rounded-full bg-[#0F6B50] mt-[7px]" />
              {m}
            </div>
          ))}
          <div className="text-[13px] text-[#5C6862]">Sharpen or replace blades on time.</div>
        </Card>

        {/* Takeaways */}
        <div className="mx-3 mt-7 bg-[#E5F27A] rounded-3xl p-4 flex flex-col gap-2.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#123B2C]`}>KEY TAKEAWAYS</div>
          <ul className="m-0 pl-5 text-[17px] leading-[1.5] flex flex-col gap-1.5">
            <li>Match the machine to your daily fodder and your power supply.</li>
            <li>Hand: about 300 kg an hour. Electric 1.5 HP: 1.6 to 3.2 tonnes a day.</li>
            <li>Look for the locking pin, front guard, long feed chute and blade covers.</li>
            <li>Do not work when tired, especially in the late afternoon.</li>
          </ul>
        </div>

        {/* Before you move on */}
        <Card label={`Before you move on · ${doneCount} of 3`} gap="gap-2.5">
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

        {/* Good to know */}
        <div className="mx-3 mt-4 bg-[#E1F0F3] rounded-[22px] p-4 flex flex-col gap-1.5">
          <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]`}>GOOD TO KNOW · FARM SETUP</div>
          <div className="font-bold text-[20px] leading-[1.25]">Subsidies for fodder machines</div>
          <div className={`${sans} text-[14px] leading-normal text-[#44504A]`}>
            The National Livestock Mission pays 50% for hay and silage units, which can include heavy-duty chaff cutters.
          </div>
        </div>

        <div className={`px-4 pt-[22px] pb-4 ${sans} text-[13px] leading-normal text-[#5C6862]`}>
          Source: TNAU machinery data; BIS IS 15542:2005, carried into IS 11459:2024; National Livestock Mission guidelines (Jan 2025).
        </div>
      </div>
    </div>
  );
};
