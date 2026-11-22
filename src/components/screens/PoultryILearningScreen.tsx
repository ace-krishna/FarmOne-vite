import React, { useRef } from 'react';
import { HayTop, WanderingChick } from './PoultryHeroArt';

interface Props {
  onBack: () => void;
  // Wired up later, once the article screens exist
  onOpenArticle?: (id: string) => void;
}

const UI_SCALE = 0.95;

const serif = "font-['Newsreader',Georgia,serif]";
const sans = "font-['DM_Sans',-apple-system,BlinkMacSystemFont,sans-serif]";

type Article = {
  id: string;
  tag: string;
  title: string;
  body: string;
  chip: string;
  bg: string;
  accent: string;
  shadow: string;
  icon: React.ReactNode;
};

const iconProps = {
  className: 'w-7 h-7',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  strokeWidth: 2,
  viewBox: '0 0 24 24',
};

const YELLOW = {
  bg: 'rgb(254,248,202)',
  accent: 'rgb(133,91,8)',
  shadow: '0 1px 2px rgba(120,85,10,0.10), 0 10px 22px -8px rgba(150,105,10,0.40)',
};
const MINT = {
  bg: 'rgb(228,248,238)',
  accent: 'rgb(22,101,52)',
  shadow: '0 1px 2px rgba(15,80,45,0.10), 0 10px 22px -8px rgba(22,101,52,0.36)',
};

