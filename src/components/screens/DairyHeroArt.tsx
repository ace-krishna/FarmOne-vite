import React, { useEffect, useRef, useState } from 'react';

// Shared by the dairy home hero and the featured dairy card on Farm Articles
const GRASS_COLORS = ['#4F8F2E', '#5FA336', '#3F7A25', '#74B544', '#2F6A1E'];

const seeded = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Blade = { x1: number; y1: number; x2: number; y2: number; w: number; c: string };

const buildGrass = (): Blade[] => {
  const rnd = seeded(11);
  const out: Blade[] = [];
  for (let i = 0; i < 150; i++) {
    const x = rnd() * 340;
    const edge = 14 + Math.sin((x / 340) * Math.PI) * 26; // mound deeper in the middle
    const len = 8 + rnd() * (edge - 6);
    out.push({
      x1: x,
      y1: 0,
      x2: x + (rnd() - 0.5) * 9,
      y2: len,
      w: 1.4 + rnd() * 1.6,
      c: GRASS_COLORS[Math.floor(rnd() * GRASS_COLORS.length)],
    });
  }
  return out;
};
const GRASS = buildGrass();

/** Tufts of grass hanging from the top edge of the hero card. */
export const GrassTop: React.FC = () => (
  <svg
    className="absolute left-0 top-0 w-full pointer-events-none"
    viewBox="0 0 340 50"
    preserveAspectRatio="xMidYMin slice"
    aria-hidden="true"
  >
    <path d="M0 0h340v10c-60 14-120 18-170 18S60 24 0 10z" fill="#5FA336" opacity="0.55" />
    {GRASS.map((b, i) => (
      <line key={i} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} stroke={b.c} strokeWidth={b.w} strokeLinecap="round" />
    ))}
  </svg>
);

const COW_W = 72;
const COW_H = 50;

