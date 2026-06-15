import React, {useEffect, useState} from 'react';
import 'react-native-url-polyfill/auto';
import {ActivityIndicator, SafeAreaView, StyleSheet, View} from 'react-native';
import StackNavigator from './Screens/Stack/StackNavigator';
import {
  requestNotificationPermission,
  scheduleNotification,
  scheduleRecurringNotifications,
} from './android/app/src/utils/notificationService';
import {resolveInitialRoute} from './utils/sessionRouting';
import {loadIconFonts} from './utils/loadIconFonts';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await loadIconFonts();

      const permissionGranted = await requestNotificationPermission();
      if (permissionGranted) {
        scheduleNotification();
        scheduleRecurringNotifications();
      }

      const route = await resolveInitialRoute();
      if (!cancelled) {
        setInitialRoute(route);
      }
    };

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!initialRoute) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#059669" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StackNavigator initialRoute={initialRoute} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
