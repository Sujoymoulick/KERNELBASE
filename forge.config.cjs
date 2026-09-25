const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'kernel-base',
    executableName: 'kernel-base',
    appBundleId: 'com.kernelbase.ide',
    appCategoryType: 'public.app-category.developer-tools',
    appVersion: '0.1.0',
    buildVersion: '0.1.0',
    asar: true,
    icon: path.resolve(__dirname, 'public/logo'),
    prune: true,
    ignore: [
      /^\/src/,
      /^\/scripts/,
      /^\/docs/,
      /^\/\.git/,
      /^\/\.kilo/,
      /^\/tsconfig.*\.json$/,
      /^\/vite\.config\.ts$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-zip',
      platforms: ['linux'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          maintainer: 'Kernel Base Team <support@kernelbase.dev>',
          homepage: 'https://github.com/Sujoymoulick/KERNELBASE',
          description: 'Kernel Base AI-Native Multi-Agent IDE for Linux',
          section: 'devel',
          priority: 'optional',
          categories: ['Development', 'IDE'],
        },
      },
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          homepage: 'https://github.com/Sujoymoulick/KERNELBASE',
          description: 'Kernel Base AI-Native Multi-Agent IDE for Linux',
          categories: ['Development/Tools'],
        },
      },
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};

