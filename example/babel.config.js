const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: [path.resolve(__dirname, '..')],
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          'react-native-proton-sdk': path.resolve(__dirname, '../lib'),
        },
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
