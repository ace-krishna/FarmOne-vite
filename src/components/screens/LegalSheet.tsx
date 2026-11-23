import React from 'react';

export type LegalDoc = 'terms' | 'privacy';

const UPDATED = '24 November 2026';

interface Section {
  h: string;
  p: string[];
}

const TERMS: Section[] = [
  {
    h: '1. Using FarmOne',
    p: [
      'FarmOne helps you keep records of your animals, track vaccinations, learn farming practices, explore government schemes and browse farm products. By creating an account you agree to these terms.',
      'You must give a correct name and email, and keep your password private. You are responsible for what happens under your account.',
    ],
  },
  {
    h: '2. Information, not professional advice',
    p: [
      'Vaccination schedules, learning articles, scheme details and the animal health scan are general guidance only. The health scan is an automated estimate and can be wrong.',
      'They do not replace a qualified veterinarian. For a sick or injured animal, contact a vet. Check scheme rules and dates with the official source before you apply.',
    ],
  },
  {
    h: '3. Your records',
    p: [
      'The animal and farm details you enter belong to you. You allow FarmOne to store and process them so the app can work for you.',
      'Please enter accurate information and do not upload anything unlawful or that belongs to someone else.',
    ],
  },
  {
    h: '4. Marketplace',
    p: [
      'Product listings, prices and delivery times are shown for convenience and may change. Check the details before you buy.',
    ],
  },
  {
    h: '5. Acceptable use',
    p: [
      'Do not misuse the app, try to access other people’s accounts, interfere with how it runs, or copy it for resale.',
    ],
  },
  {
    h: '6. Availability and liability',
    p: [
      'We work to keep FarmOne running but cannot promise it will always be available or error free. To the extent the law allows, FarmOne is not liable for losses that come from relying on the app’s guidance or from it being unavailable.',
    ],
  },
  {
    h: '7. Ending your account',
    p: [
      'You can stop using FarmOne at any time. We may suspend accounts that break these terms.',
    ],
  },
  {
    h: '8. Changes and contact',
    p: [
      'We may update these terms. If we make a significant change we will tell you in the app. Continuing to use FarmOne means you accept the new terms.'
    ],
  },
];

const PRIVACY: Section[] = [
  {
    h: '1. What we collect',
    p: [
      'Account details: your name, email and password. The password is stored securely by our sign-in provider and we cannot read it.',
      'Farm details you add: animals, vaccination records, farm setup choices and similar information.',
      'Photos: pictures you take or choose for the animal health scan.',
    ],
  },
  {
    h: '2. How we use it',
    p: [
      'To sign you in, show your farm records, remind you about vaccinations, run the health scan and improve the app. We do not sell your personal information.',
    ],
  },
  {
    h: '3. Where it is stored',
    p: [
      'Your account and records are stored with our cloud provider, Supabase. Data is sent over encrypted connections.',
      'We keep your information while your account is active. You can ask us to delete it at any time.',
    ],
  },
  {
    h: '4. Sharing',
    p: [
      'We share data only with the service providers that run FarmOne (such as hosting), or when the law requires it. We do not share your farm records with other users.',
    ],
  },
  {
    h: '5. Your choices',
    p: [
      'You can see and change your details in the app, sign out whenever you like, and ask for your account and records to be deleted.',
    ],
  },
  {
    h: '6. Staying signed in',
    p: [
      'To avoid asking you to sign in every time, the app saves a sign-in session on your device until you sign out.',
    ],
  },
  {
    h: '7. Children',
    p: ['FarmOne is meant for adults. We do not knowingly collect information from children.'],
  },
  {
    h: '8. Changes and contact',
    p: [
      'We may update this policy and will tell you about significant changes in the app.'
    ],
  },
];

const DOCS: Record<LegalDoc, { title: string; sections: Section[] }> = {
  terms: { title: 'Terms of Service', sections: TERMS },
  privacy: { title: 'Privacy Policy', sections: PRIVACY },
};

interface Props {
  doc: LegalDoc;
  onClose: () => void;
}

/** Bottom sheet that shows the Terms of Service or the Privacy Policy. */
export const LegalSheet: React.FC<Props> = ({ doc, onClose }) => {
  const { title, sections } = DOCS[doc];
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <style>{`@keyframes lgUp { from { transform: translateY(100%); } to { transform: none; } }
@keyframes lgFade { from { opacity: 0; } to { opacity: 1; } }`}</style>
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/55"
        style={{ animation: 'lgFade .25s ease both' }}
      />
      <div
        className="relative max-h-[82%] flex flex-col rounded-t-[28px] bg-[#101c2e]/95 backdrop-blur-xl border-t border-white/15 text-white"
        style={{ animation: 'lgUp .35s cubic-bezier(.16,1,.3,1) both' }}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div>
            <h2 className="text-[18px] font-bold">{title}</h2>
            <p className="text-[11.5px] text-gray-400 mt-0.5">Last updated {UPDATED}</p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 border border-white/15 flex items-center justify-center active:scale-90 transition-transform"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto px-6 pb-4 space-y-4">
          {sections.map((s) => (
            <section key={s.h}>
              <h3 className="text-[13.5px] font-semibold text-white">{s.h}</h3>
              {s.p.map((t, i) => (
                <p key={i} className="text-[12.5px] leading-relaxed text-gray-300 mt-1.5">
                  {t}
                </p>
              ))}
            </section>
          ))}
        </div>
        <div className="px-6 pt-2 pb-5">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 bg-white text-stone-950 font-bold text-[15px] rounded-full active:scale-[0.97] transition-transform"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
