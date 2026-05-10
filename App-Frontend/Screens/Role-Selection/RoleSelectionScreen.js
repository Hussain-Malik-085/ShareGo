import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  StatusBar,
  ScrollView,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 14;
const H_PADDING = 22;
const CARD_W = (SCREEN_W - H_PADDING * 2 - CARD_GAP) / 2;

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

const RoleSelectionScreen = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const arrowShift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(arrowShift, {
          toValue: 8,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(arrowShift, {
          toValue: 0,
          duration: 550,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [arrowShift]);

  const handleRoleSelect = async (role) => {
    try {
      await AsyncStorage.setItem('userRole', role);
      setSelectedRole(role);
    } catch (error) {
      console.error('Error saving user role:', error);
    }
  };

  const handleCreateProfile = async () => {
    if (selectedRole === 'Driver') {
      navigation.navigate('Driver');
      return;
    }
    if (selectedRole === 'Rider') {
      try {
        const complete = await AsyncStorage.getItem('riderProfileComplete');
        const id = await AsyncStorage.getItem('riderId');
        if (complete === 'true' && id) {
          navigation.replace('Rider_HomeScreen');
          return;
        }
      } catch (_) {
        /* ignore */
      }
      navigation.navigate('Rider');
      return;
    }
    Alert.alert('Choose a role', 'Please select Driver or Rider to continue.');
  };

  const RoleCard = ({ role, label, imageSource }) => {
    const selected = selectedRole === role;
    return (
      <TouchableOpacity
        style={[styles.roleCard, selected && styles.roleCardSelected]}
        onPress={() => handleRoleSelect(role)}
        activeOpacity={0.88}
        accessibilityRole="button"
        accessibilityState={{ selected }}
        accessibilityLabel={`${label} role`}>
        <View style={[styles.imageWrap, selected && styles.imageWrapSelected]}>
          <Image source={imageSource} style={styles.roleImage} resizeMode="contain" />
        </View>
        <Text style={[styles.roleLabel, selected && styles.roleLabelSelected]}>{label}</Text>
        <Text style={styles.roleHint}>{role === 'Driver' ? 'Offer rides' : 'Book rides'}</Text>
        {selected ? (
          <View style={styles.checkBadge}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.logoWrap}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          </View>

          <Text style={styles.headline}>Select your role</Text>
          <Text style={styles.subtitle}>How would you like to use Share Go?</Text>

          <View style={styles.cardsRow}>
            <RoleCard role="Driver" label="Driver" imageSource={require('../../assets/driver.png')} />
            <RoleCard role="Rider" label="Rider" imageSource={require('../../assets/rider.png')} />
          </View>

          <View style={styles.ctaOuter}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCreateProfile}
              style={styles.ctaInnerTouchable}>
              <LinearGradient
                colors={CTA_GRADIENT}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.ctaGradient}>
                <View style={styles.ctaRow}>
                  <Text style={styles.ctaText}>Continue</Text>
                  <Animated.Text
                    style={[styles.ctaArrow, { transform: [{ translateX: arrowShift }] }]}>
                    →
                  </Animated.Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <Text style={styles.footerNote}>You can update preferences later in settings.</Text>
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
    paddingHorizontal: H_PADDING,
    paddingBottom: 28,
    alignItems: 'center',
  },
  logoWrap: {
    marginTop: 8,
    marginBottom: 8,
  },
  logo: {
    width: Math.min(140, SCREEN_W * 0.36),
    height: Math.min(140, SCREEN_W * 0.36),
  },
  headline: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginTop: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.muted,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 28,
    paddingHorizontal: 12,
    lineHeight: 22,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'stretch',
    gap: CARD_GAP,
    width: '100%',
    maxWidth: 440,
  },
  roleCard: {
    width: CARD_W,
    backgroundColor: COLORS.cardBg,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.cardBorder,
    shadowColor: '#0f172a',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
    position: 'relative',
  },
  roleCardSelected: {
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.18,
    backgroundColor: '#f0fdf4',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapSelected: {
    backgroundColor: '#ecfdf5',
  },
  roleImage: {
    width: '92%',
    height: '92%',
  },
  roleLabel: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  roleLabelSelected: {
    color: COLORS.primaryDark,
  },
  roleHint: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.muted,
  },
  checkBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  checkMark: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  ctaOuter: {
    marginTop: 36,
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
    borderRadius: 18,
    backgroundColor: 'transparent',
    ...Platform.select({
      ios: {
        shadowColor: '#047857',
        shadowOpacity: 0.35,
        shadowRadius: 16,
        shadowOffset: { width: 0, height: 8 },
      },
      android: {
        elevation: 6,
      },
    }),
  },
  ctaInnerTouchable: {
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  ctaGradient: {
    width: '100%',
    paddingVertical: 17,
    paddingHorizontal: 28,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
    backgroundColor: 'transparent',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  ctaArrow: {
    marginLeft: 12,
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    backgroundColor: 'transparent',
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : {}),
  },
  footerNote: {
    marginTop: 20,
    fontSize: 13,
    color: COLORS.muted,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default RoleSelectionScreen;
