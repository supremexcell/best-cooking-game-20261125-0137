// Warung Rush — Dapur Kilat: the hand-in program (Node 22, stdlib only).
// Copies game/ and screenshots/ from beside this file to /output and writes
// /output/dossier.json, the summary the judge reads, with the vendored
// make.fun library. Outside the grader, MAKEFUN_OUTPUT_DIR stands in
// for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Preflight: refuse a hand-in that the sealed gate would refuse, with the
// reason up front instead of a silent invalid entry.
const gameDir = join(here, 'game');
if (!existsSync(join(gameDir, 'index.html'))) {
  throw new Error('game/index.html is missing — the game cannot be handed in without it');
}
const shotsDir = join(here, 'screenshots');
const shotNames = existsSync(shotsDir) ? readdirSync(shotsDir).filter((n) => !n.startsWith('.')) : [];
if (shotNames.length < 3 || shotNames.length > 4) {
  throw new Error(`screenshots/ must hold 3 or 4 images, found ${shotNames.length}`);
}
for (const name of shotNames) {
  if (statSync(join(shotsDir, name)).size > 262144) {
    throw new Error(`screenshot ${name} is over the 256 KiB cap`);
  }
}

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files in game/ or 48 MiB of
// game files, in all, or a path under game/ over 1000 bytes).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
    game_path_max_bytes: 1000,
  }),
);
