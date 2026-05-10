import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {launchImageLibrary} from 'react-native-image-picker';
import {BASE_URL} from '../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DriverSelectionScreen from '../Drivers-Folder/Drivers-Selection/DriverSelectionScreen';
import axios from 'axios';
import {createStackNavigator} from '@react-navigation/stack';
import SettingsScreen from './Navigation Screens/SettingsScreen';

import HomeScreen from './Navigation Screens/HomeScreenLoader';
import ConfirmBookingScreen from './Navigation Screens/ConfirmBookingScreen';
import PostRideScreen from './Navigation Screens/PostRideScreen';
import SearchRideScreen from './Navigation Screens/SearchRideScreen';
import ChatScreen from './Navigation Screens/ChatScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

const PALETTE = {
  emerald: '#059669',
  emeraldDark: '#047857',
  muted: '#64748b',
  fab: '#059669',
};

function HistoryPlaceholderScreen() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderEmoji} accessibilityLabel="">
        📜
      </Text>
      <Text style={styles.placeholderTitle}>Ride history</Text>
      <Text style={styles.placeholderSub}>Your completed rides will show here.</Text>
    </View>
  );
}

function CustomDrawerContent(props) {
  const [profileImage, setProfileImage] = useState(null);
  const {riderName, setRiderName} = props;

  const pickImage = () => {
    const options = {mediaType: 'photo', quality: 1};
    launchImageLibrary(options, response => {
      if (response.didCancel) {
        Alert.alert('Cancelled', 'Image selection was cancelled.');
      } else if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets && response.assets.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
      <View style={styles.drawerHeader}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              profileImage
                ? {uri: profileImage}
                : require('../../assets/DefaultProfile.png')
            }
            style={styles.profileImage}
          />
        </TouchableOpacity>
        {/* Display name — synced from profile */}
        <Text style={styles.drawerLabel}>Name</Text>
        <TextInput
          style={styles.username}
          value={riderName}
          onChangeText={setRiderName}
          placeholder="Your name"
          placeholderTextColor="#94a3b8"
        />
      </View>

      <DrawerItem
        label="History"
        labelStyle={styles.drawerItemLabel}
        icon={() => (
          <Text style={styles.drawerGlyph} accessibilityLabel="">
            📜
          </Text>
        )}
        onPress={() => props.navigation.navigate('History')}
      />
      <DrawerItem
        label="Settings"
        labelStyle={styles.drawerItemLabel}
        icon={() => (
          <Text style={styles.drawerGlyph} accessibilityLabel="">
            ⚙️
          </Text>
        )}
        onPress={() => props.navigation.navigate('Settings')}
      />
      <DrawerItem
        label="Driver mode"
        labelStyle={styles.drawerItemLabel}
        icon={() => (
          <Text style={styles.drawerGlyph} accessibilityLabel="">
            🚗
          </Text>
        )}
        onPress={() => props.navigation.navigate('DriverStack')}
      />
    </DrawerContentScrollView>
  );
}

function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.emerald,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({focused}) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]} accessibilityLabel="">
              🗺️
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="ConfirmBooking"
        component={ConfirmBookingScreen}
        options={{
          tabBarLabel: 'Booking',
          tabBarIcon: ({focused}) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]} accessibilityLabel="">
              📋
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="PostRide"
        component={PostRideScreen}
        options={({navigation}) => ({
          tabBarLabel: '',
          tabBarIcon: () => null,
          tabBarButton: () => (
            <TouchableOpacity
              style={styles.plusButtonWrap}
              activeOpacity={0.88}
              onPress={() => navigation.navigate('PostRide')}
              accessibilityRole="button"
              accessibilityLabel="Post a ride">
              <View style={styles.plusButton}>
                <Text style={styles.plusMark}>＋</Text>
              </View>
            </TouchableOpacity>
          ),
        })}
      />
      <Tab.Screen
        name="SearchRide"
        component={SearchRideScreen}
        options={{
          tabBarLabel: 'Search',
          tabBarIcon: ({focused}) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]} accessibilityLabel="">
              🔍
            </Text>
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({focused}) => (
            <Text style={[styles.tabEmoji, focused && styles.tabEmojiFocused]} accessibilityLabel="">
              💬
            </Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function DriverStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Driver"
        component={DriverSelectionScreen}
        options={{headerTitle: 'Driver setup', headerTintColor: PALETTE.emeraldDark}}
      />
    </Stack.Navigator>
  );
}

function AppDrawer({riderName, setRiderName}) {
  const drawerContent = useCallback(
    props => (
      <CustomDrawerContent
        {...props}
        riderName={riderName}
        setRiderName={setRiderName}
      />
    ),
    [riderName, setRiderName],
  );

  return (
    <Drawer.Navigator
      drawerContent={drawerContent}
      screenOptions={{
        drawerActiveTintColor: PALETTE.emerald,
        drawerInactiveTintColor: PALETTE.muted,
        headerShown: true,
        headerTintColor: PALETTE.emeraldDark,
        headerTitleStyle: {fontWeight: '700'},
        headerStyle: {
          backgroundColor: '#fafafa',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: StyleSheet.hairlineWidth,
          borderBottomColor: '#e2e8f0',
        },
      }}>
      <Drawer.Screen
        name="RiderHome"
        component={BottomTabNavigator}
        options={{
          title: riderName ? `Welcome, ${riderName}` : 'Share Go',
          headerTitle: riderName ? `Welcome, ${riderName}` : 'Share Go',
        }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryPlaceholderScreen}
        options={{title: 'History'}}
      />
      <Drawer.Screen name="Settings" component={SettingsScreen} />
      <Drawer.Screen
        name="DriverStack"
        component={DriverStackNavigator}
        options={{title: 'Driver', headerShown: false}}
      />
    </Drawer.Navigator>
  );
}

/** Main rider shell after login — drawer + tabs */
export default function RiderHomeScreen() {
  const [riderName, setRiderName] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const id = await AsyncStorage.getItem('riderId');
        if (!id || cancelled) return;
        const response = await axios.get(`${BASE_URL}/riders/${id}`);
        const name = response?.data?.firstName;
        if (name && !cancelled) setRiderName(String(name));
      } catch (e) {
        console.warn('RiderHomeScreen: fetch rider', e?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <AppDrawer riderName={riderName} setRiderName={setRiderName} />;
}

const styles = StyleSheet.create({
  drawerScroll: {paddingTop: 8},
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  drawerLabel: {
    alignSelf: 'flex-start',
    width: '100%',
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.muted,
    marginBottom: 6,
    marginLeft: 4,
  },
  username: {
    width: '100%',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'left',
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
  },
  drawerItemLabel: {
    fontWeight: '600',
    fontSize: 15,
    marginLeft: -8,
  },
  tabBar: {
    height: 62,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderTopWidth: 0,
    elevation: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: -4},
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  tabEmoji: {
    fontSize: 22,
    opacity: 0.55,
    marginBottom: 2,
  },
  tabEmojiFocused: {
    fontSize: 24,
    opacity: 1,
  },
  plusMark: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 38,
    marginTop: -2,
  },
  drawerGlyph: {
    fontSize: 22,
    marginRight: 4,
  },
  placeholderEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  plusButtonWrap: {
    top: -18,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  plusButton: {
    backgroundColor: PALETTE.fab,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PALETTE.emeraldDark,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 8,
    borderWidth: 3,
    borderColor: '#ecfdf5',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
  },
  placeholderTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  placeholderSub: {
    marginTop: 8,
    fontSize: 15,
    color: PALETTE.muted,
    textAlign: 'center',
  },
});
