import { cp, mkdir, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..'), out = resolve(root, 'dist');
await mkdir(out, { recursive: true });
for (const name of ['index.html', 'styles.css', 'src', 'data', 'assets']) {
  if (existsSync(resolve(root, name))) await cp(resolve(root, name), resolve(out, name), { recursive: true });
}
await writeFile(resolve(out, '.nojekyll'), '');
console.log(`Static build ready: ${out} (${(await readdir(out)).join(', ')})`);
