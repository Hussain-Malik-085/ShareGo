import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { supabase } from '../../config/supabaseClient';
import { formatAuthError } from '../../utils/authErrors';

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
  success: '#047857',
};

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  const handleSignup = async () => {
    setErrors({});
    setSuccessMessage('');

    let newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters long';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signUp({ email, password });

      if (authError) {
        const msg = formatAuthError(authError);
        if (/already registered|already been registered|User already exists/i.test(msg)) {
          setErrors({ email: 'This email is already registered.' });
        } else {
          setErrors({ general: msg });
        }
        setLoading(false);
        return;
      }

      const { error: profileError } = await supabase.from('profiles').upsert(
        { email: email.trim(), created_at: new Date().toISOString() },
        { onConflict: 'email' },
      );

      if (profileError) {
        const msg = profileError.message || '';
        const hint =
          profileError.code === '42P01' ||
          profileError.code === 'PGRST205' ||
          /relation|does not exist|schema cache|permission denied|RLS/i.test(msg)
            ? ' Open Supabase → SQL Editor and run: docs/SUPABASE-profiles.sql (from your FYP folder).'
            : '';
        setErrors({
          general: (msg || 'Could not save profile.') + hint,
        });
        setLoading(false);
        return;
      }

      setSuccessMessage('Check your email for verification.');
    } catch (err) {
      setErrors({ general: formatAuthError(err) });
    }

    setLoading(false);
  };

  return (
    <LinearGradient colors={COLORS.gradient} style={styles.gradient}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}>
          <View style={styles.hero}>
            <View style={styles.logoRing}>
              <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>
            <Text style={styles.tagline}>Share the ride, save the cost</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Join Share Go in a few seconds</Text>

            {successMessage ? <Text style={styles.bannerSuccess}>{successMessage}</Text> : null}

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="you@example.com"
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, errors.email && styles.inputError]}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}

            <Text style={styles.label}>Password</Text>
            <TextInput
              placeholder="At least 8 characters"
              placeholderTextColor={COLORS.textMuted}
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            {errors.password ? <Text style={styles.fieldError}>{errors.password}</Text> : null}
            {errors.general ? <Text style={styles.bannerError}>{errors.general}</Text> : null}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text style={styles.footerMuted}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} hitSlop={{ top: 12, bottom: 12, left: 8, right: 8 }}>
                <Text style={styles.footerLink}>Log in</Text>
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
  bannerSuccess: {
    backgroundColor: '#ecfdf5',
    color: COLORS.success,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '600',
    overflow: 'hidden',
  },
  bannerError: {
    backgroundColor: '#fef2f2',
    color: COLORS.error,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
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
