import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import * as ort from 'onnxruntime-web';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Read PNG
const pngBuffer = fs.readFileSync(path.join(rootDir, 'scripts/test_gradient.png'));
const png = PNG.sync.read(pngBuffer);
const { width, height, data } = png;

console.log(`Loaded PNG: ${width}x${height}, channels: 4`);

// Preprocess: Resize shorter side to 224, center-crop 224x224 (Bilinear)
// Matching PIL.Image.resize((new_w, new_h), Image.BILINEAR) + crop
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

console.log(`Resized to ${new_w}x${new_h}, cropLeft=${cropLeft}, cropTop=${cropTop}`);

// Bilinear sampling directly into 224x224
const tensorData = new Float32Array(3 * 224 * 224);
const channelStride = 224 * 224;

// Coordinate mapping matching PIL BILINEAR:
// In PIL: x_orig = (x_resized + 0.5) * (width / new_w) - 0.5
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

// Compute stats
let min = Infinity, max = -Infinity, sum = 0;
for (let i = 0; i < tensorData.length; i++) {
  const v = tensorData[i];
  if (v < min) min = v;
  if (v > max) max = v;
  sum += v;
}
const mean = sum / tensorData.length;

console.log('\n=== Input Tensor Stats (C: TypeScript / Node) ===');
console.log('Shape: [1, 3, 224, 224]');
console.log('Min:', min, 'Max:', max, 'Mean:', mean);
console.log('First 10 values:', Array.from(tensorData.slice(0, 10)));

// Run onnxruntime-web
ort.env.wasm.numThreads = 1;
const session = await ort.InferenceSession.create(path.join(rootDir, 'public/models/model.onnx'), {
  executionProviders: ['wasm'],
});

const inputTensor = new ort.Tensor('float32', tensorData, [1, 3, 224, 224]);
const feeds = { [session.inputNames[0]]: inputTensor };
const results = await session.run(feeds);
const out = Array.from(results[session.outputNames[0]].data);

console.log('\n=== (C) onnxruntime-web Output ===');
console.log('Raw output vector:', out);
const classes = ['foot-and-mouth', 'healthy', 'lumpy'];
let maxIdx = 0;
for (let i = 1; i < out.length; i++) {
  if (out[i] > out[maxIdx]) maxIdx = i;
}
console.log('Predicted class:', classes[maxIdx], 'Confidence:', out[maxIdx]);
