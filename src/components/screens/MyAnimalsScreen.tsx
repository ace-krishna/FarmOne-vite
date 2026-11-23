import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useBackLayer } from '../../lib/backStack';
import { SPECIES } from './RegisterAnimalScreen';
import { deleteAnimal, fetchAnimals, getCachedAnimals, type Animal, type Species } from '../../lib/animals';

type Filter = 'all' | 'cow' | 'buffalo' | 'goat' | 'hen';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cow', label: 'COWS' },
  { id: 'buffalo', label: 'BUFFALO' },
  { id: 'goat', label: 'GOATS' },
  { id: 'hen', label: 'POULTRY' },
];

const SPECIES_LABEL: Record<Species, string> = { cow: 'Cow', buffalo: 'Buffalo', goat: 'Goat', hen: 'Hen' };

// Same icons as the registered-animals row on the home screen
const SPECIES_EMOJI: Record<Species, string> = { cow: '🐮', buffalo: '🦬', goat: '🐐', hen: '🐔' };

/** The coat colour picked at registration: its swatch colour and a short name. */
const coatOf = (a: Animal) => {
  const sw = SPECIES.find((s) => s.id === a.species)?.swatches.find((w) => w.value === a.coat_color);
  return {
    color: sw?.color ?? '#bfc9c3',
    light: sw?.light ?? false,
    spotted: sw?.spotted ?? false,
    label: sw ? sw.title.split(' / ')[0] : a.coat_color.replace(/-/g, ' '),
  };
};

const animalName = (a: Animal) => a.name || a.ear_tag || SPECIES_LABEL[a.species];

/** "Indigenous cow", "Layer hen", "Buffalo" … the breed line shown under the name. */
const breedLabel = (a: Animal) => {
  if (a.species === 'cow') {
    if (a.breed === 'indigenous') return 'Indigenous cow';
    if (a.breed === 'crossbred') return 'Crossbred cow';
    return 'Cow';
  }
  if (a.species === 'hen') {
    if (a.hen_purpose === 'layer') return 'Layer hen';
    if (a.hen_purpose === 'broiler') return 'Broiler hen';
    return 'Hen';
  }
  return SPECIES_LABEL[a.species];
};

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? '' : 's'}`;

/** Hens are young-lived, so they show weeks/days; everything else shows years/months. */
const ageLabel = (a: Animal, today = new Date()) => {
  const [y, m, d] = a.dob.split('-').map(Number);
  const dob = new Date(y, m - 1, d);
  if (a.species === 'hen') {
    const days = Math.max(0, Math.floor((today.getTime() - dob.getTime()) / 86400000));
    const w = Math.floor(days / 7);
    const rest = days % 7;
    if (w === 0) return plural(rest, 'day');
    return rest ? `${plural(w, 'wk')} ${plural(rest, 'day')}` : plural(w, 'wk');
  }
  let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
  if (today.getDate() < dob.getDate()) months -= 1;
  months = Math.max(0, months);
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  if (yrs === 0) return mos === 0 ? 'Newborn' : plural(mos, 'month');
  return mos ? `${plural(yrs, 'yr')} ${plural(mos, 'mo')}` : plural(yrs, 'yr');
};

const Icon: React.FC<{ name: string; size?: number; className?: string }> = ({ name, size = 20, className = '' }) => (
  <span className={`material-symbols-outlined ${className}`} style={{ fontSize: size }}>
    {name}
  </span>
);

const GenderBadge: React.FC<{ sex: Animal['sex']; large?: boolean }> = ({ sex, large }) => {
  const male = sex === 'male';
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-bold shrink-0 shadow-[0_1px_4px_rgba(0,0,0,0.18)] ${large ? 'px-2.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[10px]'}`}
      style={male ? { background: '#dbe1ff', color: '#00174b' } : { background: '#ffdad6', color: '#93000a' }}
    >
      <Icon name={male ? 'male' : 'female'} size={12} />
      {male ? 'Male' : 'Female'}
    </span>
  );
};

const HOLD_MS = 1000;

