import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useBackLayer } from '../../lib/backStack';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';

const serif = "font-['Newsreader',Georgia,serif]";

type Lang = 'en' | 'hi' | 'mr';

const TXT = {
  en: {
    title: 'Coming soon', sub: "Here's what we're building for your farm", badge: 'Coming soon', close: 'Close', hybrid: 'Hybrid language support',
    cards: [
      { icon: 'monitoring', from: '#d7f2e6', to: '#a6e0c4', tag: true, title: 'Animal Production Log', body: "A meticulously developed production log that detects varying patterns in your animal's production and suggests health-related actions with precision. Based on research papers and pilot-testing verified." },
      { icon: 'biotech', from: '#ffe0e6', to: '#f7b5c3', title: 'Redefined diagnosis model', body: 'A redefined, high-precision model that covers a wide variety of underlying diseases across a wide range of animals, giving you more control over the diagnosis.' },
      { icon: 'smart_display', from: '#fff0cf', to: '#f7d68a', title: 'Tools & equipment', body: 'Tools and equipment will be available soon, with their video guides, at the Marketplace as well as in Farm Setup for learning about them.' },
      { icon: 'account_circle', from: '#f1e3ff', to: '#d9bdf5', title: 'Your farmer profile', body: 'Your farm details, saved articles and orders, all in one place.' },
      { icon: 'menu_book', from: '#e1ecff', to: '#b9d2fb', title: 'More articles', body: 'More articles on farm setup and farm articles are coming soon.' },
    ],
  },
  hi: {
    title: 'जल्द आ रहा है', sub: 'आपके फार्म के लिए हम यह बना रहे हैं', badge: 'जल्द आ रहा है', close: 'बंद करें', hybrid: 'हाइब्रिड भाषा समर्थन',
    cards: [
      { icon: 'monitoring', from: '#d7f2e6', to: '#a6e0c4', tag: true, title: 'पशु उत्पादन लॉग', body: 'बारीकी से तैयार किया गया उत्पादन लॉग, जो आपके पशु के उत्पादन में बदलते पैटर्न पहचानता है और सटीकता से स्वास्थ्य संबंधी कदम सुझाता है। शोध पत्रों पर आधारित और पायलट परीक्षण से सत्यापित।' },
      { icon: 'biotech', from: '#ffe0e6', to: '#f7b5c3', title: 'पुनर्परिभाषित निदान मॉडल', body: 'एक उन्नत, उच्च-सटीकता वाला मॉडल, जो कई तरह के पशुओं में अनेक प्रकार के छिपे रोगों को पहचानता है और निदान पर आपको अधिक नियंत्रण देता है।' },
      { icon: 'smart_display', from: '#fff0cf', to: '#f7d68a', title: 'औज़ार और उपकरण', body: 'औज़ार और उपकरण जल्द ही उपलब्ध होंगे, उनके वीडियो गाइड के साथ, मार्केटप्लेस पर और फार्म सेटअप में सीखने के लिए।' },
      { icon: 'account_circle', from: '#f1e3ff', to: '#d9bdf5', title: 'आपकी किसान प्रोफ़ाइल', body: 'आपके फार्म का विवरण, सहेजे गए लेख और ऑर्डर, सब एक जगह।' },
      { icon: 'menu_book', from: '#e1ecff', to: '#b9d2fb', title: 'और लेख', body: 'फार्म सेटअप और फार्म लेखों पर और लेख जल्द आ रहे हैं।' },
    ],
  },
  mr: {
    title: 'लवकरच येत आहे', sub: 'तुमच्या फार्मसाठी आम्ही हे बनवत आहोत', badge: 'लवकरच', close: 'बंद करा', hybrid: 'संकरित भाषा समर्थन',
    cards: [
      { icon: 'monitoring', from: '#d7f2e6', to: '#a6e0c4', tag: true, title: 'पशू उत्पादन लॉग', body: 'काळजीपूर्वक विकसित केलेला उत्पादन लॉग, जो तुमच्या पशूच्या उत्पादनातील बदलते नमुने ओळखतो आणि अचूकतेने आरोग्यविषयक कृती सुचवतो. संशोधन पत्रिकांवर आधारित आणि पायलट चाचणीद्वारे पडताळलेला.' },
      { icon: 'biotech', from: '#ffe0e6', to: '#f7b5c3', title: 'पुनर्परिभाषित निदान मॉडेल', body: 'एक सुधारित, उच्च-अचूकतेचे मॉडेल, जे विविध प्राण्यांमधील अनेक प्रकारचे छुपे आजार ओळखते आणि निदानावर तुम्हाला अधिक नियंत्रण देते.' },
      { icon: 'smart_display', from: '#fff0cf', to: '#f7d68a', title: 'अवजारे आणि उपकरणे', body: 'अवजारे आणि उपकरणे लवकरच उपलब्ध होतील, त्यांच्या व्हिडिओ मार्गदर्शकांसह, बाजारपेठेत तसेच त्यांची माहिती घेण्यासाठी फार्म सेटअपमध्ये.' },
      { icon: 'account_circle', from: '#f1e3ff', to: '#d9bdf5', title: 'तुमची शेतकरी प्रोफाइल', body: 'तुमच्या फार्मचा तपशील, जतन केलेले लेख आणि ऑर्डर, सर्व एका ठिकाणी.' },
      { icon: 'menu_book', from: '#e1ecff', to: '#b9d2fb', title: 'आणखी लेख', body: 'फार्म सेटअप आणि फार्म लेखांवर आणखी लेख लवकरच येत आहेत.' },
    ],
  },
} as const;

