import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import * as ort from 'onnxruntime-web';
import { preprocessRgbaToPlanarNCHW, applySoftmaxIfLogits } from '../src/services/mlInference.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

async function main() {
  const pyResultsRaw = fs.readFileSync(path.join(rootDir, 'scripts/python_parity_results.json'), 'utf8');
  const pyResults = JSON.parse(pyResultsRaw);

  console.log('='.repeat(90));
  console.log('FARMONE END-TO-END NUMERICAL PARITY AUDIT REPORT');
  console.log('PyTorch (Python) vs. ONNX Runtime (Python) vs. onnxruntime-web (TypeScript)');
  console.log('='.repeat(90));

  ort.env.wasm.numThreads = 1;

  const comparisonRows = [];

  for (const pyItem of pyResults) {
    const { image, model_type, classes, input_stats: pyInputStats, first10_input: pyFirst10, pytorch, python_ort } = pyItem;

    const pngBuf = fs.readFileSync(path.join(rootDir, image));
    const png = PNG.sync.read(pngBuf);
    const tsTensor = preprocessRgbaToPlanarNCHW(png.data, png.width, png.height, 224, 224);

    let tsMin = Infinity, tsMax = -Infinity, tsSum = 0;
    for (let i = 0; i < tsTensor.length; i++) {
      const v = tsTensor[i];
      if (v < tsMin) tsMin = v;
      if (v > tsMax) tsMax = v;
      tsSum += v;
    }
    const tsMean = tsSum / tsTensor.length;
    const tsFirst10 = Array.from(tsTensor.slice(0, 10)).map(v => Number(v.toFixed(6)));

    const modelFile = model_type === 'poultry' ? 'poultry_best.onnx' : 'cattle_best.onnx';
    const modelPath = path.join(rootDir, 'public/models', modelFile);
    const session = await ort.InferenceSession.create(modelPath, {
      executionProviders: ['wasm'],
    });

    const inputName = session.inputNames[0] || 'images';
    const outputName = session.outputNames[0] || 'output0';
    const inputOrtTensor = new ort.Tensor('float32', tsTensor, [1, 3, 224, 224]);
    const results = await session.run({ [inputName]: inputOrtTensor });
    const rawOut = Array.from(results[outputName].data);

    const tsProbs = applySoftmaxIfLogits(rawOut);
    let tsTop1Idx = 0;
    for (let i = 1; i < tsProbs.length; i++) {
      if (tsProbs[i] > tsProbs[tsTop1Idx]) tsTop1Idx = i;
    }
    const tsTop1Class = classes[tsTop1Idx];
    const tsTop1Conf = tsProbs[tsTop1Idx];

    const top1Match = (tsTop1Class === pytorch.top1_class && tsTop1Class === python_ort.top1_class);
    const confDiffPt = Math.abs(tsTop1Conf - pytorch.top1_conf);
    const confDiffOrt = Math.abs(tsTop1Conf - python_ort.top1_conf);

    let maxProbDiffPt = 0;
    for (let i = 0; i < classes.length; i++) {
      const d = Math.abs(tsProbs[i] - pytorch.probs[i]);
      if (d > maxProbDiffPt) maxProbDiffPt = d;
    }

    const pass = top1Match && confDiffPt <= 0.02;

    console.log(`\nSample: ${image} [${model_type.toUpperCase()}]`);
    console.log(`-`.repeat(80));
    console.log(`INPUT TENSOR COMPARISON:`);
    console.log(`  Python Min/Max/Mean:     ${pyInputStats.min.toFixed(4)} / ${pyInputStats.max.toFixed(4)} / ${pyInputStats.mean.toFixed(4)}`);
    console.log(`  TypeScript Min/Max/Mean: ${tsMin.toFixed(4)} / ${tsMax.toFixed(4)} / ${tsMean.toFixed(4)}`);
    console.log(`  Python First 10:         [${pyFirst10.map(v => v.toFixed(6)).join(', ')}]`);
    console.log(`  TypeScript First 10:     [${tsFirst10.map(v => v.toFixed(6)).join(', ')}]`);

    console.log(`\nPREDICTION PROBABILITIES:`);
    console.log(`  Classes:                 [${classes.join(', ')}]`);
    console.log(`  (A) PyTorch (Python):    [${pytorch.probs.map(v => v.toFixed(6)).join(', ')}]`);
    console.log(`  (B) ORT (Python):        [${python_ort.probs.map(v => v.toFixed(6)).join(', ')}]`);
    console.log(`  (C) ORT Web (TypeScript):[${tsProbs.map(v => v.toFixed(6)).join(', ')}]`);

    console.log(`\nTOP-1 PREDICTION:`);
    console.log(`  (A) PyTorch:             ${pytorch.top1_class} (${(pytorch.top1_conf * 100).toFixed(2)}%)`);
    console.log(`  (B) Python ORT:          ${python_ort.top1_class} (${(python_ort.top1_conf * 100).toFixed(2)}%)`);
    console.log(`  (C) TypeScript ORT Web:  ${tsTop1Class} (${(tsTop1Conf * 100).toFixed(2)}%)`);
    console.log(`  Class Match:             ${top1Match ? 'YES (100% IDENTICAL)' : 'NO'}`);
    console.log(`  Top-1 Confidence Delta:  ${(confDiffPt * 100).toFixed(2)}% (Threshold: <= 2.0%)`);
    console.log(`  Max Class Prob Delta:    ${(maxProbDiffPt * 100).toFixed(2)}%`);
    console.log(`  STATUS:                  ${pass ? '>>> PASS <<<' : '>>> FAIL <<<'}`);

    comparisonRows.push({
      image,
      model_type,
      top1Match,
      ptTop1: `${pytorch.top1_class} (${(pytorch.top1_conf * 100).toFixed(2)}%)`,
      ortTop1: `${python_ort.top1_class} (${(python_ort.top1_conf * 100).toFixed(2)}%)`,
      tsTop1: `${tsTop1Class} (${(tsTop1Conf * 100).toFixed(2)}%)`,
      confDelta: `${(confDiffPt * 100).toFixed(2)}%`,
      status: pass ? 'PASS' : 'FAIL'
    });
  }

  console.log(`\n${'='.repeat(90)}`);
  console.log('SUMMARY TABLE');
  console.log('='.repeat(90));
  console.table(comparisonRows);

  const allPassed = comparisonRows.every(r => r.status === 'PASS');
  if (!allPassed) {
    console.error('\nParity verification failed for one or more test samples!');
    process.exit(1);
  }
  console.log('\nAll parity checks PASSED successfully!\n');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
