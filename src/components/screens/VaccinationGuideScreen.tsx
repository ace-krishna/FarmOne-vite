import React, { useEffect, useRef, useState } from 'react';

// Colours and sizes follow the "Cows and buffaloes" design reference.
const C = {
  bg: '#F3F6F1',
  ink: '#1B1F1A',
  muted: '#5E6859',
  line: '#DCE2D8',
  lineSoft: '#E1E5DD',
  green: '#2E7D32',
  greenTint: '#E8F3E8',
  greenInk: '#1F6B25',
  neutralTint: '#EAEEE7',
  neutralInk: '#3F473D',
};

type TabId = 'cattle' | 'goats' | 'hens' | 'safety';
const TABS: { id: TabId; label: string }[] = [
  { id: 'cattle', label: 'Cattle' },
  { id: 'goats', label: 'Goats' },
  { id: 'hens', label: 'Hens' },
  { id: 'safety', label: 'Safety' },
];

interface Chip {
  t: string;
  kind: 'urgent' | 'neutral';
}
interface Vaccine {
  id: string;
  name: string;
  gist: string;
  chips: Chip[];
  doses: { label: string; when: string }[];
  note?: string;
  urgent?: boolean;
}
interface WhenRow {
  when: string;
  what: string;
  detail?: string;
  recurring?: boolean;
}
interface Guide {
  title: string;
  rows: WhenRow[];
  active: Vaccine[];
}

const N = (t: string): Chip => ({ t, kind: 'neutral' });
const URGENT: Chip = { t: 'Urgent', kind: 'urgent' };

const RABIES: Vaccine = {
  id: 'rabies',
  name: 'Rabies (after suspected bite)',
  gist: 'After a bite, a vet-led series. Never auto-scheduled.',
  chips: [URGENT, N('Event-based')],
  doses: [{ label: 'Series after bite', when: 'day 0, 3, 7, 14, 28, 90 (optional)' }],
  note: 'Urgent vet care. Day 0 is the immediate dose, day 3 is the 4th-day dose, day 90 optional.',
  urgent: true,
};

