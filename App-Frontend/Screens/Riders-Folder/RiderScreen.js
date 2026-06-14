import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BASE_URL } from '../../config/config';
import { supabase } from '../../config/supabaseClient';

const { width: SCREEN_W } = Dimensions.get('window');

const COLORS = {
  screenGradient: ['#ecfdf5', '#d1fae5', '#ccfbf1'],
  primary: '#059669',
  primaryDark: '#047857',
  mint: '#34d399',
  text: '#0f172a',
  muted: '#64748b',
  border: '#e2e8f0',
  inputBg: '#f8fafc',
  cardBg: '#ffffff',
  error: '#dc2626',
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  heroAvatar: {
    width: Math.min(100, SCREEN_W * 0.26),
    height: Math.min(100, SCREEN_W * 0.26),
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
    marginBottom: 14,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  heroImage: {
    width: '82%',
    height: '82%',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.4,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    maxWidth: 320,
    lineHeight: 22,
  },
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  fieldBlock: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    fontSize: 16,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
  },
  inputReadOnly: {
    backgroundColor: '#eefcf6',
    borderColor: 'rgba(5, 150, 105, 0.25)',
    color: COLORS.primaryDark,
    fontWeight: '600',
  },
  inputError: {
    borderColor: COLORS.error,
  },
  emailHint: {
    marginTop: 8,
    fontSize: 12,
    color: COLORS.muted,
    marginLeft: 4,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.inputBg,
  },
  dateGlyph: {
    fontSize: 20,
    marginRight: 12,
  },
  dateText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  datePlaceholder: {
    color: COLORS.muted,
    fontWeight: '400',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 13,
    marginTop: 8,
    marginLeft: 4,
  },
  saveOuter: {
    width: '100%',
    marginTop: 22,
    alignSelf: 'center',
    maxWidth: 440,
  },
  saveButtonSolid: {
    width: '100%',
    minHeight: 56,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    backgroundColor: '#047857',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#065f46',
    ...Platform.select({
      ios: {
        shadowColor: '#022c22',
        shadowOpacity: 0.35,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 6 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  saveButtonDisabled: {
    opacity: 0.72,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.6,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
});

/** Must stay outside RiderScreen — inner components remount every keystroke and drop keyboard focus. */
function RiderProfileField({ label, children, error }) {
  return (
    <View style={styles.fieldBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const RiderScreen = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhone] = useState('');
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const applyDob = (selectedDate) => {
    setDob(selectedDate);
    setErrors((e) => {
      const next = { ...e };
      delete next.dob;
      return next;
    });
  };

  const openDobPicker = () => {
    const initialDate = dob || new Date(2000, 0, 1);

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initialDate,
        mode: 'date',
        maximumDate: new Date(),
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            applyDob(selectedDate);
          }
        },
      });
      return;
    }

    setShowDatePicker(true);
  };

  const loadSessionEmail = useCallback(async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const addr = session?.user?.email?.trim();
      if (addr) setEmail(addr);
    } catch (e) {
      console.warn('RiderScreen: session email', e?.message);
    }
  }, []);

  useEffect(() => {
    loadSessionEmail();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const addr = session?.user?.email?.trim();
      if (addr) setEmail((prev) => (prev === addr ? prev : addr));
    });
    return () => subscription.unsubscribe();
  }, [loadSessionEmail]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const complete = await AsyncStorage.getItem('riderProfileComplete');
        const id = await AsyncStorage.getItem('riderId');
        if (!cancelled && complete === 'true' && id) {
          navigation.replace('Rider_HomeScreen');
        }
      } catch (_) {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  const handleSave = async () => {
    const validationErrors = {};

    if (!firstName) validationErrors.firstName = 'First name is required';
    if (!lastName) validationErrors.lastName = 'Last name is required';
    if (!email) validationErrors.email = 'Email is required';
    if (!phoneNumber) validationErrors.phone = 'Phone number is required';
    if (!dob) validationErrors.dob = 'Date of birth is required';
    if (email && !email.includes('@')) validationErrors.email = 'Enter a valid email';
    if (phoneNumber && phoneNumber.length !== 11) validationErrors.phone = 'Phone number must be 11 digits';

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const userData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      dob: dob.toISOString(),
    };

    try {
      setLoading(true);

      const response = await fetch(`${BASE_URL}/riders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const raw = await response.text();
      let result = {};
      try {
        result = raw ? JSON.parse(raw) : {};
      } catch {
        Alert.alert(
          'Server error',
          raw?.slice(0, 200) || 'Invalid JSON from API — is App-Backend running?',
        );
        return;
      }

      const riderIdNew = result._id || result.id;
      if (response.ok && riderIdNew) {
        await AsyncStorage.multiSet([
          ['riderId', String(riderIdNew)],
          ['riderProfileComplete', 'true'],
          ['userRole', 'Rider'],
        ]);

        Alert.alert('Success', 'Your profile has been saved.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.reset({
                index: 0,
                routes: [{ name: 'Rider_HomeScreen' }],
              });
            },
          },
        ]);
        setFirstName('');
        setLastName('');
        setPhone('');
        setDob(null);
        setErrors({});
        await loadSessionEmail();
      } else {
        const msg =
          result.message ||
          (typeof result === 'string' ? result : null) ||
          `Save failed (${response.status}). Turn on App-Backend & MongoDB.`;
        Alert.alert('Could not save', msg);
      }
    } catch (error) {
      console.error(error);
      Alert.alert(
        'Network error',
        `Cannot reach API at ${BASE_URL}. Start App-Backend (port 4000) and check .env API_BASE_URL.`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={COLORS.screenGradient} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="none"
            contentContainerStyle={styles.scrollContent}>
            <View style={styles.hero}>
              <View style={styles.heroAvatar}>
                <Image source={require('../../assets/rider.png')} style={styles.heroImage} resizeMode="contain" />
              </View>
              <Text style={styles.title}>Rider profile</Text>
              <Text style={styles.subtitle}>Tell us a bit about yourself to get started</Text>
            </View>

            <View style={styles.card}>
              <RiderProfileField label="First name" error={errors.firstName}>
                <TextInput
                  style={[styles.input, errors.firstName && styles.inputError]}
                  placeholder="e.g. Jhon"
                  placeholderTextColor={COLORS.muted}
                  value={firstName}
                  onChangeText={(t) => {
                    setFirstName(t);
                    setErrors((e) => {
                      const next = { ...e };
                      delete next.firstName;
                      return next;
                    });
                  }}
                  autoCapitalize="words"
                />
              </RiderProfileField>

              <RiderProfileField label="Last name" error={errors.lastName}>
                <TextInput
                  style={[styles.input, errors.lastName && styles.inputError]}
                  placeholder="e.g. Doe"
                  placeholderTextColor={COLORS.muted}
                  value={lastName}
                  onChangeText={(t) => {
                    setLastName(t);
                    setErrors((e) => {
                      const next = { ...e };
                      delete next.lastName;
                      return next;
                    });
                  }}
                  autoCapitalize="words"
                />
              </RiderProfileField>

              <RiderProfileField label="Email" error={errors.email}>
                <TextInput
                  style={[styles.input, styles.inputReadOnly, errors.email && styles.inputError]}
                  value={email}
                  editable={false}
                  placeholder="Signed-in email"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Text style={styles.emailHint}>From your Share Go account</Text>
              </RiderProfileField>

              <RiderProfileField label="Phone number" error={errors.phone}>
                <TextInput
                  style={[styles.input, errors.phone && styles.inputError]}
                  value={phoneNumber}
                  onChangeText={(t) => {
                    setPhone(t);
                    setErrors((e) => {
                      const next = { ...e };
                      delete next.phone;
                      return next;
                    });
                  }}
                  placeholder="03XXXXXXXXX"
                  placeholderTextColor={COLORS.muted}
                  keyboardType="phone-pad"
                  maxLength={11}
                />
              </RiderProfileField>

              <RiderProfileField label="Date of birth" error={errors.dob}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.dateRow, errors.dob && styles.inputError]}
                  onPress={openDobPicker}>
                  <Text style={styles.dateGlyph}>📅</Text>
                  <Text style={[styles.dateText, !dob && styles.datePlaceholder]}>
                    {dob ? dob.toLocaleDateString() : 'Tap to choose'}
                  </Text>
                </TouchableOpacity>
              </RiderProfileField>

              {Platform.OS === 'ios' && showDatePicker ? (
                <DateTimePicker
                  value={dob || new Date(2000, 0, 1)}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      applyDob(selectedDate);
                    }
                  }}
                  maximumDate={new Date()}
                />
              ) : null}
            </View>

            <View style={styles.saveOuter}>
              <TouchableOpacity
                activeOpacity={0.88}
                disabled={loading}
                onPress={handleSave}
                style={[styles.saveButtonSolid, loading && styles.saveButtonDisabled]}>
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.saveText}>Save profile</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

export default RiderScreen;
