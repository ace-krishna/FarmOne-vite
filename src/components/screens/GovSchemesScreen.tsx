import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onBack: () => void;
  onHome: () => void;
  onFarmSetup: () => void;
  onOpenDairySetup?: () => void;
  onOpenFinder?: () => void;
  onOpenApply?: () => void;
  onOpenCalc?: () => void;
}

const serif = "font-['Source_Serif_4',Georgia,serif]";
const sans = "font-['Inter',sans-serif]";

const STAGES = [
  { n: 1, stage: 'CHOOSE', ink: '#1F4E9A', tint: '#DDEBFF', title: 'Which scheme fits you?', sub: 'Pick your plan and category. See only the schemes that apply.', time: '5 min', tool: 'Scheme finder' },
  { n: 2, stage: 'APPLY', ink: '#0F6B50', tint: '#DDF4EA', title: 'Apply in six steps, in the right order', sub: 'One mistake can cost you the subsidy. Learn the rule first.', time: '6 min', tool: 'Step guide + documents list' },
  { n: 3, stage: 'PLAN', ink: '#7A4E00', tint: '#FFF2D0', title: 'What will you really get?', sub: 'Enter your project cost. See your subsidy, your loan and your own share.', time: '4 min', tool: 'Subsidy calculator' },
];

const STATS = [
  { v: '5', l: 'central schemes' },
  { v: '3', l: 'Maharashtra schemes' },
  { v: '75%', l: 'top animal subsidy' },
];

