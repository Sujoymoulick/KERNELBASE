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
    check('package.json version is 1.0.0', pkg.version === '1.0.0', `Found ${pkg.version}`);
    check('package.json main is electron/main.cjs', pkg.main === 'electron/main.cjs');
    check('package.json config.forge is set', !!pkg.config?.forge);
  }

  // 2. Electron Entry Point
  const mainPath = path.join(rootDir, 'electron/main.cjs');
  check('Electron main process (electron/main.cjs) exists', fs.existsSync(mainPath));

  // 3. Preload Script
  const preloadPath = path.join(rootDir, 'electron/preload.cjs');
  check('Electron preload script (electron/preload.cjs) exists', fs.existsSync(preloadPath));

  // 4. macOS Icon
  const iconPath = path.join(rootDir, 'build/icon.icns');
  check('macOS iconset (build/icon.icns) exists', fs.existsSync(iconPath));

  // 5. Forge Configuration
  const forgePath = path.join(rootDir, 'forge.config.cjs');
  check('Electron Forge config (forge.config.cjs) exists', fs.existsSync(forgePath));

  // 6. Frontend Build Assets
  const distIndexPath = path.join(rootDir, 'dist/index.html');
  check('Frontend compiled dist/index.html exists', fs.existsSync(distIndexPath));

  // 7. Packaged .app verification
  const outDir = path.join(rootDir, 'out');
  let appFound = false;
  let dmgFound = false;
  let appPath = '';
  let dmgPath = '';

  if (fs.existsSync(outDir)) {
    const scanDir = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory() && entry.name.endsWith('.app')) {
          appFound = true;
          appPath = fullPath;
        } else if (entry.isFile() && entry.name.endsWith('.dmg')) {
          dmgFound = true;
          dmgPath = fullPath;
        } else if (entry.isDirectory()) {
          scanDir(fullPath);
        }
      }
    };
    scanDir(outDir);
  }

  check('Packaged macOS Application (.app) exists', appFound, appPath ? `Found at ${appPath}` : 'Run `npm run package` or `npm run make:mac` first');
  check('Distributable macOS Disk Image (.dmg) exists', dmgFound, dmgPath ? `Found at ${dmgPath}` : 'Run `npm run make:mac` first');

  console.log('\n----------------------------------------');
  if (errors === 0) {
    console.log(' ALL VALIDATION CHECKS PASSED PERFECTLY!');
  } else {
    console.log(` VALIDATION FINISHED WITH ${errors} PENDING CHECKS.`);
  }
  console.log('----------------------------------------\n');
}

runValidation();
