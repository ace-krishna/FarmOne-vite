import React, { useMemo, useRef, useState } from 'react';
import { DockPill } from './DockPill';
import { ProfileSheet } from './ProfileSheet';
import { AnimatePresence, motion } from 'motion/react';
import { useBackLayer } from '../../lib/backStack';
import { useLanguage } from '../../context/LanguageContext';
import { ProductArt } from './ProductArt';
import { WanderingCow } from './DairyHeroArt';
import { WanderingChick } from './PoultryHeroArt';

interface Props {
  onHome: () => void;
  onFarmSetup: () => void;
  onOpenILearning?: () => void;
}

type Category = 'Feed' | 'Health' | 'Dairy care' | 'Poultry' | 'Tools';

interface Product {
  id: string;
  name: string;
  unit: string;
  price: number;
  mrp?: number;
  category: Category;
  emoji: string;
  from: string;
  to: string;
  tag: string;
  for: string;
  rating: number;
  reviews: number;
  eta: string;
}

const PRODUCTS: Product[] = [
  { id: 'p1', name: 'Premium Cattle Feed Pellets 50 kg', unit: '50 kg', price: 1180, mrp: 1350, category: 'Feed', emoji: '🌾', from: '#f6d365', to: '#e29a2d', tag: 'Cattle feed', for: 'Cows & buffalo', rating: 4.5, reviews: 2342, eta: 'Tomorrow' },
  { id: 'p2', name: 'Mineral Mixture Powder with Calcium', unit: '1 kg', price: 235, category: 'Health', emoji: '🧂', from: '#a8e6cf', to: '#3fb68b', tag: 'Minerals', for: 'Cows & goats', rating: 4.4, reviews: 612, eta: 'Tomorrow' },
  { id: 'p3', name: 'Poultry Layer Feed Crumble 25 kg', unit: '25 kg', price: 890, category: 'Poultry', emoji: '🐔', from: '#ffd6a5', to: '#f08a4b', tag: 'Layer feed', for: 'Hens', rating: 4.3, reviews: 94, eta: 'Tomorrow' },
  { id: 'p4', name: 'Teat Dip Solution Iodine Based', unit: '500 ml', price: 275, mrp: 340, category: 'Dairy care', emoji: '🧴', from: '#cfe8ff', to: '#5b9bd5', tag: 'Teat care', for: 'Dairy cows', rating: 4.6, reviews: 318, eta: 'Tomorrow' },
  { id: 'p5', name: 'FMD Vaccine Cold-Chain Kit (10 doses)', unit: '10 doses', price: 450, category: 'Health', emoji: '💉', from: '#e3d5ff', to: '#8b6fd6', tag: 'Vaccine', for: 'Cattle', rating: 4.7, reviews: 156, eta: '2 days' },
  { id: 'p6', name: 'Stainless Steel Milking Bucket', unit: '1 pc', price: 620, category: 'Dairy care', emoji: '🪣', from: '#e0e6ea', to: '#8e9aa5', tag: 'Milking', for: 'Dairy cows', rating: 4.2, reviews: 112, eta: '2 days' },
  { id: 'p7', name: 'Chaff Cutter Replacement Blade Set', unit: '2 pcs', price: 540, mrp: 699, category: 'Tools', emoji: '🔪', from: '#f3c7c7', to: '#d16b6b', tag: 'Blades', for: 'All farms', rating: 4.1, reviews: 68, eta: '2 days' },
  { id: 'p8', name: 'Digital Livestock Thermometer', unit: '1 pc', price: 199, category: 'Health', emoji: '🌡️', from: '#d4f1f4', to: '#4fb3bf', tag: 'Thermometer', for: 'All animals', rating: 4.4, reviews: 89, eta: 'Tomorrow' },
  { id: 'p9', name: 'Chick Starter Feed Crumble 10 kg', unit: '10 kg', price: 410, category: 'Poultry', emoji: '🐥', from: '#fff3b0', to: '#e8c53a', tag: 'Chick feed', for: 'Chicks', rating: 4.5, reviews: 203, eta: 'Tomorrow' },
  { id: 'p10', name: 'Green Fodder Seed Mix (Maize + Bajra)', unit: '2 kg', price: 320, category: 'Feed', emoji: '🌱', from: '#c8f0a8', to: '#5fae3f', tag: 'Fodder seed', for: 'Cows & buffalo', rating: 4.3, reviews: 141, eta: '2 days' },
  { id: 'p11', name: 'Automatic Poultry Water Drinker', unit: '5 L', price: 249, category: 'Poultry', emoji: '💧', from: '#cfe8ff', to: '#4a90d9', tag: 'Drinker', for: 'Hens', rating: 4.0, reviews: 77, eta: '2 days' },
  { id: 'p12', name: 'Hoof Trimming Kit with Gloves', unit: '1 kit', price: 780, mrp: 920, category: 'Tools', emoji: '🧤', from: '#ffd8b5', to: '#d98a4a', tag: 'Hoof care', for: 'Cattle', rating: 4.2, reviews: 45, eta: '3 days' },
];

const FBT = ['p2', 'p4', 'p8', 'p10'];
const CATEGORIES: Category[] = ['Feed', 'Health', 'Dairy care', 'Poultry', 'Tools'];
const SORTS = [
  { id: 'rel', label: 'Relevance' },
  { id: 'low', label: 'Price: low to high' },
  { id: 'high', label: 'Price: high to low' },
  { id: 'rated', label: 'Top rated' },
] as const;
const PRICES = [
  { id: 'any', label: 'Any price', test: (_: number) => true },
  { id: 'u250', label: 'Under ₹250', test: (p: number) => p < 250 },
  { id: 'm', label: '₹250 – ₹600', test: (p: number) => p >= 250 && p <= 600 },
  { id: 'o600', label: 'Over ₹600', test: (p: number) => p > 600 },
];

const GREEN = '#134e3f';
const HANDLING = 4;
const serif = "font-['Newsreader',Georgia,serif]";

type Lang = 'en' | 'hi' | 'mr';

