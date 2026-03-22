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
const bins = ['src/bin/we-cos-sim.ts', 'src/bin/download-model.ts', 'src/bin/model-to-level.ts', 'src/bin/verify-level-db.ts', 'src/bin/embeddings.ts'];
for (const bin of bins) {
  const name = bin.split('/').pop()?.replace('.ts', '.js') ?? '';
  await esbuild.build({
    entryPoints: [bin],
    bundle: true,
    platform: 'node',
    format: 'esm',
    outdir: 'dist/bin',
    sourcemap: true,
    packages: 'external',
    banner: {
      js: '#!/usr/bin/env node',
    },
  });
}

// Copy declaration files from tsc (run tsc first for types)
console.log('Build complete. Run `npx tsc --emitDeclarationOnly` for types.');
