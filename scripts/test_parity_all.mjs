import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import * as ort from 'onnxruntime-web';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Helper to preprocess PNG matching PIL BILINEAR Resize(224) + CenterCrop(224)
function preprocessPngToNCHW(png) {
  const { width, height, data } = png;
  let new_w, new_h;
  if (width < height) {
    new_w = 224;
    new_h = Math.round((height * 224) / width);
  } else {
    new_h = 224;
    new_w = Math.round((width * 224) / height);
  }

  const cropLeft = Math.floor((new_w - 224) / 2);
  const cropTop = Math.floor((new_h - 224) / 2);

  const tensorData = new Float32Array(3 * 224 * 224);
  const channelStride = 224 * 224;

  for (let y = 0; y < 224; y++) {
    const srcY_cont = ((y + cropTop + 0.5) * height) / new_h - 0.5;
    const y0 = Math.max(0, Math.min(height - 1, Math.floor(srcY_cont)));
    const y1 = Math.max(0, Math.min(height - 1, y0 + 1));
    const dy = Math.max(0, Math.min(1, srcY_cont - y0));

    for (let x = 0; x < 224; x++) {
      const srcX_cont = ((x + cropLeft + 0.5) * width) / new_w - 0.5;
      const x0 = Math.max(0, Math.min(width - 1, Math.floor(srcX_cont)));
      const x1 = Math.max(0, Math.min(width - 1, x0 + 1));
      const dx = Math.max(0, Math.min(1, srcX_cont - x0));

      const idx00 = (y0 * width + x0) * 4;
      const idx01 = (y0 * width + x1) * 4;
      const idx10 = (y1 * width + x0) * 4;
      const idx11 = (y1 * width + x1) * 4;

      const outIdx = y * 224 + x;

      for (let c = 0; c < 3; c++) {
        const top = (1 - dx) * data[idx00 + c] + dx * data[idx01 + c];
        const bot = (1 - dx) * data[idx10 + c] + dx * data[idx11 + c];
        const val = (1 - dy) * top + dy * bot;
        tensorData[c * channelStride + outIdx] = val / 255.0;
      }
    }
  }

  return tensorData;
}

async function runTest(imageRelPath, modelType, classes) {
  console.log(`\n======================================================`);
  console.log(`TEST: ${imageRelPath} (${modelType})`);
  console.log(`======================================================`);

  const pngBuf = fs.readFileSync(path.join(rootDir, imageRelPath));
  const png = PNG.sync.read(pngBuf);
  const tensorData = preprocessPngToNCHW(png);

  // Compute stats
  let min = Infinity, max = -Infinity, sum = 0;
  for (let i = 0; i < tensorData.length; i++) {
    const v = tensorData[i];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  const mean = sum / tensorData.length;

  console.log(`Input Tensor Stats: min=${min.toFixed(4)}, max=${max.toFixed(4)}, mean=${mean.toFixed(4)}`);
  console.log('First 10 input values:', Array.from(tensorData.slice(0, 10)).map(v => Number(v.toFixed(6))));

  ort.env.wasm.numThreads = 1;
  const modelPath = path.join(rootDir, `public/models/${modelType === 'poultry' ? 'poultry_best.onnx' : 'cattle_best.onnx'}`);
  const session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['wasm'],
  });

  const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, 224, 224]);
  const results = await session.run({ [session.inputNames[0]]: inputTensor });
  const rawOut = Array.from(results[session.outputNames[0]].data);

  let probs = rawOut;
  const pSum = probs.reduce((a, b) => a + b, 0);
  if (Math.abs(pSum - 1.0) > 0.05) {
    const maxVal = Math.max(...probs);
    const exp = probs.map(v => Math.exp(v - maxVal));
    const expSum = exp.reduce((a, b) => a + b, 0);
    probs = exp.map(v => v / expSum);
  }

  const maxIdx = probs.indexOf(Math.max(...probs));
  console.log('(C) onnxruntime-web Probs:', probs.map(v => Number(v.toFixed(6))));
  console.log(`(C) Top1: ${classes[maxIdx]} (${(probs[maxIdx] * 100).toFixed(1)}%)`);
}

async function main() {
  const cattleClasses = ['foot-and-mouth', 'healthy', 'lumpy'];
  const poultryClasses = ['Bumblefoot', 'Fowlpox', 'Healthy', 'coryza', 'crd'];

  await runTest('scripts/test_gradient.png', 'cattle', cattleClasses);
  await runTest('public/farm-setup/cows.png', 'cattle', cattleClasses);
  await runTest('public/farm-setup/poultry.png', 'poultry', poultryClasses);
}

main().catch(console.error);
