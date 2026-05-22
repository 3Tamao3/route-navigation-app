const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Required for pnpm's isolated linker (virtual-store-dir=C:/ps)
// Metro needs to follow symlinks to resolve transitive dependencies
config.resolver.unstable_enableSymlinks = true;

// Watch the pnpm virtual store so Metro can find all packages
config.watchFolders = [
  ...(config.watchFolders || []),
  path.resolve('C:/ps'),
];

module.exports = config;
