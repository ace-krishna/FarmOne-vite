/**
 * FarmOne Offline ML Inference Engine
 * Powered by onnxruntime-web & WebAssembly.
 *
 * 100% Offline execution for Android WebView and Web browsers.
 * Replaces Python runtime dependency with zero external network requests.
 */

import * as ort from 'onnxruntime-web';

// 1. Explicitly configure ONNX Runtime for offline mobile WebViews
// Compute absolute URL prefix with trailing slash for reliable WASM loading in Capacitor & Web
if (typeof window !== 'undefined') {
  const origin = window.location.origin;
  const path = window.location.pathname;
  const baseDir = path.substring(0, path.lastIndexOf('/') + 1) || '/';
  const ortDir = new URL('ort/', origin + baseDir).href;
  ort.env.wasm.wasmPaths = ortDir;
}
// Single thread avoids SharedArrayBuffer / COOP-COEP requirement on mobile WebViews
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;

export type AnimalModelType = 'cattle' | 'poultry';

export interface LocalizedText {
  en: string;
  hi: string;
  mr: string;
}

export interface DiseaseInfo {
  severity: 'normal' | 'moderate' | 'critical';
  displayName: LocalizedText;
  symptoms: LocalizedText;
  action: LocalizedText;
}

export interface InferenceResult {
  success: boolean;
  modelType: AnimalModelType;
  species: string;
  condition: string;
  confidence: number; // 0 - 100
  isHealthy: boolean;
  severity: 'normal' | 'moderate' | 'critical';
  displayName: LocalizedText;
  symptoms: LocalizedText;
  action: LocalizedText;
  probabilities: Record<string, number>;
  source: 'client-onnx' | 'client-fallback' | 'server-pt';
  inferenceTimeMs?: number;
  error?: string;
}

export const CATTLE_CLASSES = ['foot-and-mouth', 'healthy', 'lumpy'] as const;
export const POULTRY_CLASSES = ['Bumblefoot', 'Fowlpox', 'Healthy', 'coryza', 'crd'] as const;

