import React, { useEffect, useRef, useState } from 'react';

// Shared by the poultry home hero and the featured chicks card on Farm Articles
const HAY_COLORS = ['#C9922F', '#D9A441', '#B87D22', '#E3B95C', '#A9701E'];

/** Deterministic pseudo-random so the hay looks the same on every render. */
const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Strand = { x1: number; y1: number; x2: number; y2: number; w: number; c: string; o: number };

const buildHay = (): Strand[] => {
  const rnd = seeded(7);
  const W = 340;
  const cx = W / 2;
  const rx = 158;
  const ry = 40;
  const out: Strand[] = [];
  const push = (x: number, y: number, len: number, angDeg: number, w: number, o: number) => {
    const a = (angDeg * Math.PI) / 180;
    out.push({
      x1: x - (Math.cos(a) * len) / 2,
      y1: y - (Math.sin(a) * len) / 2,
      x2: x + (Math.cos(a) * len) / 2,
      y2: y + (Math.sin(a) * len) / 2,
      w,
      c: HAY_COLORS[Math.floor(rnd() * HAY_COLORS.length)],
      o,
    });
  };
  // Dense body: a semicircular mound hanging from the top edge
  for (let i = 0; i < 210; i++) {
    const t = rnd() * Math.PI;
    const r = Math.sqrt(rnd());
    const x = cx + Math.cos(t) * rx * r;
    const y = Math.sin(t) * ry * r;
    // strands lie roughly along the curve, with some jitter
    const tangent = (Math.atan2(Math.cos(t) * ry, -Math.sin(t) * rx) * 180) / Math.PI;
    push(x, y, 14 + rnd() * 16, tangent + (rnd() - 0.5) * 70, 1.1 + rnd() * 1.1, 0.9);
  }
  // Loose strands sticking out past the edge
  for (let i = 0; i < 34; i++) {
    const t = rnd() * Math.PI;
    const x = cx + Math.cos(t) * (rx + 2 + rnd() * 10);
    const y = Math.sin(t) * (ry + 2 + rnd() * 9);
    push(x, y, 12 + rnd() * 14, (Math.atan2(Math.sin(t) * ry, Math.cos(t) * rx) * 180) / Math.PI + (rnd() - 0.5) * 80, 1 + rnd(), 0.85);
  }
  return out;
};

const HAY = buildHay();

/** Scattered straw piled in a semicircle along the top of the hero card. */
export const HayTop: React.FC = () => (
  <svg
    className="absolute left-0 top-0 w-full pointer-events-none"
    viewBox="0 0 340 66"
    preserveAspectRatio="xMidYMin slice"
    aria-hidden="true"
  >
    <path d="M12 0a158 40 0 0 0 316 0z" fill="#E0B25A" opacity="0.5" />
    {HAY.map((h, i) => (
      <line
        key={i}
        x1={h.x1}
        y1={h.y1}
        x2={h.x2}
        y2={h.y2}
        stroke={h.c}
        strokeWidth={h.w}
        strokeLinecap="round"
        opacity={h.o}
      />
    ))}
  </svg>
);

const CHICK_W = 40;
const CHICK_H = 34;

/** The chick drawing on its own. Hops and swings its legs when `walking`, otherwise pecks. */
export const ChickFigure: React.FC<{ walking?: boolean; inPlace?: boolean; width?: number; height?: number }> = ({
  walking: walkingProp = false,
  inPlace = false, // stand still: only the legs move
  width = CHICK_W,
  height = CHICK_H,
}) => {
  const walking = walkingProp || inPlace;
  return (
  <div
    style={{
      animation: inPlace ? 'none' : walking ? 'pl-hop 0.35s ease-in-out infinite' : 'pl-peck 1.6s ease-in-out infinite',
      transformOrigin: '70% 90%',
    }}
  >
      <style>{`
        @keyframes pl-step { 0% { transform: translate(-3px,0) } 25% { transform: translate(0,-3px) } 50% { transform: translate(3px,0) } 100% { transform: translate(-3px,0) } }
        @keyframes pl-hop { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-4px) } }
        @keyframes pl-peck { 0%,70%,100% { transform: rotate(0) } 80% { transform: rotate(14deg) } }
      `}</style>
          <svg width={width} height={height} viewBox="0 0 60 51" fill="none">
            <ellipse cx="30" cy="48.5" rx="15" ry="2" fill="#000" opacity="0.12" />
            {/* legs: swing alternately while walking */}
            <g
              stroke="#f08a1c"
              strokeWidth="2.9"
              strokeLinecap="round"
              style={{
                animation: walking ? `pl-step ${inPlace ? 0.8 : 0.5}s linear infinite` : 'none',
              }}
            >
              <path d="M25 38v8.5M25 46.5h4.6" />
            </g>
            <g
              stroke="#f08a1c"
              strokeWidth="2.9"
              strokeLinecap="round"
              style={{
                animation: walking ? `pl-step ${inPlace ? 0.8 : 0.5}s linear ${inPlace ? -0.4 : -0.25}s infinite` : 'none',
              }}
            >
              <path d="M35 38v8.5M35 46.5h4.6" />
            </g>
            {/* body + head */}
            <ellipse cx="29" cy="30" rx="18" ry="14" fill="#ffd83d" />
            <circle cx="38" cy="18" r="11" fill="#ffd83d" />
            <ellipse cx="31" cy="35" rx="11" ry="7" fill="#ffe985" />
            {/* tuft */}
            <ellipse cx="35" cy="6.5" rx="2.2" ry="3.4" fill="#ffd83d" transform="rotate(-18 35 6.5)" />
            <ellipse cx="39.5" cy="6" rx="2.2" ry="3.6" fill="#ffd83d" />
            <ellipse cx="43.5" cy="7" rx="2" ry="3.2" fill="#ffd83d" transform="rotate(20 43.5 7)" />
            {/* wing */}
            <path d="M14 28c1-6 8-9 15-6 2 5-1 12-8 13-5 .5-8-2-7-7z" fill="#f7bd1c" />
            {/* beak */}
            <path d="M47.5 16.5l7 2.8-7 2.9c-1.2-.9-1.2-4.8 0-5.7z" fill="#ff8a1f" />
            {/* eye + cheek */}
            <circle cx="42" cy="21.5" r="2.4" fill="#ff9f80" opacity="0.55" />
            <circle cx="41.5" cy="15.5" r="2.2" fill="#2a1a0c" />
            <circle cx="42.2" cy="14.8" r="0.75" fill="#fff" />
          </svg>
  </div>
  );
};

