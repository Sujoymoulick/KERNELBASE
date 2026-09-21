const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'Kernel Base',
    executableName: 'Kernel Base',
    appBundleId: 'com.kernelbase.ide',
    appCategoryType: 'public.app-category.developer-tools',
    appVersion: '0.1.0',
    buildVersion: '0.1.0',
    icon: path.resolve(__dirname, 'build/icon'),
    extendInfo: {
      CFBundleDisplayName: 'Kernel Base',
      CFBundleName: 'Kernel Base',
      LSMinimumSystemVersion: '11.0.0',
      NSHumanReadableCopyright: 'Copyright © 2026 Kernel Base Team. All rights reserved.',
      NSHighResolutionCapable: true,
    },
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
    // Optional code signing when credentials are present
    ...(process.env.APPLE_IDENTITY
      ? {
          osxSign: {
            identity: process.env.APPLE_IDENTITY,
            'hardened-runtime': true,
            'gatekeeper-assess': false,
            entitlements: 'entitlements.plist',
            'entitlements-inherit': 'entitlements.plist',
          },
        }
      : {
          osxSign: false,
        }),
    ...(process.env.APPLE_ID && process.env.APPLE_APP_SPECIFIC_PASSWORD && process.env.APPLE_TEAM_ID
      ? {
          osxNotarize: {
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_APP_SPECIFIC_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
          },
        }
      : {}),
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-dmg',
      config: {
        name: 'Kernel-Base-IDE',
        icon: path.resolve(__dirname, 'build/icon.icns'),
        format: 'UDZO',
        overwrite: true,
        window: {
          width: 660,
          height: 420,
        },
      },
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-auto-unpack-natives',
      config: {},
    },
  ],
};
