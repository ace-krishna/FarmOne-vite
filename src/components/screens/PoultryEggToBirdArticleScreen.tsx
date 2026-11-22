import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const LINKS = [
  { label: 'Breeding', title: 'Breeder farms', body: 'Breeder farms produce the fertilised eggs. Breeders mostly live in cages, and eggs come from artificial insemination. Eggs are collected daily, checked, and stored in trays in a controlled room.' },
  { label: 'Hatching', title: 'Hatchery', body: 'Eggs rest for 4 to 10 days, then go into incubators that control heat and humidity. Hatching takes about 21 days. Chicks are vaccinated and graded for even quality.' },
  { label: 'Laying', title: 'Layer farms', body: 'Female chicks go to layer farms and start laying eggs from about 18 weeks. Only female chicks from laying stock are sent on.' },
  { label: 'Meat', title: 'Broiler farms', body: 'Day-old broiler chicks arrive mixed, male and female together. They are reared for about 40 to 45 days until they weigh 2.5 to 3 kg.' },
];

type Phase = { name: string; short: string; grow: number; color: string; when: string; body: string };
const TIMELINES: Record<'layer' | 'broiler', { end: string; phases: Phase[] }> = {
  layer: {
    end: '75 weeks',
    phases: [
      { name: 'Chick house', short: 'Chick', grow: 6.4, color: '#8A4FD0', when: '0 to 45 days', body: 'Chicks are warmed in an enclosed area for the first 3 to 4 weeks, using gas brooders, electric hovers, infra-red bulbs or coal brooders.' },
      { name: 'Grower house', short: 'Grower', grow: 11.6, color: '#1B7F5F', when: '45 days to 18 weeks', body: 'Birds move to open growing houses. These can be deep litter or cages. Birds under six months are called pullets.' },
      { name: 'Layer house', short: 'Laying', grow: 57, color: '#E07B00', when: '18 weeks to 72–75 weeks', body: 'Hens move into laying cages and stay until the end of their laying life. After about 72 to 75 weeks, laying slows and stops paying.' },
    ],
  },
  broiler: {
    end: '45 days',
    phases: [
      { name: 'Brooding', short: 'Brooding', grow: 3.5, color: '#8A4FD0', when: 'First 3 to 4 weeks', body: 'Chicks get extra warmth in an enclosed area. The length depends on the season.' },
      { name: 'Growing', short: 'Growing', grow: 3, color: '#1B7F5F', when: 'Until day 40 to 45', body: 'Birds grow on a bed of dry litter, with hanging feeders and drinkers. Most reach 2.5 to 3 kg by day 40 to 45.' },
      { name: 'Market', short: 'Sale', grow: 1, color: '#E07B00', when: 'Day 40 to 45', body: 'Birds are sold for slaughter depending on weight. Then the shed is cleaned and rested.' },
    ],
  },
};

const HOUSING: Record<'deep' | 'cage', [string, string][]> = {
  deep: [
    ['What it is', 'Birds live on a bed of rice husk, sawdust, groundnut hulls, wood shavings or dried leaves.'],
    ['Best for', 'Most broilers, and layers up to 18 weeks.'],
    ['Feed and water', 'Done by hand on small farms, with automatic equipment on large ones.'],
    ['Waste', 'Droppings mix into the bed, which is removed at the end of the batch.'],
  ],
  cage: [
    ['What it is', 'Cages on raised platforms in open sheds, three or four birds to a cage.'],
    ['Best for', 'Commercial layers, breeders, and these days some broiler breeders.'],
    ['Feed and water', 'Water through nipples on a closed pipe. Feed in a trough along the front.'],
    ['Waste', 'Droppings fall through gaps onto the floor below and are collected there.'],
  ],
};

const POP_TRANSITION = 'transform 260ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 200ms ease, background-color 200ms ease';

const Card: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className={`mx-3 mt-4 bg-white border border-[#DCDACF] rounded-3xl p-4 flex flex-col gap-3 ${sans}`}>
    <div className="text-[11px] font-bold tracking-[0.12em] text-[#5B2E91] uppercase">{label}</div>
    {children}
  </div>
);

