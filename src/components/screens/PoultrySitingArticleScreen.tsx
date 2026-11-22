import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

// key, label, minimum, target text, slider max, step, starting value
const DEFS: [string, string, number, string, number, number, number][] = [
  ['homes', 'Distance from homes', 500, '500 m or more', 1000, 10, 620],
  ['water', 'Distance from rivers, lakes, canals, wells', 100, '100 m or more', 300, 5, 140],
  ['nh', 'Distance from a national highway', 100, '100 m or more', 300, 5, 110],
  ['sh', 'Distance from a state highway', 50, '50 m or more', 200, 5, 30],
  ['road', 'Distance from a village road', 10, '10 to 15 m', 40, 1, 12],
  ['bound', 'Shed distance from your boundary', 10, '10 m or more', 40, 1, 14],
];

const WHYS = [
  { big: '500 m', title: 'From homes', text: 'Keeps smell and flies away from families.', tint: '#FFE2D3', ink: '#A04000' },
  { big: '100 m', title: 'From water', text: 'Protects rivers, lakes, canals and wells from leaks and spills.', tint: '#DDEBFF', ink: '#1F4E9A' },
  { big: '100 / 50 m', title: 'From highways', text: 'National highways need 100 m and state highways 50 m, to keep smell and flies off the road.', tint: '#FFF2D0', ink: '#7A4E00' },
];

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

