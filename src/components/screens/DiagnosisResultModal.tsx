import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import {
  type DiagnosisResult,
  type AnimalModelType,
  diagnoseAnimalImage,
} from '../../lib/aiDiagnosis';

interface DiagnosisResultModalProps {
  photo: string;
  initialResult: DiagnosisResult;
  animalName?: string;
  species?: string;
  onClose: () => void;
  onOpenVaccination?: () => void;
  onScanAnother?: () => void;
}

const UI_TEXT = {
  en: {
    title: 'AI Diagnostic Report',
    modelBadgeCattle: 'Cattle & Ruminants Model (YOLOv8)',
    modelBadgePoultry: 'Poultry Model (YOLOv8)',
    switchModel: 'Switch Model',
    switchToPoultry: 'Re-analyze with Poultry Model 🐔',
    switchToCattle: 'Re-analyze with Cattle Model 🐮',
    confidence: 'Confidence',
    probabilities: 'Probability Breakdown',
    symptoms: 'Key Symptoms & Observations',
    immediateAction: 'Recommended Immediate Care',
    vetConsult: 'Veterinary Action',
    healthyTitle: 'Animal appears Healthy!',
    healthyDesc: 'No acute symptoms of common contagious diseases were detected.',
    scheduleVaccine: 'Schedule Vaccination / Checkup',
    scanAnother: 'Scan Another',
    done: 'Done',
    analyzing: 'Re-running inference...',
    sourceServer: 'PyTorch Neural Net',
    sourceClient: 'Onnx WebAssembly',
    sourceFallback: 'Clinical Heuristic',
    severityNormal: 'Healthy / Normal',
    severityModerate: 'Moderate Concern',
    severityCritical: 'Urgent Attention Needed',
  },
  hi: {
    title: 'एआई स्वास्थ्य जांच रिपोर्ट',
    modelBadgeCattle: 'मवेशी मॉडल (YOLOv8)',
    modelBadgePoultry: 'पोल्ट्री / मुर्गी मॉडल (YOLOv8)',
    switchModel: 'मॉडल बदलें',
    switchToPoultry: 'मुर्गी मॉडल से जांचें 🐔',
    switchToCattle: 'मवेशी मॉडल से जांचें 🐮',
    confidence: 'सटीकता',
    probabilities: 'संभाव्यता विवरण',
    symptoms: 'प्रमुख लक्षण एवं संकेत',
    immediateAction: 'तत्काल देखभाल एवं उपचार',
    vetConsult: 'पशु चिकित्सक सलाह',
    healthyTitle: 'पशु स्वस्थ प्रतीत होता है!',
    healthyDesc: 'प्रमुख संक्रामक बीमारियों के कोई लक्षण नहीं पाए गए।',
    scheduleVaccine: 'टीकाकरण / जांच शेड्यूल करें',
    scanAnother: 'दूसरा पशु स्कैन करें',
    done: 'पूर्ण',
    analyzing: 'पुनः विश्लेषण हो रहा है...',
    sourceServer: 'पाइटॉर्च न्यूरल नेट',
    sourceClient: 'ऑनेक्स वेब असेंबली',
    sourceFallback: 'नैदानिक गाइड',
    severityNormal: 'स्वस्थ / सामान्य',
    severityModerate: 'मध्यम चिंता',
    severityCritical: 'तुरंत ध्यान देने योग्य',
  },
  mr: {
    title: 'एआय आरोग्य तपासणी अहवाल',
    modelBadgeCattle: 'जनावरे मॉडेल (YOLOv8)',
    modelBadgePoultry: 'कुक्कुटपालन मॉडेल (YOLOv8)',
    switchModel: 'मॉडेल बदला',
    switchToPoultry: 'कोंबडी मॉडेलने तपासा 🐔',
    switchToCattle: 'जनावर मॉडेलने तपासा 🐮',
    confidence: 'अचूकता',
    probabilities: 'संभाव्यता तपशील',
    symptoms: 'मुख्य लक्षणे व निरीक्षण',
    immediateAction: 'तात्काळ घ्यावयाची काळजी',
    vetConsult: 'पशुवैद्यकीय सल्ला',
    healthyTitle: 'जनावर निरोगी दिसत आहे!',
    healthyDesc: 'कोणत्याही गंभीर संसर्गजन्य आजाराचे लक्षण आढळले नाही.',
    scheduleVaccine: 'लसीकरण / तपासणी शेड्यूल करा',
    scanAnother: 'दुसरे जनावर स्कॅन करा',
    done: 'पूर्ण',
    analyzing: 'पुन्हा विश्लेषण सुरू आहे...',
    sourceServer: 'पायटॉर्च न्यूरल नेट',
    sourceClient: 'ऑनेक्स वेब असेंब्ली',
    sourceFallback: 'वैद्यकीय गाइड',
    severityNormal: 'निरोगी / सामान्य',
    severityModerate: 'मध्यम काळजी',
    severityCritical: 'तातडीचे लक्ष आवश्यक',
  },
} as const;

