import React, { useState } from 'react';
import { motion } from 'motion/react';

// Each dock tab is a separate screen, so the pill can't be shared between them. Instead the new
// screen's pill starts where the previous tab's pill was and glides over to its own tab.
let lastIndex = 0;
let cachedFrom = 0;
let changedAt = 0;
const fromIndex = (index: number) => {
  const now = Date.now();
  if (index !== lastIndex) {
    cachedFrom = lastIndex;
    lastIndex = index;
    changedAt = now;
  }
  return now - changedAt < 300 ? cachedFrom : index;
};

export const DockPill: React.FC<{ index: number }> = ({ index }) => {
  const [from] = useState(() => fromIndex(index));
  return (
    <motion.span
      className="absolute inset-0 rounded-full"
      initial={{ x: `${(from - index) * 100}%` }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      style={{
        background: 'linear-gradient(135deg, rgba(19,78,63,0.14) 0%, rgba(181,239,218,0.42) 100%)',
        border: '1px solid rgba(255,255,255,0.95)',
        boxShadow:
          'rgba(19,78,63,0.12) 0px 4px 16px, rgba(255,255,255,0.95) 0px 1px 2px inset, rgba(19,78,63,0.05) 0px -1px 2px inset',
      }}
    />
  );
};
