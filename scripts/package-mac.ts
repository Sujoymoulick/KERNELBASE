import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const rootDir = process.cwd();
const outDir = path.join(rootDir, 'out');
// Intermediate files are staged outside out/ and removed at the end, so out/ only holds installers
const stageDir = path.join(rootDir, 'build', 'stage');
const packageDir = path.join(stageDir, 'Kernel Base-darwin-arm64');
const appName = 'Kernel Base.app';
const appPath = path.join(packageDir, appName);

console.log('🚀 ========================================');
console.log('🚀   PACKAGING KERNEL BASE IDE FOR macOS   ');
console.log('🚀 ========================================\n');

// 1. Ensure Electron Main and Renderer are built
console.log('⚡ 1. Building Electron Main & Renderer bundles...');
execSync('npm run build', { stdio: 'inherit', cwd: rootDir });

// 2. Prepare staging + output directories (other platforms' installers in out/ are kept)
fs.rmSync(packageDir, { recursive: true, force: true });
fs.mkdirSync(packageDir, { recursive: true });
fs.mkdirSync(outDir, { recursive: true });
for (const stale of ['Kernel Base-darwin-arm64', 'Kernel-Base-IDE-mac-arm64.zip']) {
  fs.rmSync(path.join(outDir, stale), { recursive: true, force: true });
}

// 3. Find base Electron.app
const electronDistApp = [
  path.join(rootDir, 'node_modules/electron/dist/Electron.app'),
  path.join(rootDir, 'node_modules/.pnpm/electron@34.5.8/node_modules/electron/dist/Electron.app'),
].find((p) => fs.existsSync(p)) || '';

if (!fs.existsSync(electronDistApp)) {
  throw new Error(`Base Electron.app not found at: ${electronDistApp}`);
}

console.log('📦 2. Copying Electron runtime template...');
execSync(`cp -R "${electronDistApp}" "${appPath}"`);

// 4. Update executable name
const contentsDir = path.join(appPath, 'Contents');
const macOsDir = path.join(contentsDir, 'MacOS');
const oldExec = path.join(macOsDir, 'Electron');
const newExec = path.join(macOsDir, 'Kernel Base');

if (fs.existsSync(oldExec)) {
  fs.renameSync(oldExec, newExec);
}

// 5. Update Info.plist with PlistBuddy to guarantee 100% valid XML structure
const plistPath = path.join(contentsDir, 'Info.plist');
if (fs.existsSync(plistPath)) {
  try {
    execSync(`/usr/libexec/PlistBuddy -c "Delete :ElectronAsarIntegrity" "${plistPath}"`, { stdio: 'ignore' });
  } catch (e) {
    // ignore if not present
  }
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleExecutable Kernel Base" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleDisplayName Kernel Base" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleName Kernel Base" "${plistPath}"`);
  execSync(`/usr/libexec/PlistBuddy -c "Set :CFBundleIdentifier com.kernelbase.ide" "${plistPath}"`);
  // Kernel voice: macOS asks for these when the voice session starts
  for (const [key, text] of [
    ['NSMicrophoneUsageDescription', 'Kernel listens when you turn on voice so you can talk to your coding agent.'],
    ['NSSpeechRecognitionUsageDescription', 'Kernel turns your speech into text on this Mac so the agent can act on it.'],
    // Clear one-time prompts when you open projects in protected folders (asked once per folder type)
    ['NSDocumentsFolderUsageDescription', 'Kernel Base opens and edits the projects you choose in your Documents folder.'],
    ['NSDesktopFolderUsageDescription', 'Kernel Base opens and edits the projects you choose on your Desktop.'],
    ['NSDownloadsFolderUsageDescription', 'Kernel Base opens and edits the projects you choose in your Downloads folder.'],
    ['NSRemovableVolumesUsageDescription', 'Kernel Base opens and edits projects stored on external drives.'],
    ['NSNetworkVolumesUsageDescription', 'Kernel Base opens and edits projects stored on network drives.'],
  ]) {
    try {
      execSync(`/usr/libexec/PlistBuddy -c "Delete :${key}" "${plistPath}"`, { stdio: 'ignore' });
    } catch {}
    execSync(`/usr/libexec/PlistBuddy -c "Add :${key} string ${text}" "${plistPath}"`);
  }
  execSync(`plutil -lint "${plistPath}"`, { stdio: 'inherit' });
}

// 6. Copy App Icon
const iconSrc = path.join(rootDir, 'build/icon.icns');
if (fs.existsSync(iconSrc)) {
  const resourcesDir = path.join(contentsDir, 'Resources');
  fs.copyFileSync(iconSrc, path.join(resourcesDir, 'electron.icns'));
}

// 7. Bundle App resources into Contents/Resources/app
console.log('📁 3. Bundling application assets into App Bundle...');
const appResourcesDir = path.join(contentsDir, 'Resources', 'app');
fs.mkdirSync(appResourcesDir, { recursive: true });

// Copy package.json
fs.copyFileSync(path.join(rootDir, 'package.json'), path.join(appResourcesDir, 'package.json'));

