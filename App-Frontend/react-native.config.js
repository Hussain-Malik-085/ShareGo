const path = require('path');

/**
 * @react-native-community/datetimepicker is not auto-detected on Android with RN 0.76
 * (CLI reports platforms.android: null). Wire it explicitly so RNCDatePicker is in the APK.
 */
module.exports = {
  dependencies: {
    '@react-native-community/datetimepicker': {
      platforms: {
        android: {
          sourceDir: path.join(
            __dirname,
            'node_modules/@react-native-community/datetimepicker/android',
          ),
          packageImportPath:
            'import com.reactcommunity.rndatetimepicker.RNDateTimePickerPackage;',
          packageInstance: 'new RNDateTimePickerPackage()',
        },
      },
    },
  },
};
