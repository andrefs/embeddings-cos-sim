import * as esbuild from 'esbuild';
import { copyFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

// Clean dist
import { rmSync } from 'fs';
try { rmSync('dist', { recursive: true }); } catch {}

// Build library
await esbuild.build({
  entryPoints: [
    'src/index.ts',
    'src/lib/cosSim.ts',
    'src/lib/utils.ts',
  ],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outdir: 'dist',
  sourcemap: true,
  packages: 'external',
});

// Copy and build bin files
const bins = [
  { src: 'src/bin/index.ts', out: 'embeddings-cos-sim.js', banner: true },
  { src: 'src/bin/download-model.ts', out: 'embeddings-cos-sim-download.js', banner: true },
  { src: 'src/bin/model-to-level.ts', out: 'embeddings-cos-sim-level.js', banner: true },
  { src: 'src/bin/verify-level-db.ts', out: 'embeddings-cos-sim-verify.js', banner: true },
  { src: 'src/bin/embeddings.ts', out: 'embeddings-cos-sim-embeddings.js', banner: true },
];
for (const bin of bins) {
  await esbuild.build({
    entryPoints: [bin.src],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outfile: `dist/bin/${bin.out}`,
    sourcemap: true,
    packages: 'external',
    ...(bin.banner ? { banner: { js: '#!/usr/bin/env node' } } : {}),
  });
}

// Copy declaration files from tsc (run tsc first for types)
console.log('Build complete. Run `./node_modules/.bin/tsc --emitDeclarationOnly` for types.');
