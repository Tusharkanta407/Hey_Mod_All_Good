import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { devvit } from '@devvit/start/vite';

export default defineConfig({
  plugins: [react(), tailwindcss(), devvit()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src/client'),
      '@shared': path.resolve(import.meta.dirname, 'src/lib'),
    },
  },
});