export const PoultrySitingArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [vals, setVals] = useState<Record<string, number>>(() => Object.fromEntries(DEFS.map((d) => [d[0], d[6]])));

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const pass = DEFS.filter((d) => vals[d[0]] >= d[2]).length;
  const all = pass === DEFS.length;

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
            <span className="bg-[#DDEBFF] text-[#1F4E9A] rounded-md px-2 py-1">PLAN</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">POULTRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Where can you build? The siting rules</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            The right plot saves you from smell complaints, spoiled water and a costly move later.
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#DDEBFF] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMax slice" aria-hidden>
            <rect y="140" width="390" height="50" fill="#9CC3F2" />
            <path d="M0 150c40-10 80 10 120 0s80-10 120 0 80 10 150 0" stroke="#FFFFFF" strokeWidth="3" fill="none" opacity="0.7" />
            <rect x="150" y="70" width="90" height="50" fill="#FFFFFF" /><path d="M142 74l53-30 53 30z" fill="#1B7F5F" />
            <g fill="#C9A878"><rect x="30" y="92" width="34" height="28" /><rect x="326" y="92" width="34" height="28" /></g>
            <g fill="#8A5A36"><path d="M24 94l23-18 23 18z" /><path d="M320 94l23-18 23 18z" /></g>
            <path d="M70 106h70M250 106h70" stroke="#1A1F1B" strokeWidth="2" strokeDasharray="5 4" />
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">A poultry farm makes smell, flies and wastewater. Put it too close to homes or a well and you are asking for trouble.</p>
          <p className="m-0">
            The guidelines give a set of minimum distances for <strong>new</strong> farms. Think of them as your starting checklist when you look at a plot.
          </p>
          <H2>Check your plot</H2>
          <p className="m-0">Measure each distance on your plot, then move the sliders to match.</p>
        </div>

        {/* Distance checker */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-1.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#1F4E9A] uppercase">Try it · Distance checker</div>
          {DEFS.map(([key, name, min, target, max, step]) => {
            const v = vals[key];
            const ok = v >= min;
            const fill = (v / max) * 100;
            return (
              <div key={key} className="py-2 border-b border-[#E7E5DA]">
                <div className="flex items-center justify-between gap-2">
                  <label htmlFor={`sl-${key}`} className="text-[14px] font-semibold leading-[1.3]">{name}</label>
                  <span
                    className="shrink-0 text-[11px] font-bold tracking-[0.06em] rounded-full px-2.5 py-1 transition-colors"
                    style={{ background: ok ? '#DDF4EA' : '#FFDDE5', color: ok ? '#0F6B50' : '#A3173F' }}
                  >
                    {ok ? 'OK' : 'TOO CLOSE'}
                  </span>
                </div>
                <div className="flex justify-between text-[12px] font-medium text-[#5C6862]">
                  <span>{v} m</span>
                  <span>Aim for {target}</span>
                </div>
                <input
                  id={`sl-${key}`}
                  type="range"
                  min={0}
                  max={max}
                  step={step}
                  value={v}
                  onChange={(e) => setVals((s) => ({ ...s, [key]: Number(e.target.value) }))}
                  className="w-full h-11 m-0 cursor-pointer"
                  style={{
                    accentColor: '#123B2C',
                    background: `linear-gradient(#123B2C, #123B2C) 0 50% / ${fill}% 4px no-repeat, linear-gradient(#E7E5DA, #E7E5DA) 0 50% / 100% 4px no-repeat`,
                  }}
                />
              </div>
            );
          })}
          <div
            className="rounded-2xl p-3.5 mt-1.5 text-[15px] font-semibold leading-normal transition-colors"
            style={{ background: all ? '#DDF4EA' : '#FFF2D0', color: all ? '#0F6B50' : '#7A4E00' }}
          >
            {all
              ? 'All six distances are met. This plot looks good on siting.'
              : `${pass} of 6 distances are met. Look for a plot with more room on the red ones.`}
          </div>
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Walk the plot first, with a measuring tape. Then pay for it.”
          </div>
          <H2>Why these distances?</H2>
          <p className="m-0">Each rule protects something different.</p>
        </div>

        <div className={`mx-4 mt-4 flex flex-col gap-2.5 ${sans}`}>
          {WHYS.map((w) => (
            <div key={w.title} className="flex gap-3.5 items-start rounded-[18px] p-3.5" style={{ background: w.tint }}>
              <div className="shrink-0 w-16 text-[18px] font-bold text-center" style={{ color: w.ink }}>{w.big}</div>
              <div className="text-[15px] leading-normal">
                <strong>{w.title}</strong>
                <br />
                {w.text}
              </div>
            </div>
          ))}
        </div>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <h2 className="m-0 font-bold text-[26px] leading-[1.2]">Leave space around the shed</h2>
          <p className="m-0">
            Do not put sheds within 10 m of your own boundary. Air needs room to move through and carry the smell away before it reaches the neighbours.
          </p>
        </div>

        {/* Plot plan */}
        <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-2.5 ${sans}`}>
          <div className="text-[11px] font-bold tracking-[0.12em] text-[#1F4E9A] uppercase">See it · Plot plan</div>
          <svg viewBox="0 0 330 200" width="100%" role="img" aria-label="Plot with a shed set back at least 10 metres from the boundary">
            <rect x="10" y="10" width="310" height="180" fill="#F2F0E6" stroke="#8A8576" strokeWidth="2" strokeDasharray="6 4" />
            <rect x="60" y="50" width="210" height="80" rx="6" fill="#1B7F5F" />
            <text x="165" y="96" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="14" fontWeight="700" fill="#FFFFFF">Poultry shed</text>
            <path d="M10 90h50" stroke="#1A1F1B" strokeWidth="2" />
            <path d="M14 86l-4 4 4 4M56 86l4 4-4 4" stroke="#1A1F1B" strokeWidth="2" fill="none" />
            <text x="35" y="82" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1A1F1B">10 m+</text>
            <text x="165" y="176" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="600" fill="#44504A">Farm boundary</text>
          </svg>
        </div>

        {/* Takeaways */}
        <div className="px-4 pt-7">
          <div className="bg-[#E5F27A] rounded-[22px] p-4 flex flex-col gap-2">
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#2A3A00]`}>KEY TAKEAWAYS</div>
            <ul className="m-0 pl-5 text-[17px] leading-[1.55]">
              <li>500 m from homes. 100 m from rivers, lakes, canals and wells.</li>
              <li>100 m from national highways and 50 m from state highways.</li>
              <li>10 to 15 m from village roads, and 10 m from your own boundary.</li>
              <li>Measure first, buy second.</li>
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
              <div className={`${serif} text-[18px] font-bold leading-[1.25] mt-1`}>Which kind of poultry farm are you?</div>
              <div className="text-[13px] font-medium text-[#44504A] mt-1">6 min · Bird counter</div>
            </div>
            <span aria-hidden className="shrink-0 w-11 h-11 rounded-full bg-[#123B2C] text-white flex items-center justify-center text-[20px] font-semibold">›</span>
          </button>
        </div>

        <div className={`px-4 pt-[18px] pb-4 ${sans} text-[12px] leading-normal text-[#5C6862]`}>
          Source: Central Pollution Control Board, Environmental Guidelines for Poultry Farms (August 2021). These distances apply to new farms.
        </div>
      </div>
    </div>
  );
};
