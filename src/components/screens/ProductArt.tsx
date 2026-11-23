import React from 'react';

/** Hand-drawn vector "product shots" for the marketplace (shaded, with a soft ground shadow). */

const Shadow = () => <ellipse cx="50" cy="91" rx="30" ry="4.5" fill="#000" opacity="0.18" />;

const Sack: React.FC<{ id: string; c1: string; c2: string; label: string; sub: string; band: string; children?: React.ReactNode }> = ({ id, c1, c2, label, sub, band, children }) => (
  <>
    <defs>
      <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={c2} />
        <stop offset="0.45" stopColor={c1} />
        <stop offset="1" stopColor={c2} />
      </linearGradient>
    </defs>
    <Shadow />
    <path d="M24 22 Q50 14 76 22 L80 84 Q50 92 20 84 Z" fill={`url(#${id}-b)`} />
    <path d="M24 22 Q50 30 76 22 L77 28 Q50 36 23 28 Z" fill="#000" opacity="0.14" />
    <path d="M24 22 Q50 14 76 22" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.2" strokeDasharray="2 2" />
    <rect x="21" y="44" width="58" height="26" fill={band} opacity="0.95" transform="skewY(0)" />
    <text x="50" y="55" textAnchor="middle" fontSize="8.5" fontWeight="800" fill="#fff" fontFamily="Inter,sans-serif">{label}</text>
    <text x="50" y="64.5" textAnchor="middle" fontSize="5.4" fontWeight="600" fill="#fff" opacity="0.9" fontFamily="Inter,sans-serif">{sub}</text>
    {children}
    <path d="M30 26 Q28 55 31 82" stroke="#fff" strokeOpacity="0.28" strokeWidth="3" fill="none" strokeLinecap="round" />
  </>
);

const Cow = () => (
  <g transform="translate(36 28) scale(0.28)" fill="#fff">
    <ellipse cx="50" cy="52" rx="38" ry="24" />
    <circle cx="26" cy="38" r="15" />
    <circle cx="20" cy="26" r="5" />
    <circle cx="34" cy="26" r="5" />
    <rect x="22" y="70" width="8" height="26" rx="3" />
    <rect x="66" y="70" width="8" height="26" rx="3" />
    <circle cx="48" cy="46" r="7" fill="#3b2f2a" opacity="0.7" />
    <circle cx="68" cy="58" r="6" fill="#3b2f2a" opacity="0.7" />
  </g>
);

const Hen = () => (
  <g transform="translate(37 25) scale(0.26)" fill="#fff">
    <ellipse cx="50" cy="58" rx="34" ry="26" />
    <circle cx="74" cy="32" r="14" />
    <path d="M70 18 q4 -10 8 0 q4 -8 7 2 z" fill="#ef4444" />
    <path d="M86 32 l14 4 l-14 4 z" fill="#f59e0b" />
    <path d="M18 54 q-14 -6 -12 -22 q16 4 22 20 z" />
    <circle cx="77" cy="30" r="2.6" fill="#222" />
  </g>
);

const Bottle: React.FC = () => (
  <>
    <defs>
      <linearGradient id="p4-b" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#1e5fa8" />
        <stop offset="0.4" stopColor="#4e9ae0" />
        <stop offset="1" stopColor="#1e5fa8" />
      </linearGradient>
    </defs>
    <Shadow />
    <rect x="42" y="8" width="16" height="12" rx="2" fill="#f1f5f9" />
    <rect x="42" y="12" width="16" height="1.4" fill="#94a3b8" />
    <rect x="45" y="20" width="10" height="8" fill="#3d86cf" />
    <path d="M45 28 Q26 32 26 46 L26 82 Q26 90 34 90 L66 90 Q74 90 74 82 L74 46 Q74 32 55 28 Z" fill="url(#p4-b)" />
    <rect x="29" y="46" width="42" height="30" rx="3" fill="#fff" />
    <rect x="29" y="46" width="42" height="7" rx="3" fill="#f59e0b" />
    <text x="50" y="63" textAnchor="middle" fontSize="7" fontWeight="800" fill="#1e3a5f" fontFamily="Inter,sans-serif">TEAT DIP</text>
    <text x="50" y="71" textAnchor="middle" fontSize="4.6" fontWeight="600" fill="#475569" fontFamily="Inter,sans-serif">Iodine 1% · 500 ml</text>
    <path d="M33 38 Q31 60 33 84" stroke="#fff" strokeOpacity="0.4" strokeWidth="2.4" fill="none" strokeLinecap="round" />
  </>
);

