import React, { useRef, useState } from 'react';
import { CowFigure, GrassTop, WanderingCow } from './DairyHeroArt';
import { ChickFigure, HayTop, WanderingChick } from './PoultryHeroArt';

interface Props {
  onBack: () => void;
  onOpenPoultry?: () => void;
  onOpenDairy?: () => void;
  onOpenChicksArticle?: () => void;
  onOpenHeatArticle?: () => void;
}

// Same fit-to-shell scaling approach as the other screens
const UI_SCALE = 0.95;

const serif = "font-['Newsreader',Georgia,serif]";
const sans = "font-['DM_Sans',-apple-system,BlinkMacSystemFont,sans-serif]";

/** Pagination dots that follow a horizontally scrolling container. */
const Dots: React.FC<{ count: number; active: number }> = ({ count, active }) => (
  <div className="flex items-center justify-center gap-1.5 mt-3.5">
    {Array.from({ length: count }).map((_, i) => (
      <span
        key={i}
        className={`h-1 rounded-full transition-all ${i === active ? 'w-5 bg-[#103728]' : 'w-1.5 bg-gray-300'}`}
      />
    ))}
  </div>
);

const useScrollIndex = (count: number) => {
  const [index, setIndex] = useState(0);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollWidth - el.clientWidth;
    if (max <= 0) return setIndex(0);
    setIndex(Math.round((el.scrollLeft / max) * (count - 1)));
  };
  return { index, onScroll };
};

// Themed look for featured cards that match the dairy / poultry hero cards
const FEATURED_THEMES: Record<string, {
  border: string; bg: string; shadow: string; tag: string; title: string; body: string; pill: string; btn: string;
}> = {
  heat: {
    border: 'border-[#7FAE52]/50',
    bg: 'linear-gradient(180deg, #DDF0B8 0%, #BEE08A 55%, #9FCB66 100%)',
    shadow: '0 2px 4px rgba(50,100,30,0.14), 0 18px 32px -10px rgba(60,120,35,0.50)',
    tag: 'text-[#2d5a1e]', title: 'text-[#173a12]', body: 'text-[#2f5a25]', pill: 'text-[#1d4a14]', btn: 'bg-[#123326]',
  },
  chicks: {
    border: 'border-[#d4b04a]/45',
    bg: 'linear-gradient(180deg, #FBF0BE 0%, #F6DF8C 50%, #EEC965 100%)',
    shadow: '0 2px 4px rgba(140,105,15,0.12), 0 18px 32px -10px rgba(170,125,15,0.45)',
    tag: 'text-[#6b4318]', title: 'text-[#3a2410]', body: 'text-[#5b4126]', pill: 'text-[#4a2f12]', btn: 'bg-[#153b2d]',
  },
};

const FEATURED = [
  {
    id: 'heat',
    tag: 'Featured • Deep dive in dairy farming',
    title: 'Why your cow gives less milk in summer & what to do by noon?',
    body: 'Heat quietly takes a tenth to a quarter of your milk production. Check your own shed with a two-slider tool from us in this article.',
    author: 'Utkarsh',
    read: '15 min read',
  },
  {
    id: 'chicks',
    tag: 'Featured • Deep dive in poultry',
    title: 'Raising healthy chicks: warmth, vaccines and feed',
    body: 'An interactive guide about raising chicks in a perfectly curated environment to ensure sound health & quality production.',
    author: 'Utkarsh',
    read: '12 min read',
  },
];

const CowCard: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => (
            <article data-topic onClick={onOpen} className="cursor-pointer shrink-0 w-32 h-36 bg-[#ffd8c2] rounded-3xl p-4 flex flex-col justify-between snap-start relative overflow-hidden shadow-[0_10px_24px_-6px_rgba(190,90,40,0.38)]">
              <div>
                <h3 className={`font-bold text-xl text-gray-900 leading-none ${serif}`}>Cows</h3>
                <span className="text-[11px] text-gray-500 mt-1 block">24 articles</span>
              </div>
              <div className="relative w-full flex items-center justify-center pb-2">
                <div className="w-20 h-10 bg-amber-100/50 rounded-full blur-[6px] absolute bottom-0" />
                <div className="relative z-10"><CowFigure inPlace width={68} height={48} /></div>
              </div>
            </article>
);

