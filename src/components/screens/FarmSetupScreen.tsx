import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GrassTop, WanderingCow } from './DairyHeroArt';
import { HayTop, WanderingChick } from './PoultryHeroArt';
import { useLanguage } from '../../context/LanguageContext';

interface Props {
  onHome: () => void;
  onBack: () => void;
  onOpenDairy?: () => void;
  onOpenDairySetup?: () => void;
  onOpenPoultrySetup?: () => void;
  onOpenChaff?: () => void;
  onOpenCostArticle?: () => void;
  onOpenEggArticle?: () => void;
  onOpenGov?: () => void;
  onOpenPoultryCost?: () => void;
  onOpenInsureArticle?: () => void;
  onOpenRuleBook?: () => void;
  onOpenPoultry?: () => void;
  onOpenChicksArticle?: () => void;
}

const serif = "font-['Newsreader',Georgia,serif]";

const TOPICS = [
  { id: 'cows', name: 'Cows', count: 24, img: '/farm-setup/cows.png' },
  { id: 'poultry', name: 'Poultry', count: 15, img: '/farm-setup/poultry.png' },
  { id: 'goats', name: 'Goats', count: 0, img: '/farm-setup/goats.png' },
];

const FEATURED = [
  {
    tag: 'FEATURED • DAIRY FARMS',
    title: 'What a 10-cow dairy really costs, and where the money goes',
    body: 'From land to lisence, an interactive rupee-by-rupee tour of a 10-cow dairy unit, in one honest read.',
    target: 'dairy' as const,
  },
  {
    tag: 'FEATURED • POULTRY CARE',
    title: 'From egg to bird: how a poultry farm really works',
    body: 'Before you pick a shed or a supplier, know the path a bird takes. Poultry farming is not just one job, it is a chain of building, hatching, laying eggs or growing meat birds.',
    target: 'poultry' as const,
  },
];

// Same look as the hero cards on the dairy and poultry i-Learning pages
const HERO_THEMES = {
  dairy: {
    bg: 'linear-gradient(180deg, #DDF0B8 0%, #BEE08A 55%, #9FCB66 100%)',
    border: 'rgba(127,174,82,0.5)',
    shadow: '0 2px 4px rgba(50,100,30,0.14), 0 18px 32px -10px rgba(60,120,35,0.50)',
    tag: '#2d5a1e', title: '#173a12', body: '#2f5a25', btn: '#123326',
  },
  poultry: {
    bg: 'linear-gradient(180deg, #F6E6C0 0%, #EDCF9C 50%, #E3B887 100%)',
    border: 'rgba(201,154,91,0.4)',
    shadow: '0 2px 4px rgba(120,80,20,0.12), 0 18px 32px -10px rgba(140,90,25,0.50)',
    tag: '#6b4318', title: '#3a2410', body: '#5b4126', btn: '#153b2d',
  },
} as const;

const TRENDING = [
  'What a poultry farm costs and who can fund it',
  'Insure your cow for less than you think!',
  'Build it right: The Farm Rule Book',
];

const TOOLS = ['Milking machines', 'Milk Fat measuring machines', 'Incubators'];