const TXT = {
  en: {
    lKicker: 'i-Learning', lTitle: 'Learn what your farm needs and get it at the marketplace', lSub: 'Farm articles and setup guides, with the right products one tap away', startLearning: 'Start learning',
    pKicker: 'Poultry essentials', pTitle: 'Everything your flock needs', pSub: 'Feed, supplements and equipment delivered to your farm',
    bannerKicker: 'Farm essentials', bannerTitle: 'Everything your herd needs', bannerSub: 'Feed, vaccines and tools delivered to your farm', shopNow: 'Shop now', popular2: 'Popular products', results: 'products',
    badge: 'Free delivery', search: 'Search feed, vaccines, tools…', category: 'Category', sort: 'Sort', price: 'Price',
    allCats: 'All categories', noneTitle: 'No products found', noneDesc: 'Try a different search or clear the filters.', clear: 'Clear filters',
    add: 'Add', addSmall: '+ Add', item: 'ITEM', items: 'ITEMS', itemL: 'item', itemsL: 'items', freeUnlocked: 'Free delivery unlocked', viewCart: 'View Cart',
    myCart: 'My Cart', brand: 'FarmOne Marketplace', emptyTitle: 'Your cart is empty', emptyDesc: 'Add feed, vaccines and tools for your farm.', browse: 'Browse products',
    deliveryIn: 'Delivery in', days: '1–2 days', toFarm: 'to your farm', free: 'Free', fbt: 'Frequently Bought Together', must: 'Must haves',
    popular: '⚡ Popular with farmers like you', bill: 'Bill Details', saved: 'Saved', itemsTotal: 'Items Total', deliveryFee: 'Delivery Fee', freeCaps: 'FREE',
    handling: 'Handling / Platform Charge', toPay: 'To Pay', policyH: 'Cancellation Policy:',
    policy: 'Orders cannot be cancelled once shipped. In case of delay, a full refund will be processed.',
    payable: 'Total Payable', proceed: 'Proceed to Pay', ordered: 'Thank you for your interest! The marketplace pipeline is being built.', soon: 'Farmer profile is coming soon',
    off: 'OFF', favourite: 'Favourite', close: 'Close cart', clearSearch: 'Clear search',
    sorts: { rel: 'Relevance', low: 'Price: low to high', high: 'Price: high to low', rated: 'Top rated' },
    prices: { any: 'Any price', u250: 'Under ₹250', m: '₹250 – ₹600', o600: 'Over ₹600' },
    cats: { Feed: 'Feed', Health: 'Health', 'Dairy care': 'Dairy care', Poultry: 'Poultry', Tools: 'Tools' },
    eta: { Tomorrow: 'Tomorrow', '2 days': '2 days', '3 days': '3 days' },
  },
  hi: {
    lKicker: 'आई-लर्निंग', lTitle: 'जानें आपके फार्म को क्या चाहिए और उसे मार्केटप्लेस से पाएँ', lSub: 'फार्म लेख और सेटअप गाइड, सही उत्पाद बस एक टैप दूर', startLearning: 'सीखना शुरू करें',
    pKicker: 'मुर्गीपालन ज़रूरतें', pTitle: 'आपके झुंड की हर ज़रूरत', pSub: 'दाना, दवाइयाँ और उपकरण सीधे आपके फार्म तक',
    bannerKicker: 'फार्म ज़रूरतें', bannerTitle: 'आपके पशुओं की हर ज़रूरत', bannerSub: 'चारा, टीके और औज़ार सीधे आपके फार्म तक', shopNow: 'अभी खरीदें', popular2: 'लोकप्रिय उत्पाद', results: 'उत्पाद',
    badge: 'मुफ़्त डिलीवरी', search: 'चारा, टीके, औज़ार खोजें…', category: 'श्रेणी', sort: 'क्रमबद्ध', price: 'कीमत',
    allCats: 'सभी श्रेणियाँ', noneTitle: 'कोई उत्पाद नहीं मिला', noneDesc: 'कोई दूसरा शब्द खोजें या फ़िल्टर हटाएँ।', clear: 'फ़िल्टर हटाएँ',
    add: 'जोड़ें', addSmall: '+ जोड़ें', item: 'वस्तु', items: 'वस्तुएँ', itemL: 'वस्तु', itemsL: 'वस्तुएँ', freeUnlocked: 'मुफ़्त डिलीवरी मिली', viewCart: 'कार्ट देखें',
    myCart: 'मेरा कार्ट', brand: 'फार्मवन मार्केटप्लेस', emptyTitle: 'आपका कार्ट खाली है', emptyDesc: 'अपने फार्म के लिए चारा, टीके और औज़ार जोड़ें।', browse: 'उत्पाद देखें',
    deliveryIn: 'डिलीवरी', days: '1–2 दिन में', toFarm: 'आपके फार्म तक', free: 'मुफ़्त', fbt: 'अक्सर साथ खरीदे जाते हैं', must: 'ज़रूरी',
    popular: '⚡ आप जैसे किसानों में लोकप्रिय', bill: 'बिल विवरण', saved: 'बचत', itemsTotal: 'वस्तुओं का कुल', deliveryFee: 'डिलीवरी शुल्क', freeCaps: 'मुफ़्त',
    handling: 'हैंडलिंग / प्लेटफ़ॉर्म शुल्क', toPay: 'कुल देय', policyH: 'रद्द करने की नीति:',
    policy: 'शिप होने के बाद ऑर्डर रद्द नहीं किया जा सकता। देरी होने पर पूरा रिफ़ंड दिया जाएगा।',
    payable: 'कुल देय राशि', proceed: 'भुगतान करें', ordered: 'आपकी रुचि के लिए धन्यवाद! मार्केटप्लेस पाइपलाइन बनाई जा रही है।', soon: 'किसान प्रोफ़ाइल जल्द आ रही है',
    off: 'की छूट', favourite: 'पसंदीदा', close: 'कार्ट बंद करें', clearSearch: 'खोज हटाएँ',
    sorts: { rel: 'प्रासंगिकता', low: 'कीमत: कम से ज़्यादा', high: 'कीमत: ज़्यादा से कम', rated: 'सर्वश्रेष्ठ रेटिंग' },
    prices: { any: 'कोई भी कीमत', u250: '₹250 से कम', m: '₹250 – ₹600', o600: '₹600 से ज़्यादा' },
    cats: { Feed: 'चारा', Health: 'स्वास्थ्य', 'Dairy care': 'डेयरी देखभाल', Poultry: 'मुर्गीपालन', Tools: 'औज़ार' },
    eta: { Tomorrow: 'कल', '2 days': '2 दिन', '3 days': '3 दिन' },
  },
  mr: {
    lKicker: 'आय-लर्निंग', lTitle: 'तुमच्या फार्मला काय हवे ते जाणून घ्या आणि बाजारपेठेतून मिळवा', lSub: 'फार्म लेख आणि सेटअप मार्गदर्शक, योग्य उत्पादने फक्त एका टॅपवर', startLearning: 'शिकायला सुरुवात करा',
    pKicker: 'कुक्कुटपालन गरजा', pTitle: 'तुमच्या कोंबड्यांची प्रत्येक गरज', pSub: 'खाद्य, औषधे आणि उपकरणे थेट तुमच्या फार्मपर्यंत',
    bannerKicker: 'फार्म गरजा', bannerTitle: 'तुमच्या जनावरांची प्रत्येक गरज', bannerSub: 'चारा, लस आणि अवजारे थेट तुमच्या फार्मपर्यंत', shopNow: 'आता खरेदी करा', popular2: 'लोकप्रिय उत्पादने', results: 'उत्पादने',
    badge: 'मोफत डिलिव्हरी', search: 'चारा, लस, अवजारे शोधा…', category: 'श्रेणी', sort: 'क्रमवारी', price: 'किंमत',
    allCats: 'सर्व श्रेणी', noneTitle: 'उत्पादन सापडले नाही', noneDesc: 'वेगळा शब्द शोधा किंवा फिल्टर काढा.', clear: 'फिल्टर काढा',
    add: 'जोडा', addSmall: '+ जोडा', item: 'वस्तू', items: 'वस्तू', itemL: 'वस्तू', itemsL: 'वस्तू', freeUnlocked: 'मोफत डिलिव्हरी मिळाली', viewCart: 'कार्ट पहा',
    myCart: 'माझी कार्ट', brand: 'फार्मवन बाजारपेठ', emptyTitle: 'तुमची कार्ट रिकामी आहे', emptyDesc: 'तुमच्या फार्मसाठी चारा, लस आणि अवजारे जोडा.', browse: 'उत्पादने पहा',
    deliveryIn: 'डिलिव्हरी', days: '1–2 दिवसांत', toFarm: 'तुमच्या फार्मपर्यंत', free: 'मोफत', fbt: 'नेहमी सोबत खरेदी केले जाते', must: 'आवश्यक',
    popular: '⚡ तुमच्यासारख्या शेतकऱ्यांत लोकप्रिय', bill: 'बिल तपशील', saved: 'बचत', itemsTotal: 'वस्तूंची एकूण किंमत', deliveryFee: 'डिलिव्हरी शुल्क', freeCaps: 'मोफत',
    handling: 'हँडलिंग / प्लॅटफॉर्म शुल्क', toPay: 'एकूण देय', policyH: 'रद्द करण्याचे धोरण:',
    policy: 'शिप झाल्यानंतर ऑर्डर रद्द करता येत नाही. उशीर झाल्यास पूर्ण परतावा दिला जाईल.',
    payable: 'एकूण देय रक्कम', proceed: 'पैसे भरा', ordered: 'तुमच्या आवडीबद्दल धन्यवाद! बाजारपेठ पाइपलाइन तयार केली जात आहे.', soon: 'शेतकरी प्रोफाइल लवकरच येत आहे',
    off: 'सूट', favourite: 'आवडते', close: 'कार्ट बंद करा', clearSearch: 'शोध काढा',
    sorts: { rel: 'सुसंगतता', low: 'किंमत: कमी ते जास्त', high: 'किंमत: जास्त ते कमी', rated: 'सर्वोत्तम रेटिंग' },
    prices: { any: 'कोणतीही किंमत', u250: '₹250 पेक्षा कमी', m: '₹250 – ₹600', o600: '₹600 पेक्षा जास्त' },
    cats: { Feed: 'चारा', Health: 'आरोग्य', 'Dairy care': 'दुग्ध काळजी', Poultry: 'कुक्कुटपालन', Tools: 'अवजारे' },
    eta: { Tomorrow: 'उद्या', '2 days': '2 दिवस', '3 days': '3 दिवस' },
  },
} as const;