export const DiagnosisResultModal: React.FC<DiagnosisResultModalProps> = ({
  photo,
  initialResult,
  animalName,
  species,
  onClose,
  onOpenVaccination,
  onScanAnother,
}) => {
  const { language } = useLanguage();
  const T = UI_TEXT[language as 'en' | 'hi' | 'mr'] ?? UI_TEXT.en;

  const [result, setResult] = useState<DiagnosisResult>(initialResult);
  const [isSwitching, setIsSwitching] = useState(false);

  const langKey = (language as 'en' | 'hi' | 'mr') || 'en';
  const isHealthy = result.isHealthy;
  const severity = result.severity;

  const badgeBg = isHealthy
    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
    : severity === 'critical'
    ? 'bg-rose-50 text-rose-800 border-rose-200'
    : 'bg-amber-50 text-amber-800 border-amber-200';

  const badgeDot = isHealthy
    ? 'bg-emerald-500'
    : severity === 'critical'
    ? 'bg-rose-500'
    : 'bg-amber-500';

  const severityLabel = isHealthy
    ? T.severityNormal
    : severity === 'critical'
    ? T.severityCritical
    : T.severityModerate;

  const speciesEmoji = result.modelType === 'poultry' ? '🐔' : species === 'buffalo' ? '🐃' : species === 'goat' ? '🐐' : '🐮';

  const handleSwitchModel = async (newModel: AnimalModelType) => {
    setIsSwitching(true);
    try {
      const newResult = await diagnoseAnimalImage(photo, species, newModel);
      setResult(newResult);
    } catch (err) {
      console.error('Failed to switch model', err);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[70] bg-black/60 backdrop-blur-sm flex flex-col justify-end overflow-hidden"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="w-full max-h-[92%] bg-[#fbfcfb] rounded-t-[32px] shadow-2xl flex flex-col overflow-hidden border-t border-white/60"
      >
        {/* Top Drag Indicator & Header */}
        <div className="shrink-0 pt-3 pb-2 px-5 border-b border-neutral-100 flex flex-col">
          <div className="w-12 h-1.5 bg-neutral-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl p-1.5 bg-neutral-100 rounded-full">{speciesEmoji}</span>
              <div>
                <h2 className="text-[17px] font-bold text-neutral-900 leading-tight">
                  {T.title}
                </h2>
                <p className="text-[12px] text-neutral-500">
                  {animalName ? `${animalName} • ` : ''}
                  <span className="font-medium text-emerald-800">
                    {result.modelType === 'poultry' ? T.modelBadgePoultry : T.modelBadgeCattle}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Photo Thumbnail + Diagnosis Hero */}
          <div className="bg-white rounded-2xl p-3.5 border border-neutral-200/80 shadow-xs flex gap-3.5 items-center">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0 border border-neutral-200 bg-neutral-100">
              <img src={photo} alt="Scanned animal" className="w-full h-full object-cover" />
              <div className="absolute bottom-0 inset-x-0 bg-black/50 text-[9px] text-white text-center py-0.5 font-medium">
                {result.source === 'server-pt' ? 'PyTorch .pt' : 'ONNX'}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${badgeBg}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${badgeDot}`} />
                  {severityLabel}
                </span>
                <span className="text-[11px] font-bold text-neutral-700 ml-auto">
                  {result.confidence}% {T.confidence}
                </span>
              </div>

              <h3 className="text-[16px] font-extrabold text-neutral-900 truncate">
                {result.displayName[langKey] || result.condition}
              </h3>

              <p className="text-[11px] text-neutral-500 line-clamp-2 mt-0.5">
                {isHealthy ? T.healthyDesc : result.symptoms[langKey]}
              </p>
            </div>
          </div>

          {/* Model Switcher Pill */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-800">
                swap_horiz
              </span>
              <span className="text-[11px] font-semibold text-emerald-900">
                {result.modelType === 'cattle' ? T.switchToPoultry : T.switchToCattle}
              </span>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.94 }}
              disabled={isSwitching}
              onClick={() => handleSwitchModel(result.modelType === 'cattle' ? 'poultry' : 'cattle')}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white text-[11px] font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              {isSwitching ? T.analyzing : T.switchModel}
            </motion.button>
          </div>

          {/* Probabilities Breakdown */}
          <div className="bg-white rounded-2xl p-3.5 border border-neutral-200/80 shadow-xs space-y-2.5">
            <h4 className="text-[12px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-neutral-500">analytics</span>
              {T.probabilities}
            </h4>

            <div className="space-y-2">
              {Object.entries(result.probabilities)
                .sort(([, a], [, b]) => b - a)
                .map(([name, prob]) => {
                  const pct = Math.round(prob * 100);
                  const isTop = name.toLowerCase() === result.condition.toLowerCase();
                  return (
                    <div key={name} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className={`font-medium ${isTop ? 'text-neutral-900 font-bold' : 'text-neutral-600'}`}>
                          {name}
                        </span>
                        <span className="font-mono text-[10px] text-neutral-500">{pct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTop
                              ? isHealthy
                                ? 'bg-emerald-500'
                                : 'bg-rose-500'
                              : 'bg-neutral-300'
                          }`}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Action Guidelines */}
          <div className="bg-white rounded-2xl p-3.5 border border-neutral-200/80 shadow-xs space-y-3">
            <div>
              <h4 className="text-[12px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px] text-amber-600">health_and_safety</span>
                {T.immediateAction}
              </h4>
              <p className="text-[12px] text-neutral-700 leading-relaxed bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
                {result.action[langKey]}
              </p>
            </div>

            <div>
              <h4 className="text-[12px] font-bold text-neutral-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <span className="material-symbols-outlined text-[16px] text-emerald-700">medical_services</span>
                {T.symptoms}
              </h4>
              <p className="text-[12px] text-neutral-600 leading-relaxed">
                {result.symptoms[langKey]}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 p-3 bg-white border-t border-neutral-100 flex flex-col gap-2">
          {onOpenVaccination && (
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onClose();
                onOpenVaccination();
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">vaccines</span>
              {T.scheduleVaccine}
            </motion.button>
          )}

          <div className="flex items-center gap-2">
            {onScanAnother && (
              <motion.button
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={onScanAnother}
                className="flex-1 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                {T.scanAnother}
              </motion.button>
            )}
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white font-semibold text-xs tracking-wider uppercase flex items-center justify-center transition-colors cursor-pointer"
            >
              {T.done}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
