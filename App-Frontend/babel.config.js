const path = require('path');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module:react-native-dotenv',
      {
        moduleName: '@env',
        // Always App-Frontend/.env — relative ".env" breaks if Metro starts from another cwd
        path: path.resolve(__dirname, '.env'),
        allowUndefined: true,
        safe: false,
      },
    ],
    'react-native-reanimated/plugin',
  ],
};
