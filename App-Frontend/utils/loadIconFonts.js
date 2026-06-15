import {NativeModules, Platform} from 'react-native';

const IOS_FONTS = [
  ['MaterialCommunityIcons', 'ttf'],
  ['FontAwesome', 'ttf'],
  ['Feather', 'ttf'],
];

/** Register vector-icon TTFs before any icon renders (iOS pod bundle + Android assets). */
export async function loadIconFonts() {
  if (Platform.OS !== 'ios') {
    return;
  }

  const mod = NativeModules.RNVectorIcons;
  if (!mod?.loadFontWithFileName) {
    return;
  }

  await Promise.all(
    IOS_FONTS.map(([name, ext]) =>
      mod.loadFontWithFileName(name, ext).catch(() => null),
    ),
  );
}
