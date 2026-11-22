import React, { useRef, useState } from 'react';

interface Props {
  onBack: () => void;
  onOpenNext?: () => void;
}

// Design is 390px wide; the phone shell is 375px
const UI_SCALE = 375 / 390;

const serif = "'Source Serif 4',Georgia,serif";
const inter = "Inter,sans-serif";

const CARD: React.CSSProperties = {
  background: '#FFFFFF',
  border: '1px solid #DCDACF',
  borderRadius: 24,
  padding: 18,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  fontFamily: inter,
};

const H2: React.CSSProperties = { margin: 0, fontWeight: 700, fontSize: 26, lineHeight: 1.2 };
const BODY: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 18, fontSize: 19, lineHeight: 1.6 };
const EYEBROW: React.CSSProperties = { font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F6B50' };

const QUESTIONS = [
  'Is less than about 60% of the ration forage?',
  'Is the fodder chopped very fine?',
  'Is concentrate heavy with no buffer or yeast?',
];

const CAUSES = [
  'Raise the forage share toward 60:40.',
  'Chop longer, around 1.5 to 2.5 cm.',
  'Add sodium bicarbonate and yeast to hold rumen pH above 6.0.',
];

type Answer = 'y' | 'n';

export const FatArticleScreen: React.FC<Props> = ({ onBack, onOpenNext }) => {
  const [forage, setForage] = useState(60);
  const [ans, setAns] = useState<Record<number, Answer>>({});
  const [saved, setSaved] = useState(false);
  const [progress, setProgress] = useState(0);
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

  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const max = el.scrollHeight - el.clientHeight;
    setProgress(max > 0 ? Math.min(1, el.scrollTop / max) : 0);
  };

  // Ration ratio logic (same thresholds as the design)
  let verdict = 'ON TARGET';
  let bg = '#DDF4EA';
  let ink = '#0F6B50';
  let note = 'Close to the 60:40 target in the guide. Fibre keeps cows chewing and the fat steady.';
  if (forage < 55) {
    verdict = 'FAT AT RISK';
    bg = '#FFDDE5';
    ink = '#A3173F';
    note = 'Too little forage. Less chewing, less saliva and a more acidic rumen can pull milk fat down.';
  }
  if (forage > 65) {
    verdict = 'ENERGY MAY RUN SHORT';
    bg = '#FFF2D0';
    ink = '#7A4E00';
    note = 'Plenty of fibre, but heavy forage can leave a high yielder short of energy. Balance with concentrate.';
  }

  // "Why is my milk fat low?" finder: first "Yes" decides what to fix first
  const hit = [0, 1, 2].find((i) => ans[i] === 'y');
  const result =
    hit !== undefined
      ? 'Start here: ' + CAUSES[hit]
      : ans[0] && ans[1] && ans[2]
        ? 'None match. Ask your vet or dairy adviser.'
        : 'Answer the questions to see what to fix first.';

  const pill = (on: boolean): React.CSSProperties => ({
    flex: 1,
    minHeight: 44,
    border: 0,
    borderRadius: 999,
    background: on ? '#123B2C' : '#F2F0E6',
    color: on ? '#FFFFFF' : '#1A1F1B',
    font: `600 14px ${inter}`,
    cursor: 'pointer',
  });

  return (
    <div className="h-full w-full overflow-hidden" style={{ background: '#FBFAF6' }}>
      <div
        className="flex flex-col overflow-hidden antialiased"
        style={{
          width: `${100 / UI_SCALE}%`,
          height: `${100 / UI_SCALE}%`,
          transform: `scale(${UI_SCALE})`,
          transformOrigin: 'top left',
          background: '#FBFAF6',
          color: '#1A1F1B',
          fontFamily: serif,
        }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Top bar + progress */}
        <div className="shrink-0" style={{ background: '#FBFAF6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 8px 0 8px' }}>
            <button
              type="button"
              aria-label="Back"
              onClick={onBack}
              style={{ width: 44, height: 44, border: 0, background: 'transparent', color: '#1A1F1B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <div style={{ font: `700 12px ${inter}`, letterSpacing: '0.1em', color: '#123B2C' }}>I-LEARNING</div>
            <button
              type="button"
              aria-label="Save for later"
              aria-pressed={saved}
              onClick={() => setSaved((s) => !s)}
              style={{ width: 44, height: 44, border: 0, background: 'transparent', color: '#1A1F1B', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6 3h12v18l-6-4-6 4z" />
              </svg>
            </button>
          </div>
          <div style={{ height: 4, background: '#E7E5DA', margin: '6px 0 0' }}>
            <div style={{ width: `${Math.max(3, progress * 100)}%`, height: '100%', background: '#123B2C', transition: 'width 120ms linear' }} />
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden" onScroll={onScroll}>
          {/* Header */}
          <div style={{ padding: '22px 22px 0', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', font: `700 11px ${inter}`, letterSpacing: '0.1em' }}>
              <span style={{ background: '#DDF4EA', color: '#0F6B50', borderRadius: 6, padding: '4px 8px' }}>FEED</span>
              <span style={{ background: '#E1F0F3', color: '#0F5F46', borderRadius: 6, padding: '4px 8px' }}>BETTER MILK</span>
            </div>
            <h1 style={{ margin: 0, fontWeight: 700, fontSize: 35, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
              Fat is a fibre story
            </h1>
            <div style={{ fontSize: 19, lineHeight: 1.4, color: '#44504A' }}>
              If the fat in your milk is low, look at the fodder before the grain bag.
            </div>
          </div>

          {/* Illustration */}
          <div style={{ margin: '16px 0 0', height: 190, background: '#DDF4EA', overflow: 'hidden' }}>
            <svg width="390" height="190" viewBox="0 0 390 190" aria-hidden="true" style={{ display: 'block' }}>
              <g stroke="#1B7F5F" strokeWidth="5" strokeLinecap="round" fill="none">
                <path d="M60 190c4-50 2-90-10-130" />
                <path d="M110 190c0-60 12-100 30-140" />
                <path d="M170 190c-4-50 0-100 18-150" />
                <path d="M230 190c6-60 4-100-6-150" />
                <path d="M290 190c-2-50 8-100 26-140" />
                <path d="M340 190c4-40 2-80-8-120" />
              </g>
              <g fill="#1B7F5F">
                <path d="M50 60c-14-6-20-18-18-30 12 4 20 14 18 30z" />
                <path d="M140 50c14-6 20-18 18-30-12 4-20 14-18 30z" />
                <path d="M188 40c-14-6-20-18-18-30 12 4 20 14 18 30z" />
                <path d="M316 50c14-6 20-18 18-30-12 4-20 14-18 30z" />
              </g>
            </svg>
          </div>

          {/* Intro copy */}
          <div style={{ ...BODY, padding: '26px 22px 0' }}>
            <p style={{ margin: 0 }}>
              A cow’s rumen is a fermentation tank. Fibre makes her chew, chewing makes saliva, and saliva keeps the tank from turning sour. A sour rumen makes less milk fat.
            </p>
            <p style={{ margin: 0 }}>
              That is why the guide begins with the <strong>60:40 rule</strong>: roughly 60 parts forage to 40 parts concentrate, with fodder chopped to about <strong>1.5 to 2.5 cm</strong>.
            </p>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Slide the ratio</h2>
            <p style={{ margin: 0 }}>Move the slider to change the forage share of the ration, and watch the fat risk.</p>
          </div>

          {/* Ration ratio */}
          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <style>{`.fat-range{width:100%;accent-color:#123B2C;height:44px;margin:0}`}</style>
            <div style={EYEBROW}>TRY IT · RATION RATIO</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', font: `600 14px ${inter}` }}>
              <label htmlFor="fat-f">Forage share of ration</label>
              <span>{forage} %</span>
            </div>
            <input id="fat-f" className="fat-range" type="range" min={30} max={80} step={5} value={forage} onChange={(e) => setForage(Number(e.target.value))} />
            <div style={{ display: 'flex', height: 48, borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ width: `${forage}%`, background: '#1B7F5F', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}`, whiteSpace: 'nowrap', overflow: 'hidden', transition: 'width 150ms ease' }}>
                Forage {forage}
              </div>
              <div style={{ width: `${100 - forage}%`, background: '#E5B94A', color: '#1A1F1B', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 14px ${inter}`, whiteSpace: 'nowrap', overflow: 'hidden', transition: 'width 150ms ease' }}>
                Conc. {100 - forage}
              </div>
            </div>
            <div style={{ background: bg, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ font: `700 12px ${inter}`, letterSpacing: '0.08em', color: ink }}>{verdict}</div>
              <div style={{ font: `400 15px ${inter}`, lineHeight: 1.5 }}>{note}</div>
            </div>
            <div style={{ font: `400 12px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
              The 60:40 target is from the guide. The labels on either side are a simplified teaching aid, not a measured result.
            </div>
          </div>

          {/* Pull quote + rumen pH */}
          <div style={{ ...BODY, padding: '28px 22px 0' }}>
            <div style={{ borderTop: '3px solid #123B2C', borderBottom: '1px solid #DCDACF', padding: '16px 0', fontWeight: 600, fontSize: 25, lineHeight: 1.25, letterSpacing: '-0.01em' }}>
              “Fine grinding drops milk fat. Chop it long enough to chew.”
            </div>
            <h2 style={{ ...H2, margin: '6px 0 0' }}>Keep the rumen above 6.0</h2>
            <p style={{ margin: 0 }}>
              Even a good ration can turn acid on a heavy-grain day. The guide adds <strong>sodium bicarbonate at 0.75 to 1.0% of dry matter intake</strong> plus yeast culture to hold rumen pH above <strong>6.0</strong>.
            </p>
          </div>

          {/* Low milk fat finder */}
          <div style={{ ...CARD, margin: '18px 16px 0' }}>
            <div style={EYEBROW}>WHY IS MY MILK FAT LOW? · 3 QUESTIONS</div>
            {QUESTIONS.map((q, i) => (
              <div key={q} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ font: `600 15px ${inter}`, lineHeight: 1.4 }}>{q}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button type="button" aria-pressed={ans[i] === 'y'} onClick={() => setAns({ ...ans, [i]: 'y' })} style={pill(ans[i] === 'y')}>Yes</button>
                  <button type="button" aria-pressed={ans[i] === 'n'} onClick={() => setAns({ ...ans, [i]: 'n' })} style={pill(ans[i] === 'n')}>No</button>
                </div>
              </div>
            ))}
            <div style={{ background: '#E5F27A', borderRadius: 14, padding: 12, font: `600 14px ${inter}`, lineHeight: 1.5, color: '#2A3A00' }}>{result}</div>
          </div>

          {/* Key takeaways */}
          <div style={{ padding: '28px 22px 0' }}>
            <div style={{ background: '#E5F27A', borderRadius: 22, padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#2A3A00' }}>KEY TAKEAWAYS</div>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 17, lineHeight: 1.55, listStyle: 'disc' }}>
                <li>Aim for about 60:40 forage to concentrate.</li>
                <li>Chop fodder to 1.5 to 2.5 cm.</li>
                <li>Buffer and yeast keep rumen pH above 6.0.</li>
              </ul>
            </div>
          </div>

          {/* Up next */}
          <div style={{ padding: '22px 16px 0' }}>
            <div
              onClick={onOpenNext}
              style={{ background: '#E1F0F3', borderRadius: 22, padding: 18, display: 'flex', alignItems: 'center', gap: 14, fontFamily: inter, cursor: onOpenNext ? 'pointer' : 'default' }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ font: `700 11px ${inter}`, letterSpacing: '0.12em', color: '#0F5F46' }}>UP NEXT</div>
                <div style={{ font: `700 18px ${serif}`, lineHeight: 1.25, marginTop: 4 }}>Low SNF? Look at the energy first</div>
                <div style={{ font: `500 13px ${inter}`, color: '#44504A', marginTop: 4 }}>7 min · Quiz</div>
              </div>
              <span aria-hidden="true" style={{ flex: 'none', width: 44, height: 44, borderRadius: '50%', background: '#123B2C', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `600 20px ${inter}` }}>›</span>
            </div>
          </div>

          <div style={{ padding: '18px 22px 40px', font: `400 12px ${inter}`, lineHeight: 1.5, color: '#5C6862' }}>
            Source: private dairy management guide, not yet verified. Confirm figures with your vet or dairy adviser.
          </div>
        </div>
      </div>
    </div>
  );
};