export const DEFAULT_DISEASE_CATALOG: Record<string, DiseaseInfo> = {
  // Cattle diseases
  'foot-and-mouth': {
    severity: 'critical',
    displayName: {
      en: 'Foot-and-Mouth Disease (FMD)',
      hi: 'खुरपका-मुंहपका रोग (FMD)',
      mr: 'लाळ-खुरकूत रोग (FMD)',
    },
    symptoms: {
      en: 'Blisters and sores in mouth and hooves, excessive salivation, lameness, and sudden high fever.',
      hi: 'मुंह व खुरों के बीच छाले, अत्यधिक लार टपकना, लंगड़ापन और तेज बुखार।',
      mr: 'तोंड व खुरांमध्ये फोड, सतत लाळ गळणे, लंगडणे आणि तीव्र ताप.',
    },
    action: {
      en: 'Isolate animal immediately. Apply 1% potassium permanganate or boro-glycerine to mouth sores. Contact veterinary doctor immediately.',
      hi: 'पशु को तुरंत अलग करें। मुंह के छालों पर 1% पोटेशियम परमैंगनेट लगाएं। तुरंत पशु चिकित्सक से संपर्क करें।',
      mr: 'बाधित जनावराला त्वरित वेगळे करा. पोटॅशियम परमँगनेटच्या पाण्याने तोंड धुवा. तात्काळ पशुवैद्यकांचा सल्ला घ्या.',
    },
  },
  lumpy: {
    severity: 'critical',
    displayName: {
      en: 'Lumpy Skin Disease (LSD)',
      hi: 'लम्पी त्वचा रोग (LSD)',
      mr: 'लंपी त्वचा रोग (LSD)',
    },
    symptoms: {
      en: 'Hard, raised nodules (2-5 cm) on skin, fever, enlarged lymph nodes, and sharp drop in milk production.',
      hi: 'त्वचा पर सख्त गांठें (2-5 सेमी), तेज बुखार, लिम्फ नोड्स में सूजन और दूध उत्पादन में कमी।',
      mr: 'त्वचेवर गाठी (२-५ सेमी), ताप, लिम्फ नोड्सना सूज आणि दुधात घट.',
    },
    action: {
      en: 'Isolate the animal. Spray neem oil/repellents to deter vectors (flies/mosquitoes). Administer fever relief under veterinary care.',
      hi: 'पशु को अलग रखें। मक्खी-मच्छरों से बचाव के लिए नीम तेल का छिड़काव करें। पशु चिकित्सक की देखरेख में दवाएं दें।',
      mr: 'जनावराला वेगळे ठेवा. डास-माशांपासून संरक्षणासाठी कडुनिंबाचा धूर/तेल वापरा. डॉक्टरांच्या सल्ल्याने औषध द्या.',
    },
  },
  healthy: {
    severity: 'normal',
    displayName: {
      en: 'Healthy Cattle',
      hi: 'स्वस्थ मवेशी',
      mr: 'निरोगी जनावर',
    },
    symptoms: {
      en: 'Bright alert eyes, smooth coat, normal rumination and active appetite.',
      hi: 'चमकदार आंखें, सामान्य जुगाली, स्वस्थ त्वचा और अच्छी भूख।',
      mr: 'टवटवीत डोळे, नियमित रवंथ, चांगली भूक व तजेलदार त्वचा.',
    },
    action: {
      en: 'Maintain regular balanced nutrition, clean water, and stay up to date with vaccination schedules.',
      hi: 'संतुलित आहार, स्वच्छ पानी दें और टीकाकरण शेड्यूल समय पर पूरा रखें।',
      mr: 'नियमित सकस आहार, स्वच्छ पाणी द्या आणि लसीकरण वेळेवर पूर्ण ठेवा.',
    },
  },

  // Poultry diseases
  Bumblefoot: {
    severity: 'moderate',
    displayName: {
      en: 'Bumblefoot (Pododermatitis)',
      hi: 'बम्बलफूट (पैर का संक्रमण)',
      mr: 'बंबलफूट (पायाचे संक्रमण)',
    },
    symptoms: {
      en: 'Swollen footpad, limping, and black necrotic scab on the sole of the foot.',
      hi: 'पंजे में सूजन, लंगड़ाना, तलवे पर काला घाव या पपड़ी।',
      mr: 'पायाच्या तळव्यात सूज, लंगडणे, तळव्यावर काळी खपली.',
    },
    action: {
      en: 'Soak foot in warm Epsom salt water. Clean with betadine, apply antibacterial ointment, and wrap securely.',
      hi: 'गुनगुने एप्सम नमक के पानी में पैर भिगोएं। बीटाडीन से साफ कर मलहम लगाएं व पट्टी बांधें।',
      mr: 'कोमट मिठाच्या पाण्यात पाय भिजवा. बिटाडिनने जखम स्वच्छ करून मलमपट्टी करा.',
    },
  },
  Fowlpox: {
    severity: 'moderate',
    displayName: {
      en: 'Fowl Pox (Avian Pox)',
      hi: 'फाउल पॉक्स (मुर्गी की चेचक)',
      mr: 'कोंबड्यांची देवी (फाऊल पॉक्स)',
    },
    symptoms: {
      en: 'Wart-like nodules and scabs on comb, wattles, eyelids, and beak area.',
      hi: 'कलगी, गलकंबल और आंखों के पास मस्से जैसे दाने व पपड़ी।',
      mr: 'तुरा, गळ्यातील पोळी व डोळ्यांभोवती चामखीळीसारखे फोड.',
    },
    action: {
      en: 'Isolate affected birds. Dab lesions with dilute iodine. Add Vitamin A to drinking water and vaccinate flock.',
      hi: 'बीमार पक्षियों को अलग करें। दानों पर आयोडीन लगाएं। पीने के पानी में विटामिन-ए दें।',
      mr: 'आजारी पक्षी वेगळे करा. फोडांवर सौम्य आयोडीन लावा. पिण्याच्या पाण्यातून जीवनसत्त्व-अ द्या.',
    },
  },
  coryza: {
    severity: 'critical',
    displayName: {
      en: 'Infectious Coryza',
      hi: 'संक्रामक कोरायजा',
      mr: 'संसर्गजन्य कोरायझा',
    },
    symptoms: {
      en: 'Facial swelling, foul-smelling nasal discharge, conjunctivitis, and noisy labored breathing.',
      hi: 'चेहरे पर सूजन, नाक से दुर्गंधयुक्त स्राव, आंखों से पानी, सांस लेने में तकलीफ।',
      mr: 'चेहऱ्यावर सूज, नाकातून दुर्गंधीयुक्त पाणी, डोळे चोळणे, धाप लागणे.',
    },
    action: {
      en: 'Isolate infected birds immediately. Administer vet-prescribed antibiotics. Sanitize and disinfect all waterers.',
      hi: 'तुरंत अलग करें। डॉक्टर की सलाह से एंटीबायोटिक दें। पानी के बर्तनों को कीटाणुरहित करें।',
      mr: 'तात्काळ विलगीकरण करा. डॉक्टरांच्या सल्ल्याने प्रतिजैविके द्या. पिण्याच्या भांड्यांची स्वच्छता राखा.',
    },
  },
  crd: {
    severity: 'critical',
    displayName: {
      en: 'Chronic Respiratory Disease (CRD)',
      hi: 'क्रॉनिक रेस्पिरेटरी डिजीज (CRD)',
      mr: 'क्रॉनिक रेस्पिरेटरी डिसीज (CRD)',
    },
    symptoms: {
      en: 'Persistent coughing, rattling breathing sounds, nasal discharge, foamy eyes, and stunted growth.',
      hi: 'लगातार खांसी, सांस में घरघराहट, नाक बहना, आंखों में झाग।',
      mr: 'सतत खोकला, श्वास घेताना घरघर आवाज येणे, डोळ्यांत फेस येणे.',
    },
    action: {
      en: 'Administer antibiotics (Tylosin/Doxycycline) as advised by avian vet. Eliminate dampness and improve ventilation.',
      hi: 'डॉक्टर की सलाह से टायलोसिन दवा दें। बाड़े में वेंटिलेशन सुधारें और नमी हटाएं।',
      mr: 'पशुवैद्यकांच्या सल्ल्याने टायलोसिन औषध द्या. गोठ्यात हवा खेळती ठेवा व ओलावा नष्ट करा.',
    },
  },
  Healthy: {
    severity: 'normal',
    displayName: {
      en: 'Healthy Poultry',
      hi: 'स्वस्थ मुर्गी / पक्षी',
      mr: 'निरोगी पक्षी',
    },
    symptoms: {
      en: 'Bright red comb, alert posture, clear eyes, clean feathers, and energetic feeding.',
      hi: 'लाल कलगी, फुर्तीली चाल, साफ आंखें, सामान्य दाना चुगना।',
      mr: 'लाल तुरा, चपळ हालचाल, स्वच्छ डोळे व चांगली भूक.',
    },
    action: {
      en: 'Provide quality feed and fresh water. Maintain clean dry litter and regular biosecurity.',
      hi: 'संतुलित आहार व साफ पानी दें। बाड़े में सूखा बिछावन व स्वच्छता रखें।',
      mr: 'सकस खाद्य व ताजे पाणी द्यावे. गोठ्यात स्वच्छता राखावी.',
    },
  },
};