const PoultryCard: React.FC<{ onOpen?: () => void }> = ({ onOpen }) => (
            <article data-topic onClick={onOpen} className="cursor-pointer shrink-0 w-32 h-36 bg-[#fde59a] rounded-3xl p-4 flex flex-col justify-between snap-start relative overflow-hidden shadow-[0_10px_24px_-6px_rgba(190,140,20,0.4)]">
              <div>
                <h3 className={`font-bold text-xl text-gray-900 leading-none ${serif}`}>Poultry</h3>
                <span className="text-[11px] text-gray-500 mt-1 block">15 articles</span>
              </div>
              <div className="relative w-full flex items-center justify-center pb-2">
                <div className="w-16 h-8 bg-amber-200/50 rounded-full blur-[6px] absolute bottom-1" />
                <div className="relative z-10"><ChickFigure inPlace width={54} height={46} /></div>
              </div>
            </article>
);

const TOPICS: React.FC<{ onOpen?: () => void }>[] = [CowCard, PoultryCard];
const TOPIC_KEYS = ['dairy', 'poultry'] as const;
const COPIES = 4; // render the pair 4x so there's always room to scroll while the loop wraps invisibly
const AUTO_MS = 2000;

/** Endless, auto-advancing Cows/Poultry carousel. */
const TopicsCarousel: React.FC<{ onOpenPoultry?: () => void; onOpenDairy?: () => void }> = ({ onOpenPoultry, onOpenDairy }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const pausedRef = useRef(false);
  const resumeTimer = useRef<number | undefined>(undefined);
  const settleTimer = useRef<number | undefined>(undefined);

  const stepOf = (el: HTMLDivElement) => {
    const c = el.children;
    return c.length > 1 ? (c[1] as HTMLElement).offsetLeft - (c[0] as HTMLElement).offsetLeft : 0;
  };

  const padOf = (el: HTMLDivElement) => parseFloat(getComputedStyle(el).scrollPaddingLeft) || 0;

  // Start on the second copy so there is room to scroll both ways
  React.useLayoutEffect(() => {
    const el = ref.current;
    if (el) el.scrollLeft = stepOf(el) * TOPICS.length - padOf(el);
  }, []);

  // Auto-advance every 2s
  React.useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
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
    setActive(((idx % TOPICS.length) + TOPICS.length) % TOPICS.length);
    // Once scrolling settles, jump back to the middle copy (looks identical)
    window.clearTimeout(settleTimer.current);
    settleTimer.current = window.setTimeout(() => {
      const i = Math.round((el.scrollLeft + pad) / step);
      const lo = TOPICS.length;
      const hi = TOPICS.length * 2;
      const shift = i < lo ? TOPICS.length : i >= hi ? -TOPICS.length : 0;
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

  return (
    <>
      <div
        ref={ref}
        onScroll={onScroll}
        onPointerDown={hold}
        onPointerUp={release}
        onPointerCancel={release}
        onPointerLeave={release}
        className="flex gap-3.5 scroll-pl-6 overflow-x-auto snap-x snap-mandatory pb-6 -mb-3"
      >
        {Array.from({ length: COPIES }).flatMap((_, c) =>
          TOPICS.map((Card, i) => (
            <Card key={`${c}-${i}`} onOpen={TOPIC_KEYS[i] === 'dairy' ? onOpenDairy : onOpenPoultry} />
          )),
        )}
      </div>
      <Dots count={TOPICS.length} active={active} />
    </>
  );
};

export const ILearningScreen: React.FC<Props> = ({ onBack, onOpenPoultry, onOpenDairy, onOpenChicksArticle, onOpenHeatArticle }) => {
  const featured = useScrollIndex(FEATURED.length);
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // Left-edge swipe = back gesture
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const left = e.currentTarget.getBoundingClientRect().left;
    swipe.current = e.clientX - left < 28 ? { x: e.clientX, y: e.clientY } : null;
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const s = swipe.current;
    swipe.current = null;
    if (s && e.clientX - s.x > 70 && Math.abs(e.clientY - s.y) < 60) onBack();
  };

  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        background:
          'linear-gradient(rgb(209,243,255) 0%, rgb(209,243,255) 42%, rgb(199,255,204) 60%, rgb(199,255,204) 100%)',
      }}
    >
    <div
      className={`overflow-y-auto overflow-x-hidden text-gray-800 antialiased ${sans}`}
      style={{ width: `${100 / UI_SCALE}%`, height: `${100 / UI_SCALE}%`, transform: `scale(${UI_SCALE})`, transformOrigin: 'top left' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      <main className="relative pb-24">
        {/* Header */}
        <header className="pt-6 px-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Go back"
                onClick={onBack}
                className="-ml-1.5 w-8 h-8 rounded-full bg-white shadow-[0_2px_6px_rgba(30,80,40,0.18)] flex items-center justify-center text-[#133529] active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <span className="text-[11px] font-bold tracking-wider text-[#1d543e] uppercase">i-learning</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dff1e5] text-[#1a5b40] text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1da868]" />
              Works offline
            </span>
          </div>
          <h1 className={`text-[34px] leading-tight font-bold text-gray-950 tracking-tight ${serif}`}>Farm Articles</h1>
          <p className="mt-1 text-[13px] text-gray-500">Handpicked guides and field research for your farm.</p>
        </header>

        {/* Explore Topics */}
        <section className="mt-5">
          <div className="px-4 flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-4 bg-[#103b29] rounded-full" />
              <h2 className="text-sm font-bold text-gray-900 tracking-tight">Explore Topics</h2>
            </div>
            <span className="text-[11px] text-gray-400">Swipe to explore</span>
          </div>
          <TopicsCarousel onOpenPoultry={onOpenPoultry} onOpenDairy={onOpenDairy} />

        </section>

        {/* Featured articles carousel */}
        <section className="mt-4">
          <div
            onScroll={featured.onScroll}
            className="flex gap-4 px-4 scroll-pl-4 overflow-x-auto snap-x snap-mandatory pb-6 -mb-3"
          >
            {FEATURED.map((a) => {
              const theme = a.id ? FEATURED_THEMES[a.id] : undefined;
              return (
              <article
                key={a.title}
                onClick={a.id === 'chicks' ? onOpenChicksArticle : a.id === 'heat' ? onOpenHeatArticle : undefined}
                className={`${a.id ? 'cursor-pointer ' : ''}w-[88%] shrink-0 snap-start rounded-[32px] p-6 text-gray-900 relative overflow-hidden ${theme ? `pt-12 border ${theme.border}` : 'bg-[#d8f55d] shadow-[0_10px_24px_-6px_rgba(60,110,20,0.38)]'}`}
                style={
                  theme ? { background: theme.bg, boxShadow: theme.shadow } : undefined
                }
              >
                {a.id === 'heat' && (
                  <>
                    <GrassTop />
                    <WanderingCow />
                  </>
                )}
                {a.id === 'chicks' && (
                  <>
                    <HayTop />
                    <WanderingChick />
                  </>
                )}
                <span className={`relative z-10 block text-[10px] font-bold tracking-wider uppercase mb-4 ${theme ? theme.tag : 'text-gray-900'}`}>{a.tag}</span>
                <h2 className={`relative z-10 font-bold text-[25px] leading-[1.18] mb-3 tracking-tight ${theme ? theme.title : 'text-gray-950'} ${serif}`}>
                  {a.title}
                </h2>
                <p className={`relative z-10 text-[12.5px] leading-relaxed mb-5 ${theme ? theme.body : 'text-gray-800/90'}`}>{a.body}</p>
                <div className="relative z-10 flex flex-wrap items-center gap-2 mb-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 text-[11px] font-semibold ${theme ? theme.pill : 'text-gray-900'}`}>
                    <svg className="w-3.5 h-3.5 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                      />
                    </svg>
                    {a.author}
                  </span>
                  <span className={`px-3 py-1 rounded-full bg-white/95 text-[11px] font-medium ${theme ? theme.pill : 'text-gray-800'}`}>{a.read}</span>
                </div>
                <button
                  type="button"
                  className={`relative z-10 text-white text-[12.5px] font-semibold px-6 py-2.5 rounded-full whitespace-nowrap cursor-pointer ${theme ? theme.btn : 'bg-[#121c17]'}`}
                >
                  Read Now
                </button>
              </article>
              );
            })}
          </div>
          <Dots count={FEATURED.length} active={featured.index} />
        </section>

        {/* The Better Milk Hub */}
        <section className="mt-5 px-4">
          <div
            className="rounded-[28px] px-5 py-4 relative overflow-hidden border"
            style={{
              background: 'linear-gradient(rgb(255, 205, 224) 0%, rgb(255, 227, 234) 40%, rgb(254, 243, 216) 100%)',
              borderColor: 'rgb(254, 200, 210)',
              boxShadow: '0 2px 4px rgba(190,60,100,0.10), 0 12px 24px -8px rgba(210,80,120,0.38)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold tracking-widest text-gray-900 uppercase">Featured • Deep Dive</span>
              <div className="w-9 h-9 rounded-xl bg-[#edf7b5]/80 flex items-center justify-center border border-[#dceca2] shrink-0">
                <svg
                  className="w-5 h-5 text-[#334e26] stroke-current fill-none stroke-2"
                  viewBox="0 0 24 24"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 7h4v4H5z" />
                  <path d="M5 11h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-7z" />
                  <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v6" />
                </svg>
              </div>
            </div>
            <h2 className={`font-bold text-[22px] leading-tight text-gray-950 mt-2.5 tracking-tight ${serif}`}>
              The Better Milk Hub™
            </h2>
            <p className="text-[12.5px] leading-snug text-gray-700 mt-1.5">
              Interactive tools and guides for Dairy Farming to nurture the cows and ensure sound health.
            </p>
            <div className="my-3 border-t border-[#d8e8a8]" />
            <button
              type="button"
              className="w-full bg-[#12221b] text-white text-[13px] font-semibold py-2.5 rounded-full block text-center cursor-pointer"
            >
              Read Now
            </button>
          </div>
        </section>

        {/* Seasonal prep */}
        <section className="px-4 mt-5">
          <article className="bg-[#fff1e7] rounded-3xl p-5 border border-[#fed7c0]/50 shadow-[0_2px_4px_rgba(190,100,40,0.10),0_12px_24px_-8px_rgba(220,120,60,0.38)]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold tracking-wider text-[#9f4823] uppercase">
                Seasonal Prep • winter 2026
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/80 text-gray-600 text-[10px] font-medium whitespace-nowrap">
                Leisure Reads
              </span>
            </div>
            <h2 className={`font-bold text-[19px] text-gray-950 leading-snug mb-2 ${serif}`}>
              Check out The Milk Hub tools and other articles in i-Learning and Farm Setup section
            </h2>
            <p className="text-[12px] text-gray-600 leading-relaxed">
              Layout a structured plan for your needs, learn the patterns &amp; the finances and nurture your farm
              endlessly. Farm One: built to nurture your farm family &lt;3
            </p>
          </article>
        </section>

        {/* Government schemes */}
        <section className="px-4 mt-5">
          <h2 className={`font-bold text-[20px] text-gray-950 leading-tight mb-3 ${serif}`}>
            Government Schemes &amp; Subsidies
          </h2>
          <article className="bg-white rounded-2xl p-4 shadow-[0_2px_4px_rgba(20,60,40,0.08),0_12px_24px_-8px_rgba(30,90,60,0.30)] border border-gray-100 flex items-center justify-between gap-3">
            <div className="space-y-1">
              <span className="inline-block px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[9px] uppercase tracking-wider">
                Subsidy
              </span>
              <h3 className={`font-bold text-[14px] text-gray-950 leading-snug ${serif}`}>
                Dairy Funding by Government: choose from 8 schemes, apply in 6 steps and avail funding for your dairy
              </h3>
              <p className="text-[11.5px] text-gray-500 leading-normal">
                Check out to gain additional support &amp; benefits for growing your farm &amp; finances
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
              <svg className="w-4 h-4 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
          </article>
        </section>
      </main>
    </div>
    </div>
  );
};