// [name, tag, suited-for] per product
const PRODUCT_I18N: Record<Lang, Record<string, [string, string, string]>> = {
  en: {},
  hi: {
    p1: ['प्रीमियम पशु आहार पेलेट 50 किग्रा', 'पशु आहार', 'गाय व भैंस'],
    p2: ['कैल्शियम युक्त खनिज मिश्रण पाउडर', 'खनिज', 'गाय व बकरी'],
    p3: ['पोल्ट्री लेयर फ़ीड क्रम्बल 25 किग्रा', 'लेयर फ़ीड', 'मुर्गियाँ'],
    p4: ['आयोडीन आधारित टीट डिप घोल', 'थन देखभाल', 'दुधारू गाय'],
    p5: ['खुरपका-मुँहपका टीका कोल्ड-चेन किट (10 खुराक)', 'टीका', 'पशु'],
    p6: ['स्टेनलेस स्टील दूध दुहने की बाल्टी', 'दूध दुहना', 'दुधारू गाय'],
    p7: ['चारा कटर ब्लेड सेट', 'ब्लेड', 'सभी फार्म'],
    p8: ['डिजिटल पशु थर्मामीटर', 'थर्मामीटर', 'सभी पशु'],
    p9: ['चूज़ा स्टार्टर फ़ीड क्रम्बल 10 किग्रा', 'चूज़ा फ़ीड', 'चूज़े'],
    p10: ['हरा चारा बीज मिश्रण (मक्का + बाजरा)', 'चारा बीज', 'गाय व भैंस'],
    p11: ['स्वचालित पोल्ट्री पानी पात्र', 'पानी पात्र', 'मुर्गियाँ'],
    p12: ['खुर ट्रिमिंग किट दस्तानों सहित', 'खुर देखभाल', 'पशु'],
  },
  mr: {
    p1: ['प्रीमियम पशुखाद्य पेलेट 50 किलो', 'पशुखाद्य', 'गाय व म्हैस'],
    p2: ['कॅल्शियमयुक्त खनिज मिश्रण पावडर', 'खनिजे', 'गाय व शेळी'],
    p3: ['कुक्कुट लेयर फीड क्रम्बल 25 किलो', 'लेयर फीड', 'कोंबड्या'],
    p4: ['आयोडीन आधारित टीट डिप द्रावण', 'सड काळजी', 'दुधाळ गाय'],
    p5: ['लाळ्या खुरकूत लस कोल्ड-चेन किट (10 मात्रा)', 'लस', 'गुरे'],
    p6: ['स्टेनलेस स्टील दूध काढण्याची बादली', 'दूध काढणे', 'दुधाळ गाय'],
    p7: ['चारा कटर ब्लेड सेट', 'ब्लेड', 'सर्व फार्म'],
    p8: ['डिजिटल जनावरांचा थर्मामीटर', 'थर्मामीटर', 'सर्व जनावरे'],
    p9: ['पिल्लू स्टार्टर फीड क्रम्बल 10 किलो', 'पिल्लू फीड', 'पिल्ले'],
    p10: ['हिरवा चारा बियाणे मिश्रण (मका + बाजरी)', 'चारा बियाणे', 'गाय व म्हैस'],
    p11: ['स्वयंचलित कुक्कुट पाणी भांडे', 'पाणी भांडे', 'कोंबड्या'],
    p12: ['खुर छाटणी किट हातमोज्यांसह', 'खुरांची काळजी', 'गुरे'],
  },
};
const localUnit = (lang: Lang, unit: string) =>
  lang === 'en'
    ? unit
    : unit.replace('kg', lang === 'hi' ? 'किग्रा' : 'किलो').replace(' L', ' लि.').replace(' ml', ' मि.ली.').replace('doses', lang === 'hi' ? 'खुराक' : 'मात्रा').replace('pcs', 'नग').replace('pc', 'नग').replace('kit', 'किट');