/**
 * Singleton caches for sessions and metadata to prevent reloading on every prediction.
 */
const sessionCache = new Map<string, ort.InferenceSession>();
const sessionPromises = new Map<string, Promise<ort.InferenceSession>>();
let cachedMetadata: any = null;

/**
 * Extract EXIF orientation (1..8) from an ArrayBuffer of a JPEG file.
 * Handles mobile smartphone camera orientations (e.g. orientation 6 = 90 deg rotate).
 */
export function getExifOrientation(buffer: ArrayBuffer): number {
  try {
    const view = new DataView(buffer);
    if (view.byteLength < 4) return 1;
    if (view.getUint16(0, false) !== 0xffd8) return 1; // Not JPEG

    let length = view.byteLength;
    let offset = 2;
    while (offset < length - 2) {
      const marker = view.getUint16(offset, false);
      offset += 2;
      if (marker === 0xffe1) {
        // APP1 (Exif) marker
        if (view.getUint32(offset += 2, false) !== 0x45786966) return 1; // 'Exif\0\0'
        const little = view.getUint16(offset += 6, false) === 0x4949;
        offset += view.getUint32(offset + 4, little);
        const tags = view.getUint16(offset, little);
        offset += 2;
        for (let i = 0; i < tags; i++) {
          if (view.getUint16(offset + (i * 12), little) === 0x0112) {
            return view.getUint16(offset + (i * 12) + 8, little);
          }
        }
      } else if ((marker & 0xff00) !== 0xff00) {
        break;
      } else {
        offset += view.getUint16(offset, false);
      }
    }
  } catch {
    // fallback to normal orientation
  }
  return 1;
}

