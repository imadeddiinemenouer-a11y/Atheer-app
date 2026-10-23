import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ضروري للعمل داخل الـ APK
  build: {
    outDir: 'dist', // مجلد البناء
    emptyOutDir: false, // ✅ هذا هو السر: لا تحذف ملف wllama.wasm الموجود مسبقاً!
  },
  optimizeDeps: {
    exclude: ['@wllama/wllama'] // نمنع Vite من محاولة تحسينها
  }
});