/** Delete button that must be held down: a red fill sweeps across, then it bursts and confirms. */
const HoldToDelete: React.FC<{ onConfirm: () => void; busy: boolean }> = ({ onConfirm, busy }) => {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [burst, setBurst] = useState(0); // bumps on every burst so the animation replays
  const raf = useRef<number | null>(null);
  const done = useRef(false);
  const resetTimer = useRef<number | null>(null);

  const stopRaf = () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
  };
  useEffect(
    () => () => {
      stopRaf();
      if (resetTimer.current !== null) window.clearTimeout(resetTimer.current);
    },
    [],
  );

  const complete = () => {
    done.current = true;
    setHolding(false);
    setProgress(1);
    setBurst((n) => n + 1);
    try {
      navigator.vibrate?.([20, 30, 40]);
    } catch {
      /* haptics are optional */
    }
    onConfirm();
    resetTimer.current = window.setTimeout(() => {
      done.current = false;
      setProgress(0);
    }, 700);
  };

  const start = () => {
    if (busy || done.current || raf.current !== null) return;
    setHolding(true);
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / HOLD_MS);
      setProgress(p);
      if (p >= 1) {
        raf.current = null;
        complete();
      } else {
        raf.current = requestAnimationFrame(tick);
      }
    };
    raf.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (done.current) return;
    stopRaf();
    setHolding(false);
    setProgress(0); // drains back through the CSS transition
  };

  return (
    <motion.button
      type="button"
      aria-label="Hold to delete"
      disabled={busy}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={(e) => {
        if (e.key === 'Enter' || e.key === ' ') cancel();
      }}
      onBlur={cancel}
      key={burst}
      initial={burst ? { scale: 1 } : false}
      animate={burst ? { scale: [1, 1.14, 1] } : { scale: 1 }}
      transition={{ duration: 0.35 }}
      className="relative h-12 w-[116px] shrink-0 rounded-xl bg-rose-50 text-rose-600 border border-rose-200 shadow-[0_3px_8px_rgba(0,0,0,0.16)] select-none touch-manipulation disabled:opacity-70"
    >
      {/* red fill that sweeps left to right while held */}
      <span className="absolute inset-0 rounded-xl overflow-hidden" aria-hidden>
        <span
          className="absolute inset-y-0 left-0 bg-rose-500"
          style={{ width: `${progress * 100}%`, transition: holding ? 'none' : 'width 0.25s ease-out' }}
        />
      </span>
      {/* burst particles */}
      {burst > 0 &&
        Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * Math.PI * 2;
          return (
            <motion.span
              key={`${burst}-${i}`}
              aria-hidden
              className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-rose-500 pointer-events-none"
              initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
              animate={{ x: Math.cos(angle) * 46, y: Math.sin(angle) * 30, opacity: 0, scale: 0.3 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          );
        })}
      <span
        className="relative flex items-center justify-center gap-1 text-[11px] font-semibold leading-tight"
        style={{ color: progress > 0.5 ? '#ffffff' : undefined }}
      >
        <Icon name="delete" size={18} />
        {busy ? 'Deleting…' : 'Hold to delete'}
      </span>
    </motion.button>
  );
};

interface Props {
  onBack: () => void;
}

