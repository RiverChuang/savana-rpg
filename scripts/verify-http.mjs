import { readdir } from 'node:fs/promises';
import { resolve, relative, sep } from 'node:path';

const base = process.argv[2];
if (!base || !/^https?:\/\//.test(base)) throw new Error('Usage: node scripts/verify-http.mjs https://owner.github.io/savana-rpg/');
const root = resolve(import.meta.dirname, '..', 'dist');
async function collect(dir) {
  const files = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collect(path));
    else if (/\.(html|css|js|svg)$/.test(path)) files.push(path);
  }
  return files;
}
const files = await collect(root), failures = [];
for (let start = 0; start < files.length; start += 6) {
  const batch = await Promise.all(files.slice(start, start + 6).map(async file => {
    const path = relative(root, file).split(sep).join('/');
    try {
      const response = await fetch(new URL(path, base.endsWith('/') ? base : base + '/'), { signal: AbortSignal.timeout(20000) });
      const type = response.headers.get('content-type') || '';
      const validType = file.endsWith('.js') ? /javascript/.test(type) : file.endsWith('.css') ? /text\/css/.test(type) : file.endsWith('.svg') ? /image\/svg/.test(type) : /text\/html/.test(type);
      await response.arrayBuffer();
      return response.ok && validType ? null : `${path}: HTTP ${response.status}, ${type}`;
    } catch (error) { return `${path}: ${error.message}`; }
  }));
  failures.push(...batch.filter(Boolean));
}
if (failures.length) throw new Error(failures.join('\n'));
console.log(`PASS: ${files.length} live HTML/CSS/JS/SVG resources returned success with correct content types at ${base}`);
