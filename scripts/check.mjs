import { readdir, readFile, access } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const root = resolve(import.meta.dirname, '..');
const files = [];
async function walk(dir) { if (!existsSync(dir)) return; for (const e of await readdir(dir, { withFileTypes: true })) { const f = resolve(dir, e.name); if (e.isDirectory()) await walk(f); else files.push(f); } }
for (const d of ['src', 'data', 'scripts', 'tests']) await walk(resolve(root, d));
let modules = 0;
for (const file of files.filter(f => /\.(m?js)$/.test(f))) {
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status) throw new Error(result.stderr);
  const text = await readFile(file, 'utf8');
  for (const m of text.matchAll(/(?:from\s*|import\s*)['"](\.[^'"]+)['"]/g)) await access(resolve(dirname(file), m[1]));
  modules++;
}
if (existsSync(resolve(root, 'data/index.js'))) {
  const { content } = await import(pathToFileURL(resolve(root, 'data/index.js')));
  const { validateContent } = await import(pathToFileURL(resolve(root, 'src/engine/validateContent.js')));
  const errors = validateContent(content); if (errors.length) throw new Error(errors.join('\n'));
}
console.log(`PASS: syntax and local module references (${modules} modules); content graph validated when present.`);
