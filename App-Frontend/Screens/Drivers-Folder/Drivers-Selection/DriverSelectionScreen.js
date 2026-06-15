import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const COLORS = {
  gradient: ['#ecfdf5', '#d1fae5', '#a7f3d0'],
  primary: '#059669',
  primaryDark: '#047857',
  text: '#0f172a',
  muted: '#64748b',
  cardBg: '#ffffff',
  cardBorder: 'rgba(15, 23, 42, 0.08)',
};

const CTA_GRADIENT = ['#34d399', '#059669', '#047857'];

const VEHICLES = [
  {
    id: 'Bike',
    label: 'Bike',
    icon: 'bike',
    hint: 'Two-wheeler rides',
  },
  {
    id: 'Car',
    label: 'Car',
    icon: 'car',
    hint: 'Four-wheeler rides',
  },
];

const DriverSelectionScreen = ({navigation}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleNext = () => {
    if (selectedVehicle === 'Bike') {
      navigation.navigate('Bike_Screen');
    } else if (selectedVehicle === 'Car') {
      navigation.navigate('Car_Screen');
    } else {
      Alert.alert('Select vehicle', 'Please choose Bike or Car to continue.');
    }
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <Image
              source={require('../../../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.headline}>Select your vehicle</Text>
          <Text style={styles.subtitle}>
            How will you share rides on Share Go?
          </Text>

          <View style={styles.cardsRow}>
            {VEHICLES.map(item => {
              const active = selectedVehicle === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => setSelectedVehicle(item.id)}
                  style={[
                    styles.card,
                    active && styles.cardActive,
                  ]}>
                  <View
                    style={[
                      styles.iconCircle,
                      active && styles.iconCircleActive,
                    ]}>
                    <Icon
                      name={item.icon}
                      size={42}
                      color={active ? '#fff' : COLORS.primary}
                    />
                  </View>
                  <Text style={[styles.cardLabel, active && styles.cardLabelActive]}>
                    {item.label}
                  </Text>
                  <Text style={styles.cardHint}>{item.hint}</Text>
                  {active && (
                    <View style={styles.checkBadge}>
                      <Icon name="check" size={14} color="#fff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleNext}
            style={styles.ctaOuter}>
            <LinearGradient
              colors={CTA_GRADIENT}
              start={{x: 0, y: 0.5}}
              end={{x: 1, y: 0.5}}
              style={styles.ctaGradient}>
              <Text style={styles.ctaText}>Continue</Text>
              <Icon name="arrow-right" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.footerNote}>
            You can update vehicle details later in your profile.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === 'android' ? 12 : 0,
    paddingBottom: 28,
    alignItems: 'center',
  },
  logoWrap: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 24,
    shadowColor: '#047857',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  logo: {
    width: 110,
    height: 110,
  },
  headline: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  cardsRow: {
    flexDirection: 'row',
    gap: 14,
    width: '100%',
    marginBottom: 32,
  },
  card: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    position: 'relative',
    shadowColor: '#0f172a',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0fdf4',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gradient[0],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  iconCircleActive: {
    backgroundColor: COLORS.primary,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardLabelActive: {
    color: COLORS.primaryDark,
  },
  cardHint: {
    fontSize: 12,
    color: COLORS.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaOuter: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#047857',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  footerNote: {
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});

export default DriverSelectionScreen;