// Cart + favourites survive switching dock tabs
let cartStore: Record<string, number> = {};
let favStore: Record<string, boolean> = { p1: true };

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

const CAT_ICONS: Record<Category, string> = { Feed: 'grass', Health: 'medical_services', 'Dairy care': 'water_drop', Poultry: 'egg_alt', Tools: 'construction' };

const Stepper: React.FC<{ qty: number; onAdd: () => void; onInc: () => void; onDec: () => void; small?: boolean }> = ({ qty, onAdd, onInc, onDec, small }) => {
  const size = small ? 'h-7' : 'h-9';
  return qty > 0 ? (
    <div className={`${size} flex items-center gap-1 rounded-full text-white select-none px-1 shadow-sm`} style={{ background: GREEN }}>
      <button type="button" onClick={onDec} aria-label="Decrease quantity" className="w-6 h-full flex items-center justify-center text-[15px] font-bold cursor-pointer active:scale-90 transition-transform">−</button>
      <span className="min-w-[14px] text-center text-[12.5px] font-bold">{qty}</span>
      <button type="button" onClick={onInc} aria-label="Increase quantity" className="w-6 h-full flex items-center justify-center text-[15px] font-bold cursor-pointer active:scale-90 transition-transform">+</button>
    </div>
  ) : (
    <button
      type="button"
      onClick={onAdd}
      aria-label="Add to cart"
      className={`${small ? 'w-7 h-7' : 'w-9 h-9'} rounded-full flex items-center justify-center text-white shadow-md cursor-pointer active:scale-90 transition-transform`}
      style={{ background: GREEN }}
    >
      <span className="material-symbols-outlined text-[20px] leading-none">add</span>
    </button>
  );
};

