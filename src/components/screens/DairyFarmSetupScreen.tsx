import React from 'react';
import { motion } from 'motion/react';
import { GrassTop, WanderingCow } from './DairyHeroArt';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onBack: () => void;
  onHome: () => void;
  onOpenGuide?: () => void;
  onOpenStep?: (id: string) => void;
  onOpenInsurance?: () => void;
  onOpenGov?: () => void;
}

const serif = "font-['Newsreader',Georgia,serif]";

const STEPS = [
  { n: 1, id: 'shed', tag: 'PLAN', title: 'Land, shed and layout for 10 cows', body: 'How much land you need and how to point the shed.', meta: '6 min · Shed diagram', bg: '#ebdfff', fg: '#5e29aa' },
  { n: 2, id: 'paperwork', tag: 'REGISTER', title: 'Licences, NOC and FSSAI in plain words', body: 'What a 10-cow unit needs, and what it does not.', meta: '5 min · Checklist', bg: '#dbe8fd', fg: '#1e58c8' },
  { n: 3, id: 'equipment', tag: 'BUILD', title: 'Equipment that pays for itself', body: 'Chaff cutter, milking machine, mats and cans.', meta: '5 min · Checklist', bg: '#fef1cb', fg: '#9c6902' },
  { n: 4, id: 'yield', tag: 'STOCK', title: 'Which cow should you buy?', body: 'Desi against crossbred, and why you buy in two rounds.', meta: '6 min · Yield chart', bg: '#d6f5e9', fg: '#0f7a55' },
  { n: 5, id: 'schemes', tag: 'LAUNCH', title: 'Schemes that can lower your cost', body: 'AHIDF, NABARD and the Kisan Credit Card.', meta: '5 min · Eligibility list', bg: '#fde1e4', fg: '#c02347' },
];

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-stone-800 shadow-xs">{children}</span>
);

const PrimaryBtn: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full py-3 px-5 rounded-full bg-[#15382b] text-white text-[14px] font-semibold tracking-wide flex items-center justify-center gap-2 shadow-sm active:scale-[0.97] transition cursor-pointer"
  >
    {children}
  </button>
);

