import React, {useEffect, useState} from 'react';
import {ActivityIndicator, View, StyleSheet, Text} from 'react-native';

/**
 * Loads the map screen lazily so Metro reload does not require RNMapsAirModule
 * before AppRegistry.registerComponent runs (see StackNavigator / RiderHomeScreen).
 */
export default function HomeScreenLoader(props) {
  const [Screen, setScreen] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    import('./HomeScreen')
      .then((m) => {
        if (!cancelled) setScreen(() => m.default);
      })
      .catch((e) => {
        if (!cancelled) setLoadError(e?.message || String(e));
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) {
    return (
      <View style={styles.center}>
        <Text style={styles.err}>Map failed to load</Text>
        <Text style={styles.hint}>
          Rebuild the native app after installing react-native-maps:{'\n'}
          Android: cd android && ./gradlew clean && cd .. && npx react-native run-android
        </Text>
      </View>
    );
  }
  if (!Screen) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return <Screen {...props} />;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  err: {fontSize: 16, fontWeight: '600', marginBottom: 8},
  hint: {textAlign: 'center', color: '#64748b', fontSize: 13},
});