/** The cow drawing on its own. Walks in place when `walking`, otherwise grazes. */
export const CowFigure: React.FC<{ walking?: boolean; inPlace?: boolean; width?: number; height?: number }> = ({
  walking = false,
  inPlace = false, // stand still: only the legs move
  width = COW_W,
  height = COW_H,
}) => {
  const w = walking || inPlace;
  // Legs pivot at the hip (hidden inside the body) and swing in diagonal pairs while walking
  const leg = (x: number, fill: string, delay: string) => (
    <g
      style={{
        transformBox: 'view-box',
        transformOrigin: `${x}px 34px`,
        animation: w ? `dl-leg ${inPlace ? 1.6 : 0.8}s ease-in-out ${inPlace ? (delay === '0s' ? '0s' : '-0.8s') : delay} infinite` : 'none',
      }}
    >
      <rect x={x - 3.4} y="34" width="6.8" height="12" rx="3" fill={fill} />
      <rect x={x - 3.6} y="44" width="7.2" height="5.5" rx="2.2" fill="#4a3428" />
    </g>
  );
  return (
    <div
      style={{
        animation: inPlace ? 'none' : w ? 'dl-bob 0.7s ease-in-out infinite' : 'dl-graze 2.4s ease-in-out infinite',
        transformOrigin: '80% 80%',
      }}
    >
      <style>{`
        @keyframes dl-leg { 0%,100% { transform: rotate(-20deg) } 50% { transform: rotate(20deg) } }
        @keyframes dl-tail { 0%,100% { transform: rotate(-7deg) } 50% { transform: rotate(9deg) } }
        @keyframes dl-bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5px) } }
        @keyframes dl-graze { 0%,60%,100% { transform: rotate(0) } 75% { transform: rotate(10deg) } }
      `}</style>
            <svg width={width} height={height} viewBox="0 0 80 56" fill="none">
              <defs>
                <clipPath id="dl-body">
                  <rect x="12" y="14" width="46" height="24" rx="12" />
                </clipPath>
              </defs>
              <ellipse cx="38" cy="51.5" rx="26" ry="2.4" fill="#1f4a14" opacity="0.18" />
              {/* far legs (darker) then near legs */}
              {leg(28, '#CBD2D4', '0s')}
              {leg(52, '#CBD2D4', '-0.4s')}
              {/* tail */}
              <g style={{ transformBox: 'view-box', transformOrigin: '13px 19px', animation: inPlace ? 'none' : 'dl-tail 1.6s ease-in-out infinite' }}>
                <path d="M13 19C6 20 5 28 7 36" stroke="#2E2A2B" strokeWidth="2" strokeLinecap="round" />
                <ellipse cx="7" cy="38" rx="2.2" ry="3.4" fill="#2E2A2B" />
              </g>
              {/* udder peeks out below the body */}
              <ellipse cx="22" cy="38.5" rx="5" ry="3" fill="#F7B9C6" />
              {leg(22, '#FFFFFF', '-0.4s')}
              {leg(46, '#FFFFFF', '0s')}
              {/* body with patches */}
              <rect x="12" y="14" width="46" height="24" rx="12" fill="#FFFFFF" />
              <g clipPath="url(#dl-body)">
                <rect x="12" y="31" width="46" height="8" fill="#E3E9EC" />
                <ellipse cx="25" cy="20" rx="8" ry="6.5" fill="#2E2A2B" />
                <ellipse cx="47" cy="33" rx="7" ry="5" fill="#2E2A2B" />
                <ellipse cx="38" cy="15" rx="4" ry="2.6" fill="#2E2A2B" />
              </g>
              {/* head */}
              <rect x="54" y="11" width="18" height="20" rx="8" fill="#FFFFFF" />
              <ellipse cx="60" cy="14.5" rx="4.5" ry="3.2" fill="#2E2A2B" />
              <rect x="58" y="21" width="15" height="11" rx="5.5" fill="#F7B9C6" />
              <circle cx="63.5" cy="27" r="1.1" fill="#C77C8E" />
              <circle cx="68.5" cy="27" r="1.1" fill="#C77C8E" />
              <circle cx="64" cy="18.5" r="1.8" fill="#2b2224" />
              <circle cx="64.5" cy="17.9" r="0.6" fill="#FFFFFF" />
              {/* ear + horn */}
              <ellipse cx="55" cy="17" rx="4.5" ry="2.4" fill="#2E2A2B" transform="rotate(-28 55 17)" />
              <path d="M61 11.5c-.5-3.2-2.2-4.8-4.6-5.2" stroke="#F0E2B6" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
    </div>
  );
};

/** A small cow that wanders around its (positioned) parent. Never intercepts taps. */
export const WanderingCow: React.FC = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 24, y: 40, faceLeft: false, ms: 0, walking: false });

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let timer: number | undefined;
    let cancelled = false;
    let cur = { x: 24, y: 40 };

    const step = () => {
      const box = boxRef.current;
      if (!box || cancelled) return;
      const maxX = Math.max(0, box.clientWidth - COW_W);
      const maxY = Math.max(0, box.clientHeight - COW_H);
      const nx = Math.random() * maxX;
      const ny = Math.random() * maxY;
      const dist = Math.hypot(nx - cur.x, ny - cur.y);
      const ms = Math.max(1200, (dist / 28) * 1000); // cows amble
      setPos({ x: nx, y: ny, faceLeft: nx < cur.x, ms, walking: true });
      cur = { x: nx, y: ny };
      timer = window.setTimeout(() => {
        setPos((p) => ({ ...p, walking: false }));
        timer = window.setTimeout(step, 900 + Math.random() * 2200); // graze a moment
      }, ms);
    };

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
          width: COW_W,
          height: COW_H,
          transform: `translate(${pos.x}px, ${pos.y}px)`,
          transition: `transform ${pos.ms}ms ease-in-out`,
        }}
      >
        <div style={{ transform: pos.faceLeft ? 'scaleX(-1)' : 'none' }}>
          <CowFigure walking={pos.walking} />
        </div>
      </div>
    </div>
  );
};