const SunriseCard: React.FC<{
  tag?: string;
  badge?: React.ReactNode;
  title: string;
  body: string;
  chips?: string[];
  cta: React.ReactNode;
  onClick?: () => void;
}> = ({ tag, badge, title, body, chips = [], cta, onClick }) => (
    <article
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
      className={`relative overflow-hidden rounded-[28px] p-4 pt-10 pb-[54px] mb-5 border border-[#e9c9a8]/70 flex flex-col justify-between ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} transition-transform`}
      style={{
        background: 'linear-gradient(180deg, #CFE6F6 0%, #E9E4F0 28%, #FBDDD0 55%, #FFEBB0 82%, #FFF4CC 100%)',
        boxShadow: '0 2px 4px rgba(120,90,60,0.12), 0 18px 32px -10px rgba(235,160,90,0.45)',
      }}
    >
      <style>{`
        @keyframes sr-rise { from { transform: translateY(26px); opacity: 0.4 } to { transform: translateY(0); opacity: 1 } }
        @keyframes sr-rays { to { transform: rotate(360deg) } }
        @keyframes sr-glow { 0%,100% { transform: scale(1); opacity: 0.75 } 50% { transform: scale(1.12); opacity: 1 } }
        @keyframes sr-fly { from { transform: translateX(-40px) } to { transform: translateX(400px) } }
        @keyframes sr-flap { 0%,100% { transform: scaleY(1) } 50% { transform: scaleY(0.55) } }
      `}</style>

      {/* Sun: rises on open, rays turn slowly, then glows softly */}
      <div className="absolute pointer-events-none" style={{ top: 10, right: 22, width: 76, height: 76, animation: 'sr-rise 1.6s ease-out both' }} aria-hidden>
        <svg className="absolute -inset-8 w-[calc(100%+4rem)] h-[calc(100%+4rem)]" viewBox="-50 -50 100 100" style={{ animation: 'sr-rays 60s linear infinite' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <path key={i} d="M-3 -20 L0 -48 L3 -20 Z" fill="#FFE27A" opacity="0.55" transform={`rotate(${i * 30})`} />
          ))}
        </svg>
        <div className="absolute -inset-6 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,236,150,0.95) 0%, rgba(255,200,110,0.45) 45%, rgba(255,180,100,0) 72%)', animation: 'sr-glow 4.5s ease-in-out infinite' }} />
        <div className="absolute inset-3 rounded-full" style={{ background: 'radial-gradient(circle at 40% 35%, #FFF8D6 0%, #FFE27A 60%, #FFC94D 100%)', boxShadow: '0 0 18px 6px rgba(255,214,102,0.7)' }} />
      </div>

      {/* Birds drifting across */}
      {[{ top: 14, delay: '0s', dur: '26s', s: 1 }, { top: 34, delay: '-9s', dur: '32s', s: 0.75 }, { top: 22, delay: '-17s', dur: '29s', s: 0.6 }].map((b, i) => (
        <svg
          key={i}
          className="absolute left-0 pointer-events-none"
          style={{ top: b.top, animation: `sr-fly ${b.dur} linear ${b.delay} infinite` }}
          width={16 * b.s} height={8 * b.s} viewBox="0 0 16 8" fill="none" aria-hidden
        >
          <path
            d="M1 6 Q4 0 8 5 Q12 0 15 6"
            stroke="#5b6b7a" strokeWidth="1.4" strokeLinecap="round"
            style={{ transformBox: 'view-box', transformOrigin: '8px 6px', animation: `sr-flap ${0.9 + i * 0.15}s ease-in-out infinite` }}
          />
        </svg>
      ))}

      {/* Field patch: the i-Learning grass, flipped to grow up from the bottom edge and made taller */}
      <div className="absolute left-0 w-full pointer-events-none" style={{ top: '100%', transform: 'scale(1, -1.3)', transformOrigin: 'top' }} aria-hidden>
        <GrassTop />
      </div>

      {(tag || badge) && (
        <div className="relative z-10 flex items-center justify-between gap-2">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#b45309]">{tag}</span>
          {badge}
        </div>
      )}
      <h2 className={`relative z-10 ${serif} mt-2 text-[21px] leading-[1.2] font-bold text-[#4a2208] tracking-tight`}>
        {title}
      </h2>
      <p className="relative z-10 mt-2 text-[13px] leading-snug text-[#7a4318]">
        {body}
      </p>
      {chips.length > 0 && (
        <div className="relative z-10 flex flex-wrap items-center gap-1.5 mt-3">
          {chips.map((c) => (
            <span key={c} className="px-2.5 py-1 bg-white/90 text-[#6b2f0a] text-[11.5px] font-semibold rounded-full">{c}</span>
          ))}
        </div>
      )}
      <button
        type="button"
        className="relative z-10 mt-4 w-full py-3 rounded-full flex items-center justify-center gap-2 bg-[#3b1f0e] active:bg-[#2a1508] text-[#FFF3C9] font-semibold text-[14.5px] text-center transition-all active:scale-[0.98] shadow cursor-pointer"
      >
        {cta}
      </button>
    </article>
);

