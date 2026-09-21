import * as esbuild from 'esbuild';
import path from 'path';
import fs from 'fs';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'dist-electron');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('⚡ Building Electron Main & Preload scripts...');

async function build() {
  try {
    // 1. Build main process
    await esbuild.build({
      entryPoints: [path.join(rootDir, 'electron/main.ts')],
      outfile: path.join(outDir, 'main.cjs'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      external: [
        'electron',
        'fsevents',
        'node-pty',
        'better-sqlite3',
        'classic-level'
      ],
      sourcemap: true,
      minify: false,
    });
    console.log('✅ Compiled main process -> dist-electron/main.cjs');

    // 2. Build preload process
    await esbuild.build({
      entryPoints: [path.join(rootDir, 'electron/preload.ts')],
      outfile: path.join(outDir, 'preload.cjs'),
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      external: ['electron'],
      sourcemap: true,
      minify: false,
    });
    console.log('✅ Compiled preload script -> dist-electron/preload.cjs');
  } catch (err) {
    console.error('❌ Build failed:', err);
    process.exit(1);
  }
}

build();