const Dots: React.FC<{ count: number; active: number; onPick: (i: number) => void; label: string }> = ({ count, active, onPick, label }) => (
  <div className="flex items-center justify-center gap-1.5 mt-2.5">
    {Array.from({ length: count }).map((_, i) => (
      <button
        key={i}
        type="button"
        aria-label={`${label} ${i + 1}`}
        onClick={() => onPick(i)}
        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === active ? 'w-5 bg-[#1b4332]' : 'w-1.5 bg-[#1b4332]/30'}`}
      />
    ))}
  </div>
);

const BookmarkIcon: React.FC<{ className?: string; filled?: boolean }> = ({ className = 'w-5 h-5', filled }) => (
  <svg className={className} fill={filled ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
  </svg>
);

/** Horizontal snap carousel whose active index follows the scroll position. */
const useCarousel = (selector: string) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    const cards = Array.from(el.querySelectorAll<HTMLElement>(selector));
    const left = el.getBoundingClientRect().left + 12;
    let best = 0;
    let min = Infinity;
    cards.forEach((c, i) => {
      const d = Math.abs(c.getBoundingClientRect().left - left);
      if (d < min) { min = d; best = i; }
    });
    // Reached the end: last dot
    if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 4) best = cards.length - 1;
    setActive(best);
  };
  const scrollTo = (i: number) => {
    const card = ref.current?.querySelectorAll<HTMLElement>(selector)[i];
    card?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
  };
  return { ref, active, onScroll, scrollTo };
};

const COPIES = 4; // render the set 4x so the loop can wrap invisibly
const AUTO_MS = 2000;

/** Endless, auto-advancing topic carousel (same behaviour as the i-Learning one). */
const TopicsCarousel: React.FC<{ onOpen: (id: string) => void }> = ({ onOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);
  const settleTimer = useRef<number | undefined>(undefined);
  const n = TOPICS.length;

  const stepOf = (el: HTMLDivElement) => {
    const c = el.children;
    return c.length > 1 ? (c[1] as HTMLElement).offsetLeft - (c[0] as HTMLElement).offsetLeft : 0;
  };
  const padOf = (el: HTMLDivElement) => parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;

  // Start on the second copy so there is room to scroll both ways
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = stepOf(el) * n - padOf(el);
  }, [n]);

  // Auto-advance every 2s
  React.useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      const el = ref.current;
      if (!el || pausedRef.current || document.hidden) return;
      el.scrollBy({ left: stepOf(el), behavior: 'smooth' });
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, []);

  React.useEffect(
    () => () => {
      window.clearTimeout(resumeTimer.current);
      window.clearTimeout(settleTimer.current);
    },
    [],
  );

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const step = stepOf(el);
    if (!step) return;
    const pad = padOf(el);
    const idx = Math.round((el.scrollLeft + pad) / step);
    setActive(((idx % n) + n) % n);
    // Once scrolling settles, jump back to the middle copy (looks identical)
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const i = Math.round((el.scrollLeft + pad) / step);
      const shift = i < n ? n : i >= n * 2 ? -n : 0;
      if (!shift) return;
      el.style.scrollSnapType = 'none';
      el.scrollLeft += shift * step;
      requestAnimationFrame(() => {
        el.style.scrollSnapType = '';
      });
    }, 140);
  };

  const hold = () => {
    pausedRef.current = true;
    window.clearTimeout(resumeTimer.current);
  };
  const release = () => {
    window.clearTimeout(resumeTimer.current);
    resumeTimer.current = window.setTimeout(() => {
      pausedRef.current = false;
    }, AUTO_MS);
  };

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const step = stepOf(el);
    const cur = Math.round((el.scrollLeft + padOf(el)) / step);
    const delta = ((i - cur) % n + n) % n;
    el.scrollBy({ left: delta * step, behavior: 'smooth' });
  };

  return (
    <>
      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={hold}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
        className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 -mx-3 px-3 snap-x snap-mandatory"
        style={{ scrollPaddingLeft: '0.75rem' }}
      >
        {Array.from({ length: COPIES }).flatMap((_, c) =>
          TOPICS.map((tp) => (
            <article
              key={`${c}-${tp.id}`}
              onClick={() => onOpen(tp.id)}
              className="topic-card w-[136px] min-w-[136px] h-44 rounded-2xl text-white p-3.5 snap-start shrink-0 relative overflow-hidden border border-stone-300/40 shadow-sm active:scale-95 transition-transform cursor-pointer"
            >
              <img src={tp.img} alt={tp.name} draggable={false} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/60 via-black/25 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h3 className={`${serif} text-lg font-bold leading-tight drop-shadow`}>{tp.name}</h3>
                <p className="text-xs text-white/90 mt-0.5 font-medium drop-shadow">{tp.count > 0 ? `${tp.count} articles` : 'Coming soon'}</p>
              </div>
            </article>
          )),
        )}
      </div>
      <Dots count={n} active={active} onPick={goTo} label="Go to topic" />
    </>
  );
};

export const FarmSetupScreen: React.FC<Props> = ({ onHome, onBack, onOpenDairy, onOpenDairySetup, onOpenPoultrySetup, onOpenChaff, onOpenCostArticle, onOpenEggArticle, onOpenGov, onOpenPoultryCost, onOpenInsureArticle, onOpenRuleBook, onOpenPoultry, onOpenChicksArticle }) => {
  const { t } = useLanguage();
  const featured = useCarousel('.featured-card');
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [soonToast, setSoonToast] = useState(false);
  const soonTimer = useRef<number | undefined>(undefined);
  const showSoon = () => {
    setSoonToast(true);
    window.clearTimeout(soonTimer.current);
    soonTimer.current = window.setTimeout(() => setSoonToast(false), 2600);
  };
  React.useEffect(() => () => window.clearTimeout(soonTimer.current), []);
  const toggleSave = (k: string) => setSaved((s) => ({ ...s, [k]: !s[k] }));

  const openTopic = (id: string) => {
    if (id === 'cows') onOpenDairySetup?.();
    else if (id === 'poultry') onOpenPoultrySetup?.();
  };
  const openFeatured = (target: 'dairy' | 'poultry') => {
    if (target === 'dairy') onOpenCostArticle?.();
    else onOpenEggArticle?.();
  };

  const dock = [
    { icon: 'home', label: t('home'), onClick: onHome },
    { icon: 'storefront', label: t('farmSetup'), onClick: () => {} },
    { icon: 'shopping_cart', label: t('marketplace'), onClick: () => {} },
    { icon: 'account_circle', label: t('farmerProfile'), onClick: () => {} },
  ];

  return (
    <div className="h-full flex flex-col relative bg-[#e5f4f7] text-gray-900 antialiased font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Soft blue → green wave background */}
      <svg
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 375 812"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="fsBase" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d4eefb" />
            <stop offset="0.55" stopColor="#dff3ee" />
            <stop offset="1" stopColor="#cdf3d3" />
          </linearGradient>
          <linearGradient id="fsWaveA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bfe6f7" stopOpacity="0.55" />
            <stop offset="1" stopColor="#c4f0d2" stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id="fsWaveB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#bdeccb" stopOpacity="0.6" />
            <stop offset="1" stopColor="#b6e4f3" stopOpacity="0.5" />
          </linearGradient>
        </defs>
        <rect width="375" height="812" fill="url(#fsBase)" />
        <path d="M0 250 C 90 200, 180 300, 270 250 S 350 220, 375 240 L375 812 L0 812 Z" fill="url(#fsWaveA)" />
        <path d="M0 520 C 100 470, 200 570, 290 520 S 355 490, 375 505 L375 812 L0 812 Z" fill="url(#fsWaveB)" />
      </svg>
      {/* Top bar (same style as the home screen's upper dock) */}
      <header className="relative z-30 shrink-0 w-full py-2.5 px-3 backdrop-blur-md bg-white/70 border-b border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-2 min-h-[35px]">
          <div className="flex flex-col min-w-0">
            <h1 className={`${serif} text-[17px] font-bold text-[#191c1b] leading-tight whitespace-nowrap`}>The farmer’s library</h1>
          </div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-100/80 text-emerald-800 border border-emerald-200/60 uppercase tracking-[0.08em] leading-tight text-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0" />
            Works offline
          </span>
        </div>
      </header>
      <div className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-3 pt-3 pb-28">
        <h2 className={`${serif} text-[26px] font-bold tracking-tight text-gray-950 leading-tight px-1`}>Farm Setup</h2>
        <p className="text-[12.5px] leading-relaxed text-gray-600 mt-1 mb-5 px-1">
          Simple guides on costs, schemes and safe farming for dairy, goat and poultry farmers.
        </p>

        <div className="space-y-5">
          {/* Browse by topic */}
          <section>
            <h2 className={`${serif} text-[18px] font-bold mb-3`}>Browse by topic</h2>
            <TopicsCarousel onOpen={openTopic} />
          </section>

          {/* Schemes banner */}
          <section>
            <button
              type="button"
              onClick={onOpenGov}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-stone-200/80 rounded-xl shadow-xs text-left cursor-pointer"
            >
              <span className="text-sm font-semibold text-gray-800">Government schemes and subsidies</span>
              <svg className="w-4 h-4 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
              </svg>
            </button>
          </section>

          {/* Featured carousel */}
          <section>
            <div
              ref={featured.ref}
              onScroll={featured.onScroll}
              className="flex gap-3 overflow-x-auto scrollbar-none pb-2 pt-0.5 -mx-3 px-3 snap-x snap-mandatory scroll-smooth"
              style={{ scrollPaddingLeft: '0.75rem' }}
            >
              {FEATURED.map((f, i) => {
                const th = HERO_THEMES[f.target];
                return (
                <article
                  key={f.tag}
                  onClick={() => openFeatured(f.target)}
                  className="featured-card cursor-pointer relative overflow-hidden min-w-[88%] w-[88%] snap-start shrink-0 p-4 pt-10 border flex flex-col justify-between rounded-[28px]"
                  style={{ background: th.bg, borderColor: th.border, boxShadow: th.shadow }}
                >
                  {f.target === 'dairy' ? <GrassTop /> : <HayTop />}
                  {f.target === 'dairy' ? <WanderingCow /> : <WanderingChick />}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase bg-white/75 tracking-[0.08em]" style={{ color: th.tag }}>
                        {f.tag}
                      </span>
                      <button
                        type="button"
                        aria-label="Bookmark"
                        onClick={(e) => { e.stopPropagation(); toggleSave(`f${i}`); }}
                        className="w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center bg-white/60 active:scale-95 transition cursor-pointer"
                      >
                        <BookmarkIcon filled={saved[`f${i}`]} />
                      </button>
                    </div>
                    <h2 className={`${serif} text-[24px] font-bold leading-tight tracking-[-0.025em] mt-5 mb-2.5`} style={{ color: th.title }}>{f.title}</h2>
                    <p className="text-[13px] leading-relaxed mb-5" style={{ color: th.body }}>{f.body}</p>
                  </div>
                  <div className="relative z-10 flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => openFeatured(f.target)}
                      className="flex-1 py-3 rounded-full text-xs font-semibold text-white shadow-sm active:scale-[0.98] transition cursor-pointer"
                      style={{ background: th.btn }}
                    >
                      Read Guide
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleSave(`f${i}`); }}
                      className="flex-1 py-3 px-3 rounded-full text-xs font-semibold text-gray-950 bg-white/60 border border-black/15 flex items-center justify-center gap-1.5 active:scale-[0.98] transition cursor-pointer"
                    >
                      <BookmarkIcon className="w-3.5 h-3.5 shrink-0" filled={saved[`f${i}`]} />
                      <span>{saved[`f${i}`] ? 'Saved' : 'Save Article'}</span>
                    </button>
                  </div>
                </article>
                );
              })}
            </div>
            <Dots count={FEATURED.length} active={featured.active} onPick={featured.scrollTo} label="Go to guide" />
          </section>

          {/* Tip of the day */}
          <section>
            <aside className="bg-[#f3ece0]/60 border border-stone-300/40 rounded-xl p-4">
              <h3 className="text-[10px] font-bold uppercase text-amber-900/80 mb-1 tracking-[0.08em]">Farm tip of the day</h3>
              <p className={`${serif} font-bold text-sm leading-relaxed tracking-[-0.015em]`}>
                Log field tasks &amp; yields right away so seasonal paterns and labor needs stay easy to track
              </p>
            </aside>
          </section>

          {/* Trending */}
          <section>
            <h2 className={`${serif} text-[18px] font-bold mb-3`}>Trending this week</h2>
            <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100 shadow-xs overflow-hidden">
              {TRENDING.map((title, i) => (
                <button
                  key={title}
                  type="button"
                  onClick={[onOpenPoultryCost, onOpenInsureArticle, onOpenRuleBook][i]}
                  className="w-full flex items-center gap-4 p-3.5 text-left active:bg-stone-50 cursor-pointer"
                >
                  <span className={`${serif} text-base font-bold text-[#26583d] w-4 text-center`}>{i + 1}</span>
                  <span className="text-sm font-semibold text-gray-800">{title}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Tools & equipment advisory */}
          <section>
            <div
              role="button"
              tabIndex={0}
              onClick={onOpenChaff}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpenChaff?.(); } }}
              className="relative overflow-hidden p-4 rounded-[28px] border border-[#7FAE52]/50 cursor-pointer active:scale-[0.99] transition-transform"
              style={{
                background: 'linear-gradient(180deg, #DDF0B8 0%, #BEE08A 55%, #9FCB66 100%)',
                boxShadow: '0 2px 4px rgba(50,100,30,0.14), 0 16px 28px -10px rgba(60,120,35,0.50)',
              }}
            >
              <div className="relative flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase text-[#1b4332] bg-white/80 tracking-[0.08em] shadow-sm">
                  tools and equipment
                </span>
              </div>

              <h2 className={`${serif} relative text-[21px] font-bold leading-[1.15] tracking-[-0.02em] text-[#173a12] mb-2`}>
                Choosing &amp; using a chaff cutter, safely
              </h2>

              {/* Highlighter-style quote: only the words get the white background, regular weight */}
              <p className="relative font-['Source_Serif_4',Georgia,serif] font-normal text-[16px] text-[#26332b] mb-4" style={{ lineHeight: 1.62 }}>
                <span
                  className="bg-white/90 px-1 py-px rounded"
                  style={{ boxDecorationBreak: 'clone', WebkitBoxDecorationBreak: 'clone' }}
                >
                  “Chopped fodder means less waste and more milk. A chaff cutter is also one of the most dangerous machines on a farm.”
                </span>
              </p>

              <button
                type="button"
                className="relative w-full py-3 rounded-full text-[12px] font-bold tracking-wide text-white bg-[#123326] shadow-md active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                READ NOW
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.4" viewBox="0 0 24 24"><path d="M5 12h14m-6-6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </button>
            </div>
          </section>

          {/* Seasonal */}
          <section>
            <h2 className={`${serif} text-[18px] font-bold mb-3`}>This season: pre-winter humidity</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { title: 'The Shed Routine', meta: 'Poultry · 5 min read', onClick: onOpenChicksArticle },
                { title: 'Cows & humidity', meta: 'Cows · 6 min read', onClick: onOpenDairy },
              ].map((c) => (
                <button
                  key={c.title}
                  type="button"
                  onClick={c.onClick}
                  className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-col justify-between text-left active:scale-[0.98] transition cursor-pointer"
                >
                  <h3 className="text-sm font-bold leading-snug">{c.title}</h3>
                  <span className="text-xs text-stone-500 mt-2 block font-medium">{c.meta}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Tools */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className={`${serif} text-[18px] font-bold`}>Tools and equipment</h2>
              <span className="text-[11px] font-bold uppercase text-stone-400 tracking-[0.08em]">Sponsored</span>
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {TOOLS.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={showSoon}
                  className="bg-white p-3 rounded-xl border border-stone-200/90 shadow-xs min-h-[85px] text-left cursor-pointer active:scale-[0.97] transition-transform"
                >
                  <h3 className="text-xs font-bold text-gray-800 leading-tight">{name}</h3>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* "Coming soon" pop-up, just above the dock */}
      <AnimatePresence>
        {soonToast && (
          <motion.div
            key="soon"
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute inset-x-6 z-50 mx-auto max-w-[320px] px-4 py-2.5 rounded-2xl text-center text-[12px] font-semibold leading-snug text-[#1F4E7A] border border-[#bcd9f2]/80 backdrop-blur-md shadow-[0_8px_22px_-8px_rgba(60,120,190,0.45)]"
            style={{ bottom: 'calc(max(12px, env(safe-area-inset-bottom)) + 70px)', background: 'rgba(214,234,250,0.92)' }}
          >
            Articles and products in marketplace are coming soon
          </motion.div>
        )}
      </AnimatePresence>

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
                    style={{
                      background: 'linear-gradient(135deg, rgba(19,78,63,0.14) 0%, rgba(181,239,218,0.42) 100%)',
                      border: '1px solid rgba(255,255,255,0.95)',
                    }}
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
