import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ort from 'onnxruntime-web';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function testModel(modelPath, expectedClasses) {
  console.log(`\nTesting ONNX Model: ${modelPath}`);
  const absPath = path.join(rootDir, modelPath);
  if (!fs.existsSync(absPath)) {
    throw new Error(`Model not found at: ${absPath}`);
  }

  const session = await ort.InferenceSession.create(absPath);
  console.log(`  Inputs:  ${session.inputNames.join(', ')}`);
  console.log(`  Outputs: ${session.outputNames.join(', ')}`);

  // Generate deterministic dummy input: 1 x 3 x 224 x 224
  const numElements = 1 * 3 * 224 * 224;
  const dummy = new Float32Array(numElements);
  for (let i = 0; i < numElements; i++) {
    dummy[i] = (i % 256) / 255.0;
  }

  const inputTensor = new ort.Tensor('float32', dummy, [1, 3, 224, 224]);
  const inputName = session.inputNames[0];
  const feeds = { [inputName]: inputTensor };

  const start = performance.now();
  const results = await session.run(feeds);
  const duration = (performance.now() - start).toFixed(2);

  const outputName = session.outputNames[0];
  const outputData = Array.from(results[outputName].data);

  // Softmax if needed
  let probs = outputData;
  const sum = probs.reduce((a, b) => a + b, 0);
  if (Math.abs(sum - 1.0) > 0.05) {
    const maxVal = Math.max(...probs);
    const exp = probs.map(v => Math.exp(v - maxVal));
    const expSum = exp.reduce((a, b) => a + b, 0);
    probs = exp.map(v => v / expSum);
  }

  console.log(`  Inference time: ${duration} ms`);
  console.log(`  Output classes count: ${probs.length} (Expected: ${expectedClasses.length})`);
  console.log(`  Probability sum: ${probs.reduce((a, b) => a + b, 0).toFixed(6)}`);

  expectedClasses.forEach((name, i) => {
    console.log(`    - [${i}] ${name}: ${(probs[i] * 100).toFixed(2)}%`);
  });

  const maxIdx = probs.indexOf(Math.max(...probs));
  console.log(`  Top prediction: ${expectedClasses[maxIdx]} with ${(probs[maxIdx] * 100).toFixed(2)}% confidence`);
}

async function main() {
  console.log('====================================================');
  console.log('   FarmOne ONNX Offline Inference Verification     ');
  console.log('====================================================');

  const metadataPath = path.join(rootDir, 'public', 'models', 'metadata.json');
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf-8'));
  console.log(`Loaded metadata: ${metadata.name} (v${metadata.version})`);

  const cattleClasses = ['foot-and-mouth', 'healthy', 'lumpy'];
  const poultryClasses = ['Bumblefoot', 'Fowlpox', 'Healthy', 'coryza', 'crd'];

  await testModel('public/models/model.onnx', cattleClasses);
  await testModel('public/models/cattle_best.onnx', cattleClasses);
  await testModel('public/models/poultry_best.onnx', poultryClasses);

  console.log('\n[SUCCESS] All ONNX models loaded and ran inference offline successfully!\n');
}

main().catch(err => {
  console.error('[ERROR] Verification failed:', err);
  process.exit(1);
});
