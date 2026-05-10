import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL} from '../../../config/config';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

async function parseJsonResponse(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {message: raw.slice(0, 120)};
  }
}

export default function DriverPostRideScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [fare, setFare] = useState(null);
  const [commission, setCommission] = useState(null);
  const [driverId, setDriverId] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  useEffect(() => {
    const fetchDriverId = async () => {
      try {
        const id = await AsyncStorage.getItem('driverId');
        if (id) setDriverId(id);
      } catch (err) {
        console.error('Error retrieving driver ID:', err);
      }
    };
    fetchDriverId();
  }, []);

  const toggleVehicleType = type => setVehicleType(type);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = date => {
    if (date.getTime() < Date.now()) {
      Alert.alert('Invalid time', 'Pick a future date and time.');
      return;
    }
    setSelectedDateTime(date);
    hideDatePicker();
  };

  const uploadRideDetails = async (
    start,
    end,
    km,
    totalFare,
    commissionFare,
    dateTime,
  ) => {
    const payload = {
      driverId,
      vehicleType,
      startLocation: start,
      endLocation: end,
      distance: km,
      totalFare: parseFloat(totalFare),
      commissionFare: parseFloat(commissionFare),
      pickup: pickup.trim(),
      dropoff: destination.trim(),
      rideDateTime: dateTime.toISOString(),
      booked: false,
      riderId: null,
      riderName: null,
    };

    const res = await fetch(`${BASE_URL}/driverpost`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    const data = await parseJsonResponse(res);

    if (!res.ok) {
      Alert.alert('Post failed', data.message || data.error || `HTTP ${res.status}`);
      throw new Error(data.message || 'post failed');
    }

    Alert.alert('Success', data.message || 'Ride posted successfully!');
  };

  const handleCalculate = async () => {
    if (!pickup.trim() || !destination.trim() || !selectedDateTime) {
      Alert.alert('Missing fields', 'Pickup, destination, and date/time are required.');
      return;
    }
    if (!driverId) {
      Alert.alert('Driver profile', 'Driver ID missing. Complete driver onboarding first.');
      return;
    }
    if (selectedDateTime.getTime() < Date.now()) {
      Alert.alert('Invalid time', 'Selected time cannot be in the past.');
      return;
    }

    try {
      setLoading(true);
      setPickupCoords(null);
      setDestCoords(null);
      setDistance(null);
      setFare(null);
      setCommission(null);

      const res = await fetch(`${BASE_URL}/fare-estimate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          pickup: pickup.trim(),
          destination: destination.trim(),
          vehicleType,
        }),
      });
      const est = await parseJsonResponse(res);
      if (!res.ok) {
        Alert.alert('Fare estimate failed', est.message || `HTTP ${res.status}`);
        return;
      }

      setPickupCoords(est.pickupCoords);
      setDestCoords(est.destCoords);
      setDistance(String(est.distanceKm));
      setFare(String(est.totalFare));
      setCommission(String(est.sharegoCommission));

      await uploadRideDetails(
        est.pickupCoords,
        est.destCoords,
        est.distanceKm,
        est.totalFare,
        est.sharegoCommission,
        selectedDateTime,
      );
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Error',
        err.message ||
          `Cannot reach API. Check backend is running and API_BASE_URL (${BASE_URL}).`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Post a Ride</Text>
        <Text style={styles.hint}>Fare & distance are calculated on the server (no ORS key on phone).</Text>

        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            {['car', 'bike'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.toggleBtn, vehicleType === type && styles.selectedBtn]}
                onPress={() => toggleVehicleType(type)}>
                <Text style={[styles.toggleTxt, vehicleType === type && styles.selectedTxt]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Selected: {vehicleType.toUpperCase()}</Text>
          <TextInput
            style={styles.input}
            placeholder="Pickup Location"
            value={pickup}
            onChangeText={setPickup}
          />
          <TextInput
            style={styles.input}
            placeholder="Destination Location"
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity style={styles.dateButton} onPress={showDatePicker}>
            <Text style={styles.dateButtonText}>
              {selectedDateTime ? selectedDateTime.toLocaleString() : 'Select Date & Time'}
            </Text>
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="datetime"
            onConfirm={handleConfirm}
            onCancel={hideDatePicker}
            minimumDate={new Date()}
          />

          <TouchableOpacity style={styles.button} onPress={handleCalculate} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonTxt}>Calculate & Post</Text>
            )}
          </TouchableOpacity>

          {pickupCoords ? (
            <Text style={styles.coord}>
              Pickup: {pickupCoords.latitude.toFixed(5)}, {pickupCoords.longitude.toFixed(5)}
            </Text>
          ) : null}
          {destCoords ? (
            <Text style={styles.coord}>
              Drop: {destCoords.latitude.toFixed(5)}, {destCoords.longitude.toFixed(5)}
            </Text>
          ) : null}
          {distance ? <Text style={styles.result}>Distance: {distance} km</Text> : null}
          {fare ? <Text style={styles.result}>Fare: Rs. {fare}</Text> : null}
          {commission ? (
            <Text style={[styles.result, {fontSize: 15, color: '#64748b'}]}>
              ShareGo fee: Rs. {commission}
            </Text>
          ) : null}
          {selectedDateTime ? (
            <Text style={styles.result}>Scheduled: {selectedDateTime.toLocaleString()}</Text>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flexGrow: 1, padding: 20, paddingTop: 50, backgroundColor: '#f1f4f6'},
  hint: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  title: {fontSize: 24, fontWeight: 'bold', color: '#1e90ff', textAlign: 'center', marginBottom: 8},
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  toggleContainer: {flexDirection: 'row', justifyContent: 'center', marginBottom: 15},
  toggleBtn: {padding: 10, borderRadius: 10, backgroundColor: '#eee', marginHorizontal: 8},
  selectedBtn: {backgroundColor: '#1e90ff'},
  toggleTxt: {fontWeight: '600', color: '#333'},
  selectedTxt: {color: '#fff'},
  label: {textAlign: 'center', marginBottom: 10, color: '#555'},
  input: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 15,
  },
  dateButton: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    alignItems: 'center',
  },
  dateButtonText: {color: '#333', fontSize: 16},
  button: {
    backgroundColor: '#1e90ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonTxt: {color: '#fff', fontSize: 16, fontWeight: 'bold'},
  coord: {marginTop: 10, fontSize: 13, textAlign: 'center', color: '#444'},
  result: {marginTop: 12, fontSize: 18, fontWeight: 'bold', color: 'green', textAlign: 'center'},
});
