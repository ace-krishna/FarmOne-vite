import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const GROUPS: { name: string; tint: string; ink: string; items: string[] }[] = [
  {
    name: 'Manure store', tint: '#FFE2D3', ink: '#A04000',
    items: [
      'Base made of stone slabs, concrete or packed clay',
      'Floor at least 2 m above the water table',
      'Roof or cover so rain and run-off stay out',
      'Good ventilation so manure stays dry',
    ],
  },
  {
    name: 'Feed mill and store', tint: '#FFF2D0', ink: '#7A4E00',
    items: [
      'On raised ground, near the gate, apart from the sheds',
      'Concrete floor, raised at least 2 ft above ground',
      'Dust collector on the mixing and grinding area',
      'Dust masks for workers',
      'Tyre dip at the farm entrance',
    ],
  },
  {
    name: 'Wash water', tint: '#DDEBFF', ink: '#1F4E9A',
    items: [
      'Holding tank for wash water',
      'Green belt or garden to use the water on',
      'Calibrated, leak-free drinkers',
      'Drains that stop standing water',
    ],
  },
  {
    name: 'Dead birds', tint: '#EADDFB', ink: '#5B2E91',
    items: [
      'Closed containers for storage',
      'Burial pit, compost bay or incinerator ready',
      'Compost bay at least 300 m from homes and 100 m from wells',
      'Bay fenced with 1.5 m mesh against dogs',
    ],
  },
  {
    name: 'Medicines and waste', tint: '#DDF4EA', ink: '#0F6B50',
    items: [
      'Separate bin for used vaccine vials and syringes',
      'Disposal as per the Solid Waste Management Rules, 2016',
      'Antibiotics only on a vet’s prescription',
    ],
  },
];

const TOTAL = GROUPS.reduce((n, g) => n + g.items.length, 0);

