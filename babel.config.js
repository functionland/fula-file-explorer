const path = require('path');

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
      },
    ],
  ],
};
