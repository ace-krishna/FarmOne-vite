import React, { useRef } from 'react';
import { GrassTop, WanderingCow } from './DairyHeroArt';

interface Props {
  onBack: () => void;
  // Wired up later, once the dairy article screens exist
  onOpenArticle?: (id: string) => void;
}

const UI_SCALE = 0.95;

const serif = "font-['Newsreader',Georgia,serif]";
const sans = "font-['DM_Sans',-apple-system,BlinkMacSystemFont,sans-serif]";

const iconProps = {
  className: 'w-7 h-7',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2.2,
  viewBox: '0 0 24 24',
};

const BLUE = {
  bg: '#d6eaf8',
  accent: '#245b99',
  shadow: '0 1px 2px rgba(20,70,130,0.10), 0 10px 22px -8px rgba(36,91,153,0.38)',
};
const PINK = {
  bg: '#fcd3df',
  accent: '#ad2d4c',
  shadow: '0 1px 2px rgba(130,30,60,0.10), 0 10px 22px -8px rgba(173,45,76,0.36)',
};
const GREEN = {
  bg: '#cfeddc',
  accent: '#1e7855',
  shadow: '0 1px 2px rgba(15,80,45,0.10), 0 10px 22px -8px rgba(30,120,85,0.36)',
};

type Article = {
  id: string;
  tag: string;
  title: string;
  body: string;
  mins: number;
  chip: string;
  c: typeof BLUE;
  icon: React.ReactNode;
};

const droplet = (
  <svg {...iconProps}>
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
  </svg>
);
const shield = (
  <svg {...iconProps}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);
const leaf = (
  <svg {...iconProps}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);
const ARTICLES: Article[] = [
  {
    id: 'water',
    tag: 'Comfort and heat',
    title: 'Water is the cheapest feed you are not measuring',
    body: 'How many litres a thirsty cow really needs, and where to put the trough.',
    mins: 5,
    chip: 'Calculator',
    c: BLUE,
    icon: droplet,
  },
  {
    id: 'hygiene',
    tag: 'Hygiene',
    title: 'Clean milk starts at the teat',
    body: 'A four-step routine that keeps cell counts down.',
    mins: 6,
    chip: 'Checklist',
    c: PINK,
    icon: shield,
  },
  {
    id: 'fat',
    tag: 'Feed',
    title: 'Fat is a fibre story',
    body: 'Why the 60:40 forage rule matters more than the grain bag.',
    mins: 6,
    chip: 'Chart',
    c: GREEN,
    icon: leaf,
  },
  {
    id: 'chaff',
    tag: 'Feed & fodder',
    title: 'Choosing and using a chaff cutter, safely',
    body: 'Chopped fodder means less waste and more milk. Pick the right machine and stay safe.',
    mins: 6,
    chip: 'Checklist',
    c: GREEN,
    icon: leaf,
  },
];

