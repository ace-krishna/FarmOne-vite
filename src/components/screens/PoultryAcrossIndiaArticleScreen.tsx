import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const TOTAL = 851.809;
const STATES: [string, number][] = [
  ['Tamil Nadu', 120.781],
  ['Andhra Pradesh', 107.863],
  ['Telangana', 79.999],
  ['West Bengal', 77.322],
  ['Maharashtra', 74.297],
  ['Karnataka', 59.494],
  ['Assam', 46.712],
  ['Haryana', 46.24],
  ['Kerala', 29.771],
  ['Odisha', 27.439],
];
const MAX = STATES[0][1];
const TOP5 = STATES.slice(0, 5).reduce((a, d) => a + d[1], 0);
const TOP5_PCT = Math.round((TOP5 / TOTAL) * 100);

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

export const PoultryAcrossIndiaArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [sel, setSel] = useState(4);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const [selName, selVal] = STATES[sel];
  const share = ((selVal / TOTAL) * 100).toFixed(1);

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
            <span className="bg-[#FFF2D0] text-[#7A4E00] rounded-md px-2 py-1">MARKET</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">POULTRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Poultry across India: where the birds are</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">India keeps more than 850 million poultry birds. See how your state stacks up.</div>
          <div className="flex items-center gap-2.5 border-t border-[#DCDACF] mt-1.5 pt-3.5">
            <span className={`w-10 h-10 rounded-full bg-[#123B2C] text-[#E5F27A] flex items-center justify-center ${sans} font-bold text-[14px]`}>F1</span>
            <span className={`flex flex-col ${sans} font-medium text-[13px] text-[#44504A]`}>
              <span className="font-bold text-[#1A1F1B]">Farm One editors</span>
              <span>4 min read · 20th Livestock Census figures</span>
            </span>
          </div>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Poultry farming in India has grown into a large, lively industry. The 20th Livestock Census counts <strong>851.8 million birds</strong> across the country.
          </p>
          <p className="m-0">
            The leading states are Tamil Nadu, Andhra Pradesh, Telangana and West Bengal, followed by Maharashtra, Karnataka, Assam, Haryana, Kerala and Odisha.
          </p>
          <H2>The ten biggest states</H2>
          <p className="m-0">Tap a bar to see the numbers.</p>
        </div>

        {/* Bars */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-1.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#7A4E00] uppercase">Try it · Birds by state (millions)</div>
          {STATES.map(([name, val], i) => {
            const on = sel === i;
            return (
              <button
                key={name}
                type="button"
                aria-pressed={on}
                onClick={() => setSel(i)}
                className="flex items-center gap-2 text-left min-h-11 p-0 cursor-pointer"
              >
                <span className="shrink-0 w-[92px] text-[12px]" style={{ fontWeight: on ? 700 : 500 }}>{name}</span>
                <span className="flex-1 h-[22px] bg-[#F2F0E6] rounded-md relative block overflow-hidden">
                  <span
                    className="absolute left-0 top-0 bottom-0 rounded-md transition-[width,background-color] duration-300"
                    style={{ width: `${Math.round((val / MAX) * 100)}%`, background: on ? '#E07B00' : i < 5 ? '#1B7F5F' : '#8FBFAA' }}
                  />
                </span>
                <span className="shrink-0 w-10 text-right text-[12px] font-bold">{val.toFixed(1)}</span>
              </button>
            );
          })}
          <div className="bg-[#FFF2D0] rounded-2xl p-3.5 mt-2 flex flex-col gap-1">
            <div className="text-[11px] font-bold tracking-[0.1em] text-[#7A4E00]">{selName.toUpperCase()} · RANK {sel + 1}</div>
            <div className="text-[22px] font-bold">{selVal.toFixed(1)} million birds</div>
            <div className="text-[14px] leading-normal text-[#3F2A00]">That is {share}% of all the poultry in India.</div>
          </div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Five states hold more than half of all poultry in India.”
          </div>
          <H2>How concentrated is it?</H2>
          <p className="m-0">
            The top five states together hold <strong>{TOP5_PCT}%</strong> of India’s birds. The other 31 states and territories share the rest.
          </p>
        </div>

        {/* Concentration donut */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex items-center gap-[18px] ${sans}`}>
          <div
            className="shrink-0 relative w-[120px] h-[120px] rounded-full"
            style={{ background: `conic-gradient(#E07B00 0 ${TOP5_PCT}%, #DCDACF ${TOP5_PCT}% 100%)` }}
          >
            <div className="absolute inset-[26px] rounded-full bg-white flex items-center justify-center text-[18px] font-bold">{TOP5_PCT}%</div>
          </div>
          <div className="flex flex-col gap-2 text-[13px] font-medium">
            <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-[#E07B00]" />Top five states</span>
            <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-[#DCDACF]" />All others</span>
          </div>
        </div>

        {/* Takeaways */}
        <div className="px-4 pt-7">
          <div className="bg-[#E5F27A] rounded-[22px] p-4 flex flex-col gap-2">
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#2A3A00]`}>KEY TAKEAWAYS</div>
            <ul className="m-0 pl-5 text-[17px] leading-[1.55]">
              <li>India has about 851.8 million poultry birds.</li>
              <li>Tamil Nadu leads, followed by Andhra Pradesh and Telangana.</li>
              <li>Maharashtra is fifth, with 74.3 million birds.</li>
              <li>Use these numbers to see how busy your state is before you start.</li>
            </ul>
          </div>
        </div>

        {/* Keep learning */}
        <div className="px-3 pt-[22px]">
          <button
            type="button"
            onClick={onOpenNext}
            className={`w-full text-left bg-[#E1F0F3] rounded-[22px] p-[18px] flex items-center gap-3.5 ${sans} ${onOpenNext ? 'cursor-pointer active:scale-[0.99] transition-transform' : 'cursor-default'}`}
          >
            <div className="flex-1">
              <div className="text-[11px] font-bold tracking-[0.12em] text-[#0F5F46]">KEEP LEARNING</div>
              <div className={`${serif} text-[18px] font-bold leading-[1.25] mt-1`}>i-Learning: Is your manure pile healthy?</div>
              <div className="text-[13px] font-medium text-[#44504A] mt-1">5 min · Pile checker</div>
            </div>
            <span aria-hidden className="shrink-0 w-11 h-11 rounded-full bg-[#123B2C] text-white flex items-center justify-center text-[20px] font-semibold">›</span>
          </button>
        </div>

        <div className={`px-4 pt-[18px] pb-4 ${sans} text-[12px] leading-normal text-[#5C6862]`}>
          Source: Central Pollution Control Board, Environmental Guidelines for Poultry Farms (August 2021), citing the 20th Livestock Census, Department of Animal Husbandry and Dairying.
        </div>
      </div>
    </div>
  );
};