// Copy dist-electron
const distElectronDest = path.join(appResourcesDir, 'dist-electron');
fs.mkdirSync(distElectronDest, { recursive: true });
fs.cpSync(path.join(rootDir, 'dist-electron'), distElectronDest, { recursive: true });

// Copy dist (renderer)
const distDest = path.join(appResourcesDir, 'dist');
fs.mkdirSync(distDest, { recursive: true });
fs.cpSync(path.join(rootDir, 'dist'), distDest, { recursive: true });

// Runtime native/ESM modules that esbuild leaves external:
//  - node-pty: real terminal (prebuilt for Electron via electron-rebuild)
//  - unpdf: PDF text extraction for the Resources rack (loaded with dynamic import)
const runtimeModules: Record<string, string[]> = {
  'node-pty': ['package.json', 'lib', 'build/Release/pty.node', 'build/Release/spawn-helper'],
  unpdf: ['package.json', 'dist'],
};
for (const [mod, parts] of Object.entries(runtimeModules)) {
  const src = fs.realpathSync(path.join(rootDir, 'node_modules', mod));
  const dest = path.join(appResourcesDir, 'node_modules', mod);
  for (const part of parts) {
    const from = path.join(src, part);
    if (!fs.existsSync(from)) throw new Error(`Missing runtime file ${mod}/${part}. Run: ./node_modules/.bin/electron-rebuild -f -w node-pty`);
    fs.mkdirSync(path.dirname(path.join(dest, part)), { recursive: true });
    fs.cpSync(from, path.join(dest, part), { recursive: true, dereference: true });
  }
  console.log(`   bundled runtime module ${mod}`);
}
fs.chmodSync(path.join(appResourcesDir, 'node_modules/node-pty/build/Release/spawn-helper'), 0o755);

// On-device speech helper for the Kernel voice agent (Swift, Apple Speech framework)
const listenSrc = path.join(rootDir, 'native', 'kb-listen.swift');
const listenBin = path.join(stageDir, 'kb-listen');
fs.mkdirSync(path.dirname(listenBin), { recursive: true });
execSync(
  `swiftc -O "${listenSrc}" -o "${listenBin}" -Xlinker -sectcreate -Xlinker __TEXT -Xlinker __info_plist -Xlinker "${path.join(rootDir, 'native', 'kb-listen-Info.plist')}"`,
  { stdio: ['ignore', 'ignore', 'inherit'] }
);
fs.copyFileSync(listenBin, path.join(contentsDir, 'Resources', 'kb-listen'));
fs.chmodSync(path.join(contentsDir, 'Resources', 'kb-listen'), 0o755);
console.log('   bundled kb-listen voice helper');

// Strip crossorigin from index.html to allow clean file:// ES module execution
const bundledIndex = path.join(distDest, 'index.html');
if (fs.existsSync(bundledIndex)) {
  let html = fs.readFileSync(bundledIndex, 'utf-8');
  html = html.replace(/\s+crossorigin(?:="[^"]*")?/g, '');
  fs.writeFileSync(bundledIndex, html, 'utf-8');
}

console.log(`✅ Packaged macOS App: ${appPath}`);

// 8. Sign bundle with ad-hoc signature and clean attributes
console.log('✍️ 4. Signing app bundle (ad-hoc codesign for Apple Silicon)...');
try {
  execSync(`xattr -cr "${appPath}"`, { stdio: 'inherit' });
  execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: 'inherit' });
  execSync(`codesign --verify --deep --strict "${appPath}"`, { stdio: 'inherit' });
  console.log('✅ App bundle signed and verified successfully');
} catch (e: any) {
  console.warn('⚠️ Codesigning notice:', e.message);
}

// 9. Create Applications symlink for drag-and-drop installer
const appSymlink = path.join(packageDir, 'Applications');
if (!fs.existsSync(appSymlink)) {
  try {
    fs.symlinkSync('/Applications', appSymlink);
  } catch (e) {
    // ignore
  }
}

// 11. Generate macOS DMG using native hdiutil
console.log('\n💿 6. Creating macOS Disk Image (.dmg)...');
const dmgPath = path.join(outDir, 'Kernel-Base-IDE-arm64.dmg');
try {
  execSync(
    `hdiutil create -volname "Kernel Base IDE" -srcfolder "${packageDir}" -ov -format UDZO "${dmgPath}"`,
    { stdio: 'inherit' }
  );
  execSync(`xattr -cr "${dmgPath}"`, { stdio: 'inherit' });
  console.log(`✅ Created Disk Image: ${dmgPath}`);
} catch (err: any) {
  console.warn('⚠️ Could not generate DMG automatically, .app bundle is ready:', err.message);
}

// 12. Remove staged intermediates unless asked to keep them (KEEP_STAGE=1)
if (!process.env.KEEP_STAGE && fs.existsSync(dmgPath)) {
  fs.rmSync(packageDir, { recursive: true, force: true });
  fs.rmSync(listenBin, { force: true });
  console.log('🧹 Removed staged build files');
}

console.log('\n========================================');
console.log('🎉 macOS DESKTOP PACKAGING COMPLETED!');
console.log('========================================\n');
