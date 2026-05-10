import React, {useState, useEffect, useCallback} from 'react';
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
  StatusBar,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import {BASE_URL} from '../../../config/config';

const COLORS = {
  gradient: ['#ecfdf5', '#d1fae5', '#a7f3d0'],
  primary: '#059669',
  primaryMid: '#10b981',
  primaryDark: '#047857',
  text: '#0f172a',
  muted: '#64748b',
  card: '#ffffff',
  border: '#e2e8f0',
  inputBg: '#f8fafc',
  rowTint: '#f1f5f9',
};

async function parseJsonResponse(response) {
  const raw = await response.text();
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {message: raw.slice(0, 120)};
  }
}

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/** Emoji in a soft badge — works even when vector icon fonts are not linked (no “?” placeholders). */
function Glyph({emoji, tint = '#ecfdf5'}) {
  return (
    <View style={[styles.glyphBadge, {backgroundColor: tint}]}>
      <Text style={styles.glyphEmoji} accessibilityLabel="">
        {emoji}
      </Text>
    </View>
  );
}

export default function PostRideScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [vehicleType, setVehicleType] = useState('car');
  const [riderId, setRiderId] = useState('');
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [estimate, setEstimate] = useState(null);
  const [errorBanner, setErrorBanner] = useState('');
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  const loadRiderId = useCallback(async () => {
    try {
      const id = await AsyncStorage.getItem('riderId');
      if (id) setRiderId(id);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  useEffect(() => {
    loadRiderId();
  }, [loadRiderId]);

  const clearError = () => setErrorBanner('');
  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = selectedDate => {
    const currentDate = new Date();
    if (selectedDate.getTime() < currentDate.getTime()) {
      Alert.alert('Invalid time', 'Please pick a future date and time.', [
        {text: 'OK', onPress: () => setDatePickerVisibility(true)},
      ]);
      return;
    }
    setSelectedDateTime(selectedDate);
    hideDatePicker();
  };

  const handleCalculateFare = async () => {
    clearError();
    setEstimate(null);
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert('Missing places', 'Enter pickup and destination.');
      return;
    }
    if (!selectedDateTime) {
      Alert.alert('Schedule ride', 'Choose date & time for your ride.');
      return;
    }
    if (selectedDateTime.getTime() < Date.now()) {
      Alert.alert('Invalid time', 'Selected time cannot be in the past.');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/fare-estimate`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          pickup: pickup.trim(),
          destination: destination.trim(),
          vehicleType,
        }),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        setErrorBanner(data.message || `Estimate failed (${res.status})`);
        return;
      }
      setEstimate({
        ...data,
        pickupLabel: pickup.trim(),
        destinationLabel: destination.trim(),
      });
      setBreakdownOpen(true);
    } catch (e) {
      setErrorBanner(
        e.message ||
          `Cannot reach API. Check backend is running and API_BASE_URL in .env (${BASE_URL}).`,
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePostRide = async () => {
    clearError();
    if (!riderId || !mongooseLikeId(riderId)) {
      Alert.alert(
        'Profile required',
        'Save your rider profile first so we have a valid rider ID.',
      );
      return;
    }
    if (!estimate || !selectedDateTime) {
      Alert.alert('Estimate first', 'Tap “Calculate fare” before posting.');
      return;
    }

    const payload = {
      riderId,
      vehicleType: estimate.vehicleType || vehicleType,
      startLocation: {
        latitude: estimate.pickupCoords.latitude,
        longitude: estimate.pickupCoords.longitude,
      },
      endLocation: {
        latitude: estimate.destCoords.latitude,
        longitude: estimate.destCoords.longitude,
      },
      pickupCoords: estimate.pickupCoords,
      destCoords: estimate.destCoords,
      distance: estimate.distanceKm,
      totalFare: estimate.totalFare,
      commissionFare: estimate.sharegoCommission,
      pickup: estimate.pickupLabel || pickup.trim(),
      dropoff: estimate.destinationLabel || destination.trim(),
      rideDateTime: selectedDateTime.toISOString(),
      booked: false,
      driverId: null,
      driverName: null,
    };

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/riderpost`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });
      const data = await parseJsonResponse(res);
      if (!res.ok) {
        setErrorBanner(data.message || `Post failed (${res.status})`);
        return;
      }
      Alert.alert('Posted', data.message || 'Your ride request is live.', [
        {
          text: 'OK',
          onPress: () => {
            setEstimate(null);
            setPickup('');
            setDestination('');
            setSelectedDateTime(null);
          },
        },
      ]);
    } catch (e) {
      setErrorBanner(e.message || 'Network error while posting.');
    } finally {
      setLoading(false);
    }
  };

  const riderIdTail = riderId ? riderId.slice(-10) : '';

  const toggleBreakdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBreakdownOpen(o => !o);
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}>
            <View style={styles.hero}>
              <Text style={styles.heroEyebrow}>Share Go</Text>
              <Text style={styles.heroTitle}>Request a ride</Text>
              <Text style={styles.heroSub}>
                Fair fare from distance, fuel price, and a small platform fee — all calculated securely on the server.
              </Text>
              {riderId ? (
                <View style={styles.idChip}>
                  <Glyph emoji="👤" tint="#d1fae5" />
                  <Text style={styles.idChipText}>Rider · …{riderIdTail}</Text>
                </View>
              ) : (
                <Text style={styles.warn}>Complete rider profile to post rides.</Text>
              )}
            </View>

            {errorBanner ? (
              <View style={styles.bannerErr}>
                <Glyph emoji="⚠️" tint="#fee2e2" />
                <Text style={styles.bannerErrText}>{errorBanner}</Text>
                <TouchableOpacity onPress={clearError} hitSlop={{top: 12, bottom: 12, left: 12, right: 12}}>
                  <Text style={styles.bannerClose}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.card}>
              <View style={styles.cardInnerGlow} />

              <Text style={styles.sectionLabel}>Vehicle</Text>
              <View style={styles.toggleRow}>
                {[
                  {key: 'car', emoji: '🚗', label: 'Car'},
                  {key: 'bike', emoji: '🏍️', label: 'Bike'},
                ].map(({key, emoji, label}) => {
                  const on = vehicleType === key;
                  return (
                    <TouchableOpacity
                      key={key}
                      style={[styles.toggleBtn, on && styles.toggleBtnOn]}
                      onPress={() => {
                        setVehicleType(key);
                        setEstimate(null);
                      }}
                      activeOpacity={0.85}>
                      <Text style={styles.toggleEmoji}>{emoji}</Text>
                      <Text style={[styles.toggleLbl, on && styles.toggleLblOn]}>{label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <Text style={styles.sectionLabel}>Pickup</Text>
              <View style={styles.inputWrap}>
                <Glyph emoji="📍" tint="#d1fae5" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. COMSATS Lahore"
                  placeholderTextColor="#94a3b8"
                  value={pickup}
                  onChangeText={t => {
                    setPickup(t);
                    setEstimate(null);
                  }}
                />
              </View>

              <Text style={styles.sectionLabel}>Destination</Text>
              <View style={styles.inputWrap}>
                <Glyph emoji="🎯" tint="#cffafe" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Ali Town"
                  placeholderTextColor="#94a3b8"
                  value={destination}
                  onChangeText={t => {
                    setDestination(t);
                    setEstimate(null);
                  }}
                />
              </View>

              <Text style={styles.sectionLabel}>When</Text>
              <TouchableOpacity style={styles.dateRow} onPress={showDatePicker} activeOpacity={0.85}>
                <Glyph emoji="🗓️" tint="#fef3c7" />
                <Text style={styles.dateRowText}>
                  {selectedDateTime
                    ? selectedDateTime.toLocaleString(undefined, {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })
                    : 'Tap to choose date & time'}
                </Text>
              </TouchableOpacity>

              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="datetime"
                onConfirm={handleConfirm}
                onCancel={hideDatePicker}
                minimumDate={new Date()}
                minuteInterval={5}
              />

              <TouchableOpacity
                style={[styles.btnTouchable, styles.btnPrimaryWrap, loading && styles.btnDisabled]}
                onPress={handleCalculateFare}
                disabled={loading}
                activeOpacity={0.92}>
                <LinearGradient
                  colors={[COLORS.primaryMid, COLORS.primary, COLORS.primaryDark]}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.btnGradient}>
                  <View style={styles.btnInner}>
                    {loading ? (
                      <ActivityIndicator color="#fff" size="large" />
                    ) : (
                      <>
                        <Text style={styles.btnLeadingEmoji}>📊</Text>
                        <Text style={styles.btnPrimaryText}>Calculate fare</Text>
                      </>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {estimate ? (
                <View style={styles.breakdown}>
                  <TouchableOpacity
                    style={styles.breakdownHeader}
                    onPress={toggleBreakdown}
                    activeOpacity={0.75}
                    accessibilityRole="button"
                    accessibilityState={{expanded: breakdownOpen}}
                    accessibilityLabel={
                      breakdownOpen ? 'Hide fare breakdown' : 'Show fare breakdown'
                    }>
                    <View style={styles.breakdownHeaderText}>
                      <Text style={styles.breakdownTitle}>Fare breakdown</Text>
                      <Text style={styles.breakdownSub}>Transparent pricing for your trip</Text>
                    </View>
                    <Text style={styles.breakdownChevron} accessibilityLabel="">
                      {breakdownOpen ? '▼' : '▶'}
                    </Text>
                  </TouchableOpacity>

                  {breakdownOpen ? (
                    <View style={styles.breakdownRows}>
                      <BreakRow label="Distance" value={`${estimate.distanceKm} km`} hint={distanceHint(estimate)} />
                      <BreakRow label="Base fare" value={`Rs. ${estimate.baseFare}`} />
                      <BreakRow
                        label="Fuel share"
                        value={`Rs. ${estimate.fuelCost}`}
                        hint={`~${estimate.fuelLiters} L @ Rs. ${estimate.fuelPricePerLiter}/L`}
                      />
                      <BreakRow label="Subtotal" value={`Rs. ${estimate.subtotal}`} />
                      <BreakRow label="ShareGo (10%)" value={`Rs. ${estimate.sharegoCommission}`} />
                    </View>
                  ) : null}

                  <LinearGradient
                    colors={['#059669', '#047857', '#065f46']}
                    style={styles.totalCapsule}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 1}}>
                    <Text style={styles.totalCapsuleLabel}>You pay</Text>
                    <Text style={styles.totalCapsuleHint}>Total estimated fare</Text>
                    <Text style={styles.totalCapsuleValue}>
                      Rs. {estimate.totalFare}
                    </Text>
                  </LinearGradient>
                </View>
              ) : null}

              <TouchableOpacity
                style={[
                  styles.btnTouchable,
                  estimate ? styles.btnTouchableSpaced : null,
                  (!estimate || !selectedDateTime || loading) && styles.btnDisabled,
                ]}
                onPress={handlePostRide}
                disabled={!estimate || !selectedDateTime || loading}
                activeOpacity={0.92}>
                <LinearGradient
                  colors={['#047857', '#065f46']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 1}}
                  style={styles.btnGradient}>
                  <View style={styles.btnInner}>
                    <Text style={styles.btnLeadingEmoji}>📤</Text>
                    <Text style={styles.btnSecondaryText}>Post ride request</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

function BreakRow({label, value, hint}) {
  return (
    <View style={styles.breakRow}>
      <View style={{flex: 1, paddingRight: 12}}>
        <Text style={styles.rowLabel}>{label}</Text>
        {hint ? <Text style={styles.rowHint}>{hint}</Text> : null}
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function distanceHint(e) {
  if (e.distanceMethod === 'openrouteservice') return 'Road route';
  return 'Approx. road distance';
}

function mongooseLikeId(s) {
  return /^[a-f\d]{24}$/i.test(String(s || '').trim());
}

const styles = StyleSheet.create({
  gradient: {flex: 1},
  safe: {flex: 1, backgroundColor: 'transparent'},
  flex: {flex: 1},
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },
  hero: {
    marginTop: 4,
    marginBottom: 20,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
    opacity: 0.9,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  heroSub: {
    marginTop: 10,
    fontSize: 15,
    color: COLORS.muted,
    lineHeight: 22,
    maxWidth: 340,
  },
  glyphBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glyphEmoji: {
    fontSize: 20,
  },
  idChip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    paddingLeft: 10,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
    gap: 10,
  },
  idChipText: {fontSize: 13, fontWeight: '700', color: COLORS.primaryDark},
  warn: {marginTop: 12, color: '#b45309', fontWeight: '700', fontSize: 14},
  bannerErr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#991b1b',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  bannerErrText: {flex: 1, color: '#991b1b', fontSize: 14, lineHeight: 20},
  bannerClose: {
    fontSize: 18,
    color: COLORS.muted,
    fontWeight: '600',
    paddingHorizontal: 6,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 24,
    padding: 22,
    paddingTop: 24,
    paddingBottom: 26,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.1,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 8,
    overflow: 'hidden',
  },
  cardInnerGlow: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  toggleRow: {flexDirection: 'row', gap: 12, marginBottom: 6},
  toggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: COLORS.rowTint,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  toggleBtnOn: {
    backgroundColor: '#ecfdf5',
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  toggleEmoji: {fontSize: 22},
  toggleLbl: {fontSize: 16, fontWeight: '800', color: COLORS.text},
  toggleLblOn: {color: COLORS.primaryDark},
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 4,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: COLORS.inputBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  dateRowText: {flex: 1, fontSize: 16, color: COLORS.text, fontWeight: '600'},
  btnTouchable: {
    alignSelf: 'stretch',
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 4,
    shadowColor: COLORS.primaryDark,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: {width: 0, height: 8},
    elevation: 6,
  },
  btnPrimaryWrap: {
    marginBottom: 16,
  },
  btnTouchableSpaced: {
    marginTop: 18,
  },
  btnGradient: {
    width: '100%',
    minHeight: 80,
  },
  btnInner: {
    width: '100%',
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 22,
    paddingHorizontal: 22,
    gap: 12,
  },
  btnLeadingEmoji: {fontSize: 22, lineHeight: 28},
  btnDisabled: {opacity: 0.42},
  btnPrimaryText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.4,
    flexShrink: 0,
  },
  btnSecondaryText: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: 0.35,
    flexShrink: 0,
  },
  breakdown: {
    marginTop: 8,
    paddingTop: 22,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.border,
  },
  breakdownHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginBottom: 4,
  },
  breakdownHeaderText: {
    flex: 1,
    paddingRight: 12,
  },
  breakdownChevron: {
    fontSize: 16,
    color: COLORS.primaryDark,
    fontWeight: '800',
    minWidth: 28,
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  breakdownRows: {
    marginTop: 8,
    marginBottom: 2,
  },
  breakdownTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.3,
  },
  breakdownSub: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 4,
    marginBottom: 0,
  },
  breakRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    backgroundColor: COLORS.rowTint,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  rowLabel: {fontSize: 14, color: COLORS.muted, fontWeight: '700'},
  rowHint: {fontSize: 12, color: '#94a3b8', marginTop: 4, lineHeight: 16},
  rowValue: {fontSize: 15, fontWeight: '800', color: COLORS.text},
  totalCapsule: {
    marginTop: 18,
    paddingVertical: 26,
    paddingHorizontal: 22,
    paddingBottom: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'stretch',
    minHeight: 140,
    shadowColor: '#065f46',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
    elevation: 6,
  },
  totalCapsuleLabel: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ecfdf5',
    letterSpacing: -0.3,
  },
  totalCapsuleHint: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    marginTop: 4,
    marginBottom: 14,
  },
  totalCapsuleValue: {
    fontSize: 40,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -1,
    lineHeight: 50,
    textAlign: 'center',
    width: '100%',
    flexShrink: 0,
    paddingTop: 4,
    paddingBottom: 30,
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.15)',
    textShadowOffset: {width: 0, height: 1},
    textShadowRadius: 2,
  },
});
