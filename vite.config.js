import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import path from 'node:path';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          // نسخ ملف الـ wasm من مجلد المكتبة إلى جذر مجلد البناء
          src: 'node_modules/@wllama/wllama/src/single-thread/wllama.wasm',
          dest: '' 
        }
      ]
    })
  ],
  base: './',
  resolve: {
    alias: {
      // تجاوز مشكلة entry point
      '@wllama/wllama': path.resolve(__dirname, 'node_modules/@wllama/wllama/esm/index.js')
    }
  }
});