const ARTICLES: Article[] = [
  {
    id: 'chicks',
    tag: 'Shed Care',
    title: 'Raising healthy chicks: warmth, vaccines and feed',
    body: 'Essential steps for first-week brooding, heat lamps, and vital early nutrition.',
    chip: 'Brooder guide',
    ...YELLOW,
    icon: (
      <svg {...iconProps}>
        <path d="M12 2v2" />
        <path d="M12 20v2" />
        <path d="m4.93 4.93 1.41 1.41" />
        <path d="m17.66 17.66 1.41 1.41" />
        <path d="M2 12h2" />
        <path d="M20 12h2" />
        <path d="m6.34 17.66-1.41 1.41" />
        <path d="m19.07 4.93-1.41 1.41" />
        <circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
  {
    id: 'dead-birds',
    tag: 'Dead Birds',
    title: 'Dead birds: the 24-hour rule',
    body: 'Two safe ways to dispose of them, burial or composting.',
    chip: 'Method picker',
    ...MINT,
    icon: (
      <svg {...iconProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'daily-routine',
    tag: 'Shed Care',
    title: 'Dry litter, fresh air: the daily shed routine',
    body: 'What to do every day, every batch, and every few months.',
    chip: 'Routine planner',
    ...YELLOW,
    icon: (
      <svg {...iconProps}>
        <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
      </svg>
    ),
  },
  {
    id: 'pests',
    tag: 'Pests',
    title: 'Keep flies and rats out, and medicine in its place',
    body: 'Simple habits that stop pests before they start.',
    chip: 'Checklist',
    ...MINT,
    icon: (
      <svg {...iconProps}>
        <rect height="14" rx="4" width="8" x="8" y="6" />
        <path d="m19 7-3 2" />
        <path d="m5 7 3 2" />
        <path d="m19 19-3-2" />
        <path d="m5 19 3-2" />
        <path d="M20 13h-4" />
        <path d="M4 13h4" />
        <path d="m10 4 1 2" />
        <path d="m14 4-1 2" />
      </svg>
    ),
  },
];

export const PoultryILearningScreen: React.FC<Props> = ({ onBack, onOpenArticle }) => {
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
      style={{ background: 'linear-gradient(180deg, #F7C98B 0%, #F9DDA0 45%, #F6EDB5 100%)' }}
    >
      <div
        className={`overflow-y-auto overflow-x-hidden text-[#1e2320] antialiased ${sans}`}
        style={{
          width: `${100 / UI_SCALE}%`,
          height: `${100 / UI_SCALE}%`,
          transform: `scale(${UI_SCALE})`,
          transformOrigin: 'top left',
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <main className="pb-8">
          {/* Top bar */}
          <header className="px-5 pt-4 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Go back"
                onClick={onBack}
                className="-ml-3 w-8 h-8 rounded-full bg-white shadow-[0_2px_6px_rgba(90,60,10,0.18)] flex items-center justify-center text-[#133529] active:scale-95 cursor-pointer"
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
                <p className="text-xs font-black uppercase tracking-wider text-[#964b24]">Poultry</p>
              </div>
              <p className="text-[13.6px] leading-relaxed text-[#404b44] pr-1">
                Simple reads for a cleaner, healthier poultry farm. Each one has something you can try right on the page.
              </p>
            </section>

            {/* Hero card */}
            <section className="mb-6">
              <div
                onClick={() => onOpenArticle?.('manure')}
                className="cursor-pointer rounded-[28px] p-6 pt-12 border border-[#c99a5b]/40 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(180deg, #F6E6C0 0%, #EDCF9C 50%, #E3B887 100%)',
                  boxShadow: '0 2px 4px rgba(120,80,20,0.12), 0 18px 32px -10px rgba(140,90,25,0.50)',
                }}
              >
                <HayTop />
                <WanderingChick />
                <div className="relative z-10 text-[11px] font-black uppercase tracking-wider text-[#6b4318] mb-3">
                  Start here · 5 min read
                </div>
                <h2 className={`relative z-10 text-2xl font-bold text-[#3a2410] leading-[1.25] mb-3 tracking-tight ${serif}`}>
                  Is your manure pile healthy? Check it in two minutes
                </h2>
                <p className="text-sm leading-relaxed text-[#5b4126] mb-5">
                  Turn smelly waste into compost you can use or sell. Check your own pile with two simple readings.
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {['Pile checker', 'Checklist'].map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/95 text-xs font-semibold text-[#4a2f12]"
                    >
                      {c}
                    </span>
                  ))}
                </div>
                <button
                  type="button"
                  className="w-full py-4 rounded-full bg-[#153b2d] text-white font-semibold text-center text-sm shadow-md active:bg-[#0a1f18] transition-colors cursor-pointer"
                >
                  Read the story
                </button>
              </div>
            </section>

            {/* All reads */}
            <section>
              <div className="flex items-baseline justify-between border-b border-black pb-2 mb-4">
                <h2 className={`text-2xl font-bold text-[#111a15] tracking-tight ${serif}`}>All reads</h2>
                <span className="text-xs font-medium text-neutral-500">{ARTICLES.length} reads</span>
              </div>
              <div className="space-y-3">
                {ARTICLES.map((a) => (
                  <article
                    key={a.id}
                    onClick={() => onOpenArticle?.(a.id)}
                    className="p-5 rounded-2xl flex items-start justify-between gap-4 cursor-pointer active:opacity-75 transition-opacity"
                    style={{ backgroundColor: a.bg, boxShadow: a.shadow }}
                  >
                    <div className="flex-1 pr-1">
                      <span
                        className="block text-[11px] font-black tracking-wider uppercase mb-1"
                        style={{ color: a.accent }}
                      >
                        {a.tag}
                      </span>
                      <h3 className={`text-lg font-bold text-[#141a16] leading-snug mb-1.5 ${serif}`}>{a.title}</h3>
                      <p className="text-xs text-[#525f56] leading-relaxed mb-3">{a.body}</p>
                      <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <span>5 min</span>
                        <span className="text-neutral-300">•</span>
                        <span
                          className="bg-white text-xs px-2.5 py-1 rounded-full font-medium inline-block shadow-sm"
                          style={{ color: a.accent }}
                        >
                          {a.chip}
                        </span>
                      </div>
                    </div>
                    <div
                      className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shrink-0"
                      style={{ color: a.accent }}
                    >
                      {a.icon}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            {/* Callout */}
            <section className="mt-6">
              <div className="rounded-2xl bg-[#e6f3f7] p-5 border border-[#cee6ef]">
                <h4 className={`text-base font-bold text-[#11242e] mb-1 tracking-tight ${serif}`}>
                  Read, try, then check it off
                </h4>
                <p className="text-xs leading-relaxed text-[#36515e]">
                  Every read ends with a short checklist for your shed. Tick it off as you go.
                </p>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};