/**
 * Convert base64 dataURL to ArrayBuffer.
 */
function dataUrlToArrayBuffer(dataUrl: string): ArrayBuffer {
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Load metadata JSON with local bundle and Node.js fallback.
 */
export async function loadMetadata(): Promise<any> {
  if (cachedMetadata) return cachedMetadata;

  const candidateUrls: string[] = [];
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const baseDir = path.substring(0, path.lastIndexOf('/') + 1) || '/';
    candidateUrls.push(new URL('models/metadata.json', origin + baseDir).href);
    candidateUrls.push(`${origin}/models/metadata.json`);
  }
  candidateUrls.push('./models/metadata.json');
  candidateUrls.push('/models/metadata.json');

  for (const p of candidateUrls) {
    try {
      const res = await fetch(p);
      if (res.ok) {
        cachedMetadata = await res.json();
        return cachedMetadata;
      }
    } catch {
      // ignore and try next
    }
  }

  cachedMetadata = {
    classes: { 0: 'foot-and-mouth', 1: 'healthy', 2: 'lumpy' },
    classNames: ['foot-and-mouth', 'healthy', 'lumpy'],
    diseaseCatalog: DEFAULT_DISEASE_CATALOG,
  };
  return cachedMetadata;
}

/**
 * Route animal species to model type ('cattle' or 'poultry').
 */
export function getModelForSpecies(species?: string | null): AnimalModelType {
  if (!species) return 'cattle';
  const s = species.toLowerCase().trim();
  if (['hen', 'chicken', 'poultry', 'bird', 'rooster', 'broiler', 'layer', 'chick', 'duck', 'turkey'].some(k => s.includes(k))) {
    return 'poultry';
  }
  return 'cattle';
}

/**
 * Fetches the raw ONNX model binary as a Uint8Array into memory.
 * Bypasses relative path issues in Capacitor Android WebView.
 */
