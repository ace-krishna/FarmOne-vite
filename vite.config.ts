import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { spawn } from 'child_process';
import fs from 'fs';

function mlInferencePlugin(): Plugin {
  return {
    name: 'ml-inference-plugin',
    configureServer(server) {
      server.middlewares.use('/api/diagnose', (req, res, next) => {
        if (req.method !== 'POST') return next();

        const chunks: Buffer[] = [];
        req.on('data', chunk => { chunks.push(Buffer.from(chunk)); });
        req.on('end', () => {
          try {
            const body = Buffer.concat(chunks).toString('utf-8');
            const rootDir = process.cwd();
            const pythonBin = path.join(rootDir, '.venv', 'bin', 'python3');
            const scriptPath = path.join(rootDir, 'src', 'ml_model', 'predict.py');

            const pythonExecutable = fs.existsSync(pythonBin) ? pythonBin : 'python3';
            const proc = spawn(pythonExecutable, [scriptPath]);

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
