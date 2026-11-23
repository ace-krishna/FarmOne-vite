import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

/**
 * Dev server middleware to ensure local WASM and ONNX model files
 * are served with exact MIME types during local development.
 */
function wasmDevPlugin(): Plugin {
  return {
    name: 'wasm-dev-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const cleanUrl = req.url.split('?')[0];

        if (cleanUrl.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
          res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        } else if (cleanUrl.endsWith('.mjs')) {
          res.setHeader('Content-Type', 'application/javascript');
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: './', // Capacitor relative asset path support
    plugins: [
      react(),
      tailwindcss(),
      wasmDevPlugin(),
      viteStaticCopy({
        targets: [
          {
            src: 'node_modules/onnxruntime-web/dist/*.{wasm,mjs}',
            dest: 'ort',
            rename: {
              stripBase: true,
            },
          },
          {
            src: 'node_modules/onnxruntime-web/dist/*.{wasm,mjs}',
            dest: 'assets/ort',
            rename: {
              stripBase: true,
            },
          },
        ],
      }),
    ],
    optimizeDeps: {
      exclude: ['onnxruntime-web'], // Prevent Vite from mangling WASM loading
    },
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      chunkSizeWarningLimit: 2000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('onnxruntime-web')) {
              return 'ort';
            }
          },
        },
      },
    },
  };
});
