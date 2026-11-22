import React from 'react';
import { motion } from 'motion/react';
import { HayTop, WanderingChick } from './PoultryHeroArt';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onBack: () => void;
  onHome: () => void;
  onOpenGuide?: () => void;
  onOpenILearning?: () => void;
  onOpenStep?: (id: string) => void;
}

const serif = "font-['Newsreader',Georgia,serif]";

const STEPS = [
  { n: 1, id: 'cost', tag: 'PLAN', title: 'What a poultry farm costs and who can build it?', body: 'Pick a farm and learn how to manage the finances.', meta: '5 min · Finance checker', bg: '#DCEBFE', fg: '#1E4D7E', tagColor: '#2B6CB0' },
  { n: 2, id: 'siting', tag: 'REGISTER', title: 'Setting rules: where can you build poultry farms?', body: 'How far from homes, water and roads.', meta: '6 min · Rules and overview', bg: '#FDE4D2', fg: '#8C461E', tagColor: '#AF4B22' },
  { n: 3, id: 'rule', tag: 'BUILD', title: 'Build it right: the farm rule book', body: 'Manure store, feed store, wash water and dead-bird facilities.', meta: '7 min · Build checklist', bg: '#DCF3E6', fg: '#1A6140', tagColor: '#2E7D32' },
  { n: 4, id: 'across', tag: 'MARKET', title: 'Poultry across India: where the birds are', body: 'See how your state ranks.', meta: '4 min · State chart', bg: '#FEF2CB', fg: '#7A610A', tagColor: '#A17900' },
  { n: 5, id: 'type', tag: 'REGISTER', title: 'Which kind of poultry farm are you?', body: 'The number of birds you keep decides the permission you need.', meta: '6 min · Bird counter', bg: '#FFE2E8', fg: '#A3173F', tagColor: '#A3173F' },
];