const GUIDES: Record<'cattle' | 'goats', Guide> = {
  cattle: {
    title: 'Cows and buffaloes',
    rows: [
      { when: '3 months', what: 'Theileriosis', detail: '(crossbred, exotic)' },
      { when: '4 months', what: 'FMD, Anthrax', detail: '(endemic areas)' },
      { when: '4–8 months', what: 'Brucellosis', detail: '(female calves only)' },
      { when: '6 months', what: 'HS, Black quarter', detail: '(endemic areas)' },
      { when: 'Every 6 months', what: 'FMD', recurring: true },
      { when: 'Every year', what: 'HS, Black quarter, Anthrax', recurring: true },
    ],
    active: [
      RABIES,
      {
        id: 'fmd',
        name: 'FMD',
        gist: 'From 4 months · booster at +30 days · every 6 months',
        chips: [],
        doses: [
          { label: 'First dose', when: 'at 4 months' },
          { label: 'Booster', when: '30 days after previous dose' },
          { label: 'Repeats', when: 'every 6 months' },
        ],
        note: 'Mar–Apr and Sep–Oct (local campaign dates apply).',
      },
      {
        id: 'hs',
        name: 'HS (haemorrhagic septicaemia)',
        gist: 'From 6 months · every year, before monsoon',
        chips: [N('Endemic areas')],
        doses: [
          { label: 'First dose', when: 'at 6 months' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
        note: 'Before monsoon.',
      },
      {
        id: 'bq',
        name: 'Black quarter (BQ)',
        gist: 'From 6 months · every year, before monsoon',
        chips: [N('Endemic areas')],
        doses: [
          { label: 'First dose', when: 'at 6 months' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
        note: 'Before monsoon.',
      },
      {
        id: 'bruc',
        name: 'Brucellosis',
        gist: 'One dose at 4–8 months · female calves only',
        chips: [N('Female only'), N('One-time')],
        doses: [{ label: 'Single dose', when: 'at 4–8 months' }],
        note: 'Female calves only. Never bulls or pregnant animals.',
      },
      {
        id: 'theil',
        name: 'Theileriosis',
        gist: 'One dose at 3 months · crossbred and exotic cattle',
        chips: [N('Crossbred / exotic only'), N('One-time')],
        doses: [{ label: 'Single dose', when: 'at 3 months' }],
        note: 'Crossbred and exotic cattle only.',
      },
      {
        id: 'anthrax',
        name: 'Anthrax',
        gist: 'From 4 months · every year',
        chips: [N('Endemic areas')],
        doses: [
          { label: 'First dose', when: 'at 4 months' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
      },
    ],
  },
  goats: {
    title: 'Goats',
    rows: [
      { when: '3 months', what: 'FMD, Tetanus toxoid, Bluetongue', detail: '(optional)' },
      { when: '3–4 months', what: 'PPR, Goat pox, Enterotoxaemia' },
      { when: '4 months', what: 'Anthrax', detail: '(endemic areas)' },
      { when: '6 months', what: 'HS' },
      { when: 'Every 6 months', what: 'FMD, Enterotoxaemia', recurring: true },
      { when: 'Every year', what: 'Goat pox, Tetanus toxoid, HS, Anthrax, Bluetongue, CCPP', recurring: true },
      { when: 'Every 3 years', what: 'PPR', detail: '(some programmes: yearly)', recurring: true },
    ],
    active: [
      RABIES,
      {
        id: 'ppr',
        name: 'PPR',
        gist: 'One dose at 3–4 months · every 3 years',
        chips: [],
        doses: [
          { label: 'Single dose', when: 'at 3–4 months' },
          { label: 'Repeats', when: 'every 3 years' },
        ],
        note: 'Some programmes repeat yearly. Avoid in late pregnancy.',
      },
      {
        id: 'pox',
        name: 'Goat pox',
        gist: 'From 3–4 months · booster at +21 days · every year',
        chips: [],
        doses: [
          { label: 'First dose', when: 'at 3–4 months' },
          { label: 'Booster', when: '21 days after previous dose' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
        note: 'Goat-pox vaccine for goats only.',
      },
      {
        id: 'et',
        name: 'Enterotoxaemia (ET)',
        gist: 'From 3–4 months · booster at +21 days · every 6 months',
        chips: [],
        doses: [
          { label: 'First dose', when: 'at 3–4 months' },
          { label: 'Booster', when: '21 days after previous dose' },
          { label: 'Repeats', when: 'every 6 months' },
        ],
        note: 'Before monsoon. Repeat every 6–12 months.',
      },
      {
        id: 'fmd',
        name: 'FMD',
        gist: 'From 3 months · booster at +21 days · every 6 months',
        chips: [],
        doses: [
          { label: 'First dose', when: 'at 3 months' },
          { label: 'Booster', when: '21 days after previous dose' },
          { label: 'Repeats', when: 'every 6 months' },
        ],
      },
      {
        id: 'tt',
        name: 'Tetanus toxoid',
        gist: 'From 3 months · second dose at +90 days · every year',
        chips: [],
        doses: [
          { label: 'First dose', when: 'at 3 months' },
          { label: 'Second dose', when: '90 days after previous dose' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
        note: 'Also after a deep wound.',
      },
      {
        id: 'hs',
        name: 'HS',
        gist: 'From 6 months · every year',
        chips: [],
        doses: [
          { label: 'First dose', when: 'at 6 months' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
        note: 'Some vets advise 6-monthly.',
      },
      {
        id: 'anthrax',
        name: 'Anthrax',
        gist: 'From 4 months · every year',
        chips: [N('Endemic areas')],
        doses: [
          { label: 'First dose', when: 'at 4 months' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
      },
      {
        id: 'bt',
        name: 'Bluetongue',
        gist: 'From 3 months · every year · optional',
        chips: [N('Optional')],
        doses: [
          { label: 'First dose', when: 'at 3 months' },
          { label: 'Repeats', when: 'every 1 year' },
        ],
        note: 'Where advised locally.',
      },
      {
        id: 'ccpp',
        name: 'CCPP',
        gist: 'Risk-based · every year, on vet advice',
        chips: [N('Risk-based')],
        doses: [{ label: 'Repeats', when: 'every 1 year' }],
        note: 'Only in outbreak areas, on vet advice.',
      },
    ],
  },
};

const chipColors = (k: Chip['kind']) =>
  k === 'urgent' ? { bg: '#FDE5E3', fg: '#B3261E' } : { bg: C.neutralTint, fg: C.neutralInk };

const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke={C.muted}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    style={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

const VaccineCard: React.FC<{ v: Vaccine; open: boolean; onToggle: () => void }> = ({ v, open, onToggle }) => (
  <div
    style={{
      background: v.urgent ? '#FFF7F6' : '#FFFFFF',
      border: `1px solid ${v.urgent ? '#F2B8B5' : C.line}`,
      borderRadius: 14,
      marginBottom: 8,
      overflow: 'hidden',
    }}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      style={{ display: 'block', width: '100%', minHeight: 44, textAlign: 'left', background: 'none', border: 0, padding: 12, cursor: 'pointer', color: 'inherit', fontSize: 'inherit' }}
    >
      <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.25, color: C.ink }}>{v.name}</span>
        <Chevron open={open} />
      </span>
      <span style={{ display: 'block', fontSize: 13, lineHeight: 1.4, color: '#4B5348', marginTop: 3 }}>{v.gist}</span>
      {v.chips.length > 0 && (
      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
        {v.chips.map((c) => {
          const col = chipColors(c.kind);
          return (
            <span key={c.t} style={{ fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '2px 8px', whiteSpace: 'nowrap', background: col.bg, color: col.fg }}>
              {c.t}
            </span>
          );
        })}
      </span>
      )}
    </button>
    {open && (
      <div style={{ padding: '0 12px 12px' }}>
        <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 6 }}>
          {v.doses.map((d) => (
            <div key={d.label} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '7px 0', borderBottom: '1px solid #EEF1EC', fontSize: 13, lineHeight: 1.35 }}>
              <span style={{ color: C.muted }}>{d.label}</span>
              <span style={{ fontWeight: 600, textAlign: 'right' }}>{d.when}</span>
            </div>
          ))}
        </div>
        {v.note && (
          <div style={{ marginTop: 10, background: C.bg, borderRadius: 10, padding: '8px 10px', fontSize: 13, lineHeight: 1.4, color: '#2B322A' }}>{v.note}</div>
        )}
      </div>
    )}
  </div>
);

const TYPE_BADGES: { name: string; text: string }[] = [
  { name: 'Age-based', text: 'Due at a set age' },
  { name: 'Booster', text: 'Follow-up dose after the first' },
  { name: 'Recurring', text: 'Repeats on a regular cycle' },
  { name: 'One-time', text: 'Given once' },
  { name: 'Female only', text: 'Not for males' },
  { name: 'Season / breed', text: 'Depends on season or breed' },
];

const CHECKLIST = [
  'Animal or flock is healthy (not sick, stressed or dehydrated)',
  'Vaccine name, expiry date and batch checked',
  'Cold chain kept as per the label (commonly 2–8 °C), away from sunlight',
  'Dose and route followed exactly as per the label',
  'Pregnant animals: ask the vet first',
  "Poultry drinking water: clean, no disinfectant residue, use within the label's time",
  'Record the batch number, date and next due date',
];

const SafetyTab: React.FC<{ done: Record<number, boolean>; setDone: (d: Record<number, boolean>) => void }> = ({ done, setDone }) => {
  const count = CHECKLIST.filter((_, i) => done[i]).length;
  const label = (t: React.CSSProperties = {}): React.CSSProperties => ({ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 6, ...t });
  return (
    <>
      <p style={{ margin: '0 0 14px', fontSize: 14, lineHeight: 1.4, color: C.muted }}>
        What the vaccination labels mean, and a checklist to run before every vaccination.
      </p>

      <div style={label()}>Vaccination types</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8, marginBottom: 16 }}>
        {TYPE_BADGES.map((b) => (
          <div key={b.name} style={{ background: '#FFFFFF', border: `1px solid ${C.line}`, borderRadius: 12, padding: 10 }}>
            <span style={{ fontSize: 11, fontWeight: 600, borderRadius: 10, padding: '2px 8px', whiteSpace: 'nowrap', background: C.neutralTint, color: C.neutralInk }}>{b.name}</span>
            <div style={{ fontSize: 13, lineHeight: 1.35, marginTop: 6 }}>{b.text}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Before you vaccinate</h2>
        <span style={{ fontSize: 13, color: C.greenInk, fontWeight: 600 }}>
          {count} of {CHECKLIST.length} checked
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: C.line, marginBottom: 10, overflow: 'hidden' }} role="presentation">
        <div style={{ height: 6, borderRadius: 3, background: C.green, width: `${Math.round((count / CHECKLIST.length) * 100)}%`, transition: 'width 0.2s' }} />
      </div>

      <div style={{ background: '#FFFFFF', border: `1px solid ${C.line}`, borderRadius: 14, padding: 4 }}>
        {CHECKLIST.map((text, i) => (
          <label
            key={text}
            style={{ display: 'flex', gap: 12, alignItems: 'flex-start', minHeight: 44, padding: 10, borderRadius: 10, cursor: 'pointer', fontSize: 14, lineHeight: 1.4, background: done[i] ? '#F1F8F0' : '#FFFFFF' }}
          >
            <input
              type="checkbox"
              checked={!!done[i]}
              onChange={() => setDone({ ...done, [i]: !done[i] })}
              style={{ width: 22, height: 22, flex: 'none', margin: 0, accentColor: C.green, cursor: 'pointer' }}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>

      {count === CHECKLIST.length && (
        <div style={{ marginTop: 10, background: C.greenTint, color: C.greenInk, borderRadius: 12, padding: '10px 12px', fontSize: 14, fontWeight: 600 }}>
          All checked. Vaccinate as per the label.
        </div>
      )}

      <button
        type="button"
        onClick={() => setDone({})}
        style={{ width: '100%', minHeight: 44, marginTop: 10, border: `1px solid ${C.line}`, background: '#FFFFFF', borderRadius: 12, fontSize: 14, fontWeight: 600, color: C.neutralInk, cursor: 'pointer' }}
      >
        Clear checklist
      </button>

      <div style={{ marginTop: 14, background: '#FFF1D6', borderRadius: 12, padding: '10px 12px', fontSize: 13, lineHeight: 1.4, color: '#6B4200' }}>
        Indicative only. A vet and the vaccine label take priority.
      </div>
    </>
  );
};

type Flock = 'All' | 'Layers' | 'Broilers';
type Aud = 'both' | 'l' | 'b';
const audChip = (a: Aud): Chip => N(a === 'both' ? 'Layers and broilers' : a === 'b' ? 'Broilers only' : 'Layers only');
const hv = (id: string, aud: Aud, name: string, gist: string, extra: Chip[], doses: Vaccine['doses'], note?: string): Vaccine & { aud: Aud } => ({
  id,
  aud,
  name,
  gist,
  chips: [...extra, audChip(aud)],
  doses,
  note,
});

const HENS_ACTIVE: (Vaccine & { aud: Aud })[] = [
  hv('marek', 'both', "Marek's disease", 'One dose at day 1 · usually at the hatchery', [N('One-time')], [{ label: 'Day-old dose', when: 'at day 1' }], 'Usually given at the hatchery. Ask for the hatchery record.'),
  hv('nd1', 'both', 'Newcastle (Ranikhet), early', 'Live vaccine at day 1–7', [], [{ label: 'Early live vaccine', when: 'at day 1–7' }]),
  hv('ibb', 'b', 'Infectious bronchitis (IB)', 'Early dose at day 1–14', [], [{ label: 'Early dose', when: 'at day 1–14' }]),
  hv('ibl', 'l', 'Infectious bronchitis (IB)', 'First dose at day 14–21', [], [{ label: 'First dose', when: 'at day 14–21' }]),
  hv('ibdb', 'b', 'IBD (Gumboro)', 'First dose at day 12–14 · booster at day 18–21 if indicated', [], [
    { label: 'First dose', when: 'at day 12–14' },
    { label: 'Booster, if indicated', when: 'at day 18–21' },
  ]),
  hv('ibdl', 'l', 'IBD (Gumboro)', 'First dose at day 12–15 · booster at day 24–28 if indicated', [], [
    { label: 'First dose', when: 'at day 12–15' },
    { label: 'Booster, if indicated', when: 'at day 24–28' },
  ]),
  hv('ndb', 'b', 'Newcastle booster', 'Booster at day 21–28', [], [{ label: 'Booster', when: 'at day 21–28' }]),
  hv('ndibl', 'l', 'Newcastle / IB booster', 'Booster 1 at day 28–week 6 · booster 2 at week 10–14', [], [
    { label: 'Booster 1', when: 'at day 28–week 6' },
    { label: 'Booster 2', when: 'at week 10–14' },
  ]),
  hv('pox', 'l', 'Fowl pox', 'First dose at week 6–9 (wing web)', [], [{ label: 'First dose (wing web)', when: 'at week 6–9' }]),
  hv('r2b', 'l', 'Newcastle R2B', 'One dose at week 6–10', [], [{ label: 'R2B dose', when: 'at week 6–10' }], 'Follow local vet advice and label.'),
  hv('cory', 'l', 'Coryza / fowl cholera', 'Risk-based · window weeks 6–14', [N('Risk-based')], [{ label: 'Window', when: 'weeks 6–14' }], 'Risk-based only.'),
  hv('prelay', 'l', 'Newcastle / IB pre-lay (inactivated)', 'Pre-lay dose at week 16–18', [], [{ label: 'Pre-lay dose', when: 'at week 16–18' }]),
  hv('eds', 'l', "EDS '76", 'One pre-lay dose at week 16–18', [N('One-time')], [{ label: 'Pre-lay dose', when: 'at week 16–18' }]),
];

const LAYERS_PLAN: { when: string; what: string; sub?: string }[] = [
  { when: 'Day 1', what: "Marek's disease", sub: '(usually at the hatchery)' },
  { when: 'Day 1–7', what: 'Newcastle (early)' },
  { when: 'Day 12–15', what: 'IBD (Gumboro)' },
  { when: 'Day 14–21', what: 'Infectious bronchitis (IB)' },
  { when: 'Day 28–week 6', what: 'Newcastle / IB booster 1' },
  { when: 'Week 6–10', what: 'Fowl pox, Newcastle R2B' },
  { when: 'Week 10–14', what: 'Newcastle / IB booster 2' },
  { when: 'Week 16–18', what: "Newcastle / IB pre-lay, EDS '76" },
];
const BROILERS_PLAN: { when: string; what: string; sub?: string }[] = [
  { when: 'Day 1', what: "Marek's disease", sub: '(usually at the hatchery)' },
  { when: 'Day 1–7', what: 'Newcastle (early)' },
  { when: 'Day 1–14', what: 'Infectious bronchitis (IB)' },
  { when: 'Day 12–14', what: 'IBD (Gumboro)' },
  { when: 'Day 18–21', what: 'IBD booster', sub: '(if indicated)' },
  { when: 'Day 21–28', what: 'Newcastle booster' },
];

interface HensTabProps {
  flock: Flock;
  setFlock: (f: Flock) => void;
  openIds: Record<string, boolean>;
  toggle: (id: string) => void;
  onOpenTracker: () => void;
  onOpenSafety: () => void;
}

const HensTab: React.FC<HensTabProps> = ({ flock, setFlock, openIds, toggle, onOpenTracker, onOpenSafety }) => {
  const list = HENS_ACTIVE.filter((x) => flock === 'All' || x.aud === 'both' || (flock === 'Layers' && x.aud === 'l') || (flock === 'Broilers' && x.aud === 'b'));
  const plan = flock === 'Layers' ? LAYERS_PLAN : BROILERS_PLAN;
  return (
    <>
      <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.4, color: C.muted }}>
        {HENS_ACTIVE.length} vaccines in use. Pick a flock type, then tap a vaccine for its full schedule.
      </p>

      <div role="group" aria-label="Flock type" style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {(['All', 'Layers', 'Broilers'] as Flock[]).map((f) => {
          const on = flock === f;
          return (
            <button
              key={f}
              type="button"
              aria-pressed={on}
              onClick={() => setFlock(f)}
              style={{ flex: 1, minHeight: 44, borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: on ? C.green : '#FFFFFF', color: on ? '#FFFFFF' : C.ink, border: `1px solid ${on ? C.green : C.line}` }}
            >
              {f}
              {f !== 'All' && <span style={{ marginLeft: 6 }}>{f === 'Layers' ? '🐣' : '🐔'}</span>}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onOpenTracker}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginBottom: 12, padding: '0 14px', background: C.greenTint, border: 0, borderRadius: 12, color: C.greenInk, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
      >
        <span>Open my vaccination tracker</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.greenInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>

      {flock === 'All' ? (
        <div style={{ background: '#FFFFFF', border: `1px solid ${C.line}`, borderRadius: 14, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 6 }}>When to vaccinate</div>
          <p style={{ margin: '0 0 10px', fontSize: 14, lineHeight: 1.4 }}>Layers and broilers follow different plans. Choose one to see the age-by-age schedule.</p>
          <div style={{ display: 'flex', gap: 8 }}>
            {(['Layers', 'Broilers'] as Flock[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFlock(f)}
                style={{ flex: 1, minHeight: 44, borderRadius: 12, border: 0, background: C.greenTint, color: C.greenInk, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
              >
                See {f.toLowerCase()} plan
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 12px 6px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 6 }}>When to vaccinate · {flock}</div>
          {plan.map((r) => (
            <div key={r.when + r.what} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
              <span style={{ flex: 'none', width: 112, textAlign: 'center', background: C.greenTint, color: C.greenInk, fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '4px 0' }}>{r.when}</span>
              <span style={{ fontSize: 14, lineHeight: 1.35, paddingTop: 2 }}>
                {r.what} {r.sub && <span style={{ color: C.muted }}>{r.sub}</span>}
              </span>
            </div>
          ))}
          <p style={{ margin: '4px 0 8px', fontSize: 12, lineHeight: 1.4, color: C.muted }}>
            {flock === 'Layers' ? 'Coryza / fowl cholera is risk-based, weeks 6–14.' : 'Boosters only where indicated. Follow your vet and the label.'}
          </p>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{flock === 'All' ? `Vaccines in use (${list.length})` : `${flock}: ${list.length} vaccines in use`}</h2>
      </div>
      {list.map((v) => (
        <VaccineCard key={v.id} v={v} open={!!openIds[`hens:${v.id}`]} onToggle={() => toggle(v.id)} />
      ))}

      <button
        type="button"
        onClick={onOpenSafety}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginTop: 10, padding: '0 14px', background: C.greenTint, border: 0, borderRadius: 12, color: C.greenInk, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
      >
        <span>Before you vaccinate: safety checklist</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.greenInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </button>
      <p style={{ margin: '12px 2px 0', fontSize: 12, lineHeight: 1.4, color: C.muted }}>Indicative only. A vet and the vaccine label take priority.</p>
    </>
  );
};

interface Props {
  onBack: () => void;
  onOpenTracker: () => void;
}

export const VaccinationGuideScreen: React.FC<Props> = ({ onBack, onOpenTracker }) => {
  const [tab, setTab] = useState<'cattle' | 'goats' | 'hens' | 'safety'>('cattle');
  const [flock, setFlock] = useState<Flock>('All');
  const [checked, setChecked] = useState<Record<number, boolean>>({});
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  const guide = GUIDES[tab === 'goats' ? 'goats' : 'cattle'];

  // Start each tab at the top
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  // Vaccine ids repeat across animals (FMD, HS...), so open state is kept per tab
  const toggle = (id: string) => setOpenIds((o) => ({ ...o, [`${tab}:${id}`]: !o[`${tab}:${id}`] }));

  const onTab = (id: TabId) => {
    setTab(id);
  };

  const inUse = guide.active.length;
  const oneTimeRows = guide.rows.filter((r) => !r.recurring);
  const recurringRows = guide.rows.filter((r) => r.recurring);

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', background: 'linear-gradient(180deg, #F7C98B 0%, #F9DDA0 45%, #F6EDB5 100%)', color: C.ink, fontFamily: "system-ui,-apple-system,'Segoe UI',Roboto,sans-serif", overflow: 'hidden', position: 'relative' }}>
      {/* Header + animal tabs */}
      <div style={{ background: '#FFFFFF', borderBottom: `1px solid ${C.line}`, padding: '10px 16px 6px 11px', flex: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            style={{ width: 44, height: 44, borderRadius: 22, border: `1px solid ${C.line}`, background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, cursor: 'pointer', flex: 'none' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          {/* label sits level with the arrow, title just below it */}
          <div style={{ paddingTop: 8 }}>
            <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600 }}>Farm article · Vaccination</div>
            <h1 style={{ margin: '2px 0 0', fontSize: 24, lineHeight: 1.15, fontWeight: 700, color: C.ink }}>{tab === 'safety' ? 'Legend and safety' : tab === 'hens' ? 'Hens' : guide.title}</h1>
          </div>
        </div>
        <nav aria-label="Animal guides" style={{ display: 'flex', gap: 6, marginTop: 12, padding: '3px 3px 5px 8px' }}>
          {TABS.map((t) => {
            const active = t.id === tab;
            const blue = t.id === 'safety'; // Safety stands out in blue
            return (
              <button
                key={t.id}
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onTab(t.id)}
                style={{
                  flex: 1,
                  minHeight: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  // Unselected tabs are white; the chosen tab gets the page's warm gradient and glows
                  background: blue
                    ? active
                      ? 'linear-gradient(180deg, #8DBBF2 0%, #B4D3F8 100%)'
                      : 'linear-gradient(180deg, #D6EAFA 0%, #E6F2FD 100%)'
                    : active
                      ? 'linear-gradient(180deg, #F7C98B 0%, #F9DDA0 55%, #F6EDB5 100%)'
                      : '#FFFFFF',
                  color: blue ? '#1F4E7A' : '#000000',
                  fontSize: 14,
                  fontWeight: active ? 700 : 600,
                  border: `1.5px solid ${blue ? (active ? '#3B82D6' : '#BCD9F2') : active ? '#F2A33A' : C.line}`,
                  boxShadow: active
                    ? blue
                      ? '0 0 0 3px rgba(59,130,214,0.22), 0 0 16px 3px rgba(59,130,214,0.7)'
                      : '0 0 0 3px rgba(242,163,58,0.22), 0 0 16px 3px rgba(247,170,70,0.75)'
                    : 'none',
                  transition: 'box-shadow 0.2s, border-color 0.2s',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Scrollable content */}
      <div ref={scrollRef} className="scrollbar-none" style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '14px 16px 28px' }}>
        {tab === 'safety' ? (
          <SafetyTab done={checked} setDone={setChecked} />
        ) : tab === 'hens' ? (
          <HensTab flock={flock} setFlock={setFlock} openIds={openIds} toggle={toggle} onOpenTracker={onOpenTracker} onOpenSafety={() => setTab('safety')} />
        ) : (
          <>
        <p style={{ margin: '0 0 12px', fontSize: 14, lineHeight: 1.4, color: C.muted }}>
          {inUse} vaccines in use. Tap a vaccine to see its full schedule.
        </p>

        <button
          type="button"
          onClick={onOpenTracker}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginBottom: 12, padding: '0 14px', background: C.greenTint, border: 0, borderRadius: 12, color: C.greenInk, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
        >
          <span>Open my vaccination tracker</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.greenInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>

        {/* When to vaccinate */}
        <div style={{ background: '#FFFFFF', border: `1px solid ${C.line}`, borderRadius: 14, padding: '12px 12px 8px', marginBottom: 16 }}>
          <div style={{ fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: C.muted, fontWeight: 600, marginBottom: 6 }}>When to vaccinate</div>
          {oneTimeRows.map((r, i) => (
            <div key={r.when} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: i === oneTimeRows.length - 1 ? '6px 0 10px' : '6px 0' }}>
              <span style={{ flex: 'none', width: 104, textAlign: 'center', background: C.greenTint, color: C.greenInk, fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '4px 0' }}>{r.when}</span>
              <span style={{ fontSize: 14, lineHeight: 1.35, paddingTop: 2 }}>
                {r.what} {r.detail && <span style={{ color: C.muted }}>{r.detail}</span>}
              </span>
            </div>
          ))}
          <div style={{ borderTop: `1px solid ${C.lineSoft}`, paddingTop: 8 }}>
            {recurringRows.map((r) => (
              <div key={r.when} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0' }}>
                <span style={{ flex: 'none', width: 104, textAlign: 'center', background: C.neutralTint, color: C.neutralInk, fontWeight: 700, fontSize: 13, borderRadius: 8, padding: '4px 0' }}>{r.when}</span>
                <span style={{ fontSize: 14, lineHeight: 1.35, paddingTop: 2 }}>
                  {r.what} {r.detail && <span style={{ color: C.muted }}>{r.detail}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Vaccines in use */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Vaccines in use ({inUse})</h2>
        </div>
        {guide.active.map((v) => (
          <VaccineCard key={`${tab}:${v.id}`} v={v} open={!!openIds[`${tab}:${v.id}`]} onToggle={() => toggle(v.id)} />
        ))}

        <button
          type="button"
          onClick={() => setTab('safety')}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, marginTop: 10, padding: '0 14px', background: C.greenTint, border: 0, borderRadius: 12, color: C.greenInk, fontSize: 14, fontWeight: 600, cursor: 'pointer', textAlign: 'left' }}
        >
          <span>Before you vaccinate: safety checklist</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={C.greenInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
        <p style={{ margin: '12px 2px 0', fontSize: 12, lineHeight: 1.4, color: C.muted }}>Indicative only. A vet and the vaccine label take priority.</p>
          </>
        )}
      </div>
    </div>
  );
};