export const MarketplaceScreen: React.FC<Props> = ({ onHome, onFarmSetup, onOpenILearning }) => {
  const { t, language } = useLanguage();
  const L = (language as Lang) in TXT ? (language as Lang) : 'en';
  const x = TXT[L];
  const pi = (p: Product): [string, string, string] => PRODUCT_I18N[L][p.id] ?? [p.name, p.tag, p.for];
  const [query, setQuery] = useState('');
  const [cart, setCartState] = useState<Record<string, number>>(cartStore);
  const [favs, setFavsState] = useState<Record<string, boolean>>(favStore);
  const [sort, setSort] = useState<(typeof SORTS)[number]['id']>('rel');
  const [price, setPrice] = useState('any');
  const [category, setCategory] = useState<Category | null>(null);
  const [menu, setMenu] = useState<null | 'sort' | 'price' | 'cat'>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const bannerTextRef = useRef<HTMLDivElement>(null);
  const poultryTextRef = useRef<HTMLDivElement>(null);
  const learnTextRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [slide, setSlide] = useState(0);
  const chipsRef = useRef<HTMLDivElement>(null);
  const [menuTop, setMenuTop] = useState(200);
  const toastTimer = useRef<number | undefined>(undefined);
  React.useEffect(() => () => { window.clearTimeout(toastTimer.current); }, []);

  // Anchor the sort/price menu right under the chips that opened it
  React.useEffect(() => {
    if (!menu || !chipsRef.current) return;
    const root = chipsRef.current.closest('.h-full') as HTMLElement | null;
    const r = chipsRef.current.getBoundingClientRect();
    const o = root?.getBoundingClientRect();
    setMenuTop(r.bottom - (o?.top ?? 0) + 6);
  }, [menu]);

  useBackLayer(cartOpen, () => setCartOpen(false));

  const setCart = (next: Record<string, number>) => {
    cartStore = next;
    setCartState(next);
  };
  const change = (id: string, delta: number) => {
    const q = Math.max(0, (cart[id] ?? 0) + delta);
    const next = { ...cart };
    if (q === 0) delete next[id];
    else next[id] = q;
    setCart(next);
  };
  const toggleFav = (id: string) => {
    favStore = { ...favStore, [id]: !favStore[id] };
    setFavsState(favStore);
  };

  const byId = (id: string) => PRODUCTS.find((p) => p.id === id)!;
  const lines = Object.keys(cart).map((id) => ({ p: byId(id), qty: cart[id] }));
  const totalQty = lines.reduce((s, l) => s + l.qty, 0);
  const itemTotal = lines.reduce((s, l) => s + l.qty * l.p.price, 0);
  const saved = lines.reduce((s, l) => s + l.qty * ((l.p.mrp ?? l.p.price) - l.p.price), 0);
  const grand = itemTotal + HANDLING;

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const priceTest = PRICES.find((p) => p.id === price)!.test;
    let list = PRODUCTS.filter(
      (p) =>
        (!q || `${p.name} ${p.tag} ${p.category} ${p.for} ${pi(p).join(' ')} ${x.cats[p.category]}`.toLowerCase().includes(q)) &&
        (!category || p.category === category) &&
        priceTest(p.price),
    );
    if (sort === 'low') list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === 'high') list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === 'rated') list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [query, category, price, sort, L]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  };
  // Checkout isn't live yet: show the friendly blue note and leave the cart as it is
  const placeOrder = () => showToast(x.ordered);
  const scrollToProducts = () => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const showSoon = () => showToast(x.soon);

  const dock = [
    { icon: 'home', label: t('home'), onClick: onHome },
    { icon: 'storefront', label: t('farmSetup'), onClick: onFarmSetup },
    { icon: 'shopping_cart', label: t('marketplace'), onClick: () => {} },
    { icon: 'account_circle', label: t('farmerProfile'), onClick: () => setProfileOpen(true) },
  ];

  const sortPriceChip = (key: 'sort' | 'price', label: string, active: boolean) => (
    <button
      type="button"
      onClick={() => setMenu(menu === key ? null : key)}
      className={`flex items-center gap-0.5 pl-3 pr-2 py-1.5 rounded-full text-[11.5px] font-semibold whitespace-nowrap cursor-pointer active:scale-95 transition-all shadow-[0_1px_4px_rgba(19,78,63,0.08)] ${
        active ? 'bg-[#134e3f] text-white' : 'bg-white text-[#404945]'
      }`}
    >
      <span>{label}</span>
      <span className="material-symbols-outlined text-[16px] leading-none">expand_more</span>
    </button>
  );

  const menuItems =
    menu === 'sort'
      ? SORTS.map((s) => ({ id: s.id, label: x.sorts[s.id], active: sort === s.id, pick: () => setSort(s.id) }))
      : menu === 'price'
        ? PRICES.map((s) => ({ id: s.id, label: x.prices[s.id as keyof typeof x.prices], active: price === s.id, pick: () => setPrice(s.id) }))
        : [];

  const catRow: { id: Category | null; icon: string; label: string }[] = [
    { id: null, icon: 'apps', label: x.allCats },
    ...CATEGORIES.map((c) => ({ id: c as Category | null, icon: CAT_ICONS[c], label: x.cats[c] })),
  ];

  return (
    <div className="h-full flex flex-col relative text-[#191c1b] antialiased font-['Plus_Jakarta_Sans','Inter',sans-serif]" style={{ background: 'linear-gradient(rgb(232,249,255) 0%, rgb(232,249,255) 42%, rgb(255,248,214) 60%, rgb(255,248,214) 100%)' }}>
      {/* Top bar (same style as the farm articles / Farm Setup screens) */}
      <header className="liquid-glass !rounded-none !border-0 !shadow-[0_6px_24px_-10px_rgba(19,78,63,0.22)] absolute inset-x-0 top-0 z-30 w-full py-2.5 px-4">
        <div className="flex items-center justify-between gap-2 min-h-[35px]">
          <h1 className={`${serif} text-[19px] font-bold text-[#191c1b] leading-tight whitespace-nowrap`}>{t('marketplace')}<span aria-hidden className="relative -top-[7px] ml-[1px] text-[10px] font-normal text-[#191c1b]/80">™</span></h1>
        </div>
      </header>

      {/* Dropdown menu */}
      <AnimatePresence>
        {menu && (
          <>
            <div className="absolute inset-0 z-40" onClick={() => setMenu(null)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.14 }}
              className="absolute right-4 z-50 min-w-[200px] bg-white rounded-2xl shadow-[0_16px_40px_-8px_rgba(19,78,63,0.28)] py-1.5 overflow-hidden border border-black/5"
              style={{ top: menuTop }}
            >
              {menuItems.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { m.pick(); setMenu(null); }}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-2.5 text-[13px] text-left cursor-pointer hover:bg-[#f3f7f4] ${m.active ? 'font-bold text-[#134e3f]' : 'font-medium text-gray-800'}`}
                >
                  {m.label}
                  {m.active && <span className="material-symbols-outlined text-[16px]">check</span>}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Scrolling content */}
      <div ref={scrollRef} className="relative z-10 flex-1 overflow-y-auto scrollbar-none px-4 pt-[62px]" style={{ paddingBottom: totalQty > 0 ? 190 : 120 }}>
        {/* Search */}
        <div className="flex items-center bg-white rounded-full px-4 h-12 shadow-[0_6px_20px_-8px_rgba(19,78,63,0.25)] border border-black/[0.04]">
          <span className="material-symbols-outlined text-[22px] text-[#134e3f] mr-2">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={x.search}
            className="w-full bg-transparent border-none p-0 text-[14px] font-medium text-gray-800 placeholder:text-gray-400 outline-none"
          />
          {query ? (
            <button type="button" aria-label={x.clearSearch} onClick={() => setQuery('')} className="cursor-pointer">
              <span className="material-symbols-outlined text-[20px] text-gray-400" style={{ fontVariationSettings: "'FILL' 1" }}>cancel</span>
            </button>
          ) : (
            <span className="material-symbols-outlined text-[22px] text-[#404945]">mic</span>
          )}
        </div>

        {/* Featured banner carousel */}
        {!query && (
          <div className="mt-2.5">
            <div
              ref={carouselRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const stride = (el.clientWidth - 26) * 0.88 + 10;
                setSlide(Math.max(0, Math.min(2, Math.round(el.scrollLeft / stride))));
              }}
              className="-mx-4 pl-2.5 pr-4 scroll-pl-2.5 flex gap-2.5 overflow-x-auto scrollbar-none snap-x snap-mandatory pt-2 -mt-2 pb-10 -mb-10"
            >
              {[
                { key: 'dairy', cat: null as Category | null, kicker: x.bannerKicker, title: x.bannerTitle, sub: x.bannerSub, art: 'p1', textRef: bannerTextRef, kickerColor: 'text-emerald-200/90', btn: '#134e3f',
                  bg: 'radial-gradient(120% 90% at 100% 100%, #3a9a78 0%, rgba(58,154,120,0) 55%), linear-gradient(135deg, #0b3328 0%, #14543f 48%, #2a8466 100%)', shadow: 'rgba(19,78,63,0.55)', cta: x.shopNow },
                { key: 'poultry', cat: 'Poultry' as Category | null, kicker: x.pKicker, title: x.pTitle, sub: x.pSub, art: 'p3', textRef: poultryTextRef, kickerColor: 'text-amber-200/90', btn: '#6b3f12',
                  bg: 'radial-gradient(120% 90% at 100% 100%, #e3a14f 0%, rgba(227,161,79,0) 55%), linear-gradient(135deg, #3a2410 0%, #7a4a18 48%, #b8742a 100%)', shadow: 'rgba(107,63,18,0.55)', cta: x.shopNow },
                { key: 'learn', cat: null as Category | null, kicker: x.lKicker, title: x.lTitle, sub: x.lSub, art: 'learn', textRef: learnTextRef, kickerColor: 'text-cyan-200/90', btn: '#0f4a5a',
                  bg: 'radial-gradient(120% 90% at 100% 100%, #46b4c0 0%, rgba(70,180,192,0) 55%), linear-gradient(135deg, #0a2f3b 0%, #145466 48%, #2a8a9c 100%)', shadow: 'rgba(15,74,90,0.55)', cta: x.startLearning },
              ].map((c) => (
                <section
                  key={c.key}
                  role="button"
                  tabIndex={0}
                  onClick={() => { if (c.key === 'learn') onOpenILearning?.(); else { setCategory(c.cat); scrollToProducts(); } }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (c.key === 'learn') onOpenILearning?.(); else { setCategory(c.cat); scrollToProducts(); } } }}
                  className="relative shrink-0 w-[88%] snap-start rounded-[28px] overflow-hidden px-5 py-5 text-white cursor-pointer active:scale-[0.985] transition-transform select-none"
                  style={{ background: c.bg, boxShadow: `0 14px 30px -12px ${c.shadow}` }}
                >
                  <span className="absolute -right-10 -top-12 w-44 h-44 rounded-full bg-white/[0.07]" />
                  <span className="absolute -right-2 -bottom-16 w-40 h-40 rounded-full bg-white/[0.06]" />
                  <div className="relative z-10 w-[58%]">
                    <div ref={c.textRef}>
                      <span className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${c.kickerColor}`}>{c.kicker}</span>
                      <h2 className={`${serif} ${c.key === 'learn' ? 'text-[16.5px] leading-[1.2]' : 'text-[22px] leading-[1.15]'} font-bold mt-1.5`}>{c.title}</h2>
                      <p className={`${c.key === 'learn' ? 'text-[11px]' : 'text-[11.5px]'} leading-snug text-white/75 mt-2`}>{c.sub}</p>
                    </div>
                    <span className="mt-4 inline-flex items-center gap-1 h-9 pl-4 pr-3 rounded-full bg-white text-[12px] font-bold" style={{ color: c.btn }}>
                      {c.cta}
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </span>
                  </div>
                  <ProductArt id={c.art} className="absolute right-1 bottom-1 w-[40%] h-[78%] rotate-[8deg] drop-shadow-[0_10px_14px_rgba(0,0,0,0.35)]" />
                  {/* little animal ambling around the card, never over the text */}
                  {c.key === 'dairy' ? <WanderingCow noGraze avoidRef={c.textRef} /> : c.key === 'poultry' ? <WanderingChick avoidRef={c.textRef} /> : null}
                </section>
              ))}
            </div>
            <div className="relative z-10 flex justify-center gap-1.5 mt-3">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Card ${i + 1}`}
                  onClick={() => {
                    const el = carouselRef.current;
                    if (el) el.scrollTo({ left: i * ((el.clientWidth - 26) * 0.88 + 10), behavior: 'smooth' });
                  }}
                  className="h-1.5 rounded-full transition-all cursor-pointer"
                  style={{ width: slide === i ? 18 : 6, background: slide === i ? GREEN : '#c3cdc7' }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category row */}
        <div className="-mx-4 mt-5 px-4 overflow-x-auto scrollbar-none flex gap-3.5">
          {catRow.map((c) => {
            const active = (c.id ?? null) === category;
            return (
              <button key={c.label} type="button" onClick={() => setCategory(c.id)} className="shrink-0 w-[62px] flex flex-col items-center gap-1.5 cursor-pointer">
                <span
                  className={`w-[54px] h-[54px] rounded-full flex items-center justify-center transition-all ${active ? 'text-white shadow-[0_8px_16px_-6px_rgba(19,78,63,0.6)]' : 'bg-white text-[#134e3f] shadow-[0_3px_10px_-4px_rgba(19,78,63,0.25)]'}`}
                  style={active ? { background: GREEN } : undefined}
                >
                  <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{c.icon}</span>
                </span>
                <span className={`text-[10.5px] leading-tight text-center line-clamp-1 ${active ? 'font-bold text-[#134e3f]' : 'font-medium text-[#404945]'}`}>{c.label}</span>
              </button>
            );
          })}
        </div>

        {/* Section header + sort/price */}
        <div ref={gridRef} className="mt-6 mb-3 flex items-end justify-between gap-2 scroll-mt-[62px]">
          <div>
            <h2 className={`${serif} text-[21px] font-bold leading-tight`}>{x.popular2}</h2>
            <p className="text-[11.5px] text-[#6b7571] mt-0.5">{shown.length} {x.results}</p>
          </div>
          <div ref={chipsRef} className="flex gap-1.5 shrink-0">
            {sortPriceChip('sort', sort === 'rel' ? x.sort : x.sorts[sort], sort !== 'rel')}
            {sortPriceChip('price', price === 'any' ? x.price : x.prices[price as keyof typeof x.prices], price !== 'any')}
          </div>
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <div className="flex flex-col items-center text-center pt-10 px-8 gap-2">
            <span className="material-symbols-outlined text-[44px] text-[#b9c4be]">search_off</span>
            <p className={`${serif} text-[18px] font-bold`}>{x.noneTitle}</p>
            <p className="text-xs text-[#6b7571]">{x.noneDesc}</p>
            <button
              type="button"
              onClick={() => { setQuery(''); setCategory(null); setPrice('any'); setSort('rel'); }}
              className="mt-2 px-5 h-10 rounded-full text-white text-xs font-bold cursor-pointer"
              style={{ background: GREEN }}
            >
              {x.clear}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3.5">
            {shown.map((p) => (
              <article key={p.id} className="bg-white rounded-[24px] p-2.5 shadow-[0_10px_26px_-12px_rgba(19,78,63,0.28)] border border-black/[0.03] flex flex-col">
                <div
                  className="relative rounded-[18px] h-[132px] flex items-center justify-center overflow-hidden"
                  style={{ background: `radial-gradient(circle at 50% 38%, #ffffff 0%, ${p.from}55 100%)` }}
                >
                  <button
                    type="button"
                    aria-label={x.favourite}
                    onClick={() => toggleFav(p.id)}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center cursor-pointer active:scale-90 transition-transform"
                  >
                    <span
                      className="material-symbols-outlined text-[17px] leading-none"
                      style={{ color: favs[p.id] ? '#e0475b' : '#8a948f', fontVariationSettings: favs[p.id] ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      favorite
                    </span>
                  </button>
                  {p.mrp && (
                    <span className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-full bg-[#134e3f] text-white text-[9.5px] font-bold tracking-wide">
                      {Math.round(((p.mrp - p.price) / p.mrp) * 100)}% {x.off}
                    </span>
                  )}
                  <ProductArt id={p.id} className="w-[84%] h-[84%] drop-shadow-[0_6px_8px_rgba(0,0,0,0.12)]" />
                </div>
                <div className="px-1 pt-2.5 flex-1 flex flex-col">
                  <h3 className="text-[13px] font-semibold leading-snug text-[#191c1b] line-clamp-2 min-h-[34px]">{pi(p)[0]}</h3>
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6b7571]">
                    <span>{localUnit(L, p.unit)}</span>
                    <span className="w-[3px] h-[3px] rounded-full bg-[#b9c4be]" />
                    <span className="inline-flex items-center gap-0.5"><span className="text-amber-500">★</span>{p.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-end justify-between mt-2.5 min-h-[36px]">
                    <div className="leading-none">
                      <span className={`${serif} text-[19px] font-bold text-[#134e3f]`}>{inr(p.price)}</span>
                      {p.mrp && <span className="block text-[10.5px] text-gray-400 line-through mt-1">{inr(p.mrp)}</span>}
                    </div>
                    <Stepper qty={cart[p.id] ?? 0} onAdd={() => change(p.id, 1)} onInc={() => change(p.id, 1)} onDec={() => change(p.id, -1)} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Floating cart bar */}
      <AnimatePresence>
        {totalQty > 0 && !cartOpen && (
          <motion.button
            type="button"
            key="cartbar"
            onClick={() => setCartOpen(true)}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="absolute inset-x-4 z-30 text-white rounded-full pl-3 pr-2 h-14 shadow-[0_16px_30px_-10px_rgba(19,78,63,0.7)] flex items-center justify-between cursor-pointer text-left"
            style={{ bottom: 'calc(max(12px, env(safe-area-inset-bottom)) + 76px)', background: 'linear-gradient(135deg, #0f3d31 0%, #1d6a54 100%)' }}
          >
            <span className="flex items-center gap-2.5 min-w-0">
              <span className="relative shrink-0 w-10 h-10 rounded-full bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[21px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                <span className="absolute -top-1 -right-1 bg-amber-300 text-[#134e3f] font-extrabold text-[10px] min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center">{totalQty}</span>
              </span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold leading-tight">{inr(itemTotal)}</span>
                <span className="block text-[10px] text-emerald-100/80 leading-tight mt-0.5 whitespace-nowrap truncate">{totalQty} {totalQty === 1 ? x.itemL : x.itemsL} · {x.freeUnlocked}</span>
              </span>
            </span>
            <span className="bg-white h-10 pl-3.5 pr-2.5 rounded-full text-[12px] font-bold flex items-center gap-0.5 whitespace-nowrap shrink-0" style={{ color: GREEN }}>
              {x.viewCart} <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            role="status"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute inset-x-6 z-[70] mx-auto max-w-[320px] px-4 py-2.5 rounded-2xl text-center text-[12px] font-semibold leading-snug text-[#1F4E7A] border border-[#bcd9f2]/80 backdrop-blur-md shadow-[0_8px_22px_-8px_rgba(60,120,190,0.45)]"
            style={{ bottom: cartOpen ? 100 : 'calc(max(12px, env(safe-area-inset-bottom)) + 76px)', background: 'rgba(214,234,250,0.92)' }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cart sheet */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div
            key="sheet"
            className="absolute inset-0 z-[60] flex items-end bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 380, damping: 38 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-h-[88%] bg-gray-50 rounded-t-3xl flex flex-col relative overflow-hidden"
            >
              <div className="w-full pt-3 pb-1 flex justify-center"><div className="w-10 h-1 rounded-full bg-gray-300" /></div>
              <div className="px-4 py-2.5 flex items-center justify-between border-b border-gray-100 bg-white">
                <div>
                  <h2 className={`${serif} text-[19px] font-bold text-[#191c1b] leading-tight`}>{x.myCart} ({totalQty} {totalQty === 1 ? x.itemL : x.itemsL})</h2>
                  <p className="text-[11px] text-gray-500 font-medium">{x.brand}</p>
                </div>
                <button type="button" aria-label={x.close} onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {totalQty === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center" style={{ color: GREEN }}>
                    <span className="material-symbols-outlined text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-800">{x.emptyTitle}</h3>
                  <p className="text-xs text-gray-500 max-w-xs">{x.emptyDesc}</p>
                  <button type="button" onClick={() => setCartOpen(false)} className="mt-1 text-white text-xs font-bold px-6 py-2.5 rounded-xl cursor-pointer" style={{ background: GREEN }}>
                    {x.browse}
                  </button>
                </div>
              ) : (
                <>
                  <div className="bg-emerald-50 px-4 py-2 border-b border-emerald-100 flex items-center justify-between text-xs text-emerald-900 font-semibold">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />
                      {x.deliveryIn} <b style={{ color: GREEN }}>{x.days}</b> {x.toFarm}
                    </span>
                    <span className="text-[10px] bg-white text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-bold uppercase tracking-wider">{x.free}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto scrollbar-none px-4 py-3 space-y-3 pb-24">
                    <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
                      {lines.map(({ p, qty }, i) => (
                        <div key={p.id} className={`flex items-center justify-between gap-3 ${i < lines.length - 1 ? 'border-b border-gray-100 pb-3' : ''}`}>
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <div className="w-11 h-11 rounded-lg flex items-center justify-center text-[22px] shrink-0 p-0.5" style={{ background: `linear-gradient(160deg, ${p.from}66, ${p.to}55)` }}><ProductArt id={p.id} className="w-full h-full" /></div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs font-semibold text-gray-800 truncate">{pi(p)[0]}</h4>
                              <p className="text-[11px] text-gray-400">{localUnit(L, p.unit)}</p>
                              <div className="text-xs font-black text-gray-900 mt-0.5">{inr(p.price)}</div>
                            </div>
                          </div>
                          <Stepper qty={qty} onAdd={() => change(p.id, 1)} onInc={() => change(p.id, 1)} onDec={() => change(p.id, -1)} />
                        </div>
                      ))}
                    </div>

                    <section className="bg-white rounded-2xl border border-gray-100 p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-gray-900">{x.fbt}</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 rounded-full">{x.must}</span>
                      </div>
                      <p className="text-[10.5px] text-gray-500 font-medium mt-0.5 mb-2.5">{x.popular}</p>
                      <div className="overflow-x-auto scrollbar-none flex items-stretch gap-2.5 pb-1 snap-x snap-mandatory">
                        {FBT.map(byId).map((p) => (
                          <div key={p.id} className="min-w-[136px] max-w-[136px] bg-gray-50 rounded-xl border border-gray-200 p-2 flex flex-col justify-between snap-start shrink-0">
                            <div>
                              <div className="relative h-20 rounded-lg flex items-center justify-center " style={{ background: `linear-gradient(160deg, ${p.from}66, ${p.to}55)` }}>
                                <span className="absolute top-1 left-1 text-[8px] bg-white/70 text-gray-700 font-extrabold px-1 rounded uppercase">{pi(p)[1]}</span>
                                <ProductArt id={p.id} className="w-[82%] h-[82%] mt-2" />
                              </div>
                              <div className="text-[10px] text-gray-400 font-medium mt-1.5">{localUnit(L, p.unit)}</div>
                              <h4 className="text-[11px] font-bold text-gray-800 leading-snug line-clamp-2 mt-0.5">{pi(p)[0]}</h4>
                            </div>
                            <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-gray-200">
                              <span className="text-xs font-black text-gray-900">{inr(p.price)}</span>
                              <Stepper small qty={cart[p.id] ?? 0} onAdd={() => change(p.id, 1)} onInc={() => change(p.id, 1)} onDec={() => change(p.id, -1)} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    <div className="bg-white rounded-2xl border border-gray-100 p-3.5 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-900 pb-1 border-b border-gray-100">
                        <span>{x.bill}</span>
                        {saved > 0 && <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">🏷️ {inr(saved)} {x.saved}</span>}
                      </div>
                      <div className="space-y-1.5 text-xs text-gray-600 font-medium">
                        <div className="flex justify-between"><span>{x.itemsTotal}</span><span className="text-gray-900 font-semibold">{inr(itemTotal)}</span></div>
                        <div className="flex justify-between items-center">
                          <span>{x.deliveryFee}</span>
                          <span><span className="line-through text-gray-400 text-[11px] mr-1.5">₹15</span><b style={{ color: GREEN }}>{x.freeCaps}</b></span>
                        </div>
                        <div className="flex justify-between"><span>{x.handling}</span><span className="text-gray-900 font-semibold">{inr(HANDLING)}</span></div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between text-sm font-extrabold text-gray-900"><span>{x.toPay}</span><span className="text-base">{inr(grand)}</span></div>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-3 text-[11px] text-gray-500 leading-relaxed">
                      <span className="font-bold text-gray-800">{x.policyH}</span> {x.policy}
                    </div>
                  </div>

                  <div className="absolute bottom-0 inset-x-0 bg-white border-t border-gray-100 p-3.5 shadow-2xl flex items-center justify-between z-10">
                    <div>
                      <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">{x.payable}</div>
                      <div className="text-lg font-black text-gray-900 leading-none">{inr(grand)}</div>
                    </div>
                    <button type="button" onClick={placeOrder} className="text-white font-extrabold text-sm px-6 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer active:scale-95 transition-transform" style={{ background: GREEN }}>
                      {x.proceed} <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <ProfileSheet open={profileOpen} onClose={() => setProfileOpen(false)} />

      {/* Dock (same as home, Marketplace active) */}
      <nav className="absolute inset-x-4 max-w-[390px] mx-auto z-40" style={{ bottom: 'max(12px, env(safe-area-inset-bottom))' }}>
        <div
          className="liquid-glass relative w-full rounded-full p-1.5 grid grid-cols-4 items-center"
        >
          {dock.map((tab, index) => {
            const active = index === 2;
            return (
              <button
                key={tab.icon}
                type="button"
                onClick={tab.onClick}
                aria-current={active ? 'page' : undefined}
                className={`relative flex flex-col items-center justify-center h-[52px] min-w-0 whitespace-nowrap rounded-full cursor-pointer ${active ? 'text-[#00362a]' : 'text-[#404945]'}`}
              >
                {active && <DockPill index={index} />}
                <span className="relative material-symbols-outlined text-[26px] leading-none" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>{tab.icon}</span>
                <span className="relative text-[10.5px] leading-tight tracking-tight mt-0.5 font-semibold">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
