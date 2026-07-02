import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import runtimeErrorOverlay from '@replit/vite-plugin-runtime-error-modal';

// ✅ Safe defaults (important for Vercel)
const port = Number(process.env.PORT) || 5173;
const basePath = process.env.BASE_PATH || '/';

export default defineConfig(async () => {
  return {
    base: basePath,

    plugins: [
      react(),
      tailwindcss(),
      runtimeErrorOverlay(),

      // ✅ Only load Replit plugins in dev
      ...(process.env.NODE_ENV !== 'production' &&
      process.env.REPL_ID !== undefined
        ? [
            (await import('@replit/vite-plugin-cartographer')).cartographer({
              root: path.resolve(__dirname, '..'),
            }),
            (await import('@replit/vite-plugin-dev-banner')).devBanner(),
          ]
        : []),
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, '..', '..', 'attached_assets'),
      },
      dedupe: ['react', 'react-dom'],
    },

    root: path.resolve(__dirname),

    build: {
      outDir: path.resolve(__dirname, 'dist/public'),
      emptyOutDir: true,
    },

    server: {
      port,
      strictPort: true,
      host: '0.0.0.0',
      allowedHosts: true,
      fs: {
        strict: true,
      },
    },

    preview: {
      port,
      host: '0.0.0.0',
      allowedHosts: true,
    },
  };
});
