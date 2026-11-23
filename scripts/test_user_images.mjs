import fs from 'fs';
import path from 'path';
import { runInference } from '../src/services/mlInference.ts';

const testDir = '/home/pear/Pictures/test';

async function testCategory(category, species, modelType) {
  const dirPath = path.join(testDir, category);
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
  if (files.length === 0) return;

  const firstFile = path.join(dirPath, files[0]);
  const imgBuf = fs.readFileSync(firstFile);
  const dataUrl = `data:image/png;base64,${imgBuf.toString('base64')}`;

  const res = await runInference(dataUrl, species, modelType);
  console.log(`[${category.toUpperCase()}] ${files[0]} (model: ${modelType}):`);
  console.log(`  Success: ${res.success}`);
  console.log(`  Condition: ${res.condition} (${res.confidence}%)`);
  console.log(`  IsHealthy: ${res.isHealthy}`);
  console.log(`  Source: ${res.source}`);
  if (res.error) console.log(`  Error: ${res.error}`);
  console.log(`  Probabilities:`, res.probabilities);
  console.log();
}

async function main() {
  console.log('Testing real user disease images from ~/Pictures/test:\n');
  await testCategory('fmd', 'cow', 'cattle');
  await testCategory('lump', 'cow', 'cattle');
  await testCategory('bumblefoot', 'hen', 'poultry');
  await testCategory('fowlpox', 'hen', 'poultry');
  await testCategory('coryza', 'hen', 'poultry');
}

main().catch(console.error);