async function fetchModelBuffer(modelType: AnimalModelType): Promise<Uint8Array> {
  const fileName = modelType === 'poultry' ? 'poultry_best.onnx' : 'cattle_best.onnx';

  const candidateUrls: string[] = [];
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    const path = window.location.pathname;
    const baseDir = path.substring(0, path.lastIndexOf('/') + 1) || '/';
    candidateUrls.push(new URL(`models/${fileName}`, origin + baseDir).href);
    candidateUrls.push(`${origin}/models/${fileName}`);
    candidateUrls.push(`${origin}${baseDir}models/${fileName}`);
  }
  candidateUrls.push(`./models/${fileName}`);
  candidateUrls.push(`/models/${fileName}`);
  if (modelType === 'cattle') {
    candidateUrls.push('./models/model.onnx');
    candidateUrls.push('/models/model.onnx');
  }

  let lastError: any = null;
  for (const url of candidateUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const buf = await res.arrayBuffer();
        if (buf.byteLength > 100000) {
          console.log(`[mlInference] Loaded ${modelType} model from ${url} (${buf.byteLength} bytes)`);
          return new Uint8Array(buf);
        }
      }
    } catch (e) {
      lastError = e;
    }
  }

  throw lastError || new Error(`Failed to load ONNX model buffer for ${modelType}`);
}

/**
 * Loads and caches an ONNX InferenceSession as a singleton in-memory.
 * Strictly forces executionProviders: ['wasm'] for reliable cross-platform execution.
 */
export async function getInferenceSession(modelType: AnimalModelType = 'cattle'): Promise<ort.InferenceSession> {
  const cacheKey = modelType;
  if (sessionCache.has(cacheKey)) {
    return sessionCache.get(cacheKey)!;
  }

  if (sessionPromises.has(cacheKey)) {
    return sessionPromises.get(cacheKey)!;
  }

  const loadPromise = (async () => {
    let modelBuffer: Uint8Array;
    try {
      modelBuffer = await fetchModelBuffer(modelType);
    } catch (fetchErr) {
      console.error(`[mlInference] Failed to fetch model buffer for ${modelType}:`, fetchErr);
      throw fetchErr;
    }

    try {
      const session = await ort.InferenceSession.create(modelBuffer, {
        executionProviders: ['wasm'],
        graphOptimizationLevel: 'all',
      });
      sessionCache.set(cacheKey, session);
      return session;
    } catch (err: any) {
      console.warn(`[mlInference] Primary session creation failed, attempting fallback:`, err);
      if (ort.env.wasm.simd) {
        try {
          ort.env.wasm.simd = false;
          const nonSimdSession = await ort.InferenceSession.create(modelBuffer, {
            executionProviders: ['wasm'],
          });
          sessionCache.set(cacheKey, nonSimdSession);
          return nonSimdSession;
        } catch (simdErr) {
          console.error(`[mlInference] Fallback without SIMD also failed:`, simdErr);
          throw simdErr;
        }
      }
      throw err;
    }
  })();

  sessionPromises.set(cacheKey, loadPromise);
  try {
    return await loadPromise;
  } finally {
    sessionPromises.delete(cacheKey);
  }
}

/**
 * Loads an image from a DataURL, Blob URL, or existing element.
 */
function loadImageElement(source: string | HTMLImageElement | HTMLCanvasElement): Promise<HTMLImageElement | HTMLCanvasElement> {
  if (typeof source !== 'string') {
    return Promise.resolve(source);
  }
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error('Failed to load image for ONNX preprocessing: ' + e));
    img.src = source;
  });
}

/**
 * Computes PIL-compatible 1D bilinear resampling weights and indices with anti-aliasing.
 * Stretches filter kernel support by downsampling ratio to prevent aliasing.
 */
export function getResampleWeights(inSize: number, outSize: number): { indices: number[][]; weights: number[][] } {
  const scale = outSize / inSize;
  const support = scale < 1.0 ? 1.0 / scale : 1.0;
  const indices: number[][] = [];
  const weights: number[][] = [];

  for (let x = 0; x < outSize; x++) {
    const center = (x + 0.5) / scale - 0.5;
    const xmin = Math.max(0, Math.floor(center - support) + 1);
    const xmax = Math.min(inSize - 1, Math.floor(center + support));
    const idx: number[] = [];
    const w: number[] = [];
    let sumW = 0;

    for (let i = xmin; i <= xmax; i++) {
      const dist = Math.abs(i - center);
      const weight = Math.max(0, 1.0 - dist / support);
      idx.push(i);
      w.push(weight);
      sumW += weight;
    }

    if (sumW === 0) {
      idx.push(Math.min(inSize - 1, Math.max(0, Math.round(center))));
      w.push(1.0);
      sumW = 1.0;
    }

    for (let j = 0; j < w.length; j++) {
      w[j] /= sumW;
    }

    indices.push(idx);
    weights.push(w);
  }

  return { indices, weights };
}

