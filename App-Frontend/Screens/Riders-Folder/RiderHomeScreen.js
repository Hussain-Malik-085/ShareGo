import React, {useState, useEffect, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import {CommonActions} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {launchImageLibrary} from 'react-native-image-picker';
import {BASE_URL} from '../../config/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {logoutSession} from '../../utils/sessionRouting';
import DriverSelectionScreen from '../Drivers-Folder/Drivers-Selection/DriverSelectionScreen';
import axios from 'axios';
import {createStackNavigator} from '@react-navigation/stack';
import SettingsScreen from './Navigation Screens/SettingsScreen';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

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
  emeraldLight: '#ecfdf5',
  muted: '#64748b',
  fab: '#059669',
  text: '#0f172a',
  border: '#e2e8f0',
};

const MENU_ITEMS = [
  {key: 'RiderHome', label: 'Home', icon: 'home-outline', activeIcon: 'home'},
  {key: 'History', label: 'History', icon: 'history', activeIcon: 'history'},
  {key: 'Settings', label: 'Settings', icon: 'cog-outline', activeIcon: 'cog'},
  {
    key: 'DriverStack',
    label: 'Driver mode',
    icon: 'steering',
    activeIcon: 'steering',
  },
];

function getDrawerWidth(screenWidth) {
  const max = screenWidth >= 768 ? 360 : 320;
  return Math.min(screenWidth * 0.86, max);
}

function HistoryPlaceholderScreen() {
  return (
    <View style={styles.placeholder}>
      <View style={styles.placeholderIconWrap}>
        <Icon name="history" size={40} color={PALETTE.emerald} />
      </View>
      <Text style={styles.placeholderTitle}>Ride history</Text>
      <Text style={styles.placeholderSub}>
        Your completed rides will show here.
      </Text>
    </View>
  );
}

function navigateFromDrawer(navigation, routeName) {
  navigation.navigate(routeName);
  navigation.closeDrawer();
}

function DrawerBackButton({navigation}) {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('RiderHome')}
      style={styles.headerIconBtn}
      hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}
      accessibilityRole="button"
      accessibilityLabel="Back to home">
      <Icon name="arrow-left" size={24} color={PALETTE.emeraldDark} />
    </TouchableOpacity>
  );
}

function CustomDrawerContent(props) {
  const [profileImage, setProfileImage] = useState(null);
  const {riderName} = props;
  const insets = useSafeAreaInsets();
  const {width: screenWidth} = useWindowDimensions();
  const activeRoute = props.state.routeNames[props.state.index];

  const pickImage = () => {
    launchImageLibrary({mediaType: 'photo', quality: 1}, response => {
      if (response.didCancel) {
        return;
      }
      if (response.errorMessage) {
        Alert.alert('Error', response.errorMessage);
      } else if (response.assets?.length > 0) {
        setProfileImage(response.assets[0].uri);
      }
    });
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out of Share Go?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          props.navigation.closeDrawer();
          await logoutSession();
          const rootNav = props.navigation.getParent();
          rootNav?.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{name: 'Login'}],
            }),
          );
        },
      },
    ]);
  };

  return (
    <View style={[styles.drawerRoot, {paddingTop: insets.top}]}>
      <View style={styles.drawerTopBar}>
        <Text style={styles.drawerBrand}>Share Go</Text>
        <TouchableOpacity
          onPress={() => props.navigation.closeDrawer()}
          style={styles.drawerCloseBtn}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          accessibilityRole="button"
          accessibilityLabel="Close menu">
          <Icon name="close" size={22} color={PALETTE.text} />
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={[
          styles.drawerScroll,
          {paddingBottom: insets.bottom + 16, width: getDrawerWidth(screenWidth)},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.drawerHeader}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.85}>
            <Image
              source={
                profileImage
                  ? {uri: profileImage}
                  : require('../../assets/DefaultProfile.png')
              }
              style={styles.profileImage}
            />
            <View style={styles.cameraBadge}>
              <Icon name="camera" size={14} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.drawerLabel}>Signed in as</Text>
          <Text style={styles.username} numberOfLines={2}>
            {riderName?.trim() ? riderName : 'Rider'}
          </Text>
        </View>

        <Text style={styles.menuHeading}>Menu</Text>
        {MENU_ITEMS.map(item => {
          const active = activeRoute === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              activeOpacity={0.85}
              style={[styles.menuRow, active && styles.menuRowActive]}
              onPress={() => navigateFromDrawer(props.navigation, item.key)}>
              <View
                style={[
                  styles.menuIconWrap,
                  active && styles.menuIconWrapActive,
                ]}>
                <Icon
                  name={active ? item.activeIcon : item.icon}
                  size={22}
                  color={active ? '#fff' : PALETTE.emeraldDark}
                />
              </View>
              <Text style={[styles.menuLabel, active && styles.menuLabelActive]}>
                {item.label}
              </Text>
              <Icon
                name="chevron-right"
                size={20}
                color={active ? PALETTE.emeraldDark : '#cbd5e1'}
              />
            </TouchableOpacity>
          );
        })}
      </DrawerContentScrollView>

      <View style={[styles.drawerFooter, {paddingBottom: insets.bottom + 12}]}>
        <TouchableOpacity
          style={styles.backHomeBtn}
          activeOpacity={0.88}
          onPress={() => navigateFromDrawer(props.navigation, 'RiderHome')}>
          <Icon name="map-outline" size={20} color="#fff" />
          <Text style={styles.backHomeText}>Back to map</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.logoutBtn}
          activeOpacity={0.88}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out">
          <Icon name="logout" size={20} color="#dc2626" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function BottomTabNavigator() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 62 + Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: PALETTE.emerald,
        tabBarInactiveTintColor: '#94a3b8',
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabBarHeight,
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'android' ? 10 : 8),
          },
        ],
      }}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Map',
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'map' : 'map-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="ConfirmBooking"
        component={ConfirmBookingScreen}
        options={{
          tabBarLabel: 'Booking',
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'clipboard-text' : 'clipboard-text-outline'}
              size={22}
              color={color}
            />
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
                <Icon name="plus" size={30} color="#fff" />
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
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'magnify' : 'magnify'}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({focused, color}) => (
            <Icon
              name={focused ? 'message-text' : 'message-text-outline'}
              size={22}
              color={color}
            />
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
        options={({navigation}) => ({
          headerTitle: 'Driver setup',
          headerTintColor: PALETTE.emeraldDark,
          headerStyle: styles.stackHeader,
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => navigation.getParent()?.navigate('RiderHome')}
              style={styles.headerIconBtn}
              hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
              <Icon name="arrow-left" size={24} color={PALETTE.emeraldDark} />
            </TouchableOpacity>
          ),
        })}
      />
    </Stack.Navigator>
  );
}

