const path = require('path');
const { getDefaultConfig } = require('@react-native/metro-config');
const escape = require('escape-string-regexp');

const root = path.resolve(__dirname, '..');
const pak = require('../package.json');

const modules = Object.keys({
  ...pak.peerDependencies,
});

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */
module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts },
  } = await getDefaultConfig();

  return {
    watchFolders: [root],
    transformer: {
      babelTransformerPath: require.resolve('react-native-reanimated/plugin'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: true,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter((ext) => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: modules.reduce((acc, name) => {
        acc[name] = path.join(__dirname, 'node_modules', name);
        return acc;
      }, {}),
      nodeModulesPaths: [
        path.resolve(__dirname, 'node_modules'),
        path.resolve(root, 'node_modules'),
      ],
    },
  };
})();