/**
 * High-fidelity PIL-parity image preprocessing for YOLOv8 classification:
 * 1. Aspect-ratio preserving Resize (shorter side to 224) with bilinear anti-aliasing.
 * 2. Center crop to 224x224.
 * 3. 8-bit integer rounding and clamping matching PIL.
 * 4. Normalization to [0.0, 1.0] (divided by 255.0).
 * 5. Planar NCHW layout: [1, 3, 224, 224] Float32Array.
 */
export function preprocessRgbaToPlanarNCHW(
  rgbaData: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  targetW = 224,
  targetH = 224
): Float32Array {
  let newW: number;
  let newH: number;
  if (width < height) {
    newW = targetW;
    newH = Math.round((height * targetW) / width);
  } else {
    newH = targetH;
    newW = Math.round((width * targetH) / height);
  }

  const cropLeft = Math.floor((newW - targetW) / 2);
  const cropTop = Math.floor((newH - targetH) / 2);

  // Step 1: Horizontal Resampling (width -> newW)
  const { indices: idxX, weights: wX } = getResampleWeights(width, newW);
  const hResized = new Float32Array(height * newW * 3);

  for (let y = 0; y < height; y++) {
    const rowInOffset = y * width * 4;
    const rowOutOffset = y * newW * 3;

    for (let x = 0; x < newW; x++) {
      const curIdx = idxX[x];
      const curW = wX[x];
      let r = 0, g = 0, b = 0;

      for (let k = 0; k < curIdx.length; k++) {
        const srcPx = rowInOffset + curIdx[k] * 4;
        const weight = curW[k];
        r += rgbaData[srcPx] * weight;
        g += rgbaData[srcPx + 1] * weight;
        b += rgbaData[srcPx + 2] * weight;
      }

      const dstPx = rowOutOffset + x * 3;
      hResized[dstPx] = r;
      hResized[dstPx + 1] = g;
      hResized[dstPx + 2] = b;
    }
  }

  // Step 2: Vertical Resampling directly into Center Cropped targetW x targetH Planar NCHW
  const { indices: idxY, weights: wY } = getResampleWeights(height, newH);
  const tensor = new Float32Array(3 * targetW * targetH);
  const channelStride = targetW * targetH;

  for (let y = 0; y < targetH; y++) {
    const origY = y + cropTop;
    const curIdx = idxY[origY];
    const curW = wY[origY];

    for (let x = 0; x < targetW; x++) {
      const origX = x + cropLeft;
      let r = 0, g = 0, b = 0;

      for (let k = 0; k < curIdx.length; k++) {
        const srcRow = curIdx[k];
        const srcPx = (srcRow * newW + origX) * 3;
        const weight = curW[k];
        r += hResized[srcPx] * weight;
        g += hResized[srcPx + 1] * weight;
        b += hResized[srcPx + 2] * weight;
      }

      const outIdx = y * targetW + x;
      // Round to nearest integer and clamp to [0, 255] matching PIL 8-bit image representation
      const rClamped = Math.min(255, Math.max(0, Math.round(r)));
      const gClamped = Math.min(255, Math.max(0, Math.round(g)));
      const bClamped = Math.min(255, Math.max(0, Math.round(b)));

      tensor[outIdx] = rClamped / 255.0; // R channel
      tensor[channelStride + outIdx] = gClamped / 255.0; // G channel
      tensor[channelStride * 2 + outIdx] = bClamped / 255.0; // B channel
    }
  }

  return tensor;
}

