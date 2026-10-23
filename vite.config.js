import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const wd = path.join(dir, 'node_modules', '@wllama', 'wllama');
const pick = x => typeof x === 'string' ? x : (x && (x.default || x.import || x.module)) || null;

function wllamaEntry() {
  const cands = [];
  try {
    const pkg = JSON.parse(fs.readFileSync(path.join(wd, 'package.json'), 'utf8'));
    const e = (pkg.exports && pkg.exports['.']) || {};
    const rel = pick(e.import) || pick(e.default) || pick(e.browser) || pick(pkg.exports) || pick(pkg.module) || pick(pkg.main);
    if (rel) cands.push(path.resolve(wd, rel));
  } catch (err) {}
  cands.push(path.join(wd, 'esm', 'index.js'));
  cands.push(path.join(wd, 'dist', 'index.js'));
  cands.push(path.join(wd, 'lib', 'index.js'));
  cands.push(path.join(wd, 'index.js'));
  for (const c of cands) {
    try { if (fs.existsSync(c)) return c; } catch (e) {}
  }
  let listing = 'PACKAGE DIR MISSING: ' + wd;
  try { listing = fs.readdirSync(wd).join(' | '); } catch (e) {}
  throw new Error('WLLAMA ENTRY NOT FOUND. Contents of package dir: ' + listing);
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
