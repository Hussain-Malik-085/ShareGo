/* eslint-disable quotes */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-unused-vars */
/* eslint-disable curly */
/* eslint-disable no-trailing-spaces */
// screens/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../config/supabaseClient';
import { formatAuthError } from '../../utils/authErrors';
import { tryNavigateExistingRider, resolveInitialRoute } from '../../utils/sessionRouting';

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_MAX = Math.min(152, SCREEN_W * 0.4);

const COLORS = {
  gradient: ['#ecfdf5', '#d1fae5', '#a7f3d0'],
  primary: '#059669',
  primaryPressed: '#047857',
  text: '#0f172a',
  textMuted: '#64748b',
  inputBg: '#f8fafc',
  inputBorder: '#e2e8f0',
  cardBg: '#ffffff',
  error: '#dc2626',
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const route = await resolveInitialRoute();
        if (cancelled) return;
        if (route !== 'Login') {
          navigation.replace(route);
        }
      } catch (_) {
        /* show login form */
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigation]);

  const handleLogin = async () => {
    setLoginError('');
    let valid = true;
    if (!email) {
      setEmailError(true);
      valid = false;
    } else {
      setEmailError(false);
    }
    if (!password) {
      setPasswordError(true);
      valid = false;
    } else {
      setPasswordError(false);
    }
    if (!valid) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setLoginError(formatAuthError(error));
      } else {
        setLoginError('');
        const onboarded = await tryNavigateExistingRider(email, navigation);
        if (!onboarded) {
          navigation.replace('RoleSelection');
        }
      }
    } catch (err) {
      setLoginError(formatAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <LinearGradient colors={COLORS.gradient} style={styles.gradient}>
        <View style={[styles.flex, styles.sessionLoader]}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <View style={styles.logoRing}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.tagline}>Share the ride, save the cost</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Share Go</Text>

            {loginError !== '' ? <Text style={styles.bannerError}>{loginError}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, emailError && styles.inputError]}
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (text) {
                  setEmailError(false);
                  setLoginError('');
                }
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {emailError ? <Text style={styles.fieldError}>Email is required</Text> : null}

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="••••••••"
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, passwordError && styles.inputError]}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text) {
                  setPasswordError(false);
                  setLoginError('');
                }
              }}
              secureTextEntry
            />
            {passwordError ? <Text style={styles.fieldError}>Password is required</Text> : null}

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Log in</Text>
              )}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
                <Text style={styles.footerLink}>Sign up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  sessionLoader: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoRing: {
    width: LOGO_MAX + 28,
    height: LOGO_MAX + 28,
    borderRadius: (LOGO_MAX + 28) / 2,
    backgroundColor: 'rgba(255,255,255,0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.15)',
    shadowColor: '#059669',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  logo: {
    width: LOGO_MAX,
    height: LOGO_MAX,
  },
  tagline: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primaryPressed,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.06)',
    shadowColor: '#0f172a',
    shadowOpacity: 0.07,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 15,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  bannerError: {
    backgroundColor: '#fef2f2',
    color: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginLeft: 2,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 6,
    fontSize: 16,
    backgroundColor: COLORS.inputBg,
    color: COLORS.text,
  },
  inputError: {
    borderColor: COLORS.error,
    backgroundColor: '#fff7f7',
  },
  fieldError: {
    color: COLORS.error,
    marginBottom: 12,
    marginLeft: 4,
    fontSize: 13,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 8,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.85,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  footerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  footerMuted: {
    fontSize: 15,
    color: COLORS.textMuted,
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.primary,
  },
});