/** Side panel (about 80% of the screen width) that slides in from the right when the Profile tab is tapped. */
export const ProfileSheet: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { language } = useLanguage();
  const x = TXT[(language as Lang) in TXT ? (language as Lang) : 'en'];
  const { name, email, signOut } = useAuth();
  useBackLayer(open, onClose);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="profile-sheet"
          className="absolute inset-0 z-[80] flex justify-end bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-label={x.title}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 360, damping: 36 }}
            onClick={(e) => e.stopPropagation()}
            className="w-[80%] h-full rounded-l-[28px] flex flex-col overflow-hidden shadow-[-12px_0_40px_-8px_rgba(0,0,0,0.25)]"
            style={{ background: 'linear-gradient(rgb(232,249,255) 0%, rgb(232,249,255) 42%, rgb(227,255,229) 60%, rgb(227,255,229) 100%)' }}
          >
            <div className="shrink-0 px-5 pt-6 pb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className={`${serif} text-[22px] font-bold text-[#191c1b] leading-tight`}>{x.title}</h2>
                <p className="text-[12px] text-[#6b7571] mt-0.5">{x.sub}</p>
              </div>
              <button
                type="button"
                aria-label={x.close}
                onClick={onClose}
                className="w-8 h-8 shrink-0 rounded-full bg-white shadow-sm flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
              >
                <span className="material-symbols-outlined text-[18px] text-[#404945]">close</span>
              </button>
            </div>
            <div className="shrink-0 mx-4 mb-3 bg-white rounded-[22px] p-3.5 flex items-center gap-3 shadow-[0_8px_22px_-12px_rgba(19,78,63,0.3)] border border-black/[0.03]">
              <span className="w-11 h-11 shrink-0 rounded-full bg-[#134e3f] text-white flex items-center justify-center text-[18px] font-bold uppercase">
                {(name || email || '?').charAt(0)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-bold text-[#191c1b] truncate">{name || 'Farmer'}</p>
                <p className="text-[11.5px] text-[#6b7571] truncate">{email}</p>
              </div>
              <button
                type="button"
                onClick={() => { onClose(); void signOut(); }}
                className="shrink-0 px-3 py-1.5 rounded-full bg-[#fde8e6] text-[#93000a] text-[12px] font-bold cursor-pointer active:scale-95 transition-transform"
              >
                Sign out
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-none px-4 pb-8 space-y-3">
              {x.cards.map((c) => (
                <article key={c.title} className="bg-white rounded-[22px] p-3.5 flex flex-col gap-3 shadow-[0_8px_22px_-12px_rgba(19,78,63,0.3)] border border-black/[0.03]">
                  <span
                    className="w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-[#134e3f]"
                    style={{ background: `linear-gradient(135deg, ${c.from}, ${c.to})` }}
                  >
                    <span className="material-symbols-outlined text-[26px]" style={{ fontVariationSettings: "'FILL' 1" }}>{c.icon}</span>
                  </span>
                  <div className="min-w-0">
                    <h3 className={`${serif} text-[16px] font-bold text-[#191c1b] leading-tight`}>{c.title}</h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      <span className="px-2 py-0.5 rounded-full bg-[#fff3c4] text-[#7a5a00] text-[9.5px] font-bold uppercase tracking-wide">{x.badge}</span>
                      {'tag' in c && c.tag && (
                        <span className="px-2 py-0.5 rounded-full bg-[#e4f3ec] text-[#134e3f] text-[9.5px] font-bold">{x.hybrid}</span>
                      )}
                    </div>
                    <p className="text-[12px] leading-relaxed text-[#404945] mt-2">{c.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
