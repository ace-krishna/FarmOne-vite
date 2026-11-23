import React, { useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { goBack, pushLayer } from '../../lib/backStack';
import { StitchHomeScreen } from '../screens/StitchHomeScreen';
import { RegisterAnimalScreen } from '../screens/RegisterAnimalScreen';
import { VaccinationScreen } from '../screens/VaccinationScreen';
import { MyAnimalsScreen } from '../screens/MyAnimalsScreen';
import { VaccinationGuideScreen } from '../screens/VaccinationGuideScreen';
import { FarmSetupScreen } from '../screens/FarmSetupScreen';
import { MarketplaceScreen } from '../screens/MarketplaceScreen';
import { DairyFarmSetupScreen } from '../screens/DairyFarmSetupScreen';
import { DairyCostArticleScreen } from '../screens/DairyCostArticleScreen';
import { PoultryFarmSetupScreen } from '../screens/PoultryFarmSetupScreen';
import { PoultryTypeArticleScreen } from '../screens/PoultryTypeArticleScreen';
import { PoultryRuleBookArticleScreen } from '../screens/PoultryRuleBookArticleScreen';
import { PoultryAcrossIndiaArticleScreen } from '../screens/PoultryAcrossIndiaArticleScreen';
import { PoultrySitingArticleScreen } from '../screens/PoultrySitingArticleScreen';
import { PoultryEggToBirdArticleScreen } from '../screens/PoultryEggToBirdArticleScreen';
import { PoultryCostArticleScreen } from '../screens/PoultryCostArticleScreen';
import { ChaffCutterArticleScreen } from '../screens/ChaffCutterArticleScreen';
import { DairyInsureArticleScreen } from '../screens/DairyInsureArticleScreen';
import { GovSchemesScreen } from '../screens/GovSchemesScreen';
import { GovSchemeFinderArticleScreen } from '../screens/GovSchemeFinderArticleScreen';
import { GovApplyArticleScreen } from '../screens/GovApplyArticleScreen';
import { GovCalcArticleScreen } from '../screens/GovCalcArticleScreen';
import { ILearningScreen } from '../screens/ILearningScreen';
import { PoultryILearningScreen } from '../screens/PoultryILearningScreen';
import { DairyILearningScreen } from '../screens/DairyILearningScreen';
import { HeatStressArticleScreen } from '../screens/HeatStressArticleScreen';
import { WaterArticleScreen } from '../screens/WaterArticleScreen';
import { TeatArticleScreen } from '../screens/TeatArticleScreen';
import { FatArticleScreen } from '../screens/FatArticleScreen';
import { ManureArticleScreen } from '../screens/ManureArticleScreen';
import { DeadBirdsArticleScreen } from '../screens/DeadBirdsArticleScreen';
import { DryLitterArticleScreen } from '../screens/DryLitterArticleScreen';
import { PestsArticleScreen } from '../screens/PestsArticleScreen';
import { HealthyChicksArticleScreen } from '../screens/HealthyChicksArticleScreen';

export const ExpoGoShell: React.FC = () => {
  type Screen = 'home' | 'farm-setup' | 'marketplace' | 'dairy-setup' | 'poultry-setup' | 'poultry-type-article' | 'poultry-rule-article' | 'poultry-across-article' | 'poultry-siting-article' | 'poultry-egg-article' | 'poultry-cost-article' | 'dairy-cost-article' | 'chaff-article' | 'dairy-insure-article' | 'gov-schemes' | 'gov-finder-article' | 'gov-apply-article' | 'gov-calc-article' | 'register' | 'vaccination' | 'my-animals' | 'vaccination-guide' | 'ilearning' | 'poultry-ilearning' | 'dairy-ilearning' | 'heat-article' | 'water-article' | 'teat-article' | 'fat-article' | 'manure-article' | 'deadbirds-article' | 'litter-article' | 'pests-article' | 'chicks-article';
  const [screen, setScreen] = useState<Screen>('home');
  const [costSection, setCostSection] = useState<'shed' | 'paperwork' | 'yield' | undefined>(undefined);
  const screenRef = useRef<Screen>(screen);
  screenRef.current = screen;

  // How the next screen change animates: slide in/out when going deeper, cross-fade for the dock tabs
  type Dir = 'push' | 'pop' | 'fade';
  const [dir, setDir] = useState<Dir>('fade');
  const fastRef = useRef(false); // true while a dock tap steps back through several screens
  const reduceMotion = useReducedMotion();
  const isTab = (sc: Screen) => sc === 'home' || sc === 'farm-setup' || sc === 'marketplace';

  // Moving forward records a history entry, so the phone's Back button / gesture returns here
  const go = (next: Screen) => {
    const prev = screenRef.current;
    const tabSwitch = isTab(prev) && isTab(next);
    setDir(tabSwitch ? 'fade' : 'push');
    setScreen(next);
    // Dock switch between two tabs: swap in place. The history entry from Home stays, so Back
    // (and the Home dock button) always returns to Home instead of bouncing between tabs.
    if (tabSwitch && prev !== 'home') return;
    pushLayer(() => {
      setDir(tabSwitch || fastRef.current ? 'fade' : 'pop');
      setScreen(prev);
    });
  };
  // In-app back arrows behave exactly like the system Back
  const back = () => goBack(() => { setDir('fade'); setScreen('home'); });
  // Step back through history until a given screen is showing (used by dock taps on deep screens)
  const backUntil = (target: Screen, tries = 8) => {
    fastRef.current = true;
    const step = (n: number) => {
      if (screenRef.current === target || n <= 0) {
        fastRef.current = false;
        return;
      }
      back();
      window.setTimeout(() => step(n - 1), 90);
    };
    step(tries);
  };

  // Only transform / opacity are animated: they run on the GPU, so the slide stays smooth
  const variants = {
    enter: (d: Dir) =>
      d === 'push' ? { x: '100%', zIndex: 2 } : d === 'pop' ? { x: '-24%', zIndex: 1 } : { opacity: 1, zIndex: 2 },
    center: (d: Dir) => ({ x: 0, opacity: 1, zIndex: d === 'pop' ? 1 : 2 }),
    exit: (d: Dir) =>
      d === 'push' ? { x: '-24%', zIndex: 1 } : d === 'pop' ? { x: '100%', zIndex: 2 } : { opacity: 0.999, zIndex: 1 },
  };
  // Dock / tab switches are instant (no fade), like Instagram or WhatsApp; only push/pop slide
  const duration = reduceMotion || dir === 'fade' ? 0 : 0.3;

  return (
    <div className="min-h-[100dvh] w-full bg-[#e8ece7] flex items-center justify-center sm:py-4 selection:bg-emerald-200 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Phone Screen Container with authentic 375px mobile viewport */}
      <div 
        className="w-full sm:max-w-[375px] h-[100dvh] sm:h-[812px] bg-[#f9faf8] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.18)] overflow-clip flex flex-col relative select-none isolate"
      >
        <AnimatePresence initial={false} custom={dir}>
          <motion.div
            key={screen}
            custom={dir}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration, ease: [0.32, 0.72, 0, 1] }}
            style={{ willChange: 'transform' }}
            className="absolute inset-0 flex flex-col bg-[#f9faf8]"
          >
            {/* soft edge shadow that travels with the sliding screen */}
            <span
              aria-hidden
              className="absolute inset-y-0 -left-5 w-5 pointer-events-none z-[90]"
              style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.10), rgba(0,0,0,0))' }}
            />
        {screen === 'register' ? (
      <RegisterAnimalScreen onClose={back} />
    ) : screen === 'my-animals' ? (
      <MyAnimalsScreen onBack={back} />
    ) : screen === 'vaccination-guide' ? (
      <VaccinationGuideScreen onBack={back} onOpenTracker={() => go('vaccination')} />
    ) : screen === 'vaccination' ? (
      <VaccinationScreen onBack={back} />
    ) : screen === 'marketplace' ? (
      <MarketplaceScreen onHome={back} onFarmSetup={() => go('farm-setup')} onOpenILearning={() => go('ilearning')} />
    ) : screen === 'farm-setup' ? (
      <FarmSetupScreen onOpenMarketplace={() => go('marketplace')} onHome={back} onBack={back} onOpenDairy={() => go('dairy-ilearning')} onOpenDairySetup={() => go('dairy-setup')} onOpenChaff={() => go('chaff-article')} onOpenGov={() => go('gov-schemes')} onOpenPoultryCost={() => go('poultry-cost-article')} onOpenInsureArticle={() => go('dairy-insure-article')} onOpenRuleBook={() => go('poultry-rule-article')} onOpenCostArticle={() => { setCostSection(undefined); go('dairy-cost-article'); }} onOpenEggArticle={() => go('poultry-egg-article')} onOpenPoultry={() => go('poultry-ilearning')} onOpenPoultrySetup={() => go('poultry-setup')} onOpenChicksArticle={() => go('chicks-article')} />
    ) : screen === 'poultry-setup' ? (
      <PoultryFarmSetupScreen onOpenGuide={() => go('poultry-egg-article')} onOpenStep={(id) => { if (id === 'cost') go('poultry-cost-article'); else if (id === 'siting') go('poultry-siting-article'); else if (id === 'rule') go('poultry-rule-article'); else if (id === 'across') go('poultry-across-article'); else if (id === 'type') go('poultry-type-article'); }} onBack={back} onHome={() => backUntil('home')} onOpenILearning={() => go('ilearning')} />
    ) : screen === 'poultry-type-article' ? (
      <PoultryTypeArticleScreen onBack={back} onOpenNext={() => go('poultry-rule-article')} />
    ) : screen === 'poultry-rule-article' ? (
      <PoultryRuleBookArticleScreen onBack={back} onOpenNext={() => go('poultry-across-article')} />
    ) : screen === 'poultry-cost-article' ? (
      <PoultryCostArticleScreen onBack={back} onOpenNext={() => go('chaff-article')} />
    ) : screen === 'poultry-egg-article' ? (
      <PoultryEggToBirdArticleScreen onBack={back} onOpenNext={() => go('poultry-siting-article')} />
    ) : screen === 'poultry-siting-article' ? (
      <PoultrySitingArticleScreen onBack={back} onOpenNext={() => go('poultry-type-article')} />
    ) : screen === 'poultry-across-article' ? (
      <PoultryAcrossIndiaArticleScreen onBack={back} onOpenNext={() => go('manure-article')} />
    ) : screen === 'dairy-setup' ? (
      <DairyFarmSetupScreen onOpenGov={() => go('gov-schemes')} onOpenInsurance={() => go('dairy-insure-article')} onBack={back} onHome={() => backUntil('home')} onOpenGuide={() => { setCostSection(undefined); go('dairy-cost-article'); }} onOpenStep={(id) => { if (id === 'shed' || id === 'paperwork' || id === 'yield') { setCostSection(id); go('dairy-cost-article'); } }} />
    ) : screen === 'gov-schemes' ? (
      <GovSchemesScreen onBack={back} onHome={() => backUntil('home')} onFarmSetup={() => backUntil('farm-setup')} onOpenDairySetup={() => go('dairy-setup')} onOpenFinder={() => go('gov-finder-article')} onOpenApply={() => go('gov-apply-article')} onOpenCalc={() => go('gov-calc-article')} />
    ) : screen === 'gov-finder-article' ? (
      <GovSchemeFinderArticleScreen onBack={back} onOpenNext={() => go('gov-apply-article')} />
    ) : screen === 'gov-apply-article' ? (
      <GovApplyArticleScreen onBack={back} onOpenNext={() => go('gov-calc-article')} />
    ) : screen === 'gov-calc-article' ? (
      <GovCalcArticleScreen onBack={back} onOpenNext={() => { setCostSection(undefined); go('dairy-cost-article'); }} />
    ) : screen === 'dairy-insure-article' ? (
      <DairyInsureArticleScreen onBack={back} onOpenNext={() => go('poultry-cost-article')} />
    ) : screen === 'chaff-article' ? (
      <ChaffCutterArticleScreen onBack={back} />
    ) : screen === 'dairy-cost-article' ? (
      <DairyCostArticleScreen onBack={back} initialSection={costSection} />
    ) : screen === 'ilearning' ? (
      <ILearningScreen onBack={back} onOpenPoultry={() => go('poultry-ilearning')} onOpenDairy={() => go('dairy-ilearning')} onOpenChicksArticle={() => go('chicks-article')} onOpenHeatArticle={() => go('heat-article')} />
    ) : screen === 'dairy-ilearning' ? (
      <DairyILearningScreen onBack={back} onOpenArticle={(id) => { if (id === 'summer-heat') go('heat-article'); else if (id === 'water') go('water-article'); else if (id === 'hygiene') go('teat-article'); else if (id === 'fat') go('fat-article'); else if (id === 'chaff') go('chaff-article'); }} />
    ) : screen === 'heat-article' ? (
      <HeatStressArticleScreen onBack={back} onOpenNext={() => go('water-article')} />
    ) : screen === 'water-article' ? (
      <WaterArticleScreen onBack={back} onOpenNext={() => go('teat-article')} />
    ) : screen === 'teat-article' ? (
      <TeatArticleScreen onBack={back} onOpenNext={() => go('fat-article')} />
    ) : screen === 'fat-article' ? (
      <FatArticleScreen onBack={back} />
    ) : screen === 'poultry-ilearning' ? (
      <PoultryILearningScreen
        onBack={back}
        onOpenArticle={(id) => { if (id === 'manure') go('manure-article'); else if (id === 'dead-birds') go('deadbirds-article'); else if (id === 'daily-routine') go('litter-article'); else if (id === 'pests') go('pests-article'); else if (id === 'chicks') go('chicks-article'); }}
      />
    ) : screen === 'manure-article' ? (
      <ManureArticleScreen onBack={back} onOpenNext={() => go('deadbirds-article')} />
    ) : screen === 'deadbirds-article' ? (
      <DeadBirdsArticleScreen onBack={back} onOpenNext={() => go('litter-article')} />
    ) : screen === 'litter-article' ? (
      <DryLitterArticleScreen onBack={back} onOpenNext={() => go('pests-article')} />
    ) : screen === 'pests-article' ? (
      <PestsArticleScreen onBack={back} onOpenNext={() => go('manure-article')} />
    ) : screen === 'chicks-article' ? (
      <HealthyChicksArticleScreen onBack={back} />
    ) : (
      <StitchHomeScreen
        onAddAnimal={() => go('register')}
        onOpenVaccination={() => go('vaccination')}
        onOpenMyAnimals={() => go('my-animals')}
        onOpenVaccinationGuide={() => go('vaccination-guide')}
        onOpenILearning={() => go('ilearning')}
        onOpenFarmSetup={() => go('farm-setup')}
        onOpenMarketplace={() => go('marketplace')}
      />
    )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
