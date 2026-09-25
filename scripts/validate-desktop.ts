import fs from 'fs';
import path from 'path';

function runValidation() {
  console.log('\n========================================');
  console.log('KERNEL BASE DOCS DESKTOP VALIDATION');
  console.log('========================================\n');

  const rootDir = process.cwd();
  let errors = 0;

  function check(description: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(` [✓] ${description}`);
    } else {
      console.error(` [✗] ${description}${detail ? ` - ${detail}` : ''}`);
      errors++;
    }
  }

  // 1. package.json checks
  const pkgPath = path.join(rootDir, 'package.json');
  const pkgExists = fs.existsSync(pkgPath);
  check('package.json exists', pkgExists);
  if (pkgExists) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    check('package.json main is dist-electron/main.cjs', pkg.main === 'dist-electron/main.cjs' || pkg.main === 'electron/main.cjs');
  }

  // 2. Electron Entry Point
  const mainPath = path.join(rootDir, 'electron/main.ts');
  check('Electron main process source (electron/main.ts) exists', fs.existsSync(mainPath));

  // 3. Preload Script
  const preloadPath = path.join(rootDir, 'electron/preload.ts');
  check('Electron preload script source (electron/preload.ts) exists', fs.existsSync(preloadPath));

  // 4. Linux Icon Asset
  const iconPath = path.join(rootDir, 'logo with bg.png');
  check('Linux application icon (logo with bg.png) exists', fs.existsSync(iconPath));

  // 5. Forge Configuration
  const forgePath = path.join(rootDir, 'forge.config.cjs');
  check('Electron Forge config (forge.config.cjs) exists', fs.existsSync(forgePath));

  // 6. Frontend Build Assets
  const distIndexPath = path.join(rootDir, 'index.html');
  check('Frontend index.html exists', fs.existsSync(distIndexPath));

  // 7. Packaged Linux Verification
  const outDir = path.join(rootDir, 'out');
  let pkgFound = false;
  let debFound = false;
  let pkgPathStr = '';
  let debPathStr = '';

  if (fs.existsSync(outDir)) {
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isFile() && (entry.name.endsWith('.deb') || entry.name.endsWith('.rpm') || entry.name.endsWith('.zip'))) {
          pkgFound = true;
          pkgPathStr = fullPath;
          if (entry.name.endsWith('.deb')) {
            debFound = true;
            debPathStr = fullPath;
          }
        } else if (entry.isDirectory()) {
          scanDir(fullPath);
        }
      }
    };
    scanDir(outDir);
  }

  check('Packaged Linux Executable / Distribution (.deb / .rpm / .zip) exists', pkgFound, pkgPathStr ? `Found at ${pkgPathStr}` : 'Run `npm run package:linux` or `npm run make:linux` first');

  console.log('\n----------------------------------------');
  if (errors === 0) {
    console.log(' ALL VALIDATION CHECKS PASSED PERFECTLY!');
  } else {
    console.log(` VALIDATION FINISHED WITH ${errors} PENDING CHECKS.`);
  }
  console.log('----------------------------------------\n');
}

runValidation();
