#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcDir = path.join(rootDir, 'node_modules', 'onnxruntime-web', 'dist');
const destDir = path.join(rootDir, 'public', 'ort');

if (!fs.existsSync(srcDir)) {
  console.warn(`[copy-ort-wasm] Source directory not found: ${srcDir}`);
  process.exit(0);
}

fs.mkdirSync(destDir, { recursive: true });

// Copy all .wasm and .mjs files needed by ONNX Runtime Web
const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.wasm') || f.endsWith('.mjs'));

let count = 0;
for (const file of files) {
  const src = path.join(srcDir, file);
  const dest = path.join(destDir, file);
  fs.copyFileSync(src, dest);
  count++;
}

console.log(`[copy-ort-wasm] Successfully copied ${count} ONNX Runtime assets to ${destDir}`);
