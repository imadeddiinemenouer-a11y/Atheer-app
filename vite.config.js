import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // ضروري جداً ليعمل التطبيق داخل الـ APK (WebView) بدون مشاكل في المسارات
  resolve: {
    alias: [
      // نوجه Vite للتعامل مع مكتبة wllama مباشرة
      { find: /^@wllama\/wllama$/, replacement: '@wllama/wllama' }
    ]
  }
});
