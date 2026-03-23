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
  { src: 'src/bin/similarity.ts', out: 'embeddings-cos-sim.js' },
  { src: 'src/bin/download-model.ts', out: 'embeddings-cos-sim-download.js' },
  { src: 'src/bin/model-to-level.ts', out: 'embeddings-cos-sim-level.js' },
  { src: 'src/bin/verify-level-db.ts', out: 'embeddings-cos-sim-verify.js' },
  { src: 'src/bin/embeddings.ts', out: 'embeddings-cos-sim-embeddings.js' },
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
    banner: {
      js: '#!/usr/bin/env node',
    },
  });
}

// Copy declaration files from tsc (run tsc first for types)
console.log('Build complete. Run `npx tsc --emitDeclarationOnly` for types.');
