import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import useNotifications from '../Navigation Screens/Notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config/config';

const SettingsScreen = ({navigation}) => {
  // const [isEnabled, setIsEnabled] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [riderId, setRiderId] = useState(null);
  const {isEnabled, toggleNotifications} = useNotifications();

  useEffect(() => {
    // Fetch rider ID from AsyncStorage
    const fetchRiderId = async () => {
      try {
        const storedRiderId = await AsyncStorage.getItem('riderId');
        if (storedRiderId) {
          setRiderId(storedRiderId);
        }
      } catch (error) {
        console.error('Error fetching rider ID:', error);
      }
    };
    fetchRiderId();
  }, []);

  const handleDeleteAccount = async () => {
    if (!riderId) {
      Alert.alert('Error', 'Rider ID not found. Please try again.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete your account? This action is irreversible.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            setLoading(true);
            try {
              const response = await fetch(
                `${BASE_URL}/riders/${riderId}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                },
              );

              const responseData = await response.json();

              if (response.ok) {
                await AsyncStorage.removeItem('riderId'); // Clear stored data
                setLoading(false);
                Alert.alert(
                  'Deleted',
                  'Your account has been deleted successfully.',
                );
                navigation.replace('Signup'); // Redirect to Signup screen
              } else {
                setLoading(false);
                Alert.alert(
                  'Error',
                  responseData.message ||
                    'Failed to delete account. Please try again.',
                );
              }
            } catch (error) {
              setLoading(false);
              Alert.alert(
                'Error',
                'Network error. Please check your connection.',
              );
              console.error('Delete Account Error:', error);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}>
        <TouchableOpacity style={styles.option} activeOpacity={0.7}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIconWrap}>
              <Icon name="bell-outline" size={20} color="#059669" />
            </View>
            <Text style={styles.optionText}>Notifications</Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={toggleNotifications}
            trackColor={{false: '#d1d5db', true: '#6ee7b7'}}
            thumbColor={isEnabled ? '#059669' : '#f4f4f5'}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() => setModalVisible(true)}>
          <View style={styles.optionLeft}>
            <View style={styles.optionIconWrap}>
              <Icon name="shield-lock-outline" size={20} color="#059669" />
            </View>
            <Text style={styles.optionText}>Privacy Policy</Text>
          </View>
          <Icon name="chevron-right" size={22} color="#cbd5e1" />
        </TouchableOpacity>

      <TouchableOpacity style={styles.option} onPress={handleDeleteAccount}>
        <View style={styles.optionLeft}>
          <View style={[styles.optionIconWrap, styles.dangerIconWrap]}>
            <Icon name="delete-outline" size={20} color="#dc2626" />
          </View>
          <Text style={[styles.optionText, styles.dangerText]}>Delete Account</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#fecaca" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.option, styles.logout]}
        onPress={async () => {
          setLoading(true);
          await AsyncStorage.multiRemove([
            'riderId',
            'riderProfileComplete',
            'userRole',
          ]);
          setTimeout(() => {
            setLoading(false);
            navigation.replace('Login');
          }, 800);
        }}>
        <View style={styles.optionLeft}>
          <View style={[styles.optionIconWrap, styles.dangerIconWrap]}>
            <Icon name="logout" size={20} color="#dc2626" />
          </View>
          <Text style={[styles.optionText, styles.dangerText]}>Log Out</Text>
        </View>
        <Icon name="chevron-right" size={22} color="#fecaca" />
      </TouchableOpacity>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Privacy Policy</Text>
            <Text style={styles.modalText}>
              Welcome to ShareGo! Your privacy is important to us. We ensure
              that your personal information is protected and not shared with
              third parties without your consent.
            </Text>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                navigation.navigate('PrivacyPolicy');
              }}>
              <Text style={styles.linkText}>Read Full Privacy Policy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading && (
        <Modal animationType="fade" transparent visible={loading}>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4caf50" />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 28,
    maxWidth: 560,
    width: '100%',
    alignSelf: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...Platform.select({
      ios: {
        shadowColor: '#0f172a',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {elevation: 2},
    }),
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  optionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  dangerIconWrap: {
    backgroundColor: '#fef2f2',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    flexShrink: 1,
  },
  dangerText: {
    color: '#dc2626',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  linkText: {
    color: 'blue',
    textDecorationLine: 'underline',
  },
  closeButton: {
    backgroundColor: '#ff4d4d',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingBox: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default SettingsScreen;