export const DairyILearningScreen: React.FC<Props> = ({ onBack, onOpenArticle }) => {
  const swipe = useRef<{ x: number; y: number } | null>(null);

  // Left-edge swipe = back gesture (same as the other screens)
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
      style={{ background: 'linear-gradient(180deg, #CDF1DB 0%, #E3EFC6 50%, #F7E0A0 100%)' }}
    >
      <div
        className={`overflow-y-auto overflow-x-hidden text-[#171c19] antialiased ${sans}`}
        style={{
          width: `${100 / UI_SCALE}%`,
          height: `${100 / UI_SCALE}%`,
          transform: `scale(${UI_SCALE})`,
          transformOrigin: 'top left',
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <main className="pb-10">
          {/* Top bar */}
          <header className="px-5 pt-4 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Go back"
                onClick={onBack}
                className="-ml-3 w-8 h-8 rounded-full bg-white shadow-[0_2px_6px_rgba(30,80,40,0.18)] flex items-center justify-center text-[#133529] active:scale-95 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              </button>
              <span className="text-xs font-black tracking-wider uppercase text-[#133529]/90">Farm One</span>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ebf7f2] text-[#166e53] text-[11px] font-medium border border-[#d5efe3]">
              <span className="w-2 h-2 rounded-full bg-[#1faf75] inline-block" />
              Works offline
            </span>
          </header>

          <div className="px-5 pt-1">
            {/* Title */}
            <section className="mb-4">
              <div className="flex items-baseline gap-2.5 mb-2">
                <h1 className={`text-4xl font-black leading-tight tracking-tight text-[#111a15] ${serif}`}>i-Learning</h1>
                <p className="text-xs font-black uppercase tracking-wider text-[#2f6a3a]">Dairy</p>
              </div>
              <p className="text-[13.6px] leading-relaxed text-[#404b44] pr-1">
                Short reads that make you a better dairy farmer. Every lesson has something to try: a calculator, a
                checklist or a chart.
              </p>
            </section>

          {/* Hero card */}
          <section aria-label="Featured story" className="mb-6">
            <div
              onClick={() => onOpenArticle?.('summer-heat')}
              className="rounded-[28px] p-6 pt-12 border border-[#7FAE52]/50 flex flex-col justify-between cursor-pointer relative overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, #DDF0B8 0%, #BEE08A 55%, #9FCB66 100%)',
                boxShadow: '0 2px 4px rgba(50,100,30,0.14), 0 18px 32px -10px rgba(60,120,35,0.50)',
              }}
            >
              <GrassTop />
              <WanderingCow />
              <span className="relative z-10 text-[11px] font-black uppercase tracking-wider text-[#2d5a1e]">
                Start here · 5 min read
              </span>
              <h2 className={`relative z-10 mt-3 text-[26px] leading-[1.2] font-bold text-[#173a12] tracking-tight ${serif}`}>
                Why your cows give less milk in summer, and what to do by noon
              </h2>
              <p className="relative z-10 mt-3 text-[15px] leading-relaxed text-[#2f5a25]">
                Heat quietly takes a tenth to a quarter of your milk. Check your own shed with a two-slider tool.
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-5">
                {['Interactive gauge', 'Checklist'].map((c) => (
                  <span
                    key={c}
                    className="px-3.5 py-1.5 bg-white/95 text-[#1d4a14] text-[13px] font-semibold rounded-full"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <button
                type="button"
                className="mt-6 w-full py-4 rounded-full bg-[#123326] active:bg-[#0c241b] text-white font-semibold text-[16px] text-center transition-all duration-200 active:scale-[0.98] shadow cursor-pointer"
              >
                Read the story
              </button>
            </div>
          </section>
          </div>

          {/* Latest reads */}
          <section aria-labelledby="latest-reads-title" className="px-5">
            <div className="flex items-baseline justify-between border-b border-black pb-2 mb-4">
              <h3 id="latest-reads-title" className={`text-2xl font-bold text-[#111a15] tracking-tight ${serif}`}>
                Latest reads
              </h3>
              <span className="text-xs font-medium text-neutral-500">{ARTICLES.length} reads</span>
            </div>
            <div className="space-y-3">
              {ARTICLES.map((a) => (
                <article
                  key={a.id}
                  onClick={() => onOpenArticle?.(a.id)}
                  className="p-5 rounded-2xl flex items-start justify-between gap-4 cursor-pointer active:opacity-75 transition-opacity"
                  style={{ backgroundColor: a.c.bg, boxShadow: a.c.shadow }}
                >
                  <div className="flex-1 pr-1">
                    <span
                      className="block text-[11px] font-black tracking-wider uppercase mb-1"
                      style={{ color: a.c.accent }}
                    >
                      {a.tag}
                    </span>
                    <h4 className={`text-lg font-bold text-[#141a16] leading-snug mb-1.5 ${serif}`}>{a.title}</h4>
                    <p className="text-xs text-[#525f56] leading-relaxed mb-3">{a.body}</p>
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <span>{a.mins} min</span>
                      <span className="text-neutral-300">•</span>
                      <span
                        className="bg-white text-xs px-2.5 py-1 rounded-full font-medium inline-block shadow-sm"
                        style={{ color: a.c.accent }}
                      >
                        {a.chip}
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0"
                    style={{ color: a.c.accent }}
                  >
                    {a.icon}
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Callout */}
          <section className="mt-6 px-5">
            <div className="rounded-2xl bg-[#e6f3f7] p-5 border border-[#cee6ef]">
              <h4 className={`text-base font-bold text-[#11242e] mb-1 tracking-tight ${serif}`}>
                Read, try, then check it off
              </h4>
              <p className="text-xs leading-relaxed text-[#36515e]">
                Every read ends with a short checklist for your shed. Tick it off as you go.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
