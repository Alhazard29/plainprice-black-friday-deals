// Hands the site in: copies app/ and screenshots/ to the output directory and writes dossier.json there.
// Node 22, standard library only. Run: node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = dirname(fileURLToPath(import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR || '/output';

// Stop with a clear message if the repository is incomplete, before anything is written.
for (const needed of ['app/index.html', 'screenshots']) {
  if (!existsSync(join(here, needed))) {
    console.error(`main.ts: ${needed} is missing from the repository`);
    process.exit(1);
  }
}

// Copy file contents only: the output directory is created if absent and otherwise left as it is.
mkdirSync(out, { recursive: true });
for (const part of ['app', 'screenshots']) {
  cpSync(join(here, part), join(out, part), { recursive: true, preserveTimestamps: false });
}

const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 16777216,
});
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`wrote ${join(out, 'dossier.json')} (${dossier.length} bytes)`);