const Pills: React.FC<{ options: string[]; value: number; onChange: (i: number) => void }> = ({ options, value, onChange }) => (
  <div className="flex gap-2">
    {options.map((o, i) => (
      <button
        key={o}
        type="button"
        aria-pressed={value === i}
        onClick={() => onChange(i)}
        className={`flex-1 min-h-11 rounded-full text-[14px] font-semibold cursor-pointer transition-colors ${value === i ? 'bg-[#123B2C] text-white' : 'bg-[#F2F0E6] text-[#1A1F1B]'}`}
      >
        {o}
      </button>
    ))}
  </div>
);

const H2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="m-0 mt-1.5 font-bold text-[26px] leading-[1.2]">{children}</h2>
);

export const PoultryEggToBirdArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState(false);
  const [link, setLink] = useState(0);
  const [kind, setKind] = useState<'layer' | 'broiler'>('layer');
  const [ph, setPh] = useState(0);
  const [house, setHouse] = useState<'deep' | 'cage'>('deep');

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(100, Math.max(0, (el.scrollTop / max) * 100)) : 0);
  };

  const tl = TIMELINES[kind];
  const cur = tl.phases[Math.min(ph, tl.phases.length - 1)];

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
            <span className="bg-[#EADDFB] text-[#5B2E91] rounded-md px-2 py-1">PLAN</span>
            <span className="bg-[#E1F0F3] text-[#0F5F46] rounded-md px-2 py-1">POULTRY</span>
          </div>
          <h1 className="m-0 font-bold text-[33px] leading-[1.1] tracking-[-0.02em]">From egg to bird: how a poultry farm works</h1>
          <div className="text-[18px] leading-[1.4] text-[#44504A]">
            Before you pick a shed or a supplier, know the path a bird takes. It decides what you build.
          </div>
        </div>

        {/* Illustration */}
        <div className="mt-4 h-[190px] bg-[#EADDFB] overflow-hidden">
          <svg className="w-full h-full" viewBox="0 0 390 190" preserveAspectRatio="xMidYMid slice" aria-hidden>
            <ellipse cx="110" cy="100" rx="42" ry="54" fill="#FFFFFF" />
            <path d="M110 60l-10 18 14 8-12 20" stroke="#5B2E91" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M170 100h50" stroke="#5B2E91" strokeWidth="5" strokeLinecap="round" />
            <path d="M210 90l12 10-12 10" stroke="#5B2E91" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="290" cy="112" r="34" fill="#F5D77A" /><circle cx="302" cy="100" r="22" fill="#F5D77A" />
            <circle cx="310" cy="96" r="3.5" fill="#1A1F1B" /><path d="M322 102l16 5-16 5z" fill="#E07B00" />
          </svg>
        </div>

        <div className="px-4 pt-[26px] flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <p className="m-0">
            Poultry farming is not one job. It is a chain, and most farms handle one link of it: breeding, hatching, laying eggs, or growing meat birds.
          </p>
          <H2>The chain, link by link</H2>
          <p className="m-0">Tap a link to see what happens there.</p>
        </div>

        {/* The chain */}
        <Card label="Try it · The chain">
          <div className="flex gap-1.5 pt-1.5">
            {LINKS.map((l, i) => {
              const on = link === i;
              return (
                <button
                  key={l.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setLink(i)}
                  className="relative flex-1 min-h-14 rounded-[14px] text-[12px] font-bold leading-tight px-0.5 py-1.5 cursor-pointer"
                  style={{
                    background: on ? '#5B2E91' : '#F2F0E6',
                    color: on ? '#FFFFFF' : '#1A1F1B',
                    transform: on ? 'translateY(-4px) scale(1.1)' : 'none',
                    boxShadow: on ? '0 8px 14px -4px rgba(60,25,100,0.45)' : 'none',
                    zIndex: on ? 2 : 1,
                    transition: POP_TRANSITION,
                  }}
                >
                  {i + 1}
                  <br />
                  {l.label}
                </button>
              );
            })}
          </div>
          <div className="bg-[#F2F0E6] rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="text-[16px] font-bold">{LINKS[link].title}</div>
            <div className="text-[15px] leading-[1.55] text-[#2F3F39]">{LINKS[link].body}</div>
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <div className="border-t-[3px] border-t-[#123B2C] border-b border-b-[#DCDACF] py-4 font-semibold text-[24px] leading-[1.25] tracking-[-0.01em]">
            “A broiler is ready in about six weeks. A layer works for a year and a half.”
          </div>
          <H2>Layer or broiler? See the timeline</H2>
          <p className="m-0">Layers give eggs. Broilers give meat. Their lives look very different.</p>
        </div>

        {/* Bird's life */}
        <Card label="Try it · A bird’s life">
          <Pills
            options={['Layer (eggs)', 'Broiler (meat)']}
            value={kind === 'layer' ? 0 : 1}
            onChange={(i) => { setKind(i === 0 ? 'layer' : 'broiler'); setPh(0); }}
          />
          <div className="flex h-[52px] gap-[3px] mt-1.5">
            {tl.phases.map((p, i) => (
              <button
                key={p.name}
                type="button"
                aria-pressed={ph === i}
                aria-label={p.name}
                onClick={() => setPh(i)}
                className="relative rounded-[10px] text-[11px] font-bold text-white px-0.5 cursor-pointer"
                style={{
                  flex: `${p.grow} 1 0`,
                  minWidth: 46,
                  background: p.color,
                  border: `2px solid ${ph === i ? '#FFFFFF' : 'transparent'}`,
                  transform: ph === i ? 'translateY(-4px) scale(1.1)' : 'none',
                  boxShadow: ph === i ? '0 8px 14px -4px rgba(0,0,0,0.4)' : 'none',
                  zIndex: ph === i ? 2 : 1,
                  transition: POP_TRANSITION,
                }}
              >
                {p.short}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-[11px] font-medium text-[#5C6862]">
            <span>Day 1</span>
            <span>{tl.end}</span>
          </div>
          <div className="bg-[#F2F0E6] rounded-2xl p-3.5 flex flex-col gap-1.5">
            <div className="text-[16px] font-bold">{cur.name}</div>
            <div className="text-[13px] font-semibold text-[#5B2E91]">{cur.when}</div>
            <div className="text-[15px] leading-[1.55] text-[#2F3F39]">{cur.body}</div>
          </div>
        </Card>

        <div className="px-4 pt-7 flex flex-col gap-[18px] text-[18px] leading-[1.6]">
          <h2 className="m-0 font-bold text-[26px] leading-[1.2]">Two ways to house birds</h2>
          <p className="m-0">Your housing choice changes your daily work and your waste. Compare them.</p>
        </div>

        {/* Housing */}
        <Card label="Compare · Housing">
          <Pills options={['Deep litter', 'Cage system']} value={house === 'deep' ? 0 : 1} onChange={(i) => setHouse(i === 0 ? 'deep' : 'cage')} />
          {HOUSING[house].map(([k, v]) => (
            <div key={k} className="flex gap-3 items-start bg-[#F2F0E6] rounded-[14px] p-3">
              <span className="shrink-0 w-[84px] text-[12px] font-bold text-[#5B2E91] pt-0.5">{k}</span>
              <span className="text-[14px] leading-normal">{v}</span>
            </div>
          ))}
        </Card>

        {/* Takeaways */}
        <div className="px-4 pt-7">
          <div className="bg-[#E5F27A] rounded-[22px] p-4 flex flex-col gap-2">
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#2A3A00]`}>KEY TAKEAWAYS</div>
            <ul className="m-0 pl-5 text-[17px] leading-[1.55]">
              <li>Hatching takes about 21 days. Broilers go to market at 40 to 45 days.</li>
              <li>Layers move through three houses, and lay from 18 weeks to about 75 weeks.</li>
              <li>Most broilers live on deep litter. Most layers live in cages.</li>
              <li>Pick your link in the chain before you plan the shed.</li>
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
              <div className={`${serif} text-[18px] font-bold leading-[1.25] mt-1`}>Where can you build? The siting rules</div>
              <div className="text-[13px] font-medium text-[#44504A] mt-1">5 min · Distance checker</div>
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