/** A little chick that wanders randomly around its (positioned) parent. Never intercepts taps. */
export const WanderingChick: React.FC<{ avoidRef?: React.RefObject<HTMLElement | null> }> = ({ avoidRef }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 24, y: 24, faceLeft: false, ms: 0, walking: false });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let timer: number | undefined;
    let cancelled = false;
    let cur = { x: 24, y: 24 };

    // Optional invisible boundary (e.g. a title + description) the chick must never enter or cross
    const forbidden = () => {
      const box = boxRef.current;
      const el = avoidRef?.current;
      if (!box || !el) return null;
      const b = box.getBoundingClientRect();
      const a = el.getBoundingClientRect();
      const pad = 8;
      return { l: a.left - b.left - pad, t: a.top - b.top - pad, r: a.right - b.left + pad, b: a.bottom - b.top + pad };
    };
    const hits = (f: NonNullable<ReturnType<typeof forbidden>>, x: number, y: number) =>
      x < f.r && x + CHICK_W > f.l && y < f.b && y + CHICK_H > f.t;
    const pathClear = (x0: number, y0: number, x1: number, y1: number) => {
      const f = forbidden();
      if (!f) return true;
      for (let i = 0; i <= 24; i++) {
        const k = i / 24;
        if (hits(f, x0 + (x1 - x0) * k, y0 + (y1 - y0) * k)) return false;
      }
      return true;
    };

    const step = () => {
      const box = boxRef.current;
      if (!box || cancelled) return;
      const maxX = Math.max(0, box.clientWidth - CHICK_W);
      const maxY = Math.max(0, box.clientHeight - CHICK_H);
      let nx = cur.x;
      let ny = cur.y;
      let found = false;
      for (let i = 0; i < 40 && !found; i++) {
        const tx = Math.random() * maxX;
        const ty = Math.random() * maxY;
        if (pathClear(cur.x, cur.y, tx, ty)) {
          nx = tx;
          ny = ty;
          found = true;
        }
      }
      if (!found) {
        timer = window.setTimeout(step, 1500);
        return;
      }
      const dist = Math.hypot(nx - cur.x, ny - cur.y);
      const ms = Math.max(900, (dist / 38) * 1000); // ~38px per second
      setPos({ x: nx, y: ny, faceLeft: nx < cur.x, ms, walking: true });
      cur = { x: nx, y: ny };
      timer = window.setTimeout(() => {
        setPos((p) => ({ ...p, walking: false }));
        timer = window.setTimeout(step, 600 + Math.random() * 1600); // rest / peck a moment
      }, ms);
    };

    // Start somewhere outside the boundary
    const box0 = boxRef.current;
    if (box0) {
      const f = forbidden();
      const maxX = Math.max(0, box0.clientWidth - CHICK_W);
      const maxY = Math.max(0, box0.clientHeight - CHICK_H);
      let sx = maxX;
      let sy = maxY;
      for (let i = 0; i < 60; i++) {
        const tx = Math.random() * maxX;
        const ty = Math.random() * maxY;
        if (!f || !hits(f, tx, ty)) {
          sx = tx;
          sy = ty;
          break;
        }
      }
      cur = { x: sx, y: sy };
      setPos({ x: sx, y: sy, faceLeft: false, ms: 0, walking: false });
    }

    timer = window.setTimeout(step, 800);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={boxRef} className="absolute inset-0 z-[5] pointer-events-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute left-0 top-0"
        style={{
          width: CHICK_W,
          height: CHICK_H,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: `transform ${pos.ms}ms ease-in-out`,
        }}
      >
        <div style={{ transform: pos.faceLeft ? 'scaleX(-1)' : 'none' }}>
          <ChickFigure walking={pos.walking} />
        </div>
      </div>
    </div>
  );
};
