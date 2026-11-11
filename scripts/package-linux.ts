/**
 * Packages Kernel Base for Linux (x64 + arm64) as portable .tar.gz bundles.
 * Uses the official Electron Linux runtime zips from the local Electron cache
 * (downloads them with @electron/get if missing). Run on any host OS.
 */
import fs from 'fs';
import os from 'node:os';
import path from 'path';
import { execSync } from 'child_process';
import { downloadArtifact } from '@electron/get';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
const electronVersion: string = JSON.parse(
  fs.readFileSync(path.join(rootDir, 'node_modules/electron/package.json'), 'utf-8')
).version;
const arches = (process.argv.slice(2).find((a) => !a.startsWith('--')) || 'x64,arm64').split(',');

async function main() {
  if (!process.argv.includes('--skip-build')) {
    execSync('npm run build', { stdio: 'inherit', cwd: rootDir });
  }
  fs.mkdirSync(outDir, { recursive: true });
  // Reuse an already-downloaded runtime so packaging works offline
  const cacheRoot = path.join(os.homedir(), 'Library/Caches/electron');
  const cachedZip = (arch: string) => {
    const file = `electron-v${electronVersion}-linux-${arch}.zip`;
    if (!fs.existsSync(cacheRoot)) return null;
    for (const d of fs.readdirSync(cacheRoot)) {
      const p = path.join(cacheRoot, d, file);
      if (fs.existsSync(p)) return p;
    }
    return null;
  };

  for (const arch of arches) {
    console.log(`\n🐧 Packaging Kernel Base for linux-${arch} (Electron ${electronVersion})`);
    const zip = cachedZip(arch) || (await downloadArtifact({ version: electronVersion, platform: 'linux', arch, artifactName: 'electron' }));
    const name = `KernelBase-linux-${arch}`;
    const stageDir = path.join(rootDir, 'build', 'stage');
    const pkgDir = path.join(stageDir, name);
    fs.rmSync(path.join(outDir, name), { recursive: true, force: true }); // old layout
    fs.rmSync(pkgDir, { recursive: true, force: true });
    fs.mkdirSync(pkgDir, { recursive: true });
    execSync(`unzip -q "${zip}" -d "${pkgDir}"`);
    fs.renameSync(path.join(pkgDir, 'electron'), path.join(pkgDir, 'kernelbase'));
    fs.rmSync(path.join(pkgDir, 'resources', 'default_app.asar'), { force: true });

    const appDir = path.join(pkgDir, 'resources', 'app');
    fs.mkdirSync(appDir, { recursive: true });
    fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(appDir, 'package.json'));
    fs.cpSync(path.join(rootDir, 'dist-electron'), path.join(appDir, 'dist-electron'), { recursive: true });
    fs.cpSync(path.join(rootDir, 'dist'), path.join(appDir, 'dist'), { recursive: true });
    // unpdf is pure JS (PDF extraction for Resources). node-pty is a macOS build here,
    // so Linux uses the terminal's built-in pipe fallback.
    const unpdf = fs.realpathSync(path.join(rootDir, 'node_modules/unpdf'));
    for (const part of ['package.json', 'dist']) {
      fs.cpSync(path.join(unpdf, part), path.join(appDir, 'node_modules/unpdf', part), { recursive: true, dereference: true });
    }
    const indexHtml = path.join(appDir, 'dist', 'index.html');
    fs.writeFileSync(indexHtml, fs.readFileSync(indexHtml, 'utf-8').replace(/\s+crossorigin(?:="[^"]*")?/g, ''));

    const icon = path.join(rootDir, 'public', 'logo.png');
    if (fs.existsSync(icon)) fs.copyFileSync(icon, path.join(pkgDir, 'kernelbase.png'));
    fs.writeFileSync(
      path.join(pkgDir, 'kernelbase.desktop'),
      [
        '[Desktop Entry]',
        'Name=Kernel Base',
        'Comment=AI-native multi-agent IDE',
        'Exec=sh -c \'"$(dirname "%k")/kernelbase" %U\'',
        'Icon=kernelbase',
        'Type=Application',
        'Categories=Development;IDE;',
        'Terminal=false',
        '',
      ].join('\n')
    );
    fs.writeFileSync(
      path.join(pkgDir, 'README-LINUX.txt'),
      'Run: ./kernelbase   (if Chromium sandbox errors appear: ./kernelbase --no-sandbox)\n'
    );

    const tarPath = path.join(outDir, `Kernel-Base-IDE-linux-${arch}.tar.gz`);
    execSync(`tar -czf "${tarPath}" -C "${stageDir}" "${name}"`);
    console.log(`✅ Created ${tarPath}`);
    if (!process.env.KEEP_STAGE) fs.rmSync(pkgDir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error('❌ Linux packaging failed:', e);
  process.exit(1);
});