const art: Record<string, React.ReactNode> = {
  p1: (
    <Sack id="p1" c1="#e0a43a" c2="#b9761c" label="CATTLE FEED" sub="Premium pellets · 50 kg" band="#7a4a12">
      <Cow />
      <g fill="#8b5a1b">
        <ellipse cx="14" cy="88" rx="3" ry="1.6" /><ellipse cx="22" cy="91" rx="3" ry="1.6" /><ellipse cx="84" cy="89" rx="3" ry="1.6" /><ellipse cx="90" cy="86" rx="2.6" ry="1.4" />
      </g>
    </Sack>
  ),
  p2: (
    <>
      <defs>
        <linearGradient id="p2-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#1f8f6b" /><stop offset="0.45" stopColor="#3fcf9f" /><stop offset="1" stopColor="#1f8f6b" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M24 30 L76 30 L80 84 Q50 92 20 84 Z" fill="url(#p2-b)" />
      <path d="M24 30 L76 30 L76 36 L24 36 Z" fill="#0f5c44" />
      <path d="M26 24 L74 24 L76 30 L24 30 Z" fill="#e2e8f0" />
      <rect x="22" y="46" width="56" height="26" fill="#fff" opacity="0.96" />
      <text x="50" y="57" textAnchor="middle" fontSize="7.4" fontWeight="800" fill="#0f5c44" fontFamily="Inter,sans-serif">MINERAL MIX</text>
      <text x="50" y="66" textAnchor="middle" fontSize="5" fontWeight="600" fill="#475569" fontFamily="Inter,sans-serif">with Calcium · 1 kg</text>
      <path d="M30 40 Q28 60 31 80" stroke="#fff" strokeOpacity="0.35" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  p3: (
    <Sack id="p3" c1="#f08a4b" c2="#c4581f" label="LAYER FEED" sub="Crumble · 25 kg" band="#8a3a10">
      <Hen />
    </Sack>
  ),
  p4: <Bottle />,
  p5: (
    <>
      <Shadow />
      <rect x="14" y="44" width="72" height="42" rx="5" fill="#7c5ad6" />
      <rect x="14" y="44" width="72" height="12" rx="5" fill="#5f3fb8" />
      <rect x="20" y="60" width="60" height="20" rx="3" fill="#fff" />
      <text x="50" y="70" textAnchor="middle" fontSize="7" fontWeight="800" fill="#4a2fa0" fontFamily="Inter,sans-serif">FMD VACCINE</text>
      <text x="50" y="77" textAnchor="middle" fontSize="4.6" fontWeight="600" fill="#64748b" fontFamily="Inter,sans-serif">10 doses · keep 2–8°C</text>
      {[28, 42, 56].map((x) => (
        <g key={x}>
          <rect x={x} y="22" width="10" height="26" rx="2" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="0.8" />
          <rect x={x} y="32" width="10" height="16" rx="1.5" fill="#38bdf8" opacity="0.8" />
          <rect x={x - 0.5} y="17" width="11" height="7" rx="1.5" fill="#ef4444" />
        </g>
      ))}
      <g transform="rotate(-28 78 30)">
        <rect x="66" y="26" width="26" height="7" rx="2" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
        <rect x="58" y="28.5" width="9" height="2" fill="#94a3b8" />
        <rect x="92" y="25" width="2.5" height="9" fill="#64748b" />
      </g>
    </>
  ),
  p6: (
    <>
      <defs>
        <linearGradient id="p6-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8d99a4" /><stop offset="0.3" stopColor="#f1f5f9" /><stop offset="0.6" stopColor="#b6c0c9" /><stop offset="1" stopColor="#7d8995" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M22 40 Q50 -4 78 40" fill="none" stroke="#6b7682" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="50" cy="32" rx="30" ry="6" fill="#aab4be" />
      <path d="M20 32 L26 84 Q50 94 74 84 L80 32 Q50 40 20 32 Z" fill="url(#p6-b)" />
      <ellipse cx="50" cy="32" rx="30" ry="6" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="1.2" />
      <ellipse cx="50" cy="33" rx="26" ry="4" fill="#5b6672" opacity="0.5" />
      <path d="M26 46 Q50 52 74 46" stroke="#fff" strokeOpacity="0.45" fill="none" strokeWidth="1" />
      <path d="M28 58 Q50 64 72 58" stroke="#fff" strokeOpacity="0.3" fill="none" strokeWidth="1" />
      <text x="50" y="74" textAnchor="middle" fontSize="6" fontWeight="800" fill="#475569" opacity="0.75" fontFamily="Inter,sans-serif">10 L</text>
    </>
  ),
  p7: (
    <>
      <defs>
        <linearGradient id="p7-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fafc" /><stop offset="0.5" stopColor="#aeb8c2" /><stop offset="1" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <Shadow />
      <g transform="rotate(-12 50 50)">
        <path d="M14 38 L84 30 Q92 40 84 54 L14 58 Z" fill="url(#p7-b)" stroke="#8b97a3" strokeWidth="0.8" />
        <path d="M14 38 L84 30 L84 33 L14 41 Z" fill="#fff" opacity="0.7" />
        {[24, 44, 64].map((x) => <circle key={x} cx={x} cy="48" r="2.6" fill="#64748b" />)}
      </g>
      <g transform="rotate(6 50 70)">
        <path d="M16 66 L82 62 Q90 70 82 80 L16 84 Z" fill="url(#p7-b)" stroke="#8b97a3" strokeWidth="0.8" />
        {[26, 48, 70].map((x) => <circle key={x} cx={x} cy="73" r="2.4" fill="#64748b" />)}
      </g>
    </>
  ),
  p8: (
    <>
      <Shadow />
      <g transform="rotate(-35 50 50)">
        <rect x="10" y="40" width="64" height="16" rx="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="0.8" />
        <rect x="54" y="43" width="14" height="10" rx="2" fill="#0f766e" />
        <text x="61" y="50.8" textAnchor="middle" fontSize="5.4" fontWeight="800" fill="#a7f3d0" fontFamily="monospace">38.6</text>
        <path d="M74 44 L92 48 L74 52 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="46" cy="48" r="3" fill="#14b8a6" />
        <rect x="14" y="44" width="26" height="2" rx="1" fill="#fff" opacity="0.8" />
      </g>
    </>
  ),
  p9: (
    <Sack id="p9" c1="#f4cf45" c2="#c89c12" label="CHICK FEED" sub="Starter · 10 kg" band="#8a6a05">
      <g transform="translate(40 26) scale(0.2)">
        <circle cx="50" cy="55" r="38" fill="#fff6bf" />
        <circle cx="50" cy="30" r="22" fill="#fff6bf" />
        <path d="M44 34 l-8 8 l16 0 z" fill="#f59e0b" />
        <circle cx="42" cy="26" r="3.2" fill="#222" /><circle cx="60" cy="26" r="3.2" fill="#222" />
        <path d="M44 34 l12 0 l-6 9 z" fill="#f59e0b" />
      </g>
    </Sack>
  ),
  p10: (
    <>
      <defs>
        <linearGradient id="p10-b" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4f9a2f" /><stop offset="0.5" stopColor="#7cc455" /><stop offset="1" stopColor="#4f9a2f" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M22 16 L78 16 L78 86 Q50 91 22 86 Z" fill="url(#p10-b)" />
      <path d="M22 16 L78 16 L78 24 L22 24 Z" fill="#2f6b17" />
      <path d="M22 18 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4 l4 -4 l4 4" fill="none" stroke="#fff" strokeOpacity="0.6" strokeWidth="1" />
      <rect x="27" y="52" width="46" height="26" rx="3" fill="#fff" />
      <text x="50" y="63" textAnchor="middle" fontSize="6.4" fontWeight="800" fill="#2f6b17" fontFamily="Inter,sans-serif">FODDER SEED</text>
      <text x="50" y="71" textAnchor="middle" fontSize="4.6" fontWeight="600" fill="#64748b" fontFamily="Inter,sans-serif">Maize + Bajra · 2 kg</text>
      <g transform="translate(34 24)">
        <path d="M16 24 Q16 8 24 4 Q28 16 16 24 Z" fill="#fde047" />
        <path d="M16 24 Q8 12 0 12 Q4 24 16 24 Z" fill="#bef264" />
        <path d="M16 24 Q24 14 34 16 Q30 26 16 24 Z" fill="#a3e635" />
        <rect x="15.2" y="22" width="1.6" height="8" fill="#3f6212" />
      </g>
    </>
  ),
  p11: (
    <>
      <defs>
        <linearGradient id="p11-j" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#7cc0f0" stopOpacity="0.9" /><stop offset="0.4" stopColor="#d9efff" stopOpacity="0.95" /><stop offset="1" stopColor="#5aa8e0" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <Shadow />
      <path d="M28 10 Q28 6 32 6 L68 6 Q72 6 72 10 L72 52 L28 52 Z" fill="url(#p11-j)" stroke="#5aa8e0" strokeWidth="0.8" />
      <rect x="28" y="30" width="44" height="22" fill="#4a90d9" opacity="0.55" />
      <path d="M32 12 Q31 30 33 46" stroke="#fff" strokeOpacity="0.7" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <path d="M22 52 L78 52 L86 76 Q50 84 14 76 Z" fill="#d1491f" />
      <path d="M14 76 Q50 84 86 76 L88 82 Q50 92 12 82 Z" fill="#a3340f" />
      <ellipse cx="50" cy="58" rx="22" ry="4" fill="#4a90d9" />
      <ellipse cx="50" cy="57" rx="22" ry="3.2" fill="#9bd0f5" opacity="0.8" />
      <rect x="40" y="48" width="20" height="5" rx="1" fill="#e2e8f0" />
    </>
  ),
  p12: (
    <>
      <Shadow />
      <path d="M16 78 L30 36 Q34 28 40 32 L46 56 Z" fill="#e0813b" />
      <path d="M20 76 L46 56 L52 62 L32 84 Z" fill="#c76b25" />
      <path d="M30 36 Q36 22 44 24 L50 40 Z" fill="#e8955a" />
      {[0, 1, 2, 3].map((i) => <rect key={i} x={36 + i * 3.2} y={30 - i * 1.4} width="2" height="10" rx="1" fill="#f1b27f" transform={`rotate(16 ${37 + i * 3.2} 35)`} />)}
      <g transform="rotate(-18 66 46)">
        <rect x="52" y="14" width="6" height="44" rx="3" fill="#ef4444" />
        <rect x="68" y="14" width="6" height="44" rx="3" fill="#ef4444" />
        <path d="M52 14 Q63 -2 74 14 L70 20 Q63 8 56 20 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="0.8" />
        <circle cx="63" cy="30" r="2.4" fill="#475569" />
        <rect x="50" y="52" width="26" height="6" rx="3" fill="#b91c1c" />
      </g>
    </>
  ),
};

art.learn = (
  <>
    <defs>
      <linearGradient id="lr-screen" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bfe9ff" /><stop offset="1" stopColor="#e9f8d6" />
      </linearGradient>
      <linearGradient id="lr-body" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#2b3b44" /><stop offset="1" stopColor="#0f1a20" />
      </linearGradient>
      <radialGradient id="lr-glow" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#fff3a8" stopOpacity="0.95" /><stop offset="1" stopColor="#fff3a8" stopOpacity="0" />
      </radialGradient>
    </defs>
    <ellipse cx="46" cy="92" rx="32" ry="4" fill="#000" opacity="0.22" />
    {/* tablet showing an article */}
    <g transform="rotate(-8 46 56)">
      <rect x="14" y="14" width="64" height="76" rx="9" fill="url(#lr-body)" />
      <rect x="18" y="18" width="56" height="68" rx="6" fill="#fff" />
      {/* hero photo: sky, hills, sun, tiny cow */}
      <rect x="18" y="18" width="56" height="30" rx="6" fill="url(#lr-screen)" />
      <rect x="18" y="38" width="56" height="10" fill="#bfe9ff" opacity="0" />
      <circle cx="62" cy="27" r="4.4" fill="#ffd34d" />
      <path d="M18 44 Q32 30 46 42 Q58 34 74 44 L74 48 L18 48 Z" fill="#7cc65a" />
      <path d="M18 48 Q36 40 54 47 Q64 44 74 48 L74 48 L18 48 Z" fill="#5aa83e" />
      <g transform="translate(31 38) scale(0.13)" fill="#fff"><rect x="6" y="14" width="46" height="24" rx="12" /><rect x="46" y="10" width="18" height="18" rx="8" /><rect x="12" y="34" width="6" height="14" rx="2" /><rect x="40" y="34" width="6" height="14" rx="2" /><ellipse cx="24" cy="22" rx="7" ry="5" fill="#2E2A2B" /></g>
      {/* play badge */}
      <circle cx="46" cy="33" r="7.5" fill="#134e3f" opacity="0.88" />
      <path d="M43.6 29.4 L50.4 33 L43.6 36.6 Z" fill="#fff" />
      {/* title + text lines */}
      <rect x="22" y="53" width="34" height="4" rx="2" fill="#134e3f" />
      <rect x="22" y="60" width="46" height="2.6" rx="1.3" fill="#c7d3cd" />
      <rect x="22" y="65" width="42" height="2.6" rx="1.3" fill="#c7d3cd" />
      <rect x="22" y="70" width="30" height="2.6" rx="1.3" fill="#c7d3cd" />
      <rect x="22" y="76" width="22" height="6" rx="3" fill="#1faf75" />
      <rect x="26" y="78" width="14" height="2" rx="1" fill="#fff" />
    </g>
    {/* idea bulb with a leaf */}
    <circle cx="80" cy="24" r="17" fill="url(#lr-glow)" />
    <path d="M80 12 Q70 13 70 23 Q70 29 75 33 L75 37 L85 37 L85 33 Q90 29 90 23 Q90 13 80 12 Z" fill="#ffe27a" stroke="#f2b705" strokeWidth="0.9" />
    <rect x="75.5" y="37" width="9" height="3.4" rx="1.4" fill="#9aa5ad" />
    <rect x="77" y="40" width="6" height="2.6" rx="1.3" fill="#7b8791" />
    <path d="M80 31 L80 22" stroke="#6b8f1f" strokeWidth="1.3" strokeLinecap="round" />
    <path d="M80 24 Q74 23 73 18 Q79 18 80 24 Z" fill="#6cc04a" />
    <path d="M80 22 Q86 21 87 16 Q81 16 80 22 Z" fill="#8fdc5f" />
    {/* sparkles */}
    <path d="M91 8 l1.4 3.2 3.2 1.4 -3.2 1.4 -1.4 3.2 -1.4 -3.2 -3.2 -1.4 3.2 -1.4 z" fill="#fff" opacity="0.9" />
    <path d="M62 8 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1 z" fill="#fff" opacity="0.7" />
  </>
);

export const ProductArt: React.FC<{ id: string; className?: string }> = ({ id, className }) => (
  <svg viewBox="0 0 100 100" className={className} role="img" aria-hidden="true" preserveAspectRatio="xMidYMid meet">
    {art[id]}
  </svg>
);
