import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { spawn } from 'child_process';
import fs from 'fs';

function findPythonExecutable(): string {
  const rootDir = process.cwd();
  const isWin = process.platform === 'win32';

  if (isWin) {
    const candidates = [
      path.join(rootDir, '.venv', 'Scripts', 'python.exe'),
      path.join(rootDir, 'venv', 'Scripts', 'python.exe'),
      process.env.VIRTUAL_ENV ? path.join(process.env.VIRTUAL_ENV, 'Scripts', 'python.exe') : '',
    ];
    for (const c of candidates) {
      if (c && fs.existsSync(c)) return c;
    }
    return 'python';
  } else {
    const candidates = [
      path.join(rootDir, '.venv', 'bin', 'python3'),
      path.join(rootDir, '.venv', 'bin', 'python'),
      path.join(rootDir, 'venv', 'bin', 'python3'),
      path.join(rootDir, 'venv', 'bin', 'python'),
      process.env.VIRTUAL_ENV ? path.join(process.env.VIRTUAL_ENV, 'bin', 'python3') : '',
      'python3',
      'python',
    ];
    for (const c of candidates) {
      if (c && (path.isAbsolute(c) ? fs.existsSync(c) : true)) return c;
    }
    return 'python3';
  }
}

function mlInferencePlugin(): Plugin {
  return {
    name: 'ml-inference-plugin',
    configureServer(server) {
      // 1. Serve ONNX WebAssembly files directly with the proper MIME type
      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const cleanUrl = req.url.split('?')[0];
          if (cleanUrl.startsWith('/wasm/') || cleanUrl.endsWith('.wasm') || cleanUrl.includes('ort-wasm')) {
            const fileName = path.basename(cleanUrl);
            const distPath = path.join(process.cwd(), 'node_modules', 'onnxruntime-web', 'dist', fileName);
            if (fs.existsSync(distPath)) {
              if (fileName.endsWith('.wasm')) {
                res.setHeader('Content-Type', 'application/wasm');
              } else if (fileName.endsWith('.mjs') || fileName.endsWith('.js')) {
                res.setHeader('Content-Type', 'application/javascript');
              }
              res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
              return fs.createReadStream(distPath).pipe(res);
            }
          }
        }
        next();
      });

      // 2. Python ML inference endpoint
      server.middlewares.use('/api/diagnose', (req, res, next) => {
        if (req.method !== 'POST') return next();

        const chunks: Buffer[] = [];
        req.on('data', chunk => { chunks.push(Buffer.from(chunk)); });
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks).toString('utf-8');
            const rootDir = process.cwd();
            const pythonExecutable = findPythonExecutable();
            const scriptPath = path.join(rootDir, 'src', 'ml_model', 'predict.py');

            const proc = spawn(pythonExecutable, [scriptPath], {
              shell: process.platform === 'win32',
              windowsHide: true,
            });

            let stdout = '';
            let stderr = '';

            proc.stdout.on('data', data => { stdout += data.toString(); });
            proc.stderr.on('data', data => { stderr += data.toString(); });

            proc.on('close', code => {
              res.setHeader('Content-Type', 'application/json');
              if (code === 0 && stdout.trim()) {
                res.writeHead(200);
                res.end(stdout);
              } else {
                res.writeHead(500);
                res.end(JSON.stringify({ success: false, error: stderr || 'Inference process exited with code ' + code }));
              }
            });

            proc.stdin.write(body);
            proc.stdin.end();
          } catch (err: any) {
            res.setHeader('Content-Type', 'application/json');
            res.writeHead(500);
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    },
    generateBundle() {
      // Emit ONNX runtime WebAssembly assets into the production build
      const distDir = path.join(process.cwd(), 'node_modules', 'onnxruntime-web', 'dist');
      const wasmFiles = [
        'ort-wasm-simd-threaded.wasm',
        'ort-wasm-simd-threaded.mjs',
      ];
      for (const file of wasmFiles) {
        const fullPath = path.join(distDir, file);
        if (fs.existsSync(fullPath)) {
          this.emitFile({
            type: 'asset',
            fileName: file,
            source: fs.readFileSync(fullPath),
          });
          this.emitFile({
            type: 'asset',
            fileName: `wasm/${file}`,
            source: fs.readFileSync(fullPath),
          });
        }
      }
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), mlInferencePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
  };
});
