import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  base: './', 
  build: {
    outDir: 'dist', 
    emptyOutDir: false, // يمنع حذف ملف wllama.wasm الذي رفعته يدوياً
  },
  resolve: {
    alias: {
      // ✅ الحل: توجيه Vite مباشرة إلى ملف المكتبة الحقيقي داخل node_modules
      '@wllama/wllama': path.resolve(__dirname, 'node_modules/@wllama/wllama/esm/index.js')
    }
  }
});