const BlueprintCard: React.FC<{
  tag: string;
  title: string;
  body: string;
  chips: string[];
  cta: string;
  onClick?: () => void;
}> = ({ tag, title, body, chips, cta, onClick }) => (
  <article
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    className={`relative overflow-hidden rounded-[22px] p-4 pt-12 mb-5 border border-[#7fb4ff]/40 flex flex-col justify-between ${onClick ? 'cursor-pointer active:scale-[0.99]' : ''} transition-transform`}
    style={{
      backgroundColor: '#12427f',
      backgroundImage:
        'linear-gradient(rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.09) 1px, transparent 1px), linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(160deg, #1a56a0 0%, #12427f 55%, #0b2d5e 100%)',
      backgroundSize: '80px 80px, 80px 80px, 16px 16px, 16px 16px, 100% 100%',
      boxShadow: '0 2px 4px rgba(8,30,70,0.25), 0 18px 32px -10px rgba(10,40,100,0.55)',
    }}
  >
    <style>{`@keyframes bp-march { to { stroke-dashoffset: -24 } } @keyframes bp-spin { 0%,100% { transform: rotate(-8deg) } 50% { transform: rotate(14deg) } }`}</style>

    {/* Corner registration marks */}
    {['top-2 left-2 border-t border-l', 'top-2 right-2 border-t border-r', 'bottom-2 left-2 border-b border-l', 'bottom-2 right-2 border-b border-r'].map((c) => (
      <span key={c} className={`absolute w-3 h-3 border-[#bfe0ff]/70 pointer-events-none ${c}`} />
    ))}

    {/* Shed elevation with dimension lines + compass */}
    <svg className="absolute top-2 right-3 pointer-events-none" width="170" height="84" viewBox="0 0 170 84" fill="none" aria-hidden>
      <g stroke="#bfe0ff" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.9">
        <path d="M22 62 V34 L66 14 L110 34 V62 Z" />
        <path d="M22 34 H110" opacity="0.5" />
        <path d="M52 62 V44 H80 V62" />
        <path d="M30 40 H44 V50 H30 Z" opacity="0.7" />
        <path d="M88 40 H102 V50 H88 Z" opacity="0.7" />
      </g>
      <g stroke="#e5f27a" strokeWidth="1" strokeDasharray="4 4" style={{ animation: 'bp-march 1.6s linear infinite' }}>
        <path d="M22 72 H110" />
        <path d="M122 14 V62" />
      </g>
      <g stroke="#e5f27a" strokeWidth="1">
        <path d="M22 69 V75 M110 69 V75 M119 14 H125 M119 62 H125" />
      </g>
      <g fill="#e5f27a" fontFamily="ui-monospace, Consolas, monospace" fontSize="8" fontWeight="700">
        <text x="50" y="82">40 ft</text>
        <text x="127" y="42">15 ft</text>
      </g>
      <g transform="translate(150 66)">
        <circle r="11" stroke="#bfe0ff" strokeWidth="1" opacity="0.8" />
        <g style={{ transformBox: 'view-box', transformOrigin: '0 0', animation: 'bp-spin 5s ease-in-out infinite' }}>
          <path d="M0 -9 L3 0 L0 9 L-3 0 Z" fill="#bfe0ff" opacity="0.85" />
          <path d="M0 -9 L3 0 L-3 0 Z" fill="#e5f27a" />
        </g>
        <text x="-3" y="-13" fill="#bfe0ff" fontSize="7" fontFamily="ui-monospace, Consolas, monospace" fontWeight="700">N</text>
      </g>
    </svg>

    <span className="relative z-10 text-[11px] font-bold uppercase tracking-[0.16em] text-[#a9d3ff] font-mono max-w-[52%]">{tag}</span>
    <h2 className="relative z-10 mt-3 text-[21px] leading-[1.2] font-bold text-white tracking-tight font-['JetBrains_Mono','Space_Mono',ui-monospace,Consolas,monospace]">
      {title}
    </h2>
    <p className="relative z-10 mt-2.5 text-[13px] leading-relaxed text-[#cfe3fb]">{body}</p>
    <div className="relative z-10 flex flex-wrap items-center gap-1.5 mt-3.5">
      {chips.map((c) => (
        <span key={c} className="px-2.5 py-1 bg-white/10 border border-white/35 text-white text-[11.5px] font-semibold rounded-full">{c}</span>
      ))}
    </div>
    <button
      type="button"
      className="relative z-10 mt-4 w-full py-3 rounded-full bg-[#E5F27A] active:bg-[#d4e468] text-[#0b2d5e] font-bold text-[14.5px] text-center transition-all active:scale-[0.98] shadow cursor-pointer"
    >
      {cta}
    </button>
  </article>
);

