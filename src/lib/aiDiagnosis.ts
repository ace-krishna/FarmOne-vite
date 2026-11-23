/**
 * FarmOne Dual ML Engine Integration
 * Re-exports offline inference powered by onnxruntime-web via src/services/mlInference.ts.
 * 
 * 100% Offline execution across Android (.apk), iOS (.ipa), and mobile Web.
 * Zero external network calls.
 */

import {
  runInference,
  getModelForSpecies,
  DEFAULT_DISEASE_CATALOG,
  CATTLE_CLASSES,
  POULTRY_CLASSES,
  type AnimalModelType,
  type LocalizedText,
  type DiseaseInfo,
  type InferenceResult,
} from '../services/mlInference';

export type { AnimalModelType, LocalizedText, DiseaseInfo };

export type DiagnosisResult = InferenceResult & {
  source: 'server-pt' | 'client-onnx' | 'client-fallback';
};

export { CATTLE_CLASSES, POULTRY_CLASSES, getModelForSpecies };
export const DISEASE_CATALOG = DEFAULT_DISEASE_CATALOG;

/**
 * 100% Offline diagnosis function.
 * Invokes the cached ONNX Runtime WebAssembly inference session directly in-memory.
 */
export async function diagnoseAnimalImage(
  imageDataUrl: string,
  species?: string | null,
  modelOverride?: AnimalModelType
): Promise<DiagnosisResult> {
  const result = await runInference(imageDataUrl, species, modelOverride);
  return result as DiagnosisResult;
}