export const MyAnimalsScreen: React.FC<Props> = ({ onBack }) => {
  const [animals, setAnimals] = useState<Animal[]>(getCachedAnimals);
  const [filter, setFilter] = useState<Filter>('all');
  const [selected, setSelected] = useState<Animal | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useBackLayer(selected !== null, () => setSelected(null));

  useEffect(() => {
    let cancelled = false;
    fetchAnimals()
      .then((list) => {
        if (!cancelled) setAnimals(list);
      })
      .catch((err) => console.warn('Could not refresh animals (showing saved copy):', err));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(t);
  }, [toast]);

  const count = (f: Filter) => (f === 'all' ? animals.length : animals.filter((a) => a.species === f).length);
  const visible = filter === 'all' ? animals : animals.filter((a) => a.species === filter);

  const closeSheet = () => {
    // Close through history so the phone Back stack stays in sync
    window.history.back();
  };

  const handleDelete = async () => {
    if (!selected) return;
    const target = selected;
    setDeleting(true);
    try {
      await deleteAnimal(target.id);
      setAnimals((list) => list.filter((a) => a.id !== target.id));
      setToast(`${animalName(target)}'s record has been deleted`);
      setSelected(null);
    } catch (err) {
      console.warn('Could not delete animal:', err);
      setToast('Could not delete. Check your connection and try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col min-h-0 text-[#111c2d] font-['Inter',sans-serif] relative"
      style={{ background: 'linear-gradient(180deg, #F7C98B 0%, #F9DDA0 45%, #F6EDB5 100%)' }}
    >
      {/* Header */}
      <header className="shrink-0 h-14 px-3 flex items-center gap-1 bg-white/70 backdrop-blur-md border-b border-white/30 shadow-[0_4px_20px_rgba(0,0,0,0.04)] z-10">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 text-[#006714] shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:bg-white transition"
        >
          <Icon name="arrow_back" size={22} />
        </button>
        <h1 className="text-[16px] leading-[22px] font-semibold tracking-[-0.01em] truncate">Registered Animals</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-3 pt-3 pb-6 scrollbar-none">
        {/* Filter chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1 mb-3 scrollbar-none">
          {FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap transition-all ${
                  active ? 'bg-[#a8dfa4] text-[#00390a] shadow-[0_2px_6px_rgba(0,0,0,0.22)]' : 'bg-[#e1f3df] text-[#2f5a2d] shadow-[0_2px_5px_rgba(0,0,0,0.14)] hover:bg-[#d2ecd0]'
                }`}
              >
                {f.id === 'all' ? `All (${count('all')})` : f.label}
              </button>
            );
          })}
        </div>

        {/* Animal cards */}
        {visible.length > 0 ? (
          <div className="flex flex-col gap-3">
            {/* Column labels, so the coat-colour circle needs no caption on every card */}
            <div className="flex items-center justify-between px-3 -mb-1 text-[10px] font-bold uppercase tracking-wider text-[#404945]">
              <span>Animal name</span>
              <span>Coat color</span>
            </div>
            {visible.map((a) => (
              <motion.article
                key={a.id}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelected(a)}
                style={{ background: '#FFFDF8' }}
                className="rounded-xl p-2.5 shadow-[0_3px_10px_rgba(0,0,0,0.16)] hover:shadow-[0_5px_14px_rgba(0,0,0,0.2)] transition-shadow cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-full bg-[#8fa998] shrink-0 shadow-[0_2px_6px_rgba(0,0,0,0.25)] flex items-center justify-center" aria-hidden>
                      <span className="text-[24px] leading-none">{SPECIES_EMOJI[a.species]}</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="text-[18px] leading-[22px] font-bold tracking-[-0.015em] truncate">{animalName(a)}</h2>
                        <GenderBadge sex={a.sex} />
                      </div>
                      <p className="text-[12px] leading-4 text-[#3f4a3c] truncate">
                        {breedLabel(a)} • {ageLabel(a)}
                      </p>
                    </div>
                  </div>
                  {(() => {
                    const c = coatOf(a);
                    return (
                      <span className="flex items-center shrink-0" title={c.label}>
                        <span
                          className={`w-7 h-7 rounded-full shadow-[0_2px_5px_rgba(0,0,0,0.25)] ${c.light ? 'border border-gray-300' : 'border border-black/10'}`}
                          style={{
                            backgroundColor: c.color,
                            backgroundImage: c.spotted
                              ? 'radial-gradient(circle at 30% 30%, #1A1A1A 0 3px, transparent 3.5px), radial-gradient(circle at 72% 40%, #1A1A1A 0 2.5px, transparent 3px), radial-gradient(circle at 45% 78%, #1A1A1A 0 3px, transparent 3.5px)'
                              : undefined,
                          }}
                          aria-hidden
                        />
                      </span>
                    );
                  })()}
                </div>
              </motion.article>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center text-center py-12 px-4 bg-white rounded-xl shadow-[0_3px_10px_rgba(0,0,0,0.16)]">
            <div className="w-16 h-16 rounded-full bg-[#e7eeff] flex items-center justify-center text-[#6f7a6a] mb-3">
              <Icon name="pets" size={32} />
            </div>
            <h3 className="text-[16px] font-semibold mb-1">No animals found</h3>
            <p className="text-[12px] text-[#3f4a3c] max-w-[240px]">
              {animals.length === 0 ? 'Register your first animal from the home screen.' : 'None of your animals match this filter.'}
            </p>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-4 px-3 py-2 rounded-full bg-[#dee8ff] text-[#006714] text-[12px] font-semibold"
              >
                Show all
              </button>
            )}
          </div>
        )}
      </main>

      {/* Animal profile pop-up */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="profile"
            className="absolute inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-[#263143]/40 backdrop-blur-sm" onClick={closeSheet} />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label={`${animalName(selected)} profile`}
              className="relative w-full max-w-[308px] bg-[#f9f9ff] rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.35)] overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            >
              <div className="px-3 pt-3 pb-4 flex flex-col gap-3">
                <div
                  className="relative flex flex-col items-center text-center rounded-2xl p-5 shadow-[0_3px_10px_rgba(0,0,0,0.16)]"
                  style={{ background: '#FFFDF8' }}
                >
                  <button
                    type="button"
                    onClick={closeSheet}
                    aria-label="Close profile"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-white text-[#3f4a3c] shadow-[0_2px_6px_rgba(0,0,0,0.2)] flex items-center justify-center active:scale-95 transition"
                  >
                    <Icon name="close" size={16} />
                  </button>
                  <div className="relative mb-3">
                    <div
                      className="w-24 h-24 rounded-full bg-[#8fa998] flex items-center justify-center"
                      style={{ boxShadow: `0 0 0 4px ${selected.sex === 'male' ? '#e0edff' : '#fce7f3'}, 0 6px 14px rgba(0,0,0,0.25)` }}
                      aria-hidden
                    >
                      <span className="text-[48px] leading-none">{SPECIES_EMOJI[selected.species]}</span>
                    </div>
                    <div
                      className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-md text-white"
                      style={{ background: selected.sex === 'male' ? '#2b67ef' : '#e11d48' }}
                    >
                      <Icon name={selected.sex === 'male' ? 'male' : 'female'} size={16} />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-1 max-w-full">
                    <h2 className="text-[24px] leading-[30px] font-bold tracking-[-0.02em] truncate">{animalName(selected)}</h2>
                    <GenderBadge sex={selected.sex} large />
                  </div>
                  <p className="text-[14px] text-[#3f4a3c]">
                    {breedLabel(selected)} • {ageLabel(selected)}
                  </p>
                  {(() => {
                    const c = coatOf(selected);
                    return (
                      <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 shadow-[0_2px_5px_rgba(0,0,0,0.14)] text-[12px] font-semibold text-[#3f4a3c]">
                        Coat color:
                        <span
                          className={`w-5 h-5 rounded-full shadow-[0_1px_4px_rgba(0,0,0,0.25)] ${c.light ? 'border border-gray-300' : 'border border-black/10'}`}
                          style={{
                            backgroundColor: c.color,
                            backgroundImage: c.spotted
                              ? 'radial-gradient(circle at 30% 30%, #1A1A1A 0 2.5px, transparent 3px), radial-gradient(circle at 72% 40%, #1A1A1A 0 2px, transparent 2.5px), radial-gradient(circle at 45% 78%, #1A1A1A 0 2.5px, transparent 3px)'
                              : undefined,
                          }}
                          aria-hidden
                        />
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setToast('This feature will be available soon!')}
                    className="flex-1 h-12 rounded-xl bg-[#a9c9f5] hover:bg-[#98bdef] text-[#0b2a5b] text-[14px] font-bold tracking-[0.02em] flex items-center justify-center gap-2 shadow-[0_3px_8px_rgba(0,0,0,0.22)] active:scale-[0.98] transition"
                  >
                    <Icon name="calendar_month" size={20} />
                    Book Vet Visit
                  </button>
                  <HoldToDelete onConfirm={handleDelete} busy={deleting} />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="absolute inset-x-6 bottom-6 z-[70] mx-auto max-w-[320px] px-4 py-2.5 rounded-2xl text-center text-[12px] font-semibold leading-snug text-[#1F4E7A] border border-[#bcd9f2]/80 backdrop-blur-md shadow-[0_8px_22px_-8px_rgba(60,120,190,0.45)]"
            style={{ background: 'rgba(214,234,250,0.92)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