export const DairyFarmSetupScreen: React.FC<Props> = ({ onBack, onHome, onOpenGuide, onOpenStep, onOpenInsurance, onOpenGov }) => {
  const { t } = useLanguage();
  const steps = STEPS;

  const dock = [
    { icon: 'home', label: t('home'), onClick: onHome },
    { icon: 'storefront', label: t('farmSetup'), onClick: onBack },
    { icon: 'shopping_cart', label: t('marketplace'), onClick: () => {} },
    { icon: 'account_circle', label: t('farmerProfile'), onClick: () => {} },
  ];

  return (
    <div className="h-full flex flex-col relative bg-[#e5f4f7] text-stone-900 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Soft blue → green wave background */}
      <svg aria-hidden className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 375 812" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dfBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d4eefb" />
            <stop offset="0.55" stopColor="#dff3ee" />
            <stop offset="1" stopColor="#cdf3d3" />
          </linearGradient>
          <linearGradient id="dfWaveA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bfe6f7" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c4f0d2" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="dfWaveB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bdeccb" stopOpacity="0.6" />
            <stop offset="1" stopColor="#b6e4f3" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect width="375" height="812" fill="url(#dfBase)" />
        <path d="M0 250 C 90 200, 180 300, 270 250 S 350 220, 375 240 L375 812 L0 812 Z" fill="url(#dfWaveA)" />
        <path d="M0 520 C 100 470, 200 570, 290 520 S 355 490, 375 505 L375 812 L0 812 Z" fill="url(#dfWaveB)" />
      </svg>

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
          <h1 className={`${serif} text-[34px] leading-[1.1] font-bold tracking-tight`}>Farm Setup</h1>
          <p className={`${serif} text-[14.5px] leading-[1.45] text-stone-600 mt-2`}>
            The reference shelf for starting a farm: plans, costs, licences and schemes, written to be read, not decoded.
          </p>
        </section>

        {/* Featured: the default hero card from the dairy i-Learning screen */}
        <article
          role="button"
          tabIndex={0}
          onClick={onOpenGuide}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenGuide?.(); } }}
          className="relative overflow-hidden rounded-[28px] p-5 pt-11 mb-5 border border-[#7FAE52]/50 flex flex-col justify-between cursor-pointer active:scale-[0.99] transition-transform"
          style={{
            background: 'linear-gradient(180deg, #DDF0B8 0%, #BEE08A 55%, #9FCB66 100%)',
            boxShadow: '0 2px 4px rgba(50,100,30,0.14), 0 18px 32px -10px rgba(60,120,35,0.50)',
          }}
        >
          <GrassTop />
          <WanderingCow />
          <span className="relative z-10 text-[11px] font-black uppercase tracking-wider text-[#2d5a1e]">Featured · 8 min read</span>
          <h2 className={`relative z-10 ${serif} mt-3 text-[25px] leading-[1.2] font-bold text-[#173a12] tracking-tight`}>
            What a 10-cow dairy really costs, and where the money goes
          </h2>
          <p className="relative z-10 mt-3 text-[14.5px] leading-relaxed text-[#2f5a25]">
            A rupee-by-rupee tour of a first dairy unit, with a cost chart you can flip between low and high.
          </p>
          <div className="relative z-10 flex flex-wrap items-center gap-2 mt-4">
            {['Cost chart', 'Shed diagram', 'Licence checklist'].map((c) => (
              <span key={c} className="px-3 py-1.5 bg-white/95 text-[#1d4a14] text-[12.5px] font-semibold rounded-full">{c}</span>
            ))}
          </div>
          <button
            type="button"
            className="relative z-10 mt-5 w-full py-3.5 rounded-full bg-[#123326] active:bg-[#0c241b] text-white font-semibold text-[15px] text-center transition-all active:scale-[0.98] shadow cursor-pointer"
          >
            Read the guide
          </button>
        </article>

        {/* Subsidies */}
        <SunriseCard
          onClick={onOpenGov}
          title="Learn about Government subsidies that are meant for you and your cow family"
          body="Find state & central subsidies, zero-collateral dairy loans, and interest subvention up to 3% for your herd setup and expansion."
          cta={
            <>
              <span>Read and avail them now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          }
        />

        {/* Insurance: blueprint theme */}
        <BlueprintCard
          tag="Safety & future · 5 min read"
          title="Insure your cow or buffalo for less than you think"
          body="Understand updated subsidized cattle insurance schemes, premium calculators, and claim procedures for your cattle family"
          chips={['Interactive', 'Premium calculator', 'Importance of ear-tags']}
          cta="Calculate premiums & schemes"
          onClick={onOpenInsurance}
        />

        {/* Journey */}
        <section className="mb-6 px-1">
          <div className="flex items-baseline justify-between border-b border-stone-900/10 pb-3 mb-1">
            <h2 className={`${serif} text-[20px] font-bold tracking-tight`}>Follow the journey</h2>
            <span className="text-[12px] font-medium text-stone-500">Dairy, 10 cows</span>
          </div>
          <ol className="divide-y divide-stone-200/70">
            {steps.map((s) => (
              <li key={s.n} onClick={() => onOpenStep?.(s.id)} className="py-3.5 flex items-start gap-3.5 cursor-pointer active:opacity-80 transition">
                <div
                  className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-semibold text-[13px] mt-0.5"
                  style={{ background: s.bg, color: s.fg }}
                >
                  {s.n}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-stone-500 mb-0.5">{s.tag}</span>
                  <h3 className={`${serif} text-[16px] font-bold text-stone-900 leading-snug`}>{s.title}</h3>
                  <p className="text-[12.5px] text-stone-600 mt-0.5 leading-relaxed">{s.body}</p>
                  <span className="inline-block text-[11px] text-stone-400 font-medium mt-1">{s.meta}</span>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Disclaimer */}
        <aside className="bg-[#e4f1f5] rounded-3xl p-4 mb-2 shadow-[0_8px_20px_-8px_rgba(40,60,50,0.28),0_2px_5px_rgba(40,60,50,0.10)]">
          <h3 className={`${serif} text-[18px] font-bold mb-1.5`}>Know before you build</h3>
          <p className="text-[12.5px] leading-relaxed text-stone-600">
            Pages here are references. When a rule or scheme changes, the page says when it was verified and what changed, so you don’t take outdated quotes to the bank.
          </p>
        </aside>
      </div>

      {/* Dock (same as home, Farm Setup active) */}
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
