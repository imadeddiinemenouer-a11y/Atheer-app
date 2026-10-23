import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ضروري جداً ليعمل التطبيق داخل الـ APK
  optimizeDeps: {
    // نستبعد wllama من محاولة Vite تحسينها مسبقاً لتجنب خطأ entry point
    exclude: ['@wllama/wllama']
  }
});
