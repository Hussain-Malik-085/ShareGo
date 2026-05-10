import React, {useState} from 'react';
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
} from 'react-native';
import {BASE_URL} from './config/config';

async function parseJson(res) {
  const raw = await res.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {message: raw.slice(0, 120)};
  }
}

/** Dev screen — uses backend `/fare-estimate` only (no ORS/OpenCage keys on device). */
export default function Testing() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [estimate, setEstimate] = useState(null);

  const handleCalculate = async () => {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert('Missing fields', 'Enter pickup and destination.');
      return;
    }

    try {
      setLoading(true);
      setEstimate(null);
      const res = await fetch(`${BASE_URL}/fare-estimate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          pickup: pickup.trim(),
          destination: destination.trim(),
          vehicleType,
        }),
      });
      const data = await parseJson(res);
      if (!res.ok) {
        Alert.alert('Error', data.message || `HTTP ${res.status}`);
        return;
      }
      setEstimate(data);
    } catch (e) {
      Alert.alert('Error', e.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{flex: 1}} behavior="padding">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>ShareGo — Fare test</Text>
        <Text style={styles.note}>Uses your API: POST /fare-estimate</Text>

        <View style={styles.card}>
          <View style={styles.toggleContainer}>
            {['car', 'bike'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.toggleButton, vehicleType === type && styles.selectedButton]}
                onPress={() => setVehicleType(type)}>
                <Text style={[styles.toggleText, vehicleType === type && styles.selectedText]}>
                  {type.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.vehicleLabel}>
            Selected: <Text style={{fontWeight: 'bold'}}>{vehicleType.toUpperCase()}</Text>
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Pickup"
            value={pickup}
            onChangeText={setPickup}
          />
          <TextInput
            style={styles.input}
            placeholder="Destination"
            value={destination}
            onChangeText={setDestination}
          />

          <TouchableOpacity style={styles.calcButton} onPress={handleCalculate}>
            <Text style={styles.calcButtonText}>Calculate (via backend)</Text>
          </TouchableOpacity>

          {loading ? (
            <ActivityIndicator size="large" color="#1e90ff" style={{marginTop: 20}} />
          ) : null}

          {estimate ? (
            <View style={{marginTop: 16}}>
              <Text style={styles.result}>Distance: {estimate.distanceKm} km</Text>
              <Text style={styles.result}>Fare: Rs. {estimate.totalFare}</Text>
              <Text style={styles.coordText}>
                Method: {estimate.distanceMethod || '—'}
              </Text>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f1f4f6',
    padding: 20,
    paddingTop: 50,
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  note: {
    textAlign: 'center',
    color: '#64748b',
    marginBottom: 12,
    fontSize: 13,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e90ff',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  input: {
    backgroundColor: '#f9f9f9',
    padding: 14,
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
  },
  calcButton: {
    backgroundColor: '#1e90ff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  calcButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  result: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: 'green',
    textAlign: 'center',
  },
  coordText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    color: '#444',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },
  toggleButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 8,
  },
  selectedButton: {
    backgroundColor: '#1e90ff',
  },
  toggleText: {
    color: '#333',
    fontWeight: '600',
  },
  selectedText: {
    color: '#fff',
  },
  vehicleLabel: {
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
    color: '#555',
  },
});
