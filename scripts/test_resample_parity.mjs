import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import * as ort from 'onnxruntime-web';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

/**
 * Computes PIL-compatible 1D bilinear resampling weights and indices with anti-aliasing.
 */
function getResampleWeights(inSize, outSize) {
  const scale = outSize / inSize;
  const support = scale < 1.0 ? 1.0 / scale : 1.0;
  const indices = [];
  const weights = [];

  for (let x = 0; x < outSize; x++) {
    const center = (x + 0.5) / scale - 0.5;
    const xmin = Math.max(0, Math.floor(center - support) + 1);
    const xmax = Math.min(inSize - 1, Math.floor(center + support));
    const idx = [];
    const w = [];
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
 * 1. Aspect-ratio preserving Resize (shorter side to 224) with anti-aliasing.
 * 2. Center crop to 224x224.
 * 3. Normalization to [0.0, 1.0].
 * 4. Planar NCHW layout: [1, 3, 224, 224] Float32Array.
 */
export function preprocessRgbaToPlanarNCHW(rgbaData, width, height, targetW = 224, targetH = 224) {
  let newW, newH;
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
  // Intermediate buffer: newW * height * 3 (RGB)
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

  // Step 2: Vertical Resampling directly into Center Cropped 224x224 Planar NCHW
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
      tensor[outIdx] = rClamped / 255.0; // R
      tensor[channelStride + outIdx] = gClamped / 255.0; // G
      tensor[channelStride * 2 + outIdx] = bClamped / 255.0; // B
    }
  }

  return tensor;
}

async function runParityTest(imageRelPath, modelType) {
  console.log(`\n======================================================`);
  console.log(`TEST: ${imageRelPath} (${modelType})`);
  console.log(`======================================================`);

  const pngBuf = fs.readFileSync(path.join(rootDir, imageRelPath));
  const png = PNG.sync.read(pngBuf);
  const tensor = preprocessRgbaToPlanarNCHW(png.data, png.width, png.height, 224, 224);

  let min = Infinity, max = -Infinity, sum = 0;
  for (let i = 0; i < tensor.length; i++) {
    const v = tensor[i];
    if (v < min) min = v;
    if (v > max) max = v;
    sum += v;
  }
  const mean = sum / tensor.length;

  console.log(`TypeScript Input Tensor Stats: min=${min.toFixed(4)}, max=${max.toFixed(4)}, mean=${mean.toFixed(4)}`);
  console.log('TypeScript First 10 input values:', Array.from(tensor.slice(0, 10)).map(v => Number(v.toFixed(6))));

  ort.env.wasm.numThreads = 1;
  const modelPath = path.join(rootDir, `public/models/${modelType === 'poultry' ? 'poultry_best.onnx' : 'cattle_best.onnx'}`);
  const session = await ort.InferenceSession.create(modelPath, {
    executionProviders: ['wasm'],
  });

  const inputTensor = new ort.Tensor('float32', tensor, [1, 3, 224, 224]);
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

  const classes = modelType === 'poultry'
    ? ['Bumblefoot', 'Fowlpox', 'Healthy', 'coryza', 'crd']
    : ['foot-and-mouth', 'healthy', 'lumpy'];

  const maxIdx = probs.indexOf(Math.max(...probs));
  console.log('(C) onnxruntime-web Probs:', probs.map(v => Number(v.toFixed(6))));
  console.log(`(C) Top1: ${classes[maxIdx]} (${(probs[maxIdx] * 100).toFixed(2)}%)`);

  return {
    image: imageRelPath,
    modelType,
    tensorStats: { min, max, mean },
    first10: Array.from(tensor.slice(0, 10)),
    probs,
    top1Class: classes[maxIdx],
    top1Conf: probs[maxIdx]
  };
}

async function main() {
  const tsResults = [];
  tsResults.push(await runParityTest('scripts/test_gradient.png', 'cattle'));
  tsResults.push(await runParityTest('public/farm-setup/cows.png', 'cattle'));
  tsResults.push(await runParityTest('public/farm-setup/poultry.png', 'poultry'));

  fs.writeFileSync(path.join(rootDir, 'scripts/ts_parity_results.json'), JSON.stringify(tsResults, null, 2));
}

main().catch(console.error);