/**
 * Replicates exact YOLOv8 classification preprocessing:
 * 1. Corrects mobile camera EXIF orientation tag (Orientation 1..8).
 * 2. Aspect-ratio preserving Resize (shorter side to 224) with PIL-parity anti-aliasing.
 * 3. CenterCrop to 224x224.
 * 4. Normalizes pixel values to [0.0, 1.0] (dividing by 255.0).
 * 5. Planar NCHW layout: [1, 3, 224, 224] Float32Array.
 */
export async function preprocessImage(
  source: string | HTMLImageElement | HTMLCanvasElement,
  targetWidth = 224,
  targetHeight = 224
): Promise<Float32Array> {
  let orientation = 1;
  if (typeof source === 'string' && source.startsWith('data:image/jpeg')) {
    try {
      const buffer = dataUrlToArrayBuffer(source);
      orientation = getExifOrientation(buffer);
    } catch {
      orientation = 1;
    }
  }

  const rawImg = await loadImageElement(source);
  const srcW = rawImg instanceof HTMLImageElement ? rawImg.naturalWidth || rawImg.width : rawImg.width;
  const srcH = rawImg instanceof HTMLImageElement ? rawImg.naturalHeight || rawImg.height : rawImg.height;

  // 1. Correct for EXIF rotation onto an upright canvas if needed
  let w = srcW;
  let h = srcH;
  if (orientation >= 5 && orientation <= 8) {
    w = srcH;
    h = srcW;
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable for image preprocessing.');
  }

  if (orientation > 1) {
    switch (orientation) {
      case 2: ctx.transform(-1, 0, 0, 1, w, 0); break;
      case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
      case 4: ctx.transform(1, 0, 0, -1, 0, h); break;
      case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
      case 6: ctx.transform(0, 1, -1, 0, w, 0); break;
      case 7: ctx.transform(0, -1, -1, 0, w, h); break;
      case 8: ctx.transform(0, -1, 1, 0, 0, h); break;
    }
  }
  ctx.drawImage(rawImg, 0, 0);

  const imgData = ctx.getImageData(0, 0, w, h);
  return preprocessRgbaToPlanarNCHW(imgData.data, w, h, targetWidth, targetHeight);
}

/**
 * Softmax postprocessing if outputs are raw logits (sum != 1.0).
 */
export function applySoftmaxIfLogits(values: Float32Array | number[]): number[] {
  let probs = Array.from(values);
  const sum = probs.reduce((acc, v) => acc + v, 0);
  if (Math.abs(sum - 1.0) > 0.05) {
    const maxVal = Math.max(...probs);
    const exp = probs.map(v => Math.exp(v - maxVal));
    const expSum = exp.reduce((acc, v) => acc + v, 0);
    probs = exp.map(v => v / expSum);
  }
  return probs;
}

/**
 * Handles inference error states transparently.
 * Avoids masking failures with false "Healthy" predictions.
 */
function createDiagnosticErrorResult(
  modelType: AnimalModelType,
  species: string,
  errorMsg?: string
): InferenceResult {
  return {
    success: false,
    modelType,
    species,
    condition: 'Inference Error',
    confidence: 0,
    isHealthy: false,
    severity: 'critical',
    displayName: {
      en: 'Model Execution Error',
      hi: 'मॉडल जांच त्रुटि',
      mr: 'मॉडेल तपासणी त्रुटी',
    },
    symptoms: {
      en: 'The offline AI model encountered an error: ' + (errorMsg || 'Failed to initialize session'),
      hi: 'ऑफ़लाइन एआई मॉडल में त्रुटि आई: ' + (errorMsg || 'सत्र प्रारंभ करने में विफल'),
      mr: 'ऑफलाइन एआय मॉडेलमध्ये त्रुटी आली: ' + (errorMsg || 'सत्र सुरू करण्यात अयशस्वी'),
    },
    action: {
      en: 'Please try again. If the issue persists, verify app storage permissions.',
      hi: 'कृपया पुनः प्रयास करें। समस्या बनी रहने पर ऐप स्टोरेज अनुमतियां जांचें।',
      mr: 'कृपया पुन्हा प्रयत्न करा. समस्या कायम राहिल्यास ॲप स्टोरेज परवानग्या तपासा.',
    },
    probabilities: {},
    source: 'client-fallback',
    error: errorMsg,
  };
}