const Card: React.FC<{ label?: string; children: React.ReactNode; gap?: string }> = ({ label, children, gap = 'gap-3' }) => (
  <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col ${gap} ${sans}`}>
    {label && <div className="text-[11px] font-bold tracking-[0.12em] text-[#0F6B50] uppercase">{label}</div>}
    {children}
  </div>
);

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

export const PoultryRuleBookArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [open, setOpen] = useState(0);
  const [chk, setChk] = useState<Record<string, boolean>>({ '0-0': true, '0-1': true });

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const doneN = Object.values(chk).filter(Boolean).length;
  const pct = Math.round((doneN / TOTAL) * 100);

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
            <span className="bg-[#DDF4EA] text-[#0F6B50] rounded-md px-2 py-1">BUILD</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">POULTRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">Build it right: the farm rule book</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            Five parts of your farm that the guidelines care about most, with a checklist you can carry to the site.
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#DDF4EA] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMax slice" aria-hidden>
            <rect y="150" width="390" height="40" fill="#C9D9B9" />
            <rect x="30" y="80" width="110" height="70" fill="#FFFFFF" /><path d="M22 84l63-34 63 34z" fill="#1B7F5F" />
            <rect x="170" y="100" width="80" height="50" fill="#FFFFFF" /><path d="M164 104l46-24 46 24z" fill="#E07B00" />
            <rect x="280" y="112" width="80" height="38" fill="#C9A878" /><rect x="274" y="108" width="92" height="8" fill="#8A5A36" />
            <path d="M190 150v-14M230 150v-14" stroke="#8A8576" strokeWidth="3" />
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">Most trouble on a poultry farm comes from four things: manure, dust, water and dead birds. Build for them from day one and you avoid expensive fixes.</p>
          <H2>Your build checklist</H2>
          <p className="m-0">Open a section, tick what is done or planned. The ring tracks your progress.</p>
        </div>

        {/* Checklist */}
        <Card>
          <div className="flex items-center gap-4">
            <div
              className="shrink-0 relative w-[84px] h-[84px] rounded-full"
              style={{ background: `conic-gradient(#0F8A5F 0 ${pct}%, #E7E5DA ${pct}% 100%)` }}
            >
              <div className="absolute inset-2.5 rounded-full bg-white flex items-center justify-center text-[18px] font-bold">{pct}%</div>
            </div>
            <div>
              <div className="text-[11px] font-bold tracking-[0.12em] text-[#0F6B50]">TRY IT · BUILD CHECKLIST</div>
              <div className="text-[15px] font-semibold mt-1">{doneN} of {TOTAL} items ready</div>
            </div>
          </div>

          {GROUPS.map((g, gi) => {
            const isOpen = open === gi;
            const count = g.items.filter((_, ii) => chk[`${gi}-${ii}`]).length;
            return (
              <div
                key={g.name}
                className="rounded-[18px] overflow-hidden"
                style={{ border: `2px solid ${isOpen ? '#123B2C' : '#E7E5DA'}`, background: isOpen ? '#FBFAF6' : '#FFFFFF' }}
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? -1 : gi)}
                  className="w-full flex items-center gap-2.5 text-left px-3.5 py-3 min-h-14 cursor-pointer"
                >
                  <span className="shrink-0 w-[34px] h-[34px] rounded-[10px] flex items-center justify-center text-[14px] font-bold" style={{ background: g.tint, color: g.ink }}>
                    {gi + 1}
                  </span>
                  <span className="flex-1 text-[15px] font-bold">{g.name}</span>
                  <span className="text-[12px] font-semibold text-[#44504A]">{count}/{g.items.length}</span>
                  <span aria-hidden className="text-[20px] font-medium w-4 text-center">{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <div className="px-3.5 pt-1 pb-2.5 flex flex-col">
                    {g.items.map((label, ii) => {
                      const k = `${gi}-${ii}`;
                      const on = !!chk[k];
                      return (
                        <button
                          key={k}
                          type="button"
                          role="checkbox"
                          aria-checked={on}
                          onClick={() => setChk((c) => ({ ...c, [k]: !c[k] }))}
                          className="flex items-start gap-3 text-left min-h-12 py-1.5 text-[14px] font-medium cursor-pointer"
                        >
                          <span
                            className="shrink-0 w-[26px] h-[26px] rounded-lg border-2 border-[#123B2C] text-white flex items-center justify-center text-[13px] font-bold"
                            style={{ background: on ? '#123B2C' : '#FFFFFF' }}
                          >
                            {on ? '✓' : ''}
                          </span>
                          <span className="leading-[1.45] pt-0.5">{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “Keep dry things dry, and wet things away from drinking water.”
          </div>
          <H2>The feed store, at a glance</H2>
          <p className="m-0">Feed grinding makes dust, and spilled feed brings pests. The feed store sits near the farm gate, apart from the poultry sheds.</p>
        </div>

        {/* Feed store layout */}
        <Card label="See it · Feed store layout" gap="gap-2.5">
          <svg viewBox="0 0 330 190" width="100%" role="img" aria-label="Feed store on raised ground near the gate, with a tyre dip, separate from the sheds">
            <rect x="0" y="150" width="330" height="40" fill="#E9D8BE" />
            <rect x="10" y="132" width="110" height="18" fill="#B8B4A5" />
            <rect x="18" y="70" width="94" height="62" fill="#FFFFFF" stroke="#8A8576" strokeWidth="2" />
            <path d="M10 74l55-30 55 30z" fill="#E07B00" />
            <text x="65" y="108" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#1A1F1B">Feed store</text>
            <text x="65" y="164" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1A1F1B">raised 2 ft+</text>
            <rect x="150" y="136" width="44" height="14" rx="4" fill="#5E9BE6" />
            <text x="172" y="170" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="700" fill="#1F4E9A">Tyre dip</text>
            <text x="172" y="128" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="11" fontWeight="600" fill="#44504A">Farm gate</text>
            <rect x="224" y="76" width="96" height="74" fill="#F2F0E6" stroke="#8A8576" strokeWidth="2" strokeDasharray="5 4" />
            <text x="272" y="118" textAnchor="middle" fontFamily="Inter,sans-serif" fontSize="12" fontWeight="700" fill="#1A1F1B">Poultry sheds</text>
          </svg>
        </Card>

        {/* Takeaways */}
        <div className="px-4 pt-7">
          <div className="bg-[#E5F27A] rounded-[22px] p-4 flex flex-col gap-2">
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#2A3A00]`}>KEY TAKEAWAYS</div>
            <ul className="m-0 pl-5 text-[17px] leading-[1.55]">
              <li>Store manure under cover, on a hard base, 2 m above the water table.</li>
              <li>Raise the feed store floor 2 ft, fit a dust collector, and keep a tyre dip at the gate.</li>
              <li>Collect wash water in a tank and use it on your green belt.</li>
              <li>Have a burial pit, compost bay or incinerator ready before you stock birds.</li>
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
              <div className={`${serif} text-[18px] font-bold leading-[1.25] mt-1`}>Poultry across India: where the birds are</div>
              <div className="text-[13px] font-medium text-[#44504A] mt-1">4 min · State chart</div>
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
