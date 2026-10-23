import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const wd = path.join(dir, 'node_modules', '@wllama', 'wllama');
const pick = x => typeof x === 'string' ? x : (x && (x.default || x.import || x.module)) || null;

function wllamaEntry() {
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(wd, 'package.json'), 'utf8'));
    const e = (pkg.exports && pkg.exports['.']) || {};
    const rel = pick(e.import) || pick(e.default) || pick(e.browser) || pick(pkg.exports) || pick(pkg.module) || pick(pkg.main);
    if (rel) {
      const abs = path.resolve(wd, rel);
      if (fs.existsSync(abs)) return abs;
    }
  } catch (err) {}
  return '@wllama/wllama';
}

export default defineConfig({
  plugins: [react()],
  base: './',
  resolve: {
    alias: [
      { find: /^@wllama\/wllama$/, replacement: wllamaEntry() },
      { find: /^@wllama\/wllama\//, replacement: wd + path.sep }
    ]
  }
});