function AppDrawer({riderName}) {
  const {width: screenWidth} = useWindowDimensions();
  const drawerWidth = getDrawerWidth(screenWidth);

  const drawerContent = useCallback(
    props => <CustomDrawerContent {...props} riderName={riderName} />,
    [riderName],
  );

  const screenHeader = (title, navigation) => ({
    title,
    headerLeft: () => <DrawerBackButton navigation={navigation} />,
    headerTintColor: PALETTE.emeraldDark,
    headerTitleStyle: styles.headerTitle,
    headerStyle: styles.stackHeader,
  });

  return (
    <Drawer.Navigator
      drawerContent={drawerContent}
      screenOptions={({navigation}) => ({
        drawerActiveTintColor: PALETTE.emerald,
        drawerInactiveTintColor: PALETTE.muted,
        headerShown: true,
        headerTintColor: PALETTE.emeraldDark,
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.stackHeader,
        drawerType: 'front',
        drawerStyle: {width: drawerWidth},
        overlayColor: 'rgba(15, 23, 42, 0.5)',
        swipeEnabled: true,
        swipeEdgeWidth: Math.min(screenWidth * 0.2, 56),
        sceneContainerStyle: {backgroundColor: '#f8fafc'},
      })}>
      <Drawer.Screen
        name="RiderHome"
        component={BottomTabNavigator}
        options={{
          title: riderName ? `Hi, ${riderName}` : 'Share Go',
          headerTitle: riderName ? `Hi, ${riderName}` : 'Share Go',
        }}
      />
      <Drawer.Screen
        name="History"
        component={HistoryPlaceholderScreen}
        options={({navigation}) => screenHeader('History', navigation)}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={({navigation}) => screenHeader('Settings', navigation)}
      />
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
        const first = response?.data?.firstName;
        const last = response?.data?.lastName;
        const name = [first, last].filter(Boolean).join(' ').trim();
        if (name && !cancelled) setRiderName(name);
      } catch (e) {
        console.warn('RiderHomeScreen: fetch rider', e?.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return <AppDrawer riderName={riderName} />;
}

const styles = StyleSheet.create({
  drawerRoot: {
    flex: 1,
    backgroundColor: '#fff',
  },
  drawerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.border,
  },
  drawerBrand: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.emeraldDark,
    letterSpacing: -0.3,
  },
  drawerCloseBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerScroll: {
    paddingTop: 12,
    paddingHorizontal: 14,
    flexGrow: 1,
  },
  drawerHeader: {
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  profileImage: {
    width: 92,
    height: 92,
    borderRadius: 46,
    borderWidth: 3,
    borderColor: '#d1fae5',
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PALETTE.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  drawerLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '600',
    color: PALETTE.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  username: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: PALETTE.text,
    paddingHorizontal: 8,
  },
  menuHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: PALETTE.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  menuRowActive: {
    backgroundColor: PALETTE.emeraldLight,
    borderColor: '#a7f3d0',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuIconWrapActive: {
    backgroundColor: PALETTE.emerald,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: PALETTE.text,
  },
  menuLabelActive: {
    color: PALETTE.emeraldDark,
  },
  drawerFooter: {
    paddingHorizontal: 16,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: PALETTE.border,
    backgroundColor: '#fff',
  },
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PALETTE.emerald,
    paddingVertical: 14,
    borderRadius: 14,
  },
  backHomeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 16,
    fontWeight: '700',
  },
  headerIconBtn: {
    marginLeft: Platform.OS === 'ios' ? 4 : 12,
    padding: 4,
  },
  headerTitle: {
    fontWeight: '700',
    fontSize: Platform.OS === 'android' ? 18 : 17,
  },
  stackHeader: {
    backgroundColor: '#fafafa',
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: PALETTE.border,
  },
  tabBar: {
    paddingTop: 8,
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
    marginBottom: 2,
  },
  plusButtonWrap: {
    top: Platform.OS === 'android' ? -14 : -18,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  plusButton: {
    backgroundColor: PALETTE.fab,
    width: 56,
    height: 56,
    borderRadius: 28,
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
  placeholderIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: PALETTE.emeraldLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: '700',
    color: PALETTE.text,
  },
  placeholderSub: {
    marginTop: 8,
    fontSize: 15,
    color: PALETTE.muted,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 22,
  },
});