/**
 * Run 100% Offline Disease Inference on an animal photo.
 */
export async function runInference(
  imageData: string | HTMLImageElement | HTMLCanvasElement,
  speciesOrModel?: string | null,
  modelOverride?: AnimalModelType
): Promise<InferenceResult> {
  const targetSpecies = speciesOrModel || 'cow';
  const targetModelType: AnimalModelType = modelOverride || getModelForSpecies(targetSpecies);
  const startTime = performance.now();

  try {
    // 1. Get cached ONNX InferenceSession (singleton)
    const session = await getInferenceSession(targetModelType);

    // 2. Preprocess input image to NCHW [1, 3, 224, 224] Float32Array
    const preprocessedData = await preprocessImage(imageData, 224, 224);
    const inputTensor = new ort.Tensor('float32', preprocessedData, [1, 3, 224, 224]);

    // 3. Execute inference
    const inputName = session.inputNames[0] || 'images';
    const feeds: Record<string, ort.Tensor> = { [inputName]: inputTensor };
    const results = await session.run(feeds);

    const outputName = session.outputNames[0] || 'output0';
    const outputTensor = results[outputName];
    const rawData = outputTensor.data as Float32Array;

    // 4. Postprocessing: Softmax & Class Mapping
    const probs = applySoftmaxIfLogits(rawData);
    const classNames = targetModelType === 'poultry' ? POULTRY_CLASSES : CATTLE_CLASSES;

    let maxIdx = 0;
    for (let i = 1; i < probs.length; i++) {
      if (probs[i] > probs[maxIdx]) {
        maxIdx = i;
      }
    }

    const conditionKey = classNames[maxIdx] || (targetModelType === 'poultry' ? 'Healthy' : 'healthy');
    const confidence = Math.round(probs[maxIdx] * 1000) / 10;
    const isHealthy = conditionKey.toLowerCase() === 'healthy';

    const probMap: Record<string, number> = {};
    classNames.forEach((name, i) => {
      probMap[name] = Math.round((probs[i] ?? 0) * 1000) / 1000;
    });

    const metadata = await loadMetadata();
    const catalog = metadata?.diseaseCatalog || DEFAULT_DISEASE_CATALOG;
    const meta: DiseaseInfo = catalog[conditionKey] || {
      severity: isHealthy ? 'normal' : 'moderate',
      displayName: { en: conditionKey, hi: conditionKey, mr: conditionKey },
      symptoms: { en: 'Visual check completed.', hi: 'जांच पूर्ण हुई।', mr: 'तपासणी पूर्ण झाली.' },
      action: { en: 'Consult a veterinarian for confirmation.', hi: 'पशु चिकित्सक से सलाह लें।', mr: 'पशुवैद्यकांचा सल्ला घ्या.' },
    };

    const inferenceTimeMs = Math.round(performance.now() - startTime);

    return {
      success: true,
      modelType: targetModelType,
      species: targetSpecies,
      condition: conditionKey,
      confidence,
      isHealthy,
      severity: meta.severity,
      displayName: meta.displayName,
      symptoms: meta.symptoms,
      action: meta.action,
      probabilities: probMap,
      source: 'client-onnx',
      inferenceTimeMs,
    };
  } catch (err: any) {
    console.error('[mlInference] Client ONNX inference failed:', err);
    return createDiagnosticErrorResult(targetModelType, targetSpecies, err?.message || String(err));
  }
}