export const PoultryFarmSetupScreen: React.FC<Props> = ({ onBack, onHome, onOpenGuide, onOpenILearning, onOpenStep }) => {
  const { t } = useLanguage();
  const steps = STEPS;

  const dock = [
    { icon: 'home', label: t('home'), onClick: onHome },
    { icon: 'storefront', label: t('farmSetup'), onClick: onBack },
    { icon: 'shopping_cart', label: t('marketplace'), onClick: () => {} },
    { icon: 'account_circle', label: t('farmerProfile'), onClick: () => {} },
  ];

  return (
    <div className="h-full flex flex-col relative bg-[#F9DDA0] text-[#202124] antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Same warm background as the poultry i-Learning page */}
      <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #F7C98B 0%, #F9DDA0 45%, #F6EDB5 100%)' }} />

      {/* Top bar */}
      <header className="relative z-30 shrink-0 w-full py-2.5 px-3 backdrop-blur-md bg-white/70 border-b border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-2 min-h-[35px]">
          <div className="flex items-center gap-2.5 min-w-0">
            <button
              type="button"
              aria-label="Go back"
              onClick={onBack}
              className="w-8 h-8 shrink-0 rounded-full flex items-center justify-center bg-white/80 border border-stone-200/90 active:scale-95 transition cursor-pointer"
            >
              <svg className="w-4 h-4 -ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" />
              </svg>
            </button>
            <span className="text-[12px] font-black tracking-wider uppercase text-stone-900">Farm One</span>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 uppercase tracking-[0.08em] leading-tight shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Works offline
          </span>
        </div>
      </header>

      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-3 pt-4 pb-28">
        {/* Hero */}
        <section className="px-1 mb-5">
          <div className="flex items-baseline gap-3">
            <h1 className={`${serif} text-[34px] leading-[1.1] font-bold tracking-tight text-[#161B18]`}>Farm Setup</h1>
            <span className="text-[#AF4B22] text-[11px] font-extrabold tracking-[0.16em] uppercase">Poultry</span>
          </div>
          <p className={`${serif} text-[14.5px] leading-[1.45] text-[#4A554E] mt-2`}>
            Everything you need to know before you start a poultry farm: the birds, the site, the rules and the build. Written to be read, with tools you can try.
          </p>
        </section>

        {/* Hero card */}
        <article
          role="button"
          tabIndex={0}
          onClick={onOpenGuide}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenGuide?.(); } }}
          className="relative overflow-hidden rounded-[28px] p-5 pt-11 mb-6 border border-[#c99a5b]/40 cursor-pointer active:scale-[0.99] transition-transform"
          style={{
            background: 'linear-gradient(180deg, #F6E6C0 0%, #EDCF9C 50%, #E3B887 100%)',
            boxShadow: '0 2px 4px rgba(120,80,20,0.12), 0 18px 32px -10px rgba(140,90,25,0.50)',
          }}
        >
          <HayTop />
          <WanderingChick />
          <div className="relative z-10 text-[11px] font-black uppercase tracking-wider text-[#6b4318] mb-3">Start here · 6 min read</div>
          <h2 className={`relative z-10 ${serif} text-[25px] leading-[1.2] font-bold text-[#3a2410] mb-3 tracking-tight`}>
            From egg to bird: how a poultry farm works
          </h2>
          <p className="relative z-[1] text-[14px] leading-relaxed text-[#5b4126] mb-4">
            Before you pick a shed or a supplier, know the path a bird takes. It decides what you build.
          </p>
          <div className="relative z-[1] flex flex-wrap gap-2 mb-5">
            {['Life-cycle timeline', 'Housing compare'].map((c) => (
              <span key={c} className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-[#4a2f12]">{c}</span>
            ))}
          </div>
          <button
            type="button"
            className="relative z-[1] w-full py-3.5 rounded-full bg-[#153b2d] text-white font-semibold text-center text-[15px] shadow-md active:bg-[#0a1f18] transition-colors cursor-pointer"
          >
            Read the guide
          </button>
        </article>

        {/* Journey */}
        <section className="mb-6">
          <div className="flex items-baseline justify-between mb-3 border-b border-[#252826] pb-1.5 px-1">
            <h3 className={`${serif} text-[21px] font-bold text-[#141816]`}>Follow the journey</h3>
            <span className="text-xs text-[#5D6B63] font-medium tracking-wide">{steps.length} guides</span>
          </div>
          <div className="flex flex-col gap-2.5">
            {steps.map((s) => (
              <article
                key={s.n}
                onClick={() => onOpenStep?.(s.id)}
                className="p-3.5 rounded-2xl bg-white border border-[#EAE9E4] shadow-[0_8px_20px_-8px_rgba(40,60,50,0.28),0_2px_5px_rgba(40,60,50,0.10)] flex gap-3.5 cursor-pointer active:scale-[0.99] transition"
              >
                <div
                  className="shrink-0 w-9 h-9 rounded-full font-semibold text-sm flex items-center justify-center"
                  style={{ background: s.bg, color: s.fg }}
                >
                  {s.n}
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <span className="block text-[10.5px] font-bold uppercase tracking-wider mb-0.5" style={{ color: s.tagColor }}>{s.tag}</span>
                  <h4 className={`${serif} text-[17px] leading-tight font-bold text-[#161B18] mb-1`}>{s.title}</h4>
                  <p className="text-[#515D56] text-[13px] leading-snug mb-1">{s.body}</p>
                  <p className="text-[#7F8B83] text-xs">{s.meta}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Callout */}
        <section className="mb-2">
          <div
            onClick={onOpenILearning}
            className="bg-[#E5F3F3]/80 border border-[#D1E6E6] rounded-2xl p-4 shadow-[0_8px_20px_-8px_rgba(40,60,50,0.28),0_2px_5px_rgba(40,60,50,0.10)] cursor-pointer active:scale-[0.99] transition-transform"
          >
            <h4 className={`${serif} text-[18px] font-bold text-[#112423] mb-1.5`}>Already running a farm?</h4>
            <p className="text-[#394B4A] text-[13.5px] leading-relaxed mb-3">
              Pair these guides with the i-Learning poultry reads: composting, dead birds, shed care and pest control.
            </p>
            <button
              type="button"
              onClick={onOpenILearning}
              className="inline-flex items-center text-[13.5px] font-bold text-[#0B4A45] cursor-pointer"
            >
              <span>Go to i-Learning</span>
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </section>
      </div>

      {/* Dock (same as home, Farm Setup active) */}
      <nav className="absolute inset-x-4 max-w-[390px] mx-auto z-40" style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div
          className="relative w-full rounded-full p-1.5 grid grid-cols-4 items-center"
          style={{
            background: 'rgba(255,255,255,0.72)',
            backdropFilter: 'blur(28px) saturate(190%)',
            WebkitBackdropFilter: 'blur(28px) saturate(190%)',
            border: '1px solid rgba(255,255,255,0.85)',
            boxShadow: 'rgba(19,78,63,0.16) 0px 16px 36px -4px, rgba(255,255,255,0.95) 0px 1.5px 1.5px 0px inset',
          }}
        >
          {dock.map((tab, index) => {
            const active = index === 1;
            return (
              <button
                key={tab.icon}
                type="button"
                onClick={tab.onClick}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center h-[52px] min-w-0 whitespace-nowrap rounded-full cursor-pointer ${active ? 'text-[#00362a]' : 'text-[#404945]'}`}
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