export const GovSchemesScreen: React.FC<Props> = ({ onBack, onHome, onFarmSetup, onOpenDairySetup, onOpenFinder, onOpenApply, onOpenCalc }) => {
  const { t } = useLanguage();

  const dock = [
    { icon: 'home', label: t('home'), onClick: onHome },
    { icon: 'storefront', label: t('farmSetup'), onClick: onFarmSetup },
    { icon: 'shopping_cart', label: t('marketplace'), onClick: () => {} },
    { icon: 'account_circle', label: t('farmerProfile'), onClick: () => {} },
  ];

  return (
    <div className={`h-full flex flex-col relative bg-[#FBFAF6] text-[#1A1F1B] antialiased ${serif}`}>
      <div className="flex-1 overflow-y-auto scrollbar-none pb-28">
        {/* Top row */}
        <div className="flex items-center justify-between pt-3.5 pl-2 pr-4">
          <button
            type="button"
            aria-label="Back to Farm Setup"
            onClick={onBack}
            className={`min-h-11 flex items-center gap-0.5 pl-1 pr-2 text-[14px] font-semibold text-[#123B2C] cursor-pointer ${sans}`}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
            Farm Setup
          </button>
          <div className={`flex items-center gap-1.5 bg-[#E1F0F3] text-[#0F5F46] text-[12px] font-semibold rounded-full px-3 py-1 ${sans}`}>
            <span className="w-[7px] h-[7px] rounded-full bg-[#0F8A5F]" />
            Works offline
          </div>
        </div>

        {/* Heading */}
        <div className="px-4 pt-4 flex flex-col gap-2">
          <div className={`${sans} text-[12px] font-bold tracking-[0.1em] text-[#1F4E9A]`}>GOVERNMENT SCHEMES · DAIRY</div>
          <h1 className="m-0 font-bold text-[34px] leading-[1.06] tracking-[-0.02em]">Government subsidies for your dairy</h1>
          <div className="text-[17px] leading-[1.4] text-[#44504A] mt-1">
            Central and Maharashtra schemes in one place: which ones exist, which one fits you, how to apply, and what you will actually get.
          </div>
        </div>

        {/* Hero card */}
        <div className="px-3 pt-5">
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenFinder}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenFinder?.(); } }}
            className="bg-[#DDEBFF] rounded-3xl p-5 flex flex-col gap-3 cursor-pointer active:scale-[0.99] transition-transform"
            style={{ boxShadow: '0 2px 4px rgba(31,78,154,0.10), 0 16px 28px -12px rgba(31,78,154,0.35)' }}
          >
            <div className={`${sans} text-[11px] font-bold tracking-[0.12em] text-[#1F4E9A]`}>START HERE · 5 MIN READ</div>
            <div className="font-bold text-[26px] leading-[1.15] tracking-[-0.01em]">Eight schemes, one question: which one is yours?</div>
            <div className="text-[15.5px] leading-[1.45] text-[#1B3558]">
              Tell us what you want to do and your category. We show the schemes that fit and what each one pays.
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className={`${sans} bg-white rounded-full text-[12px] font-semibold px-2.5 py-[5px]`}>Scheme finder</span>
              <span className={`${sans} bg-white rounded-full text-[12px] font-semibold px-2.5 py-[5px]`}>Maharashtra + Central</span>
            </div>
            <button
              type="button"
              className={`${sans} mt-1 flex items-center justify-center bg-[#123B2C] text-white text-[15px] font-semibold rounded-full min-h-12 cursor-pointer active:scale-[0.98] transition`}
            >
              Read the guide
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="px-3 pt-4 flex gap-2">
          {STATS.map((s) => (
            <div
              key={s.l}
              className="flex-1 bg-white border border-[#DCDACF] rounded-[18px] p-3.5 shadow-[0_8px_20px_-8px_rgba(40,60,50,0.22),0_2px_5px_rgba(40,60,50,0.08)]"
            >
              <div className="font-bold text-[26px] leading-none">{s.v}</div>
              <div className={`${sans} mt-1.5 text-[12px] font-medium text-[#44504A] leading-tight`}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Follow the money */}
        <div className="px-4 pt-7">
          <div className="flex items-baseline justify-between border-b-2 border-[#1A1F1B] pb-2">
            <h2 className="m-0 font-bold text-[22px]">Follow the money</h2>
            <span className={`${sans} text-[13px] font-medium text-[#44504A]`}>3 guides</span>
          </div>
          {STAGES.map((s) => (
            <div key={s.n} onClick={s.n === 1 ? onOpenFinder : s.n === 2 ? onOpenApply : s.n === 3 ? onOpenCalc : undefined} className="flex gap-3.5 py-[18px] border-b border-[#DCDACF] items-start cursor-pointer active:opacity-80 transition">
              <span
                className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${sans} font-bold text-[16px]`}
                style={{ background: s.tint, color: s.ink }}
              >
                {s.n}
              </span>
              <span className="flex-1 min-w-0 flex flex-col gap-1.5">
                <span className={`${sans} text-[11px] font-bold tracking-[0.1em]`} style={{ color: s.ink }}>{s.stage}</span>
                <span className="font-bold text-[20px] leading-[1.2]">{s.title}</span>
                <span className="text-[15px] leading-[1.4] text-[#44504A]">{s.sub}</span>
                <span className={`${sans} text-[12px] font-medium text-[#5C6862]`}>{s.time} · {s.tool}</span>
              </span>
            </div>
          ))}
        </div>

        {/* Callout */}
        <div className="px-3 pt-6">
          <div
            role="button"
            tabIndex={0}
            onClick={onOpenDairySetup}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenDairySetup?.(); } }}
            className="bg-[#E1F0F3] rounded-[22px] p-5 flex flex-col gap-2 cursor-pointer active:scale-[0.99] transition-transform shadow-[0_8px_20px_-8px_rgba(40,60,50,0.25),0_2px_5px_rgba(40,60,50,0.08)]"
          >
            <div className="font-bold text-[20px] leading-[1.25]">Still planning the farm itself?</div>
            <div className="text-[15px] leading-[1.5] text-[#44504A]">
              The 10-cow dairy setup guide shows what the shed, animals and machines will cost, so your project report is easy to write.
            </div>
            <div className={`${sans} text-[14px] font-semibold text-[#0F5F46]`}>Read the dairy setup guide</div>
          </div>
        </div>
      </div>

      {/* Dock (same as the rest of the app, Farm Setup active) */}
      <nav className="absolute inset-x-4 max-w-[390px] mx-auto z-40" style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div
          className="liquid-glass relative w-full rounded-full p-1.5 grid grid-cols-4 items-center"
        >
          {dock.map((tab, index) => {
            const active = index === 1;
            return (
              <button
                key={tab.icon}
                type="button"
                onClick={tab.onClick}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center h-[52px] min-w-0 whitespace-nowrap rounded-full cursor-pointer ${sans} ${active ? 'text-[#00362a]' : 'text-[#404945]'}`}
              >
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'linear-gradient(135deg, rgba(19,78,63,0.14) 0%, rgba(181,239,218,0.42) 100%)', border: '1px solid rgba(255,255,255,0.95)' }}
                  />
                )}
                <span className="relative material-symbols-outlined text-[26px] leading-none" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                  {tab.icon}
                </span>
                <span className="relative text-[10.5px] leading-tight tracking-tight mt-0.5 font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
